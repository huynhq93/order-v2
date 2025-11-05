<template>
  <div class="order-viet-admin">
    <!-- Navigation Menu -->
    <NavigationMenu active-menu-item="order-viet-admin" />

    <el-card class="header-card">
      <h1>Quản Lý Bill Hàng Việt (Admin)</h1>

      <!-- Month/Year Selector -->
      <div class="month-selector">
        <el-date-picker
          v-model="selectedMonth"
          type="month"
          placeholder="Chọn tháng"
          format="MM/YYYY"
          value-format="YYYY-MM"
          @change="loadBills"
        />
      </div>
    </el-card>

    <!-- Create/Edit Bill Form -->
    <el-card class="form-card">
      <h2>{{ editingBill ? 'Chỉnh Sửa Bill' : 'Tạo Bill Mới' }}</h2>

      <el-form :model="billForm" label-width="120px" label-position="left">
        <el-form-item label="Hình Ảnh Bill">
          <div class="image-upload-container">
            <div v-if="imagePreview" class="image-preview">
              <img :src="imagePreview" alt="Preview" class="bill-image" />
              <div class="image-overlay">
                <el-button
                  size="small"
                  type="primary"
                  circle
                  @click="triggerImageUpload"
                  :icon="EditPen"
                />
              </div>
            </div>
            <div v-else class="upload-placeholder">
              <el-icon size="24" color="#ddd"><Picture /></el-icon>
              <el-button type="primary" plain @click="triggerImageUpload" size="small">
                Thêm ảnh
              </el-button>
            </div>
            <input
              ref="imageInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onImageSelect"
            />
          </div>
        </el-form-item>

        <el-form-item label="Trạng Thái">
          <el-select v-model="billForm.status" placeholder="Chọn trạng thái">
            <el-option label="ĐANG VẬN CHUYỂN" value="ĐANG VẬN CHUYỂN" />
            <el-option label="HOÀN THÀNH" value="HOÀN THÀNH" />
            <el-option label="HUỶ" value="HUỶ" />
          </el-select>
        </el-form-item>

        <el-form-item label="Số Lượng">
          <el-input-number v-model="billForm.quantity" :min="0" :step="1" style="width: 100%" />
        </el-form-item>

        <el-form-item label="Tổng Thanh Toán">
          <el-input-number
            v-model="billForm.total"
            :min="0"
            :precision="0"
            :step="1000"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="Ghi Chú">
          <el-input
            v-model="billForm.note"
            type="textarea"
            :rows="3"
            placeholder="Nhập ghi chú..."
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="saveBill" :loading="saving">
            {{ editingBill ? 'Cập Nhật' : 'Tạo Bill' }}
          </el-button>
          <el-button v-if="editingBill" @click="cancelEdit">Huỷ</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Bills Table -->
    <el-card class="table-card">
      <h2>Danh Sách Bills</h2>

      <el-table :data="bills" border stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="billCode" label="Mã Bill" width="180" />

        <el-table-column label="Hình Ảnh" width="120">
          <template #default="{ row }">
            <el-image
              v-if="row.imageUrl"
              :src="row.imageUrl"
              fit="cover"
              style="width: 80px; height: 80px; cursor: pointer"
              :preview-src-list="[row.imageUrl]"
            />
          </template>
        </el-table-column>

        <el-table-column prop="status" label="Trạng Thái" width="150">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" effect="dark">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="quantity" label="Số Lượng" width="100" />

        <el-table-column prop="total" label="Tổng Thanh Toán" width="150">
          <template #default="{ row }">
            {{ formatCurrency(row.total) }}
          </template>
        </el-table-column>

        <el-table-column prop="note" label="Ghi Chú" min-width="200" />

        <el-table-column label="Thao Tác" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="editBill(row)" link> Sửa </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { EditPen, Picture } from '@element-plus/icons-vue'
import NavigationMenu from '@/components/NavigationMenu.vue'
import { uploadImage } from '@/api/images'
import {
  getOrderVietBills,
  createOrderVietBill,
  updateOrderVietBill,
  type OrderVietBill,
} from '@/api/orderViet'

// State
const selectedMonth = ref(new Date().toISOString().substring(0, 7)) // YYYY-MM format
const bills = ref<OrderVietBill[]>([])
const loading = ref(false)
const saving = ref(false)
const uploading = ref(false)
const editingBill = ref<OrderVietBill | null>(null)
const imageInput = ref<HTMLInputElement>()
const imagePreview = ref('')
const file = ref<File | undefined>(undefined)

// Form data
const billForm = ref({
  imageUrl: '',
  status: 'ĐANG VẬN CHUYỂN',
  quantity: 0,
  total: 0,
  note: '',
})

// Parse month/year from selectedMonth
const currentMonth = computed(() => {
  const [year, month] = selectedMonth.value.split('-')
  return {
    month: parseInt(month),
    year: parseInt(year),
  }
})

// Load bills for selected month
async function loadBills() {
  try {
    loading.value = true
    const { month, year } = currentMonth.value
    bills.value = await getOrderVietBills(month, year)
  } catch (error) {
    console.error('Error loading bills:', error)
    ElMessage.error('Không thể tải danh sách bills')
  } finally {
    loading.value = false
  }
}

// Image handling functions
const triggerImageUpload = () => {
  imageInput.value?.click()
}

const onImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    file.value = target.files[0]
    
    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file.value)
  }
}

const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    
    img.onload = () => {
      const MAX_WIDTH = 800
      const MAX_HEIGHT = 800
      
      let { width, height } = img
      
      if (width > height) {
        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width
          width = MAX_WIDTH
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = (width * MAX_HEIGHT) / height
          height = MAX_HEIGHT
        }
      }
      
      canvas.width = width
      canvas.height = height
      
      ctx.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          })
          resolve(compressedFile)
        }
      }, 'image/jpeg', 0.8)
    }
    
    img.src = URL.createObjectURL(file)
  })
}

// Save bill (create or update)
async function saveBill() {
  try {
    // Validation
    if (!imagePreview.value) {
      ElMessage.warning('Vui lòng upload hình ảnh bill')
      return
    }
    if (!billForm.value.status) {
      ElMessage.warning('Vui lòng chọn trạng thái')
      return
    }

    saving.value = true
    const { month, year } = currentMonth.value

    let imageUrl = billForm.value.imageUrl // Use existing image if available
    
    // Upload new image if file selected
    if (file.value) {
      try {
        // Check file size (5MB limit)
        if (file.value.size > 5 * 1024 * 1024) {
          ElMessage.error('Kích thước ảnh phải nhỏ hơn 5MB')
          saving.value = false
          return
        }
        
        uploading.value = true
        
        // Compress image
        const compressedFile = await compressImage(file.value)
        
        // Upload image
        const uploadResponse = await uploadImage(compressedFile)
        if (uploadResponse?.data?.secure_url) {
          imageUrl = uploadResponse.data.secure_url
        } else if (typeof uploadResponse === 'string') {
          imageUrl = uploadResponse
        }
        
        uploading.value = false
      } catch (error) {
        console.error('Image upload failed:', error)
        ElMessage.error('Upload ảnh thất bại')
        uploading.value = false
        saving.value = false
        return
      }
    }

    if (editingBill.value) {
      // Update existing bill
      await updateOrderVietBill({
        billCode: editingBill.value.billCode,
        imageUrl: imageUrl,
        status: billForm.value.status,
        quantity: String(billForm.value.quantity),
        total: String(billForm.value.total),
        note: billForm.value.note,
        month,
        year,
        rowIndex: editingBill.value.rowIndex,
      })
      ElMessage.success('Cập nhật bill thành công!')
    } else {
      // Create new bill
      await createOrderVietBill({
        imageUrl: imageUrl,
        status: billForm.value.status,
        quantity: String(billForm.value.quantity),
        total: String(billForm.value.total),
        note: billForm.value.note,
        month,
        year,
      })
      ElMessage.success('Tạo bill thành công!')
    }

    // Reset form and reload bills
    resetForm()
    await loadBills()
  } catch (error) {
    console.error('Error saving bill:', error)
    ElMessage.error('Có lỗi xảy ra khi lưu bill')
  } finally {
    saving.value = false
    uploading.value = false
  }
}

// Edit bill
function editBill(bill: OrderVietBill) {
  editingBill.value = bill
  billForm.value = {
    imageUrl: bill.imageUrl,
    status: bill.status,
    quantity: parseInt(bill.quantity) || 0,
    total: parseInt(bill.total) || 0,
    note: bill.note,
  }
  
  // Set image preview
  if (bill.imageUrl) {
    imagePreview.value = bill.imageUrl
  }
  
  // Clear file selection
  file.value = undefined

  // Scroll to form
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Cancel edit
function cancelEdit() {
  editingBill.value = null
  resetForm()
}

// Reset form
function resetForm() {
  editingBill.value = null
  imagePreview.value = ''
  file.value = undefined
  billForm.value = {
    imageUrl: '',
    status: 'ĐANG VẬN CHUYỂN',
    quantity: 0,
    total: 0,
    note: '',
  }
}

// Get status tag type
function getStatusType(status: string) {
  switch (status) {
    case 'ĐANG VẬN CHUYỂN':
      return 'warning'
    case 'HOÀN THÀNH':
      return 'success'
    case 'HUỶ':
      return 'danger'
    default:
      return 'info'
  }
}

// Format currency
function formatCurrency(value: string | number) {
  const num = typeof value === 'string' ? parseInt(value) : value
  if (isNaN(num)) return '0đ'
  return num.toLocaleString('vi-VN') + 'đ'
}

// On mounted
onMounted(() => {
  loadBills()
})
</script>

<style scoped>
.order-viet-admin {
  padding: 20px;
}

.header-card {
  margin-bottom: 20px;
}

.header-card h1 {
  margin: 0 0 20px 0;
  font-size: 24px;
  color: #303133;
}

.month-selector {
  display: flex;
  gap: 10px;
  align-items: center;
}

.form-card {
  margin-bottom: 20px;
}

.form-card h2 {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #303133;
}

.image-upload-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
}

.image-preview {
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #dcdfe6;
}

.bill-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.upload-placeholder {
  width: 200px;
  height: 200px;
  border: 2px dashed #dcdfe6;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background: #f9fafb;
}

.upload-placeholder:hover {
  border-color: #409eff;
  background: #ecf5ff;
}

.hidden {
  display: none;
}

.upload-btn {
  flex-shrink: 0;
}

.table-card h2 {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #303133;
}
</style>
