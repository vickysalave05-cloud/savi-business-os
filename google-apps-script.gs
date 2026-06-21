/**
 * ============================================================================
 * SAVI PAINTING OS - MASTER GOOGLE APPS SCRIPT DATABASE ENGINE
 * ============================================================================
 * 
 * Deployment Instructions:
 * 1. Open your master Google Sheet: https://docs.google.com/spreadsheets/d/17NEY7WAN1uYx2GIcsyPuX-MMBoXHJpUbanJ-FHq9EsM/edit
 * 2. In the menu, go to Extensions > Apps Script.
 * 3. Delete any default code in Code.gs, paste this entire file in.
 * 4. Save and rename the project to 'Savi Painting OS Database Controller'.
 * 5. Click Deploy > New Deployment.
 * 6. Under 'Select type', select Web App.
 * 7. Change 'Execute as' to 'Me' (vickysalave05@gmail.com).
 * 8. Change 'Who has access' to 'Anyone'.
 * 9. Click Deploy. Grant permissions when prompted.
 * 10. Copy the Web App URL (the one ending in /exec) and paste it into the 
 *     Google Workspace Sync Center in Savi Painting OS Settings.
 * 
 * Master Resources bound in this Script:
 * - Master Spreadsheet: https://docs.google.com/spreadsheets/d/17NEY7WAN1uYx2GIcsyPuX-MMBoXHJpUbanJ-FHq9EsM/edit
 * - Master Drive Storage: http://drive.google.com/drive/folders/1nLLHXy1vj3j6Dx9PeChHplPGiPofvinY
 */

const MASTER_SPREADSHEET_ID = '17NEY7WAN1uYx2GIcsyPuX-MMBoXHJpUbanJ-FHq9EsM';
const MASTER_DRIVE_FOLDER_ID = '1nLLHXy1vj3j6Dx9PeChHplPGiPofvinY';

// Enable CORS and respond cleanly to pre-flight OPTIONS requests
function doGet(e) {
  const action = e.parameter.action;
  
  if (!action) {
    return createJsonResponse({ status: 'success', message: 'Savi Painting OS Apps Script Engine is ONLINE.' });
  }

  try {
    const ss = SpreadsheetApp.openById(MASTER_SPREADSHEET_ID);
    
    if (action === 'getReports') {
      return getReportingData(ss);
    } else if (action === 'searchAll') {
      const q = e.parameter.q;
      return querySearchEngine(ss, q);
    } else if (action === 'loadAllData') {
      return loadAllStoredData(ss);
    }
    
    return createJsonResponse({ status: 'error', message: 'Unknown request action parameter.' });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: 'GET execution crashed: ' + err.toString() });
  }
}

function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;
    const ss = SpreadsheetApp.openById(MASTER_SPREADSHEET_ID);
    
    // Automatically trigger sheet structures setup if missing
    initializeSheetsIfMissing(ss);

    let response;
    
    switch (action) {
      case 'syncRecord':
        response = syncGeneralRecord(ss, requestData);
        break;
      case 'uploadDocument':
        response = handleDocumentUploadAndTrack(ss, requestData);
        break;
      case 'triggerBackup':
        response = triggerSystemBackup();
        break;
      default:
        response = { status: 'error', message: 'Action ' + action + ' is not registered in post handler.' };
    }

    return createJsonResponse(response);
  } catch (err) {
    return createJsonResponse({ status: 'error', message: 'POST processing crashed: ' + err.toString() });
  }
}

// Helper to return json output with appropriate Headers
function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Automatically creates all tables (tabs) with column headers
 * inside the Google Sheet if they don't already exist.
 */
