# Staff Itinerary Automation - Setup Guide

This automation creates Staff Itinerary documents automatically when a form is submitted.

## 📋 Prerequisites

- Google Account with access to Google Drive and Google Docs
- The form submission data from your Amington Hall form

## 🚀 Setup Instructions

### Step 1: Prepare the Template Document

1. Go to [Google Docs](https://docs.google.com)
2. Open the template document (ID: `1l5nuot7quE3jYdzuGgBbVpgvQhwW3PMl`)
3. Copy the content from `Template - Staff Itinerary.md` into this Google Doc
4. Ensure all variables (like `{{clientName}}`, `{{eventDate}}`, etc.) are present
5. Note the document ID from the URL

### Step 2: Create Output Folder

1. Go to [Google Drive](https://drive.google.com)
2. Create a new folder called "Staff Itineraries" (or your preferred name)
3. Click on the folder and note the Folder ID from the URL
   - URL format: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`

### Step 3: Create Google Apps Script Project

1. Go to [Google Apps Script](https://script.google.com)
2. Click **New Project**
3. Delete the default code
4. Copy all code from `createStaffItinerary.gs` and paste it
5. Update the configuration at the top:
   ```javascript
   const CONFIG = {
     TEMPLATE_DOC_ID: 'YOUR_TEMPLATE_DOC_ID',  // From Step 1
     OUTPUT_FOLDER_ID: 'YOUR_FOLDER_ID',        // From Step 2
     DATE_FORMAT: 'EEEE d MMMM yyyy',
   };
   ```
6. Save the project (name it "Staff Itinerary Generator")

### Step 4: Test the Setup

1. In the Apps Script editor, select the function `testSetup` from the dropdown
2. Click **Run**
3. Authorize the script when prompted (review permissions carefully)
4. Check the execution log - you should see a document URL
5. Open the URL to verify the test document was created correctly

### Step 5: Deploy as Web App

1. In Apps Script, click **Deploy** > **New deployment**
2. Click the gear icon ⚙️ and select **Web app**
3. Configure:
   - **Description**: "Staff Itinerary Generator v1"
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
4. Click **Deploy**
5. **Copy the Web App URL** - you'll need this for the form

### Step 6: Update Form Configuration

1. Open `page7.js` in your form project
2. Find the line with `APPSCRIPT_URL`
3. Replace with your Web App URL from Step 5:
   ```javascript
   const APPSCRIPT_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
   ```

## 🧪 Testing the Integration

### Test Form Submission

1. Fill out your form completely
2. Submit the form
3. Check your "Staff Itineraries" folder in Google Drive
4. The document should be created with the format:
   - **Name**: `Staff Itinerary - [Client Name] - [Event Date]`
   - **Content**: All form data properly inserted

### Troubleshooting

**Document not created?**
- Check Apps Script execution logs (View > Logs)
- Verify the Web App URL is correct in page7.js
- Ensure proper permissions were granted

**Variables not replaced?**
- Check variable names match exactly in template
- Verify form field names match the mapping in the script

**Wrong data in document?**
- Check the variable mapping in `buildVariables()` function
- Verify form field names are correct

## 📊 Variable Mapping Reference

| Template Variable | Form Field | Page |
|------------------|------------|------|
| `{{clientName}}` | client-name | 1 |
| `{{brideName}}` | bride-name | 1 |
| `{{groomName}}` | groom-name | 1 |
| `{{eventDate}}` | event-date | 1 |
| `{{eventType}}` | event-type | 1 |
| `{{eventTime}}` | event-timings | 1 |
| `{{suite}}` | suite-hired | 3 |
| `{{seatingArrangement}}` | guest-arrangements | 3 |
| `{{guestCount}}` | guest-count | 3 |
| `{{mpcName}}` | primary-contact-name | 2 |
| `{{mpcRelationship}}` | primary-contact-relationship | 2 |
| `{{mpcPhone}}` | primary-contact-phone | 2 |

### Constructed Variables

These are built from multiple form fields:

- `{{guestTables}}` - Calculated from guest-count ÷ 10 (rounded up)
- `{{reservedTablesInfo}}` - From reserved-seatings + segregation info
- `{{extraTablesInfo}}` - From table selections (nendra, gift, drink, other)
- `{{headTableInfo}}` - From head-table selection
- `{{cakeTableInfo}}` - From wedding-cake + cake company
- `{{decorInfo}}` - From decor company or "Standard"
- `{{foyerSetup}}` - From table-nendra checkbox
- `{{inHouseServices}}` - From sound-system, special effects, etc.
- `{{externalVendors}}` - From photographer, videographer, DJ, cake, decor

## 🔧 Advanced Configuration

### Date Format

To change the date format, update `CONFIG.DATE_FORMAT`:
- Current: `'EEEE d MMMM yyyy'` → "Sunday 19 October 2025"
- Other options:
  - `'dd/MM/yyyy'` → "19/10/2025"
  - `'MMMM d, yyyy'` → "October 19, 2025"

### Adding New Variables

1. Add the variable to the template (e.g., `{{newVariable}}`)
2. Add it to the `buildVariables()` function:
   ```javascript
   '{{newVariable}}': data['form-field-name'] || 'default value',
   ```
3. Redeploy the Web App (Deploy > Manage deployments > Edit > Version: New)

### Custom Logic

You can add custom formatting or logic by creating new functions:
```javascript
function buildCustomSection(data) {
  // Your custom logic here
  return formattedString;
}
```

Then add it to `buildVariables()`:
```javascript
'{{customSection}}': buildCustomSection(data),
```

## 📞 Support

For issues or questions:
1. Check the Apps Script execution logs
2. Review the `template-variables-mapping.json` file
3. Test with the `testSetup()` function

## 🎯 What Happens When Form is Submitted

1. Form data is collected and validated
2. POST request sent to Apps Script Web App
3. Apps Script receives data and processes it
4. Template document is copied
5. All variables are replaced with actual data
6. New document saved to output folder
7. Document URL returned to form
8. Success message shown to user

## ✅ Verification Checklist

- [ ] Template document created and ID noted
- [ ] Output folder created and ID noted
- [ ] Apps Script project created
- [ ] Configuration updated with correct IDs
- [ ] testSetup() function runs successfully
- [ ] Web App deployed successfully
- [ ] Web App URL copied to form
- [ ] Test submission completed successfully
- [ ] Document created with correct data

---

**Last Updated**: December 2025  
**Version**: 1.0.0
