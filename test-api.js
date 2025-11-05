const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

// Test endpoint to verify daily order counting
app.get('/test-revenue', async (req, res) => {
  try {
    const month = 12
    const year = 2024

    // Simulate the daily order counting logic
    const daysInMonth = new Date(year, month, 0).getDate()
    console.log(`Testing for month ${month}/${year} with ${daysInMonth} days`)

    // Mock daily order counts
    const dailyOrderCounts = {}

    // Initialize all days with zero counts
    for (let day = 1; day <= daysInMonth; day++) {
      const dayKey = `${day}/${month}/${year}`
      dailyOrderCounts[dayKey] = {
        customerOrderCount: 0,
        ctvOrderCount: 0,
        totalOrderCount: 0,
      }
    }

    // Add some sample data
    dailyOrderCounts['15/12/2024'] = { customerOrderCount: 5, ctvOrderCount: 3, totalOrderCount: 8 }
    dailyOrderCounts['20/12/2024'] = { customerOrderCount: 2, ctvOrderCount: 1, totalOrderCount: 3 }
    dailyOrderCounts['25/12/2024'] = {
      customerOrderCount: 10,
      ctvOrderCount: 5,
      totalOrderCount: 15,
    }

    // Create details array
    const details = []
    for (let day = 1; day <= daysInMonth; day++) {
      const dayKey = `${day}/${month}/${year}`
      const dayData = dailyOrderCounts[dayKey]

      details.push({
        period: `${day}/${month}/${year}`,
        customerIncome: 0,
        ctvIncome: 0,
        totalIncome: 0,
        expense: 0,
        profit: 0,
        profitMargin: 0,
        customerOrderCount: dayData.customerOrderCount,
        ctvOrderCount: dayData.ctvOrderCount,
        totalOrderCount: dayData.totalOrderCount,
      })
    }

    console.log('Sample response generated:')
    console.log('Total details count:', details.length)
    console.log('Days with orders:', details.filter((d) => d.totalOrderCount > 0).length)
    console.log('Sample details (first 5):')
    details.slice(0, 5).forEach((detail, index) => {
      console.log(`  Day ${index + 1}: ${detail.period} - Orders: ${detail.totalOrderCount}`)
    })

    const response = {
      success: true,
      data: {
        summary: {
          customerIncome: 50000,
          ctvIncome: 25000,
          totalIncome: 75000,
          expense: 30000,
          profit: 45000,
          profitMargin: 60,
          customerOrderCount: 17,
          ctvOrderCount: 9,
          totalOrderCount: 26,
        },
        details: details,
      },
    }

    res.json(response)
  } catch (error) {
    console.error('Test error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

const port = 3002
app.listen(port, () => {
  console.log(`Test server running on port ${port}`)
  console.log(`Test URL: http://localhost:${port}/test-revenue`)
})
