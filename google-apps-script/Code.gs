function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Products");
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({error: "Products sheet not found"}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  var range = sheet.getDataRange();
  var values = range.getValues();

  var products = [];
  var headerRow = values[0];

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var product = {};
    for (var j = 0; j < headerRow.length; j++) {
      product[headerRow[j]] = row[j];
    }
    products.push(product);
  }

  var jsonOutput = JSON.stringify(products);

  return ContentService.createTextOutput(jsonOutput)
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handles HTTP POST requests. This function is designed to receive subscription data
 * (email and WhatsApp number) from the PWA's subscription form.
 * @param {Object} e - The event parameter for a POST request, containing the post data.
 * @returns {ContentService.TextOutput} A JSON response indicating success or failure.
 */
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = "Subscriptions";
    var sheet = ss.getSheetByName(sheetName);

    // If the sheet doesn't exist, create it with headers.
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(["Timestamp", "Email", "WhatsApp"]);
    }

    // Parse the JSON payload from the POST request.
    var data = JSON.parse(e.postData.contents);
    var email = data.email;
    var whatsapp = data.whatsapp;
    var timestamp = new Date();

    // Basic validation
    if (!email || !whatsapp) {
      throw new Error("Email and WhatsApp number are required.");
    }

    // Append the new subscription data to the sheet.
    sheet.appendRow([timestamp, email, whatsapp]);

    // Return a success response.
    return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Subscription successful."
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Return an error response.
    return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Subscription failed: " + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Additional functions can be added here for reviews, visitor counts, etc.
