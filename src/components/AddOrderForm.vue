<template>
  <div class="add-order-form">
    <!-- Header with Image -->
    <div class="form-header">
      <div class="product-image-section">
        <div class="image-upload">
          <div v-if="imagePreview" class="image-preview">
            <img :src="imagePreview" alt="Preview" class="product-image" />
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
      </div>
    </div>

    <!-- Main Content -->
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
    >
      <div class="content-grid">
        <!-- Left Column -->
        <div class="left-column">
          <!-- Basic Info Section -->
          <div class="info-section">
            <h3 class="section-title">Thông tin cơ bản</h3>
            
            <div class="field-row">
              <div class="field-item">
                <el-form-item label="Ngày đặt hàng" prop="date">
                  <el-date-picker
                    v-model="form.date"
                    type="date"
                    placeholder="Chọn ngày"
                    format="DD/MM/YYYY"
                    value-format="YYYY/MM/DD"
                    class="w-full"
                  />
                </el-form-item>
              </div>
            </div>

            <div class="field-row">
              <div class="field-item">
                <el-form-item label="Tên khách hàng" prop="customerName">
                  <el-select
                    v-model="form.customerName"
                    placeholder="Chọn hoặc nhập tên khách hàng"
                    filterable
                    remote
                    allow-create
                    default-first-option
                    :remote-method="handleCustomerSearch"
                    :loading="isLoadingCustomers"
                    clearable
                    class="w-full"
                    @change="onCustomerSelect"
                  >
                    <el-option
                      v-for="customer in customersList"
                      :key="customer.value"
                      :label="customer.label"
                      :value="customer.value"
                    />
                  </el-select>
                </el-form-item>
              </div>
            </div>
          </div>

          <!-- Product Info Section -->
          <div class="info-section">
            <h3 class="section-title">Thông tin sản phẩm</h3>
            
            <div class="field-row">
              <div class="field-item">
                <el-form-item label="Mã sản phẩm" prop="productCode">
                  <div class="product-code-section">
                    <el-select
                      v-model="form.productCode"
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
                </el-form-item>
              </div>
            </div>

            <div class="field-row">
              <div class="field-item">
                <el-form-item label="Tên sản phẩm" prop="productName">
                  <el-input v-model="form.productName" placeholder="Nhập tên sản phẩm" />
                </el-form-item>
              </div>
            </div>

            <div class="field-row two-cols">
              <div class="field-item">
                <el-form-item label="Màu sắc" prop="color">
                  <el-input v-model="form.color" placeholder="Màu sắc" />
                </el-form-item>
              </div>
              
              <div class="field-item">
                <el-form-item label="Kích thước" prop="size">
                  <el-input v-model="form.size" placeholder="Size" />
                </el-form-item>
              </div>
            </div>

            <div class="field-row two-cols">
              <div class="field-item">
                <el-form-item label="Số lượng" prop="quantity">
                  <el-input-number
                    v-model.number="form.quantity"
                    :min="1"
                    class="w-full"
                  />
                </el-form-item>
              </div>
              
              <div class="field-item">
                <el-form-item label="Đơn giá" prop="total">
                  <el-input v-model="form.total" placeholder="Đơn giá">
                    <template #suffix>VNĐ</template>
                  </el-input>
                </el-form-item>
              </div>
            </div>

            <div class="field-row">
              <div class="field-item">
                <el-form-item label="Trạng thái" prop="status">
                  <el-select v-model="form.status" placeholder="Chọn trạng thái" class="w-full">
                    <el-option label="NHẬN ĐƠN" value="NHẬN ĐƠN" />
                    <el-option label="ĐANG GIAO" value="ĐANG GIAO" />
                    <el-option label="ĐANG CHỜ GIAO" value="ĐANG CHỜ GIAO" />
                    <el-option label="HOÀN THÀNH" value="HOÀN THÀNH" />
                    <el-option label="HUỶ" value="Hủy" />
                  </el-select>
                </el-form-item>
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
                <el-form-item label="Link Facebook" prop="linkFb">
                  <el-input v-model="form.linkFb" placeholder="Nhập link Facebook" />
                </el-form-item>
              </div>
            </div>

            <div class="field-row">
              <div class="field-item">
                <el-form-item label="SĐT + Địa chỉ" prop="contactInfo">
                  <el-input
                    v-model="form.contactInfo"
                    type="textarea"
                    :rows="2"
                    placeholder="Nhập số điện thoại và địa chỉ"
                  />
                </el-form-item>
              </div>
            </div>

            <div class="field-row">
              <div class="field-item">
                <el-form-item label="Ghi chú" prop="note">
                  <el-input
                    v-model="form.note"
                    type="textarea"
                    :rows="2"
                    placeholder="Nhập ghi chú (nếu có)"
                  />
                </el-form-item>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="footer-actions">
        <el-button @click="handleCancel" size="large">
          Hủy bỏ
        </el-button>
        <el-button 
          type="primary" 
          @click="handleSubmit" 
          size="large"
          :loading="submitting"
        >
          {{ submitting ? 'Đang lưu...' : 'Thêm đơn hàng' }}
        </el-button>
      </div>
    </el-form>

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
import { ref, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Order } from '@/types/order'
import { ElMessage } from 'element-plus'
import { useOrdersStore } from '@/stores/orders'
import { uploadImage } from '@/api/images'
import { productsAPI } from '@/api/products'
import { clearCustomersCache, getAllCustomers, type Customer } from '@/api/customers'
import type { Product } from '@/types/sheet'
import { 
  EditPen, 
  Picture,
  Loading,
  Search,
  Box
} from '@element-plus/icons-vue'

