/**
 * Amington Hall - Staff Itinerary Generator
 * Automated document creation from form submissions
 * 
 * Setup Instructions:
 * 1. Create a new Google Apps Script project
 * 2. Copy this code into Code.gs
 * 3. Update TEMPLATE_DOC_ID with your template document ID
 * 4. Update OUTPUT_FOLDER_ID with your destination folder ID
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
 * Gets configuration from Script Properties
 * Set these in Project Settings > Script Properties:
 * - TEMPLATE_WALIMA: Document ID for Walima events
 * - TEMPLATE_NIKKAH: Document ID for Nikkah events
 * - TEMPLATE_JOINT: Document ID for Joint Day events
 * - OUTPUT_FOLDER_ID: Folder ID where generated documents will be saved
 */
function getTemplateIds() {
  const scriptProperties = PropertiesService.getScriptProperties();
  return {
    WALIMA: scriptProperties.getProperty('TEMPLATE_WALIMA') || '1l5nuot7quE3jYdzuGgBbVpgvQhwW3PMl',
    NIKKAH: scriptProperties.getProperty('TEMPLATE_NIKKAH') || '',
    JOINT: scriptProperties.getProperty('TEMPLATE_JOINT') || ''
  };
}

/**
 * Gets output folder ID from Script Properties
 */
function getOutputFolderId() {
  const scriptProperties = PropertiesService.getScriptProperties();
  return scriptProperties.getProperty('OUTPUT_FOLDER_ID') || '';
}

// ============================================================================
// WEB APP ENDPOINT
// ============================================================================

/**
 * Handles POST requests from the form submission
 * Returns immediately with 200 response, processes document asynchronously
 */
