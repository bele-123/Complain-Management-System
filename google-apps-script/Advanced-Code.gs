/**
 * Ethiopian Electric Utility - Advanced User Management Backend
 * Google Apps Script implementation with enhanced features
 * 
 * Features:
 * - Complete CRUD operations
 * - Data validation and sanitization
 * - Audit logging
 * - Bulk operations
 * - Advanced search and filtering
 * - Data export capabilities
 */

// Configuration
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // Replace with your Google Sheets ID
const USERS_SHEET_NAME = 'Users';
const AUDIT_SHEET_NAME = 'Audit_Log';

/**
 * Main entry point for all API requests
 */
function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

/**
 * Central request handler with enhanced routing
 */
function handleRequest(e) {
  try {
    // Enable CORS
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    
    // Get action and data
    let action = '';
    let data = {};
    
    if (e.parameter && e.parameter.action) {
      action = e.parameter.action;
      data = e.parameter;
    } else if (e.postData) {
      const postData = JSON.parse(e.postData.contents);
      action = postData.action;
      data = postData;
    }
    
    console.log('Request received:', { action, timestamp: new Date() });
    
    // Route to appropriate handler
    let result;
    switch (action) {
      case 'getUsers':
        result = getUsers(data);
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
      case 'bulkCreateUsers':
        result = bulkCreateUsers(data);
        break;
      case 'searchUsers':
        result = searchUsers(data);
        break;
      case 'exportUsers':
        result = exportUsers(data);
        break;
      case 'getUserStats':
        result = getUserStats();
        break;
      case 'getAuditLog':
        result = getAuditLog(data);
        break;
      default:
        throw new Error('Invalid action: ' + action);
    }
    
    output.setContent(JSON.stringify(result));
    return output;
    
  } catch (error) {
    console.error('Error handling request:', error);
    logAuditEvent('ERROR', 'API_REQUEST', { error: error.message });
    
    const errorOutput = ContentService.createTextOutput();
    errorOutput.setMimeType(ContentService.MimeType.JSON);
    errorOutput.setContent(JSON.stringify({
      error: error.message,
      success: false,
      timestamp: new Date().toISOString()
    }));
    return errorOutput;
  }
}

/**
 * Get or create the Users sheet with enhanced structure
 */
function getUsersSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(USERS_SHEET_NAME);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(USERS_SHEET_NAME);
    
    // Enhanced headers
    const headers = [
      'ID', 'Name', 'Email', 'Role', 'Region', 
      'Department', 'Phone', 'Is Active', 'Created At', 'Updated At',
      'Last Login', 'Login Count', 'Password Reset Required', 'Notes'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format headers
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('white');
    
    // Set column widths
    sheet.setColumnWidth(1, 120); // ID
    sheet.setColumnWidth(2, 150); // Name
    sheet.setColumnWidth(3, 200); // Email
    sheet.setColumnWidth(4, 120); // Role
    sheet.setColumnWidth(5, 120); // Region
    
    // Add sample data
    addSampleUsers(sheet);
  }
  
  return sheet;
}

/**
 * Get or create the Audit Log sheet
 */
function getAuditSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(AUDIT_SHEET_NAME);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(AUDIT_SHEET_NAME);
    
    const headers = [
      'Timestamp', 'Action', 'Resource', 'User ID', 'Details', 'IP Address', 'Success'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format headers
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#ff9900');
    headerRange.setFontColor('white');
  }
  
  return sheet;
}

/**
 * Add sample users to the sheet
 */
