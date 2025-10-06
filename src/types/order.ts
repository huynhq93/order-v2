export interface Order {
  rowIndex: number
  date: string
  customerName: string
  productImage: string
  productName: string
  color: string
  size: string
  quantity: string
  total: string
  status: string
  linkFb: string
  contactInfo: string
  note: string
}

export type OrderStatus = 'NHẬN ĐƠN' | 'ĐANG GIAO' | 'ĐANG CHỜ GIAO' | 'Hủy' 