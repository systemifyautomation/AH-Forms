// Form Field to Question Text Mapping
// Maps internal field names to human-readable question text for API submission

const FIELD_TO_QUESTION_MAPPING = {
    // Page 1 - Event Details
    'client-name': 'Name of Client',
    'groom-name': "Groom's Name",
    'bride-name': "Bride's Name",
    'ethnicity': 'Ethnicity / Cultural Background',
    'event-date': 'Date of the Event',
    'event-type': 'Event Type',
    'walkthrough-date': 'Date of your Walkthrough',
    'event-timings': 'Event Timings',
    'event-timings-allday': 'Event Timings - All day',
    'event-timings-other': 'Event Timings - Other',
    
    // Page 2 - Key Contacts
    'primary-contact-name': 'Name of First Main Point of Contact',
    'primary-contact-phone': 'Phone Number of First Main Point of Contact',
    'primary-contact-phone-prefix': 'Phone Number of First Main Point of Contact - Prefix',
    'primary-contact-relationship': 'Relationship of First Main Point of Contact with the Bride/Groom',
    'secondary-contact-name': 'Name of Second Main Point of Contact',
    'secondary-contact-phone': 'Phone Number of Second Main Point of Contact',
    'secondary-contact-phone-prefix': 'Phone Number of Second Main Point of Contact - Prefix',
    'secondary-contact-relationship': 'Relationship of Second Main Point of Contact with the Bride/Groom',
    
    // Page 3 - Seating and Hall Arrangements
    'suite-hired': 'Suite(s) Hired',
    'guest-count': 'How many guests?',
    'table-type': 'Types of tables – Applies to front tables only',
    'guest-arrangements': 'Guest Arrangements',
    'male-guests': 'How many guests will you have in the groom\'s section?',
    'female-guests': 'How many guests will you have in the bride\'s section?',
    'reserved-seatings': 'How many Reserved Seatings?',
    'table-plan': 'Have you got a table plan by chance?',
    'tables': 'Tables',
    'table-nendra': 'Nendra Table',
    'table-gift': 'Gift Table',
    'table-drink': 'Drink Station',
    'table-other': 'Other Table',
    'table-other-text': 'Other Table - Please specify',
    
    // Page 4 - Décor
    'decor-provider': 'Which of the following will you be having for your event?',
    'decor-company-name': 'Décor Company Name',
    'decor-contact-name': 'Contact Name',
    'decor-contact-number': 'Contact Number',
    'decor-contact-number-prefix': 'Contact Number - Prefix',
    'decor-contact-email': 'Contact Email',
    'decor-description': 'Décor Plans',
    
    // Page 5 - Vendors
    'photographer': 'Photography',
    'photographer-company-name': 'Company Name',
    'photographer-contact-name': 'Contact Name',
    'photographer-contact-number': 'Contact Number',
    'photographer-contact-number-prefix': 'Contact Number - Prefix',
    'videographer': 'Videography',
    'videographer-company-name': 'Company Name',
    'videographer-contact-name': 'Contact Name',
    'videographer-contact-number': 'Contact Number',
    'videographer-contact-number-prefix': 'Contact Number - Prefix',
    'sound-system': 'DJ or Sound System',
    'dj-name': 'DJ Name/Company',
    'dj-contact-number': 'DJ Contact Number',
    'dj-contact-number-prefix': 'DJ Contact Number - Prefix',
    
    // Page 6 - Additional Extras
    'dancefloor': 'Dancefloor',
    'dancefloor-type': 'Type',
    'dancefloor-size': 'Size',
    'wedding-cake': 'Wedding Cake',
    'cake-company-name': 'Cake Company Name',
    'cake-contact-name': 'Cake Contact Name',
    'cake-contact-number': 'Cake Contact Number',
    'cake-contact-number-prefix': 'Cake Contact Number - Prefix',
    'cake-tiers': 'Number of Tiers',
    'cake-served': 'Arrangements of the cake',
    'favours': 'Favours (CCLG)',
    'favours-type': 'Favours Type',
    'thankyou-cards': 'Thank you cards',
    'head-table': 'Head Table',
    'menu-cards': 'Menu Cards',
    'menu-cards-placement': 'Menu Cards Placement',
    'menu-cards-placement-other-text': 'Menu Cards Placement - Other',
    
    // Page 9 - Additional Services
    'additional-services': 'Additional Services',
    'venue-service-welcome-drinks': 'Welcome Drinks',
    'venue-service-nikkah-partition': 'Nikkah Partition',
    'venue-service-low-fog': 'Low Fog',
    'low-fog-timing': 'Low Fog Timing',
    'venue-service-sparklers': 'Sparklers',
    'sparklers-timing': 'Sparklers Timing',
    'venue-service-pancake-cart': 'Pancake Cart',
    'pancake-cart-timing': 'Pancake Cart Timing',
    'venue-service-360-booth': '360 Booth',
    'booth-360-timing': '360 Booth Timing',
    'venue-service-vintage-photobooth': 'Vintage Photobooth',
    'vintage-photobooth-timing': 'Vintage Photobooth Timing',
    'third-party-services': 'Third Party Services',
    
    // Page 10 - Catering
    'catering-company-name': 'Catering Company Name',
    'catering-contact-name': 'Catering Contact Name',
    'company-worked-before': 'Company Worked with Venue Before',
    'leftover-food-drinks': 'Leftover Food & Drinks',
    'leftover-containers': 'Leftover Containers',
    'drinks-provider': 'Drinks Provider',
    'drinks-third-party-name': 'Third Party Company Name',
    'drinks-third-party-contact': 'Third Party Contact',
    'drinks-third-party-contact-prefix': 'Third Party Contact - Prefix',
    'reception-drinks': 'Reception Drinks',
    'reception-drinks-supplier': 'Reception Drinks Supplier',
    'hot-drinks-supplier': 'Hot Drinks Supplier',
    'hot-drinks-contact-name': 'Hot Drinks Contact Name',
    'hot-drinks-contact-number': 'Hot Drinks Contact Number',
    'hot-drinks-contact-number-prefix': 'Hot Drinks Contact Number - Prefix',
    
    // Page 11 - Car Parking
    'vip-parking-passes': 'VIP Parking Passes',
    'priority-parking-section1': 'Priority Parking Section 1',
    'priority-parking-section2': 'Priority Parking Section 2',
    'total-priority-parking': 'Total Priority Parking',
    'parking-notes': 'Parking Notes'
};

