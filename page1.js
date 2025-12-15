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
    
    // Get all required fields
    const requiredFields = document.querySelectorAll('input[required], textarea[required], select[required]');
    const emptyFields = [];
    
    // Check text, number, email, tel inputs
    requiredFields.forEach(field => {
        // Skip hidden fields
        if (field.offsetParent === null) {
            console.log(`Skipping hidden field: ${field.name || field.id}`);
            return;
        }
        
        if (field.type !== 'radio' && !field.value.trim()) {
            emptyFields.push(field.name || field.id);
            console.log(`Empty field: ${field.name || field.id}`);
        }
    });
    
    if (emptyFields.length > 0) {
        console.log('Empty fields found:', emptyFields);
        return false;
    }
    
    // Check radio button groups
    const radioGroups = ['event-timings', 'suite-hired'];
    for (const groupName of radioGroups) {
        const checkedRadio = document.querySelector(`input[name="${groupName}"]:checked`);
        if (!checkedRadio) {
            console.log(`Unchecked radio group: ${groupName}`);
            return false;
        }
    }
    
    // Validate guest count against suite capacity
    const guestCountInput = document.getElementById('guest-count');
    const guestCount = parseInt(guestCountInput.value);
    
    if (isNaN(guestCount) || guestCount <= 0) {
        console.log('Invalid guest count:', guestCountInput.value);
        return 'Please enter a valid number of guests.';
    }
    
    const selectedSuite = document.querySelector('input[name="suite-hired"]:checked');
    if (!selectedSuite) {
        return 'Please select a suite.';
    }
    
    let maxCapacity;
    let suiteName;
    
    switch(selectedSuite.value) {
        case 'Amington Suite':
            maxCapacity = 400;
            suiteName = 'Amington Suite';
            break;
        case 'Serenity Suite':
            maxCapacity = 250;
            suiteName = 'Serenity Suite';
            break;
        case 'Both':
            maxCapacity = 650;
            suiteName = 'Both Suites';
            break;
    }
    
    if (guestCount > maxCapacity) {
        console.log(`Guest count (${guestCount}) exceeds capacity (${maxCapacity}) for ${suiteName}`);
        return `The maximum capacity for ${suiteName} is ${maxCapacity} guests. Please adjust your guest count or select a different suite.`;
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
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}
