<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-position="top"
    class="space-y-4"
  >
    <div class="grid grid-cols-2 gap-4">
      <el-form-item label="Ngày" prop="date">
        <el-date-picker
          v-model="form.date"
          type="date"
          placeholder="Chọn ngày"
          format="DD/MM/YYYY"
          value-format="YYYY/MM/DD"
        />
      </el-form-item>

      <el-form-item  label="Ảnh sản phẩm">
        <div class="space-y-2 w-full">
          <div class="flex items-center gap-2">
            <div v-if="imagePreview" class="border rounded w-[100px] h-[100px] overflow-hidden">
              <img :src="imagePreview" alt="Preview" class="object-cover w-full h-full" />
            </div>
      
            <el-button
              @click="() => $refs.imageInput?.click()"
              type="primary"
              plain
            >
              Tải ảnh lên
            </el-button>
      
            <input
              ref="imageInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleFileChange"
            />
          </div>
        </div>
      </el-form-item>

      <el-form-item label="Tên khách hàng" prop="customerName">
        <el-input v-model="form.customerName" />
      </el-form-item>

      <el-form-item label="Sản phẩm" prop="productName">
        <el-input v-model="form.productName" />
      </el-form-item>

      <el-form-item label="Màu sắc" prop="color">
        <el-input v-model="form.color" />
      </el-form-item>

      <el-form-item label="Size" prop="size">
        <el-input v-model="form.size" />
      </el-form-item>

      <el-form-item label="Số lượng" prop="quantity">
        <el-input-number v-model="form.quantity" :min="1" />
      </el-form-item>

      <el-form-item label="Tổng tiền" prop="total">
        <el-input v-model="form.total" />
      </el-form-item>

      <el-form-item label="Trạng thái" prop="status">
        <el-select v-model="form.status">
          <el-option label="NHẬN ĐƠN" value="NHẬN ĐƠN" />
          <el-option label="ĐANG GIAO" value="ĐANG GIAO" />
          <el-option label="ĐANG CHỜ GIAO" value="ĐANG CHỜ GIAO" />
          <el-option label="HUỶ" value="Hủy" />
        </el-select>
      </el-form-item>

      <el-form-item label="Link Facebook" prop="linkFb">
        <el-input v-model="form.linkFb" />
      </el-form-item>

      <el-form-item label="SĐT/Địa chỉ" prop="contactInfo">
        <el-input v-model="form.contactInfo" />
      </el-form-item>
    </div>

    <el-form-item label="Ghi chú" prop="note">
      <el-input
        v-model="form.note"
        type="textarea"
        rows="3"
      />
    </el-form-item>

    <div class="flex justify-end space-x-2">
      <el-button @click="$emit('cancel')">Hủy</el-button>
      <el-button type="primary" @click="handleSubmit">Thêm đơn hàng</el-button>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Order } from '@/types/order'
import { ElMessage } from 'element-plus'
import { useOrdersStore } from '@/stores/orders'
import { uploadImage } from '@/api/images'
const emit = defineEmits<{
  (e: 'submit', order: Omit<Order, 'rowIndex'>): void
  (e: 'cancel'): void
}>()

const orderStore = useOrdersStore()

const formRef = ref<FormInstance>()
const form = ref({
  date: '',
  customerName: '',
  productName: '',
  productImage: '',
  color: '',
  size: '',
  quantity: 1,
  total: '',
  status: 'NHẬN ĐƠN' as const,
  linkFb: '',
  contactInfo: '',
  note: ''
})

const imagePreview = ref('')
const file = ref(undefined)
const uploadProgress = ref(0)

const rules: FormRules = {
  date: [{ required: true, message: 'Vui lòng chọn ngày', trigger: 'change' }],
  customerName: [{ required: true, message: 'Vui lòng nhập tên khách hàng', trigger: 'blur' }],
  productName: [{ required: true, message: 'Vui lòng nhập tên sản phẩm', trigger: 'blur' }],
  color: [{ required: true, message: 'Vui lòng nhập màu sắc', trigger: 'blur' }],
  size: [{ required: true, message: 'Vui lòng nhập size', trigger: 'blur' }],
  quantity: [{ required: true, message: 'Vui lòng nhập số lượng', trigger: 'change' }],
  total: [{ required: true, message: 'Vui lòng nhập tổng tiền', trigger: 'blur' }],
  status: [{ required: true, message: 'Vui lòng chọn trạng thái', trigger: 'change' }],
  contactInfo: [{ required: true, message: 'Vui lòng nhập SĐT/Địa chỉ', trigger: 'blur' }]
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  file.value = target.files?.[0]
  if (!file.value) return

  const reader = new FileReader()
  reader.onload = () => {
    imagePreview.value = reader.result as string
  }
  reader.readAsDataURL(file.value)

}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      if (!file.value) {
        ElMessage.success("Vui lòng chọn ảnh trước khi submit.")
        return
      }

      const imageUrl = await uploadImage(file.value)
      form.value.productImage = imageUrl
      const newOrder = await orderStore.addOrder(form.value)
      emit('order-added')
      ElMessage.success('Đã thêm đơn hàng mới')
    }
  })
}
</script>

<style scoped>
.el-select {
  width: 100%;
}
</style> 