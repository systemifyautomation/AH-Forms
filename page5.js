// Page 5 - Wedding Cake and Favours JavaScript
const STORAGE_KEY = 'amington-hall-form-data';

document.addEventListener('DOMContentLoaded', function() {
    loadSavedData();
    setupEventListeners();
    setupCakeToggle();
    setupFavoursToggle();
});

function setupCakeToggle() {
    const cakeRadios = document.querySelectorAll('input[name="wedding-cake"]');
    const cakeDetailsSection = document.getElementById('cake-details-section');
    
    cakeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'Yes') {
                cakeDetailsSection.style.display = 'block';
            } else {
                cakeDetailsSection.style.display = 'none';
                // Clear cake details
                document.getElementById('cake-company-name').value = '';
                document.getElementById('cake-tiers').value = '';
                document.getElementById('cake-contact-name').value = '';
                document.getElementById('cake-contact-number').value = '';
                document.getElementById('cake-contact-number-prefix').value = '+44';
            }
        });
    });
}

function setupFavoursToggle() {
    const favoursRadios = document.querySelectorAll('input[name="favours"]');
    const favoursDetailsSection = document.getElementById('favours-details-section');
    
    favoursRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'Yes') {
                favoursDetailsSection.style.display = 'block';
            } else {
                favoursDetailsSection.style.display = 'none';
                // Clear favours details
                document.getElementById('favours-number').value = '';
                document.getElementById('favours-type').value = '';
            }
        });
    });
}

function setupEventListeners() {
    const form = document.getElementById('page5-form');
    const prevBtn = document.getElementById('prev-btn');
    const saveBtn = document.getElementById('save-btn');
    const restartBtn = document.getElementById('restart-btn');

    // Form submission (Next button)
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const validation = validatePage();
        if (validation === true) {
            saveFormData();
            window.location.href = 'page6-old.html';
        } else {
            showNotification(validation || 'Please fill in all required fields correctly.', 'error');
        }
    });

    // Previous button
    prevBtn.addEventListener('click', function() {
        saveFormData();
        window.location.href = 'page5-new.html';
    });

    // Save Progress button
    saveBtn.addEventListener('click', function() {
        saveFormData();
        showNotification('Progress saved successfully!', 'success');
    });

    // Restart Form button
    restartBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to restart? All your progress will be lost.')) {
            localStorage.removeItem(STORAGE_KEY);
            window.location.href = 'page1.html';
        }
    });
}

function validatePage() {
    console.log('=== Starting Page 5 Validation ===');
    
    // Check wedding cake radio
    const weddingCakeRadio = document.querySelector('input[name="wedding-cake"]:checked');
    if (!weddingCakeRadio) {
        console.log('Wedding cake question not answered');
        return 'Please indicate if you will be having a wedding cake.';
    }
    
    console.log('=== Page 5 Validation Passed ===');
    return true;
}

function saveFormData() {
    const formData = getStoredData() || {};
    
    // Save text, number, tel, email inputs
    document.querySelectorAll('input[type="text"], input[type="tel"], input[type="number"], input[type="email"], textarea').forEach(input => {
        if (input.value) {
            formData[input.name || input.id] = input.value;
        }
    });
    
    // Save radio buttons
    document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
        formData[radio.name] = radio.value;
    });
    
    // Save timestamp
    formData.lastSaved = new Date().toISOString();
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    console.log('Form data saved:', formData);
}

function loadSavedData() {
    const savedData = getStoredData();
    if (!savedData) {
        console.log('No saved data found');
        return;
    }
    
    console.log('Loading saved data:', savedData);
    
    // Load all inputs
    Object.keys(savedData).forEach(key => {
        const element = document.getElementById(key);
        if (element && element.type !== 'radio') {
            element.value = savedData[key];
        }
    });
    
    // Load radio buttons
    Object.keys(savedData).forEach(key => {
        const radio = document.querySelector(`input[name="${key}"][value="${savedData[key]}"]`);
        if (radio) {
            radio.checked = true;
            // Trigger change event for toggles
            radio.dispatchEvent(new Event('change'));
        }
    });
}

function getStoredData() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}
