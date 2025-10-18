import axios from 'axios'
import type { Product } from '@/types/sheet'

const API_BASE = '/api/sheets'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5176',
})

export const productsAPI = {
  // Tìm kiếm sản phẩm theo mã
  async searchByCode(
    productCode: string,
  ): Promise<{ success: boolean; data?: Product; message?: string }> {
    try {
      const response = await await api.get(`/sheets/products/search/${encodeURIComponent(productCode)}`)
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
      const response = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error adding product:', error)
      return { success: false, message: 'Lỗi khi thêm sản phẩm' }
    }
  },
}
