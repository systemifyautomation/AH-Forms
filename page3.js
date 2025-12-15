// Page 3 - Seating and Hall Arrangements JavaScript
const STORAGE_KEY = 'amington-hall-form-data';

document.addEventListener('DOMContentLoaded', function() {
    loadSavedData();
    setupEventListeners();
    setupSegregationToggle();
    setupAdditionalTablesToggle();
});

function setupAdditionalTablesToggle() {
    const otherCheckbox = document.getElementById('additional-tables-other');
    const otherText = document.getElementById('additional-tables-other-text');
    
    if (otherCheckbox) {
        otherCheckbox.addEventListener('change', function() {
            if (this.checked) {
                otherText.style.display = 'block';
                otherText.required = true;
            } else {
                otherText.style.display = 'none';
                otherText.required = false;
                otherText.value = '';
            }
        });
    }
}

function setupSegregationToggle() {
    const arrangementRadios = document.querySelectorAll('input[name="guest-arrangements"]');
    const segregationSection = document.getElementById('segregation-counts');
    const menCount = document.getElementById('men-count');
    const womenCount = document.getElementById('women-count');
    
    arrangementRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'Men & Women Segregation') {
                segregationSection.style.display = 'block';
                menCount.required = true;
                womenCount.required = true;
            } else {
                segregationSection.style.display = 'none';
                menCount.required = false;
                womenCount.required = false;
                menCount.value = '';
                womenCount.value = '';
            }
        });
    });
}

function setupEventListeners() {
    const form = document.getElementById('page3-form');
    const prevBtn = document.getElementById('prev-btn');
    const saveBtn = document.getElementById('save-btn');
    const restartBtn = document.getElementById('restart-btn');

    // Form submission (Next button)
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const validation = validatePage();
        if (validation === true) {
            saveFormData();
            window.location.href = 'page4.html';
        } else {
            showNotification(validation || 'Please fill in all required fields correctly.', 'error');
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

function validatePage() {
    console.log('=== Starting Page 3 Validation ===');
    
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
    const radioGroups = ['suite-hired', 'table-type', 'guest-arrangements', 'table-settings', 'head-table', 'dance-floor'];
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
    
    // Check segregation-specific validations
    const selectedArrangement = document.querySelector('input[name="guest-arrangements"]:checked');
    if (selectedArrangement && selectedArrangement.value === 'Men & Women Segregation') {
        const menCount = document.getElementById('men-count');
        const womenCount = document.getElementById('women-count');
        
        if (!menCount.value) {
            console.log('Men count not selected for segregation');
            return 'Please select the number of men for segregated seating.';
        }
        
        if (!womenCount.value) {
            console.log('Women count not selected for segregation');
            return 'Please select the number of women for segregated seating.';
        }
        
        // Check Amington Suite segregation limit (350 max)
        if (selectedSuite.value === 'Amington Suite' && guestCount > 350) {
            console.log('Segregated event in Amington Suite exceeds 350 guests');
            return 'For segregated events in the Amington Suite only, the maximum guest count is 350. Please reduce your guest count or select Both Suites.';
        }
    }
    
    console.log('=== Page 3 Validation Passed ===');
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
    
    // Save checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    const additionalTables = [];
    checkboxes.forEach(checkbox => {
        if (checkbox.name === 'additional-tables') {
            additionalTables.push(checkbox.value);
        }
    });
    if (additionalTables.length > 0) {
        formData['additional-tables'] = additionalTables;
    }
    
    // Save select dropdowns
    document.querySelectorAll('select').forEach(select => {
        if (select.value) {
            formData[select.name || select.id] = select.value;
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
    
    // Load text inputs and selects
    Object.keys(savedData).forEach(key => {
        const element = document.getElementById(key);
        if (element && element.type !== 'radio' && element.type !== 'checkbox') {
            element.value = savedData[key];
        }
    });
    
    // Load radio buttons
    Object.keys(savedData).forEach(key => {
        const radio = document.querySelector(`input[name="${key}"][value="${savedData[key]}"]`);
        if (radio) {
            radio.checked = true;
            // Trigger change event for segregation toggle
            radio.dispatchEvent(new Event('change'));
        }
    });
    
    // Load checkboxes
    if (savedData['additional-tables'] && Array.isArray(savedData['additional-tables'])) {
        savedData['additional-tables'].forEach(value => {
            const checkbox = document.querySelector(`input[name="additional-tables"][value="${value}"]`);
            if (checkbox) {
                checkbox.checked = true;
                // Trigger change event for "Other" toggle
                checkbox.dispatchEvent(new Event('change'));
            }
        });
    }
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
