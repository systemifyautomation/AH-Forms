// Page 7 - Visuals & External JavaScript
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

document.addEventListener('DOMContentLoaded', function() {
    loadAppScriptEndpoints(); // Load endpoints first
    loadSavedData();
    setupEventListeners();
    setupToggleSections();
    setupExitWarnings();
    setupModalListeners();
});

function setupToggleSections() {
    // Photographer toggle
    const photographerRadios = document.querySelectorAll('input[name="photographer"]');
    const photographerDetails = document.getElementById('photographer-details');
    
    photographerRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'Yes') {
                photographerDetails.style.display = 'block';
            } else {
                photographerDetails.style.display = 'none';
                clearSection('photographer');
            }
        });
    });

    // Videographer toggle
    const videographerRadios = document.querySelectorAll('input[name="videographer"]');
    const videographerDetails = document.getElementById('videographer-details');
    
    videographerRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'Yes') {
                videographerDetails.style.display = 'block';
            } else {
                videographerDetails.style.display = 'none';
                clearSection('videographer');
            }
        });
    });
}

function clearSection(section) {
    if (section === 'photographer') {
        document.getElementById('photographer-company-name').value = '';
        document.getElementById('photographer-contact-name').value = '';
        document.getElementById('photographer-contact-number').value = '';
        document.getElementById('photographer-contact-number-prefix').value = '+44';
    } else if (section === 'videographer') {
        document.getElementById('videographer-company-name').value = '';
        document.getElementById('videographer-contact-name').value = '';
        document.getElementById('videographer-contact-number').value = '';
        document.getElementById('videographer-contact-number-prefix').value = '+44';
    }
}

function setupEventListeners() {
    const form = document.getElementById('page7-form');
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
            // Scroll to top to see the error
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showNotification(validation, 'error');
        }
    });

    // Previous button
    prevBtn.addEventListener('click', function() {
        saveFormData();
        window.location.href = 'page6.html';
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
    console.log('=== Starting Page 7 Validation ===');
    
    // Check required radio groups with user-friendly labels
    const requiredFields = [
        { name: 'photographer', label: 'Photographer' },
        { name: 'videographer', label: 'Videographer' },
        { name: 'cinematography-equipment', label: 'Cinematography Equipment' },
        { name: 'sound-system', label: 'Sound System' }
    ];
    
    const missingFields = [];
    
    for (const field of requiredFields) {
        const checked = document.querySelector(`input[name="${field.name}"]:checked`);
        if (!checked) {
            console.log(`Required field not answered: ${field.label}`);
            missingFields.push(field.label);
        }
    }
    
    if (missingFields.length > 0) {
        return `Please answer the following required questions:\n\n• ${missingFields.join('\n• ')}`;
    }
    
    console.log('=== Page 7 Validation Passed ===');
    return true;
}

function setupExitWarnings() {
    window.addEventListener('beforeunload', function(e) {
        if (!isSubmitting) {
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave? At least save your progress.';
            return e.returnValue;
        }
    });

    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden' && !isSubmitting) {
            const modal = document.getElementById('exit-modal');
            if (modal && !modal.classList.contains('show')) {
                showExitModal();
            }
        }
    });
}

function setupModalListeners() {
    const modal = document.getElementById('exit-modal');
    const saveAndExitBtn = document.getElementById('save-and-exit');
    const exitWithoutSavingBtn = document.getElementById('exit-without-saving');
    const continueFormBtn = document.getElementById('continue-form');
    const modalPhone = document.getElementById('modal-phone');
    const modalPhonePrefix = document.getElementById('modal-phone-prefix');

    saveAndExitBtn.addEventListener('click', function() {
        const phoneNumber = modalPhone.value.trim();
        if (phoneNumber) {
            const formData = getStoredData() || {};
            const prefix = modalPhonePrefix.value;
            formData.reminderPhone = phoneNumber;
            formData.reminderPhonePrefix = prefix;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
        }
        saveFormData();
        showNotification('Progress saved! We\'ll remind you to complete the form.', 'success');
        hideExitModal();
    });

    exitWithoutSavingBtn.addEventListener('click', function() {
        hideExitModal();
    });

    continueFormBtn.addEventListener('click', function() {
        hideExitModal();
    });

    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            hideExitModal();
        }
    });
}

function showExitModal() {
    const modal = document.getElementById('exit-modal');
    modal.classList.add('show');
}

function hideExitModal() {
    const modal = document.getElementById('exit-modal');
    modal.classList.remove('show');
}

