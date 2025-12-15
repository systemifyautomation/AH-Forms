# Amington Hall - Walkthrough Register Form

## Overview
A comprehensive 7-page wedding venue walkthrough form with data persistence, validation, and webhook integration.

## Form Structure

### Page 1: Event Details
**Required Fields:**
- Client Name
- Groom Name
- Bride Name
- Ethnicity
- Event Date
- Event Timings (with conditional "Other" text field)
- Walkthrough Date
- Number of Attendees

**Optional Fields:** None

---

### Page 2: Key Contacts
**Required Fields:**
- Primary Contact Name
- Primary Contact Phone (with editable prefix)

**Optional Fields:**
- Primary Contact Email
- Secondary Contact (Yes/No toggle)
  - If Yes: Secondary Contact Name, Phone (required), Email (optional)

---

### Page 3: Seating & Hall Arrangements
**Required Fields:**
- Suite Hired
- Number of Guests
- Table Type
- Guest Arrangements
- Table Settings
- Reserved Seating
- Head Table
- Dance Floor

**Optional Fields:**
- Segregation (Yes/No toggle)
  - If Yes: Men Count, Women Count (both required)
- Additional Tables (checkboxes):
  - Additional Dining Tables
  - Additional Buffet Tables
  - Additional Cake Tables
  - Other (with text field)

**Validation Rules:**
- Guest count must not exceed suite capacity (Amington: 400, Serenity: 250, Both: 650)
- Segregation only available for Amington Suite
- If segregation enabled, max combined count is 350

---

### Page 4: Décor
**Required Fields:** None

**Optional Fields:**
- Third Party Décor Company Name
- Contact Name
- Contact Phone (with editable prefix)
- Contact Email

---

### Page 5: Wedding Cake and Favours
**Required Fields:**
- Wedding Cake (Yes/No)

**Optional Fields:**
- If Wedding Cake = Yes:
  - Company Name
  - Number of Tiers
  - Contact Name
  - Contact Phone (with prefix)
- Cake Knife (Yes/No)
- Wedding Favours (Yes/No)
  - If Yes: Number of Favours, Type of Favours
- Menu Cards (4 options)
- Leftover Favours Disposal

---

### Page 6: LED/LCD Screen
**Required Fields:** None

**Optional Fields:**
- Amington Suite Stage Screen (4 radio options)
- Amington Suite Wall Screen (4 radio options)
- Serenity Suite Wall Screen (4 radio options)
- Foyer Screen (4 radio options)
- Additional Details (textarea)

---

### Page 7: Visuals & External
**Required Fields:**
- Photographer (Yes/No)
- Videographer (Yes/No)
- Cinematography Equipment (5 options)
- Sound System Type (3 options)

**Optional Fields:**
- If Photographer = Yes: Company Name, Contact Name, Contact Phone, Email
- If Videographer = Yes: Company Name, Contact Name, Contact Phone, Email
- DJ Hired (Yes/No)
  - If Yes: DJ Name, Contact Phone, Email

---

## Data Structure

The form uses `data-utils.js` to structure data for webhook submission:

```javascript
{
  submissionInfo: {
    submittedAt: "ISO timestamp",
    lastSaved: "ISO timestamp",
    formVersion: "1.0",
    reminderPhone: "optional",
    reminderPhonePrefix: "optional"
  },
  
  eventDetails: {
    clientName: "string",
    groomName: "string",
    brideName: "string",
    ethnicity: "string",
    eventDate: "string",
    eventTimings: "string",
    otherTimings: "string or null",
    walkthroughDate: "string",
    numberOfAttendees: "string"
  },
  
  keyContacts: {
    primaryContact: {
      name: "string",
      phone: { prefix: "+44", number: "string" },
      email: "string or null"
    },
    secondaryContact: {
      name: "string",
      phone: { prefix: "+44", number: "string" },
      email: "string or null"
    } or null
  },
  
  seatingAndHall: {
    suiteHired: "string",
    numberOfGuests: "string",
    tableType: "string",
    guestArrangements: "string",
    segregation: {
      enabled: boolean,
      menCount: "string or null",
      womenCount: "string or null"
    },
    tableSettings: "string",
    reservedSeating: "string",
    headTable: "string",
    danceFloor: "string",
    additionalTables: {
      diningTables: boolean,
      buffetTables: boolean,
      cakeTables: boolean,
      other: "string or null"
    }
  },
  
  decor: {
    thirdPartyDecor: {
      companyName: "string or null",
      contactName: "string or null",
      contactPhone: { prefix: "string or null", number: "string or null" },
      contactEmail: "string or null"
    }
  },
  
  weddingCakeAndFavours: {
    weddingCake: {
      enabled: boolean,
      companyName: "string",
      numberOfTiers: "string",
      contactName: "string",
      contactPhone: { prefix: "+44", number: "string" }
    } or { enabled: false },
    cakeKnife: "string or null",
    favours: {
      enabled: boolean,
      numberOfFavours: "string",
      typeOfFavours: "string"
    } or { enabled: false },
    menuCards: "string or null",
    leftoverFavours: "string or null"
  },
  
  ledLcdScreens: {
    screens: {
      amingtonStageScreen: "string or null",
      amingtonWallScreen: "string or null",
      serenityWallScreen: "string or null",
      foyerScreen: "string or null"
    },
    additionalDetails: "string or null"
  },
  
  visualsAndExternal: {
    photographer: {
      enabled: boolean,
      companyName: "string",
      contactName: "string",
      contactPhone: { prefix: "+44", number: "string" },
      email: "string"
    } or { enabled: false },
    videographer: {
      enabled: boolean,
      companyName: "string",
      contactName: "string",
      contactPhone: { prefix: "+44", number: "string" },
      email: "string"
    } or { enabled: false },
    cinematographyEquipment: "string",
    soundSystem: {
      type: "string",
      djHired: {
        enabled: boolean,
        djName: "string",
        contactPhone: { prefix: "+44", number: "string" },
        email: "string"
      } or { enabled: false }
    }
  }
}
```