const emit = defineEmits<{
  (e: 'submit', order: Omit<Order, 'rowIndex'>): void
  (e: 'cancel'): void
  (e: 'order-added'): void
}>()

const props = defineProps<{
  selectedDate: { month: number; year: number }
  customerType: 'customer' | 'ctv'
}>()

const orderStore = useOrdersStore()

const formRef = ref<FormInstance>()
const imageInput = ref<HTMLInputElement>()
const submitting = ref(false)

// Get current date in YYYY/MM/DD format
const getCurrentDate = () => {
  const today = new Date()
  return today.toISOString().split('T')[0].replace(/-/g, '/')
}

const form = ref({
  date: getCurrentDate(),
  customerName: '',
  productCode: '',
  productName: '',
  productImage: '',
  color: '',
  size: '',
  quantity: '1',
  total: '',
  status: 'NHẬN ĐƠN' as const,
  linkFb: '',
  contactInfo: '',
  note: ''
})

const imagePreview = ref('')
const file = ref<File | undefined>(undefined)

// Customer dropdown state
const customersList = ref<Array<{ value: string; label: string; data: Customer }>>([])
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

const rules: FormRules = {
  date: [{ required: true, message: 'Vui lòng chọn ngày', trigger: 'change' }],
  customerName: [{ required: true, message: 'Vui lòng nhập tên khách hàng', trigger: 'blur' }],
  // productName: [{ required: true, message: 'Vui lòng nhập tên sản phẩm', trigger: 'blur' }],
  // color: [{ required: true, message: 'Vui lòng nhập màu sắc', trigger: 'blur' }],
  // size: [{ required: true, message: 'Vui lòng nhập size', trigger: 'blur' }],
  // quantity: [{ required: true, message: 'Vui lòng nhập số lượng', trigger: 'change' }],
  // total: [{ required: true, message: 'Vui lòng nhập tổng tiền', trigger: 'blur' }],
  // status: [{ required: true, message: 'Vui lòng chọn trạng thái', trigger: 'change' }],
  // contactInfo: [{ required: true, message: 'Vui lòng nhập SĐT/Địa chỉ', trigger: 'blur' }]
}

// Image handling functions
const triggerImageUpload = () => {
  imageInput.value?.click()
}

const onImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    file.value = target.files[0]
    
    // Clear product code when uploading new image (this becomes a new product)
    form.value.productCode = ''
    
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

