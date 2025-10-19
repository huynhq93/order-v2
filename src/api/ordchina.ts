import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5176',
})

export interface OrdChinaRecord {
  managementCode: string
  productName: string
  productImage: string
  status: string
  shippingCodes: string
  note: string
  orderDate: string
  quantity: number
  importPrice: number
  date: { month: number; year: number }
}

export const createOrdChinaRecord = async (data: OrdChinaRecord) => {
  const response = await api.post('/sheets/ordchina', data)
  return response.data
}

export const getOrdChinaRecords = async (month: number, year: number) => {
  const response = await api.get(`/sheets/ordchina?month=${month}&year=${year}`)
  return response.data.data
}

export const updateOrdChinaRecord = async (id: string, data: Partial<OrdChinaRecord>) => {
  const response = await api.put(`/sheets/ordchina/${id}`, data)
  return response.data
}

// export const createOrdChinaRecord = async (data: OrdChinaRecord) => {
//   const response = await api.post('/api/ordchina', data)
//   return response.data
// }

// export const getOrdChinaRecords = async (month: number, year: number) => {
//   const response = await api.get(`/api/sheets/ordchina?month=${month}&year=${year}`)
//   return response.data.data
// }

// export const updateOrdChinaRecord = async (id: string, data: Partial<OrdChinaRecord>) => {
//   const response = await api.put(`/api/sheets/ordchina/${id}`, data)
//   return response.data
// }
