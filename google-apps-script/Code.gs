/**
 * Ethiopian Electric Utility - User Management Backend
 * Google Apps Script implementation for user CRUD operations
 * 
 * This script handles:
 * - getUsers: Fetch all users from Google Sheets
 * - createUser: Add new user to Google Sheets
 * - updateUser: Update existing user in Google Sheets
 * - deleteUser: Remove user from Google Sheets
 */

// Configuration
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // Replace with your Google Sheets ID
const USERS_SHEET_NAME = 'Users';

/**
 * Main entry point for all API requests
 * Handles both GET and POST requests
 */
function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

/**
 * Central request handler
 * Routes requests based on action parameter
 */
function handleRequest(e) {
  try {
    // Enable CORS
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    
    // Get action from query parameters or POST body
    let action = '';
    let data = {};
    
    if (e.parameter && e.parameter.action) {
      // GET request
      action = e.parameter.action;
      data = e.parameter;
    } else if (e.postData) {
      // POST request
      const postData = JSON.parse(e.postData.contents);
      action = postData.action;
      data = postData;
    }
    
    console.log('Request received:', { action, data });
    
    // Route to appropriate handler
    let result;
    switch (action) {
      case 'getUsers':
        result = getUsers();
        break;
      case 'createUser':
        result = createUser(data);
        break;
      case 'updateUser':
        result = updateUser(data);
        break;
      case 'deleteUser':
        result = deleteUser(data);
        break;
      default:
        throw new Error('Invalid action: ' + action);
    }
    
    output.setContent(JSON.stringify(result));
    return output;
    
  } catch (error) {
    console.error('Error handling request:', error);
    const errorOutput = ContentService.createTextOutput();
    errorOutput.setMimeType(ContentService.MimeType.JSON);
    errorOutput.setContent(JSON.stringify({
      error: error.message,
      success: false
    }));
    return errorOutput;
  }
}

/**
 * Get or create the Users sheet
 * Creates the sheet with proper headers if it doesn't exist
 */
function getUsersSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(USERS_SHEET_NAME);
  
  if (!sheet) {
    // Create the sheet if it doesn't exist
    sheet = spreadsheet.insertSheet(USERS_SHEET_NAME);
    
    // Add headers
    const headers = [
      'ID', 'Name', 'Email', 'Role', 'Region', 
      'Department', 'Phone', 'Is Active', 'Created At', 'Updated At'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format headers
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('white');
    
    // Add sample admin user
    const adminUser = [
      1,
      'Abebe Kebede',
      'admin@eeu.gov.et',
      'admin',
      'Addis Ababa',
      'System Administration',
      '+251-11-123-4567',
      true,
      new Date('2024-01-01'),
      new Date()
    ];
    sheet.getRange(2, 1, 1, adminUser.length).setValues([adminUser]);
  }
  
  return sheet;
}

/**
 * Generate unique user ID
 * Format: USR-timestamp
 */
function generateUserId() {
  return 'USR-' + Date.now();
}

/**
 * Get all users from the Users sheet
 * Returns array of user objects
 */
function getUsers() {
  try {
    const sheet = getUsersSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return []; // No users (only headers)
    }
    
    const headers = data[0];
    const users = [];
    
    // Convert rows to objects
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const user = {};
      
      headers.forEach((header, index) => {
        user[header] = row[index];
      });
      
      // Format dates
      if (user['Created At'] instanceof Date) {
        user['Created At'] = user['Created At'].toISOString().split('T')[0];
      }
      if (user['Updated At'] instanceof Date) {
        user['Updated At'] = user['Updated At'].toISOString().split('T')[0];
      }
      
      users.push(user);
    }
    
    console.log('Retrieved users:', users.length);
    return users;
    
  } catch (error) {
    console.error('Error getting users:', error);
    throw new Error('Failed to retrieve users: ' + error.message);
  }
}

/**
 * Create a new user
 * Adds user to the Users sheet
 */
function createUser(data) {
  try {
    // Validate required fields
    const requiredFields = ['name', 'email', 'role'];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('Invalid email format');
    }
    
    // Validate role
    const validRoles = ['admin', 'manager', 'foreman', 'call-attendant', 'technician'];
    if (!validRoles.includes(data.role)) {
      throw new Error('Invalid role: ' + data.role);
    }
    
    const sheet = getUsersSheet();
    
    // Check if email already exists
    const existingUsers = getUsers();
    const emailExists = existingUsers.some(user => user.Email === data.email);
    if (emailExists) {
      throw new Error('User with this email already exists');
    }
    
    // Generate new user ID
    const userId = generateUserId();
    
    // Prepare user data
    const newUser = [
      userId,
      data.name,
      data.email,
      data.role,
      data.region || '',
      data.department || '',
      data.phone || '',
      data.isActive !== false, // Default to true
      new Date(),
      new Date()
    ];
    
    // Add user to sheet
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, 1, newUser.length).setValues([newUser]);
    
    console.log('User created:', userId);
    
    return {
      success: true,
      message: 'User created successfully',
      userId: userId,
      user: {
        ID: userId,
        Name: data.name,
        Email: data.email,
        Role: data.role,
        Region: data.region || '',
        Department: data.department || '',
        Phone: data.phone || '',
        'Is Active': data.isActive !== false,
        'Created At': new Date().toISOString().split('T')[0]
      }
    };
    
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user: ' + error.message);
  }
}

