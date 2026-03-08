// Page 10 - Catering JavaScript
const STORAGE_KEY = 'amington-hall-form-data';

// Load endpoints from JSON file
let APPSCRIPT_ENDPOINTS = [];

// Load endpoints on page load
async function loadAppScriptEndpoints() {
    try {
        const response = await fetch('appscript-endpoints.json');
        const config = await response.json();
        APPSCRIPT_ENDPOINTS = config.endpoints || [];
        console.log('Loaded App Script endpoints:', APPSCRIPT_ENDPOINTS);
    } catch (error) {
        console.error('Error loading App Script endpoints:', error);
        // Fallback to empty array - will show error on submission
        APPSCRIPT_ENDPOINTS = [];
    }
}

let isSubmitting = false;
let isNavigating = false;

document.addEventListener('DOMContentLoaded', function() {
    loadAppScriptEndpoints();
    loadSavedData();
    setupEventListeners();
    setupConditionalToggles();
    setupExitWarnings();
    setupModalListeners();
});

function setupConditionalToggles() {
    // Drinks Third Party toggle
    const drinksProviderRadios = document.querySelectorAll('input[name="drinks-provider"]');
    const drinksThirdPartyDetails = document.getElementById('drinks-third-party-details');
    
    drinksProviderRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'Third Party Company') {
                drinksThirdPartyDetails.style.display = 'block';
            } else {
                drinksThirdPartyDetails.style.display = 'none';
                document.getElementById('drinks-third-party-name').value = '';
                document.getElementById('drinks-third-party-contact').value = '';
                document.getElementById('drinks-third-party-contact-prefix').value = '+44';
            }
        });
    });

    // Reception Drinks toggle
    const receptionDrinksRadios = document.querySelectorAll('input[name="reception-drinks"]');
    const receptionDrinksDetails = document.getElementById('reception-drinks-details');
    
    receptionDrinksRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'Yes') {
                receptionDrinksDetails.style.display = 'block';
            } else {
                receptionDrinksDetails.style.display = 'none';
                document.querySelectorAll('input[name="reception-drinks-supplier"]').forEach(r => r.checked = false);
            }
        });
    });

    // Hot Drinks Third Party toggle
    const hotDrinksSupplierRadios = document.querySelectorAll('input[name="hot-drinks-supplier"]');
    const hotDrinksThirdPartyDetails = document.getElementById('hot-drinks-third-party-details');
    
    hotDrinksSupplierRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'Third Party Company') {
                hotDrinksThirdPartyDetails.style.display = 'block';
            } else {
                hotDrinksThirdPartyDetails.style.display = 'none';
                document.getElementById('hot-drinks-contact-name').value = '';
                document.getElementById('hot-drinks-contact-number').value = '';
                document.getElementById('hot-drinks-contact-number-prefix').value = '+44';
            }
        });
    });
}

