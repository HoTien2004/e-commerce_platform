# Frontend Setup Guide

## Đã cài đặt

### Dependencies chính:
- ✅ **React 19** + **TypeScript** + **Vite**
- ✅ **Tailwind CSS** - Styling
- ✅ **React Router DOM** - Routing
- ✅ **Axios** - API calls
- ✅ **Zustand** - State management
- ✅ **React Hook Form** + **Zod** - Form handling & validation
- ✅ **React Icons** - Icons
- ✅ **React Hot Toast** - Notifications

## Cấu trúc thư mục

```
frontend/src/
├── components/
│   └── Layout/
│       ├── Header.tsx      # Header với navigation, cart, user menu
│       ├── Footer.tsx       # Footer
│       └── Layout.tsx       # Layout wrapper
├── pages/
│   ├── Home.tsx            # Trang chủ
│   ├── Login.tsx           # Đăng nhập
│   ├── Register.tsx         # Đăng ký (2 bước: form + OTP)
│   └── ForgotPassword.tsx   # Quên mật khẩu (3 bước)
├── services/
│   ├── api.ts              # Axios instance với interceptors
│   ├── authService.ts      # Auth API calls
│   └── userService.ts      # User API calls
├── store/
│   └── authStore.ts        # Zustand store cho auth state
├── config/
│   └── api.ts              # API endpoints config
├── App.tsx                 # Main app với routing
└── main.tsx               # Entry point
```

## Cài đặt

1. **Cài đặt dependencies** (nếu chưa có):
```bash
cd frontend
npm install
```

2. **Tạo file `.env`**:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

3. **Chạy dev server**:
```bash
npm run dev
```

## Tính năng đã hoàn thành

### ✅ Authentication
- [x] Đăng ký (Request OTP → Verify OTP)
- [x] Đăng nhập
- [x] Quên mật khẩu (3 bước: Email → OTP → New Password)
- [x] Auto refresh token khi hết hạn
- [x] Protected routes

### ✅ UI Components
- [x] Header với navigation, cart icon, user menu
- [x] Footer
- [x] Layout wrapper
- [x] Toast notifications

### ✅ Pages
- [x] Trang chủ với hero banner, categories, features
- [x] Trang đăng nhập
- [x] Trang đăng ký (2 bước)
- [x] Trang quên mật khẩu (3 bước)

## API Integration

Tất cả API calls đã được tích hợp:
- ✅ Register & Verify OTP
- ✅ Login & Logout
- ✅ Refresh Token (auto)
- ✅ Forgot Password flow
- ✅ Get/Update Profile
- ✅ Upload/Delete Avatar

## Next Steps

### Cần làm tiếp:
1. **Trang Profile** - Hiển thị và chỉnh sửa thông tin user
2. **Product Pages** - Danh sách sản phẩm, chi tiết sản phẩm
3. **Cart** - Giỏ hàng (khi có API products)
4. **Search & Filter** - Tìm kiếm và lọc sản phẩm
5. **Checkout** - Thanh toán (khi có API orders)

## Lưu ý

- Token được lưu trong `localStorage` và `Zustand store`
- Auto refresh token khi 401 (trong axios interceptor)
- Protected routes sử dụng `ProtectedRoute` component
- Form validation sử dụng Zod schema
- Toast notifications cho tất cả actions

