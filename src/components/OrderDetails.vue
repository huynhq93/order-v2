<template>
  <div class="order-details">
    <!-- Header -->
    <div class="order-header">
      <!-- <div class="header-info">
        <h2 class="product-name">{{ order.productName || 'Tên sản phẩm' }}</h2>
        <div class="status-price">
          <el-tag :type="getStatusType(order.status)" size="large">
            {{ order.status }}
          </el-tag>
          <span class="price">{{ formatCurrency(order.total) }}</span>
        </div>
      </div> -->
      
      <div class="product-image-section">
        <div v-if="isEditing" class="image-upload">
          <div v-if="imagePreview || editedOrder.productImage" class="image-preview">
            <el-image
              :src="imagePreview || editedOrder.productImage"
              fit="cover"
              class="product-image"
              :preview-src-list="[imagePreview || editedOrder.productImage]"
            />
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
            @change="handleImageChange"
          />
        </div>
        <div v-else class="image-display">
          <el-image
            v-if="order.productImage"
            :src="order.productImage"
            fit="cover"
            class="product-image"
            :preview-src-list="[order.productImage]"
          />
          <div v-else class="no-image">
            <el-icon size="24" color="#ddd"><Picture /></el-icon>
            <span class="no-image-text">Chưa có ảnh</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="content-grid">
      <!-- Left Column -->
      <div class="left-column">
        <!-- Basic Info Section -->
        <div class="info-section">
          <h3 class="section-title">Thông tin cơ bản</h3>
          
          <div class="field-row">
            <div class="field-item">
              <label class="field-label">Ngày đặt hàng</label>
              <el-date-picker
                v-if="isEditing"
                v-model="editedOrder.date"
                type="date"
                placeholder="Chọn ngày"
                format="DD/MM/YYYY"
                value-format="DD/MM/YYYY"
                class="w-full"
              />
              <div v-else class="field-value">{{ order.date || '-' }}</div>
            </div>
          </div>

          <div class="field-row">
            <div class="field-item">
              <label class="field-label">Tên khách hàng</label>
              <el-select
                v-if="isEditing"
                v-model="editedOrder.customerName"
                placeholder="Chọn hoặc nhập tên khách hàng"
                filterable
                remote
                allow-create
                default-first-option
                clearable
                :remote-method="handleCustomerSearch"
                :loading="isLoadingCustomers"
                @change="onCustomerSelect"
                class="w-full"
              >
                <el-option
                  v-for="customer in customersList"
                  :key="customer.customerName"
                  :label="customer.customerName"
                  :value="customer.customerName"
                />
              </el-select>
              <div v-else class="field-value">{{ order.customerName || '-' }}</div>
            </div>
          </div>
        </div>

        <!-- Product Info Section -->
        <div class="info-section">
          <h3 class="section-title">Thông tin sản phẩm</h3>
          
          <div class="field-row">
            <div class="field-item">
              <label class="field-label">Mã sản phẩm</label>
              <div v-if="isEditing" class="product-code-section">
                <el-select
                  v-model="editedOrder.productCode"
                  placeholder="Chọn hoặc nhập mã sản phẩm"
                  filterable
                  remote
                  allow-create
                  default-first-option
                  :remote-method="handleProductSearch"
                  :loading="isLoadingProducts"
                  clearable
                  class="product-select"
                  @change="onProductCodeSelect"
                >
                  <el-option
                    v-for="product in productsList"
                    :key="product.value"
                    :label="product.label"
                    :value="product.value"
                  >
                    <div class="product-option">
                      <img 
                        v-if="product.data?.productImage" 
                        :src="product.data.productImage" 
                        class="product-option-image" 
                        alt=""
                      />
                      <div class="product-option-info">
                        <div class="product-option-code">{{ product.data?.productCode }}</div>
                        <div class="product-option-name">{{ product.data?.productName }}</div>
                      </div>
                    </div>
                  </el-option>
                </el-select>
                <el-button
                  type="primary"
                  :icon="Search"
                  circle
                  size="small"
                  class="search-button"
                  @click="openProductsModal"
                  title="Xem danh sách sản phẩm"
                />
              </div>
              <div v-else class="field-value">{{ order.productCode || '-' }}</div>
            </div>
          </div>
          
          <div class="field-row">
            <div class="field-item">
              <label class="field-label">Tên sản phẩm</label>
              <el-input
                v-if="isEditing"
                v-model="editedOrder.productName"
                placeholder="Nhập tên sản phẩm"
              />
              <div v-else class="field-value">{{ order.productName || '-' }}</div>
            </div>
          </div>

          <div class="field-row two-cols">
            <div class="field-item">
              <label class="field-label">Màu sắc</label>
              <el-input
                v-if="isEditing"
                v-model="editedOrder.color"
                placeholder="Màu sắc"
              />
              <div v-else class="field-value">{{ order.color || '-' }}</div>
            </div>
            
            <div class="field-item">
              <label class="field-label">Kích thước</label>
              <el-input
                v-if="isEditing"
                v-model="editedOrder.size"
                placeholder="Size"
              />
              <div v-else class="field-value">{{ order.size || '-' }}</div>
            </div>
          </div>

          <div class="field-row two-cols">
            <div class="field-item">
              <label class="field-label">Số lượng</label>
              <el-input-number
                v-if="isEditing"
                v-model.number="editedOrder.quantity"
                :min="1"
                class="w-full"
              />
              <div v-else class="field-value">{{ order.quantity || '-' }}</div>
            </div>
            
            <div class="field-item">
              <label class="field-label">Đơn giá</label>
              <el-input
                v-if="isEditing"
                v-model="editedOrder.total"
                placeholder="Đơn giá"
              >
                <template #suffix>VNĐ</template>
              </el-input>
              <div v-else class="field-value price-value">{{ formatCurrency(order.total) || '0 đ' }}</div>
            </div>
          </div>

          <div class="field-row">
            <div class="field-item">
              <label class="field-label">Trạng thái</label>
              <el-select
                v-if="isEditing"
                v-model="editedOrder.status"
                placeholder="Chọn trạng thái"
                class="w-full"
              >
                <el-option label="NHẬN ĐƠN" value="NHẬN ĐƠN" />
                <el-option label="ĐANG GIAO" value="ĐANG GIAO" />
                <el-option label="ĐANG CHỜ GIAO" value="ĐANG CHỜ GIAO" />
                <el-option label="HOÀN THÀNH" value="HOÀN THÀNH" />
                <el-option label="HUỶ" value="Hủy" />
              </el-select>
              <el-tag v-else :type="getStatusType(order.status)" class="status-tag">
                {{ order.status || 'NHẬN ĐƠN' }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="right-column">
        <div class="info-section">
          <h3 class="section-title">Thông tin liên hệ</h3>
          
          <div class="field-row">
            <div class="field-item">
              <label class="field-label">Link Facebook</label>
              <el-input
                v-if="isEditing"
                v-model="editedOrder.linkFb"
                placeholder="Nhập link Facebook"
              />
              <div v-else class="field-value">
                <a 
                  v-if="order.linkFb" 
                  :href="order.linkFb" 
                  target="_blank" 
                  class="link-text"
                >
                  {{ order.linkFb }}
                </a>
                <span v-else>-</span>
              </div>
            </div>
          </div>

          <div class="field-row">
            <div class="field-item">
              <label class="field-label">SĐT + Địa chỉ</label>
              <el-input
                v-if="isEditing"
                v-model="editedOrder.contactInfo"
                type="textarea"
                :rows="2"
                placeholder="Nhập số điện thoại và địa chỉ"
              />
              <div v-else class="field-value textarea-value">{{ order.contactInfo || '-' }}</div>
            </div>
          </div>

          <div class="field-row">
            <div class="field-item">
              <label class="field-label">Ghi chú</label>
              <el-input
                v-if="isEditing"
                v-model="editedOrder.note"
                type="textarea"
                :rows="2"
                placeholder="Nhập ghi chú (nếu có)"
              />
              <div v-else class="field-value textarea-value">{{ order.note || '-' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="footer-actions">
      <template v-if="isEditing">
        <el-button @click="cancelEdit" size="large">
          Hủy bỏ
        </el-button>
        <el-button 
          type="primary" 
          @click="saveChanges" 
          size="large"
          :loading="saving"
        >
          {{ saving ? 'Đang lưu...' : 'Lưu thay đổi' }}
        </el-button>
      </template>
      <el-button v-else type="primary" @click="startEdit" size="large">
        Chỉnh sửa đơn hàng
      </el-button>
    </div>

    <!-- Products Modal -->
    <el-dialog
      v-model="showProductsModal"
      title="Danh sách sản phẩm"
      width="80%"
      :before-close="handleCloseProductsModal"
    >
      <div class="products-modal">
        <div class="modal-search">
          <el-input
            v-model="modalSearchQuery"
            placeholder="Tìm kiếm sản phẩm..."
            :prefix-icon="Search"
            clearable
            @input="filterProducts"
          />
        </div>
        
        <div class="products-grid">
          <div
            v-for="product in filteredModalProducts"
            :key="product.productCode"
            class="product-card"
            @click="selectProductFromModal(product)"
          >
            <div class="product-image-container">
              <img
                v-if="product.productImage"
                :src="product.productImage"
                :alt="product.productName"
                class="product-card-image"
              />
              <div v-else class="product-no-image">
                <el-icon size="24"><Picture /></el-icon>
              </div>
            </div>
            <div class="product-card-info">
              <div class="product-card-code">{{ product.productCode }}</div>
              <div class="product-card-name">{{ product.productName }}</div>
            </div>
          </div>
        </div>

        <div v-if="isLoadingModalProducts" class="modal-loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>Đang tải danh sách sản phẩm...</span>
        </div>

        <div v-if="!isLoadingModalProducts && filteredModalProducts.length === 0" class="modal-empty">
          <el-icon size="48"><Box /></el-icon>
          <p>Không tìm thấy sản phẩm nào</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { formatCurrency } from '@/utils/format'
import type { Order } from '@/types/order'
import type { Customer } from '@/types/customer'
import type { Product } from '@/types/sheet'
import { ElMessage } from 'element-plus'
import { uploadImage } from '@/api/images'
import { productsAPI } from '@/api/products'
import { getAllCustomers, clearCustomersCache } from '@/api/customers'
import { 
  EditPen, 
  Picture,
  Loading,
  Search,
  Box
} from '@element-plus/icons-vue'

const props = defineProps<{
  order: Order
  selectedDate?: { month: number; year: number }
}>()

const emit = defineEmits<{
  (e: 'update', order: Order): void
  (e: 'close'): void
}>()

const isEditing = ref(false)
const saving = ref(false)
const isSearchingProduct = ref(false)

// Customer dropdown state
const customersList = ref<Customer[]>([])
const isLoadingCustomers = ref(false)

// Products dropdown state
const productsList = ref<Array<{ value: string; label: string; data: Product }>>([])
const allProductsData = ref<Array<{ value: string; label: string; data: Product }>>([]) // Store original data
const isLoadingProducts = ref(false)

// Products modal state
const showProductsModal = ref(false)
const modalSearchQuery = ref('')
const allProducts = ref<Product[]>([])
const filteredModalProducts = ref<Product[]>([])
const isLoadingModalProducts = ref(false)

// Helper function to convert date format for date picker
const formatDateForPicker = (dateStr: string) => {
  if (!dateStr) return ''
  
  // If already in YYYY/MM/DD format, return as is
  if (dateStr.includes('/') && dateStr.split('/')[0].length === 4) {
    const parts = dateStr.split('/')
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  
  // If in DD/MM/YYYY format, convert to YYYY/MM/DD
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/')
    if (parts.length === 3) {
      return dateStr
    }
    // If only DD/MM format (missing year), use selected year from MonthSelector
    if (parts.length === 2) {
      const selectedYear = props.selectedDate?.year || new Date().getFullYear()
      return `${parts[0]}/${parts[1]}/${selectedYear}`
    }
  }
  
  return dateStr
}

const editedOrder = ref<Order>({ 
    ...props.order,
    date: formatDateForPicker(props.order.date)
  })
const imageInput = ref<HTMLInputElement>()
const imagePreview = ref('')
const imageFile = ref<File | null>(null)

// Product dropdown and modal functionality
const onProductCodeSelect = async (selectedProductCode: string) => {
  if (!selectedProductCode) return
  
  const selectedProduct = productsList.value.find(p => p.value === selectedProductCode)
  if (selectedProduct && selectedProduct.data) {
    // Existing product - load its data
    editedOrder.value.productName = selectedProduct.data.productName
    if (selectedProduct.data.productImage) {
      imagePreview.value = selectedProduct.data.productImage
      editedOrder.value.productImage = selectedProduct.data.productImage
      // Clear file selection since we're using existing image
      imageFile.value = null
    }
  }
}

// Load all products for dropdown
const loadAllProducts = async () => {
  try {
    isLoadingProducts.value = true
    const result = await productsAPI.getAllProducts()
    
    if (result.success && result.data) {
      // Backend already sorts products by newest product code first
      // No need to sort again in frontend
      const formattedProducts = result.data.map(product => ({
        value: product.productCode,
        label: `${product.productCode} - ${product.productName}`,
        data: product
      }))
      
      // Store original data for filtering
      allProductsData.value = formattedProducts
      productsList.value = formattedProducts
    }
  } catch (error) {
    console.error('Error loading products:', error)
  } finally {
    isLoadingProducts.value = false
  }
}

// Handle product search/filter (local filtering only)
const handleProductSearch = (query: string) => {
  if (!query) {
    // If no query, show all products
    productsList.value = allProductsData.value
    return
  }
  
  // Filter products locally from stored data
  const filteredProducts = allProductsData.value.filter(product =>
    product.data.productCode.toLowerCase().includes(query.toLowerCase()) ||
    product.data.productName.toLowerCase().includes(query.toLowerCase())
  )
  
  productsList.value = filteredProducts
}

// Products modal functions
const loadModalProducts = async () => {
  // If products already loaded for dropdown, use that data
  if (allProductsData.value.length > 0) {
    allProducts.value = allProductsData.value.map(item => item.data)
    filteredModalProducts.value = allProducts.value
    return
  }
  
  // Otherwise load from API
  try {
    isLoadingModalProducts.value = true
    const result = await productsAPI.getAllProducts()
    
    if (result.success && result.data) {
      // Backend already sorts products by newest product code first
      // No need to sort again in frontend
      allProducts.value = result.data
      filteredModalProducts.value = result.data
      
      // Also update dropdown data
      const formattedProducts = result.data.map(product => ({
        value: product.productCode,
        label: `${product.productCode} - ${product.productName}`,
        data: product
      }))
      allProductsData.value = formattedProducts
      productsList.value = formattedProducts
    }
  } catch (error) {
    console.error('Error loading modal products:', error)
    ElMessage.error('Lỗi khi tải danh sách sản phẩm')
  } finally {
    isLoadingModalProducts.value = false
  }
}

const filterProducts = () => {
  if (!modalSearchQuery.value) {
    filteredModalProducts.value = allProducts.value
    return
  }
  
  const query = modalSearchQuery.value.toLowerCase()
  filteredModalProducts.value = allProducts.value.filter(product =>
    product.productCode.toLowerCase().includes(query) ||
    product.productName.toLowerCase().includes(query)
  )
}

const selectProductFromModal = (product: Product) => {
  editedOrder.value.productCode = product.productCode
  editedOrder.value.productName = product.productName
  if (product.productImage) {
    imagePreview.value = product.productImage
    editedOrder.value.productImage = product.productImage
    imageFile.value = null
  }
  showProductsModal.value = false
  ElMessage.success('Đã chọn sản phẩm')
}

const handleCloseProductsModal = () => {
  showProductsModal.value = false
  modalSearchQuery.value = ''
}

const openProductsModal = async () => {
  showProductsModal.value = true
  
  // Use already loaded data if available
  if (allProductsData.value.length > 0) {
    allProducts.value = allProductsData.value.map(item => item.data)
    filteredModalProducts.value = allProducts.value
  } else {
    // Load products if not already loaded
    await loadModalProducts()
  }
}

// Legacy function for backward compatibility (keep for watch)
const onProductCodeChange = async () => {
  const productCode = editedOrder.value.productCode?.trim()
  if (!productCode) return
  
  try {
    isSearchingProduct.value = true
    const result = await productsAPI.searchByCode(productCode)
    
    if (result.success && result.data) {
      // Found existing product - load its data
      editedOrder.value.productName = result.data.productName
      if (result.data.productImage) {
        imagePreview.value = result.data.productImage
        editedOrder.value.productImage = result.data.productImage
        // Clear file selection since we're using existing image
        imageFile.value = null
      }
    } else {
      // Product not found - user can continue with manual entry
      ElMessage.info('Không tìm thấy sản phẩm. Bạn có thể nhập thông tin và ảnh mới.')
    }
  } catch (error) {
    console.error('Error searching product:', error)
    ElMessage.error('Lỗi khi tìm kiếm sản phẩm')
  } finally {
    isSearchingProduct.value = false
  }
}

// Customer dropdown functionality
const loadAllCustomers = async () => {
  try {
    isLoadingCustomers.value = true
    const result = await getAllCustomers()
    
    if (result.success && result.data) {
      customersList.value = result.data
    }
  } catch (error) {
    console.error('Error loading customers:', error)
    ElMessage.error('Lỗi khi tải danh sách khách hàng')
  } finally {
    isLoadingCustomers.value = false
  }
}

const handleCustomerSearch = (query: string) => {
  if (!query) {
    // If no query, show all customers
    loadAllCustomers()
    return
  }
  
  // Filter customers locally
  const filtered = customersList.value.filter((customer: Customer) =>
    customer.customerName.toLowerCase().includes(query.toLowerCase())
  )
  customersList.value = filtered
}

const onCustomerSelect = (customerName: string) => {
  if (!customerName) return
  
  // Find the selected customer
  const selectedCustomer = customersList.value.find(
    (customer: Customer) => customer.customerName === customerName
  )
  
  if (selectedCustomer) {
    // Existing customer - auto-fill contact info and link FB
    if (selectedCustomer.contactInfo && !editedOrder.value.contactInfo) {
      editedOrder.value.contactInfo = selectedCustomer.contactInfo
    }
    if (selectedCustomer.linkFb && !editedOrder.value.linkFb) {
      editedOrder.value.linkFb = selectedCustomer.linkFb
    }
    
    if (selectedCustomer.contactInfo || selectedCustomer.linkFb) {
      ElMessage.success('Đã tự động điền thông tin khách hàng')
    }
  }
  // If customer not found (new customer), do nothing - allow manual entry
}

// Reset editing state - to be called when modal is closed
const resetEditingState = () => {
  isEditing.value = false
  editedOrder.value = { 
    ...props.order,
    date: formatDateForPicker(props.order.date)
  }
  imagePreview.value = ''
  imageFile.value = null
}

// Expose the reset function to parent component
defineExpose({
  resetEditingState
})

// Load customers and products on component mount
onMounted(() => {
  loadAllCustomers()
  loadAllProducts()
})

const getStatusType = (status: string) => {
  switch (status) {
    case 'NHẬN ĐƠN':
      return 'info'
    case 'ĐANG GIAO':
      return 'warning'
    case 'ĐANG CHỜ GIAO':
      return 'primary'
    case 'HOÀN THÀNH':
      return 'success'
    case 'Hủy':
      return 'danger'
    default:
      return 'info'
  }
}



// // Helper function to convert date back to display format
// const formatDateForDisplay = (dateStr: string) => {
//   if (!dateStr) return ''
  
//   // If in YYYY/MM/DD format, convert to DD/MM/YYYY
//   if (dateStr.includes('/') && dateStr.split('/')[0].length === 4) {
//     const parts = dateStr.split('/')
//     if (parts.length === 3) {
//       return `${parts[2]}/${parts[1]}/${parts[0]}`
//     }
//   }
  
//   // If only DD/MM format, keep as is
//   if (dateStr.includes('/')) {
//     const parts = dateStr.split('/')
//     if (parts.length === 2) {
//       return dateStr // Keep DD/MM format for display
//     }
//   }
  
//   return dateStr
// }

const startEdit = () => {
  isEditing.value = true
  editedOrder.value = { 
    ...props.order,
    date: formatDateForPicker(props.order.date)
  }
  imagePreview.value = ''
  imageFile.value = null
}

const cancelEdit = () => {
  editedOrder.value = { 
    ...props.order,
    date: formatDateForPicker(props.order.date)
  }
  isEditing.value = false
  imagePreview.value = ''
  imageFile.value = null
}

const triggerImageUpload = () => {
  imageInput.value?.click()
}

const handleImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      ElMessage.error('File ảnh quá lớn. Vui lòng chọn file nhỏ hơn 5MB.')
      return
    }

    // Clear productCode when uploading new image (this becomes a new product)
    editedOrder.value.productCode = ''

    // Compress image before upload
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Calculate new dimensions (max 800px)
      const maxSize = 800
      let { width, height } = img
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }
      }
      
      // Draw resized image
      canvas.width = width
      canvas.height = height
      ctx?.drawImage(img, 0, 0, width, height)
      
      // Convert to blob with compression
      canvas.toBlob((blob) => {
        if (blob) {
          imageFile.value = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          })
          
          // Create preview
          const reader = new FileReader()
          reader.onload = (e) => {
            imagePreview.value = e.target?.result as string
          }
          reader.readAsDataURL(blob)
        }
      }, 'image/jpeg', 0.8) // 80% quality
    }
    
    img.src = URL.createObjectURL(file)
  }
}

