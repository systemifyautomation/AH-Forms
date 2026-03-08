// Amington Hall Wedding Form - JavaScript

// Configuration
const APPSCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyCW-wd4u3iYt36PZKjP9sQAqlszyVsZGX1OjyuYWRVJV7vuJfsNgPWo4KfiNOfgxrs/exec'; // Replace with your actual AppScript URL
const STORAGE_KEY = 'amington-hall-form-data';
const PHONE_STORAGE_KEY = 'amington-hall-reminder-phone';

// State
let currentPage = 1;
let totalPages = 3;
let formHasChanges = false;
let isSubmitting = false;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Flatpickr date picker for event date
    flatpickr("#event-date", {
        dateFormat: "F j, Y",
        minDate: "today",
        altInput: true,
        altFormat: "F j, Y",
        theme: "dark",
        disableMobile: true,
        animate: true,
        onReady: function(selectedDates, dateStr, instance) {
            const calendarContainer = instance.calendarContainer;
            calendarContainer.style.fontFamily = "'Georgia', 'Times New Roman', serif";
        },
        onChange: function() {
            formHasChanges = true;
        }
    });
    
    // Initialize Flatpickr date picker for walkthrough meeting date
    flatpickr("#walkthrough-date", {
        dateFormat: "F j, Y",
        minDate: "today",
        altInput: true,
        altFormat: "F j, Y",
        theme: "dark",
        disableMobile: true,
        animate: true,
        onReady: function(selectedDates, dateStr, instance) {
            const calendarContainer = instance.calendarContainer;
            calendarContainer.style.fontFamily = "'Georgia', 'Times New Roman', serif";
        },
        onChange: function() {
            formHasChanges = true;
        }
    });
    
    // Handle "Other" event timing option
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
            formHasChanges = true;
        });
    });
    
    // Handle secondary contact toggle
    const addSecondaryBtn = document.getElementById('add-secondary-contact');
    const removeSecondaryBtn = document.getElementById('remove-secondary-contact');
    const secondarySection = document.getElementById('secondary-contact-section');
    
    addSecondaryBtn.addEventListener('click', function() {
        secondarySection.style.display = 'block';
        addSecondaryBtn.parentElement.style.display = 'none';
        formHasChanges = true;
    });
    
    removeSecondaryBtn.addEventListener('click', function() {
        secondarySection.style.display = 'none';
        addSecondaryBtn.parentElement.style.display = 'block';
        
        // Clear secondary contact fields
        document.getElementById('secondary-contact-name').value = '';
        document.getElementById('secondary-contact-phone').value = '';
        document.getElementById('secondary-contact-relationship').value = '';
        
        formHasChanges = true;
    });
    
    // Initialize form
    initializeForm();
    loadSavedData();
    setupEventListeners();
    setupExitWarnings();
});

// Initialize form state
function initializeForm() {
    const pages = document.querySelectorAll('.form-page');
    totalPages = pages.length;
    document.getElementById('total-pages').textContent = totalPages;
    updatePageDisplay();
}

// Load saved data from localStorage
function loadSavedData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            
            // Load text inputs
            Object.keys(data).forEach(key => {
                const input = document.querySelector(`input[name="${key}"]`);
                if (input && (input.type === 'text' || input.type === 'tel' || input.type === 'number')) {
                    input.value = data[key];
                }
            });
            
            // Load email inputs
            Object.keys(data).forEach(key => {
                const input = document.querySelector(`input[name="${key}"]`);
                if (input && input.type === 'email') {
                    input.value = data[key];
                }
            });
            
            // Load radio buttons
            Object.keys(data).forEach(key => {
                const radio = document.querySelector(`input[name="${key}"][value="${data[key]}"]`);
                if (radio && radio.type === 'radio') {
                    radio.checked = true;
                    // Trigger change event for "Other" timing option
                    if (key === 'event-timings') {
                        radio.dispatchEvent(new Event('change'));
                    }
                }
            });
            
            // Show secondary contact section if data exists
            if (data['secondary-contact-name'] || data['secondary-contact-phone'] || 
                data['secondary-contact-relationship']) {
                const secondarySection = document.getElementById('secondary-contact-section');
                const addSecondaryBtn = document.getElementById('add-secondary-contact');
                if (secondarySection && addSecondaryBtn) {
                    secondarySection.style.display = 'block';
                    addSecondaryBtn.parentElement.style.display = 'none';
                }
            }
            
            console.log('Form data loaded from local storage');
        } catch (e) {
            console.error('Error loading saved data:', e);
        }
    }
}

