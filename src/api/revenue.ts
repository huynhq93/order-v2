import axios from 'axios'

interface RevenueQueryParams {
  type: 'month' | 'year'
  year: number
  month?: number
}

interface RevenueDetail {
  period: string
  customerIncome: number
  ctvIncome: number
  totalIncome: number
  expense: number
  profit: number
  profitMargin: number
}

interface RevenueResponse {
  totalIncome: number
  totalExpense: number
  totalProfit: number
  profitMargin: number
  details: RevenueDetail[]
}

export const revenueAPI = {
  async getRevenueData(
    params: RevenueQueryParams,
  ): Promise<{ success: boolean; data?: RevenueResponse; error?: string }> {
    try {
      const response = await api.post(`/sheets?type=${sheetType}`, order)
      const response = await fetch('/api/revenue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching revenue data:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  },
}
