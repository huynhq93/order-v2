// Test sorting logic for product codes with new format
const testProducts = [
  { productCode: 'SP20241026143045', productName: 'Product A' }, // 2024-10-26 14:30:45
  { productCode: 'SP20241026143046', productName: 'Product B' }, // 2024-10-26 14:30:46 (1 second later)
  { productCode: 'SP20241026143044', productName: 'Product C' }, // 2024-10-26 14:30:44 (1 second earlier)
  { productCode: 'SP20241025143045', productName: 'Product D' }, // 2024-10-25 14:30:45 (1 day earlier)
  { productCode: 'SP20251026143045', productName: 'Product E' }, // 2025-10-26 14:30:45 (1 year later)
  { productCode: 'OLD001', productName: 'Product F' }, // Old format product
  { productCode: '', productName: 'Product G' }, // Empty code
]

console.log('Original products:')
testProducts.forEach((p) => console.log(`${p.productCode} - ${p.productName}`))

// Apply the new sorting logic
const sortedProducts = testProducts.sort((a, b) => {
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

console.log('\nSorted products (by product code timestamp desc):')
sortedProducts.forEach((p) => console.log(`${p.productCode} - ${p.productName}`))

// Expected order should be:
// 1. SP20251026143045 (newest year)
// 2. SP20241026143046 (newest second in 2024-10-26)
// 3. SP20241026143045 (next second)
// 4. SP20241026143044 (previous second)
// 5. SP20241025143045 (previous day)
// 6. OLD001 (old format - alphabetically after numbers)
// 7. (empty) - empty string comes first in localeCompare
