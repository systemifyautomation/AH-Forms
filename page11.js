// Page 11 - Car Parking JavaScript
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
    setupParkingCalculations();
    setupExitWarnings();
    setupModalListeners();
});

function setupParkingCalculations() {
    const section1Input = document.getElementById('priority-parking-section1');
    const section2Input = document.getElementById('priority-parking-section2');
    const totalInput = document.getElementById('total-priority-parking');

    function updateTotal() {
        const section1 = parseInt(section1Input.value) || 0;
        const section2 = parseInt(section2Input.value) || 0;
        const total = section1 + section2;
        totalInput.value = total;

        // Validate total doesn't exceed 30
        if (total > 30) {
            showNotification('Total Priority Parking cannot exceed 30 spaces', 'error');
        }
    }

    section1Input.addEventListener('input', updateTotal);
    section2Input.addEventListener('input', updateTotal);

    // Initial calculation
    updateTotal();
}

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
    
    const vipPasses = parseInt(document.getElementById('vip-parking-passes').value) || 0;
    const section1 = parseInt(document.getElementById('priority-parking-section1').value) || 0;
    const section2 = parseInt(document.getElementById('priority-parking-section2').value) || 0;

    // Validate VIP parking
    if (vipPasses > 6) {
        return 'VIP parking cannot exceed 6 spaces';
    }

    // Validate Priority Section 1
    if (section1 > 14) {
        return 'Priority Parking Section 1 (Venue Level) cannot exceed 14 spaces';
    }

    // Validate Priority Section 2
    if (section2 > 16) {
        return 'Priority Parking Section 2 (Top Level) cannot exceed 16 spaces';
    }

    // Validate total priority parking
    const totalPriority = section1 + section2;
    if (totalPriority > 30) {
        return 'Total Priority Parking cannot exceed 30 spaces';
    }
    
    console.log('Page 11 validation passed');
    return true;
}

function saveFormData() {
    console.log('Saving Page 11 data...');
    
    const formData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    
    // Save parking passes
    formData['vip-parking-passes'] = document.getElementById('vip-parking-passes').value;
    formData['priority-parking-section1'] = document.getElementById('priority-parking-section1').value;
    formData['priority-parking-section2'] = document.getElementById('priority-parking-section2').value;
    formData['total-priority-parking'] = document.getElementById('total-priority-parking').value;
    formData['parking-notes'] = document.getElementById('parking-notes').value;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    console.log('Page 11 data saved:', formData);
}

function loadSavedData() {
    console.log('Loading saved data for Page 11...');
    
    const formData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    
    // Load parking passes
    if (formData['vip-parking-passes']) {
        document.getElementById('vip-parking-passes').value = formData['vip-parking-passes'];
    }
    if (formData['priority-parking-section1']) {
        document.getElementById('priority-parking-section1').value = formData['priority-parking-section1'];
    }
    if (formData['priority-parking-section2']) {
        document.getElementById('priority-parking-section2').value = formData['priority-parking-section2'];
    }
    if (formData['parking-notes']) {
        document.getElementById('parking-notes').value = formData['parking-notes'];
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
