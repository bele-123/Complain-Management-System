/**
 * Ethiopian Electric Utility - Enhanced Backend System
 * Google Apps Script implementation for comprehensive complaint management
 * 
 * Features:
 * - User Management (CRUD operations)
 * - Complaint Management
 * - Dashboard Analytics
 * - User Settings & Preferences
 * - Notifications System
 * - Sidebar State Management
 * - Shortcuts Management
 * - Authentication
 */

// Configuration
const CONFIG = {
  SHEET_ID: '1vi7SguM67N8BP5_5dNSPh4GO0WDe-Y6_LwfY-GliW0o', // Replace with your actual Google Sheet ID
  USER_SHEET: 'Users',
  USER_SETTINGS_SHEET: 'UserSettings',
  NOTIFICATIONS_SHEET: 'Notifications',
  COMPLAINT_SHEET: 'Complaints',
  ANALYTICS_SHEET: 'Analytics',
  SIDEBAR_STATE_SHEET: 'SidebarState',
  SHORTCUTS_SHEET: 'Shortcuts',
  LOG_SHEET: 'Logs'
};

// --- MAIN REQUEST HANDLERS ---

/**
 * Handle GET requests
 */
function doGet(e) {
  try {
    var action = e.parameter && e.parameter.action;
    
    switch(action) {
      case 'getComplaints':
        return getComplaints();
      case 'getComplaint':
        return getComplaint(e.parameter.id);
      case 'getDashboardStats':
        return getDashboardStats();
      case 'getUsers':
        return getUsers();
      case 'getSidebarData':
        return getSidebarData(e.parameter.userId);
      case 'getUserSettings':
        return getUserSettings(e.parameter.userId);
      case 'getNotifications':
        return getNotifications(e.parameter.userId);
      case 'getSidebarState':
        return getSidebarState(e.parameter.userId);
      case 'getShortcuts':
        return getShortcuts(e.parameter.userId);
      default:
        return createErrorResponse('Invalid action');
    }
  } catch (error) {
    Logger.log('GET Error: ' + error.toString());
    return createErrorResponse(error.message);
  }
}

/**
 * Handle POST requests
 */
function doPost(e) {
  try {
    Logger.log('POST Data: ' + (e.postData && e.postData.contents));
    var data = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    var action = data.action;
    
    switch(action) {
      // User Management
      case 'createUser':
        return createUser(data);
      case 'updateUser':
        return updateUser(data);
      case 'deleteUser':
        return deleteUser(data);
      case 'toggleUserStatus':
        return toggleUserStatus(data);
      case 'login':
        return loginHandler(data);
      
      // Complaint Management
      case 'createComplaint':
        return createComplaint(data);
      case 'updateComplaint':
        return updateComplaint(data);
      case 'deleteComplaint':
        return deleteComplaint(data);
      
      // User Settings & Preferences
      case 'saveUserSettings':
        return saveUserSettings(e);
      case 'resetUserSettings':
        return resetUserSettings(e);
      case 'uploadProfilePic':
        return uploadProfilePic(e);
      
      // Notifications
      case 'markAllNotificationsRead':
        return markAllNotificationsRead(e);
      
      // Sidebar & UI State
      case 'saveSidebarState':
        return saveSidebarState(e);
      case 'saveShortcuts':
        return saveShortcuts(e);
      
      default:
        return createErrorResponse('Invalid action');
    }
  } catch (error) {
    Logger.log('POST Error: ' + error.toString());
    return createErrorResponse(error.message);
  }
}

// --- UTILITY FUNCTIONS ---

/**
 * Create standardized error response
 */
