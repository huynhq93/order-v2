export interface Order {
  rowIndex: number
  date: string
  customerName: string
  productCode?: string
  orderCode?: string // Mã đặt hàng
  shippingCode?: string // Mã vận đơn
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
  // Additional fields for billing
  imageUrl?: string
  price?: number
  shippingFee?: number
  totalAmount?: number
  // Metadata for status updates
  monthForUpdate?: number
  yearForUpdate?: number
  sheetType?: 'customer' | 'ctv'
}

export type OrderStatus = 'NHẬN ĐƠN' | 'ĐANG GIAO' | 'ĐANG CHỜ GIAO' | 'Hủy' 