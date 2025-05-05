/**
 * Google Apps Script to collect subscription details via POST request
 * and append them to a Google Sheet.
 * 
 * Sheet format:
 * Row 1 (headers): Timestamp | Email | WhatsApp Number | Terms Agreed
 */

/**
 * doPost function to handle POST requests with subscription data.
 * Expects JSON payload with keys: email, whatsapp, terms (boolean).
 */
function doPost(e) {
  try {
    // Parse the JSON payload from the POST request body
    var data = JSON.parse(e.postData.contents);

    // Validate required fields
    if (!data.email || !data.whatsapp || data.terms !== true) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Missing or invalid fields. Email, WhatsApp, and terms agreement are required.'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Open the Google Sheet by ID or by name (assuming the script is bound to the sheet)
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Subscriptions');
    if (!sheet) {
      // If the sheet does not exist, create it and set headers
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Subscriptions');
      sheet.appendRow(['Timestamp', 'Email', 'WhatsApp Number', 'Terms Agreed']);
    }

    // Append the subscription data with timestamp
    sheet.appendRow([
      new Date(),
      data.email,
      data.whatsapp,
      data.terms ? 'Yes' : 'No'
    ]);

    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Subscription details saved successfully.'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Failed to process request: ' + error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