function createErrorResponse(message) {
  return ContentService
    .createTextOutput(JSON.stringify({ error: message, success: false }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Create standardized success response
 */
function createSuccessResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify({ ...data, success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Find row index by column value
 */
function findRow(sheet, columnName, value) {
  var data = sheet.getDataRange().getValues();
  if (data.length < 1) return -1;
  
  var headers = data[0];
  var columnIndex = headers.indexOf(columnName);
  if (columnIndex === -1) return -1;
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][columnIndex] == value) {
      return i + 1; // Return 1-based row number
    }
  }
  return -1;
}

/**
 * Get row data as object
 */
function getRowData(sheet, rowNumber) {
  if (rowNumber === -1) return {};
  
  var data = sheet.getDataRange().getValues();
  if (data.length < rowNumber) return {};
  
  var headers = data[0];
  var rowData = data[rowNumber - 1];
  var obj = {};
  
  for (var i = 0; i < headers.length; i++) {
    obj[headers[i]] = rowData[i];
  }
  
  return obj;
}

/**
 * Initialize sheet with headers if it doesn't exist
 */
function initializeSheet(sheetName, headers) {
  var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format headers
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('white');
  }
  
  return sheet;
}

// --- USER MANAGEMENT ---

/**
 * Get all users
 */
function getUsers() {
  try {
    var headers = ['ID', 'Name', 'Email', 'Role', 'Region', 'Department', 'Phone', 'Is Active', 'Created At', 'Updated At'];
    var sheet = initializeSheet(CONFIG.USER_SHEET, headers);
    var data = sheet.getDataRange().getValues();
    
    if (data.length < 2) {
      return ContentService
        .createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var users = [];
    for (var i = 1; i < data.length; i++) {
      var user = {};
      for (var j = 0; j < headers.length; j++) {
        user[headers[j]] = data[i][j];
      }
      users.push(user);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(users))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('getUsers Error: ' + error.toString());
    return createErrorResponse('Failed to get users: ' + error.message);
  }
}

/**
 * Create new user
 */
function createUser(data) {
  try {
    // Validate required fields
    if (!data.name || !data.email || !data.role) {
      throw new Error('Missing required fields: name, email, role');
    }
    
    // Validate email format
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('Invalid email format');
    }
    
    // Validate role
    var validRoles = ['admin', 'manager', 'foreman', 'call-attendant', 'technician'];
    if (validRoles.indexOf(data.role) === -1) {
      throw new Error('Invalid role');
    }
    
    var headers = ['ID', 'Name', 'Email', 'Role', 'Region', 'Department', 'Phone', 'Is Active', 'Created At', 'Updated At'];
    var sheet = initializeSheet(CONFIG.USER_SHEET, headers);
    
    // Check for duplicate email
    var existingData = sheet.getDataRange().getValues();
    for (var i = 1; i < existingData.length; i++) {
      if (existingData[i][2] === data.email) { // Email column
        throw new Error('User with this email already exists');
      }
    }
    
    // Generate user ID
    var userId = 'USR-' + Date.now();
    var now = new Date();
    
    var newUser = [
      userId,
      data.name,
      data.email,
      data.role,
      data.region || '',
      data.department || '',
      data.phone || '',
      data.isActive !== false,
      now,
      now
    ];
    
    sheet.appendRow(newUser);
    
    return createSuccessResponse({
      message: 'User created successfully',
      userId: userId
    });
  } catch (error) {
    Logger.log('createUser Error: ' + error.toString());
    return createErrorResponse('Failed to create user: ' + error.message);
  }
}

/**
 * Update existing user
 */
function updateUser(data) {
  try {
    if (!data.id) {
      throw new Error('Missing required field: id');
    }
    
    var headers = ['ID', 'Name', 'Email', 'Role', 'Region', 'Department', 'Phone', 'Is Active', 'Created At', 'Updated At'];
    var sheet = initializeSheet(CONFIG.USER_SHEET, headers);
    var row = findRow(sheet, 'ID', data.id);
    
    if (row === -1) {
      throw new Error('User not found');
    }
    
    // Get current data
    var currentData = getRowData(sheet, row);
    
    // Update fields
    var updatedData = [
      data.id,
      data.name || currentData.Name,
      data.email || currentData.Email,
      data.role || currentData.Role,
      data.region !== undefined ? data.region : currentData.Region,
      data.department !== undefined ? data.department : currentData.Department,
      data.phone !== undefined ? data.phone : currentData.Phone,
      data.isActive !== undefined ? data.isActive : currentData['Is Active'],
      currentData['Created At'],
      new Date()
    ];
    
    sheet.getRange(row, 1, 1, updatedData.length).setValues([updatedData]);
    
    return createSuccessResponse({
      message: 'User updated successfully',
      userId: data.id
    });
  } catch (error) {
    Logger.log('updateUser Error: ' + error.toString());
    return createErrorResponse('Failed to update user: ' + error.message);
  }
}

/**
 * Delete user
 */
function deleteUser(data) {
  try {
    if (!data.id) {
      throw new Error('Missing required field: id');
    }
    
    var headers = ['ID', 'Name', 'Email', 'Role', 'Region', 'Department', 'Phone', 'Is Active', 'Created At', 'Updated At'];
    var sheet = initializeSheet(CONFIG.USER_SHEET, headers);
    var row = findRow(sheet, 'ID', data.id);
    
    if (row === -1) {
      throw new Error('User not found');
    }
    
    // Check if it's the last admin
    var userData = getRowData(sheet, row);
    if (userData.Role === 'admin') {
      var allData = sheet.getDataRange().getValues();
      var adminCount = 0;
      for (var i = 1; i < allData.length; i++) {
        if (allData[i][3] === 'admin') adminCount++;
      }
      if (adminCount <= 1) {
        throw new Error('Cannot delete the last admin user');
      }
    }
    
    sheet.deleteRow(row);
    
    return createSuccessResponse({
      message: 'User deleted successfully',
      userId: data.id
    });
  } catch (error) {
    Logger.log('deleteUser Error: ' + error.toString());
    return createErrorResponse('Failed to delete user: ' + error.message);
  }
}

/**
 * Toggle user status
 */
function toggleUserStatus(data) {
  try {
    if (!data.id) {
      throw new Error('Missing required field: id');
    }
    
    var headers = ['ID', 'Name', 'Email', 'Role', 'Region', 'Department', 'Phone', 'Is Active', 'Created At', 'Updated At'];
    var sheet = initializeSheet(CONFIG.USER_SHEET, headers);
    var row = findRow(sheet, 'ID', data.id);
    
    if (row === -1) {
      throw new Error('User not found');
    }
    
    var currentData = getRowData(sheet, row);
    var newStatus = !currentData['Is Active'];
    
    sheet.getRange(row, 8).setValue(newStatus); // Is Active column
    sheet.getRange(row, 10).setValue(new Date()); // Updated At column
    
    return createSuccessResponse({
      message: 'User status updated successfully',
      userId: data.id,
      isActive: newStatus
    });
  } catch (error) {
    Logger.log('toggleUserStatus Error: ' + error.toString());
    return createErrorResponse('Failed to toggle user status: ' + error.message);
  }
}

// --- COMPLAINT MANAGEMENT ---

/**
 * Get all complaints
 */
function getComplaints() {
  try {
    var headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Category', 'Customer Name', 'Customer Email', 'Customer Phone', 'Location', 'Assigned To', 'Created At', 'Updated At', 'Notes', 'Attachments'];
    var sheet = initializeSheet(CONFIG.COMPLAINT_SHEET, headers);
    var data = sheet.getDataRange().getValues();
    
    if (data.length < 2) {
      return ContentService
        .createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var complaints = [];
    for (var i = 1; i < data.length; i++) {
      var complaint = {};
      for (var j = 0; j < headers.length; j++) {
        complaint[headers[j]] = data[i][j];
      }
      
      // Parse JSON fields
      if (complaint.Notes) {
        try { complaint.Notes = JSON.parse(complaint.Notes); } catch(e) {}
      }
      if (complaint.Attachments) {
        try { complaint.Attachments = JSON.parse(complaint.Attachments); } catch(e) {}
      }
      
      complaints.push(complaint);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(complaints))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('getComplaints Error: ' + error.toString());
    return createErrorResponse('Failed to get complaints: ' + error.message);
  }
}

/**
 * Get single complaint by ID
 */
function getComplaint(id) {
  try {
    var headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Category', 'Customer Name', 'Customer Email', 'Customer Phone', 'Location', 'Assigned To', 'Created At', 'Updated At', 'Notes', 'Attachments'];
    var sheet = initializeSheet(CONFIG.COMPLAINT_SHEET, headers);
    var data = sheet.getDataRange().getValues();
    
    if (data.length < 2) {
      return createErrorResponse('Complaint not found');
    }
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == id) { // ID column
        var complaint = {};
        for (var j = 0; j < headers.length; j++) {
          complaint[headers[j]] = data[i][j];
        }
        
        // Parse JSON fields
        if (complaint.Notes) {
          try { complaint.Notes = JSON.parse(complaint.Notes); } catch(e) {}
        }
        if (complaint.Attachments) {
          try { complaint.Attachments = JSON.parse(complaint.Attachments); } catch(e) {}
        }
        
        return ContentService
          .createTextOutput(JSON.stringify(complaint))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return createErrorResponse('Complaint not found');
  } catch (error) {
    Logger.log('getComplaint Error: ' + error.toString());
    return createErrorResponse('Failed to get complaint: ' + error.message);
  }
}

/**
 * Create new complaint
 */
function createComplaint(data) {
  try {
    // Validate required fields
    if (!data.title || !data.description || !data.customerName) {
      throw new Error('Missing required fields: title, description, customerName');
    }
    
    var headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Category', 'Customer Name', 'Customer Email', 'Customer Phone', 'Location', 'Assigned To', 'Created At', 'Updated At', 'Notes', 'Attachments'];
    var sheet = initializeSheet(CONFIG.COMPLAINT_SHEET, headers);
    
    var complaintId = 'CMP-' + Date.now();
    var now = new Date();
    
    var newComplaint = [
      complaintId,
      data.title,
      data.description,
      data.status || 'open',
      data.priority || 'medium',
      data.category || 'general',
      data.customerName,
      data.customerEmail || '',
      data.customerPhone || '',
      data.location || '',
      data.assignedTo || '',
      now,
      now,
      JSON.stringify(data.notes || []),
      JSON.stringify(data.attachments || [])
    ];
    
    sheet.appendRow(newComplaint);
    
    return createSuccessResponse({
      message: 'Complaint created successfully',
      complaintId: complaintId
    });
  } catch (error) {
    Logger.log('createComplaint Error: ' + error.toString());
    return createErrorResponse('Failed to create complaint: ' + error.message);
  }
}

/**
 * Update existing complaint
 */
function updateComplaint(data) {
  try {
    if (!data.id) {
      throw new Error('Missing required field: id');
    }
    
    var headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Category', 'Customer Name', 'Customer Email', 'Customer Phone', 'Location', 'Assigned To', 'Created At', 'Updated At', 'Notes', 'Attachments'];
    var sheet = initializeSheet(CONFIG.COMPLAINT_SHEET, headers);
    var row = findRow(sheet, 'ID', data.id);
    
    if (row === -1) {
      throw new Error('Complaint not found');
    }
    
    // Get current data
    var currentData = getRowData(sheet, row);
    
    // Update fields
    var updatedData = [
      data.id,
      data.title || currentData.Title,
      data.description || currentData.Description,
      data.status || currentData.Status,
      data.priority || currentData.Priority,
      data.category || currentData.Category,
      data.customerName || currentData['Customer Name'],
      data.customerEmail !== undefined ? data.customerEmail : currentData['Customer Email'],
      data.customerPhone !== undefined ? data.customerPhone : currentData['Customer Phone'],
      data.location !== undefined ? data.location : currentData.Location,
      data.assignedTo !== undefined ? data.assignedTo : currentData['Assigned To'],
      currentData['Created At'],
      new Date(),
      JSON.stringify(data.notes || currentData.Notes || []),
      JSON.stringify(data.attachments || currentData.Attachments || [])
    ];
    
    sheet.getRange(row, 1, 1, updatedData.length).setValues([updatedData]);
    
    return createSuccessResponse({
      message: 'Complaint updated successfully',
      complaintId: data.id
    });
  } catch (error) {
    Logger.log('updateComplaint Error: ' + error.toString());
    return createErrorResponse('Failed to update complaint: ' + error.message);
  }
}

/**
 * Delete complaint
 */
function deleteComplaint(data) {
  try {
    if (!data.id) {
      throw new Error('Missing required field: id');
    }
    
    var headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Category', 'Customer Name', 'Customer Email', 'Customer Phone', 'Location', 'Assigned To', 'Created At', 'Updated At', 'Notes', 'Attachments'];
    var sheet = initializeSheet(CONFIG.COMPLAINT_SHEET, headers);
    var row = findRow(sheet, 'ID', data.id);
    
    if (row === -1) {
      throw new Error('Complaint not found');
    }
    
    sheet.deleteRow(row);
    
    return createSuccessResponse({
      message: 'Complaint deleted successfully',
      complaintId: data.id
    });
  } catch (error) {
    Logger.log('deleteComplaint Error: ' + error.toString());
    return createErrorResponse('Failed to delete complaint: ' + error.message);
  }
}

// --- DASHBOARD ANALYTICS ---

/**
 * Get dashboard statistics
 */
function getDashboardStats() {
  try {
    var complaintHeaders = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Category', 'Customer Name', 'Customer Email', 'Customer Phone', 'Location', 'Assigned To', 'Created At', 'Updated At', 'Notes', 'Attachments'];
    var complaintSheet = initializeSheet(CONFIG.COMPLAINT_SHEET, complaintHeaders);
    var complaintData = complaintSheet.getDataRange().getValues();
    
    var userHeaders = ['ID', 'Name', 'Email', 'Role', 'Region', 'Department', 'Phone', 'Is Active', 'Created At', 'Updated At'];
    var userSheet = initializeSheet(CONFIG.USER_SHEET, userHeaders);
    var userData = userSheet.getDataRange().getValues();
    
    // Calculate complaint stats
    var totalComplaints = complaintData.length - 1; // Exclude header
    var openComplaints = 0;
    var closedComplaints = 0;
    var inProgressComplaints = 0;
    var highPriorityComplaints = 0;
    
    for (var i = 1; i < complaintData.length; i++) {
      var status = complaintData[i][3]; // Status column
      var priority = complaintData[i][4]; // Priority column
      
      if (status === 'open') openComplaints++;
      else if (status === 'closed') closedComplaints++;
      else if (status === 'in-progress') inProgressComplaints++;
      
      if (priority === 'high') highPriorityComplaints++;
    }
    
    // Calculate user stats
    var totalUsers = userData.length - 1; // Exclude header
    var activeUsers = 0;
    
    for (var i = 1; i < userData.length; i++) {
      if (userData[i][7]) activeUsers++; // Is Active column
    }
    
    var stats = {
      complaints: {
        total: totalComplaints,
        open: openComplaints,
        closed: closedComplaints,
        inProgress: inProgressComplaints,
        highPriority: highPriorityComplaints
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers
      },
      performance: {
        resolutionRate: totalComplaints > 0 ? Math.round((closedComplaints / totalComplaints) * 100) : 0,
        averageResponseTime: '2.5 hours', // This would be calculated from actual data
        customerSatisfaction: 4.2 // This would come from feedback data
      }
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(stats))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('getDashboardStats Error: ' + error.toString());
    return createErrorResponse('Failed to get dashboard stats: ' + error.message);
  }
}

// --- USER SETTINGS & PREFERENCES ---

/**
 * Get sidebar data (all-in-one)
 */
function getSidebarData(userId) {
  try {
    var user = getUserSettingsObj(userId);
    var notifications = getNotificationsObj(userId);
    var sidebarState = getSidebarStateObj(userId);
    var shortcuts = getShortcutsObj(userId);
    
    var data = {
      ...user,
      notifications: notifications,
      sidebarState: sidebarState,
      shortcuts: shortcuts
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('getSidebarData Error: ' + error.toString());
    return createErrorResponse('Failed to get sidebar data: ' + error.message);
  }
}

/**
 * Get user settings
 */
function getUserSettings(userId) {
  try {
    var user = getUserSettingsObj(userId);
    return ContentService
      .createTextOutput(JSON.stringify(user))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('getUserSettings Error: ' + error.toString());
    return createErrorResponse('Failed to get user settings: ' + error.message);
  }
}

/**
 * Get user settings object
 */
function getUserSettingsObj(userId) {
  var headers = ['userId', 'collapsed', 'theme', 'language', 'userStatus', 'highContrast', 'fontSize', 'reducedMotion', 'notificationsEnabled', 'sidebarOrder', 'quickActions', 'lastSidebarState', 'customShortcuts', 'lastVisitedPage', 'preferencesVersion'];
  var sheet = initializeSheet(CONFIG.USER_SETTINGS_SHEET, headers);
  var row = findRow(sheet, 'userId', userId);
  var obj = getRowData(sheet, row);
  
  // Parse JSON columns
  if (obj.sidebarOrder) {
    try { obj.sidebarOrder = JSON.parse(obj.sidebarOrder); } catch(e) { obj.sidebarOrder = []; }
  }
  if (obj.quickActions) {
    try { obj.quickActions = JSON.parse(obj.quickActions); } catch(e) { obj.quickActions = []; }
  }
  if (obj.lastSidebarState) {
    try { obj.lastSidebarState = JSON.parse(obj.lastSidebarState); } catch(e) { obj.lastSidebarState = {}; }
  }
  if (obj.customShortcuts) {
    try { obj.customShortcuts = JSON.parse(obj.customShortcuts); } catch(e) { obj.customShortcuts = []; }
  }
  
  return obj;
}

/**
 * Save user settings
 */
function saveUserSettings(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var headers = ['userId', 'collapsed', 'theme', 'language', 'userStatus', 'highContrast', 'fontSize', 'reducedMotion', 'notificationsEnabled', 'sidebarOrder', 'quickActions', 'lastSidebarState', 'customShortcuts', 'lastVisitedPage', 'preferencesVersion'];
    var sheet = initializeSheet(CONFIG.USER_SETTINGS_SHEET, headers);
    var row = findRow(sheet, 'userId', data.userId);
    
    var update = [
      data.userId,
      data.collapsed,
      data.theme,
      data.language,
      data.userStatus,
      data.highContrast,
      data.fontSize,
      data.reducedMotion,
      data.notificationsEnabled,
      JSON.stringify(data.sidebarOrder || []),
      JSON.stringify(data.quickActions || []),
      JSON.stringify(data.lastSidebarState || {}),
      JSON.stringify(data.customShortcuts || []),
      data.lastVisitedPage || '',
      data.preferencesVersion || 1
    ];
    
    if (row === -1) {
      sheet.appendRow(update);
    } else {
      sheet.getRange(row, 1, 1, update.length).setValues([update]);
    }
    
    return createSuccessResponse({ message: 'Settings saved successfully' });
  } catch (error) {
    Logger.log('saveUserSettings Error: ' + error.toString());
    return createErrorResponse('Failed to save user settings: ' + error.message);
  }
}

/**
 * Reset user settings to defaults
 */
function resetUserSettings(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var headers = ['userId', 'collapsed', 'theme', 'language', 'userStatus', 'highContrast', 'fontSize', 'reducedMotion', 'notificationsEnabled', 'sidebarOrder', 'quickActions', 'lastSidebarState', 'customShortcuts', 'lastVisitedPage', 'preferencesVersion'];
    var sheet = initializeSheet(CONFIG.USER_SETTINGS_SHEET, headers);
    var row = findRow(sheet, 'userId', data.userId);
    
    var defaults = {
      collapsed: false,
      theme: 'light',
      language: 'en',
      userStatus: 'online',
      highContrast: false,
      fontSize: 'normal',
      reducedMotion: false,
      notificationsEnabled: true,
      sidebarOrder: [],
      quickActions: [],
      lastSidebarState: {},
      customShortcuts: [],
      lastVisitedPage: '/',
      preferencesVersion: 1
    };
    
    var update = [
      data.userId,
      defaults.collapsed,
      defaults.theme,
      defaults.language,
      defaults.userStatus,
      defaults.highContrast,
      defaults.fontSize,
      defaults.reducedMotion,
      defaults.notificationsEnabled,
      JSON.stringify(defaults.sidebarOrder),
      JSON.stringify(defaults.quickActions),
      JSON.stringify(defaults.lastSidebarState),
      JSON.stringify(defaults.customShortcuts),
      defaults.lastVisitedPage,
      defaults.preferencesVersion
    ];
    
    if (row === -1) {
      sheet.appendRow(update);
    } else {
      sheet.getRange(row, 1, 1, update.length).setValues([update]);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(defaults))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('resetUserSettings Error: ' + error.toString());
    return createErrorResponse('Failed to reset user settings: ' + error.message);
  }
}

// --- NOTIFICATIONS ---

/**
 * Get notifications for user
 */
function getNotifications(userId) {
  try {
    var notifications = getNotificationsObj(userId);
    return ContentService
      .createTextOutput(JSON.stringify(notifications))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('getNotifications Error: ' + error.toString());
    return createErrorResponse('Failed to get notifications: ' + error.message);
  }
}

/**
 * Get notifications object
 */
function getNotificationsObj(userId) {
  var headers = ['id', 'userId', 'title', 'read', 'type', 'createdAt', 'meta'];
  var sheet = initializeSheet(CONFIG.NOTIFICATIONS_SHEET, headers);
  var data = sheet.getDataRange().getValues();
  var result = [];
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] == userId) { // userId column
      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        obj[headers[j]] = data[i][j];
      }
      if (obj.meta) {
        try { obj.meta = JSON.parse(obj.meta); } catch(e) { obj.meta = {}; }
      }
      result.push(obj);
    }
  }
  
  return result;
}

