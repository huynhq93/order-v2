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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface Customer {
  rowIndex: number
  customerName: string
  contactInfo: string
  linkFb: string
}

export interface CustomerResponse {
  success: boolean
  data?: Customer
  message?: string
}

export interface CustomersListResponse {
  success: boolean
  data: Customer[]
  total: number
}

// Cache for customers list to avoid multiple API calls
let customersCache: Customer[] | null = null
let lastFetchTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Lấy danh sách tất cả customers (with caching)
export async function getAllCustomers(forceRefresh = false): Promise<CustomersListResponse> {
  try {
    const now = Date.now()

    // Return cached data if still valid and not forcing refresh
    if (!forceRefresh && customersCache && now - lastFetchTime < CACHE_DURATION) {
      return {
        success: true,
        data: customersCache,
        total: customersCache.length,
      }
    }

    const response = await api.get(`/sheets/customers`)
    const result = response.data

    if (result.success) {
      customersCache = result.data
      lastFetchTime = now
    }

    return result
  } catch (error) {
    console.error('Error getting customers:', error)
    return {
      success: false,
      data: [],
      total: 0,
    }
  }
}

// Tìm kiếm customer theo tên (local filtering)
export async function searchCustomer(customerName: string): Promise<CustomerResponse> {
  try {
    const customersResult = await getAllCustomers()

    if (!customersResult.success) {
      return {
        success: false,
        message: 'Không thể tải danh sách khách hàng',
      }
    }

    // Tìm customer với tên chính xác (case-insensitive)
    const customer = customersResult.data.find(
      (c) => c.customerName.toLowerCase().trim() === customerName.toLowerCase().trim(),
    )

    if (customer) {
      return {
        success: true,
        data: customer,
      }
    } else {
      return {
        success: false,
        message: 'Không tìm thấy thông tin khách hàng',
      }
    }
  } catch (error) {
    console.error('Error searching customer:', error)
    return {
      success: false,
      message: 'Có lỗi xảy ra khi tìm kiếm khách hàng',
    }
  }
}

// Clear cache (useful when new customer is added)
export function clearCustomersCache() {
  customersCache = null
  lastFetchTime = 0
}
