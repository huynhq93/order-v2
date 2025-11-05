// Final test for the complete sorting logic
const testProducts = [
  { productCode: 'SP20241026143045', productName: 'Product A', date: '2024-10-26', rowIndex: 1 },
  { productCode: 'SP20241026143046', productName: 'Product B', date: '2024-10-26', rowIndex: 2 },
  { productCode: 'SP20251026143045', productName: 'Product C', date: '2025-10-26', rowIndex: 3 },
  { productCode: 'OLD001', productName: 'Old Format Product', date: '2024-10-25', rowIndex: 4 },
  { productCode: '', productName: 'No Code Product', date: '2024-10-24', rowIndex: 5 },
]

console.log('Testing final sorting logic (backend style):')
console.log('Original products:')
testProducts.forEach((p) => console.log(`${p.productCode} - ${p.productName}`))

// Backend sorting logic
const sorted = testProducts.sort((a, b) => {
  // Extract the timestamp part from product code (remove 'SP' prefix)
  const timestampA = a.productCode?.replace('SP', '') || '0'
  const timestampB = b.productCode?.replace('SP', '') || '0'

  // Check if both are valid numeric timestamps (14 digits: YYYYMMDDHHMMSS)
  const isValidA = /^\d{14}$/.test(timestampA)
  const isValidB = /^\d{14}$/.test(timestampB)

  // If both are valid timestamps, compare numerically
  if (isValidA && isValidB) {
    return parseInt(timestampB) - parseInt(timestampA) // Newest first
  }

  // If only one is valid, prioritize the valid one
  if (isValidA && !isValidB) return -1 // A comes first
  if (!isValidA && isValidB) return 1 // B comes first

  // If neither is valid timestamp, sort alphabetically
  return b.productCode?.localeCompare(a.productCode || '') || 0
})

console.log('\nSorted products (backend API result):')
sorted.forEach((p) => console.log(`${p.productCode} - ${p.productName}`))

console.log('\nExpected order:')
console.log('1. SP20251026143045 (newest timestamp)')
console.log('2. SP20241026143046 (second newest)')
console.log('3. SP20241026143045 (third newest)')
console.log('4. OLD001 (old format, alphabetical)')
console.log('5. (empty) (no code)')