/**
 * Mark all notifications as read
 */
function markAllNotificationsRead(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var headers = ['id', 'userId', 'title', 'read', 'type', 'createdAt', 'meta'];
    var sheet = initializeSheet(CONFIG.NOTIFICATIONS_SHEET, headers);
    var dataRange = sheet.getDataRange().getValues();
    var userId = data.userId;
    
    for (var i = 1; i < dataRange.length; i++) {
      if (dataRange[i][1] == userId) {
        sheet.getRange(i + 1, 4).setValue(true); // 'read' column
      }
    }
    
    return createSuccessResponse({ message: 'All notifications marked as read' });
  } catch (error) {
    Logger.log('markAllNotificationsRead Error: ' + error.toString());
    return createErrorResponse('Failed to mark notifications as read: ' + error.message);
  }
}

// --- SIDEBAR STATE ---

/**
 * Get sidebar state
 */
function getSidebarState(userId) {
  try {
    var state = getSidebarStateObj(userId);
    return ContentService
      .createTextOutput(JSON.stringify(state))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('getSidebarState Error: ' + error.toString());
    return createErrorResponse('Failed to get sidebar state: ' + error.message);
  }
}

/**
 * Get sidebar state object
 */
function getSidebarStateObj(userId) {
  var headers = ['userId', 'sidebarOpen', 'lastWidth', 'lastPosition', 'lastActiveSection', 'lastActiveItem', 'meta'];
  var sheet = initializeSheet(CONFIG.SIDEBAR_STATE_SHEET, headers);
  var row = findRow(sheet, 'userId', userId);
  var obj = getRowData(sheet, row);
  
  if (obj.meta) {
    try { obj.meta = JSON.parse(obj.meta); } catch(e) { obj.meta = {}; }
  }
  
  return obj;
}

