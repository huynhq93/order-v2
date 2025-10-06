# Order Management System

Hệ thống quản lý đơn hàng được xây dựng với Vue.js 3, TypeScript, Element Plus và Node.js.

## 🚀 Tính năng

- ✅ Quản lý đơn hàng theo tháng/năm
- ✅ Thêm, sửa, xóa đơn hàng  
- ✅ Upload và quản lý ảnh sản phẩm
- ✅ Cập nhật trạng thái đơn hàng
- ✅ Tích hợp Google Sheets API
- ✅ Giao diện responsive với Tailwind CSS

## 🛠️ Công nghệ sử dụng

### Frontend
- **Vue.js 3** - Framework chính
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Element Plus** - UI Component library
- **Tailwind CSS** - CSS framework
- **Pinia** - State management
- **Vue Router** - Routing

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **Google APIs** - Tích hợp Google Sheets
- **Cloudinary** - Quản lý ảnh
- **Multer** - File upload
- **CORS** - Cross-origin requests

## 📦 Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js >= 18.0.0
- pnpm (hoặc npm/yarn)

### 1. Clone repository
```bash
git clone https://github.com/huynhq93/order-v2.git
cd order-v2
```

### 2. Cài đặt dependencies

#### Frontend
```bash
pnpm install
```

#### Backend
```bash
cd backend
npm install
```

### 3. Chạy dự án

#### Backend (Terminal 1)
```bash
cd backend
npm start
```
Server sẽ chạy tại: http://localhost:5176

#### Frontend (Terminal 2)
```bash
pnpm run dev
```
Ứng dụng sẽ chạy tại: http://localhost:5173

## 👨‍💻 Author

- **Huynh Q** - [@huynhq93](https://github.com/huynhq93)