function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    modal.classList.add('show');
    
    // Remove any existing event listeners
    const okBtn = document.getElementById('success-ok-btn');
    const newBtn = okBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(newBtn, okBtn);
    
    // Add fresh event listener
    newBtn.addEventListener('click', function() {
        modal.classList.remove('show');
        // Force navigation after a short delay
        setTimeout(() => {
            window.location.href = 'page1.html';
        }, 100);
    });
}

function hideSuccessModal() {
    const modal = document.getElementById('success-modal');
    modal.classList.remove('show');
}

async function handleFormSubmit() {
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
        // Save current page data first
        saveFormData();
        
        // Get complete form data
        const rawData = getStoredData() || {};
        rawData.submittedAt = new Date().toISOString();
        
        // Validate complete form
        const validation = validateCompleteForm(rawData);
        if (!validation.isValid) {
            console.warn('Form validation found missing fields:', validation.missingFields);
            const errorMsg = `Please complete all required fields:\n\n• ${validation.missingFields.join('\n• ')}`;
            showNotification(errorMsg, 'error');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Form';
            return;
        }
        
        // Send raw data directly to Apps Script (it expects flat field names)
        console.log('Submitting form data:', rawData);

        // Submit to App Script endpoints with retry logic
        const success = await submitToAppScript(rawData);
        
        if (!success) {
            throw new Error('All App Script endpoints failed');
        }

        console.log('Form submitted successfully');
        
        isSubmitting = true;
        
        // Clear localStorage
        localStorage.removeItem(STORAGE_KEY);
        
        // Clear all form fields on page 7
        document.getElementById('page7-form').reset();
        
        // Clear all conditional sections
        document.getElementById('photographer-details').style.display = 'none';
        document.getElementById('videographer-details').style.display = 'none';
        
        // Show success modal
        showSuccessModal();
        
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Form';

    } catch (error) {
        console.error('Error submitting form:', error);
        showNotification('Submission failed. Please check your internet connection and try again.', 'error');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Form';
    }
}

function saveFormData() {
    const formData = getStoredData() || {};
    
    // Save text, tel, number, email, textarea inputs
    document.querySelectorAll('input[type="text"], input[type="tel"], input[type="number"], input[type="email"], textarea').forEach(input => {
        // Save even if empty to track which fields were visited
        formData[input.name || input.id] = input.value || '';
    });
    
    // Save radio buttons
    document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
        formData[radio.name] = radio.value;
    });
    
    // Save checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        formData[checkbox.name || checkbox.id] = checkbox.checked ? 'on' : 'off';
    });
    
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
    
    Object.keys(savedData).forEach(key => {
        const element = document.getElementById(key);
        if (element && element.type !== 'radio') {
            element.value = savedData[key];
        }
    });
    
    Object.keys(savedData).forEach(key => {
        const radio = document.querySelector(`input[name="${key}"][value="${savedData[key]}"]`);
        if (radio) {
            radio.checked = true;
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
    // Preserve line breaks in messages
    notification.innerHTML = message.replace(/\n/g, '<br>');
    notification.className = `notification notification-${type} show`;
    
    // Errors stay longer so users can read them
    const duration = type === 'error' ? 5000 : 3000;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
}

/**
 * Submits data to App Script endpoints with fallback retry logic
 * Tries each endpoint in order until one succeeds
 */
async function submitToAppScript(payload) {
    if (!APPSCRIPT_ENDPOINTS || APPSCRIPT_ENDPOINTS.length === 0) {
        console.error('No App Script endpoints configured');
        showNotification('Configuration error: No submission endpoints available', 'error');
        return false;
    }

    console.log(`Attempting submission to ${APPSCRIPT_ENDPOINTS.length} endpoint(s)`);

    for (let i = 0; i < APPSCRIPT_ENDPOINTS.length; i++) {
        const endpoint = APPSCRIPT_ENDPOINTS[i];
        console.log(`Trying endpoint ${i + 1}/${APPSCRIPT_ENDPOINTS.length}: ${endpoint.substring(0, 50)}...`);

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                mode: 'no-cors', // Required for Google Apps Script
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            // With no-cors mode, we can't read the response, but if fetch doesn't throw, consider it successful
            console.log(`✓ Endpoint ${i + 1} accepted the request`);
            return true;

        } catch (error) {
            console.warn(`✗ Endpoint ${i + 1} failed:`, error.message);
            
            // If this was the last endpoint, return false
            if (i === APPSCRIPT_ENDPOINTS.length - 1) {
                console.error('All endpoints failed');
                return false;
            }
            
            // Otherwise, continue to next endpoint
            console.log(`Retrying with next endpoint...`);
        }
    }

    return false;
}
