/**
 * Deployment helper script for Google Apps Script
 * This script helps automate the deployment process
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  spreadsheetName: 'EEU User Management Database',
  scriptName: 'EEU User Management API',
  description: 'Ethiopian Electric Utility User Management Backend API',
  timeZone: 'Africa/Addis_Ababa'
};

/**
 * Generate deployment instructions
 */
function generateDeploymentInstructions() {
  const instructions = `
# 🚀 Google Apps Script Deployment Instructions

## Quick Setup Checklist

### 1. Create Google Sheets Database
- [ ] Go to https://sheets.google.com
- [ ] Create new spreadsheet: "${CONFIG.spreadsheetName}"
- [ ] Copy the spreadsheet ID from URL
- [ ] Save the ID for step 3

### 2. Create Google Apps Script Project
- [ ] Go to https://script.google.com
- [ ] Click "New Project"
- [ ] Rename to: "${CONFIG.scriptName}"

### 3. Deploy the Code
- [ ] Copy Code.gs content to Apps Script editor
- [ ] Update SPREADSHEET_ID with your actual ID
- [ ] Copy appsscript.json content (enable manifest file first)
- [ ] Save the project

### 4. Test the Implementation
- [ ] Run testAPI() function
- [ ] Grant necessary permissions
- [ ] Verify Users sheet is created with sample data

### 5. Deploy as Web App
- [ ] Click Deploy → New deployment
- [ ] Select "Web app" type
- [ ] Set execute as "Me"
- [ ] Set access to "Anyone"
- [ ] Copy the Web App URL

### 6. Update Frontend Configuration
- [ ] Update proxy.js with new Web App URL
- [ ] Update server.js with new Web App URL
- [ ] Test the connection

## 🔧 Configuration Files

### Required Files:
1. Code.gs - Main backend implementation
2. appsscript.json - Project configuration
3. Advanced-Code.gs - Enhanced features (optional)

### Sample Web App URL Format:
https://script.google.com/macros/s/[SCRIPT_ID]/exec

## 🧪 Testing Commands

After deployment, test with these curl commands:

\`\`\`bash
# Get all users
curl "YOUR_WEB_APP_URL?action=getUsers"

# Create a user
curl -X POST "YOUR_WEB_APP_URL" \\
  -H "Content-Type: application/json" \\
  -d '{
    "action": "createUser",
    "name": "Test User",
    "email": "test@eeu.gov.et",
    "role": "technician",
    "region": "Addis Ababa"
  }'
\`\`\`

## 🚨 Troubleshooting

### Common Issues:
1. **"Invalid action" error**: Check Web App URL and deployment settings
2. **Permission denied**: Ensure proper permissions are granted
3. **CORS errors**: Use the proxy server for local development
4. **Data not saving**: Verify spreadsheet ID is correct

### Debug Steps:
1. Check Google Apps Script execution logs
2. Verify spreadsheet permissions
3. Test individual functions in Apps Script editor
4. Check Web App deployment settings

## 📞 Support

If you encounter issues:
1. Check the execution logs in Google Apps Script
2. Verify all permissions are granted
3. Test with the testAPI() function
4. Review the setup guide documentation

Generated on: ${new Date().toISOString()}
Project: ${CONFIG.scriptName}
`;

  return instructions;
}

/**
 * Generate a configuration template
 */
function generateConfigTemplate() {
  const config = {
    // Google Apps Script Configuration
    spreadsheet: {
      id: "YOUR_SPREADSHEET_ID_HERE",
      name: CONFIG.spreadsheetName,
      sheets: {
        users: "Users",
        audit: "Audit_Log"
      }
    },
    
    // API Configuration
    api: {
      name: CONFIG.scriptName,
      description: CONFIG.description,
      version: "1.0.0",
      timeZone: CONFIG.timeZone
    },
    
    // Security Configuration
    security: {
      allowedOrigins: ["*"],
      requireAuth: false,
      enableAuditLog: true
    },
    
    // Feature Flags
    features: {
      bulkOperations: true,
      advancedSearch: true,
      auditLogging: true,
      softDelete: true,
      userStats: true
    },
    
    // Validation Rules
    validation: {
      email: {
        required: true,
        format: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
      },
      phone: {
        required: false,
        format: "^\\+251-\\d{2}-\\d{3}-\\d{4}$"
      },
      roles: ["admin", "manager", "foreman", "call-attendant", "technician"],
      regions: [
        "Addis Ababa", "Afar", "Amhara", "Benishangul-Gumuz",
        "Dire Dawa", "Gambela", "Harari", "Oromia",
        "Sidama", "SNNPR", "Somali", "Tigray"
      ]
    }
  };
  
  return JSON.stringify(config, null, 2);
}

/**
 * Main deployment function
 */
function main() {
  console.log('🚀 Google Apps Script Deployment Helper');
  console.log('=====================================');
  
  try {
    // Create deployment instructions
    const instructions = generateDeploymentInstructions();
    fs.writeFileSync(
      path.join(__dirname, 'DEPLOYMENT_INSTRUCTIONS.md'),
      instructions
    );
    console.log('✅ Created DEPLOYMENT_INSTRUCTIONS.md');
    
    // Create configuration template
    const configTemplate = generateConfigTemplate();
    fs.writeFileSync(
      path.join(__dirname, 'config.template.json'),
      configTemplate
    );
    console.log('✅ Created config.template.json');
    
    // Verify required files exist
    const requiredFiles = ['Code.gs', 'appsscript.json', 'SETUP_GUIDE.md'];
    const missingFiles = [];
    
    requiredFiles.forEach(file => {
      const filePath = path.join(__dirname, file);
      if (!fs.existsSync(filePath)) {
        missingFiles.push(file);
      }
    });
    
    if (missingFiles.length > 0) {
      console.log('⚠️  Missing required files:', missingFiles.join(', '));
    } else {
      console.log('✅ All required files are present');
    }
    
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Read DEPLOYMENT_INSTRUCTIONS.md');
    console.log('2. Follow the setup guide step by step');
    console.log('3. Update the SPREADSHEET_ID in Code.gs');
    console.log('4. Deploy to Google Apps Script');
    console.log('5. Update your frontend configuration');
    console.log('');
    console.log('🎉 Ready for deployment!');
    
  } catch (error) {
    console.error('❌ Deployment preparation failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  generateDeploymentInstructions,
  generateConfigTemplate,
  CONFIG
};