/**
 * Save sidebar state
 */
function saveSidebarState(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var headers = ['userId', 'sidebarOpen', 'lastWidth', 'lastPosition', 'lastActiveSection', 'lastActiveItem', 'meta'];
    var sheet = initializeSheet(CONFIG.SIDEBAR_STATE_SHEET, headers);
    var row = findRow(sheet, 'userId', data.userId);
    
    var update = [
      data.userId,
      data.sidebarOpen,
      data.lastWidth,
      data.lastPosition,
      data.lastActiveSection,
      data.lastActiveItem,
      JSON.stringify(data.meta || {})
    ];
    
    if (row === -1) {
      sheet.appendRow(update);
    } else {
      sheet.getRange(row, 1, 1, update.length).setValues([update]);
    }
    
    return createSuccessResponse({ message: 'Sidebar state saved successfully' });
  } catch (error) {
    Logger.log('saveSidebarState Error: ' + error.toString());
    return createErrorResponse('Failed to save sidebar state: ' + error.message);
  }
}

// --- SHORTCUTS ---

/**
 * Get shortcuts
 */
function getShortcuts(userId) {
  try {
    var shortcuts = getShortcutsObj(userId);
    return ContentService
      .createTextOutput(JSON.stringify(shortcuts))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('getShortcuts Error: ' + error.toString());
    return createErrorResponse('Failed to get shortcuts: ' + error.message);
  }
}

