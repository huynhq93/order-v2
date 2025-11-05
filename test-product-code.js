// Test new product code generation logic
function generateProductCode(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')

  return `SP${year}${month}${day}${hour}${minute}${second}`
}

// Test with current date
console.log('Current product code:', generateProductCode())

// Test with specific date: 2024-10-26 14:30:45
const testDate = new Date(2024, 9, 26, 14, 30, 45) // Month is 0-based
console.log('Test product code (2024-10-26 14:30:45):', generateProductCode(testDate))

// Expected format: SP20241026143045

// Test with another date: 2024-01-05 09:08:07
const testDate2 = new Date(2024, 0, 5, 9, 8, 7)
console.log('Test product code (2024-01-05 09:08:07):', generateProductCode(testDate2))

// Expected format: SP20240105090807
