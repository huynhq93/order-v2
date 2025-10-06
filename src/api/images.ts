import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5176/api'
})

export const uploadImage = async (imageFile: File) => {
  const formData = new FormData();
  formData.append("file", imageFile);

  const res = await api.post('/images/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return res.data.url
}
