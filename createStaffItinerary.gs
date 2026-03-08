/**
 * Amington Hall - Staff Itinerary Generator
 * Automated document creation from form submissions
 * 
 * Setup Instructions:
 * 1. Create a new Google Apps Script project
 * 2. Copy this code into Code.gs
 * 3. Set TEMPLATE in Script Properties with your template document ID
 * 4. Set OUTPUT_FOLDER_ID in Script Properties with your destination folder ID
 * 5. Deploy as Web App with Execute as: Me, Access: Anyone
 * 6. Copy the web app URL to your form's APPSCRIPT_URL
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  DATE_FORMAT: 'EEEE d MMMM yyyy', // e.g., "Sunday 19 October 2025"
};

/**
 * Gets template document ID from Script Properties
 * Set these in Project Settings > Script Properties:
 * - TEMPLATE: Document ID for the staff itinerary template
 * - OUTPUT_FOLDER_ID: Folder ID where generated documents will be saved
 */
function getTemplateId() {
  const scriptProperties = PropertiesService.getScriptProperties();
  return scriptProperties.getProperty('TEMPLATE') || '1l5nuot7quE3jYdzuGgBbVpgvQhwW3PMl';
}

/**
 * Gets output folder ID from Script Properties
 */
function getOutputFolderId() {
  const scriptProperties = PropertiesService.getScriptProperties();
  return scriptProperties.getProperty('OUTPUT_FOLDER_ID') || '';
}

// ============================================================================
// QUESTION TO FIELD NAME MAPPING
// ============================================================================

/**
 * Maps question text to internal field names
 * This allows the form to send natural question text as keys
 */
const QUESTION_MAPPING = {
  // Page 1 - Event Details
  'Name of Client': 'client-name',
  "Groom's Name": 'groom-name',
  "Bride's Name": 'bride-name',
  'Ethnicity / Cultural Background': 'ethnicity',
  'Date of the Event': 'event-date',
  'Event Type': 'event-type',
  'Date of your Walkthrough': 'walkthrough-date',
  'Attendees': 'attendees',
  'Event Timings': 'event-timings',
  'Event Timings - All day': 'event-timings-allday',
  'Event Timings - Other': 'event-timings-other',
  
  // Page 2 - Key Contacts
  'Name of First Main Point of Contact': 'primary-contact-name',
  'Phone Number of First Main Point of Contact': 'primary-contact-phone',
  'Phone Number of First Main Point of Contact - Prefix': 'primary-contact-phone-prefix',
  'Relationship of First Main Point of Contact with the Bride/Groom': 'primary-contact-relationship',
  'Name of Second Main Point of Contact': 'secondary-contact-name',
  'Phone Number of Second Main Point of Contact': 'secondary-contact-phone',
  'Phone Number of Second Main Point of Contact - Prefix': 'secondary-contact-phone-prefix',
  'Relationship of Second Main Point of Contact with the Bride/Groom': 'secondary-contact-relationship',
  
  // Page 3 - Seating and Hall Arrangements
  'Suite(s) Hired': 'suite-hired',
  'How many guests?': 'guest-count',
  'Types of tables – Applies to front tables only': 'table-type',
  'Guest Arrangements': 'guest-arrangements',
  'How many guests will you have in the groom\'s section?': 'male-guests',
  'How many guests will you have in the bride\'s section?': 'female-guests',
  'How many Reserved Seatings?': 'reserved-seatings',
  'Have you got a table plan by chance?': 'table-plan',
  'Tables': 'tables',
  'Nendra Table': 'table-nendra',
  'Gift Table': 'table-gift',
  'Drink Station': 'table-drink',
  'Other Table': 'table-other',
  'Other Table - Please specify': 'table-other-text',
  
  // Page 4 - Décor
  'Which of the following will you be having for your event?': 'decor-provider',
  'Décor Company Name': 'decor-company-name',
  'Contact Name': 'decor-contact-name',
  'Contact Number': 'decor-contact-number',
  'Contact Number - Prefix': 'decor-contact-number-prefix',
  'Contact Email': 'decor-contact-email',
  'Décor Plans': 'decor-description',
  
  // Page 5 - Vendors
  'Photography': 'photographer',
  'Company Name': 'photographer-company-name',
  'Videography': 'videographer',
  'DJ or Sound System': 'sound-system',
  'DJ Name/Company': 'dj-name',
  'DJ Contact Number': 'dj-contact-number',
  'DJ Contact Number - Prefix': 'dj-contact-number-prefix',
  
  // Page 6 - Additional Extras
  'Dancefloor': 'dancefloor',
  'Type': 'dancefloor-type',
  'Size': 'dancefloor-size',
  'Wedding Cake': 'wedding-cake',
  'Cake Company Name': 'cake-company-name',
  'Cake Contact Name': 'cake-contact-name',
  'Cake Contact Number': 'cake-contact-number',
  'Cake Contact Number - Prefix': 'cake-contact-number-prefix',
  'Number of Tiers': 'cake-tiers',
  'Arrangements of the cake': 'cake-served',
  'Favours (CCLG)': 'favours',
  'Favours Type': 'favours-type',
  'Head Table': 'head-table',
  'Menu Cards': 'menu-cards',
  'Menu Cards Placement': 'menu-cards-placement',
  'Menu Cards Placement - Other': 'menu-cards-placement-other-text',
  
  // Page 9 - Additional Services
  'Additional Services': 'additional-services',
  'Welcome Drinks': 'venue-service-welcome-drinks',
  'Nikkah Partition': 'venue-service-nikkah-partition',
  'Low Fog': 'venue-service-low-fog',
  'Low Fog Timing': 'low-fog-timing',
  'Sparklers': 'venue-service-sparklers',
  'Sparklers Timing': 'sparklers-timing',
  'Pancake Cart': 'venue-service-pancake-cart',
  'Pancake Cart Timing': 'pancake-cart-timing',
  '360 Booth': 'venue-service-360-booth',
  '360 Booth Timing': 'booth-360-timing',
  'Vintage Photobooth': 'venue-service-vintage-photobooth',
  'Vintage Photobooth Timing': 'vintage-photobooth-timing',
  'Third Party Services': 'third-party-services',
  
  // Page 10 - Catering
  'Catering Company Name': 'catering-company-name',
  'Catering Contact Name': 'catering-contact-name',
  'Company Worked with Venue Before': 'company-worked-before',
  'Leftover Food & Drinks': 'leftover-food-drinks',
  'Leftover Containers': 'leftover-containers',
  'Drinks Provider': 'drinks-provider',
  'Third Party Company Name': 'drinks-third-party-name',
  'Third Party Contact': 'drinks-third-party-contact',
  'Third Party Contact - Prefix': 'drinks-third-party-contact-prefix',
  'Reception Drinks': 'reception-drinks',
  'Reception Drinks Supplier': 'reception-drinks-supplier',
  'Hot Drinks Supplier': 'hot-drinks-supplier',
  'Hot Drinks Contact Name': 'hot-drinks-contact-name',
  'Hot Drinks Contact Number': 'hot-drinks-contact-number',
  'Hot Drinks Contact Number - Prefix': 'hot-drinks-contact-number-prefix',
  
  // LCD/LED Screens
  'Amington Wall Screen': 'amington-wall-screen',
  'Serenity Wall Screen': 'serenity-wall-screen',
  'Foyer Screen': 'foyer-screen',
  'Screen Details': 'screen-details',

  // Page 11 - Car Parking
  'VIP Parking Passes': 'vip-parking-passes',
  'Priority Parking Section 1': 'priority-parking-section1',
  'Priority Parking Section 2': 'priority-parking-section2',
  'Total Priority Parking': 'total-priority-parking',
  'Parking Notes': 'parking-notes'
};

/**
 * Transforms form data from question-text keys to field-name keys
 * @param {Object} questionData - Data with question text as keys
 * @returns {Object} - Data with field names as keys
 */
function transformQuestionData(questionData) {
  const fieldData = {};
  
  for (const [question, value] of Object.entries(questionData)) {
    const fieldName = QUESTION_MAPPING[question];
    
    if (fieldName) {
      // Map question to field name
      fieldData[fieldName] = value;
    } else {
      // If no mapping found, log warning and use original key
      Logger.log('Warning: No mapping found for question: ' + question);
      fieldData[question] = value;
    }
  }
  
  return fieldData;
}

// ============================================================================
// WEB APP ENDPOINT
// ============================================================================

/**
 * Handles POST requests from the form submission
 * Returns immediately with 200 response, schedules document creation for later
 * 
 * IMPORTANT: This requires a permanent time-based trigger installed manually.
 * See SETUP-TRIGGER-INSTRUCTIONS.md for setup steps.
 */
