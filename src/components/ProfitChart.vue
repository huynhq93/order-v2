<template>
  <div class="simple-chart">
    <div class="chart-title">Biểu đồ lợi nhuận theo tháng</div>
    <div class="chart-container">
      <div class="chart-bars">
        <div 
          v-for="(item, index) in props.chartData.datasets[0].data" 
          :key="index"
          class="chart-bar-group"
        >
          <div class="month-label">T{{ index + 1 }}</div>
          <div class="bars-container">
            <!-- Profit Bar -->
            <div 
              class="chart-bar profit-bar"
              :style="{ height: getBarHeight(item) + '%' }"
              :title="`Lợi nhuận: ${formatCurrency(item)}`"
            >
              <span class="bar-value" v-if="item > 0">{{ formatCurrencyShort(item) }}</span>
            </div>
            <!-- Income Bar -->
            <div 
              class="chart-bar income-bar"
              :style="{ height: getBarHeight(props.chartData.datasets[1].data[index]) + '%' }"
              :title="`Doanh thu: ${formatCurrency(props.chartData.datasets[1].data[index])}`"
            >
              <span class="bar-value">{{ formatCurrencyShort(props.chartData.datasets[1].data[index]) }}</span>
            </div>
            <!-- Expense Bar -->
            <div 
              class="chart-bar expense-bar"
              :style="{ height: getBarHeight(props.chartData.datasets[2].data[index]) + '%' }"
              :title="`Chi phí: ${formatCurrency(props.chartData.datasets[2].data[index])}`"
            >
              <span class="bar-value">{{ formatCurrencyShort(props.chartData.datasets[2].data[index]) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Legend -->
      <div class="chart-legend">
        <div class="legend-item">
          <div class="legend-color profit-color"></div>
          <span>Lợi nhuận</span>
        </div>
        <div class="legend-item">
          <div class="legend-color income-color"></div>
          <span>Doanh thu</span>
        </div>
        <div class="legend-item">
          <div class="legend-color expense-color"></div>
          <span>Chi phí</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
    tension: number
    fill: boolean
  }>
}

interface Props {
  chartData: ChartData
}

const props = defineProps<Props>()

// Helper functions
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value)
}

const formatCurrencyShort = (value: number) => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M'
  } else if (value >= 1000) {
    return (value / 1000).toFixed(0) + 'K'
  }
  return value.toString()
}

const getBarHeight = (value: number) => {
  const maxValue = Math.max(
    ...props.chartData.datasets[1].data, // Income data
    ...props.chartData.datasets[2].data  // Expense data
  )
  
  if (maxValue === 0) return 0
  
  const height = (Math.abs(value) / maxValue) * 80 // Max 80% height
  return Math.max(height, 5) // Minimum 5% for visibility
}
</script>

<style scoped>
.simple-chart {
  padding: 20px;
}

.chart-title {
  text-align: center;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #374151;
}

.chart-container {
  height: 350px;
  display: flex;
  flex-direction: column;
}

.chart-bars {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  padding: 20px 0;
  border-bottom: 2px solid #e5e7eb;
  position: relative;
}

.chart-bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 80px;
}

.month-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 8px;
}

.bars-container {
  display: flex;
  gap: 2px;
  height: 250px;
  align-items: flex-end;
}

.chart-bar {
  width: 20px;
  border-radius: 4px 4px 0 0;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.chart-bar:hover {
  opacity: 0.8;
  transform: translateY(-2px);
}

.profit-bar {
  background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
}

.income-bar {
  background: linear-gradient(180deg, #10b981 0%, #059669 100%);
}

.expense-bar {
  background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
}

.bar-value {
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  padding: 2px;
  transform: rotate(-90deg);
  white-space: nowrap;
  margin-bottom: 8px;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 20px;
  padding-top: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: #374151;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.profit-color {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.income-color {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.expense-color {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

@media (max-width: 768px) {
  .chart-bars {
    overflow-x: auto;
    padding: 10px 0;
  }
  
  .chart-bar-group {
    min-width: 60px;
  }
  
  .chart-bar {
    width: 16px;
  }
  
  .chart-legend {
    gap: 16px;
    flex-wrap: wrap;
  }
  
  .bar-value {
    font-size: 0.7rem;
  }
}
</style>
