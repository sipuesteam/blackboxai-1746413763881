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

// Additional functions can be added here for reviews, visitor counts, etc.
