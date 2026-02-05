// Page 4 - Décor JavaScript
const STORAGE_KEY = 'amington-hall-form-data';

document.addEventListener('DOMContentLoaded', function() {
    loadSavedData();
    setupEventListeners();
    setupThirdPartyDecorToggle();
});

function setupEventListeners() {
    const form = document.getElementById('page4-form');
    const prevBtn = document.getElementById('prev-btn');
    const saveBtn = document.getElementById('save-btn');
    const restartBtn = document.getElementById('restart-btn');

    // Form submission (navigation to next page)
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const validation = validatePage();
        if (validation === true) {
            saveFormData();
            window.location.href = 'page6.html';
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showNotification(validation || 'Please fill in all required fields correctly.', 'error');
        }
    });

    // Previous button
    prevBtn.addEventListener('click', function() {
        saveFormData();
        window.location.href = 'page3.html';
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

function setupThirdPartyDecorToggle() {
    const decorProviderRadios = document.querySelectorAll('input[name="decor-provider"]');
    const thirdPartyDecorDetails = document.getElementById('third-party-decor-details');
    
    decorProviderRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'Third Party') {
                thirdPartyDecorDetails.style.display = 'block';
            } else {
                thirdPartyDecorDetails.style.display = 'none';
                // Clear the fields when hiding
                document.getElementById('decor-company-name').value = '';
                document.getElementById('decor-contact-name').value = '';
                document.getElementById('decor-contact-number').value = '';
                document.getElementById('decor-contact-number-prefix').value = '+44';
                document.getElementById('decor-contact-email').value = '';
            }
        });
    });
}

function validatePage() {
    console.log('=== Starting Page 4 Validation ===');
    
    // Page 4 has no required fields - all fields are optional
    // Validation passes automatically
    
    console.log('=== Page 4 Validation Passed ===');
    return true;
}

function saveFormData() {
    const formData = getStoredData() || {};
    
    // Save all text, number, tel, email inputs (including empty optional fields)
    document.querySelectorAll('input[type="text"], input[type="tel"], input[type="number"], input[type="email"], textarea').forEach(input => {
        formData[input.name || input.id] = input.value || '';
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
            // Trigger change event to show/hide conditional sections
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
