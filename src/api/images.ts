import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5176',
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
