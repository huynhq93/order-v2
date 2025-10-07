import { google } from 'googleapis';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req, res) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  try {
    const { type, month, year } = req.query;

    // Google Sheets authentication
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (type === 'ORDERS') {
      const range = `${month}-${year}!A:L`;
      
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      const rows = response.data.values || [];
      if (rows.length === 0) {
        return res.status(200).json({ data: [] });
      }

      const headers = rows[0];
      const data = rows.slice(1).map((row, index) => {
        const order = {};
        headers.forEach((header, i) => {
          order[header] = row[i] || '';
        });
        order.rowIndex = index + 2; // +2 because sheet starts from 1 and we skip header
        return order;
      });

      res.status(200).json({ data });
    } else {
      res.status(400).json({ error: 'Invalid type parameter' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