function doPost(e) {
  try {
    // Parse the incoming data (with question text as keys)
    const questionData = JSON.parse(e.postData.contents);
    
    // Transform from question text to field names
    const formData = transformQuestionData(questionData);
    
    // Store form data in Script Properties for the permanent trigger to process
    const timestamp = new Date().getTime();
    const dataKey = 'pending_' + timestamp;
    PropertiesService.getScriptProperties().setProperty(dataKey, JSON.stringify(formData));
    
    Logger.log('Form data stored with key: ' + dataKey);
    Logger.log('Client: ' + formData['client-name'] + ', Event: ' + formData['event-type']);
    
    // Return INSTANT success response
    // A permanent trigger running every minute will process this
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Form submitted successfully. Document will be generated shortly.',
      timestamp: timestamp
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString(),
      message: 'Failed to submit form'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Processes all scheduled documents (called by permanent time-based trigger)
 * This function should be triggered every minute by a manually installed trigger
 * See SETUP-TRIGGER-INSTRUCTIONS.md for setup steps
 */
function processScheduledDocuments() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const allProperties = scriptProperties.getProperties();
  
  let processedCount = 0;
  let errorCount = 0;
  
  // Find all pending documents
  for (const [key, value] of Object.entries(allProperties)) {
    if (key.startsWith('pending_')) {
      try {
        const formData = JSON.parse(value);
        Logger.log('Processing: ' + key + ' - Client: ' + formData['client-name']);
        
        const docUrl = createStaffItinerary(formData);
        Logger.log('✓ Document created successfully: ' + docUrl);
        
        // Remove from pending after successful creation
        scriptProperties.deleteProperty(key);
        processedCount++;
        
        // Optionally send email notification here
        // sendEmailNotification(formData, docUrl);
        
      } catch (error) {
        errorCount++;
        Logger.log('✗ Error processing ' + key + ': ' + error.toString());
        Logger.log('Stack: ' + error.stack);
        
        // Check if item is too old (>24 hours) and remove it
        const timestamp = parseInt(key.replace('pending_', ''));
        const oneDayAgo = new Date().getTime() - (24 * 60 * 60 * 1000);
        
        if (timestamp < oneDayAgo) {
          Logger.log('Removing old failed item: ' + key);
          scriptProperties.deleteProperty(key);
        }
        // Otherwise keep the property for retry on next trigger
      }
    }
  }
  
  if (processedCount > 0 || errorCount > 0) {
    Logger.log('=== Summary: Processed ' + processedCount + ', Errors: ' + errorCount + ' ===');
  }
}

/**
 * Lists all active triggers (for debugging)
 * Run this manually to see your installed triggers
 */
function listTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  Logger.log('=== Active Triggers ===');
  
  if (triggers.length === 0) {
    Logger.log('No triggers installed.');
    Logger.log('You need to manually install a time-based trigger for processScheduledDocuments.');
    Logger.log('See SETUP-TRIGGER-INSTRUCTIONS.md for details.');
  } else {
    triggers.forEach((trigger, index) => {
      Logger.log((index + 1) + '. Function: ' + trigger.getHandlerFunction());
      Logger.log('   Event Type: ' + trigger.getEventType());
      Logger.log('   Trigger ID: ' + trigger.getUniqueId());
    });
  }
  
  Logger.log('======================');
}

/**
 * Step 1: Test permissions (run this FIRST!)
 */
function testPermissions() {
  try {
    Logger.log('Testing Drive access...');
    const templateDocId = getTemplateId();
    const templateDoc = DriveApp.getFileById(templateDocId);
    Logger.log('✓ Template found: ' + templateDoc.getName());
    
    Logger.log('Testing Document access...');
    const doc = DocumentApp.openById(templateDocId);
    Logger.log('✓ Can open template document');
    
    Logger.log('Testing folder access...');
    const outputFolderId = getOutputFolderId();
    if (outputFolderId) {
      const folder = DriveApp.getFolderById(outputFolderId);
      Logger.log('✓ Output folder found: ' + folder.getName());
    } else {
      Logger.log('⚠ OUTPUT_FOLDER_ID not set in Script Properties - will use template folder');
    }
    
    Logger.log('\n✓ All permissions OK! You can now run testSetup()');
    return true;
    
  } catch (error) {
    Logger.log('✗ Error: ' + error.toString());
    Logger.log('\nPlease check:');
    Logger.log('1. Template IDs are correct in CONFIG');
    Logger.log('2. You have access to the documents');
    Logger.log('3. You\'ve authorized the script (check the authorization popup)');
    return false;
  }
}

/**
 * Step 2: Test document creation (run testPermissions first!)
 */
function testSetup() {
  const testData = {
    // Basic Information
    'client-name': 'Test Client',
    'bride-name': 'Amara Khan',
    'groom-name': 'Zayn Ahmed',
    'event-date': '2025-12-25',
    'event-type': 'Walima',
    'event-timings': '6:30pm - 11pm',
    'event-timings-allday': '',
    'event-timings-other': '',
    'suite-hired': 'Both',
    'guest-count': '200',
    'guest-arrangements': 'Men & Women Segregation',
    
    // Primary Contact
    'primary-contact-name': 'Sarah Khan',
    'primary-contact-relationship': 'Sister of Bride',
    'primary-contact-phone-prefix': '+44',
    'primary-contact-phone': '7700900123',
    
    // Reserved Seating & Tables
    'reserved-seatings': '40',
    'table-gift': true,
    'table-drink': true,
    'table-nendra': true,
    'favours': 'Yes',
    'favours-type': 'CCLG on each table',
    'head-table': 'Yes',
    
    // Cake
    'wedding-cake': 'Yes',
    'cake-company-name': 'Sweet Sensations',
    'cake-contact-name': 'Emma Baker',
    'cake-contact-number-prefix': '+44',
    'cake-contact-number': '7700900456',
    'cake-tiers': '3',
    
    // Photography
    'photographer': 'Yes',
    'photographer-company-name': 'Lens & Light Studios',
    'photographer-contact-name': 'James Wilson',
    'photographer-contact-number-prefix': '+44',
    'photographer-contact-number': '7700900789',
    
    // Videography
    'videographer': 'Yes',
    'videographer-company-name': 'Motion Pictures Pro',
    'videographer-contact-name': 'Oliver Smith',
    'videographer-contact-number-prefix': '+44',
    'videographer-contact-number': '7700900321',
    
    // DJ
    'sound-system': 'DJ',
    'dj-name': 'DJ Khalid Productions',
    'dj-contact-number-prefix': '+44',
    'dj-contact-number': '7700900654',
    
    // Decor
    'decor-provider': 'Third Party',
    'decor-company-name': 'Royal Decorations Ltd',
    'decor-contact-name': 'Aisha Malik',
    'decor-contact-number-prefix': '+44',
    'decor-contact-number': '7700900987',
    'decor-description': 'Gold and white theme with floral centerpieces',
    
    // Special Effects (External)
    'special-effects-company': 'Spark & Shine Events',
    'special-effects-contact-prefix': '+44',
    'special-effects-contact': '7700900147',
    
    // In-house Special Effects
    'special-effects-type': 'Low fog',
    'special-effects-time': '8:30pm - Bride entrance',
    
    // Sweet Setups
    'sweet-setups-type': '360 Photo Booth',
    'sweet-setups-time': '7:00pm - 10:00pm',
    
    // Photobooth
    'photobooth-type': 'Premium Photo Booth',
    'photobooth-time': '7:30pm - 10:30pm',
    
    // Dancefloor
    'dancefloor': 'Yes',
    
    // Page 9 - Additional Services
    'additional-services': 'Yes',
    'venue-service-welcome-drinks': true,
    'venue-service-nikkah-partition': false,
    'venue-service-low-fog': true,
    'low-fog-timing': "Bride's Entrance",
    'venue-service-sparklers': true,
    'sparklers-timing': 'First Dance',
    'venue-service-pancake-cart': true,
    'pancake-cart-timing': 'Guest Arrival',
    'venue-service-360-booth': true,
    'booth-360-timing': 'After Food Service',
    'venue-service-vintage-photobooth': true,
    'vintage-photobooth-timing': 'Guest Arrival',
    'third-party-services': [
      {
        id: '1',
        type: 'Dessert Table',
        company: 'Sweet Treats Ltd - John Doe - +447700900111',
        startTime: '19:00'
      },
      {
        id: '2',
        type: 'Photobooth',
        company: 'Capture Moments - Jane Smith - +447700900222',
        startTime: '19:30'
      }
    ],
    
    // Page 10 - Catering
    'catering-company-name': 'Royal Caterers Ltd',
    'catering-contact-name': 'Ahmed Hassan',
    'company-worked-before': 'Yes',
    'leftover-food-drinks': 'Client',
    'leftover-containers': 'Caterer',
    'drinks-provider': 'Third Party Company',
    'drinks-third-party-name': 'Beverage Solutions',
    'drinks-third-party-contact-prefix': '+44',
    'drinks-third-party-contact': '7700900333',
    'reception-drinks': 'Yes',
    'reception-drinks-supplier': 'Amington Hall',
    'hot-drinks-supplier': 'Third Party Company',
    'hot-drinks-contact-name': 'Coffee Masters',
    'hot-drinks-contact-number-prefix': '+44',
    'hot-drinks-contact-number': '7700900444',
    
    // Page 11 - Car Parking
    'vip-parking-passes': '4',
    'priority-parking-section1': '10',
    'priority-parking-section2': '12',
    'total-priority-parking': '22',
    'parking-notes': 'Please reserve front row for VIP guests. Priority sections for elderly family members.'
  };
  
  const docUrl = createStaffItinerary(testData);
  Logger.log('Test document created: ' + docUrl);
  return docUrl;
}

