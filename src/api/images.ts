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

export const uploadImage = async (imageFile: File) => {
  // Create FormData for multipart upload
  const formData = new FormData()
  formData.append('file', imageFile)

  const res = await api.post('/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return res.data.url
}