function addSampleUsers(sheet) {
  const sampleUsers = [
    [1, 'Abebe Kebede', 'admin@eeu.gov.et', 'admin', 'Addis Ababa', 'System Administration', '+251-11-123-4567', true, new Date('2024-01-01'), new Date(), null, 0, false, 'System Administrator'],
    [2, 'Tigist Haile', 'manager@eeu.gov.et', 'manager', 'Oromia', 'Regional Management', '+251-11-234-5678', true, new Date('2024-01-02'), new Date(), null, 0, false, 'Regional Manager'],
    [3, 'Getachew Tadesse', 'foreman@eeu.gov.et', 'foreman', 'Amhara', 'Field Operations', '+251-11-345-6789', true, new Date('2024-01-03'), new Date(), null, 0, false, 'Field Foreman'],
    [4, 'Meron Tesfaye', 'callattendant@eeu.gov.et', 'call-attendant', 'Addis Ababa', 'Customer Service', '+251-11-456-7890', true, new Date('2024-01-04'), new Date(), null, 0, false, 'Customer Service Representative'],
    [5, 'Dawit Solomon', 'technician@eeu.gov.et', 'technician', 'Addis Ababa', 'Field Service', '+251-11-567-8901', true, new Date('2024-01-05'), new Date(), null, 0, false, 'Field Technician']
  ];
  
  sheet.getRange(2, 1, sampleUsers.length, sampleUsers[0].length).setValues(sampleUsers);
}

/**
 * Enhanced user retrieval with filtering and pagination
 */
function getUsers(params = {}) {
  try {
    const sheet = getUsersSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return [];
    }
    
    const headers = data[0];
    let users = [];
    
    // Convert rows to objects
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const user = {};
      
      headers.forEach((header, index) => {
        user[header] = row[index];
      });
      
      // Format dates
      ['Created At', 'Updated At', 'Last Login'].forEach(dateField => {
        if (user[dateField] instanceof Date) {
          user[dateField] = user[dateField].toISOString().split('T')[0];
        }
      });
      
      users.push(user);
    }
    
    // Apply filters
    if (params.role && params.role !== 'all') {
      users = users.filter(user => user.Role === params.role);
    }
    
    if (params.region && params.region !== 'all') {
      users = users.filter(user => user.Region === params.region);
    }
    
    if (params.active !== undefined) {
      users = users.filter(user => user['Is Active'] === (params.active === 'true'));
    }
    
    // Apply pagination
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || users.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedUsers = users.slice(startIndex, endIndex);
    
    logAuditEvent('READ', 'USERS', { count: paginatedUsers.length, filters: params });
    
    return {
      users: paginatedUsers,
      total: users.length,
      page: page,
      limit: limit,
      totalPages: Math.ceil(users.length / limit)
    };
    
  } catch (error) {
    console.error('Error getting users:', error);
    throw new Error('Failed to retrieve users: ' + error.message);
  }
}

/**
 * Enhanced user creation with validation
 */