function doPost(e) {
  try {
    // Parse the incoming data
    const formData = JSON.parse(e.postData.contents);
    
    // Start async document creation (using trigger)
    createStaffItineraryAsync(formData);
    
    // Return immediate success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Form submitted successfully. Document is being generated.'
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
 * Processes document creation asynchronously
 */
function createStaffItineraryAsync(formData) {
  try {
    const docUrl = createStaffItinerary(formData);
    Logger.log('Document created successfully: ' + docUrl);
    
    // Optionally send email notification here
    // sendEmailNotification(formData, docUrl);
    
  } catch (error) {
    Logger.log('Error in async document creation: ' + error.toString());
    Logger.log('Form data: ' + JSON.stringify(formData));
  }
}

/**
 * Step 1: Test permissions (run this FIRST!)
 */
function testPermissions() {
  try {
    Logger.log('Testing Drive access...');
    const templateDocId = getTemplateDocId('Walima'); // Test with Walima template
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
    'dancefloor': 'Yes'
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
    // Get the appropriate template based on event type
    const eventType = formData['event-type'] || 'Walima';
    const templateDocId = getTemplateDocId(eventType);
    
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
    
    // MPC Information
    '{{mpcName}}': data['primary-contact-name'] || '',
    '{{mpcRelationship}}': data['primary-contact-relationship'] || '',
    '{{mpcPhone}}': formatPhone(data['primary-contact-phone-prefix'], data['primary-contact-phone']),
    
    // Guest & Table Information
    '{{guestCount}}': data['guest-count'] || '',
    '{{guestTables}}': calculateTables(data['guest-count']),
    
    // Venue Setup - Suite Section
    '{{reservedTablesLHS}}': getReservedTablesLHS(data),
    '{{reservedTablesRHS}}': getReservedTablesRHS(data),
    '{{extraTableInfo}}': getExtraTableInfo(data),
    '{{cclgFavoursInfo}}': getCCLGFavoursInfo(data),
    '{{headTableInfo}}': getHeadTableInfo(data),
    '{{cakeTableInfo}}': getCakeTableInfo(data),
    '{{decorStage}}': getDecorStage(data),
    '{{decorCentrepieces}}': getDecorCentrepieces(data),
    '{{decorWalkway}}': getDecorWalkway(data),
    
    // Venue Setup - Serenity Suite Section
    '{{serenityGuestTables}}': getSerenityGuestTables(data),
    '{{serenityGuestCount}}': getSerenityGuestCount(data),
    '{{serenityReservedTablesLeft}}': getSerenityReservedLeft(data),
    '{{serenityReservedTablesRight}}': getSerenityReservedRight(data),
    
    // Venue Setup - Foyer
    '{{foyerNendraTable}}': data['table-nendra'] ? 'Nendra table?' : 'No Nendra',
    
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
    '{{externalVendors}}': buildExternalVendors(data)
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
 * Gets event time, handling "Other" option
 */
function getEventTime(data) {
  if (data['event-timings'] === 'Other' && data['event-timings-other']) {
    return data['event-timings-other'];
  }
  return data['event-timings'] || '';
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
  if (data['table-nendra']) {
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
  
  // Check if custom decor company
  if (data['decor-company-name']) {
    info += ` ${data['decor-company-name']}`;
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
  if (data['table-nendra']) {
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
    services.push('| Dancefloor | Setup required |');
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
    const tiers = data['cake-tiers'] ? ` – ${data['cake-tiers']} tiers` : '';
    vendors.push(`|  | Cake | ${cakeCompany}${contact ? ' – ' + contact : ''}${phone ? ' - ' + phone : ''}${tiers} |  |`);
  }
  
  // Decor (external)
  if (data['decor-company-name']) {
    const company = data['decor-company-name'];
    const contact = data['decor-contact-name'] || '';
    const phone = formatPhone(data['decor-contact-number-prefix'], data['decor-contact-number']);
    vendors.push(`|  | Decor | ${company}${contact ? ' – ' + contact : ''}${phone ? ' - ' + phone : ''} |  |`);
  }
  
  // Special effects (external)
  if (data['special-effects-company']) {
    const company = data['special-effects-company'];
    const phone = formatPhone(data['special-effects-contact-prefix'], data['special-effects-contact']);
    vendors.push(`|  | Special Effects | ${company}${phone ? ' - ' + phone : ''} |  |`);
  }
  
  // Add placeholder for caterer (not in form)
  vendors.push('|  | Caterer |  |  |');
  vendors.push('|  | Table Drinks |  |  |');
  
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
    return `CCLG & Favours?\n\t${data['favours-type']}`;
  }
  if (data['favours'] === 'Yes') {
    return 'CCLG & Favours?';
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
  if (data['decor-company-name']) {
    return data['decor-company-name'];
  }
  return 'Standard';
}

/**
 * Gets decor centrepieces information
 */
function getDecorCentrepieces(data) {
  if (data['decor-company-name']) {
    return 'Custom';
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
  if (data['decor-company-name']) {
    return 'Custom';
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
 * Gets cake vendor notes
 */
function getVendorCakeNotes(data) {
  const tiers = data['cake-tiers'];
  if (!tiers) return '';
  return `${tiers} tiers`;
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
  if (data['decor-company-name']) {
    return 'Decor';
  }
  return '';
}

/**
 * Gets Extra 2 company (Decor)
 */
function getVendorExtra2Company(data) {
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
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Gets the appropriate template document ID based on event type
 */
function getTemplateDocId(eventType) {
  const templates = getTemplateIds();
  
  switch(eventType) {
    case 'Walima':
      return templates.WALIMA;
    case 'Nikkah':
      if (!templates.NIKKAH) {
        Logger.log('Warning: TEMPLATE_NIKKAH not set in Script Properties, using Walima template');
        return templates.WALIMA;
      }
      return templates.NIKKAH;
    case 'Joint Day':
      if (!templates.JOINT) {
        Logger.log('Warning: TEMPLATE_JOINT not set in Script Properties, using Walima template');
        return templates.WALIMA;
      }
      return templates.JOINT;
    default:
      Logger.log('Warning: Unknown event type "' + eventType + '", using Walima template');
      return templates.WALIMA;
  }
}

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
