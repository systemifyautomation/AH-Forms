// Page 11 - Car Parking JavaScript
const STORAGE_KEY = 'amington-hall-form-data';

// Load endpoints from JSON file
let APPSCRIPT_ENDPOINTS = ["https://script.google.com/macros/s/AKfycbyCW-wd4u3iYt36PZKjP9sQAqlszyVsZGX1OjyuYWRVJV7vuJfsNgPWo4KfiNOfgxrs/exec"];

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
    setupExitWarnings();
    setupModalListeners();
});


function setupEventListeners() {
    const form = document.getElementById('page11-form');
    const prevBtn = document.getElementById('prev-btn');
    const saveBtn = document.getElementById('save-btn');
    const restartBtn = document.getElementById('restart-btn');

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const validation = validatePage();
        if (validation === true) {
            handleFormSubmit();
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showNotification(validation, 'error');
        }
    });

    // Previous button
    prevBtn.addEventListener('click', function() {
        saveFormData();
        isNavigating = true;
        window.location.href = 'page10.html';
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
    console.log('=== Starting Page 11 Validation ===');
    console.log('Page 11 validation passed');
    return true;
}

function saveFormData() {
    console.log('Saving Page 11 data...');
    const formData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    formData['vip-parking-passes'] = document.getElementById('vip-parking-passes').value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    console.log('Page 11 data saved:', formData);
}

function loadSavedData() {
    console.log('Loading saved data for Page 11...');
    const formData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (formData['vip-parking-passes']) {
        document.getElementById('vip-parking-passes').value = formData['vip-parking-passes'];
    }
    console.log('Page 11 data loaded');
}

async function handleFormSubmit() {
    if (isSubmitting) {
        console.log('Already submitting, ignoring duplicate submission');
        return;
    }

    isSubmitting = true;
    saveFormData();
    
    const fieldData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    
    // Transform field names to question text for API submission
    const submissionData = prepareFormDataForSubmission(fieldData);
    
    console.log('Original form data (field names):', fieldData);
    console.log('Transformed data (question text):', submissionData);
    
    if (APPSCRIPT_ENDPOINTS.length === 0) {
        showNotification('Error: No submission endpoints configured. Please contact support.', 'error');
        isSubmitting = false;
        return;
    }

    console.log('Submitting to endpoints:', APPSCRIPT_ENDPOINTS);
    
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    const TIMEOUT_MS = 30000;

    function fetchWithTimeout(endpoint) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
        return fetch(endpoint, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submissionData),
            signal: controller.signal
        }).finally(() => clearTimeout(timer));
    }

    try {
        let submitted = false;
        for (let i = 0; i < APPSCRIPT_ENDPOINTS.length; i++) {
            try {
                await fetchWithTimeout(APPSCRIPT_ENDPOINTS[i]);
                console.log(`Form submitted successfully via endpoint ${i + 1}`);
                submitted = true;
                break;
            } catch (err) {
                console.warn(`Endpoint ${i + 1} failed, trying next...`, err);
            }
        }

        if (!submitted) {
            throw new Error('All endpoints failed or timed out.');
        }

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