// Product code search functionality
const onProductCodeSelect = async (selectedProductCode: string) => {
  if (!selectedProductCode) return
  
  const selectedProduct = productsList.value.find(p => p.value === selectedProductCode)
  if (selectedProduct && selectedProduct.data) {
    // Existing product - load its data
    form.value.productName = selectedProduct.data.productName
    if (selectedProduct.data.productImage) {
      imagePreview.value = selectedProduct.data.productImage
      form.value.productImage = selectedProduct.data.productImage
      // Clear file selection since we're using existing image
      file.value = undefined
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

// Function to reload products data - useful when new products are added
const reloadProducts = async () => {
  console.log('Reloading products data...')
  // Clear existing data first
  allProductsData.value = []
  productsList.value = []
  allProducts.value = []
  filteredModalProducts.value = []
  
  // Reload from API
  await loadAllProducts()
  
  console.log('Products reloaded:', allProductsData.value.length, 'items')
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
  form.value.productCode = product.productCode
  form.value.productName = product.productName
  if (product.productImage) {
    imagePreview.value = product.productImage
    form.value.productImage = product.productImage
    file.value = undefined
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

// Customer dropdown functionality

// Load all customers on component mount
const loadAllCustomers = async () => {
  try {
    isLoadingCustomers.value = true
    const result = await getAllCustomers()
    
    if (result.success) {
      customersList.value = result.data.map(customer => ({
        value: customer.customerName,
        label: customer.customerName,
        data: customer
      }))
    }
  } catch (error) {
    console.error('Error loading customers:', error)
  } finally {
    isLoadingCustomers.value = false
  }
}

// Handle customer search/filter
const handleCustomerSearch = async (query: string) => {
  if (!query) {
    await loadAllCustomers()
    return
  }
  
  try {
    isLoadingCustomers.value = true
    const result = await getAllCustomers()
    
    if (result.success) {
      // Filter customers based on search query
      const filteredCustomers = result.data.filter(customer =>
        customer.customerName.toLowerCase().includes(query.toLowerCase())
      )
      
      customersList.value = filteredCustomers.map(customer => ({
        value: customer.customerName,
        label: customer.customerName,
        data: customer
      }))
    }
  } catch (error) {
    console.error('Error searching customers:', error)
  } finally {
    isLoadingCustomers.value = false
  }
}

// Handle customer selection
const onCustomerSelect = (selectedCustomerName: string) => {
  if (!selectedCustomerName) return
  
  const selectedCustomer = customersList.value.find(c => c.value === selectedCustomerName)
  if (selectedCustomer && selectedCustomer.data) {
    // Existing customer - auto-fill contact info and link FB
    form.value.contactInfo = selectedCustomer.data.contactInfo || ''
    form.value.linkFb = selectedCustomer.data.linkFb || ''
    // ElMessage.success('Đã tự động điền thông tin khách hàng')
  } else {
    // New customer - clear contact info to allow manual entry
    form.value.contactInfo = ''
    form.value.linkFb = ''
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    submitting.value = true
    
    let imageUrl = form.value.productImage // Use existing image if available
    if (file.value) {
      try {
        // Check file size (5MB limit)
        if (file.value.size > 5 * 1024 * 1024) {
          ElMessage.error('File size must be less than 5MB')
          return
        }
        
        // Compress image
        const compressedFile = await compressImage(file.value)
        console.log('compressedFile',compressedFile)
        
        // Upload image
        const uploadResponse = await uploadImage(compressedFile)
        if (uploadResponse?.data?.secure_url) {
          imageUrl = uploadResponse.data.secure_url
        } else if (typeof uploadResponse === 'string') {
          imageUrl = uploadResponse
        }

        // Logic add sản phẩm mới:
        // - Nếu có productCode: đây là sản phẩm có sẵn, không add vào sheet sản phẩm
        // - Nếu KHÔNG có productCode: đây là sản phẩm mới, backend sẽ tự động add vào sheet sản phẩm
      } catch (error) {
        console.error('Image upload failed:', error)
        ElMessage.error('Failed to upload image')
        return
      }
    }
    
    const orderData = {
      ...form.value,
      productImage: imageUrl || form.value.productImage,
      // Chỉ gửi productCode nếu người dùng đã nhập (để backend biết đây là sản phẩm có sẵn)
      productCode: form.value.productCode ? form.value.productCode.trim() : undefined
    }
    
    await orderStore.addOrder(orderData, props.customerType)
    
    // Clear customers cache since a new customer might have been added
    clearCustomersCache()
    
    // Reload products since a new product might have been added
    await reloadProducts()
    
    ElMessage.success('Thêm đơn hàng thành công!')
    emit('order-added')
    resetForm()
  } catch (error) {
    console.error('Error adding order:', error)
    ElMessage.error('Có lỗi xảy ra khi thêm đơn hàng')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  formRef.value?.resetFields()
  imagePreview.value = ''
  file.value = undefined
  form.value = {
    date: getCurrentDate(),
    customerName: '',
    productCode: '',
    productName: '',
    productImage: '',
    color: '',
    size: '',
    quantity: '1',
    total: '',
    status: 'NHẬN ĐƠN' as const,
    linkFb: '',
    contactInfo: '',
    note: ''
  }
}

const handleCancel = () => {
  resetForm()
  emit('cancel')
}

const populateForm = (orderData: Partial<Order>) => {
  form.value = {
    date: getCurrentDate(), // Always use current date for new orders
    customerName: orderData.customerName || '',
    productCode: orderData.productCode || '', 
    productName: orderData.productName || '',
    productImage: orderData.productImage || '',
    color: orderData.color || '',
    size: orderData.size || '',
    quantity: String(orderData.quantity || 1),
    total: String(orderData.total || ''),
    status: 'NHẬN ĐƠN' as const,
    linkFb: orderData.linkFb || '',
    contactInfo: orderData.contactInfo || '',
    note: orderData.note || ''
  }
  
  // Set image preview if exists
  if (orderData.productImage) {
    imagePreview.value = orderData.productImage
  }
}

// Function to refresh all data when form is opened
const refreshFormData = async () => {
  console.log('Refreshing form data...')
  // Reload both customers and products
  await Promise.all([
    loadAllCustomers(),
    reloadProducts()
  ])
}

// Expose functions for parent component
defineExpose({
  populateForm,
  resetForm,
  refreshFormData
})

// Load customers and products on component mount
onMounted(() => {
  loadAllCustomers()
  loadAllProducts()
})
</script>

<style scoped>
.add-order-form {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

/* Header Section */
.form-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
  text-align: center;
}

.product-image-section {
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-upload {
  position: relative;
}

.image-preview {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.product-image {
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
  background: rgba(0,0,0,0.5);
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
  width: 120px;
  height: 120px;
  border: 2px dashed rgba(255,255,255,0.3);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-placeholder:hover {
  border-color: rgba(255,255,255,0.6);
  background: rgba(255,255,255,0.1);
}

.hidden {
  display: none;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Info Sections */
.info-section {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
}

/* Field Styling */
.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.field-row:last-child {
  margin-bottom: 0;
}

.field-item {
  display: flex;
  flex-direction: column;
}

.field-row .field-item:only-child {
  grid-column: 1 / -1;
}

/* Form Styling */
:deep(.el-form-item__label) {
  font-weight: 600 !important;
  color: #374151 !important;
  font-size: 14px !important;
  margin-bottom: 6px !important;
}

:deep(.el-input__wrapper) {
  border-radius: 8px !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
  border: 1px solid #d1d5db !important;
}

:deep(.el-input__wrapper:hover) {
  border-color: #6366f1 !important;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #6366f1 !important;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1) !important;
}

:deep(.el-textarea__inner) {
  border-radius: 8px !important;
  border: 1px solid #d1d5db !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
}

:deep(.el-select .el-input__wrapper) {
  border-radius: 8px !important;
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

/* Responsive Design */
@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
    max-width: 100%;
  }
  
  .field-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .footer-actions {
    padding: 16px;
    flex-direction: column-reverse;
    margin: 0 auto;
    box-sizing: border-box;
    max-width: calc(100% - 32px);
  }
  
  .footer-actions .el-button {
    width: 100%;
    margin: 0 !important;
    box-sizing: border-box;
  }
  
  .form-header {
    padding: 16px;
  }
  
  .image-preview,
  .upload-placeholder {
    width: 80px;
    height: 80px;
  }
  
  .info-section {
    padding: 12px;
    margin: 0;
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

/* Footer Actions */
.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px 32px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

@media (max-width: 480px) {
  .content-grid {
    padding: 12px;
  }
  
  .info-section {
    padding: 12px;
  }
  
  .section-title {
    font-size: 14px;
  }
  
  .field-row {
    gap: 8px;
  }
  
  .footer-actions {
    padding: 12px;
    margin: 0 auto;
    max-width: calc(100% - 24px);
  }
  
  .footer-actions .el-button {
    margin: 0 !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
}
</style> 