/**
 * Get shortcuts object
 */
function getShortcutsObj(userId) {
  var headers = ['userId', 'shortcuts', 'lastUpdated'];
  var sheet = initializeSheet(CONFIG.SHORTCUTS_SHEET, headers);
  var row = findRow(sheet, 'userId', userId);
  var obj = getRowData(sheet, row);
  
  if (obj.shortcuts) {
    try { obj.shortcuts = JSON.parse(obj.shortcuts); } catch(e) { obj.shortcuts = []; }
  }
  
  return obj;
}

/**
 * Save shortcuts
 */
function saveShortcuts(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var headers = ['userId', 'shortcuts', 'lastUpdated'];
    var sheet = initializeSheet(CONFIG.SHORTCUTS_SHEET, headers);
    var row = findRow(sheet, 'userId', data.userId);
    
    var update = [
      data.userId,
      JSON.stringify(data.shortcuts || []),
      new Date()
    ];
    
    if (row === -1) {
      sheet.appendRow(update);
    } else {
      sheet.getRange(row, 1, 1, update.length).setValues([update]);
    }
    
    return createSuccessResponse({ message: 'Shortcuts saved successfully' });
  } catch (error) {
    Logger.log('saveShortcuts Error: ' + error.toString());
    return createErrorResponse('Failed to save shortcuts: ' + error.message);
  }
}