// ============================================================================
// MAIN DOCUMENT CREATION
// ============================================================================

/**
 * Creates a Staff Itinerary document from form data
 */
function createStaffItinerary(formData) {
  try {
    // Get the template document ID
    const templateDocId = getTemplateId();
    
    // Make a copy of the template
    const templateDoc = DriveApp.getFileById(templateDocId);
    
    // Get output folder or use template's folder as fallback
    let folder;
    const outputFolderId = getOutputFolderId();
    if (outputFolderId) {
      folder = DriveApp.getFolderById(outputFolderId);
    } else {
      Logger.log('Warning: OUTPUT_FOLDER_ID not set in Script Properties. Using template folder.');
      folder = DriveApp.getFileById(templateDocId).getParents().next();
    }
    
    const fileName = `Staff Itinerary - ${formData['client-name']} - ${formData['event-date']}`;
    const newDoc = templateDoc.makeCopy(fileName, folder);
    const newDocId = newDoc.getId();
    
    Logger.log('Document copied, ID: ' + newDocId);
    
    // Try to open the document with retry logic (sometimes takes a moment)
    let doc;
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
      try {
        Utilities.sleep(1000 * (attempts + 1)); // Increasing delay: 1s, 2s, 3s, etc.
        doc = DocumentApp.openById(newDocId);
        Logger.log('Document opened successfully on attempt ' + (attempts + 1));
        break;
      } catch (e) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error('Could not open document after ' + maxAttempts + ' attempts. Document URL: ' + newDoc.getUrl() + '. Error: ' + e.toString());
        }
        Logger.log('Attempt ' + attempts + ' failed, retrying...');
      }
    }
    
    const body = doc.getBody();
    
    // Build all the variables
    const variables = buildVariables(formData);
    
    // Replace all variables in the document
    replaceAllVariables(body, variables);
    
    // Save and close
    doc.saveAndClose();
    
    Logger.log('Document created successfully: ' + newDoc.getUrl());
    return newDoc.getUrl();
    
  } catch (error) {
    Logger.log('Error details: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
    throw error;
  }
}

// ============================================================================
// VARIABLE CONSTRUCTION
// ============================================================================

/**
 * Builds all template variables from form data
 */
function buildVariables(data) {
  return {
    // Basic Information
    '{{clientName}}': data['client-name'] || '',
    '{{eventDate}}': formatEventDate(data['event-date']),
    '{{eventTime}}': getEventTime(data),
    '{{suite}}': data['suite-hired'] || '',
    '{{eventType}}': data['event-type'] || '',
    '{{seatingArrangement}}': data['guest-arrangements'] || '',
    '{{brideName}}': data['bride-name'] || '',
    '{{groomName}}': data['groom-name'] || '',
    '{{attendees}}': data['attendees'] ? `Attendees: ${data['attendees']}` : '',

    // MPC Information
    '{{mpcName}}': data['primary-contact-name'] || '',
    '{{mpcRelationship}}': data['primary-contact-relationship'] || '',
    '{{mpcPhone}}': formatPhone(data['primary-contact-phone-prefix'], data['primary-contact-phone']),
    
    // Guest & Table Information
    '{{guestCount}}': data['guest-count'] || '',
    '{{guestTables}}': calculateTables(data['guest-count']),
    
    // Venue Setup - Complete Sections
    '{{suiteSection}}': buildSuiteSection(data),
    '{{serenitySuiteSection}}': buildSerenitySuiteSection(data),
    '{{foyerNendraTable}}': (data['table-nendra'] === 'on' || data['table-nendra'] === true) ? 'Nendra table' : 'No Nendra',
    
    // Legacy individual variables (keeping for backward compatibility)
    '{{reservedTablesLHS}}': getReservedTablesLHS(data),
    '{{reservedTablesRHS}}': getReservedTablesRHS(data),
    '{{extraTableInfo}}': getExtraTableInfo(data),
    '{{cclgFavoursInfo}}': getCCLGFavoursInfo(data),
    '{{headTableInfo}}': getHeadTableInfo(data),
    '{{cakeTableInfo}}': getCakeTableInfo(data),
    '{{decorStage}}': getDecorStage(data),
    '{{decorCentrepieces}}': getDecorCentrepieces(data),
    '{{decorWalkway}}': getDecorWalkway(data),
    '{{serenityGuestTables}}': getSerenityGuestTables(data),
    '{{serenityGuestCount}}': getSerenityGuestCount(data),
    '{{serenityReservedTablesLeft}}': getSerenityReservedLeft(data),
    '{{serenityReservedTablesRight}}': getSerenityReservedRight(data),
    
    // External Vendors - Table Drinks
    '{{vendorTableDrinksETA}}': '',
    '{{vendorTableDrinksCompany}}': '',
    '{{vendorTableDrinksNotes}}': '',
    
    // External Vendors - Photography
    '{{vendorPhotographyETA}}': '',
    '{{vendorPhotographyCompany}}': getVendorPhotography(data),
    '{{vendorPhotographyNotes}}': '',
    
    // External Vendors - Caterer
    '{{vendorCatererETA}}': '',
    '{{vendorCatererCompany}}': '',
    '{{vendorCatererNotes}}': '',
    
    // External Vendors - Cake
    '{{vendorCakeETA}}': '',
    '{{vendorCakeCompany}}': getVendorCake(data),
    '{{vendorCakeNotes}}': getVendorCakeNotes(data),
    
    // External Vendors - DJ
    '{{vendorDJETA}}': '',
    '{{vendorDJCompany}}': getVendorDJ(data),
    '{{vendorDJNotes}}': '',
    
    // External Vendors - Extra 1 (Videography)
    '{{vendorExtra1ETA}}': '',
    '{{vendorExtra1Service}}': getVendorExtra1Service(data),
    '{{vendorExtra1Company}}': getVendorExtra1Company(data),
    '{{vendorExtra1Notes}}': '',
    
    // External Vendors - Extra 2 (Decor)
    '{{vendorExtra2ETA}}': '',
    '{{vendorExtra2Service}}': getVendorExtra2Service(data),
    '{{vendorExtra2Company}}': getVendorExtra2Company(data),
    '{{vendorExtra2Notes}}': '',
    
    // External Vendors - Extra 3 (Special Effects)
    '{{vendorExtra3ETA}}': '',
    '{{vendorExtra3Service}}': getVendorExtra3Service(data),
    '{{vendorExtra3Company}}': getVendorExtra3Company(data),
    '{{vendorExtra3Notes}}': '',
    
    // Constructed Sections (keeping for backward compatibility)
    '{{reservedTablesInfo}}': buildReservedTablesInfo(data),
    '{{extraTablesInfo}}': buildExtraTablesInfo(data),
    '{{headTableInfo}}': buildHeadTableInfo(data),
    '{{cakeTableInfo}}': buildCakeTableInfo(data),
    '{{decorInfo}}': buildDecorInfo(data),
    '{{foyerSetup}}': buildFoyerSetup(data),
    
    // Service Tables
    '{{inHouseServices}}': buildInHouseServices(data),
    '{{externalVendors}}': buildExternalVendors(data),
    
    // Page 9 - Additional Services
    '{{additionalServices}}': buildAdditionalServicesSection(data),
    '{{venueServices}}': buildVenueServicesSection(data),
    '{{thirdPartyServices}}': buildThirdPartyServicesSection(data),
    
    // Page 10 - Catering
    '{{cateringSection}}': buildCateringSection(data),
    '{{cateringCompany}}': getCateringCompany(data),
    '{{leftoverArrangements}}': getLeftoverArrangements(data),
    '{{drinksProvider}}': getDrinksProvider(data),
    '{{receptionDrinks}}': getReceptionDrinks(data),
    '{{hotDrinksSupplier}}': getHotDrinksSupplier(data),
    
    // Page 11 - Car Parking
    '{{parkingSection}}': buildParkingSection(data),
    '{{vipParkingPasses}}': data['vip-parking-passes'] || '0',
    '{{prioritySection1}}': data['priority-parking-section1'] || '0',
    '{{prioritySection2}}': data['priority-parking-section2'] || '0',
    '{{totalPriorityParking}}': data['total-priority-parking'] || '0',
    '{{parkingNotes}}': data['parking-notes'] || 'None',

    // Key Notes
    '{{keyNotes}}': buildKeyNotes(data),

    // LCD/LED Screens
    '{{lcdLedSection}}': buildLCDLEDSection(data)
  };
}