// Save form data to localStorage
function saveFormData() {
    const data = {};
    
    // Save text inputs
    const textInputs = document.querySelectorAll('input[type="text"], input[type="tel"], input[type="email"], input[type="number"]');
    textInputs.forEach(input => {
        if (input.name && input.value) {
            data[input.name] = input.value;
        }
    });
    
    // Save radio button values
    const radioGroups = document.querySelectorAll('input[type="radio"]:checked');
    radioGroups.forEach(radio => {
        if (radio.name) {
            data[radio.name] = radio.value;
        }
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    formHasChanges = false;
    
    // Show save confirmation
    showNotification('Progress saved successfully!', 'success');
}

// Setup event listeners
function setupEventListeners() {
    const form = document.getElementById('wedding-inquiry-form');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const saveBtn = document.getElementById('save-btn');
    const submitBtn = document.getElementById('submit-btn');
    const restartBtn = document.getElementById('restart-btn');
    
    // Track form changes
    form.addEventListener('input', function() {
        formHasChanges = true;
    });
    
    // Navigation buttons
    prevBtn.addEventListener('click', () => navigateToPage(currentPage - 1));
    nextBtn.addEventListener('click', () => navigateToPage(currentPage + 1));
    
    // Save button
    saveBtn.addEventListener('click', function() {
        saveFormData();
    });
    
    // Restart button
    restartBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to restart the form? All progress will be lost.')) {
            restartForm();
        }
    });
    
    // Form submission
    form.addEventListener('submit', handleFormSubmit);
    
    // Modal event listeners
    setupModalListeners();
}

// Navigate to specific page
function navigateToPage(pageNumber) {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    
    // Validate current page before moving forward
    if (pageNumber > currentPage) {
        const validationResult = validateCurrentPage();
        if (validationResult !== true) {
            // If validation returns a string, it's a custom error message
            if (typeof validationResult === 'string') {
                showNotification(validationResult, 'error');
            } else {
                showNotification('Please fill in all required fields', 'error');
            }
            return;
        }
    }
    
    currentPage = pageNumber;
    updatePageDisplay();
}

// Validate current page fields
function validateCurrentPage() {
    const currentPageElement = document.querySelector(`.form-page[data-page="${currentPage}"]`);
    const requiredInputs = currentPageElement.querySelectorAll('input[required]');
    
    const emptyFields = [];
    
    // Validate text and tel inputs (including readonly)
    for (let input of requiredInputs) {
        if (input.type === 'text' || input.type === 'tel' || input.type === 'number') {
            // Skip hidden inputs (like the "other" timing field when not visible)
            if (input.offsetParent === null) continue;
            
            if (!input.value.trim()) {
                emptyFields.push({
                    name: input.name || input.id,
                    type: input.type,
                    label: input.previousElementSibling?.textContent || 'Unknown field'
                });
                input.focus();
                console.log('Empty required fields:', emptyFields);
                return false;
            }
        }
    }
    
    // Validate radio buttons
    const radioGroups = {};
    const uncheckedRadioGroups = [];
    currentPageElement.querySelectorAll('input[type="radio"][required]').forEach(radio => {
        if (!radioGroups[radio.name]) {
            radioGroups[radio.name] = false;
        }
        if (radio.checked) {
            radioGroups[radio.name] = true;
        }
    });
    
    for (let groupName in radioGroups) {
        if (!radioGroups[groupName]) {
            uncheckedRadioGroups.push(groupName);
        }
    }
    
    if (uncheckedRadioGroups.length > 0) {
        console.log('Unchecked required radio groups:', uncheckedRadioGroups);
        return false;
    }
    
    // Validate checkboxes (at least one suite must be selected on page 1)
    if (currentPage === 1) {
        // Validate guest count against selected suite
        const guestCountInput = document.getElementById('guest-count');
        const suiteRadio = document.querySelector('input[name="suite-hired"]:checked');
        
        if (guestCountInput && guestCountInput.value && suiteRadio) {
            const guestCount = parseInt(guestCountInput.value);
            const selectedSuite = suiteRadio.value;
            
            let maxGuests = 0;
            
            if (selectedSuite === 'Both') {
                maxGuests = 650; // Sum of both suites
            } else if (selectedSuite === 'Amington Suite') {
                maxGuests = 400;
            } else if (selectedSuite === 'Serenity Suite') {
                maxGuests = 250;
            }
            
            if (guestCount > maxGuests) {
                console.log(`Guest count (${guestCount}) exceeds maximum for ${selectedSuite} (${maxGuests})`);
                guestCountInput.focus();
                return `Guest count exceeds maximum of ${maxGuests} for ${selectedSuite}`;
            }
        }
    }
    
    console.log('All required fields filled on page', currentPage);
    return true;
}

