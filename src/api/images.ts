import axios from 'axios'
import { getAuthHeaders } from '@/api/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5176',
})

// Add auth headers to all requests
api.interceptors.request.use((config) => {
  // Skip Content-Type for FormData, let browser set it with boundary
  const skipContentType = config.data instanceof FormData
  const authHeaders = getAuthHeaders({ skipContentType })

  Object.assign(config.headers, authHeaders)
  return config
})

export const uploadImage = async (imageFile: File) => {
  // Create FormData for multipart upload
  const formData = new FormData()

  formData.append('file', imageFile)

  try {
    // Don't set Content-Type manually - let browser set it with boundary for FormData
    const res = await api.post('/images', formData)
    return res.data.url
  } catch (error) {
    console.error('Upload error:', error)
    console.error('Error response:', error.response?.data)
    throw error
  }
}