function initializeSheetsIfMissing(ss) {
  const requiredSheets = {
    'Leads': ['ID', 'Date', 'Name', 'Mobile', 'Email', 'Status', 'Source', 'Notes', 'Created At', 'Updated At'],
    'Customers': ['Customer ID', 'Name', 'Mobile', 'Email', 'Location Address', 'Source', 'Status', 'Registered Date'],
    'SiteVisits': ['Visit ID', 'Customer ID', 'Customer Name', 'Date', 'Time', 'Latitude', 'Longitude', 'Google Maps Link', 'Notes', 'Recorded At'],
    'Measurements': ['Measurement ID', 'Customer ID', 'Date', 'Description', 'Approx Area (SqFt)', 'Raw Rooms Layout JSON', 'Recorded At'],
    'Quotations': ['Quotation ID', 'Customer ID', 'Quotation Number', 'Subtotal', 'Discount %', 'Discount Amt', 'Profit Margin %', 'Profit Margin Amt', 'GST %', 'GST Amt', 'Final Amount', 'Status', 'Created At'],
    'QuotationRevisions': ['Revision ID', 'Quotation ID', 'Revision Date', 'Original Amount', 'Added Amount', 'Final Amount', 'Reason', 'Approved By'],
    'Invoices': ['Invoice ID', 'Customer ID', 'Invoice Number', 'Quotation ID', 'Subtotal', 'GST Amount', 'Final Amount', 'Due Date', 'Status', 'Created At'],
    'Payments': ['Payment ID', 'Customer ID', 'Invoice ID', 'Amount', 'Date', 'Mode', 'Reference No', 'Recorded At'],
    'Materials': ['Purchase ID', 'Customer ID', 'Project ID', 'Material Name', 'Category', 'Brand', 'Quantity', 'Rate', 'Total Amount', 'Invoice URL', 'Recorded At'],
    'Labours': ['Labour ID', 'Customer ID', 'Project ID', 'Worker Name', 'Role', 'Wage Amount', 'Payment Status', 'Worked Date'],
    'WhatsAppHistory': ['Log ID', 'Customer ID', 'Sent At', 'Recipient Mobile', 'Message Template', 'Status'],
    'Campaigns': ['Campaign ID', 'Title', 'Date Sent', 'Audience Type', 'Total Reach', 'Trigger Links Count', 'Est Budget'],
    'AuditLogs': ['Log ID', 'Timestamp', 'Operator', 'Action Performed', 'Entity ID', 'Old Value', 'New Value', 'Modification Reason']
  };

  for (const sheetName in requiredSheets) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(requiredSheets[sheetName]);
      // Format the header row elegantly
      sheet.getRange(1, 1, 1, requiredSheets[sheetName].length)
        .setFontWeight('bold')
        .setBackground('#f1f5f9')
        .setTextDirection(SpreadsheetApp.TextDirection.LEFT);
    }
  }
}

/**
 * Universal record writer that appends/inserts records sequentially.
 */
function syncGeneralRecord(ss, data) {
  const targetSheet = data.sheetName;
  const sheet = ss.getSheetByName(targetSheet);
  
  if (!sheet) {
    return { status: 'error', message: 'Target sheet ' + targetSheet + ' could not be found to sync.' };
  }

  const rowData = data.row;
  if (!rowData || !Array.isArray(rowData)) {
    return { status: 'error', message: 'Invalid payload row data. Expecting an array.' };
  }

  // Handle unique ID constraint matching (Never duplicate entries!)
  const idToMatch = rowData[0];
  let rowIndexMatched = -1;
  
  if (idToMatch) {
    const colAValues = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues();
    for (let i = 0; i < colAValues.length; i++) {
      if (colAValues[i][0] == idToMatch) {
        rowIndexMatched = i + 1; // 1-indexed spreadsheet row
        break;
      }
    }
  }

  if (rowIndexMatched > 0) {
    // Audit trace logging before overwrite (Archive trace logic)
    const oldRowValues = sheet.getRange(rowIndexMatched, 1, 1, sheet.getLastRow() === 1 ? sheet.getLastColumn() : rowData.length).getValues()[0];
    logAuditTrail(ss, 'UPDATE', targetSheet, idToMatch, oldRowValues.join(' | '), rowData.join(' | '), 'System Automatic Sync Overwrite');
    
    // Update existing row
    const range = sheet.getRange(rowIndexMatched, 1, 1, rowData.length);
    range.setValues([rowData]);
  } else {
    // Append new row
    sheet.appendRow(rowData);
    logAuditTrail(ss, 'CREATE', targetSheet, idToMatch, '', rowData.join(' | '), 'System Automated Creation Sync');
  }

  return { status: 'success', message: 'Record written successfully inside sheet ' + targetSheet + '.' };
}

/**
 * Document uploader and tracking engine (Google Drive + Google Sheet connector)
 */
