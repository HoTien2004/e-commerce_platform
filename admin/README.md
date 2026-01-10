# Admin Panel - TechStore

Admin panel để quản lý hệ thống e-commerce.

## Cài đặt

1. **Cài đặt dependencies:**
```bash
cd admin
npm install
```

2. **Tạo file `.env`:**
```bash
cp .env.example .env
```

3. **Cấu hình `.env`:**
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Chạy ứng dụng

```bash
npm run dev
```

Admin panel sẽ chạy tại: `http://localhost:4000`

## Tính năng

### ✅ Đã hoàn thành:
- [x] Đăng nhập với admin authentication
- [x] Protected routes (chỉ admin mới vào được)
- [x] Layout với sidebar và header
- [x] Quản lý sản phẩm (CRUD):
  - Danh sách sản phẩm với pagination
  - Tìm kiếm sản phẩm
  - Thêm sản phẩm mới
  - Sửa sản phẩm
  - Xóa sản phẩm
  - Upload hình ảnh

### 🚧 Đang phát triển:
- [ ] Quản lý đơn hàng
- [ ] Quản lý người dùng
- [ ] Dashboard với thống kê
- [ ] Cài đặt hệ thống

## Yêu cầu

- Node.js >= 18
- Backend API chạy tại `http://localhost:3000`
- Tài khoản admin với `role === 'admin'`

## Cấu trúc thư mục

```
admin/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   └── AdminLayout.tsx
│   │   └── ProductModal.tsx
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   └── Products.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   └── productService.ts
│   ├── store/
│   │   └── authStore.ts
│   ├── config/
│   │   └── api.ts
│   ├── App.tsx
│   └── main.tsx
└── package.json
```

