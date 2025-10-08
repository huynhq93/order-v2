<template>
  <div class="month-selector-container">
    <div class="month-year-row">
      <el-select
        v-model="selectedMonth"
        class="month-select"
        @change="handleMonthChange"
        placeholder="Chọn tháng"
      >
        <el-option
          v-for="month in months"
          :key="month.value"
          :label="month.label"
          :value="month.value"
        />
      </el-select>
      
      <span class="separator">/</span>
      
      <el-select
        v-model="selectedYear"
        class="year-select"
        @change="handleYearChange"
        placeholder="Chọn năm"
      >
        <el-option
          v-for="year in years"
          :key="year"
          :label="year"
          :value="year"
        />
      </el-select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  modelValue: { month: number; year: number }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: { month: number; year: number }): void
}>()

const months = [
  { label: 'Tháng 1', value: 1 },
  { label: 'Tháng 2', value: 2 },
  { label: 'Tháng 3', value: 3 },
  { label: 'Tháng 4', value: 4 },
  { label: 'Tháng 5', value: 5 },
  { label: 'Tháng 6', value: 6 },
  { label: 'Tháng 7', value: 7 },
  { label: 'Tháng 8', value: 8 },
  { label: 'Tháng 9', value: 9 },
  { label: 'Tháng 10', value: 10 },
  { label: 'Tháng 11', value: 11 },
  { label: 'Tháng 12', value: 12 }
]

const currentYear = new Date().getFullYear()
const years = computed(() => {
  const years = []
  for (let year = currentYear - 2; year <= currentYear + 2; year++) {
    years.push(year)
  }
  return years
})

const selectedMonth = ref(props.modelValue.month)
const selectedYear = ref(props.modelValue.year)

// Watch for prop changes and sync local state
watch(() => props.modelValue, (newValue) => {
  selectedMonth.value = newValue.month
  selectedYear.value = newValue.year
}, { immediate: true, deep: true })

const handleMonthChange = (value: number) => {
  selectedMonth.value = value
  emit('update:modelValue', { month: value, year: selectedYear.value })
}

const handleYearChange = (value: number) => {
  selectedYear.value = value
  emit('update:modelValue', { month: selectedMonth.value, year: value })
}
</script>

<style scoped>
.month-selector-container {
  display: inline-flex;
  align-items: center;
}

.month-year-row {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 4px 12px;
  transition: all 0.3s ease;
}

.month-year-row:hover {
  border-color: #cbd5e1;
  background: #f1f5f9;
}

.month-select {
  width: 140px;
}

.year-select {
  width: 100px;
}

.separator {
  color: #64748b;
  font-weight: 500;
  font-size: 16px;
  margin: 0 4px;
}

/* Override Element Plus styles */
:deep(.el-select) {
  border: none !important;
}

:deep(.el-select .el-input__wrapper) {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
  padding: 0 8px !important;
}

:deep(.el-select .el-input__wrapper:hover),
:deep(.el-select .el-input__wrapper.is-focus) {
  border: none !important;
  box-shadow: none !important;
  background: rgba(99, 102, 241, 0.1) !important;
}

:deep(.el-select .el-input__inner) {
  background: transparent !important;
  font-weight: 500;
  color: #1e293b;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .month-year-row {
    padding: 6px 10px;
    gap: 6px;
  }
  
  .month-select {
    width: 120px;
  }
  
  .year-select {
    width: 85px;
  }
  
  .separator {
    font-size: 14px;
    margin: 0 2px;
  }
}

@media (max-width: 480px) {
  .month-year-row {
    padding: 4px 8px;
    gap: 4px;
  }
  
  .month-select {
    width: 110px;
  }
  
  .year-select {
    width: 80px;
  }
  
  :deep(.el-select .el-input__wrapper) {
    padding: 0 6px !important;
  }
}
</style> 