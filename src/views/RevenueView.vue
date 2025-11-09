<template>
  <div class="revenue-view">
    <!-- Navigation Menu -->
    <NavigationMenu active-menu-item="revenue" />

    <!-- Hero Header -->
    <div class="hero-header">
      <h1 class="main-title">Thống kê lợi nhuận</h1>
      <p class="subtitle">Báo cáo lợi nhuận theo tháng và năm</p>
    </div>

    <!-- Controls -->
    <div class="controls-section">
      <el-card class="control-card">
        <div class="control-row">
          <div class="control-item">
            <label class="control-label">Loại báo cáo:</label>
            <el-radio-group v-model="reportType" @change="handleReportTypeChange">
              <el-radio-button label="month">Theo tháng</el-radio-button>
              <el-radio-button label="year">Theo năm</el-radio-button>
            </el-radio-group>
          </div>

          <div class="control-item" v-if="reportType === 'month'">
            <label class="control-label">Chọn tháng:</label>
            <MonthSelector v-model="selectedDate" @update:model-value="loadRevenueData" />
          </div>

          <div class="control-item" v-if="reportType === 'year'">
            <label class="control-label">Chọn năm:</label>
            <el-date-picker
              v-model="selectedYear"
              type="year"
              placeholder="Chọn năm"
              format="YYYY"
              value-format="YYYY"
              @change="loadRevenueData"
            />
          </div>

          <div class="control-item">
            <el-button type="primary" :loading="loading" @click="loadRevenueData" :icon="Refresh">
              Tải dữ liệu
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Revenue Summary Cards -->
    <div class="summary-cards" v-if="revenueData">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="summary-card income-card">
            <div class="card-content">
              <div class="card-icon">
                <el-icon size="24"><TrendCharts /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-value">{{ formatCurrency(revenueData.totalIncome) }}</div>
                <div class="card-label">Tổng doanh thu</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="summary-card expense-card">
            <div class="card-content">
              <div class="card-icon">
                <el-icon size="24"><ShoppingCart /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-value">{{ formatCurrency(revenueData.totalExpense) }}</div>
                <div class="card-label">Tổng chi phí</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="summary-card profit-card">
            <div class="card-content">
              <div class="card-icon">
                <el-icon size="24"><Money /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-value">{{ formatCurrency(revenueData.totalProfit) }}</div>
                <div class="card-label">Lợi nhuận</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="summary-card margin-card">
            <div class="card-content">
              <div class="card-icon">
                <el-icon size="24"><DataAnalysis /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-value">{{ revenueData.profitMargin }}%</div>
                <div class="card-label">Tỷ suất lợi nhuận</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- Profit Chart for Yearly View -->
    <div class="chart-section" v-if="revenueData && reportType === 'year'">
      <el-card>
        <template #header>
          <div class="chart-header">
            <span class="chart-title">Biểu đồ lợi nhuận năm {{ selectedYear }}</span>
          </div>
        </template>
        <div class="chart-container">
          <ProfitChart 
            :chart-data="chartData"
          />
        </div>
      </el-card>
    </div>

    <!-- Order Count Chart for Yearly View -->
    <div class="order-chart-section" v-if="revenueData && reportType === 'year'">
      <el-card>
        <template #header>
          <div class="chart-header">
            <span class="chart-title">Số lượng đơn hàng theo tháng - Năm {{ selectedYear }}</span>
          </div>
        </template>
        <div class="order-chart-container">
          <div class="chart-legend">
            <div class="legend-item">
              <div class="legend-color customer-color"></div>
              <span>Khách hàng</span>
            </div>
            <div class="legend-item">
              <div class="legend-color ctv-color"></div>
              <span>CTV</span>
            </div>
            <div class="legend-item">
              <div class="legend-color total-color"></div>
              <span>Tổng cộng</span>
            </div>
          </div>
          <div class="order-chart">
            <div 
              v-for="detail in revenueData.details" 
              :key="detail.period"
              class="chart-bar-group"
            >
              <div class="chart-labels">
                <span class="day-label">T{{ detail.period.split('/')[0] }}</span>
              </div>
              <div class="chart-bars">
                <div 
                  class="chart-bar customer-bar"
                  :style="{ height: getBarHeight(detail.customerOrderCount || 0) + '%' }"
                  :title="`Khách hàng: ${detail.customerOrderCount || 0} đơn`"
                >
                  <span class="bar-value" v-if="(detail.customerOrderCount || 0) > 0">{{ detail.customerOrderCount || 0 }}</span>
                </div>
                <div 
                  class="chart-bar ctv-bar"
                  :style="{ height: getBarHeight(detail.ctvOrderCount || 0) + '%' }"
                  :title="`CTV: ${detail.ctvOrderCount || 0} đơn`"
                >
                  <span class="bar-value" v-if="(detail.ctvOrderCount || 0) > 0">{{ detail.ctvOrderCount || 0 }}</span>
                </div>
                <div 
                  class="chart-bar total-bar"
                  :style="{ height: getBarHeight(detail.totalOrderCount || 0) + '%' }"
                  :title="`Tổng: ${detail.totalOrderCount || 0} đơn`"
                >
                  <span class="bar-value" v-if="(detail.totalOrderCount || 0) > 0">{{ detail.totalOrderCount || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Order Count Chart for Monthly View -->
    <div class="order-chart-section" v-if="revenueData && reportType === 'month'">
      <el-card>
        <template #header>
          <div class="chart-header">
            <span class="chart-title">Số lượng đơn hàng theo ngày - {{ selectedDate.month }}/{{ selectedDate.year }}</span>
          </div>
        </template>
        <div class="order-chart-container">
          <div class="chart-legend">
            <div class="legend-item">
              <div class="legend-color customer-color"></div>
              <span>Khách hàng</span>
            </div>
            <div class="legend-item">
              <div class="legend-color ctv-color"></div>
              <span>CTV</span>
            </div>
            <div class="legend-item">
              <div class="legend-color total-color"></div>
              <span>Tổng cộng</span>
            </div>
          </div>
          <div class="order-chart">
            <div 
              v-for="detail in revenueData.details" 
              :key="detail.period"
              class="chart-bar-group"
            >
              <div class="chart-labels">
                <span class="day-label">{{ detail.period }}</span>
              </div>
              <div class="chart-bars">
                <div 
                  class="chart-bar customer-bar"
                  :style="{ height: getBarHeight(detail.customerOrderCount || 0) + '%' }"
                  :title="`Khách hàng: ${detail.customerOrderCount || 0} đơn`"
                >
                  <span class="bar-value" v-if="(detail.customerOrderCount || 0) > 0">{{ detail.customerOrderCount || 0 }}</span>
                </div>
                <div 
                  class="chart-bar ctv-bar"
                  :style="{ height: getBarHeight(detail.ctvOrderCount || 0) + '%' }"
                  :title="`CTV: ${detail.ctvOrderCount || 0} đơn`"
                >
                  <span class="bar-value" v-if="(detail.ctvOrderCount || 0) > 0">{{ detail.ctvOrderCount || 0 }}</span>
                </div>
                <div 
                  class="chart-bar total-bar"
                  :style="{ height: getBarHeight(detail.totalOrderCount || 0) + '%' }"
                  :title="`Tổng: ${detail.totalOrderCount || 0} đơn`"
                >
                  <span class="bar-value" v-if="(detail.totalOrderCount || 0) > 0">{{ detail.totalOrderCount || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Detailed Revenue Table -->
    <div class="revenue-table-section" v-if="revenueData">
      <el-card>
        <template #header>
          <div class="table-header">
            <span class="table-title"
              >Chi tiết theo {{ reportType === 'month' ? 'tháng' : 'năm' }}</span
            >
            <el-button type="success" :icon="Download" @click="exportToExcel">
              Xuất Excel
            </el-button>
          </div>
        </template>

        <el-table :data="revenueData.details" style="width: 100%" :loading="loading" stripe border>
          <el-table-column
            prop="period"
            :label="reportType === 'month' ? 'Tháng' : 'Năm'"
            min-width="100"
            align="center"
          />
          <el-table-column
            prop="customerIncome"
            label="Doanh thu khách hàng"
            min-width="150"
            align="right"
          >
            <template #default="scope">
              <span class="income-text">{{ formatCurrency(scope.row.customerIncome) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="ctvIncome" label="Doanh thu CTV" min-width="150" align="right">
            <template #default="scope">
              <span class="income-text">{{ formatCurrency(scope.row.ctvIncome) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="totalIncome" label="Tổng doanh thu" min-width="150" align="right">
            <template #default="scope">
              <span class="total-income-text">{{ formatCurrency(scope.row.totalIncome) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="expense" label="Chi phí nhập hàng" min-width="150" align="right">
            <template #default="scope">
              <span class="expense-text">{{ formatCurrency(scope.row.expense) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="profit" label="Lợi nhuận" min-width="150" align="right">
            <template #default="scope">
              <span :class="scope.row.profit >= 0 ? 'profit-positive' : 'profit-negative'">
                {{ formatCurrency(scope.row.profit) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="profitMargin"
            label="Tỷ suất lợi nhuận"
            min-width="120"
            align="right"
          >
            <template #default="scope">
              <el-tag
                :type="
                  scope.row.profitMargin >= 20
                    ? 'success'
                    : scope.row.profitMargin >= 10
                      ? 'warning'
                      : 'danger'
                "
              >
                {{ scope.row.profitMargin }}%
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- Empty State -->
    <div class="empty-state" v-if="!loading && !revenueData">
      <el-empty description="Chưa có dữ liệu. Vui lòng chọn thời gian và tải dữ liệu." />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Refresh,
  Download,
  TrendCharts,
  ShoppingCart,
  Money,
  DataAnalysis,
} from '@element-plus/icons-vue'
import NavigationMenu from '@/components/NavigationMenu.vue'
import MonthSelector from '@/components/MonthSelector.vue'
import ProfitChart from '@/components/ProfitChart.vue'
import { formatCurrency } from '@/utils/format'
import { revenueAPI } from '@/api/revenue'

interface RevenueDetail {
  period: string
  customerIncome: number
  ctvIncome: number
  totalIncome: number
  expense: number
  profit: number
  profitMargin: number
  customerOrderCount?: number
  ctvOrderCount?: number
  totalOrderCount?: number
}

interface RevenueData {
  totalIncome: number
  totalExpense: number
  totalProfit: number
  profitMargin: number
  details: RevenueDetail[]
}

const loading = ref(false)
const reportType = ref<'month' | 'year'>('month')
const selectedDate = ref({
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
})
const selectedYear = ref(new Date().getFullYear().toString())
const revenueData = ref<RevenueData | null>(null)

// Chart data for yearly view
const chartData = ref({
  labels: [] as string[],
  datasets: [
    {
      label: 'Lợi nhuận',
      data: [] as number[],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true,
    },
    {
      label: 'Doanh thu',
      data: [] as number[],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      fill: false,
    },
    {
      label: 'Chi phí',
      data: [] as number[],
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      tension: 0.4,
      fill: false,
    }
  ]
})

// Watch for changes and auto-reload data
watch([reportType, selectedDate, selectedYear], () => {
  loadRevenueData()
}, { deep: true })

const handleReportTypeChange = () => {
  revenueData.value = null
  // Auto-load data when switching tabs
  loadRevenueData()
}

const updateChartData = () => {
  if (reportType.value === 'year' && revenueData.value?.details) {
    const labels = revenueData.value.details.map(item => `Tháng ${item.period.split('/')[0]}`)
    const profitData = revenueData.value.details.map(item => item.profit)
    const incomeData = revenueData.value.details.map(item => item.totalIncome)
    const expenseData = revenueData.value.details.map(item => item.expense)
    
    chartData.value = {
      labels,
      datasets: [
        {
          label: 'Lợi nhuận',
          data: profitData,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Doanh thu',
          data: incomeData,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: false,
        },
        {
          label: 'Chi phí',
          data: expenseData,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4,
          fill: false,
        }
      ]
    }
  }
}

// Function to calculate bar height for order count chart
const getBarHeight = (value: number) => {
  if (!revenueData.value?.details) return 0
  
  // Find max value across all order counts for proper scaling
  const allValues = revenueData.value.details.flatMap(detail => [
    detail.customerOrderCount || 0,
    detail.ctvOrderCount || 0,
    detail.totalOrderCount || 0
  ])
  
  const maxValue = Math.max(...allValues, 1) // Minimum 1 to avoid division by 0
  return Math.max((value / maxValue) * 100, value > 0 ? 5 : 0) // Minimum 5% height if value > 0
}

const loadRevenueData = async () => {
  loading.value = true
  try {
    const params = {
      type: reportType.value,
      year: reportType.value === 'year' ? parseInt(selectedYear.value) : selectedDate.value.year,
      month: reportType.value === 'month' ? selectedDate.value.month : undefined,
    }

    const response = await revenueAPI.getRevenueData(params)

    if (response.success && response.data) {
      revenueData.value = response.data
      // Update chart data for yearly view
      if (reportType.value === 'year') {
        updateChartData()
      }
      ElMessage.success('Tải dữ liệu thành công!')
    } else {
      ElMessage.error(response.error || 'Lỗi khi tải dữ liệu')
    }
  } catch (error) {
    console.error('Error loading revenue data:', error)
    ElMessage.error('Lỗi khi tải dữ liệu thống kê')
  } finally {
    loading.value = false
  }
}

const exportToExcel = () => {
  ElMessage.info('Chức năng xuất Excel đang được phát triển')
}

onMounted(() => {
  loadRevenueData()
})
</script>

<style scoped>
.revenue-view {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.hero-header {
  text-align: center;
  margin-bottom: 32px;
  padding: 32px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
  position: relative;
  overflow: hidden;
}

.hero-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
    repeat;
  opacity: 0.1;
}

.main-title {
  font-size: 3rem;
  font-weight: 800;
  margin: 0 0 12px 0;
  position: relative;
  z-index: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.025em;
}

.subtitle {
  font-size: 1.125rem;
  margin: 0;
  opacity: 0.9;
  position: relative;
  z-index: 1;
  font-weight: 400;
}

.controls-section {
  margin-bottom: 24px;
}

.control-card {
  border-radius: 12px;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.control-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-label {
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
}

.summary-cards {
  margin-bottom: 24px;
}

.chart-section {
  margin-bottom: 24px;
}

.order-chart-section {
  margin-bottom: 24px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
}

.chart-container {
  height: 400px;
  padding: 20px 0;
}

.order-chart-container {
  padding: 20px 0;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.customer-color {
  background: linear-gradient(135deg, #10b981, #059669);
}

.ctv-color {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.total-color {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.order-chart {
  display: flex;
  align-items: end;
  justify-content: flex-start;
  gap: 8px;
  height: 300px;
  padding: 0 20px;
  overflow-x: auto;
  min-width: 100%;
}

.chart-bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
  flex-shrink: 0;
}

.chart-labels {
  margin-bottom: 30px;
  text-align: center;
}

.day-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  writing-mode: horizontal-tb;
}

.chart-bars {
  display: flex;
  align-items: end;
  gap: 4px;
  height: 250px;
}

.chart-bar {
  width: 20px;
  min-height: 4px;
  border-radius: 4px 4px 0 0;
  position: relative;
  display: flex;
  align-items: end;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.chart-bar:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

.customer-bar {
  background: linear-gradient(to top, #10b981, #34d399);
}

.ctv-bar {
  background: linear-gradient(to top, #3b82f6, #60a5fa);
}

.total-bar {
  background: linear-gradient(to top, #8b5cf6, #a78bfa);
}

.bar-value {
  position: absolute;
  top: -20px;
  font-size: 11px;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
}

.summary-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.income-card :deep(.el-card__body) {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.expense-card :deep(.el-card__body) {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.profit-card :deep(.el-card__body) {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.margin-card :deep(.el-card__body) {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.card-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-info {
  flex: 1;
}

.card-value {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.card-label {
  font-size: 0.875rem;
  opacity: 0.9;
}

.revenue-table-section {
  margin-bottom: 24px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
}

.income-text {
  color: #059669;
  font-weight: 600;
}

.total-income-text {
  color: #1f2937;
  font-weight: 700;
}

.expense-text {
  color: #dc2626;
  font-weight: 600;
}

.profit-positive {
  color: #059669;
  font-weight: 700;
}

.profit-negative {
  color: #dc2626;
  font-weight: 700;
}

.empty-state {
  margin-top: 48px;
}

@media (max-width: 768px) {
  .revenue-view {
    padding: 16px;
  }

  .hero-header {
    margin: -8px -16px 24px -16px;
    padding: 24px 16px;
    border-radius: 0;
  }

  .main-title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .control-row {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .control-item {
    justify-content: space-between;
  }

  .summary-cards {
    margin-bottom: 20px;
  }

  .card-content {
    gap: 12px;
  }

  .card-icon {
    width: 40px;
    height: 40px;
  }

  .card-value {
    font-size: 1.25rem;
  }

  .table-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .chart-legend {
    gap: 16px;
  }

  .legend-item {
    font-size: 13px;
  }

  .order-chart {
    gap: 4px;
    padding: 0 10px;
    height: 250px;
    justify-content: flex-start;
  }

  .chart-bar-group {
    min-width: 60px;
  }

  .chart-bars {
    gap: 2px;
    height: 200px;
  }

  .chart-bar {
    width: 16px;
  }

  .day-label {
    font-size: 11px;
  }

  .bar-value {
    font-size: 10px;
    top: -18px;
  }
}

@media (max-width: 480px) {
  .hero-header {
    padding: 20px 12px;
  }

  .main-title {
    font-size: 1.75rem;
  }

  .subtitle {
    font-size: 0.9rem;
  }

  .chart-legend {
    gap: 12px;
    justify-content: flex-start;
  }

  .legend-item {
    font-size: 12px;
  }

  .order-chart {
    gap: 2px;
    padding: 0 8px;
    height: 220px;
    justify-content: flex-start;
  }

  .chart-bar-group {
    min-width: 50px;
  }

  .chart-bars {
    gap: 1px;
    height: 180px;
  }

  .chart-bar {
    width: 14px;
  }

  .day-label {
    font-size: 10px;
  }

  .bar-value {
    font-size: 9px;
    top: -16px;
  }
}
</style>
