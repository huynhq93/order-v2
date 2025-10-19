const express = require('express');
const router = express.Router();
const { google } = require('googleapis');

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  keyFile: './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = '1YIFqfkIqN2oS4uKxGYCpMLNrFN-1WkqrGdHgHPzxdIU';

// Create ORDCHINA record
router.post('/ordchina', async (req, res) => {
  try {
    const {
      managementCode,
      productName,
      productImage,
      status,
      shippingCodes,
      note,
      orderDate,
      quantity,
      importPrice,
      date
    } = req.body;

    const sheetName = `ORDCHINA_${date.month}_${date.year}`;
    
    // Create sheet if it doesn't exist
    await createSheetIfNotExists(sheetName);

    // Prepare row data
    const rowData = [
      managementCode,           // Column A: Mã quản lý order
      productName,              // Column B: Tên sản phẩm
      productImage,             // Column C: HÌNH ẢNH
      status,                   // Column D: STATUS
      shippingCodes,            // Column E: MÃ VẬN ĐƠN
      note,                     // Column F: NOTE
      orderDate,                // Column G: NGÀY CHỐT MUA
      '',                       // Column H: NGÀY Hàng về (empty)
      quantity,                 // Column I: Số lượng
      importPrice               // Column J: Giá nhập
    ];

    // Append data to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:J`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [rowData]
      }
    });

    res.json({ success: true, managementCode });
  } catch (error) {
    console.error('Error creating ORDCHINA record:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to create sheet if it doesn't exist
async function createSheetIfNotExists(sheetName) {
  try {
    // Check if sheet exists
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID
    });

    const sheetExists = spreadsheet.data.sheets.some(
      sheet => sheet.properties.title === sheetName
    );

    if (!sheetExists) {
      // Create new sheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName
                }
              }
            }
          ]
        }
      });

      // Add headers
      const headers = [
        'Mã quản lý order',
        'Tên sản phẩm',
        'HÌNH ẢNH',
        'STATUS',
        'MÃ VẬN ĐƠN',
        'NOTE',
        'NGÀY CHỐT MUA',
        'NGÀY Hàng về',
        'Số lượng',
        'Giá nhập'
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A1:J1`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [headers]
        }
      });
    }
  } catch (error) {
    console.error('Error creating sheet:', error);
    throw error;
  }
}

module.exports = router;
