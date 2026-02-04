// Page 3 - Seating and Hall Arrangements JavaScript
const STORAGE_KEY = 'amington-hall-form-data';

document.addEventListener('DOMContentLoaded', function() {
    loadSavedData();
    setupEventListeners();
    setupSegregationToggle();
    setupAdditionalTablesToggle();
    setupSuiteTableTypeToggle();
    setupReservedTablesConditional();
    setupTablePlanConditional();
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

function setupSuiteTableTypeToggle() {
    const suiteRadios = document.querySelectorAll('input[name="suite-hired"]');
    const tableTypeRadios = document.querySelectorAll('input[name="table-type"]');
    const vipTableOption = document.querySelector('input[name="table-type"][value="VIP"]');
    const vipLabel = vipTableOption ? vipTableOption.closest('.radio-label') : null;
    
    if (suiteRadios && vipLabel) {
        suiteRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'Serenity Suite') {
                    // Hide VIP option for Serenity Suite
                    vipLabel.style.display = 'none';
                    // If VIP was selected, deselect it and select Round Tables
                    if (vipTableOption.checked) {
                        vipTableOption.checked = false;
                        const roundTableOption = document.querySelector('input[name="table-type"][value="Round Tables"]');
                        if (roundTableOption) {
                            roundTableOption.checked = true;
                        }
                    }
                } else {
                    // Show VIP option for Amington Suite or Both
                    vipLabel.style.display = '';
                }
            });
        });
        
        // Trigger on page load if a suite is already selected
        const selectedSuite = document.querySelector('input[name="suite-hired"]:checked');
        if (selectedSuite) {
            selectedSuite.dispatchEvent(new Event('change'));
        }
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

function setupReservedTablesConditional() {
    const reservedTablesRadios = document.querySelectorAll('input[name="want-reserved-tables"]');
    const reservedTablesSection = document.getElementById('reserved-tables-section');
    
    reservedTablesRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'Yes') {
                reservedTablesSection.style.display = 'block';
            } else {
                reservedTablesSection.style.display = 'none';
                // Clear reserved table inputs
                document.getElementById('reserved-tables-groom').value = '';
                document.getElementById('reserved-tables-bride').value = '';
            }
        });
    });
}

function setupTablePlanConditional() {
    const tablePlanRadios = document.querySelectorAll('input[name="table-plan"]');
    const tablePlanDetails = document.getElementById('table-plan-details');
    
    tablePlanRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'Yes') {
                tablePlanDetails.style.display = 'block';
            } else {
                tablePlanDetails.style.display = 'none';
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
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
    
    const missingFields = [];
    
    // Check required text fields
    const guestCountInput = document.getElementById('guest-count');
    if (!guestCountInput.value.trim()) {
        missingFields.push('Number of Guests');
    }
    
    // Check radio button groups with user-friendly labels
    const radioGroups = [
        { name: 'suite-hired', label: 'Suite Hired' },
        { name: 'table-type', label: 'Table Type' },
        { name: 'guest-arrangements', label: 'Guest Arrangements' },
        { name: 'table-settings', label: 'Table Settings' },
        { name: 'head-table', label: 'Head Table' }
    ];
    
    for (const group of radioGroups) {
        const checkedRadio = document.querySelector(`input[name="${group.name}"]:checked`);
        if (!checkedRadio) {
            missingFields.push(group.label);
            console.log(`Unchecked: ${group.label}`);
        }
    }
    
    if (missingFields.length > 0) {
        return `Please answer the following required questions:\n\n• ${missingFields.join('\n• ')}`;
    }
    
    // Validate guest count
    const guestCount = parseInt(guestCountInput.value);
    if (isNaN(guestCount) || guestCount <= 0) {
        return 'Please enter a valid number of guests.';
    }
    
    const selectedSuite = document.querySelector('input[name="suite-hired"]:checked');
    let maxCapacity;
    let suiteName;
    
    switch(selectedSuite.value) {
        case 'Amington Suite':
            maxCapacity = 400;
            suiteName = 'Amington Suite';
            break;
        case 'Serenity Suite':
            maxCapacity = 200;
            suiteName = 'Serenity Suite';
            break;
        case 'Both':
            maxCapacity = 600;
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
    
    // Check "Other" additional tables text input
    const otherCheckbox = document.getElementById('additional-tables-other');
    if (otherCheckbox && otherCheckbox.checked) {
        const otherText = document.getElementById('additional-tables-other-text');
        if (!otherText.value.trim()) {
            console.log('Other additional tables selected but not specified');
            return 'Please specify what other additional tables you require.';
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
    notification.innerHTML = message.replace(/\n/g, '<br>');
    notification.className = `notification notification-${type} show`;
    
    const duration = type === 'error' ? 5000 : 3000;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
}
