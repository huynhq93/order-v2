import axios from 'axios'
import { getAuthHeaders } from '@/api/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5176',
})

// Add auth headers to all requests
api.interceptors.request.use((config) => {
  const authHeaders = getAuthHeaders()
  Object.assign(config.headers, authHeaders)
  return config
})

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
      const response = await api.post(`/api/sheets/revenue`, params)

      if (response.status === 200) {
        return { success: true, data: response.data }
      } else {
        throw new Error('Network response was not ok')
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  },
}