/**
 * Transforms form data from field names to question text
 * @param {Object} fieldData - Data with field names as keys
 * @returns {Object} - Data with question text as keys
 */
function transformFieldsToQuestions(fieldData) {
    const questionData = {};
    
    for (const [fieldName, value] of Object.entries(fieldData)) {
        // Skip metadata fields
        if (fieldName === 'lastSaved' || fieldName === 'reminder-phone') {
            continue;
        }
        
        // Get question text from mapping
        const questionText = FIELD_TO_QUESTION_MAPPING[fieldName];
        
        if (questionText) {
            questionData[questionText] = value;
        } else {
            // If no mapping found, log warning and use original key
            console.warn('No question mapping found for field:', fieldName);
            questionData[fieldName] = value;
        }
    }
    
    return questionData;
}

/**
 * Converts boolean-like values to proper booleans and organizes arrays
 * @param {Object} data - Data to normalize
 * @returns {Object} - Normalized data
 */
function normalizeFormData(data) {
    const normalized = {};
    
    for (const [key, value] of Object.entries(data)) {
        // Convert checkbox strings to booleans
        if (value === 'on' || value === true) {
            normalized[key] = true;
        } else if (value === 'off' || value === false) {
            normalized[key] = false;
        } else if (Array.isArray(value)) {
            // Already an array
            normalized[key] = value;
        } else if (value === '' || value === null || value === undefined) {
            // Skip empty values
            continue;
        } else {
            // Keep as string
            normalized[key] = value;
        }
    }
    
    return normalized;
}

/**
 * Prepares form data for submission to API
 * @param {Object} fieldData - Raw form data with field names
 * @returns {Object} - Transformed and normalized data ready for API
 */
function prepareFormDataForSubmission(fieldData) {
    const normalized = normalizeFormData(fieldData);
    const questionData = transformFieldsToQuestions(normalized);
    return questionData;
}
