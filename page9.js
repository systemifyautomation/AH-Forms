// Page 9 - Additional Services JavaScript
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
let serviceCounter = 0;

document.addEventListener('DOMContentLoaded', function() {
    loadAppScriptEndpoints();
    loadSavedData();
    setupEventListeners();
    setupAdditionalServicesToggle();
    setupTimingToggles();
    setupExitWarnings();
    setupModalListeners();
});

function setupAdditionalServicesToggle() {
    const additionalServicesRadios = document.querySelectorAll('input[name="additional-services"]');
    const additionalServicesContent = document.getElementById('additional-services-content');
    
    additionalServicesRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'Yes') {
                additionalServicesContent.style.display = 'block';
            } else {
                additionalServicesContent.style.display = 'none';
            }
        });
    });
}

function setupTimingToggles() {
    // Pancake Cart timing toggle
    const pancakeCartCheckbox = document.getElementById('pancake-cart-checkbox');
    const pancakeCartTiming = document.getElementById('pancake-cart-timing');
    
    pancakeCartCheckbox.addEventListener('change', function() {
        if (this.checked) {
            pancakeCartTiming.style.display = 'block';
        } else {
            pancakeCartTiming.style.display = 'none';
            document.querySelectorAll('input[name="pancake-cart-timing"]').forEach(radio => radio.checked = false);
        }
    });

    // 360 Booth timing toggle
    const booth360Checkbox = document.getElementById('booth-360-checkbox');
    const booth360Timing = document.getElementById('booth-360-timing');
    
    booth360Checkbox.addEventListener('change', function() {
        if (this.checked) {
            booth360Timing.style.display = 'block';
        } else {
            booth360Timing.style.display = 'none';
            document.querySelectorAll('input[name="booth-360-timing"]').forEach(radio => radio.checked = false);
        }
    });

    // Vintage Photobooth timing toggle
    const vintagePhotoboothCheckbox = document.getElementById('vintage-photobooth-checkbox');
    const vintagePhotoboothTiming = document.getElementById('vintage-photobooth-timing');
    
    vintagePhotoboothCheckbox.addEventListener('change', function() {
        if (this.checked) {
            vintagePhotoboothTiming.style.display = 'block';
        } else {
            vintagePhotoboothTiming.style.display = 'none';
            document.querySelectorAll('input[name="vintage-photobooth-timing"]').forEach(radio => radio.checked = false);
        }
    });
}

