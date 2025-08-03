# Google Apps Script Backend Setup Guide

This guide will help you deploy the User Management backend to Google Apps Script.

## 📋 Prerequisites

1. **Google Account** with access to Google Drive and Google Sheets
2. **Google Sheets** spreadsheet for storing user data
3. **Google Apps Script** project

## 🚀 Step-by-Step Setup

### Step 1: Create Google Sheets Database

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "EEU User Management Database"
4. Copy the spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```
5. Keep this ID - you'll need it in Step 3

### Step 2: Create Google Apps Script Project

1. Go to [Google Apps Script](https://script.google.com)
2. Click "New Project"
3. Name the project "EEU User Management API"

### Step 3: Deploy the Code

1. **Choose your backend implementation:**
   - **Basic**: Use `Code.gs` for basic user management only
   - **Enhanced**: Use `Enhanced-Code.gs` for full complaint management system (recommended)

2. **Replace the default Code.gs file:**
   - Delete the existing `myFunction()` in Code.gs
   - Copy and paste the entire content from either `Code.gs` or `Enhanced-Code.gs`

3. **Add the appsscript.json configuration:**
   - Click the gear icon (⚙️) in the left sidebar to view "Project Settings"
   - Check "Show 'appsscript.json' manifest file in editor"
   - Go back to the editor and click on `appsscript.json`
   - Replace its content with the content from `appsscript.json` in this folder

4. **Configure the Spreadsheet ID:**
   - In your chosen code file, find this line:
     ```javascript
     const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // Basic version
     // OR
     const CONFIG = { SHEET_ID: 'YOUR_SPREADSHEET_ID', ... }; // Enhanced version
     ```
   - Replace `YOUR_SPREADSHEET_ID` with your actual spreadsheet ID from Step 1

### Step 4: Test the Implementation

1. **Run the test function:**
   - In the Apps Script editor, select `testAPI` from the function dropdown
   - Click the "Run" button (▶️)
   - Grant necessary permissions when prompted
   - Check the execution log for results

2. **Verify the Users sheet:**
   - Go back to your Google Sheets
   - You should see a new "Users" sheet with headers and sample data

### Step 5: Deploy as Web App

1. **Deploy the script:**
   - Click "Deploy" → "New deployment"
   - Click the gear icon next to "Type" and select "Web app"
   - Fill in the deployment settings:
     - **Description**: "EEU User Management API v1.0"
     - **Execute as**: "Me"
     - **Who has access**: "Anyone"
   - Click "Deploy"

2. **Copy the Web App URL:**
   - After deployment, copy the "Web app URL"
   - It should look like:
     ```
     https://script.google.com/macros/s/[SCRIPT_ID]/exec
     ```

### Step 6: Update Frontend Configuration

1. **Update the proxy configuration:**
   - Open `proxy.js` in your project root
   - Replace the `GOOGLE_SCRIPT_URL` with your new Web App URL:
     ```javascript
     const GOOGLE_SCRIPT_URL = 'YOUR_NEW_WEB_APP_URL';
     ```

2. **Update server.js (if using):**
   - Open `server.js` in your project root
   - Replace the `API_BASE` URL with your new Web App URL

## 🧪 Testing the API

### Test with curl (or Postman)

1. **Get Users:**
   ```bash
   curl "YOUR_WEB_APP_URL?action=getUsers"
   ```

2. **Create User:**
   ```bash
   curl -X POST "YOUR_WEB_APP_URL" \
     -H "Content-Type: application/json" \
     -d '{
       "action": "createUser",
       "name": "John Doe",
       "email": "john@eeu.gov.et",
       "role": "technician",
       "region": "Addis Ababa",
       "department": "Field Operations",
       "phone": "+251-11-555-0123"
     }'
   ```

3. **Update User:**
   ```bash
   curl -X POST "YOUR_WEB_APP_URL" \
     -H "Content-Type: application/json" \
     -d '{
       "action": "updateUser",
       "id": "USR-1234567890",
       "name": "John Doe Updated",
       "department": "Updated Department"
     }'
   ```

4. **Delete User:**
   ```bash
   curl -X POST "YOUR_WEB_APP_URL" \
     -H "Content-Type: application/json" \
     -d '{
       "action": "deleteUser",
       "id": "USR-1234567890"
     }'
   ```

## 🔧 Configuration Options

### Spreadsheet Structure

The script automatically creates a "Users" sheet with these columns:
- **ID**: Unique user identifier (USR-timestamp)
- **Name**: Full name
- **Email**: Email address (must be unique)
- **Role**: User role (admin, manager, foreman, call-attendant, technician)
- **Region**: Ethiopian region
- **Department**: Department name
- **Phone**: Phone number
- **Is Active**: Boolean status
- **Created At**: Creation timestamp
- **Updated At**: Last update timestamp

### Security Features

1. **Email Validation**: Ensures valid email format
2. **Role Validation**: Only allows predefined roles
3. **Duplicate Prevention**: Prevents duplicate email addresses
4. **Admin Protection**: Prevents deletion of the last admin user
5. **Input Sanitization**: Validates all input data

### Error Handling

The API returns structured error responses:
```json
{
  "error": "Error message",
  "success": false
}
```

Success responses include:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "userId": "USR-1234567890"
}
```

## 🚨 Troubleshooting

### Common Issues

1. **"Invalid action" error:**
   - Check that the Web App URL is correct
   - Ensure the deployment is set to "Anyone" access
   - Verify the action parameter is being sent correctly

2. **Permission errors:**
   - Make sure you've granted all necessary permissions
   - Check that the spreadsheet is accessible by the script

3. **CORS errors:**
   - Ensure you're using the proxy server for local development
   - Check that the Web App is deployed with "Anyone" access

4. **Data not appearing:**
   - Verify the spreadsheet ID is correct
   - Check the Google Apps Script execution logs
   - Ensure the "Users" sheet exists and has proper headers

### Debugging

1. **Check execution logs:**
   - In Google Apps Script editor, go to "Executions"
   - View logs for detailed error information

2. **Test individual functions:**
   - Use the `testAPI()` function to test all operations
   - Run individual functions like `getUsers()` to isolate issues

3. **Verify permissions:**
   - Ensure the script has access to Google Sheets
   - Check that the spreadsheet permissions allow the script to read/write

## 📚 Additional Resources

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Google Sheets API Reference](https://developers.google.com/sheets/api)
- [Web Apps Guide](https://developers.google.com/apps-script/guides/web)

## 🔄 Updating the Backend

When you need to update the backend:

1. Make changes to the Code.gs file
2. Save the project
3. Create a new deployment or update the existing one
4. Test the changes using the `testAPI()` function

The Web App URL will remain the same for updates to existing deployments.