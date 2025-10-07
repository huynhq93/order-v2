<template>
  <div class="flex items-center space-x-2">
    <el-select
      v-model="selectedMonth"
      class="w-32!"
      @change="handleMonthChange"
    >
      <el-option
        v-for="month in months"
        :key="month.value"
        :label="month.label"
        :value="month.value"
      />
    </el-select>

    <el-select
      v-model="selectedYear"
      class="w-24!"
      @change="handleYearChange"
    >
      <el-option
        v-for="year in years"
        :key="year"
        :label="year"
        :value="year"
      />
    </el-select>
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