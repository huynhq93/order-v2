import axios from 'axios'
import { getAuthHeaders } from '@/api/auth'
import type { Product } from '@/types/sheet'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5176',
})

// Add auth headers to all requests
api.interceptors.request.use((config) => {
  const authHeaders = getAuthHeaders()
  Object.assign(config.headers, authHeaders)
  return config
})

export const productsAPI = {
  // Lấy tất cả sản phẩm
  async getAllProducts(): Promise<{ success: boolean; data?: Product[]; message?: string }> {
    try {
      const response = await api.get('/sheets/products')
      const data = response.data
      console.log('All products result data:', data)
      return data
    } catch (error) {
      console.error('Error fetching all products:', error)
      return { success: false, message: 'Lỗi khi lấy danh sách sản phẩm' }
    }
  },

  // Tìm kiếm sản phẩm theo mã
  async searchByCode(
    productCode: string,
  ): Promise<{ success: boolean; data?: Product; message?: string }> {
    try {
      const response = await api.get(
        `/sheets/products/search/${encodeURIComponent(productCode)}`,
      )
      const data = response.data
      console.log('Product search result data:', data)
      return data
    } catch (error) {
      console.error('Error searching product:', error)
      return { success: false, message: 'Lỗi khi tìm kiếm sản phẩm' }
    }
  },

  // Thêm sản phẩm mới
  async addProduct(productData: {
    productCode: string
    productImage: string
    productName: string
  }): Promise<{ success: boolean; message?: string; data?: unknown }> {
    try {
      const response = await api.post('/sheets/products', productData)
      return response.data
    } catch (error) {
      console.error('Error adding product:', error)
      return { success: false, message: 'Lỗi khi thêm sản phẩm' }
    }
  },
}