// Update page display and navigation buttons
function updatePageDisplay() {
    const pages = document.querySelectorAll('.form-page');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    
    // Hide all pages
    pages.forEach(page => page.style.display = 'none');
    
    // Show current page
    const currentPageElement = document.querySelector(`.form-page[data-page="${currentPage}"]`);
    if (currentPageElement) {
        currentPageElement.style.display = 'block';
    }
    
    // Update page indicator
    document.getElementById('current-page').textContent = currentPage;
    
    // Update button visibility - Previous button always visible except on first page
    prevBtn.style.display = currentPage === 1 ? 'none' : 'inline-block';
    nextBtn.style.display = currentPage === totalPages ? 'none' : 'inline-block';
    submitBtn.style.display = currentPage === totalPages ? 'inline-block' : 'none';
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (isSubmitting) return;
    
    if (!validateCurrentPage()) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    isSubmitting = true;
    const submitBtn = document.getElementById('submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    try {
        const formData = getFormData();
        
        // Send to AppScript
        const response = await fetch(APPSCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        // Clear saved data after successful submission
        localStorage.removeItem(STORAGE_KEY);
        formHasChanges = false;
        
        // Show success message
        showSuccessMessage();
        
    } catch (error) {
        console.error('Error submitting form:', error);
        showNotification('Error submitting form. Please try again.', 'error');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        isSubmitting = false;
    }
}

// Get all form data
function getFormData() {
    const form = document.getElementById('wedding-inquiry-form');
    const data = {
        timestamp: new Date().toISOString(),
        questions: {}
    };
    
    // Get all text inputs
    const textInputs = form.querySelectorAll('input[type="text"], input[type="tel"], input[type="email"], input[type="number"]');
    textInputs.forEach(input => {
        if (input.name && input.value) {
            data.questions[input.name] = input.value;
        }
    });
    
    // Get radio button values
    const radioGroups = form.querySelectorAll('input[type="radio"]:checked');
    radioGroups.forEach(radio => {
        if (radio.name) {
            data.questions[radio.name] = radio.value;
        }
    });
    
    return data;
}

// Show success message
function showSuccessMessage() {
    const form = document.getElementById('wedding-inquiry-form');
    
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
        <div class="success-icon">✓</div>
        <h3>Thank You!</h3>
        <p>Your inquiry has been submitted successfully. The Amington Hall team will contact you soon.</p>
    `;
    
    form.parentNode.insertBefore(successMessage, form);
    form.style.display = 'none';
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Show notification
function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Setup exit warnings
function setupExitWarnings() {
    let modalShown = false;
    
    // Browser beforeunload warning - shows browser's native dialog
    window.addEventListener('beforeunload', function(e) {
        if (formHasChanges && !isSubmitting) {
            // Show our custom modal
            e.preventDefault();
            
            // Only show modal once per session
            if (!modalShown) {
                modalShown = true;
                showExitModal();
            }
            
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            return e.returnValue;
        }
    });
}

// Setup modal event listeners
function setupModalListeners() {
    const modal = document.getElementById('exit-modal');
    const cancelBtn = document.getElementById('modal-cancel');
    const savePhoneBtn = document.getElementById('modal-save-phone');
    const leaveBtn = document.getElementById('modal-leave');
    const phoneInput = document.getElementById('reminder-phone');
    
    cancelBtn.addEventListener('click', function() {
        hideExitModal();
    });
    
    leaveBtn.addEventListener('click', function() {
        // Just close the modal and allow exit
        hideExitModal();
        formHasChanges = false; // Prevent further warnings
    });
    
    savePhoneBtn.addEventListener('click', function() {
        const phone = phoneInput.value.trim();
        
        // Save form progress regardless of phone number
        saveFormData();
        
        // If phone number provided, save it
        if (phone) {
            const fullPhone = '+44' + phone;
            localStorage.setItem(PHONE_STORAGE_KEY, fullPhone);
            showNotification('Your phone number and progress have been saved. We\'ll remind you to complete the form!', 'success');
        } else {
            showNotification('Your progress has been saved!', 'success');
        }
        
        hideExitModal();
        formHasChanges = false; // Allow exit without warning
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            hideExitModal();
        }
    });
}

// Show exit modal
function showExitModal() {
    const modal = document.getElementById('exit-modal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
}

// Hide exit modal
function hideExitModal() {
    const modal = document.getElementById('exit-modal');
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300);
}

// Restart form
function restartForm() {
    // Clear form
    const form = document.getElementById('wedding-inquiry-form');
    form.reset();
    
    // Clear saved data
    localStorage.removeItem(STORAGE_KEY);
    
    // Reset to page 1
    currentPage = 1;
    updatePageDisplay();
    
    // Reset form state
    formHasChanges = false;
    
    // Hide "Other" timing input if visible
    const otherTimingInput = document.getElementById('event-timings-other');
    if (otherTimingInput) {
        otherTimingInput.style.display = 'none';
        otherTimingInput.required = false;
    }
    
    showNotification('Form has been restarted', 'success');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