function setupEventListeners() {
    const form = document.getElementById('page9-form');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const saveBtn = document.getElementById('save-btn');
    const restartBtn = document.getElementById('restart-btn');
    const addServiceBtn = document.getElementById('add-service-btn');

    // Add Service button
    addServiceBtn.addEventListener('click', addThirdPartyService);

    // Next button
    nextBtn.addEventListener('click', function() {
        const validation = validatePage();
        if (validation === true) {
            saveFormData();
            isNavigating = true;
            window.location.href = 'page10.html';
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showNotification(validation, 'error');
        }
    });

    // Previous button
    prevBtn.addEventListener('click', function() {
        saveFormData();
        isNavigating = true;
        window.location.href = 'page8.html';
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

function addThirdPartyService() {
    serviceCounter++;
    const container = document.getElementById('third-party-services-container');
    
    const serviceDiv = document.createElement('div');
    serviceDiv.className = 'third-party-service';
    serviceDiv.setAttribute('data-service-id', serviceCounter);
    serviceDiv.innerHTML = `
        <div class="service-header">
            <h4>Service ${serviceCounter}</h4>
            <button type="button" class="nav-btn restart-btn remove-service-btn" onclick="removeThirdPartyService(${serviceCounter})">Remove</button>
        </div>
        
        <div class="form-group">
            <label for="service-type-${serviceCounter}">Type of Service:</label>
            <input type="text" id="service-type-${serviceCounter}" name="third-party-service-type-${serviceCounter}">
        </div>

        <div class="form-group">
            <label for="service-company-${serviceCounter}">Name of Company & Contact Number:</label>
            <input type="text" id="service-company-${serviceCounter}" name="third-party-service-company-${serviceCounter}">
        </div>

        <div class="form-group">
            <label for="service-start-time-${serviceCounter}">Start Time:</label>
            <input type="time" id="service-start-time-${serviceCounter}" name="third-party-service-start-time-${serviceCounter}">
        </div>
    `;
    
    container.appendChild(serviceDiv);
}

function removeThirdPartyService(serviceId) {
    const serviceDiv = document.querySelector(`[data-service-id="${serviceId}"]`);
    if (serviceDiv) {
        serviceDiv.remove();
    }
}

function validatePage() {
    console.log('=== Starting Page 9 Validation ===');
    
    // Check required radio group
    const additionalServices = document.querySelector('input[name="additional-services"]:checked');
    
    if (!additionalServices) {
        return 'Please answer if you will be having any additional services.';
    }
    
    // If additional services is Yes, check conditional timing fields
    if (additionalServices.value === 'Yes') {
        // Check pancake cart timing
        const pancakeCartCheckbox = document.getElementById('pancake-cart-checkbox');
        if (pancakeCartCheckbox && pancakeCartCheckbox.checked) {
            const pancakeCartTiming = document.querySelector('input[name="pancake-cart-timing"]:checked');
            if (!pancakeCartTiming) {
                return 'Please select the timing for Pancake Cart service (Before or After Food Service).';
            }
        }
        
        // Check 360 booth timing
        const booth360Checkbox = document.getElementById('booth-360-checkbox');
        if (booth360Checkbox && booth360Checkbox.checked) {
            const booth360Timing = document.querySelector('input[name="booth-360-timing"]:checked');
            if (!booth360Timing) {
                return 'Please select the timing for 360 Booth service (Before or After Food Service).';
            }
        }
        
        // Check vintage photobooth timing
        const vintagePhotoboothCheckbox = document.getElementById('vintage-photobooth-checkbox');
        if (vintagePhotoboothCheckbox && vintagePhotoboothCheckbox.checked) {
            const vintagePhotoboothTiming = document.querySelector('input[name="vintage-photobooth-timing"]:checked');
            if (!vintagePhotoboothTiming) {
                return 'Please select the timing for Vintage Photobooth service (Before or After Food Service).';
            }
        }
    }
    
    console.log('Page 9 validation passed');
    return true;
}

function saveFormData() {
    console.log('Saving Page 9 data...');
    
    const formData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    
    // Save additional services question
    const additionalServices = document.querySelector('input[name="additional-services"]:checked');
    if (additionalServices) {
        formData['additional-services'] = additionalServices.value;
    }

    // Save venue services checkboxes
    const venueServiceCheckboxes = [
        'venue-service-welcome-drinks',
        'venue-service-nikkah-partition',
        'venue-service-low-fog',
        'venue-service-sparklers',
        'venue-service-pancake-cart',
        'venue-service-360-booth',
        'venue-service-vintage-photobooth'
    ];

    venueServiceCheckboxes.forEach(name => {
        const checkbox = document.querySelector(`input[name="${name}"]`);
        if (checkbox) {
            formData[name] = checkbox.checked;
        }
    });

    // Save timing options
    const pancakeCartTiming = document.querySelector('input[name="pancake-cart-timing"]:checked');
    if (pancakeCartTiming) {
        formData['pancake-cart-timing'] = pancakeCartTiming.value;
    }

    const booth360Timing = document.querySelector('input[name="booth-360-timing"]:checked');
    if (booth360Timing) {
        formData['booth-360-timing'] = booth360Timing.value;
    }

    const vintagePhotoboothTiming = document.querySelector('input[name="vintage-photobooth-timing"]:checked');
    if (vintagePhotoboothTiming) {
        formData['vintage-photobooth-timing'] = vintagePhotoboothTiming.value;
    }

    // Save third party services
    const thirdPartyServices = [];
    document.querySelectorAll('.third-party-service').forEach(serviceDiv => {
        const serviceId = serviceDiv.getAttribute('data-service-id');
        const serviceData = {
            id: serviceId,
            type: document.getElementById(`service-type-${serviceId}`)?.value || '',
            company: document.getElementById(`service-company-${serviceId}`)?.value || '',
            startTime: document.getElementById(`service-start-time-${serviceId}`)?.value || ''
        };
        thirdPartyServices.push(serviceData);
    });
    formData['third-party-services'] = thirdPartyServices;
    formData['third-party-service-counter'] = serviceCounter;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    console.log('Page 9 data saved:', formData);
}

function loadSavedData() {
    console.log('Loading saved data for Page 9...');
    
    const formData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    
    // Load additional services
    if (formData['additional-services']) {
        const radio = document.querySelector(`input[name="additional-services"][value="${formData['additional-services']}"]`);
        if (radio) radio.checked = true;
    }

    // Load venue services checkboxes
    const venueServiceCheckboxes = [
        'venue-service-welcome-drinks',
        'venue-service-nikkah-partition',
        'venue-service-low-fog',
        'venue-service-sparklers',
        'venue-service-pancake-cart',
        'venue-service-360-booth',
        'venue-service-vintage-photobooth'
    ];

    venueServiceCheckboxes.forEach(name => {
        const checkbox = document.querySelector(`input[name="${name}"]`);
        if (checkbox && formData[name]) {
            checkbox.checked = true;
            checkbox.dispatchEvent(new Event('change'));
        }
    });

    // Load timing options
    if (formData['pancake-cart-timing']) {
        const radio = document.querySelector(`input[name="pancake-cart-timing"][value="${formData['pancake-cart-timing']}"]`);
        if (radio) radio.checked = true;
    }

    if (formData['booth-360-timing']) {
        const radio = document.querySelector(`input[name="booth-360-timing"][value="${formData['booth-360-timing']}"]`);
        if (radio) radio.checked = true;
    }

    if (formData['vintage-photobooth-timing']) {
        const radio = document.querySelector(`input[name="vintage-photobooth-timing"][value="${formData['vintage-photobooth-timing']}"]`);
        if (radio) radio.checked = true;
    }

    // Load third party services
    if (formData['third-party-services'] && Array.isArray(formData['third-party-services'])) {
        formData['third-party-services'].forEach(service => {
            serviceCounter = parseInt(service.id);
            addThirdPartyService();
            
            document.getElementById(`service-type-${service.id}`).value = service.type || '';
            document.getElementById(`service-company-${service.id}`).value = service.company || '';
            document.getElementById(`service-start-time-${service.id}`).value = service.startTime || '';
        });
    }

    if (formData['third-party-service-counter']) {
        serviceCounter = formData['third-party-service-counter'];
    }

    console.log('Page 9 data loaded');
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
