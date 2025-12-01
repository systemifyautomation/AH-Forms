// Amington Hall Wedding Form - JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('wedding-inquiry-form');
    
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Create success message element
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
            
            // Insert success message before the form
            form.parentNode.insertBefore(successMessage, form);
            
            // Hide the form
            form.style.display = 'none';
            
            // Scroll to success message
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }
});