// ============================================================================
// FORMATTING FUNCTIONS
// ============================================================================

/**
 * Formats date to "Sunday 19 October 2025" format
 */
function formatEventDate(dateString) {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const formatted = date.toLocaleDateString('en-GB', options);
    
    // Add ordinal suffix (st, nd, rd, th) to day
    const day = date.getDate();
    const suffix = getOrdinalSuffix(day);
    return formatted.replace(day.toString(), day + suffix);
  } catch (e) {
    return dateString;
  }
}

/**
 * Gets ordinal suffix for a number (1st, 2nd, 3rd, 4th, etc.)
 */
function getOrdinalSuffix(num) {
  const j = num % 10;
  const k = num % 100;
  
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

/**
 * Gets event time, handling "Other" and "All day" options
 */
function getEventTime(data) {
  const timings = data['event-timings'] || '';
  
  if (timings === 'All day (6 Hours)' && data['event-timings-allday']) {
    return data['event-timings-allday'];
  }
  
  if (timings === 'Other' && data['event-timings-other']) {
    return data['event-timings-other'];
  }
  
  return timings;
}

/**
 * Formats phone number with country code
 */
function formatPhone(prefix, number) {
  if (!number) return '';
  const cleanPrefix = (prefix || '+44').replace(/\+/g, '');
  return number.startsWith('0') ? cleanPrefix + number.substring(1) : cleanPrefix + number;
}

/**
 * Calculates number of tables needed (guests / 10, rounded up)
 */
function calculateTables(guestCount) {
  if (!guestCount) return '';
  return Math.ceil(parseInt(guestCount) / 10).toString();
}

// ============================================================================
// SECTION BUILDERS
// ============================================================================

/**
 * Builds complete Suite section with proper formatting
 */
function buildSuiteSection(data) {
  const suiteHired = data['suite-hired'] || '';

  // Only show suite section if Amington Suite or Both are hired
  if (suiteHired !== 'Amington Suite' && suiteHired !== 'Both') {
    return '';
  }

  let section = 'Suite';

  // Guest tables
  const guestCount = parseInt(data['guest-count']) || 0;
  const guestTables = calculateTables(data['guest-count']);

  if (suiteHired === 'Both') {
    // If segregation is selected and men/women counts are provided, show split
    if (data['guest-arrangements'] === 'Men & Women Segregation' && data['men-count'] && data['women-count']) {
      const menCount = parseInt(data['men-count']) || 0;
      const womenCount = parseInt(data['women-count']) || 0;
      const menTables = Math.ceil(menCount / 10);
      const womenTables = Math.ceil(womenCount / 10);
      section += `\nGuest tables:\n\t${menTables} round tables of 10 = ${menCount} seats (Men)\n\t${womenTables} round tables of 10 = ${womenCount} seats (Women)`;
    } else {
      // Split guests evenly between suites
      const halfGuests = Math.ceil(guestCount / 2);
      const halfTables = Math.ceil(halfGuests / 10);
      section += `\nGuest tables:\n\t${halfTables} round tables of 10 = ${halfGuests} seats`;
    }
  } else {
    section += `\nGuest tables:\n\t${guestTables} round tables of 10 = ${guestCount} seats`;
  }

  // Reserved tables
  const groomReserved = parseInt(data['reserved-tables-groom']) || 0;
  const brideReserved = parseInt(data['reserved-tables-bride']) || 0;
  const reservedCount = groomReserved + brideReserved || parseInt(data['reserved-seatings']) || 0;
  if (reservedCount > 0) {
    section += '\n\nReserved tables';

    if (data['guest-arrangements'] === 'Men & Women Segregation') {
      const tablesLHS = groomReserved || Math.ceil(reservedCount / 2 / 10);
      const tablesRHS = brideReserved || Math.ceil(reservedCount / 2 / 10);
      // VIP + Round Tables format
      if (data['table-type'] === 'VIP' && tablesLHS >= 1) {
        const remainingLHS = tablesLHS - 1;
        section += `\n\tGroom's side: 1 VIP table`;
        if (remainingLHS > 0) section += `\n\t${remainingLHS} Round tables on LHS of stage`;
      } else {
        section += `\n\t${tablesLHS} round tables on LHS of stage`;
      }
      if (data['table-type'] === 'VIP' && tablesRHS >= 1) {
        const remainingRHS = tablesRHS - 1;
        section += `\n\tBride's side: 1 VIP table`;
        if (remainingRHS > 0) section += `\n\t${remainingRHS} Round tables on RHS of stage`;
      } else {
        section += `\n\t${tablesRHS} round tables on RHS of stage`;
      }
    } else {
      const reservedTables = Math.ceil(reservedCount / 10);
      if (data['table-type'] === 'VIP' && reservedTables >= 1) {
        const remainingRoundTables = reservedTables - 1;
        section += `\n\t1 VIP table`;
        if (remainingRoundTables > 0) section += `\n\t${remainingRoundTables} Round tables`;
      } else {
        section += `\n\t${reservedTables} round tables`;
      }
    }
  }

  // Extra tables
  const extraTables = [];
  if (data['table-gift']) extraTables.push('6ft table for gifts – Envelope box on this table');
  if (data['table-drink']) extraTables.push('Drink station (6ft Rectangle table)');
  if (data['table-other-text']) extraTables.push(data['table-other-text']);

  if (extraTables.length > 0) {
    section += '\n\nExtra tables\n\t' + extraTables.join('\n\t');
  }

  // Type of favour (Changes 8 & 12)
  if (data['favours'] === 'Yes' && data['favours-type']) {
    section += `\n\nType of favour\n\t${data['favours-type']}`;
  } else if (data['favours'] === 'Yes') {
    section += '\n\nType of favour';
  } else if (data['favours'] === 'No') {
    section += '\n\nFavours – NO';
  }

  // Head table
  if (data['head-table'] === 'Yes') {
    section += '\n\nHead table - YES\n\t2 seater';
    if (data['guest-arrangements'] === 'Men & Women Segregation') {
      section += ' on RHS of stage';
    }
  } else {
    section += '\n\nHead table - NO';
  }

  // Cake table
  const hasWeddingCake = data['wedding-cake'] === 'Yes';
  const hasCakeCompany = data['cake-company'] || data['cake-company-name'];

  if (hasWeddingCake || hasCakeCompany) {
    section += '\n\nCake table - YES';
    if (data['guest-arrangements'] === 'Men & Women Segregation') {
      section += '\n\tOn LHS side of stage';
    }
  } else {
    section += '\n\nCake table - NO';
  }

  // Decor
  section += '\n\nDecor -';
  if (data['decor-provider'] === 'Third Party' && data['decor-company-name']) {
    section += `\n\tStage: ${data['decor-company-name']}`;
    section += '\n\tCentrepieces: Custom';
    section += '\n\tWalkway: Custom';
    if (data['decor-description']) {
      section += `\n\t${data['decor-description']}`;
    }
  } else if (data['decor-provider'] === 'Elegant Moments') {
    section += '\n\tStage: Elegant Moments';
    section += '\n\tCentrepieces: Elegant Moments';
    section += '\n\tWalkway: Elegant Moments';
    if (data['decor-description']) {
      section += `\n\t${data['decor-description']}`;
    }
  } else if (data['decor-provider'] === 'Humsafar Wedding Services') {
    section += '\n\tStage: Humsafar Wedding Services';
    section += '\n\tCentrepieces: Humsafar Wedding Services';
    section += '\n\tWalkway: Humsafar Wedding Services';
    if (data['decor-description']) {
      section += `\n\t${data['decor-description']}`;
    }
  } else {
    section += '\n\tStage: Standard';
    section += '\n\tCentrepieces: Standard';
    section += '\n\tWalkway: Standard';
  }

  return section;
}

/**
 * Builds complete Serenity Suite section with proper formatting
 */
function buildSerenitySuiteSection(data) {
  const suiteHired = data['suite-hired'] || '';

  // Only show Serenity section if Serenity Suite or Both are hired
  if (suiteHired !== 'Serenity Suite' && suiteHired !== 'Both') {
    return '';
  }

  let section = 'Serenity Suite';

  // Guest tables
  const guestCount = parseInt(data['guest-count']) || 0;

  if (suiteHired === 'Serenity Suite') {
    const guestTables = calculateTables(data['guest-count']);
    section += `\nGuest tables:\n\t${guestTables} round tables of 10 = ${guestCount} seats`;
  } else if (suiteHired === 'Both') {
    // If segregation is selected and men/women counts are provided, show split
    if (data['guest-arrangements'] === 'Men & Women Segregation' && data['men-count'] && data['women-count']) {
      const menCount = parseInt(data['men-count']) || 0;
      const womenCount = parseInt(data['women-count']) || 0;
      const menTables = Math.ceil(menCount / 10);
      const womenTables = Math.ceil(womenCount / 10);
      section += `\nGuest tables:\n\t${menTables} round tables of 10 = ${menCount} seats (Men)\n\t${womenTables} round tables of 10 = ${womenCount} seats (Women)`;
    } else {
      const halfGuests = Math.ceil(guestCount / 2);
      const halfTables = Math.ceil(halfGuests / 10);
      section += `\nGuest tables:\n\t${halfTables} round tables of 10 = ${halfGuests} seats`;
    }
  }

  // Reserved tables
  const groomReserved = parseInt(data['reserved-tables-groom']) || 0;
  const brideReserved = parseInt(data['reserved-tables-bride']) || 0;
  const reservedCount = groomReserved + brideReserved || parseInt(data['reserved-seatings']) || 0;
  if (reservedCount > 0) {
    section += '\n\nReserved tables';
    if (data['guest-arrangements'] === 'Men & Women Segregation') {
      const tablesLeft = groomReserved || Math.ceil(reservedCount / 2 / 10);
      const tablesRight = brideReserved || Math.ceil(reservedCount / 2 / 10);
      section += `\n\t${tablesLeft} round tables on left side of stage (Men)`;
      section += `\n\t${tablesRight} round tables on right side of stage (Women)`;
    } else {
      const tablesLeft = Math.ceil(reservedCount / 2 / 10);
      const tablesRight = Math.ceil(reservedCount / 2 / 10);
      section += `\n\t${tablesLeft} round tables on left side of stage`;
      section += `\n\t${tablesRight} round tables on right side of stage`;
    }
  }

  return section;
}

/**
 * Builds reserved tables information
 */
function buildReservedTablesInfo(data) {
  const reservedCount = parseInt(data['reserved-seatings']) || 0;
  if (reservedCount === 0) return '';
  
  let info = '\nReserved tables';
  
  // If segregated seating, show distribution
  if (data['guest-arrangements'] === 'Men & Women Segregation') {
    const menTables = Math.ceil(reservedCount / 2 / 10);
    const womenTables = Math.ceil(reservedCount / 2 / 10);
    info += `\n\t${menTables} round tables on LHS of stage – Grooms Side`;
    info += `\n\t${womenTables} round tables on RHS of stage – Brides Side`;
  } else {
    info += `\n\t${Math.ceil(reservedCount / 10)} reserved tables`;
  }
  
  return info;
}

/**
 * Builds extra tables information
 */
function buildExtraTablesInfo(data) {
  const extras = [];
  
  // Additional tables from page 5-new
  if (data['table-nendra'] === 'on' || data['table-nendra'] === true) {
    extras.push('Nendra Table (2 seater)');
  }
  if (data['table-gift']) {
    extras.push('6ft table for gifts – Envelope box on this table');
  }
  if (data['table-drink']) {
    extras.push('Drink station (6ft Rectangle table)');
  }
  if (data['table-other'] && data['table-other-text']) {
    extras.push(data['table-other-text']);
  }
  
  // Favours
  if (data['favours'] === 'Yes' || data['favours-type']) {
    const favourType = data['favours-type'] || 'CCLG & Favours';
    extras.push(favourType);
  }
  
  // Menu cards
  if (data['menu-cards'] === 'Yes' && data['menu-cards-placement']) {
    extras.push(`Menu cards – ${data['menu-cards-placement']}`);
  }
  
  if (extras.length === 0) return '';
  
  return '\nExtra tables\n\t' + extras.join('\n\t');
}

/**
 * Builds head table information
 */
function buildHeadTableInfo(data) {
  if (data['head-table'] !== 'Yes') {
    return '\nHead table - NO';
  }
  
  let info = '\nHead table - YES';
  info += '\n\t2 seater';
  
  // Add position if segregated
  if (data['guest-arrangements'] === 'Men & Women Segregation') {
    info += ' on RHS of stage';
  }
  
  return info;
}

/**
 * Builds cake table information
 */
function buildCakeTableInfo(data) {
  const hasWeddingCake = data['wedding-cake'] === 'Yes';
  const hasCakeCompany = data['cake-company'] || data['cake-company-name'];
  
  if (!hasWeddingCake && !hasCakeCompany) {
    return '\nCake table - NO';
  }
  
  let info = '\nCake table - YES';
  
  // Add position if segregated
  if (data['guest-arrangements'] === 'Men & Women Segregation') {
    info += '\n\tOn LHS side of stage';
  }
  
  return info;
}

/**
 * Builds decor information
 */
function buildDecorInfo(data) {
  let info = '\nDecor -';

  // Check decor provider
  if (data['decor-provider'] === 'Third Party' && data['decor-company-name']) {
    info += ` ${data['decor-company-name']}`;
    if (data['decor-description']) {
      info += `\n\t${data['decor-description']}`;
    }
  } else if (data['decor-provider'] === 'Elegant Moments') {
    info += '\n\tStage: Elegant Moments';
    info += '\n\tCentrepieces: Elegant Moments';
    if (data['suite-hired'] === 'Amington Suite' || data['suite-hired'] === 'Both') {
      info += '\n\tWalkway: Elegant Moments';
    }
    if (data['decor-description']) {
      info += `\n\t${data['decor-description']}`;
    }
  } else if (data['decor-provider'] === 'Humsafar Wedding Services') {
    info += '\n\tStage: Humsafar Wedding Services';
    info += '\n\tCentrepieces: Humsafar Wedding Services';
    if (data['suite-hired'] === 'Amington Suite' || data['suite-hired'] === 'Both') {
      info += '\n\tWalkway: Humsafar Wedding Services';
    }
    if (data['decor-description']) {
      info += `\n\t${data['decor-description']}`;
    }
  } else {
    // Standard decor
    info += '\n\tStage: Standard';
    info += '\n\tCentrepieces: Standard';

    // Walkway only for Amington Suite
    if (data['suite-hired'] === 'Amington Suite' || data['suite-hired'] === 'Both') {
      info += '\n\tWalkway: Standard';
    }
  }

  return info;
}

/**
 * Builds foyer setup information
 */
function buildFoyerSetup(data) {
  if (data['table-nendra'] === 'on' || data['table-nendra'] === true) {
    return 'Nendra table';
  }
  return 'No Nendra';
}

/**
 * Builds in-house services table rows
 */
function buildInHouseServices(data) {
  const services = [];
  
  // Welcome drinks (always add as placeholder)
  services.push('| Welcome drinks | Mango & Guava |');
  
  // Sound system
  if (data['sound-system']) {
    if (data['sound-system'] === 'In-house DJ') {
      services.push('| In-house DJ | BASSHEADS DJ |');
    } else if (data['sound-system'].includes('In – house sound system')) {
      services.push('| In house sound system | Nasheeds or Instrumentals |');
    }
  }
  
  // Special effects
  if (data['special-effects-type']) {
    const effectType = data['special-effects-type'];
    const effectTime = data['special-effects-time'] || '';
    services.push(`| ${effectType} | ${effectTime} |`);
  }
  
  // Sweet setups (360, pancakes, etc.)
  if (data['sweet-setups-type']) {
    const setupType = data['sweet-setups-type'];
    const setupTime = data['sweet-setups-time'] || '';
    services.push(`| ${setupType} | ${setupTime} |`);
  }
  
  // Photobooth
  if (data['photobooth-type']) {
    const boothType = data['photobooth-type'];
    const boothTime = data['photobooth-time'] || '';
    services.push(`| ${boothType} | ${boothTime} |`);
  }
  
  // Dancefloor
  if (data['dancefloor'] === 'Yes') {
    const dancefloorType = data['dancefloor-type'] || '';
    const dancefloorSize = data['dancefloor-size'] || '';
    let dancefloorInfo = 'Dancefloor';
    if (dancefloorType) dancefloorInfo += ` – ${dancefloorType}`;
    if (dancefloorSize) dancefloorInfo += ` (${dancefloorSize})`;
    services.push(`| ${dancefloorInfo} | Setup required |`);
  } else if (data['dancefloor'] === 'No') {
    services.push('| Dancefloor | N/A |');
  }

  // Reception drinks from Amington Hall
  if (data['reception-drinks'] === 'Yes' && data['reception-drinks-supplier'] === 'Amington Hall') {
    services.push('| Reception Drinks | Amington Hall |');
  }

  return services.join('\n');
}

/**
 * Builds external vendors table rows
 */
function buildExternalVendors(data) {
  const vendors = [];
  
  // Photography
  if (data['photographer'] === 'Yes' && data['photographer-company-name']) {
    const company = data['photographer-company-name'];
    const contact = data['photographer-contact-name'] || '';
    const phone = formatPhone(data['photographer-contact-number-prefix'], data['photographer-contact-number']);
    vendors.push(`|  | Photography | ${company}${contact ? ' – ' + contact : ''}${phone ? ' - ' + phone : ''} |  |`);
  }
  
  // Videography
  if (data['videographer'] === 'Yes' && data['videographer-company-name']) {
    const company = data['videographer-company-name'];
    const contact = data['videographer-contact-name'] || '';
    const phone = formatPhone(data['videographer-contact-number-prefix'], data['videographer-contact-number']);
    vendors.push(`|  | Videography | ${company}${contact ? ' – ' + contact : ''}${phone ? ' - ' + phone : ''} |  |`);
  }
  
  // DJ (external)
  if (data['sound-system'] === 'DJ' && data['dj-name']) {
    const name = data['dj-name'];
    const phone = formatPhone(data['dj-contact-number-prefix'], data['dj-contact-number']);
    vendors.push(`|  | DJ | ${name}${phone ? ' - ' + phone : ''} |  |`);
  }
  
  // Cake
  const cakeCompany = data['cake-company'] || data['cake-company-name'];
  if (cakeCompany) {
    const contact = data['cake-contact-name'] || '';
    const phone = formatPhone(data['cake-contact-number-prefix'], data['cake-contact-number']);
    const notes = getVendorCakeNotes(data);
    vendors.push(`|  | Cake | ${cakeCompany}${contact ? ' – ' + contact : ''}${phone ? ' - ' + phone : ''} | ${notes} |`);
  } else {
    vendors.push('|  | Cake | N/A |  |');
  }
  
  // Decor (external)
  if (data['decor-provider'] === 'Third Party' && data['decor-company-name']) {
    const company = data['decor-company-name'];
    const contact = data['decor-contact-name'] || '';
    const phone = formatPhone(data['decor-contact-number-prefix'], data['decor-contact-number']);
    vendors.push(`|  | Decor | ${company}${contact ? ' – ' + contact : ''}${phone ? ' - ' + phone : ''} |  |`);
  } else if (data['decor-provider'] === 'Elegant Moments') {
    vendors.push('|  | Decor | Elegant Moments (In-house) |  |');
  } else if (data['decor-provider'] === 'Humsafar Wedding Services') {
    vendors.push('|  | Decor | Humsafar Wedding Services (In-house) |  |');
  }

  // Special effects (external)
  if (data['special-effects-company']) {
    const company = data['special-effects-company'];
    const phone = formatPhone(data['special-effects-contact-prefix'], data['special-effects-contact']);
    vendors.push(`|  | Special Effects | ${company}${phone ? ' - ' + phone : ''} |  |`);
  }

  // Catering company
  const cateringCompany = data['catering-company-name'] || '';
  if (cateringCompany) {
    const cateringContact = data['catering-contact-name'] || '';
    vendors.push(`|  | Catering, Table Drinks | ${cateringCompany}${cateringContact ? ' - ' + cateringContact : ''} |  |`);
  } else {
    vendors.push('|  | Catering, Table Drinks |  |  |');
  }

  // Table drinks provider (if Client)
  if (data['drinks-provider'] === 'Client') {
    vendors.push('|  | Table Drinks | Client |  |');
  } else if (data['drinks-provider'] === 'Third Party Company' && data['drinks-third-party-name']) {
    const thirdPartyPhone = formatPhone(data['drinks-third-party-contact-prefix'], data['drinks-third-party-contact']);
    vendors.push(`|  | Table Drinks | ${data['drinks-third-party-name']}${thirdPartyPhone ? ' - ' + thirdPartyPhone : ''} |  |`);
  }

  // Reception drinks (if Client or Third Party)
  if (data['reception-drinks'] === 'Yes') {
    const supplier = data['reception-drinks-supplier'] || '';
    if (supplier === 'Client') {
      vendors.push('|  | Reception Drinks | Client |  |');
    } else if (supplier === 'Third Party') {
      vendors.push('|  | Reception Drinks | Third Party Company |  |');
    }
  }

  // Hot drinks (if Third Party)
  if (data['hot-drinks-supplier'] === 'Third Party Company') {
    const contactName = data['hot-drinks-contact-name'] || '';
    const phone = formatPhone(data['hot-drinks-contact-number-prefix'], data['hot-drinks-contact-number']);
    vendors.push(`|  | Hot Drinks | ${contactName}${phone ? ' - ' + phone : ''} |  |`);
  }

  return vendors.join('\n');
}

// ============================================================================
// DOCUMENT REPLACEMENT
// ============================================================================

/**
 * Replaces all variables in the document body
 */
function replaceAllVariables(body, variables) {
  // Replace each variable
  for (const [variable, value] of Object.entries(variables)) {
    body.replaceText(escapeRegExp(variable), value);
  }
}

/**
 * Escapes special regex characters
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================================================
// VENUE SETUP HELPER FUNCTIONS
// ============================================================================

/**
 * Gets reserved tables count for LHS (Left Hand Side)
 */
function getReservedTablesLHS(data) {
  const reservedCount = parseInt(data['reserved-seatings']) || 0;
  if (reservedCount === 0) return 'X';
  
  if (data['guest-arrangements'] === 'Men & Women Segregation') {
    return Math.ceil(reservedCount / 2 / 10).toString();
  }
  return Math.ceil(reservedCount / 10).toString();
}

/**
 * Gets reserved tables count for RHS (Right Hand Side)
 */
function getReservedTablesRHS(data) {
  const reservedCount = parseInt(data['reserved-seatings']) || 0;
  if (reservedCount === 0) return 'X';
  
  if (data['guest-arrangements'] === 'Men & Women Segregation') {
    return Math.ceil(reservedCount / 2 / 10).toString();
  }
  return Math.ceil(reservedCount / 10).toString();
}

/**
 * Gets extra table purpose
 */
function getExtraTablePurpose(data) {
  if (data['table-gift']) return 'gifts';
  if (data['table-drink']) return 'drinks';
  if (data['table-other-text']) return data['table-other-text'];
  return '?';
}

/**
 * Gets extra table information with full formatting
 */
function getExtraTableInfo(data) {
  const extras = [];
  
  if (data['table-gift']) {
    extras.push('6ft table for gifts');
  }
  if (data['table-drink']) {
    extras.push('6ft table for drinks');
  }
  if (data['table-other-text']) {
    extras.push(`6ft table for ${data['table-other-text']}`);
  }
  
  return extras.length > 0 ? extras.join('\n\t') : 'None';
}

/**
 * Gets CCLG & Favours information
 */
function getCCLGFavoursInfo(data) {
  if (data['favours'] === 'Yes' && data['favours-type']) {
    return `Type of favour\n\t${data['favours-type']}`;
  }
  if (data['favours'] === 'Yes') {
    return 'Type of favour';
  }
  if (data['favours'] === 'No') {
    return 'Favours – NO';
  }
  return '';
}

/**
 * Gets head table information with full formatting
 */
function getHeadTableInfo(data) {
  if (data['head-table'] !== 'Yes') {
    return 'Head table - NO';
  }
  
  let info = 'Head table - YES\n\t2 seater';
  
  // Add position if segregated
  if (data['guest-arrangements'] === 'Men & Women Segregation') {
    info += ' on RHS of stage';
  }
  
  return info;
}

/**
 * Gets cake table information with full formatting
 */
function getCakeTableInfo(data) {
  const hasWeddingCake = data['wedding-cake'] === 'Yes';
  const hasCakeCompany = data['cake-company'] || data['cake-company-name'];
  
  if (!hasWeddingCake && !hasCakeCompany) {
    return 'Cake table - NO';
  }
  
  let info = 'Cake table - YES';
  
  // Add position if segregated
  if (data['guest-arrangements'] === 'Men & Women Segregation') {
    info += '\n\tOn LHS side of stage';
  }
  
  return info;
}

/**
 * Gets cake table yes/no
 */
function getCakeTableYesNo(data) {
  const hasWeddingCake = data['wedding-cake'] === 'Yes';
  const hasCakeCompany = data['cake-company'] || data['cake-company-name'];
  return (hasWeddingCake || hasCakeCompany) ? 'YES' : 'NO';
}

/**
 * Gets decor stage information
 */
function getDecorStage(data) {
  if (data['decor-provider'] === 'Third Party' && data['decor-company-name']) {
    return data['decor-company-name'];
  }
  if (data['decor-provider'] === 'Elegant Moments') {
    return 'Elegant Moments';
  }
  if (data['decor-provider'] === 'Humsafar Wedding Services') {
    return 'Humsafar Wedding Services';
  }
  return 'Standard';
}

/**
 * Gets decor centrepieces information
 */
function getDecorCentrepieces(data) {
  if (data['decor-provider'] === 'Third Party' && data['decor-company-name']) {
    return 'Custom';
  }
  if (data['decor-provider'] === 'Elegant Moments') {
    return 'Elegant Moments';
  }
  if (data['decor-provider'] === 'Humsafar Wedding Services') {
    return 'Humsafar Wedding Services';
  }
  return 'Standard';
}

/**
 * Gets decor walkway information
 */
function getDecorWalkway(data) {
  if (data['suite-hired'] !== 'Amington Suite' && data['suite-hired'] !== 'Both') {
    return 'N/A';
  }
  if (data['decor-provider'] === 'Third Party' && data['decor-company-name']) {
    return 'Custom';
  }
  if (data['decor-provider'] === 'Elegant Moments') {
    return 'Elegant Moments';
  }
  if (data['decor-provider'] === 'Humsafar Wedding Services') {
    return 'Humsafar Wedding Services';
  }
  return 'Standard';
}

/**
 * Gets Serenity Suite guest tables count
 */
function getSerenityGuestTables(data) {
  if (data['suite-hired'] === 'Serenity Suite') {
    return calculateTables(data['guest-count']);
  }
  if (data['suite-hired'] === 'Both') {
    const halfGuests = Math.ceil(parseInt(data['guest-count'] || 0) / 2);
    return calculateTables(halfGuests.toString());
  }
  return 'x';
}

/**
 * Gets Serenity Suite guest count
 */
function getSerenityGuestCount(data) {
  if (data['suite-hired'] === 'Serenity Suite') {
    return data['guest-count'] || '';
  }
  if (data['suite-hired'] === 'Both') {
    return Math.ceil(parseInt(data['guest-count'] || 0) / 2).toString();
  }
  return 'x';
}

/**
 * Gets Serenity Suite reserved tables left side
 */
function getSerenityReservedLeft(data) {
  if (data['suite-hired'] !== 'Serenity Suite' && data['suite-hired'] !== 'Both') {
    return 'X';
  }
  const reservedCount = parseInt(data['reserved-seatings']) || 0;
  if (reservedCount === 0) return 'X';
  return Math.ceil(reservedCount / 2 / 10).toString();
}

/**
 * Gets Serenity Suite reserved tables right side
 */
function getSerenityReservedRight(data) {
  if (data['suite-hired'] !== 'Serenity Suite' && data['suite-hired'] !== 'Both') {
    return 'X';
  }
  const reservedCount = parseInt(data['reserved-seatings']) || 0;
  if (reservedCount === 0) return 'X';
  return Math.ceil(reservedCount / 2 / 10).toString();
}

// ============================================================================
// EXTERNAL VENDORS HELPER FUNCTIONS
// ============================================================================

/**
 * Gets photography vendor info
 */
function getVendorPhotography(data) {
  if (data['photographer'] !== 'Yes') return '';
  
  const company = data['photographer-company-name'] || '';
  const contact = data['photographer-contact-name'] || '';
  const phone = formatPhone(data['photographer-contact-number-prefix'], data['photographer-contact-number']);
  
  let info = company;
  if (contact) info += ` – ${contact}`;
  if (phone) info += ` - ${phone}`;
  
  return info;
}

/**
 * Gets cake vendor info
 */
function getVendorCake(data) {
  const company = data['cake-company'] || data['cake-company-name'] || '';
  if (!company) return '';
  
  const contact = data['cake-contact-name'] || '';
  const phone = formatPhone(data['cake-contact-number-prefix'], data['cake-contact-number']);
  
  let info = company;
  if (contact) info += ` – ${contact}`;
  if (phone) info += ` - ${phone}`;
  
  return info;
}

/**
 * Gets cake vendor notes (includes tiers and arrangement)
 */
function getVendorCakeNotes(data) {
  const notes = [];
  if (data['cake-tiers']) {
    notes.push(`${data['cake-tiers']} tiers`);
  }
  if (data['cake-served']) {
    notes.push(data['cake-served']);
  }
  return notes.join(' – ');
}

/**
 * Gets DJ vendor info
 */
function getVendorDJ(data) {
  if (data['sound-system'] !== 'DJ') return '';
  
  const name = data['dj-name'] || '';
  const phone = formatPhone(data['dj-contact-number-prefix'], data['dj-contact-number']);
  
  let info = name;
  if (phone) info += ` - ${phone}`;
  
  return info;
}

/**
 * Gets Extra 1 service name (Videography)
 */
function getVendorExtra1Service(data) {
  if (data['videographer'] === 'Yes') {
    return 'Videography';
  }
  return '';
}

/**
 * Gets Extra 1 company (Videography)
 */
function getVendorExtra1Company(data) {
  if (data['videographer'] !== 'Yes') return '';
  
  const company = data['videographer-company-name'] || '';
  const contact = data['videographer-contact-name'] || '';
  const phone = formatPhone(data['videographer-contact-number-prefix'], data['videographer-contact-number']);
  
  let info = company;
  if (contact) info += ` – ${contact}`;
  if (phone) info += ` - ${phone}`;
  
  return info;
}

/**
 * Gets Extra 2 service name (Decor)
 */
function getVendorExtra2Service(data) {
  if (data['decor-provider'] === 'Third Party' && data['decor-company-name']) {
    return 'Decor';
  }
  if (data['decor-provider'] === 'Elegant Moments') {
    return 'Decor';
  }
  if (data['decor-provider'] === 'Humsafar Wedding Services') {
    return 'Decor';
  }
  return '';
}

/**
 * Gets Extra 2 company (Decor)
 */
function getVendorExtra2Company(data) {
  if (data['decor-provider'] === 'Elegant Moments') {
    return 'Elegant Moments (In-house décor company)';
  }
  if (data['decor-provider'] === 'Humsafar Wedding Services') {
    return 'Humsafar Wedding Services (In-house décor company)';
  }

  const company = data['decor-company-name'] || '';
  if (!company) return '';

  const contact = data['decor-contact-name'] || '';
  const phone = formatPhone(data['decor-contact-number-prefix'], data['decor-contact-number']);

  let info = company;
  if (contact) info += ` – ${contact}`;
  if (phone) info += ` - ${phone}`;

  return info;
}

/**
 * Gets Extra 3 service name (Special Effects)
 */
function getVendorExtra3Service(data) {
  if (data['special-effects-company']) {
    return 'Special Effects';
  }
  return '';
}

/**
 * Gets Extra 3 company (Special Effects)
 */
function getVendorExtra3Company(data) {
  const company = data['special-effects-company'] || '';
  if (!company) return '';
  
  const phone = formatPhone(data['special-effects-contact-prefix'], data['special-effects-contact']);
  
  let info = company;
  if (phone) info += ` - ${phone}`;
  
  return info;
}

// ============================================================================
// PAGE 9 - ADDITIONAL SERVICES BUILDER FUNCTIONS
// ============================================================================

/**
 * Builds complete Additional Services section
 */
function buildAdditionalServicesSection(data) {
  if (data['additional-services'] !== 'Yes') {
    return 'No additional services requested.';
  }
  
  let section = '';
  
  // Venue Services
  const venueServices = buildVenueServicesSection(data);
  if (venueServices) {
    section += 'Venue Services:\n' + venueServices + '\n\n';
  }
  
  // Third Party Services
  const thirdPartyServices = buildThirdPartyServicesSection(data);
  if (thirdPartyServices) {
    section += 'Third Party Service Providers:\n' + thirdPartyServices;
  }
  
  return section || 'Additional services selected but no details provided.';
}

/**
 * Builds Venue Services list
 */
function buildVenueServicesSection(data) {
  const services = [];
  
  if (data['venue-service-welcome-drinks']) {
    services.push('• Welcome Drinks');
  }
  
  if (data['venue-service-nikkah-partition']) {
    services.push('• Nikkah Partition');
  }
  
  if (data['venue-service-low-fog']) {
    const timing = data['low-fog-timing'] || 'Timing not specified';
    services.push(`• Low Fog – 1 Time use (${timing})`);
  }
  
  if (data['venue-service-sparklers']) {
    const timing = data['sparklers-timing'] || 'Timing not specified';
    services.push(`• Sparklers – 1 Time use (${timing})`);
  }
  
  if (data['venue-service-pancake-cart']) {
    const timing = data['pancake-cart-timing'] || 'Timing not specified';
    services.push(`• Pancake Cart – 2 Hour Service (${timing})`);
  }
  
  if (data['venue-service-360-booth']) {
    const timing = data['booth-360-timing'] || 'Timing not specified';
    services.push(`• 360 Booth – 2 Hour Service (${timing})`);
  }
  
  if (data['venue-service-vintage-photobooth']) {
    const timing = data['vintage-photobooth-timing'] || 'Timing not specified';
    services.push(`• Vintage Photobooth – 2 Hour Service (${timing})`);
  }
  
  return services.length > 0 ? services.join('\n') : '';
}

/**
 * Builds Third Party Services list
 */
function buildThirdPartyServicesSection(data) {
  const services = data['third-party-services'];
  
  if (!services || !Array.isArray(services) || services.length === 0) {
    return '';
  }
  
  const serviceLines = services.map(service => {
    let line = `• ${service.type || 'Service Type Not Specified'}`;
    if (service.company) {
      line += ` - ${service.company}`;
    }
    if (service.startTime) {
      line += ` - Start Time: ${service.startTime}`;
    }
    return line;
  });
  
  return serviceLines.join('\n');
}

// ============================================================================
// PAGE 10 - CATERING BUILDER FUNCTIONS
// ============================================================================

/**
 * Builds complete Catering section
 */
function buildCateringSection(data) {
  let section = '';
  
  // Catering Company
  const company = getCateringCompany(data);
  if (company) {
    section += 'Catering Company:\n' + company + '\n\n';
  }
  
  // Leftover Arrangements
  const leftover = getLeftoverArrangements(data);
  if (leftover) {
    section += 'Leftover Arrangements:\n' + leftover + '\n\n';
  }
  
  // Drinks Provider
  const drinks = getDrinksProvider(data);
  if (drinks) {
    section += 'Drinks Provider:\n' + drinks + '\n\n';
  }
  
  // Reception Drinks
  const reception = getReceptionDrinks(data);
  if (reception) {
    section += 'Reception Drinks:\n' + reception + '\n\n';
  }
  
  // Hot Drinks
  const hotDrinks = getHotDrinksSupplier(data);
  if (hotDrinks) {
    section += 'Hot Drinks Supplier:\n' + hotDrinks;
  }
  
  return section || 'No catering information provided.';
}

/**
 * Gets Catering Company information
 */
function getCateringCompany(data) {
  const companyName = data['catering-company-name'] || '';
  const contactName = data['catering-contact-name'] || '';
  const workedBefore = data['company-worked-before'] || '';
  
  if (!companyName) return '';
  
  let info = companyName;
  if (contactName) {
    info += ` - Contact: ${contactName}`;
  }
  if (workedBefore) {
    info += ` - Worked with venue before: ${workedBefore}`;
  }
  
  return info;
}

/**
 * Gets Leftover Arrangements information
 */
function getLeftoverArrangements(data) {
  const foodDrinks = data['leftover-food-drinks'] || '';
  const containers = data['leftover-containers'] || '';
  
  if (!foodDrinks && !containers) return '';
  
  let info = '';
  if (foodDrinks) {
    info += `• Leftover Food & Drinks: ${foodDrinks}`;
  }
  if (containers) {
    if (info) info += '\n';
    info += `• Leftover Containers: ${containers}`;
  }
  
  return info;
}

/**
 * Gets Drinks Provider information
 */
function getDrinksProvider(data) {
  const provider = data['drinks-provider'] || '';
  
  if (provider === 'Third Party Company') {
    const companyName = data['drinks-third-party-name'] || '';
    const phone = formatPhone(data['drinks-third-party-contact-prefix'], data['drinks-third-party-contact']);
    
    let info = 'Third Party Company';
    if (companyName) {
      info += ` - ${companyName}`;
    }
    if (phone) {
      info += ` - ${phone}`;
    }
    return info;
  }
  
  return provider || '';
}

/**
 * Gets Reception Drinks information
 */
function getReceptionDrinks(data) {
  const receptionDrinks = data['reception-drinks'] || '';
  
  if (receptionDrinks !== 'Yes') {
    return receptionDrinks === 'No' ? 'No reception drinks' : '';
  }
  
  const supplier = data['reception-drinks-supplier'] || 'Not specified';
  return `Yes - Supplier: ${supplier}`;
}

/**
 * Gets Hot Drinks Supplier information
 */
function getHotDrinksSupplier(data) {
  const supplier = data['hot-drinks-supplier'] || '';
  
  if (supplier === 'Third Party Company') {
    const contactName = data['hot-drinks-contact-name'] || '';
    const phone = formatPhone(data['hot-drinks-contact-number-prefix'], data['hot-drinks-contact-number']);
    
    let info = 'Third Party Company';
    if (contactName) {
      info += ` - ${contactName}`;
    }
    if (phone) {
      info += ` - ${phone}`;
    }
    return info;
  }
  
  return supplier || '';
}

// ============================================================================
// KEY NOTES BUILDER FUNCTION
// ============================================================================

/**
 * Builds Key Notes section from catering/operational data
 */
function buildKeyNotes(data) {
  const notes = [];

  // Has catering company worked with venue before
  if (data['company-worked-before']) {
    notes.push(`Catering Company worked at Amington Hall before: ${data['company-worked-before']}`);
  }

  // Leftover food
  if (data['leftover-food-drinks']) {
    notes.push(`Leftover Food & Drinks: ${data['leftover-food-drinks']}`);
  }

  // Leftover containers
  if (data['leftover-containers']) {
    notes.push(`Leftover Containers provided by: ${data['leftover-containers']}`);
  }

  return notes.length > 0 ? notes.join('\n') : '';
}

// ============================================================================
// LCD/LED SCREEN BUILDER FUNCTION
// ============================================================================

/**
 * Builds LCD/LED screen section
 */
function buildLCDLEDSection(data) {
  const suiteHired = data['suite-hired'] || '';
  const lines = [];

  // Amington Suite Wall Screen
  if (suiteHired === 'Amington Suite' || suiteHired === 'Both') {
    const amingtonScreen = data['amington-wall-screen'] || '';
    lines.push(`Amington Suite Wall Screen: ${amingtonScreen || 'NON'}`);
  }

  // Serenity Suite Wall Screen
  if (suiteHired === 'Serenity Suite' || suiteHired === 'Both') {
    const serenityScreen = data['serenity-wall-screen'] || '';
    lines.push(`Serenity Suite Wall Screen: ${serenityScreen || 'NON'}`);
  }

  // Foyer Screen
  const foyerScreen = data['foyer-screen'] || '';
  lines.push(`Foyer Screen: ${foyerScreen || 'NON'}`);

  // Screen details/description
  if (data['screen-details']) {
    lines.push(`Screen Details: ${data['screen-details']}`);
  }

  return lines.join('\n') || 'LED/LCD - NON';
}

// ============================================================================
// PAGE 11 - CAR PARKING BUILDER FUNCTIONS
// ============================================================================

/**
 * Builds complete Car Parking section
 */
function buildParkingSection(data) {
  const vip = data['vip-parking-passes'] || '0';
  const priority1 = data['priority-parking-section1'] || '0';
  const priority2 = data['priority-parking-section2'] || '0';
  const total = data['total-priority-parking'] || '0';
  const notes = data['parking-notes'] || '';
  
  let section = '';
  
  section += `VIP Parking Passes: ${vip}\n`;
  section += `Priority Parking Section 1: ${priority1}\n`;
  section += `Priority Parking Section 2: ${priority2}\n`;
  section += `Total Priority Parking: ${total}\n`;
  
  if (notes) {
    section += `\nParking Notes:\n${notes}`;
  }
  
  return section;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Logs formatted data for debugging
 */
function logFormData(data) {
  Logger.log('=== Form Data Received ===');
  for (const [key, value] of Object.entries(data)) {
    Logger.log(`${key}: ${value}`);
  }
  Logger.log('========================');
}

/**
 * Manual cleanup function - run this periodically to remove old pending items
 * or check pending items status
 */
function cleanupOldPendingItems() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const allProperties = scriptProperties.getProperties();
  const oneDayAgo = new Date().getTime() - (24 * 60 * 60 * 1000);
  
  let cleaned = 0;
  let pending = 0;
  
  Logger.log('=== Pending Items Status ===');
  
  for (const [key, value] of Object.entries(allProperties)) {
    if (key.startsWith('pending_')) {
      const timestamp = parseInt(key.replace('pending_', ''));
      const age = (new Date().getTime() - timestamp) / 1000 / 60; // minutes
      
      try {
        const formData = JSON.parse(value);
        Logger.log(key + ' - ' + formData['client-name'] + ' - Age: ' + Math.round(age) + ' minutes');
      } catch (e) {
        Logger.log(key + ' - Invalid data - Age: ' + Math.round(age) + ' minutes');
      }
      
      if (timestamp < oneDayAgo) {
        scriptProperties.deleteProperty(key);
        cleaned++;
        Logger.log('  → Deleted (too old)');
      } else {
        pending++;
      }
    }
  }
  
  Logger.log('============================');
  Logger.log('Pending: ' + pending + ', Cleaned: ' + cleaned);
}
