// Page 2 - Key Contacts JavaScript
const STORAGE_KEY = 'amington-hall-form-data';

document.addEventListener('DOMContentLoaded', function() {
    loadSavedData();
    setupEventListeners();
    setupContactToggle();
});

function setupContactToggle() {
    const addBtn = document.getElementById('add-secondary-contact');
    const removeBtn = document.getElementById('remove-secondary-contact');
    const secondarySection = document.getElementById('secondary-contact-section');
    
    addBtn.addEventListener('click', function() {
        secondarySection.style.display = 'block';
        addBtn.style.display = 'none';
    });
    
    removeBtn.addEventListener('click', function() {
        // Clear secondary contact fields
        document.getElementById('secondary-contact-name').value = '';
        document.getElementById('secondary-contact-phone').value = '';
        document.getElementById('secondary-contact-phone-prefix').value = '+44';
        document.getElementById('secondary-contact-relationship').value = '';
        document.getElementById('secondary-contact-email').value = '';
        
        secondarySection.style.display = 'none';
        addBtn.style.display = 'inline-block';
        
        // Remove from stored data
        const formData = getStoredData() || {};
        delete formData['secondary-contact-name'];
        delete formData['secondary-contact-phone'];
        delete formData['secondary-contact-phone-prefix'];
        delete formData['secondary-contact-relationship'];
        delete formData['secondary-contact-email'];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    });
}

function setupEventListeners() {
    const form = document.getElementById('page2-form');
    const prevBtn = document.getElementById('prev-btn');
    const saveBtn = document.getElementById('save-btn');
    const restartBtn = document.getElementById('restart-btn');

    // Form submission (Next button)
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const validation = validatePage();
        if (validation === true) {
            saveFormData();
            window.location.href = 'page3.html';
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showNotification(validation || 'Please fill in all required fields correctly.', 'error');
        }
    });

    // Previous button
    prevBtn.addEventListener('click', function() {
        saveFormData();
        window.location.href = 'page1.html';
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
    console.log('=== Starting Page 2 Validation ===');
    
    // Primary contact fields are required
    const primaryName = document.getElementById('primary-contact-name');
    const primaryPhone = document.getElementById('primary-contact-phone');
    const primaryRelationship = document.getElementById('primary-contact-relationship');
    
    if (!primaryName.value.trim()) {
        console.log('Primary contact name is empty');
        return 'Please enter the primary contact name.';
    }
    
    if (!primaryPhone.value.trim()) {
        console.log('Primary contact phone is empty');
        return 'Please enter the primary contact phone number.';
    }
    
    // Validate phone format (10-15 digits)
    const phonePattern = /^[0-9]{10,15}$/;
    if (!phonePattern.test(primaryPhone.value.trim())) {
        console.log('Primary contact phone format invalid');
        return 'Please enter a valid phone number (10-15 digits).';
    }
    
    if (!primaryRelationship.value.trim()) {
        console.log('Primary contact relationship is empty');
        return 'Please enter the primary contact relationship.';
    }
    
    // If secondary contact section is visible, validate those fields too
    const secondarySection = document.getElementById('secondary-contact-section');
    if (secondarySection.style.display === 'block') {
        const secondaryName = document.getElementById('secondary-contact-name');
        const secondaryPhone = document.getElementById('secondary-contact-phone');
        const secondaryRelationship = document.getElementById('secondary-contact-relationship');
        
        // Only validate if any secondary field is filled
        const hasSecondaryData = secondaryName.value.trim() || 
                                  secondaryPhone.value.trim() || 
                                  secondaryRelationship.value.trim();
        
        if (hasSecondaryData) {
            if (!secondaryName.value.trim()) {
                console.log('Secondary contact name is empty but other fields filled');
                return 'Please complete all secondary contact fields or remove them.';
            }
            
            if (!secondaryPhone.value.trim()) {
                console.log('Secondary contact phone is empty but other fields filled');
                return 'Please complete all secondary contact fields or remove them.';
            }
            
            if (!phonePattern.test(secondaryPhone.value.trim())) {
                console.log('Secondary contact phone format invalid');
                return 'Please enter a valid secondary phone number (10-15 digits).';
            }
            
            if (!secondaryRelationship.value.trim()) {
                console.log('Secondary contact relationship is empty but other fields filled');
                return 'Please complete all secondary contact fields or remove them.';
            }
        }
    }
    
    console.log('=== Page 2 Validation Passed ===');
    return true;
}

function saveFormData() {
    const formData = getStoredData() || {};
    
    // Save all text, tel, and email inputs
    document.querySelectorAll('input[type="text"], input[type="tel"], input[type="email"]').forEach(input => {
        if (input.value) {
            formData[input.name || input.id] = input.value;
        }
    });
    
    // Save all select dropdowns (country codes)
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
    if (!savedData) return;
    
    console.log('Loading saved data:', savedData);
    
    // Load all inputs
    Object.keys(savedData).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.value = savedData[key];
        }
    });
    
    // Show secondary contact section if data exists
    const hasSecondaryData = savedData['secondary-contact-name'] || 
                              savedData['secondary-contact-phone'] || 
                              savedData['secondary-contact-relationship'] ||
                              savedData['secondary-contact-email'];
    
    if (hasSecondaryData) {
        document.getElementById('secondary-contact-section').style.display = 'block';
        document.getElementById('add-secondary-contact').style.display = 'none';
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
