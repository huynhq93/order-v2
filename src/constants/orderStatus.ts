// Order status constants for reuse across components
export const ORDER_STATUSES = {
  // Sales order statuses (bán hàng)
  SALES: {
    NHAN_DON: 'NHẬN ĐƠN',
    DA_DAT_HANG: 'ĐÃ ĐẶT HÀNG',
    HANG_VE: 'HÀNG VỀ',
    DANG_CHO_GIAO: 'ĐANG CHỜ GIAO',
    DANG_GIAO: 'ĐANG GIAO',
    THANH_CONG: 'THÀNH CÔNG',
    HUY_DON: 'HUỶ ĐƠN',
    HOAN_HANG: 'HOÀN HÀNG',
  },
  // Order China statuses (nhập hàng)
  CHINA: {
    DA_DAT_HANG: 'ĐÃ ĐẶT HÀNG',
    VE_KHO: 'VỀ KHO',
    HANG_VE: 'HÀNG VỀ',
    HUY: 'HUỶ',
  },
}

// Status type mapping for Element Plus tags
export const getOrderStatusType = (
  status: string,
): 'success' | 'info' | 'warning' | 'danger' | 'primary' => {
  switch (status) {
    case ORDER_STATUSES.SALES.NHAN_DON:
      return 'info'
    case ORDER_STATUSES.SALES.DA_DAT_HANG:
    case ORDER_STATUSES.CHINA.DA_DAT_HANG:
      return 'warning'
    case ORDER_STATUSES.SALES.HANG_VE:
    case ORDER_STATUSES.CHINA.HANG_VE:
      return 'primary'
    case ORDER_STATUSES.SALES.DANG_CHO_GIAO:
      return 'warning'
    case ORDER_STATUSES.SALES.DANG_GIAO:
      return 'primary'
    case ORDER_STATUSES.SALES.THANH_CONG:
      return 'success'
    case ORDER_STATUSES.SALES.HUY_DON:
    case ORDER_STATUSES.CHINA.HUY:
      return 'danger'
    case ORDER_STATUSES.SALES.HOAN_HANG:
      return 'danger'
    case ORDER_STATUSES.CHINA.VE_KHO:
      return 'success'
    default:
      return 'info'
  }
}

// Sales order flow
export const SALES_ORDER_FLOW = [
  ORDER_STATUSES.SALES.NHAN_DON,
  ORDER_STATUSES.SALES.DA_DAT_HANG,
  ORDER_STATUSES.SALES.HANG_VE,
  ORDER_STATUSES.SALES.DANG_CHO_GIAO,
  ORDER_STATUSES.SALES.DANG_GIAO,
  ORDER_STATUSES.SALES.THANH_CONG,
]

// Alternative flows
export const SALES_ORDER_CANCEL_FLOW = [
  ORDER_STATUSES.SALES.HUY_DON,
  ORDER_STATUSES.SALES.HOAN_HANG,
]

// China order flow
export const CHINA_ORDER_FLOW = [
  ORDER_STATUSES.CHINA.DA_DAT_HANG,
  ORDER_STATUSES.CHINA.VE_KHO,
  ORDER_STATUSES.CHINA.HANG_VE,
  ORDER_STATUSES.CHINA.HUY,
]
