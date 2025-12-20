# Google Apps Script Trigger Setup Instructions

## Problem: Dynamic triggers created in doPost() don't execute reliably

## Solution: Install a permanent time-based trigger manually

### Step 1: Deploy the Script
1. Open your Google Apps Script project
2. Paste the `createStaffItinerary.gs` code
3. Deploy as Web App:
   - Click **Deploy** → **New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**
   - Copy the deployment URL

### Step 2: Install Permanent Trigger
1. In Apps Script editor, click the **clock icon** (Triggers) in left sidebar
2. Click **+ Add Trigger** (bottom right)
3. Configure:
   - Function to run: `processScheduledDocuments`
   - Deployment: **Head**
   - Event source: **Time-driven**
   - Type of time based trigger: **Minutes timer**
   - Minute interval: **Every minute**
4. Click **Save**
5. Authorize the trigger when prompted

### Step 3: Set Script Properties
1. Click **Project Settings** (gear icon) in left sidebar
2. Scroll to **Script Properties**
3. Add these properties:
   - `TEMPLATE_WALIMA`: Your Walima template document ID
   - `TEMPLATE_NIKKAH`: Your Nikkah template document ID (optional)
   - `TEMPLATE_JOINT`: Your Joint Day template document ID (optional)
   - `OUTPUT_FOLDER_ID`: Google Drive folder ID for generated documents

### Step 4: Update Form URLs
Add the deployment URL to `appscript-endpoints.json` in your form

### How It Works:
- Form submits data → doPost() saves to Script Properties
- Every minute, the trigger runs processScheduledDocuments()
- It checks for any pending items and processes them
- Old items (>24 hours) are auto-cleaned

### Verify It's Working:
1. Submit a test form
2. Check **Executions** (left sidebar) after 1-2 minutes
3. You should see `processScheduledDocuments` execution
4. Check your output folder for the generated document

### Troubleshooting:
- **No document created**: Check Executions tab for errors
- **Trigger not running**: Verify trigger is active in Triggers page
- **Authorization error**: Re-authorize the trigger
- **Quota exceeded**: Check Apps Script quotas (max 90 minutes/day for free accounts)