/**
 * Update an existing user
 * Updates user data in the Users sheet
 */
function updateUser(data) {
  try {
    // Validate required fields
    if (!data.id) {
      throw new Error('Missing required field: id');
    }
    
    const sheet = getUsersSheet();
    const sheetData = sheet.getDataRange().getValues();
    const headers = sheetData[0];
    
    // Find user row
    let userRowIndex = -1;
    for (let i = 1; i < sheetData.length; i++) {
      if (sheetData[i][0] === data.id) { // ID is in first column
        userRowIndex = i;
        break;
      }
    }
    
    if (userRowIndex === -1) {
      throw new Error('User not found: ' + data.id);
    }
    
    // Validate email if provided
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new Error('Invalid email format');
      }
      
      // Check if email already exists (excluding current user)
      const existingUsers = getUsers();
      const emailExists = existingUsers.some(user => 
        user.Email === data.email && user.ID !== data.id
      );
      if (emailExists) {
        throw new Error('User with this email already exists');
      }
    }
    
    // Validate role if provided
    if (data.role) {
      const validRoles = ['admin', 'manager', 'foreman', 'call-attendant', 'technician'];
      if (!validRoles.includes(data.role)) {
        throw new Error('Invalid role: ' + data.role);
      }
    }
    
    // Update user data
    const currentRow = sheetData[userRowIndex];
    const updatedRow = [...currentRow];
    
    // Map of field names to column indices
    const fieldMap = {
      'name': 1,
      'email': 2,
      'role': 3,
      'region': 4,
      'department': 5,
      'phone': 6,
      'isActive': 7
    };
    
    // Update fields that are provided
    Object.keys(fieldMap).forEach(field => {
      if (data[field] !== undefined) {
        updatedRow[fieldMap[field]] = data[field];
      }
    });
    
    // Update timestamp
    updatedRow[9] = new Date(); // Updated At column
    
    // Write updated row back to sheet
    sheet.getRange(userRowIndex + 1, 1, 1, updatedRow.length).setValues([updatedRow]);
    
    console.log('User updated:', data.id);
    
    return {
      success: true,
      message: 'User updated successfully',
      userId: data.id
    };
    
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user: ' + error.message);
  }
}

/**
 * Delete a user
 * Removes user from the Users sheet
 */
function deleteUser(data) {
  try {
    // Validate required fields
    if (!data.id) {
      throw new Error('Missing required field: id');
    }
    
    const sheet = getUsersSheet();
    const sheetData = sheet.getDataRange().getValues();
    
    // Find user row
    let userRowIndex = -1;
    for (let i = 1; i < sheetData.length; i++) {
      if (sheetData[i][0] === data.id) { // ID is in first column
        userRowIndex = i;
        break;
      }
    }
    
    if (userRowIndex === -1) {
      throw new Error('User not found: ' + data.id);
    }
    
    // Prevent deletion of admin users (optional safety check)
    const userRole = sheetData[userRowIndex][3]; // Role is in 4th column
    if (userRole === 'admin') {
      // Count remaining admin users
      const adminCount = sheetData.filter((row, index) => 
        index > 0 && row[3] === 'admin'
      ).length;
      
      if (adminCount <= 1) {
        throw new Error('Cannot delete the last admin user');
      }
    }
    
    // Delete the row (add 1 because sheet rows are 1-indexed)
    sheet.deleteRow(userRowIndex + 1);
    
    console.log('User deleted:', data.id);
    
    return {
      success: true,
      message: 'User deleted successfully',
      userId: data.id
    };
    
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user: ' + error.message);
  }
}

/**
 * Utility function to test the API
 * Can be called from Google Apps Script editor
 */
function testAPI() {
  console.log('Testing User Management API...');
  
  try {
    // Test getUsers
    console.log('Testing getUsers...');
    const users = getUsers();
    console.log('Users retrieved:', users.length);
    
    // Test createUser
    console.log('Testing createUser...');
    const testUser = {
      action: 'createUser',
      name: 'Test User',
      email: 'test@eeu.gov.et',
      role: 'technician',
      region: 'Addis Ababa',
      department: 'Testing',
      phone: '+251-11-999-9999'
    };
    const createResult = createUser(testUser);
    console.log('User created:', createResult);
    
    // Test updateUser
    console.log('Testing updateUser...');
    const updateResult = updateUser({
      id: createResult.userId,
      name: 'Updated Test User',
      department: 'Updated Testing'
    });
    console.log('User updated:', updateResult);
    
    // Test deleteUser
    console.log('Testing deleteUser...');
    const deleteResult = deleteUser({
      id: createResult.userId
    });
    console.log('User deleted:', deleteResult);
    
    console.log('All tests completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}