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
  TEMPLATE_DOC_ID: '1l5nuot7quE3jYdzuGgBbVpgvQhwW3PMl',
  OUTPUT_FOLDER_ID: 'YOUR_FOLDER_ID_HERE', // Update this!
  DATE_FORMAT: 'EEEE d MMMM yyyy', // e.g., "Sunday 19 October 2025"
};

// ============================================================================
// WEB APP ENDPOINT
// ============================================================================

/**
 * Handles POST requests from the form submission
 */
function doPost(e) {
  try {
    // Parse the incoming data
    const formData = JSON.parse(e.postData.contents);
    
    // Create the staff itinerary document
    const docUrl = createStaffItinerary(formData);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      documentUrl: docUrl,
      message: 'Staff Itinerary created successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString(),
      message: 'Failed to create Staff Itinerary'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test function to verify setup (run this first!)
 */
function testSetup() {
  const testData = {
    'client-name': 'Test Client',
    'bride-name': 'Test Bride',
    'groom-name': 'Test Groom',
    'event-date': '2025-12-25',
    'event-type': 'Walima',
    'event-timings': '6:30pm - 11pm',
    'suite-hired': 'Amington Suite',
    'guest-count': '150',
    'guest-arrangements': 'Mixed Family Seating',
    'primary-contact-name': 'Test MPC',
    'primary-contact-relationship': 'Sister',
    'primary-contact-phone-prefix': '+44',
    'primary-contact-phone': '7700900000'
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
  // Make a copy of the template
  const templateDoc = DriveApp.getFileById(CONFIG.TEMPLATE_DOC_ID);
  const folder = DriveApp.getFolderById(CONFIG.OUTPUT_FOLDER_ID);
  
  const fileName = `Staff Itinerary - ${formData['client-name']} - ${formData['event-date']}`;
  const newDoc = templateDoc.makeCopy(fileName, folder);
  const doc = DocumentApp.openById(newDoc.getId());
  const body = doc.getBody();
  
  // Build all the variables
  const variables = buildVariables(formData);
  
  // Replace all variables in the document
  replaceAllVariables(body, variables);
  
  // Save and close
  doc.saveAndClose();
  
  return newDoc.getUrl();
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
    
    // Constructed Sections
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
