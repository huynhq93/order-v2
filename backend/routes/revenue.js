const express = require('express')
const router = express.Router()
const { google } = require('googleapis')

// Google Sheets setup
const auth = new google.auth.GoogleAuth({
  keyFile: './path/to/credentials.json', // Update với path thực tế
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
})

const sheets = google.sheets({ version: 'v4', auth })
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID

// Helper function to parse currency string to number
function parseCurrency(currencyStr) {
  if (!currencyStr || currencyStr === '') return 0
  // Remove all non-digit characters except minus sign
  const cleanStr = currencyStr.toString().replace(/[^\d-]/g, '')
  return parseInt(cleanStr) || 0
}

// Helper function to get month name from number
function getMonthName(monthNum, year) {
  const months = [
    'THÁNG 1',
    'THÁNG 2',
    'THÁNG 3',
    'THÁNG 4',
    'THÁNG 5',
    'THÁNG 6',
    'THÁNG 7',
    'THÁNG 8',
    'THÁNG 9',
    'THÁNG 10',
    'THÁNG 11',
    'THÁNG 12',
  ]
  return `${months[monthNum - 1]} ${year}`
}

// Get revenue data
router.post('/', async (req, res) => {
  try {
    const { type, year, month } = req.body

    let customerIncome = 0
    let ctvIncome = 0
    let totalExpense = 0
    let details = []

    if (type === 'month') {
      // Get data for specific month
      const monthName = getMonthName(month, year)

      // 1. Get customer income from "KHÁCH HÀNG" sheet
      try {
        const customerResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: `${monthName}!A:Z`, // Get full sheet data
        })

        const customerRows = customerResponse.data.values || []
        if (customerRows.length > 0) {
          // Find the "Tổng tiền" column (usually column G or H)
          const headerRow = customerRows[0]
          const totalColumnIndex = headerRow.findIndex(
            (header) => header && header.toLowerCase().includes('tổng'),
          )

          if (totalColumnIndex !== -1) {
            for (let i = 1; i < customerRows.length; i++) {
              const row = customerRows[i]
              if (row[totalColumnIndex]) {
                customerIncome += parseCurrency(row[totalColumnIndex])
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching customer data:', error)
      }

      // 2. Get CTV income from "CTV" sheet
      try {
        const ctvResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: `CTV ${monthName}!A:Z`, // Assuming CTV sheet format
        })

        const ctvRows = ctvResponse.data.values || []
        if (ctvRows.length > 0) {
          const headerRow = ctvRows[0]
          const totalColumnIndex = headerRow.findIndex(
            (header) => header && header.toLowerCase().includes('tổng'),
          )

          if (totalColumnIndex !== -1) {
            for (let i = 1; i < ctvRows.length; i++) {
              const row = ctvRows[i]
              if (row[totalColumnIndex]) {
                ctvIncome += parseCurrency(row[totalColumnIndex])
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching CTV data:', error)
      }

      // 3. Get expenses from "Order China" sheet, column K
      try {
        const chinaResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: `Order China ${monthName}!K:K`, // Column K for expenses
        })

        const chinaRows = chinaResponse.data.values || []
        for (let i = 1; i < chinaRows.length; i++) {
          // Skip header
          const row = chinaRows[i]
          if (row[0]) {
            totalExpense += parseCurrency(row[0])
          }
        }
      } catch (error) {
        console.error('Error fetching China order data:', error)
      }

      const totalIncome = customerIncome + ctvIncome
      const profit = totalIncome - totalExpense
      const profitMargin = totalIncome > 0 ? Math.round((profit / totalIncome) * 100) : 0

      details = [
        {
          period: `${month}/${year}`,
          customerIncome,
          ctvIncome,
          totalIncome,
          expense: totalExpense,
          profit,
          profitMargin,
        },
      ]
    } else if (type === 'year') {
      // Get data for full year (12 months)
      let yearlyCustomerIncome = 0
      let yearlyCtvIncome = 0
      let yearlyExpense = 0

      for (let m = 1; m <= 12; m++) {
        const monthName = getMonthName(m, year)
        let monthCustomerIncome = 0
        let monthCtvIncome = 0
        let monthExpense = 0

        // Get customer income for this month
        try {
          const customerResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${monthName}!A:Z`,
          })

          const customerRows = customerResponse.data.values || []
          if (customerRows.length > 0) {
            const headerRow = customerRows[0]
            const totalColumnIndex = headerRow.findIndex(
              (header) => header && header.toLowerCase().includes('tổng'),
            )

            if (totalColumnIndex !== -1) {
              for (let i = 1; i < customerRows.length; i++) {
                const row = customerRows[i]
                if (row[totalColumnIndex]) {
                  monthCustomerIncome += parseCurrency(row[totalColumnIndex])
                }
              }
            }
          }
        } catch (error) {
          // Sheet might not exist for this month, continue
        }

        // Get CTV income for this month
        try {
          const ctvResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `CTV ${monthName}!A:Z`,
          })

          const ctvRows = ctvResponse.data.values || []
          if (ctvRows.length > 0) {
            const headerRow = ctvRows[0]
            const totalColumnIndex = headerRow.findIndex(
              (header) => header && header.toLowerCase().includes('tổng'),
            )

            if (totalColumnIndex !== -1) {
              for (let i = 1; i < ctvRows.length; i++) {
                const row = ctvRows[i]
                if (row[totalColumnIndex]) {
                  monthCtvIncome += parseCurrency(row[totalColumnIndex])
                }
              }
            }
          }
        } catch (error) {
          // Sheet might not exist for this month, continue
        }

        // Get expenses for this month
        try {
          const chinaResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `Order China ${monthName}!K:K`,
          })

          const chinaRows = chinaResponse.data.values || []
          for (let i = 1; i < chinaRows.length; i++) {
            const row = chinaRows[i]
            if (row[0]) {
              monthExpense += parseCurrency(row[0])
            }
          }
        } catch (error) {
          // Sheet might not exist for this month, continue
        }

        const monthTotalIncome = monthCustomerIncome + monthCtvIncome
        const monthProfit = monthTotalIncome - monthExpense
        const monthProfitMargin =
          monthTotalIncome > 0 ? Math.round((monthProfit / monthTotalIncome) * 100) : 0

        details.push({
          period: `${m}/${year}`,
          customerIncome: monthCustomerIncome,
          ctvIncome: monthCtvIncome,
          totalIncome: monthTotalIncome,
          expense: monthExpense,
          profit: monthProfit,
          profitMargin: monthProfitMargin,
        })

        yearlyCustomerIncome += monthCustomerIncome
        yearlyCtvIncome += monthCtvIncome
        yearlyExpense += monthExpense
      }

      customerIncome = yearlyCustomerIncome
      ctvIncome = yearlyCtvIncome
      totalExpense = yearlyExpense
    }

    const totalIncome = customerIncome + ctvIncome
    const totalProfit = totalIncome - totalExpense
    const profitMargin = totalIncome > 0 ? Math.round((totalProfit / totalIncome) * 100) : 0

    const result = {
      totalIncome,
      totalExpense,
      totalProfit,
      profitMargin,
      details,
    }

    res.json(result)
  } catch (error) {
    console.error('Error calculating revenue:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    })
  }
})

module.exports = router