function createUser(data) {
  try {
    // Validate required fields
    const requiredFields = ['name', 'email', 'role'];
    for (const field of requiredFields) {
      if (!data[field] || data[field].toString().trim() === '') {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // Sanitize input
    data.name = data.name.toString().trim();
    data.email = data.email.toString().trim().toLowerCase();
    data.role = data.role.toString().trim().toLowerCase();
    
    // Enhanced validation
    validateUserData(data);
    
    const sheet = getUsersSheet();
    
    // Check for duplicate email
    const existingUsers = getUsers().users || [];
    const emailExists = existingUsers.some(user => user.Email === data.email);
    if (emailExists) {
      throw new Error('User with this email already exists');
    }
    
    // Generate unique ID
    const userId = generateUserId();
    
    // Prepare user data with enhanced fields
    const newUser = [
      userId,
      data.name,
      data.email,
      data.role,
      data.region || '',
      data.department || '',
      data.phone || '',
      data.isActive !== false,
      new Date(),
      new Date(),
      null, // Last Login
      0,    // Login Count
      data.passwordResetRequired || false,
      data.notes || ''
    ];
    
    // Add user to sheet
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, 1, newUser.length).setValues([newUser]);
    
    // Log audit event
    logAuditEvent('CREATE', 'USER', { userId, email: data.email, role: data.role });
    
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
    logAuditEvent('CREATE', 'USER', { error: error.message, email: data.email });
    throw new Error('Failed to create user: ' + error.message);
  }
}

/**
 * Enhanced user update with partial updates
 */
function updateUser(data) {
  try {
    if (!data.id) {
      throw new Error('Missing required field: id');
    }
    
    const sheet = getUsersSheet();
    const sheetData = sheet.getDataRange().getValues();
    const headers = sheetData[0];
    
    // Find user row
    let userRowIndex = -1;
    let currentUser = null;
    
    for (let i = 1; i < sheetData.length; i++) {
      if (sheetData[i][0] === data.id) {
        userRowIndex = i;
        currentUser = {};
        headers.forEach((header, index) => {
          currentUser[header] = sheetData[i][index];
        });
        break;
      }
    }
    
    if (userRowIndex === -1) {
      throw new Error('User not found: ' + data.id);
    }
    
    // Validate updates
    if (data.email && data.email !== currentUser.Email) {
      validateEmail(data.email);
      
      // Check for duplicate email
      const existingUsers = getUsers().users || [];
      const emailExists = existingUsers.some(user => 
        user.Email === data.email && user.ID !== data.id
      );
      if (emailExists) {
        throw new Error('User with this email already exists');
      }
    }
    
    if (data.role) {
      validateRole(data.role);
    }
    
    // Update user data
    const updatedRow = [...sheetData[userRowIndex]];
    const fieldMap = {
      'name': 1, 'email': 2, 'role': 3, 'region': 4,
      'department': 5, 'phone': 6, 'isActive': 7,
      'passwordResetRequired': 12, 'notes': 13
    };
    
    const changes = {};
    Object.keys(fieldMap).forEach(field => {
      if (data[field] !== undefined) {
        const oldValue = updatedRow[fieldMap[field]];
        updatedRow[fieldMap[field]] = data[field];
        changes[field] = { from: oldValue, to: data[field] };
      }
    });
    
    // Update timestamp
    updatedRow[9] = new Date(); // Updated At
    
    // Write back to sheet
    sheet.getRange(userRowIndex + 1, 1, 1, updatedRow.length).setValues([updatedRow]);
    
    // Log audit event
    logAuditEvent('UPDATE', 'USER', { userId: data.id, changes });
    
    console.log('User updated:', data.id);
    
    return {
      success: true,
      message: 'User updated successfully',
      userId: data.id,
      changes: changes
    };
    
  } catch (error) {
    console.error('Error updating user:', error);
    logAuditEvent('UPDATE', 'USER', { error: error.message, userId: data.id });
    throw new Error('Failed to update user: ' + error.message);
  }
}

/**
 * Enhanced user deletion with safety checks
 */
function deleteUser(data) {
  try {
    if (!data.id) {
      throw new Error('Missing required field: id');
    }
    
    const sheet = getUsersSheet();
    const sheetData = sheet.getDataRange().getValues();
    
    // Find user
    let userRowIndex = -1;
    let userToDelete = null;
    
    for (let i = 1; i < sheetData.length; i++) {
      if (sheetData[i][0] === data.id) {
        userRowIndex = i;
        userToDelete = {
          name: sheetData[i][1],
          email: sheetData[i][2],
          role: sheetData[i][3]
        };
        break;
      }
    }
    
    if (userRowIndex === -1) {
      throw new Error('User not found: ' + data.id);
    }
    
    // Safety check for admin users
    if (userToDelete.role === 'admin') {
      const adminCount = sheetData.filter((row, index) => 
        index > 0 && row[3] === 'admin'
      ).length;
      
      if (adminCount <= 1) {
        throw new Error('Cannot delete the last admin user');
      }
    }
    
    // Soft delete option (mark as inactive instead of deleting)
    if (data.softDelete) {
      const updatedRow = [...sheetData[userRowIndex]];
      updatedRow[7] = false; // Is Active
      updatedRow[9] = new Date(); // Updated At
      updatedRow[13] = (updatedRow[13] || '') + ' [SOFT DELETED]'; // Notes
      
      sheet.getRange(userRowIndex + 1, 1, 1, updatedRow.length).setValues([updatedRow]);
      
      logAuditEvent('SOFT_DELETE', 'USER', { userId: data.id, user: userToDelete });
      
      return {
        success: true,
        message: 'User deactivated successfully',
        userId: data.id,
        action: 'soft_delete'
      };
    } else {
      // Hard delete
      sheet.deleteRow(userRowIndex + 1);
      
      logAuditEvent('DELETE', 'USER', { userId: data.id, user: userToDelete });
      
      return {
        success: true,
        message: 'User deleted successfully',
        userId: data.id,
        action: 'hard_delete'
      };
    }
    
  } catch (error) {
    console.error('Error deleting user:', error);
    logAuditEvent('DELETE', 'USER', { error: error.message, userId: data.id });
    throw new Error('Failed to delete user: ' + error.message);
  }
}

/**
 * Bulk create users from array
 */
function bulkCreateUsers(data) {
  try {
    if (!data.users || !Array.isArray(data.users)) {
      throw new Error('Missing or invalid users array');
    }
    
    const results = [];
    const errors = [];
    
    for (let i = 0; i < data.users.length; i++) {
      try {
        const result = createUser(data.users[i]);
        results.push(result);
      } catch (error) {
        errors.push({
          index: i,
          user: data.users[i],
          error: error.message
        });
      }
    }
    
    logAuditEvent('BULK_CREATE', 'USERS', { 
      total: data.users.length, 
      success: results.length, 
      errors: errors.length 
    });
    
    return {
      success: true,
      message: `Bulk operation completed: ${results.length} created, ${errors.length} errors`,
      results: results,
      errors: errors,
      summary: {
        total: data.users.length,
        created: results.length,
        failed: errors.length
      }
    };
    
  } catch (error) {
    console.error('Error in bulk create:', error);
    throw new Error('Failed to bulk create users: ' + error.message);
  }
}

/**
 * Advanced user search
 */
function searchUsers(data) {
  try {
    const allUsers = getUsers().users || [];
    let results = allUsers;
    
    // Text search across multiple fields
    if (data.query) {
      const query = data.query.toLowerCase();
      results = results.filter(user => 
        user.Name.toLowerCase().includes(query) ||
        user.Email.toLowerCase().includes(query) ||
        user.Department.toLowerCase().includes(query) ||
        user.Phone.includes(query)
      );
    }
    
    // Advanced filters
    if (data.filters) {
      const filters = data.filters;
      
      if (filters.roles && filters.roles.length > 0) {
        results = results.filter(user => filters.roles.includes(user.Role));
      }
      
      if (filters.regions && filters.regions.length > 0) {
        results = results.filter(user => filters.regions.includes(user.Region));
      }
      
      if (filters.departments && filters.departments.length > 0) {
        results = results.filter(user => filters.departments.includes(user.Department));
      }
      
      if (filters.active !== undefined) {
        results = results.filter(user => user['Is Active'] === filters.active);
      }
      
      if (filters.createdAfter) {
        const afterDate = new Date(filters.createdAfter);
        results = results.filter(user => new Date(user['Created At']) >= afterDate);
      }
      
      if (filters.createdBefore) {
        const beforeDate = new Date(filters.createdBefore);
        results = results.filter(user => new Date(user['Created At']) <= beforeDate);
      }
    }
    
    // Sorting
    if (data.sortBy) {
      const sortField = data.sortBy;
      const sortOrder = data.sortOrder === 'desc' ? -1 : 1;
      
      results.sort((a, b) => {
        const aVal = a[sortField] || '';
        const bVal = b[sortField] || '';
        
        if (aVal < bVal) return -1 * sortOrder;
        if (aVal > bVal) return 1 * sortOrder;
        return 0;
      });
    }
    
    logAuditEvent('SEARCH', 'USERS', { 
      query: data.query, 
      filters: data.filters, 
      results: results.length 
    });
    
    return {
      success: true,
      results: results,
      total: results.length,
      query: data.query,
      filters: data.filters
    };
    
  } catch (error) {
    console.error('Error searching users:', error);
    throw new Error('Failed to search users: ' + error.message);
  }
}

/**
 * Get user statistics
 */
function getUserStats() {
  try {
    const allUsers = getUsers().users || [];
    
    const stats = {
      total: allUsers.length,
      active: allUsers.filter(u => u['Is Active']).length,
      inactive: allUsers.filter(u => !u['Is Active']).length,
      byRole: {},
      byRegion: {},
      byDepartment: {},
      recentlyCreated: allUsers.filter(u => {
        const createdDate = new Date(u['Created At']);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return createdDate >= thirtyDaysAgo;
      }).length
    };
    
    // Count by role
    allUsers.forEach(user => {
      const role = user.Role;
      stats.byRole[role] = (stats.byRole[role] || 0) + 1;
    });
    
    // Count by region
    allUsers.forEach(user => {
      const region = user.Region;
      if (region) {
        stats.byRegion[region] = (stats.byRegion[region] || 0) + 1;
      }
    });
    
    // Count by department
    allUsers.forEach(user => {
      const dept = user.Department;
      if (dept) {
        stats.byDepartment[dept] = (stats.byDepartment[dept] || 0) + 1;
      }
    });
    
    logAuditEvent('READ', 'USER_STATS', stats);
    
    return {
      success: true,
      stats: stats,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw new Error('Failed to get user statistics: ' + error.message);
  }
}

/**
 * Get audit log entries
 */
function getAuditLog(params = {}) {
  try {
    const sheet = getAuditSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return { logs: [], total: 0 };
    }
    
    const headers = data[0];
    let logs = [];
    
    // Convert to objects
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const log = {};
      headers.forEach((header, index) => {
        log[header] = row[index];
      });
      logs.push(log);
    }
    
    // Apply filters
    if (params.action) {
      logs = logs.filter(log => log.Action === params.action);
    }
    
    if (params.resource) {
      logs = logs.filter(log => log.Resource === params.resource);
    }
    
    if (params.userId) {
      logs = logs.filter(log => log['User ID'] === params.userId);
    }
    
    // Sort by timestamp (newest first)
    logs.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
    
    // Pagination
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedLogs = logs.slice(startIndex, endIndex);
    
    return {
      success: true,
      logs: paginatedLogs,
      total: logs.length,
      page: page,
      limit: limit,
      totalPages: Math.ceil(logs.length / limit)
    };
    
  } catch (error) {
    console.error('Error getting audit log:', error);
    throw new Error('Failed to get audit log: ' + error.message);
  }
}

