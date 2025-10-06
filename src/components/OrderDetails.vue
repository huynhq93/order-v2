<template>
  <div class="space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <el-form-item label="Ngày">
          <el-input
            v-if="isEditing"
            v-model="editedOrder.date"
            name="date"
          />
          <div v-else class="text-sm">{{ order.date }}</div>
        </el-form-item>
      </div>

      <div class="space-y-2">
        <el-form-item label="Tên khách hàng">
          <el-input
            v-if="isEditing"
            v-model="editedOrder.customerName"
            name="customerName"
          />
          <div v-else class="text-sm">{{ order.customerName }}</div>
        </el-form-item>
      </div>

      <div class="space-y-2">
        <el-form-item label="Sản phẩm">
          <el-input
            v-if="isEditing"
            v-model="editedOrder.productName"
            name="productName"
          />
          <div v-else class="text-sm">{{ order.productName }}</div>
        </el-form-item>
      </div>

      <div class="space-y-2">
        <el-form-item label="Màu sắc">
          <el-input
            v-if="isEditing"
            v-model="editedOrder.color"
            name="color"
          />
          <div v-else class="text-sm">{{ order.color }}</div>
        </el-form-item>
      </div>

      <div class="space-y-2">
        <el-form-item label="Size">
          <el-input
            v-if="isEditing"
            v-model="editedOrder.size"
            name="size"
          />
          <div v-else class="text-sm">{{ order.size }}</div>
        </el-form-item>
      </div>

      <div class="space-y-2">
        <el-form-item label="Số lượng">
          <el-input
            v-if="isEditing"
            v-model="editedOrder.quantity"
            name="quantity"
            type="number"
          />
          <div v-else class="text-sm">{{ order.quantity }}</div>
        </el-form-item>
      </div>

      <div class="space-y-2">
        <el-form-item label="Tổng tiền">
          <el-input
            v-if="isEditing"
            v-model="editedOrder.total"
            name="total"
          />
          <div v-else class="text-sm">{{ formatCurrency(order.total) }}</div>
        </el-form-item>
      </div>

      <div class="space-y-2">
        <el-form-item label="Trạng thái">
          <el-select
            v-if="isEditing"
            v-model="editedOrder.status"
            name="status"
          >
            <el-option label="NHẬN ĐƠN" value="NHẬN ĐƠN" />
            <el-option label="ĐANG GIAO" value="ĐANG GIAO" />
            <el-option label="ĐANG CHỜ GIAO" value="ĐANG CHỜ GIAO" />
            <el-option label="HUỶ" value="Hủy" />
          </el-select>
          <div v-else class="text-sm">{{ order.status }}</div>
        </el-form-item>
      </div>

      <div class="space-y-2">
        <el-form-item label="Link Facebook">
          <el-input
            v-if="isEditing"
            v-model="editedOrder.linkFb"
            name="linkFb"
          />
          <div v-else class="text-sm">{{ order.linkFb }}</div>
        </el-form-item>
      </div>

      <div class="space-y-2">
        <el-form-item label="SĐT/Địa chỉ">
          <el-input
            v-if="isEditing"
            v-model="editedOrder.contactInfo"
            name="contactInfo"
          />
          <div v-else class="text-sm">{{ order.contactInfo }}</div>
        </el-form-item>
      </div>
    </div>

    <div class="space-y-2">
      <el-form-item label="Ghi chú">
        <el-input
          v-if="isEditing"
          v-model="editedOrder.note"
          name="note"
          type="textarea"
          rows="3"
        />
        <div v-else class="text-sm whitespace-pre-wrap">{{ order.note }}</div>
      </el-form-item>
    </div>

    <div class="flex justify-end space-x-2">
      <template v-if="isEditing">
        <el-button @click="cancelEdit">Hủy</el-button>
        <el-button type="primary" @click="saveChanges">Lưu</el-button>
      </template>
      <el-button v-else type="primary" @click="startEdit">
        Chỉnh sửa
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { formatCurrency } from '@/utils/format'
import type { Order } from '@/types/order'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  order: Order
}>()

const emit = defineEmits<{
  (e: 'update', order: Order): void
}>()

const isEditing = ref(false)
const editedOrder = ref<Order>({ ...props.order })

const startEdit = () => {
  isEditing.value = true
}

const cancelEdit = () => {
  editedOrder.value = { ...props.order }
  isEditing.value = false
}

const saveChanges = () => {
  emit('update', editedOrder.value)
  isEditing.value = false
  ElMessage.success('Đã cập nhật thông tin đơn hàng')
}
</script>

<style scoped>
.el-select {
  width: 100%;
}
</style> 