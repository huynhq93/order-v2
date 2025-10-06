<template>
  <div>
    <el-image
      :src="src"
      :preview-src-list="[src]"
      fit="cover"
      class="w-16 h-16 rounded cursor-pointer"
      @error="handleError"
    >
      <template #error>
        <div class="w-16 h-16 flex items-center justify-center bg-gray-100 rounded">
          <el-icon><Picture /></el-icon>
        </div>
      </template>
    </el-image>
  </div>
</template>

<script setup lang="ts">
import { Picture } from '@element-plus/icons-vue'

defineProps<{
  src: string
}>()

const handleError = () => {
  console.error('Failed to load image:', src)
}
</script> 