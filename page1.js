// Page 1 - Event Details JavaScript
const STORAGE_KEY = 'amington-hall-form-data';

// Initialize flatpickr on load
let eventDatePicker, walkthroughDatePicker;

document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    loadSavedData();
    setupEventListeners();
    setupOtherTimingToggle();
});

function initializePage() {
    // Initialize flatpickr for event date
    eventDatePicker = flatpickr("#event-date", {
        dateFormat: "d/m/Y",
        minDate: "today",
        theme: "dark"
    });

    // Initialize flatpickr for walkthrough date
    walkthroughDatePicker = flatpickr("#walkthrough-date", {
        dateFormat: "d/m/Y",
        minDate: "today",
        theme: "dark"
    });
}

function setupOtherTimingToggle() {
    const timingRadios = document.querySelectorAll('input[name="event-timings"]');
    const otherTimingInput = document.getElementById('event-timings-other');
    
    timingRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'Other') {
                otherTimingInput.style.display = 'block';
                otherTimingInput.required = true;
            } else {
                otherTimingInput.style.display = 'none';
                otherTimingInput.required = false;
                otherTimingInput.value = '';
            }
        });
    });
}

function setupEventListeners() {
    const form = document.getElementById('page1-form');
    const saveBtn = document.getElementById('save-btn');
    const restartBtn = document.getElementById('restart-btn');

    // Form submission (Next button)
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const validation = validatePage();
        if (validation === true) {
            saveFormData();
            window.location.href = 'page2.html';
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showNotification(validation || 'Please fill in all required fields correctly.', 'error');
        }
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
            location.reload();
        }
    });
}

function validatePage() {
    console.log('=== Starting Page 1 Validation ===');
    
    const missingFields = [];
    
    // Check required text fields with user-friendly labels
    const requiredFieldsMap = [
        { id: 'client-name', label: 'Client Name' },
        { id: 'groom-name', label: 'Groom Name' },
        { id: 'bride-name', label: 'Bride Name' },
        { id: 'ethnicity', label: 'Ethnicity' },
        { id: 'event-date', label: 'Event Date' },
        { id: 'walkthrough-date', label: 'Walkthrough Date' }
    ];
    
    requiredFieldsMap.forEach(field => {
        const element = document.getElementById(field.id);
        if (element && !element.value.trim()) {
            missingFields.push(field.label);
            console.log(`Empty field: ${field.label}`);
        }
    });
    
    // Check event timings radio group
    const timingChecked = document.querySelector('input[name="event-timings"]:checked');
    if (!timingChecked) {
        missingFields.push('Event Timings');
        console.log('Event Timings not selected');
    } else if (timingChecked.value === 'Other') {
        const otherInput = document.getElementById('event-timings-other');
        if (!otherInput.value.trim()) {
            missingFields.push('Other Event Timing (please specify)');
        }
    }
    
    if (missingFields.length > 0) {
        return `Please fill in the following required fields:\n\n• ${missingFields.join('\n• ')}`;
    }
    
    console.log('=== Page 1 Validation Passed ===');
    return true;
}

function saveFormData() {
    const formData = getStoredData() || {};
    
    // Save text inputs
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
    if (!savedData) return;
    
    console.log('Loading saved data:', savedData);
    
    // Load text inputs
    Object.keys(savedData).forEach(key => {
        const element = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
        if (element && element.type !== 'radio') {
            element.value = savedData[key];
        }
    });
    
    // Load radio buttons
    Object.keys(savedData).forEach(key => {
        const radio = document.querySelector(`input[name="${key}"][value="${savedData[key]}"]`);
        if (radio) {
            radio.checked = true;
            // Trigger change event for "Other" timing toggle
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
    notification.innerHTML = message.replace(/\n/g, '<br>');
    notification.className = `notification notification-${type} show`;
    
    const duration = type === 'error' ? 5000 : 3000;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
}
