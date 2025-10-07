import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5176/api'
})

export const uploadImage = async (imageFile: File) => {
  // Convert file to base64
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

  const res = await api.post('/images', {
    file: base64
  }, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return res.data.url
}