function handleDocumentUploadAndTrack(ss, data) {
  const base64Data = data.base64File;
  const originalFileName = data.fileName;
  const docType = data.documentType; // Quotation, Invoice, Agreement, SiteVisit, Measurement etc.
  const customerId = data.customerId;
  const customerName = data.customerName || 'Customer';

  if (!base64Data || !originalFileName) {
    return { status: 'error', message: 'Missing base64 data stream or file identifier.' };
  }

  try {
    // 1. Get or create Customer Subfolder under Master Google Drive location
    const rootDir = DriveApp.getFolderById(MASTER_DRIVE_FOLDER_ID);
    let customerFolder = getSubfolderName(rootDir, customerName + ' - ' + customerId);
    
    // 2. Convert base64 stream to raw blob array
    const decodedBytes = Utilities.base64Decode(base64Data);
    const mimeType = originalFileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
    const blob = Utilities.newBlob(decodedBytes, mimeType, originalFileName);
    
    // 3. Upload file explicitly to the customer subfolder
    const file = customerFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    const fileId = file.getId();
    const fileUrl = file.getUrl();

    // 4. Save into sheets log DocumentTracking index
    let docSheet = ss.getSheetByName('DocumentTracking');
    if (!docSheet) {
      docSheet = ss.insertSheet('DocumentTracking');
      docSheet.appendRow(['File ID', 'File Name', 'Document Type', 'Customer ID', 'Project ID', 'Google Drive File ID', 'Google Drive URL', 'Folder ID', 'Created Date', 'Created By']);
      docSheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#eff6ff');
    }

    const docNumber = data.docNumber || 'DOC-' + Math.floor(1000 + Math.random() * 9000);
    const createdDateStr = new Date().toISOString().split('T')[0];
    const createdByStr = data.createdBy || 'vickysalave05@gmail.com';

    docSheet.appendRow([
      docNumber,
      originalFileName,
      docType,
      customerId,
      'PROJ-' + customerId.slice(-6).toUpperCase(),
      fileId,
      fileUrl,
      customerFolder.getId(),
      createdDateStr,
      createdByStr
    ]);

    logAuditTrail(ss, 'UPLOAD_DOC', 'DocumentTracking', docNumber, '', fileUrl, 'Uploaded PDF compiled to Google Drive with automated sheet tracking');

    return {
      status: 'success',
      message: 'PDF exported, uploaded to Google Drive, and indexed in Google Sheet successfully!',
      fileId: fileId,
      fileUrl: fileUrl,
      folderId: customerFolder.getId()
    };
  } catch (err) {
    return { status: 'error', message: 'Document upload failed helper: ' + err.toString() };
  }
}

// Drive folder navigation helper
function getSubfolderName(parentFolder, name) {
  const folders = parentFolder.getFolders();
  while (folders.hasNext()) {
    const f = folders.next();
    if (f.getName() === name) {
      return f;
    }
  }
  return parentFolder.createFolder(name);
}

// Double-entry record audit logger
function logAuditTrail(ss, action, entityName, entityId, oldVal, newVal, reason) {
  try {
    const logSheet = ss.getSheetByName('AuditLogs');
    if (!logSheet) return;
    
    const logId = 'LOG-' + Math.floor(100000 + Math.random() * 900000);
    const timeStampStr = new Date().toLocaleString();
    const operator = 'vickysalave05@gmail.com';

    logSheet.appendRow([
      logId,
      timeStampStr,
      operator,
      action,
      entityName + ' : ' + entityId,
      oldVal ? oldVal.slice(0, 300) : 'N/A',
      newVal ? newVal.slice(0, 300) : 'N/A',
      reason
    ]);
  } catch (e) {
    // fail-safe
  }
}

/**
 * Automate Daily, Weekly and Monthly Google Sheet backups inside Drive.
 */
function triggerSystemBackup() {
  try {
    const rootDir = DriveApp.getFolderById(MASTER_DRIVE_FOLDER_ID);
    const backupFolder = getSubfolderName(rootDir, 'System Backups Archive');
    
    // Copy the main spreadsheet to the backup folder
    const file = DriveApp.getFileById(MASTER_SPREADSHEET_ID);
    const formattedDate = Utilities.formatDate(new Date(), 'GMT+5.5', 'yyyy-MM-dd_HH-mm');
    const backupName = 'SAVI_PaintingOS_Backup_' + formattedDate;
    
    file.makeCopy(backupName, backupFolder);

    return { status: 'success', message: 'Backup created successfully: ' + backupName };
  } catch (err) {
    return { status: 'error', message: 'System auto backup encountered error: ' + err.toString() };
  }
}