// --- AUTHENTICATION ---

/**
 * Handle login requests
 */
function loginHandler(data) {
  try {
    if (!data.email || !data.password) {
      throw new Error('Missing email or password');
    }
    
    // In a real implementation, you would validate against stored credentials
    // For demo purposes, we'll use the demo credentials
    var demoCredentials = {
      'admin@eeu.gov.et': { role: 'admin', password: 'admin123' },
      'manager@eeu.gov.et': { role: 'manager', password: 'manager123' },
      'foreman@eeu.gov.et': { role: 'foreman', password: 'foreman123' },
      'callattendant@eeu.gov.et': { role: 'call-attendant', password: 'attendant123' },
      'technician@eeu.gov.et': { role: 'technician', password: 'tech123' }
    };
    
    var user = demoCredentials[data.email];
    if (user && user.password === data.password) {
      return createSuccessResponse({
        message: 'Login successful',
        user: {
          id: 'USR-' + Date.now(),
          email: data.email,
          role: user.role
        }
      });
    } else {
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    Logger.log('loginHandler Error: ' + error.toString());
    return createErrorResponse('Login failed: ' + error.message);
  }
}

// --- PROFILE PICTURE UPLOAD ---

/**
 * Handle profile picture upload
 */
function uploadProfilePic(e) {
  try {
    // This is a placeholder for profile picture upload functionality
    // In a real implementation, you would handle file uploads here
    return createSuccessResponse({
      message: 'Profile picture upload not implemented yet',
      url: 'https://via.placeholder.com/150'
    });
  } catch (error) {
    Logger.log('uploadProfilePic Error: ' + error.toString());
    return createErrorResponse('Failed to upload profile picture: ' + error.message);
  }
}

// --- TEST FUNCTION ---

/**
 * Test function to verify all functionality
 */
function testAPI() {
  Logger.log('Testing EEU Power Resolve API...');
  
  try {
    // Test user creation
    var testUser = createUser({
      name: 'Test User',
      email: 'test@eeu.gov.et',
      role: 'technician',
      region: 'Addis Ababa',
      department: 'Field Service'
    });
    Logger.log('User creation test: ' + JSON.stringify(testUser));
    
    // Test complaint creation
    var testComplaint = createComplaint({
      title: 'Test Complaint',
      description: 'This is a test complaint',
      customerName: 'Test Customer',
      customerEmail: 'customer@test.com',
      status: 'open',
      priority: 'medium'
    });
    Logger.log('Complaint creation test: ' + JSON.stringify(testComplaint));
    
    // Test dashboard stats
    var stats = getDashboardStats();
    Logger.log('Dashboard stats test: ' + JSON.stringify(stats));
    
    Logger.log('All tests completed successfully!');
    
  } catch (error) {
    Logger.log('Test failed: ' + error.toString());
  }
}