## Webhook Integration

### Setup
1. Update `APPSCRIPT_URL` in `page7.js` (line 3):
   ```javascript
   const APPSCRIPT_URL = 'YOUR_WEBHOOK_URL_HERE';
   ```

### Payload Format
The webhook receives a structured JSON payload:
```javascript
{
  formData: { /* structured data as shown above */ },
  validation: {
    isValid: true,
    missingFields: []
  },
  metadata: {
    timestamp: "ISO timestamp",
    userAgent: "browser user agent",
    source: "Amington Hall Walkthrough Register"
  }
}
```

### Google Apps Script Example
```javascript
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Submissions');
    
    // Extract structured data
    const data = payload.formData;
    
    // Add row to spreadsheet
    sheet.appendRow([
      data.submissionInfo.submittedAt,
      data.eventDetails.clientName,
      data.eventDetails.groomName,
      data.eventDetails.brideName,
      data.eventDetails.eventDate,
      data.keyContacts.primaryContact.name,
      data.keyContacts.primaryContact.phone.prefix + data.keyContacts.primaryContact.phone.number,
      // ... add more fields as needed
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Form submitted successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Features

### Data Persistence
- All data saved to `localStorage` with key: `amington-hall-form-data`
- Auto-save on page navigation
- Manual "Save Progress" button on all pages
- Data persists across browser sessions

### Validation
- Required fields validated before page navigation
- Custom error messages for specific validation rules
- Suite capacity validation
- Segregation limit validation
- Conditional field validation (only validates visible fields)

### User Experience
- Progress indicator shows "Page X of 7"
- Conditional sections show/hide based on selections
- Editable phone prefixes (default: +44)
- Exit warnings on final page
- Exit modal to save phone number for reminders
- Success notification after submission
- Elegant black/gold/white theme

### Field Behavior
- **Required fields**: Must be filled to proceed
- **Optional fields**: Can be left empty
- **Conditional fields**: Only required if parent condition is met
- **Hidden fields**: Not validated, cleared when hidden
- **Checkboxes**: Saved as 'on' or 'off'
- **Radio buttons**: Saved as selected value
- **Empty fields**: Saved as empty string (not null)

## Development

### File Structure
```
AH-Forms/
├── index.html          # Redirects to page1.html
├── page1.html          # Event Details
├── page1.js
├── page2.html          # Key Contacts
├── page2.js
├── page3.html          # Seating & Hall
├── page3.js
├── page4.html          # Décor
├── page4.js
├── page5.html          # Wedding Cake & Favours
├── page5.js
├── page6.html          # LED/LCD Screen
├── page6.js
├── page7.html          # Visuals & External (Final)
├── page7.js
├── data-utils.js       # Data structuring utilities
├── styles.css          # Shared styling
└── README.md           # This file
```

### Key Constants
- `STORAGE_KEY`: `'amington-hall-form-data'`
- `APPSCRIPT_URL`: Configure in `page7.js`

### Testing
1. Test complete form flow (page 1 → 7)
2. Verify required field validation
3. Test optional field handling
4. Verify conditional section toggles
5. Test save/restart functionality
6. Verify data structure in console
7. Test webhook submission

## Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge
- Requires JavaScript and localStorage enabled

## License
© 2025 Amington Hall. All rights reserved.
Made by [Systemify Automation](https://systemifyautomation.com)
