// Page 6 - LED/LCD Screen JavaScript
const STORAGE_KEY = 'amington-hall-form-data';

document.addEventListener('DOMContentLoaded', function() {
    loadSavedData();
    setupEventListeners();
});

function setupEventListeners() {
    const form = document.getElementById('page6-form');
    const prevBtn = document.getElementById('prev-btn');
    const saveBtn = document.getElementById('save-btn');
    const restartBtn = document.getElementById('restart-btn');

    // Form submission (Next button)
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveFormData();
        window.location.href = 'page7.html';
    });

    // Previous button
    prevBtn.addEventListener('click', function() {
        saveFormData();
        window.location.href = 'page5.html';
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

function saveFormData() {
    const formData = getStoredData() || {};
    
    // Save text, number, tel, email inputs and textareas
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
    if (!savedData) {
        console.log('No saved data found');
        return;
    }
    
    console.log('Loading saved data:', savedData);
    
    // Load all inputs
    Object.keys(savedData).forEach(key => {
        const element = document.getElementById(key);
        if (element && element.type !== 'radio') {
            element.value = savedData[key];
        }
    });
    
    // Load radio buttons
    Object.keys(savedData).forEach(key => {
        const radio = document.querySelector(`input[name="${key}"][value="${savedData[key]}"]`);
        if (radio) {
            radio.checked = true;
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
