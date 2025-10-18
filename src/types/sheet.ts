export const SHEET_TYPES = {
  ORDERS: 'BÁN HÀNG',
  INVENTORY: 'NHẬP HÀNG',
  COLLABORATORS: 'CÔNG TÁC VIÊN',
  PRODUCTS: 'Sản phẩm',
} as const

// Type cho key
export type SheetTypeKey = keyof typeof SHEET_TYPES // "ORDERS" | "INVENTORY" | "COLLABORATORS" | "PRODUCTS"

// Type cho value
export type SheetTypeLabel = (typeof SHEET_TYPES)[SheetTypeKey] // "BÁN HÀNG" | "NHẬP HÀNG" | "CÔNG TÁC VIÊN" | "Sản phẩm"

// Product interface
export interface Product {
  rowIndex: number
  date: string
  productCode: string
  productImage: string
  productName: string
  month: string
}