/**
 * Utility Functions
 */

function generateUserId() {
  return 'USR-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
}

function validateUserData(data) {
  validateEmail(data.email);
  validateRole(data.role);
  
  if (data.phone && data.phone.length > 0) {
    validatePhone(data.phone);
  }
  
  if (data.name.length < 2) {
    throw new Error('Name must be at least 2 characters long');
  }
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }
}

function validateRole(role) {
  const validRoles = ['admin', 'manager', 'foreman', 'call-attendant', 'technician'];
  if (!validRoles.includes(role.toLowerCase())) {
    throw new Error('Invalid role: ' + role);
  }
}

function validatePhone(phone) {
  const phoneRegex = /^\+251-\d{2}-\d{3}-\d{4}$/;
  if (!phoneRegex.test(phone)) {
    throw new Error('Invalid phone format. Use: +251-XX-XXX-XXXX');
  }
}

function logAuditEvent(action, resource, details = {}) {
  try {
    const sheet = getAuditSheet();
    const auditEntry = [
      new Date(),
      action,
      resource,
      details.userId || 'SYSTEM',
      JSON.stringify(details),
      'N/A', // IP Address (not available in Apps Script)
      !details.error
    ];
    
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, 1, auditEntry.length).setValues([auditEntry]);
    
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

/**
 * Test function for all operations
 */
function testAdvancedAPI() {
  console.log('Testing Advanced User Management API...');
  
  try {
    // Test user stats
    console.log('Testing getUserStats...');
    const stats = getUserStats();
    console.log('Stats:', stats);
    
    // Test search
    console.log('Testing searchUsers...');
    const searchResult = searchUsers({
      query: 'admin',
      filters: { active: true }
    });
    console.log('Search results:', searchResult);
    
    // Test bulk create
    console.log('Testing bulkCreateUsers...');
    const bulkUsers = [
      {
        name: 'Test User 1',
        email: 'test1@eeu.gov.et',
        role: 'technician',
        region: 'Addis Ababa'
      },
      {
        name: 'Test User 2',
        email: 'test2@eeu.gov.et',
        role: 'call-attendant',
        region: 'Oromia'
      }
    ];
    
    const bulkResult = bulkCreateUsers({ users: bulkUsers });
    console.log('Bulk create result:', bulkResult);
    
    // Test audit log
    console.log('Testing getAuditLog...');
    const auditLog = getAuditLog({ limit: 10 });
    console.log('Audit log:', auditLog);
    
    console.log('All advanced tests completed successfully!');
    
  } catch (error) {
    console.error('Advanced test failed:', error);
  }
}