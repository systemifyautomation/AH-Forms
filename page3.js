// Page 3 - Additional Information & Submission JavaScript
const STORAGE_KEY = 'amington-hall-form-data';
const APPSCRIPT_URL = 'YOUR_APPSCRIPT_WEB_APP_URL_HERE';

let isSubmitting = false;

document.addEventListener('DOMContentLoaded', function() {
    loadSavedData();
    setupEventListeners();
    setupExitWarnings();
    setupModalListeners();
});

function setupEventListeners() {
    const form = document.getElementById('page3-form');
    const prevBtn = document.getElementById('prev-btn');
    const saveBtn = document.getElementById('save-btn');
    const restartBtn = document.getElementById('restart-btn');

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (confirm('Are you ready to submit the form? Please make sure all information is correct.')) {
            handleFormSubmit();
        }
    });

    // Previous button
    prevBtn.addEventListener('click', function() {
        saveFormData();
        window.location.href = 'page2.html';
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

function setupExitWarnings() {
    window.addEventListener('beforeunload', function(e) {
        if (!isSubmitting) {
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave? At least save your progress.';
            return e.returnValue;
        }
    });

    // Show modal on attempt to leave
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

    // Close modal when clicking outside
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

async function handleFormSubmit() {
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
        const formData = getStoredData() || {};
        
        // Add submission timestamp
        formData.submittedAt = new Date().toISOString();
        
        console.log('Submitting form data:', formData);

        // Send to AppScript
        const response = await fetch(APPSCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        console.log('Form submitted successfully');
        
        isSubmitting = true;
        
        // Clear localStorage
        localStorage.removeItem(STORAGE_KEY);
        
        // Show success message
        showNotification('Form submitted successfully! Thank you.', 'success');
        
        // Redirect or show success page after delay
        setTimeout(() => {
            alert('Thank you for completing the Amington Hall Walkthrough Register!\n\nYour submission has been received. We will contact you shortly to confirm your event details.');
            window.location.href = 'page1.html';
        }, 2000);

    } catch (error) {
        console.error('Error submitting form:', error);
        showNotification('There was an error submitting the form. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Form';
    }
}

function saveFormData() {
    const formData = getStoredData() || {};
    
    // Save any additional fields from this page if added in future
    document.querySelectorAll('input[type="text"], input[type="tel"], input[type="number"], input[type="email"], textarea').forEach(input => {
        if (input.value) {
            formData[input.name || input.id] = input.value;
        }
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
    
    // Load all inputs if any are added to this page in future
    Object.keys(savedData).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.value = savedData[key];
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