function setupEventListeners() {
    const form = document.getElementById('page10-form');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const saveBtn = document.getElementById('save-btn');
    const restartBtn = document.getElementById('restart-btn');

    // Next button
    nextBtn.addEventListener('click', function() {
        const validation = validatePage();
        if (validation === true) {
            saveFormData();
            isNavigating = true;
            window.location.href = 'page11.html';
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showNotification(validation, 'error');
        }
    });

    // Previous button
    prevBtn.addEventListener('click', function() {
        saveFormData();
        isNavigating = true;
        window.location.href = 'page9.html';
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
    console.log('=== Starting Page 10 Validation ===');
    
    // Check required radio groups
    const requiredFields = [
        { name: 'leftover-food-drinks', label: 'Who is taking the leftover Food & Drinks' },
        { name: 'leftover-containers', label: 'Who will provide the Containers for leftover food' },
        { name: 'drinks-provider', label: 'Who will be providing the drinks' },
        { name: 'reception-drinks', label: 'Will you be having reception drinks' }
    ];
    
    for (const field of requiredFields) {
        const selected = document.querySelector(`input[name="${field.name}"]:checked`);
        if (!selected) {
            return `Please select an option for: ${field.label}`;
        }
    }

    // Check conditional required fields
    const receptionDrinks = document.querySelector('input[name="reception-drinks"]:checked');
    if (receptionDrinks && receptionDrinks.value === 'Yes') {
        const supplier = document.querySelector('input[name="reception-drinks-supplier"]:checked');
        if (!supplier) {
            return 'Please select who is your reception drinks supplier';
        }
    }
    
    console.log('Page 10 validation passed');
    return true;
}

function saveFormData() {
    console.log('Saving Page 10 data...');
    
    const formData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    
    // Save text inputs
    formData['catering-company-name'] = document.getElementById('catering-company-name').value;
    formData['catering-contact-name'] = document.getElementById('catering-contact-name').value;

    // Save radio selections
    const radioGroups = [
        'company-worked-before',
        'leftover-food-drinks',
        'leftover-containers',
        'drinks-provider',
        'reception-drinks',
        'reception-drinks-supplier',
        'hot-drinks-supplier'
    ];

    radioGroups.forEach(name => {
        const selected = document.querySelector(`input[name="${name}"]:checked`);
        if (selected) {
            formData[name] = selected.value;
        }
    });

    // Save drinks third party details
    formData['drinks-third-party-name'] = document.getElementById('drinks-third-party-name').value;
    formData['drinks-third-party-contact'] = document.getElementById('drinks-third-party-contact').value;
    formData['drinks-third-party-contact-prefix'] = document.getElementById('drinks-third-party-contact-prefix').value;

    // Save hot drinks third party details
    formData['hot-drinks-contact-name'] = document.getElementById('hot-drinks-contact-name').value;
    formData['hot-drinks-contact-number'] = document.getElementById('hot-drinks-contact-number').value;
    formData['hot-drinks-contact-number-prefix'] = document.getElementById('hot-drinks-contact-number-prefix').value;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    console.log('Page 10 data saved:', formData);
}

function loadSavedData() {
    console.log('Loading saved data for Page 10...');
    
    const formData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    
    // Load text inputs
    if (formData['catering-company-name']) {
        document.getElementById('catering-company-name').value = formData['catering-company-name'];
    }
    if (formData['catering-contact-name']) {
        document.getElementById('catering-contact-name').value = formData['catering-contact-name'];
    }

    // Load radio selections
    const radioGroups = [
        'company-worked-before',
        'leftover-food-drinks',
        'leftover-containers',
        'drinks-provider',
        'reception-drinks',
        'reception-drinks-supplier',
        'hot-drinks-supplier'
    ];

    radioGroups.forEach(name => {
        if (formData[name]) {
            const radio = document.querySelector(`input[name="${name}"][value="${formData[name]}"]`);
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change'));
            }
        }
    });

    // Load drinks third party details
    if (formData['drinks-third-party-name']) {
        document.getElementById('drinks-third-party-name').value = formData['drinks-third-party-name'];
    }
    if (formData['drinks-third-party-contact']) {
        document.getElementById('drinks-third-party-contact').value = formData['drinks-third-party-contact'];
    }
    if (formData['drinks-third-party-contact-prefix']) {
        document.getElementById('drinks-third-party-contact-prefix').value = formData['drinks-third-party-contact-prefix'];
    }

    // Load hot drinks third party details
    if (formData['hot-drinks-contact-name']) {
        document.getElementById('hot-drinks-contact-name').value = formData['hot-drinks-contact-name'];
    }
    if (formData['hot-drinks-contact-number']) {
        document.getElementById('hot-drinks-contact-number').value = formData['hot-drinks-contact-number'];
    }
    if (formData['hot-drinks-contact-number-prefix']) {
        document.getElementById('hot-drinks-contact-number-prefix').value = formData['hot-drinks-contact-number-prefix'];
    }

    console.log('Page 10 data loaded');
}

async function handleFormSubmit() {
    if (isSubmitting) {
        console.log('Already submitting, ignoring duplicate submission');
        return;
    }

    isSubmitting = true;
    saveFormData();
    
    const formData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    
    if (APPSCRIPT_ENDPOINTS.length === 0) {
        showNotification('Error: No submission endpoints configured. Please contact support.', 'error');
        isSubmitting = false;
        return;
    }

    console.log('Submitting to endpoints:', APPSCRIPT_ENDPOINTS);
    
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
        const submissionPromises = APPSCRIPT_ENDPOINTS.map(endpoint => 
            fetch(endpoint, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
        );

        await Promise.all(submissionPromises);
        
        console.log('Form submitted successfully to all endpoints');
        
        localStorage.removeItem(STORAGE_KEY);
        
        const successModal = document.getElementById('success-modal');
        successModal.style.display = 'flex';
        
    } catch (error) {
        console.error('Error submitting form:', error);
        showNotification('There was an error submitting the form. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Form';
        isSubmitting = false;
    }
}

function setupExitWarnings() {
    let isExiting = false;

    window.addEventListener('beforeunload', function(e) {
        const formData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        
        if (Object.keys(formData).length > 0 && !isExiting && !isSubmitting && !isNavigating) {
            e.preventDefault();
            e.returnValue = '';
            return '';
        }
    });

    const links = document.querySelectorAll('a:not([href^="#"])');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const formData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            
            if (Object.keys(formData).length > 0 && !isExiting) {
                e.preventDefault();
                const exitModal = document.getElementById('exit-modal');
                exitModal.style.display = 'flex';
            }
        });
    });
}

function setupModalListeners() {
    const exitModal = document.getElementById('exit-modal');
    const successModal = document.getElementById('success-modal');
    const saveAndExitBtn = document.getElementById('save-and-exit');
    const exitWithoutSavingBtn = document.getElementById('exit-without-saving');
    const continueFormBtn = document.getElementById('continue-form');
    const successOkBtn = document.getElementById('success-ok-btn');

    saveAndExitBtn.addEventListener('click', function() {
        saveFormData();
        const phoneInput = document.getElementById('modal-phone');
        const phonePrefix = document.getElementById('modal-phone-prefix');
        
        if (phoneInput.value) {
            const formData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            formData['reminder-phone'] = phonePrefix.value + phoneInput.value;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
        }
        
        window.location.href = 'index.html';
    });

    exitWithoutSavingBtn.addEventListener('click', function() {
        localStorage.removeItem(STORAGE_KEY);
        window.location.href = 'index.html';
    });

    continueFormBtn.addEventListener('click', function() {
        exitModal.style.display = 'none';
    });

    successOkBtn.addEventListener('click', function() {
        successModal.style.display = 'none';
        window.location.href = 'index.html';
    });

    window.addEventListener('click', function(e) {
        if (e.target === exitModal) {
            exitModal.style.display = 'none';
        }
        if (e.target === successModal) {
            successModal.style.display = 'none';
            window.location.href = 'index.html';
        }
    });
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}
