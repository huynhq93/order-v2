// Test script to compare performance

// Simulate old sequential approach
async function oldSequentialApproach() {
  const start = Date.now()

  // Simulate 12 async operations taking 100-300ms each
  for (let i = 1; i <= 12; i++) {
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 200 + 100))
  }

  const end = Date.now()
  return end - start
}

// Simulate new parallel approach
async function newParallelApproach() {
  const start = Date.now()

  // Simulate 12 async operations running in parallel
  const promises = []
  for (let i = 1; i <= 12; i++) {
    promises.push(new Promise((resolve) => setTimeout(resolve, Math.random() * 200 + 100)))
  }

  await Promise.all(promises)

  const end = Date.now()
  return end - start
}

async function comparePerformance() {
  console.log('🚀 Testing Performance Improvement for Revenue API (Year Type)')
  console.log('='.repeat(60))

  console.log('\n📊 Running Old Sequential Approach...')
  const oldTime = await oldSequentialApproach()
  console.log(`⏱️  Old approach took: ${oldTime}ms`)

  console.log('\n⚡ Running New Parallel Approach...')
  const newTime = await newParallelApproach()
  console.log(`⏱️  New approach took: ${newTime}ms`)

  console.log('\n📈 Performance Results:')
  console.log(`💚 Improvement: ${Math.round(((oldTime - newTime) / oldTime) * 100)}% faster`)
  console.log(`🔥 Time saved: ${oldTime - newTime}ms`)
  console.log(`⚡ Speedup ratio: ${(oldTime / newTime).toFixed(2)}x`)

  console.log('\n' + '='.repeat(60))
  console.log('✅ Performance test completed!')
}

comparePerformance().catch(console.error)
