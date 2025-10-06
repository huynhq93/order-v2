export const SHEET_TYPES = {
  ORDERS: "BÁN HÀNG",
  INVENTORY: "NHẬP HÀNG",
  COLLABORATORS: "CÔNG TÁC VIÊN",
} as const

// Type cho key
export type SheetTypeKey = keyof typeof SHEET_TYPES // "ORDERS" | "INVENTORY" | "COLLABORATORS"

// Type cho value
export type SheetTypeLabel = (typeof SHEET_TYPES)[SheetTypeKey] // "BÁN HÀNG" | "NHẬP HÀNG" | "CÔNG TÁC VIÊN"