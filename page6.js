// Page 5 (New) - Additional Extras JavaScript
const STORAGE_KEY = 'amington-hall-form-data';

document.addEventListener('DOMContentLoaded', function() {
    loadSavedData();
    setupEventListeners();
    setupConditionalFields();
    setupDancefloorToggle();
    setupMenuCardsToggle();
});

function setupConditionalFields() {
    // Table "Other" checkbox toggle
    const tableOtherCheckbox = document.getElementById('table-other-checkbox');
    const tableOtherText = document.getElementById('table-other-text');
    
    if (tableOtherCheckbox) {
        tableOtherCheckbox.addEventListener('change', function() {
            if (this.checked) {
                tableOtherText.style.display = 'block';
            } else {
                tableOtherText.style.display = 'none';
                tableOtherText.value = '';
            }
        });
        
        // Initialize display state
        if (tableOtherCheckbox.checked) {
            tableOtherText.style.display = 'block';
        }
    }
}

function setupDancefloorToggle() {
    const dancefloorRadios = document.querySelectorAll('input[name="dancefloor"]');
    const dancefloorOptions = document.getElementById('dancefloor-options');
    const dancefloorType = document.querySelectorAll('input[name="dancefloor-type"]');
    const dancefloorSize = document.getElementById('dancefloor-size');
    
    dancefloorRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'Yes') {
                dancefloorOptions.style.display = 'block';
            } else {
                dancefloorOptions.style.display = 'none';
                // Clear selections
                dancefloorType.forEach(type => type.checked = false);
                if (dancefloorSize) dancefloorSize.value = '';
            }
        });
    });
}

function setupMenuCardsToggle() {
    const menuCardsRadios = document.querySelectorAll('input[name="menu-cards"]');
    const menuCardsPlacementSection = document.getElementById('menu-cards-placement-section');
    const menuCardsPlacement = document.getElementById('menu-cards-placement');
    const menuCardsPlacementOtherText = document.getElementById('menu-cards-placement-other-text');
    
    menuCardsRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'Yes') {
                menuCardsPlacementSection.style.display = 'block';
            } else {
                menuCardsPlacementSection.style.display = 'none';
                // Clear selections
                if (menuCardsPlacement) menuCardsPlacement.value = '';
                if (menuCardsPlacementOtherText) {
                    menuCardsPlacementOtherText.style.display = 'none';
                    menuCardsPlacementOtherText.value = '';
                }
            }
        });
    });
    
    // Handle "Other" option in placement dropdown
    if (menuCardsPlacement) {
        menuCardsPlacement.addEventListener('change', function() {
            if (this.value === 'Other') {
                menuCardsPlacementOtherText.style.display = 'block';
            } else {
                menuCardsPlacementOtherText.style.display = 'none';
                menuCardsPlacementOtherText.value = '';
            }
        });
    }
}

function setupEventListeners() {
    const form = document.getElementById('page6-form');
    const prevBtn = document.getElementById('prev-btn');
    const saveBtn = document.getElementById('save-btn');
    const restartBtn = document.getElementById('restart-btn');

    // Form submission (navigation to next page)
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const validation = validatePage();
        if (validation === true) {
            saveFormData();
            window.location.href = 'page7.html'; // Navigate to LED/LCD Screen page
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showNotification(validation || 'Please fill in all required fields correctly.', 'error');
        }
    });

    // Previous button
    prevBtn.addEventListener('click', function() {
        saveFormData();
        window.location.href = 'page4.html';
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
    console.log('=== Starting Page 6 Validation ===');
    
    // Page 6 has no required fields - all fields are optional
    // Validation passes automatically
    
    console.log('=== Page 6 Validation Passed ===');
    return true;
}

function saveFormData() {
    const formData = getStoredData() || {};
    
    // Save all text, number, tel, email, time, textarea, file inputs
    document.querySelectorAll('input[type="text"], input[type="tel"], input[type="number"], input[type="time"], input[type="email"], textarea').forEach(input => {
        formData[input.name || input.id] = input.value || '';
    });
    
    // Save select dropdowns
    document.querySelectorAll('select').forEach(select => {
        formData[select.name || select.id] = select.value || '';
    });
    
    // Save radio buttons
    document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
        formData[radio.name] = radio.value;
    });
    
    // Save checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        formData[checkbox.name || checkbox.id] = checkbox.checked ? 'on' : 'off';
    });
    
    // Save file input info (just the filename)
    const fileInput = document.getElementById('decor-upload');
    if (fileInput && fileInput.files.length > 0) {
        formData['decor-upload-filename'] = fileInput.files[0].name;
    }
    
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
    
    // Load all text inputs and selects
    Object.keys(savedData).forEach(key => {
        const element = document.getElementById(key);
        if (element && element.type !== 'radio' && element.type !== 'checkbox') {
            element.value = savedData[key];
            // Trigger change event for selects to show conditional fields
            if (element.tagName === 'SELECT') {
                element.dispatchEvent(new Event('change'));
            }
        }
    });
    
    // Load radio buttons
    Object.keys(savedData).forEach(key => {
        const radio = document.querySelector(`input[name="${key}"][value="${savedData[key]}"]`);
        if (radio) {
            radio.checked = true;
            radio.dispatchEvent(new Event('change'));
        }
    });
    
    // Load checkboxes
    Object.keys(savedData).forEach(key => {
        const checkbox = document.getElementById(key);
        if (checkbox && checkbox.type === 'checkbox') {
            checkbox.checked = savedData[key] === 'on';
            checkbox.dispatchEvent(new Event('change'));
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
