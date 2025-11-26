// ═══════════════════════════════════════════════════════════════════════════════
// PRESTIGE WEDDINGS KENYA - GOOGLE APPS SCRIPT ORDER HANDLER
// ═══════════════════════════════════════════════════════════════════════════════
// This script receives order data from your website and saves it to Google Sheets
// 
// DEPLOYMENT INSTRUCTIONS:
// 1. Open your Google Sheet
// 2. Go to Extensions → Apps Script
// 3. Delete any existing code
// 4. Paste this entire script
// 5. Click Deploy → New deployment → Web app
// 6. Execute as: your email
// 7. Who has access: Anyone
// 8. Copy the deployment URL to your website (script.js file)
// ═══════════════════════════════════════════════════════════════════════════════

function doPost(e) {
  try {
    // Parse the incoming POST request data
    const data = JSON.parse(e.postData.contents);
    
    // Get reference to the active Google Sheet
    const sheet = SpreadsheetApp.getActiveSheet();
    
    // Validate that we have required fields
    if (!data.orderId || !data.customerName || !data.email) {
      throw new Error('Missing required fields: orderId, customerName, or email');
    }
    
    // Append a new row with the order data
    // Columns: Order ID | Date/Time | Name | Email | Phone | Address | Items | Size | Total USD | Total KES | Payment Status | Order Status | Special Instructions
    sheet.appendRow([
      data.orderId,                    // Column A: Order ID (e.g., ORD-1234567890)
      data.dateTime,                   // Column B: Date/Time (formatted date)
      data.customerName,               // Column C: Customer Name
      data.email,                      // Column D: Email Address
      data.phone,                      // Column E: Phone Number (+254...)
      data.address,                    // Column F: Delivery Address
      data.items,                      // Column G: Items ordered
      data.itemSize,                   // Column H: Size (M, L, XL, XXL)
      data.totalUSD,                   // Column I: Total Amount in USD
      data.totalKES,                   // Column J: Total Amount in KES
      data.paymentStatus,              // Column K: Payment Status (Pending/Paid/etc)
      data.orderStatus,                // Column L: Order Status (New Order/Processing/etc)
      data.specialInstructions         // Column M: Special Instructions or notes
    ]);
    
    // Log successful order receipt for debugging/auditing
    Logger.log('✓ Order received and saved: ' + data.orderId);
    Logger.log('  Customer: ' + data.customerName);
    Logger.log('  Amount: $' + data.totalUSD);
    Logger.log('  Timestamp: ' + new Date().toString());
    
    // Return JSON success response
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Order received and saved to Google Sheets',
      orderId: data.orderId,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Log error for debugging
    Logger.log('❌ Error processing order: ' + error.toString());
    Logger.log('  Stack: ' + error.stack);
    Logger.log('  Request contents: ' + e.postData.contents);
    
    // Return JSON error response
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Error saving order: ' + error.toString(),
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional: Function to view recent logs (useful for debugging)
// Run this in the Apps Script editor to see recent executions
function viewRecentLogs() {
  const executions = SpreadsheetApp.getActiveSheet().getSheetId();
  Logger.log('Check the Executions tab to view detailed logs');
}

// Optional: Function to get sheet stats
function getOrderStats() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const orderCount = data.length - 1; // Exclude header row
  
  Logger.log('Total Orders: ' + orderCount);
  Logger.log('Sheet Name: ' + sheet.getName());
  Logger.log('Last Updated: ' + new Date().toString());
}
