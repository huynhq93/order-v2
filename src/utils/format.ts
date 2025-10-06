export const formatCurrency = (value: string | number): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(num)
}

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(d)
} 