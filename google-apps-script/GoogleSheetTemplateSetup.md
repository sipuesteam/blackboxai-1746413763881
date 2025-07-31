# Google Sheet Template Setup for Hygiene & Cleaning Products Store

This document describes the recommended Google Sheet template structure to be used with the Google Apps Script backend for the Hygiene & Cleaning Products Store project.

## Sheet: Products

| Column Name          | Description                                  | Example Value                          |
|----------------------|----------------------------------------------|--------------------------------------|
| productId            | Unique identifier for the product             | 101                                  |
| productName          | Name of the product                            | "Eco-friendly Hand Soap"              |
| productDescription   | Description of the product                      | "Gentle, natural hand soap with aloe"|
| productImageUrl      | URL to the product image                        | "https://example.com/image1.jpg"      |
| productPrice         | Current price of the product                    | 9.99                                 |
| productPriceOld      | Old price (for discount display)                | 12.99                                |
| productVideoUrl      | URL to product video (optional)                 | "https://youtu.be/abc123"             |
| productAsin          | Amazon ASIN for Amazon Pay integration          | "B07XYZ1234"                         |
| productCategory      | Category of the product                          | "Hand Care"                         |
| productRating        | Average star rating (numeric)                    | 4.5                                  |
| productReviewsCount  | Number of reviews                                | 120                                  |
| productBadge         | Badge text to display (e.g., "Best Seller")     | "Best Seller"                        |
| productFomoText      | FOMO microcopy text (e.g., "Only 3 left!")      | "Only 3 left!"                      |

## Additional Sheets (Optional)

- **Reviews**: To store detailed product reviews if needed.
- **VisitorCounts**: To track visitor counts or other analytics.

## Sheet: Subscriptions

This sheet is automatically created by the script if it does not exist. It is used to store contact information submitted through the subscription form in the PWA.

| Column Name | Description                               | Example Value                  |
|-------------|-------------------------------------------|--------------------------------|
| Timestamp   | The date and time the submission occurred.| "2024-07-30T10:00:00.000Z"      |
| Email       | The email address submitted by the user.  | "subscriber@example.com"       |
| WhatsApp    | The WhatsApp number submitted by the user.| "+1234567890"                  |


## Notes

- The "Products" sheet must have the first row as the header row with the exact column names as above.
- The "Subscriptions" sheet is managed automatically by the `doPost` function in the script.
- Data rows start from the second row.
- URLs should be publicly accessible for images and videos.
- The Apps Script code reads from the "Products" sheet to serve product data as JSON.

This template can be created manually or imported as a CSV file with the above columns.