/**
 * Loads all sheets into a clean consolidated JSON payload,
 * enabling full bootstrap on app reload or offline recoveries.
 */
function loadAllStoredData(ss) {
  const sheets = ['Leads', 'Customers', 'SiteVisits', 'Measurements', 'Quotations', 'Invoices', 'Payments', 'Materials', 'Labours', 'DocumentTracking'];
  const consolidated = {};

  sheets.forEach((sName) => {
    const sheet = ss.getSheetByName(sName);
    if (sheet) {
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
        consolidated[sName] = data.map((row) => {
          const item = {};
          headers.forEach((h, idx) => {
            item[h.replace(/\s+/g, '')] = row[idx];
          });
          return item;
        });
      } else {
        consolidated[sName] = [];
      }
    } else {
      consolidated[sName] = [];
    }
  });

  return createJsonResponse({ status: 'success', data: consolidated });
}

/**
 * Fast indexing search engine return complete linked history of any resource
 */
function querySearchEngine(ss, q) {
  if (!q) return createJsonResponse({ status: 'error', message: 'Missing search query parameter q.' });
  const normalizedQ = q.toLowerCase().trim();
  const sheets = ['Leads', 'Customers', 'Quotations', 'Invoices', 'Labours', 'Materials'];
  const matches = {};

  sheets.forEach((sName) => {
    const sheet = ss.getSheetByName(sName);
    if (sheet) {
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        const data = sheet.getRange(1, 1, lastRow, sheet.getLastColumn()).getValues();
        const headers = data[0];
        const rows = data.slice(1);
        const sheetMatches = [];

        rows.forEach((row) => {
          const isMatch = row.some((cell) => cell.toString().toLowerCase().includes(normalizedQ));
          if (isMatch) {
            const mappedObj = {};
            headers.forEach((h, idx) => {
              mappedObj[h.replace(/\s+/g, '')] = row[idx];
            });
            sheetMatches.push(mappedObj);
          }
        });
        matches[sName] = sheetMatches;
      }
    }
  });

  return createJsonResponse({ status: 'success', query: q, results: matches });
}

/**
 * Gathers business statistics directly from the sheets for custom reports.
 */
function getReportingData(ss) {
  try {
    const quotes = ss.getSheetByName('Quotations');
    const invoices = ss.getSheetByName('Invoices');
    const payments = ss.getSheetByName('Payments');
    const budget = ss.getSheetByName('Materials');
    
    let totalRevenue = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;
    let totalExpenses = 0;

    if (quotes && quotes.getLastRow() > 1) {
      const values = quotes.getRange(2, 11, quotes.getLastRow() - 1, 1).getValues();
      values.forEach((v) => { if (!isNaN(v[0])) totalRevenue += Number(v[0]); });
    }

    if (payments && payments.getLastRow() > 1) {
      const values = payments.getRange(2, 4, payments.getLastRow() - 1, 1).getValues();
      values.forEach((v) => { if (!isNaN(v[0])) totalCollected += Number(v[0]); });
    }

    if (invoices && invoices.getLastRow() > 1) {
      const values = invoices.getRange(2, 7, invoices.getLastRow() - 1, 1).getValues();
      const statusList = invoices.getRange(2, 9, invoices.getLastRow() - 1, 1).getValues();
      values.forEach((v, idx) => {
        if (statusList[idx][0] !== 'Paid' && !isNaN(v[0])) {
          totalOutstanding += Number(v[0]);
        }
      });
    }

    if (budget && budget.getLastRow() > 1) {
      const values = budget.getRange(2, 9, budget.getLastRow() - 1, 1).getValues();
      values.forEach((v) => { if (!isNaN(v[0])) totalExpenses += Number(v[0]); });
    }

    return createJsonResponse({
      status: 'success',
      report: {
        totalRevenue: totalRevenue,
        totalCollected: totalCollected,
        totalOutstanding: totalOutstanding,
        totalExpenses: totalExpenses,
        computedMargin: totalRevenue > 0 ? Math.round(((totalRevenue - totalExpenses) / totalRevenue) * 100) : 0,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: 'Report computation failed: ' + err.toString() });
  }
}
