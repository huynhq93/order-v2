# Hướng Dẫn Sử Dụng Quản Lý Hàng Việt (ORDVIET)

## Tổng Quan

Hệ thống quản lý hàng Việt bao gồm 2 trang chính:

1. **Quản Lý Bill HV** (Admin Only) - `/order-viet-admin`
2. **Xử Lý HV** (All Authenticated Users) - `/order-viet`

## 1. Quản Lý Bill HV (Admin)

### Mục đích

- Tạo và quản lý các bill hàng Việt
- Upload hình ảnh bill
- Theo dõi trạng thái bill

### Chức năng

#### Tạo Bill Mới

1. Chọn tháng/năm cần tạo bill
2. Upload hình ảnh bill (hoặc nhập URL)
3. Chọn trạng thái:
   - **ĐANG VẬN CHUYỂN**: Bill đang trong quá trình vận chuyển (có thể dùng để xử lý orders)
   - **HOÀN THÀNH**: Bill đã về đầy đủ
   - **HUỶ**: Bill bị huỷ
4. Nhập số lượng sản phẩm
5. Nhập tổng thanh toán
6. Nhập ghi chú (nếu có)
7. Nhấn "Tạo Bill"

#### Mã Bill

- Format: `ODVddmmyyhhmmss`
- Ví dụ: `ODV0511250930451` (05/11/2025 09:30:45)
- Mã được tạo tự động khi tạo bill

#### Sửa Bill

1. Trong bảng danh sách bills, nhấn nút "Sửa"
2. Thông tin bill sẽ được load vào form
3. Thay đổi thông tin cần thiết
4. Nhấn "Cập Nhật"

### Lưu trữ trên Google Sheets

- Sheet name: `ORDVIET_month_year` (ví dụ: `ORDVIET_11_2025`)
- Cột A: Mã Bill
- Cột B: Hình Ảnh (formula IMAGE)
- Cột C: Trạng Thái
- Cột D: Số Lượng
- Cột E: Tổng Thanh Toán
- Cột F: Ghi Chú

## 2. Xử Lý HV (Staff/Admin)

### Mục đích

- Xem danh sách orders có status "HÀNG VIỆT"
- Gán orders vào bill
- Cập nhật status orders thành "HÀNG VỀ"

### Chức năng

#### Xem Orders "HÀNG VIỆT"

1. Chọn các tháng cần xem (có thể chọn nhiều tháng)
2. Nhấn "Tải Đơn Hàng"
3. Hệ thống sẽ tìm tất cả orders có status "HÀNG VIỆT" từ cả sheet "BÁN HÀNG" và "CTV"

#### Xử Lý Orders

1. Chọn bill từ dropdown (chỉ hiện bills có status "ĐANG VẬN CHUYỂN")
2. Chọn các orders cần xử lý (checkbox)
3. Nhấn "Xử Lý X Đơn Hàng"
4. Xác nhận xử lý

#### Kết quả sau khi xử lý

- Status của orders được cập nhật thành "HÀNG VỀ"
- Mã bill được thêm vào cột "Ghi Chú" của orders
- Status của bill được tự động cập nhật thành "HOÀN THÀNH"

## Quy Trình Làm Việc

### Khi có hàng Việt mới

1. **Admin tạo bill** (trang Quản Lý Bill HV)

   - Upload ảnh bill từ Việt Nam
   - Nhập thông tin: số lượng, tổng tiền
   - Set status "ĐANG VẬN CHUYỂN"

2. **Staff/Admin xử lý orders** (trang Xử Lý HV)

   - Xem các orders có status "HÀNG VIỆT"
   - Chọn bill vừa tạo
   - Chọn các orders thuộc bill đó
   - Nhấn "Xử Lý"

3. **Hệ thống tự động**
   - Cập nhật status orders thành "HÀNG VỀ"
   - Thêm mã bill vào ghi chú của orders
   - Đổi status bill thành "HOÀN THÀNH"

## API Endpoints

### Backend (sheets.js)

```
GET    /api/sheets/ordviet/bills?month=11&year=2025
POST   /api/sheets/ordviet/bills
PUT    /api/sheets/ordviet/bills/:billCode
GET    /api/sheets/ordviet/hang-viet-orders?months=11_2025&months=12_2025
POST   /api/sheets/ordviet/process-orders
```

### Frontend (orderViet.ts)

```typescript
getOrderVietBills(month: number, year: number)
createOrderVietBill(data: CreateOrderVietBillData)
updateOrderVietBill(data: UpdateOrderVietBillData)
getHangVietOrders(months: string[])
processHangVietOrders(orders: OrderProcessData[], billCode: string)
```

## Phân Quyền

### Admin

- Có quyền truy cập tất cả 2 trang
- Có thể tạo/sửa bills
- Có thể xử lý orders

### Staff (nv)

- Chỉ có quyền truy cập trang "Xử Lý HV"
- Không thể tạo/sửa bills
- Có thể xử lý orders

## Lưu Ý

1. **Chỉ bills có status "ĐANG VẬN CHUYỂN"** mới hiện trong dropdown khi xử lý orders
2. **Mã bill được thêm vào cột Note** của orders, format: `{note cũ} | {billCode}`
3. **Bill tự động chuyển sang "HOÀN THÀNH"** sau khi xử lý orders
4. **Orders từ cả 2 sheet** (BÁN HÀNG và CTV) đều được hiển thị
5. **Có thể chọn nhiều tháng** để xem orders cùng lúc