const saveChanges = async () => {
  saving.value = true
  try {
    // Upload new image if selected
    if (imageFile.value) {
      try {
        const imageUrl = await uploadImage(imageFile.value)
        editedOrder.value.productImage = imageUrl
        ElMessage.success('Đã tải ảnh lên thành công')
      } catch {
        ElMessage.error('Lỗi khi tải ảnh lên')
        saving.value = false
        return
      }
    }
    
    emit('update', editedOrder.value)
    
    // Clear customers cache since customer info might have been updated
    clearCustomersCache()
    
    isEditing.value = false
    imagePreview.value = ''
    imageFile.value = null
    ElMessage.success('Đã cập nhật thông tin đơn hàng')
  } catch {
    ElMessage.error('Có lỗi xảy ra khi cập nhật')
  } finally {
    saving.value = false
  }
}

// Watch productCode changes for auto-search
watch(() => editedOrder.value.productCode, (newProductCode) => {
  if (newProductCode && newProductCode.trim() && isEditing.value) {
    // Debounce the search to avoid too many API calls
    const debounceTimer = setTimeout(() => {
      onProductCodeChange()
    }, 500)
    
    return () => clearTimeout(debounceTimer)
  }
})
</script>

<style scoped>
.order-details {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Header */
.order-header {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
  align-items: flex-start;
}

.header-info {
  flex: 1;
}

.product-image-section {
  flex-shrink: 0;
}

.image-upload,
.image-display {
  width: 80px;
  height: 80px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview,
.product-image {
  width: 100%;
  height: 100%;
  position: relative;
}

.product-image {
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-overlay:hover {
  opacity: 1;
}

.upload-placeholder,
.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 11px;
  gap: 3px;
}

.no-image-text {
  font-size: 11px;
  color: #9ca3af;
}

.product-name {
  font-size: 1.4rem;
  font-weight: bold;
  color: #111827;
  margin-bottom: 12px;
  margin: 0 0 12px 0;
}

.status-price {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price {
  font-size: 1.4rem;
  font-weight: bold;
  color: #111827;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

@media (min-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Info Sections */
.info-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 1200;
  color: #111827;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e5e7eb;
  margin: 0;
}

/* Field Styling */
.field-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field-row.two-cols {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

@media (min-width: 768px) {
  .field-row.two-cols {
    grid-template-columns: 1fr 1fr;
  }
}

.field-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  display: block;
  font-size: 0.875rem;
  font-weight: bold;
  color: #374151;
}

.field-value {
  font-size: 0.95rem;
  color: #6b7280;
  padding: 6px 0;
  min-height: 32px;
  display: flex;
  align-items: center;
}

.field-value.price-value {
  font-weight: bold;
  color: #059669;
}

.textarea-value {
  white-space: pre-wrap;
  line-height: 1.5;
  align-items: flex-start;
  padding-top: 6px;
  max-height: 80px;
  overflow-y: auto;
}

.link-text {
  color: #2563eb;
  text-decoration: underline;
  word-break: break-all;
}

.link-text:hover {
  color: #1d4ed8;
}

.status-tag {
  font-weight: 500;
}

/* Footer */
.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

/* Utilities */
.hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.w-full {
  width: 100%;
}

/* Product Code Section */
.product-code-section {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.product-select {
  flex: 1;
}

.search-button {
  margin-top: 0;
  flex-shrink: 0;
}

/* Product Option Styling */
.product-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.product-option-image {
  width: 32px;
  height: 32px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.product-option-info {
  flex: 1;
  min-width: 0;
}

.product-option-code {
  font-weight: 600;
  font-size: 13px;
  color: #374151;
}

.product-option-name {
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Products Modal */
.products-modal {
  max-height: 60vh;
}

.modal-search {
  margin-bottom: 16px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding: 8px 0;
}

.product-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.product-card:hover {
  border-color: #6366f1;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
  transform: translateY(-1px);
}

.product-image-container {
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  overflow: hidden;
  background: #f9fafb;
  margin-bottom: 8px;
}

.product-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #9ca3af;
}

.product-card-info {
  text-align: center;
}

.product-card-code {
  font-weight: 600;
  font-size: 14px;
  color: #374151;
  margin-bottom: 4px;
}

.product-card-name {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.modal-loading,
.modal-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #6b7280;
  gap: 8px;
}

.modal-loading .is-loading {
  font-size: 24px;
}

/* Element Plus Overrides */
:deep(.el-input__wrapper) {
  border-color: #d1d5db;
  border-radius: 6px;
}

:deep(.el-input__wrapper:hover) {
  border-color: #9ca3af;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

:deep(.el-textarea__inner) {
  border-color: #d1d5db;
  border-radius: 6px;
}

:deep(.el-date-editor) {
  width: 100%;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-button) {
  font-weight: 500;
}

:deep(.el-tag) {
  font-weight: 500;
}

/* Status Tag Colors */
:deep(.el-tag.el-tag--info) {
  background-color: #dbeafe;
  color: #1e40af;
  border-color: #bfdbfe;
}

:deep(.el-tag.el-tag--warning) {
  background-color: #fef3c7;
  color: #d97706;
  border-color: #fde68a;
}

:deep(.el-tag.el-tag--primary) {
  background-color: #e0e7ff;
  color: #4338ca;
  border-color: #c7d2fe;
}

:deep(.el-tag.el-tag--success) {
  background-color: #dcfce7;
  color: #166534;
  border-color: #bbf7d0;
}

:deep(.el-tag.el-tag--danger) {
  background-color: #fee2e2;
  color: #dc2626;
  border-color: #fecaca;
}

/* Responsive */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .order-details {
    padding: 12px;
    max-width: 100vw;
  }
  
  .order-header {
    flex-direction: row;
    gap: 12px;
    margin-bottom: 16px;
    padding-bottom: 12px;
  }
  
  .product-image-section {
    width: 60px;
    height: 60px;
  }
  
  .image-upload,
  .image-display {
    width: 60px;
    height: 60px;
  }
  
  .product-name {
    font-size: 1.1rem;
    margin-bottom: 8px;
  }
  
  .price {
    font-size: 1.1rem;
  }
  
  .content-grid {
    gap: 16px;
    margin-bottom: 16px;
  }
  
  .left-column,
  .right-column {
    gap: 12px;
  }
  
  .info-section {
    gap: 8px;
  }
  
  .section-title {
    font-size: 1rem;
    margin-bottom: 8px;
    padding-bottom: 4px;
  }
  
  .field-row {
    gap: 8px;
  }
  
  .field-row.two-cols {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  
  .field-item {
    gap: 4px;
  }
  
  .field-label {
    font-size: 0.8rem;
    font-weight: bold;
  }
  
  .field-value {
    font-size: 0.85rem;
    color: #6b7280;
    padding: 4px 0;
    min-height: 28px;
  }
  
  .textarea-value {
    max-height: 60px;
    font-size: 0.85rem;
    line-height: 1.4;
  }
  
  .footer-actions {
    padding-top: 12px;
    gap: 8px;
    margin: 0;
    box-sizing: border-box;
  }
  
  :deep(.footer-actions .el-button) {
    margin: 0 !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    box-sizing: border-box;
  }
  
  .upload-placeholder,
  .no-image {
    font-size: 9px;
    gap: 2px;
  }
  
  .no-image-text {
    font-size: 9px;
  }

  /* Products modal mobile */
  :deep(.el-dialog) {
    width: 95% !important;
    margin: 0 auto !important;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 8px;
  }
  
  .product-image-container {
    height: 80px;
  }
  
  .product-card {
    padding: 8px;
  }
  
  .product-card-code {
    font-size: 12px;
  }
  
  .product-card-name {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .order-details {
    padding: 8px;
  }
  
  .order-header {
    gap: 8px;
    margin-bottom: 12px;
    padding-bottom: 8px;
  }
  
  .product-image-section {
    width: 50px;
    height: 50px;
  }
  
  .image-upload,
  .image-display {
    width: 50px;
    height: 50px;
  }
  
  .product-name {
    font-size: 1rem;
    margin-bottom: 6px;
  }
  
  .price {
    font-size: 1rem;
  }
  
  .status-price {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  
  .content-grid {
    gap: 12px;
    margin-bottom: 12px;
  }
  
  .left-column,
  .right-column {
    gap: 10px;
  }
  
  .info-section {
    gap: 6px;
  }
  
  .section-title {
    font-size: 0.95rem;
    margin-bottom: 6px;
    padding-bottom: 3px;
  }
  
  .field-row {
    gap: 6px;
  }
  
  .field-item {
    gap: 3px;
  }
  
  .field-label {
    font-size: 0.75rem;
    font-weight: bold;
  }
  
  .field-value {
    font-size: 0.8rem;
    color: #6b7280;
    padding: 3px 0;
    min-height: 24px;
  }
  
  .textarea-value {
    max-height: 50px;
    font-size: 0.8rem;
    line-height: 1.3;
  }
  
  .footer-actions {
    padding-top: 10px;
    flex-direction: column;
    gap: 6px;
    margin: 0;
    box-sizing: border-box;
  }
  
  :deep(.footer-actions .el-button) {
    margin: 0 !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    width: 100%;
    box-sizing: border-box;
  }
  
  .upload-placeholder,
  .no-image {
    font-size: 8px;
    gap: 1px;
  }
  
  .no-image-text {
    font-size: 8px;
  }
}
</style> 