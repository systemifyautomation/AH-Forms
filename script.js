// Amington Hall Wedding Form - JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('wedding-inquiry-form');
    
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Collect form data
            const formData = new FormData(form);
            const data = {};
            
            formData.forEach((value, key) => {
                data[key] = value;
            });
            
            // Display success message
            alert('Thank you for your inquiry! The Amington Hall team will contact you soon.');
            
            // Optionally reset the form
            form.reset();
        });
    }
});
