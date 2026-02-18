# 📊 Báo Cáo Tình Trạng Dự Án E-Commerce Platform

## 🎯 Tổng Quan

Dự án là một nền tảng thương mại điện tử hoàn chỉnh với 3 phần chính:
- **Frontend (User)**: React + TypeScript + Tailwind CSS
- **Backend (API)**: Node.js + Express + TypeScript + MongoDB
- **Admin Panel**: React + TypeScript + Tailwind CSS

---

## ✅ Những Gì Đã Hoàn Thành

### 🔐 1. Authentication & Authorization

#### Backend:
- ✅ Đăng ký với OTP email verification
- ✅ Đăng nhập/JWT tokens (access + refresh)
- ✅ Quên mật khẩu với OTP
- ✅ Đổi mật khẩu
- ✅ Role-based access control (user/admin)
- ✅ Protected routes middleware
- ✅ Avatar upload (Cloudinary)

#### Frontend:
- ✅ Login/Register modals
- ✅ OTP verification flow
- ✅ Forgot password flow
- ✅ Profile management
- ✅ Avatar upload/delete
- ✅ Address management (multiple addresses, default address)
- ✅ Protected routes

#### Admin:
- ✅ Admin login
- ✅ Protected admin routes
- ✅ Role verification

---

### 🛍️ 2. Product Management

#### Backend:
- ✅ CRUD operations cho products
- ✅ Product schema với đầy đủ fields:
  - Basic info (name, slug, description, specifications)
  - Pricing (price, originalPrice, discount)
  - Images (multiple images với Cloudinary, primary image)
  - Inventory (stock, soldCount, status)
  - Categories & brands
  - Rating system (average, count)
- ✅ Product search & filtering
- ✅ Featured products, best sellers
- ✅ Categories & brands endpoints
- ✅ Image upload với Cloudinary
- ✅ Stock management (tự động trừ khi đặt hàng)

#### Frontend:
- ✅ Product listing page với filters
- ✅ Product detail page
- ✅ Product search
- ✅ Category/Brand filtering
- ✅ Image gallery
- ✅ Stock display
- ✅ Related products

#### Admin:
- ✅ Product CRUD (Create, Read, Update, Delete)
- ✅ Bulk operations
- ✅ Image upload/management
- ✅ Stock management
- ✅ Product status management

---

### 🛒 3. Shopping Cart

#### Backend:
- ✅ Cart model với items array
- ✅ Add/Update/Remove items
- ✅ Cart calculation
- ✅ Cart sync với user account
- ✅ Cart persistence

#### Frontend:
- ✅ Add to cart từ product pages
- ✅ Cart page với quantity management
- ✅ Cart modal (quick view)
- ✅ **Cart cho unauthenticated users** (local storage)
- ✅ Cart sync khi login
- ✅ Selected items checkout

---

### 📦 4. Order Management

#### Backend:
- ✅ Order creation với validation
- ✅ Order schema đầy đủ:
  - Order items với product snapshot
  - Shipping address
  - Payment info (method, status, provider, transaction ID)
  - Order status workflow
  - Customer info snapshot
  - Promo code support
- ✅ Order status management (pending → shipped → delivered → cancelled/returned)
- ✅ Order cancellation
- ✅ **Stock management**: Tự động trừ stock khi đặt hàng, cộng lại khi hủy
- ✅ **Sold count**: Tự động tăng khi order delivered
- ✅ Order number auto-generation (TS-YYYYMMDD-HHMMSS-XXXX)
- ✅ Order history cho user
- ✅ Order details với product info

#### Frontend:
- ✅ Checkout page với form validation
- ✅ Order creation
- ✅ Order history page
- ✅ Order detail page
- ✅ Order status tracking
- ✅ Payment status display

#### Admin:
- ✅ Order list với filters
- ✅ Order detail view
- ✅ Order status update
- ✅ Payment status display
- ✅ Order cancellation

---

### 💳 5. Payment Integration

#### VNPay Integration:
- ✅ VNPay service với HMAC SHA512 signing
- ✅ Payment URL generation
- ✅ Return URL handling
- ✅ Payment confirmation
- ✅ Payment status update
- ✅ Transaction ID tracking
- ⚠️ **Đang gặp lỗi "Sai chữ ký"** (có thể do cấu hình VNPay dashboard)

#### Payment Methods:
- ✅ COD (Cash on Delivery) - Hoàn chỉnh
- ✅ VNPay - Đã tích hợp, đang debug signature
- ⏳ MoMo - Chưa tích hợp (chỉ có UI)

#### Payment Status:
- ✅ paymentStatus: pending, paid, failed, refunded
- ✅ paymentProvider: momo, vnpay
- ✅ paymentTransactionId tracking
- ✅ Auto update paymentStatus khi COD order delivered

---

### 🎟️ 6. Promo Code System

#### Backend:
- ✅ Promo code model với:
  - Types: percentage, fixed, freeship
  - Validation: minOrder, maxDiscount, usageLimit
  - Date range (validFrom, validTo)
  - Usage tracking (usedCount)
- ✅ Promo code validation
- ✅ Discount calculation
- ✅ Usage limit enforcement

#### Frontend:
- ✅ Promo code input ở checkout
- ✅ Promo code validation
- ✅ Discount display

#### Admin:
- ✅ Promo code CRUD
- ✅ Promo code management
- ✅ Usage statistics

---

### 👥 7. User Management

#### Backend:
- ✅ User model với:
  - Profile info (firstName, lastName, email, phone, gender)
  - Addresses array (multiple addresses)
  - Avatar (Cloudinary)
  - Cart reference
  - Role (user/admin)
- ✅ User profile update
- ✅ Address management (add, update, delete, set default)

#### Frontend:
- ✅ Profile page
- ✅ Profile edit
- ✅ Address management
- ✅ Avatar upload/delete

#### Admin:
- ✅ User list
- ✅ User detail view
- ✅ User management

---

### 📊 8. Admin Dashboard

#### Features:
- ✅ Dashboard với statistics
- ✅ Product management
- ✅ Order management
- ✅ User management
- ✅ Promo code management
- ✅ Admin layout với sidebar

---

### 🎨 9. Frontend UI/UX

#### Pages:
- ✅ Home page với hero slider (auto-sliding), banners
- ✅ Product listing với filters
- ✅ Product detail
- ✅ Cart page
- ✅ Checkout page
- ✅ Order history
- ✅ Order detail
- ✅ Profile page
- ✅ Store page
- ✅ Help, Warranty, Shipping, Privacy, Terms pages
- ✅ News, Promotions, Guides pages
- ✅ FAQ page
- ✅ VNPay result page

#### Features:
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling
- ✅ Toast notifications
- ✅ Modal system
- ✅ Image lazy loading
- ✅ Search functionality

---

## 🗄️ Database Structure

### Collections:

#### 1. **users**
```javascript
{
  firstName: String (required)
  lastName: String (required)
  email: String (required, unique)
  password: String (required, hashed)
  gender: String (enum: male, female, other)
  phone: String
  address: String (legacy, for backward compatibility)
  addresses: [{
    address: String (required)
    isDefault: Boolean (default: false)
  }]
  role: String (enum: user, admin, default: user)
  refreshToken: String
  avatar: String (Cloudinary URL)
  avatarPublicId: String (Cloudinary public ID)
  cartId: ObjectId (ref: cart)
}
```

#### 2. **products**
```javascript
{
  name: String (required, indexed)
  slug: String (unique, indexed)
  description: String
  specifications: [{
    description: String
    quantity: String
    warranty: String
  }]
  price: Number (required, min: 0)
  originalPrice: Number (min: 0)
  discount: Number (default: 0, min: 0, max: 100)
  images: [{
    url: String (required)
    publicId: String
    isPrimary: Boolean (default: false)
  }]
  category: String (indexed)
  brand: String (indexed)
  stock: Number (default: 0, min: 0)
  soldCount: Number (default: 0, min: 0, indexed)
  status: String (enum: active, inactive, out_of_stock, discontinued, default: active, indexed)
  rating: {
    average: Number (default: 0, min: 0, max: 5)
    count: Number (default: 0, min: 0)
  }
  createdAt: Date
  updatedAt: Date
}
```

#### 3. **carts**
```javascript
{
  userId: ObjectId (ref: user, required, unique)
  items: [{
    productId: ObjectId (ref: product, required)
    quantity: Number (required, min: 1)
    price: Number (required)
    addedAt: Date
  }]
  total: Number (default: 0)
  createdAt: Date
  updatedAt: Date
}
```

#### 4. **orders**
```javascript
{
  orderNumber: String (unique, indexed, auto-generated)
  userId: ObjectId (ref: user, required, indexed)
  items: [{
    productId: ObjectId (ref: product, required)
    quantity: Number (required, min: 1)
    price: Number (required, min: 0)
    name: String (required)
  }]
  shippingAddress: String (required)
  shippingFee: Number (required, min: 0, default: 0)
  subtotal: Number (required, min: 0)
  discount: Number (default: 0, min: 0)
  total: Number (required, min: 0)
  paymentMethod: String (enum: cod, vnpay, momo, required, default: cod)
  paymentStatus: String (enum: pending, paid, failed, refunded, default: pending)
  paymentProvider: String (enum: momo, vnpay, default: null)
  paymentTransactionId: String (default: null)
  orderStatus: String (enum: pending, shipped, delivered, cancelled, returned, required, default: pending)
  promoCode: String (default: null)
  notes: String (default: null)
  customerInfo: {
    fullName: String (required)
    phone: String (required)
    email: String (required)
  }
  createdAt: Date
  updatedAt: Date
}
```

#### 5. **promoCodes**
```javascript
{
  code: String (required, unique, uppercase, indexed)
  type: String (enum: percentage, fixed, freeship, required)
  value: Number (required, min: 0)
  minOrder: Number (default: 0, min: 0)
  maxDiscount: Number (default: null, min: 0)
  validFrom: Date (required)
  validTo: Date (required)
  usageLimit: Number (default: null, min: 0)
  usedCount: Number (default: 0, min: 0)
  isActive: Boolean (default: true, indexed)
  description: String (default: "")
  createdAt: Date
  updatedAt: Date
}
```

#### 6. **otps** (TTL collection - auto-delete expired)
```javascript
{
  email: String (required, indexed)
  otp: String (required)
  userData: {
    firstName: String
    lastName: String
    password: String (hashed)
    gender: String
    phone: String
    address: String
  }
  expiresAt: Date (required, TTL index)
  attempts: Number (default: 0)
  createdAt: Date
}
```

#### 7. **resetPasswords** (TTL collection - auto-delete expired)
```javascript
{
  email: String (required, indexed)
  otp: String (required)
  expiresAt: Date (required, TTL index)
  attempts: Number (default: 0)
  isVerified: Boolean (default: false)
  verifiedAt: Date (default: null)
  createdAt: Date
}
```

---

## ⚠️ Lỗi Đang Gặp

### 1. **VNPay Payment - "Sai chữ ký" Error**
- **Mô tả**: Khi redirect đến VNPay sandbox, nhận được lỗi "Sai chữ ký"
- **Nguyên nhân có thể**:
  - Return URL chưa được whitelist trong VNPay dashboard
  - VNPay sandbox có bug
  - Cấu hình VNPay dashboard không đúng
- **Đã kiểm tra**:
  - ✅ Signature calculation đúng (đã test với script)
  - ✅ Hash Secret đúng
  - ✅ IP address đúng (127.0.0.1)
  - ✅ Params format đúng
- **Giải pháp**:
  1. Kiểm tra Return URL trong VNPay dashboard
  2. Thử với Return URL khác
  3. Tạo tài khoản sandbox mới
  4. Liên hệ VNPay support

### 2. **VNPay Sandbox - "timer is not defined" Error**
- **Mô tả**: Lỗi JavaScript trong console khi vào VNPay sandbox page
- **Nguyên nhân**: Lỗi từ phía VNPay sandbox, không phải từ code của dự án
- **Ảnh hưởng**: Không ảnh hưởng đến payment flow
- **Giải pháp**: Có thể bỏ qua, hoặc báo VNPay

---

## 🔧 Cần Cải Thiện

### 1. **Payment Integration**
- ⏳ **MoMo Integration**: Chưa tích hợp, chỉ có UI
- ⚠️ **VNPay**: Đang debug signature error
- ⏳ **Payment Refund**: Chưa có logic xử lý refund
- ⏳ **Payment Webhook/IPN**: Cần implement IPN handler cho VNPay

### 2. **Order Management**
- ⏳ **Order Return/Refund**: Chưa có flow xử lý return/refund
- ⏳ **Order Tracking**: Chưa có tracking number và shipping status chi tiết
- ⏳ **Order Export**: Chưa có export orders to Excel/CSV
- ⏳ **Order Analytics**: Chưa có thống kê chi tiết về orders

### 3. **Product Management**
- ⏳ **Product Reviews**: Chưa có review/rating system từ users
- ⏳ **Product Variants**: Chưa hỗ trợ variants (size, color, etc.)
- ⏳ **Product Bulk Import**: Chưa có import từ CSV/Excel
- ⏳ **Product Analytics**: Chưa có thống kê views, clicks

### 4. **User Features**
- ⏳ **Wishlist**: Chưa có wishlist/favorites
- ⏳ **Order Reviews**: Chưa có review orders sau khi nhận hàng
- ⏳ **Notification System**: Chưa có thông báo real-time
- ⏳ **Social Login**: Chưa có Google/Facebook login

### 5. **Admin Features**
- ⏳ **Dashboard Analytics**: Cần bổ sung thống kê chi tiết
- ⏳ **Inventory Management**: Cần quản lý tồn kho tốt hơn
- ⏳ **Sales Reports**: Chưa có báo cáo doanh thu
- ⏳ **User Analytics**: Chưa có thống kê users
- ⏳ **Settings Page**: Chưa có trang cài đặt (hiện tại chỉ có placeholder)

### 6. **Technical Improvements**
- ⏳ **Error Logging**: Cần implement proper error logging (Winston, Sentry)
- ⏳ **API Rate Limiting**: Chưa có rate limiting
- ⏳ **Caching**: Chưa có Redis caching cho products, categories
- ⏳ **Image Optimization**: Cần optimize images (lazy loading, WebP)
- ⏳ **SEO**: Cần improve SEO (meta tags, sitemap, robots.txt)
- ⏳ **Testing**: Chưa có unit tests, integration tests
- ⏳ **Documentation**: Cần bổ sung API documentation

### 7. **Security**
- ⏳ **Input Validation**: Cần strengthen validation
- ⏳ **SQL Injection Protection**: Đã dùng Mongoose (safe), nhưng cần review
- ⏳ **XSS Protection**: Cần sanitize user inputs
- ⏳ **CSRF Protection**: Chưa có CSRF tokens
- ⏳ **API Security**: Cần review API security best practices

### 8. **Performance**
- ⏳ **Database Indexing**: Cần review và optimize indexes
- ⏳ **Pagination**: Một số endpoints chưa có pagination
- ⏳ **Image CDN**: Đang dùng Cloudinary, nhưng cần optimize
- ⏳ **Bundle Size**: Cần optimize frontend bundle size

---

## 📋 Kế Hoạch Tiếp Theo (Ưu Tiên)

### 🔴 **Priority 1: Critical Issues (Cần fix ngay)**

#### 1.1. Fix VNPay Payment Integration
- **Mục tiêu**: Hoàn thiện VNPay payment flow
- **Tasks**:
  1. Kiểm tra và cấu hình Return URL trong VNPay dashboard
  2. Test lại payment flow end-to-end
  3. Implement IPN handler cho VNPay (nếu cần)
  4. Xử lý edge cases (timeout, cancel, etc.)
- **Thời gian ước tính**: 1-2 ngày
- **Phụ thuộc**: VNPay dashboard configuration

#### 1.2. Implement MoMo Payment
- **Mục tiêu**: Tích hợp MoMo payment gateway
- **Tasks**:
  1. Research MoMo API documentation
  2. Implement MoMo service (tương tự VNPay)
  3. Create MoMo payment endpoints
  4. Update frontend checkout flow
  5. Test payment flow
- **Thời gian ước tính**: 2-3 ngày

---

### 🟠 **Priority 2: Important Features (Sau khi fix payment)**

#### 2.1. Order Return/Refund System
- **Mục tiêu**: Cho phép users return orders và xử lý refund
- **Tasks**:
  1. Thêm return request model
  2. Implement return request API
  3. Admin approve/reject return requests
  4. Auto refund khi return approved
  5. Update stock khi return
  6. Frontend UI cho return request
- **Thời gian ước tính**: 3-4 ngày

#### 2.2. Product Reviews & Ratings
- **Mục tiêu**: Users có thể review và rate products
- **Tasks**:
  1. Tạo review model
  2. Implement review API (create, update, delete)
  3. Auto update product rating khi có review mới
  4. Frontend UI cho reviews
  5. Admin moderation
- **Thời gian ước tính**: 3-4 ngày

#### 2.3. Wishlist Feature
- **Mục tiêu**: Users có thể lưu products vào wishlist
- **Tasks**:
  1. Thêm wishlist field vào user model (hoặc tạo collection riêng)
  2. Implement wishlist API
  3. Frontend UI cho wishlist
  4. Add to wishlist từ product pages
- **Thời gian ước tính**: 1-2 ngày

---

### 🟡 **Priority 3: Enhancements (Nice to have)**

#### 3.1. Admin Dashboard Analytics
- **Mục tiêu**: Bổ sung thống kê chi tiết cho admin
- **Tasks**:
  1. Sales statistics (daily, weekly, monthly)
  2. Top selling products
  3. User growth statistics
  4. Revenue charts
  5. Order status distribution
- **Thời gian ước tính**: 2-3 ngày

#### 3.2. Notification System
- **Mục tiêu**: Thông báo real-time cho users
- **Tasks**:
  1. Tạo notification model
  2. Implement notification API
  3. WebSocket hoặc Server-Sent Events
  4. Frontend notification UI
  5. Email notifications (optional)
- **Thời gian ước tính**: 3-4 ngày

#### 3.3. Order Tracking
- **Mục tiêu**: Tracking number và shipping status chi tiết
- **Tasks**:
  1. Thêm tracking fields vào order model
  2. Integrate với shipping provider API (nếu có)
  3. Update tracking status
  4. Frontend tracking UI
- **Thời gian ước tính**: 2-3 ngày

#### 3.4. Search Enhancement
- **Mục tiêu**: Improve search functionality
- **Tasks**:
  1. Implement full-text search với MongoDB
  2. Search suggestions/autocomplete
  3. Search filters
  4. Search history
- **Thời gian ước tính**: 2-3 ngày

---

### 🟢 **Priority 4: Technical Debt & Optimization**

#### 4.1. Error Logging & Monitoring
- **Mục tiêu**: Proper error logging và monitoring
- **Tasks**:
  1. Integrate Winston hoặc Pino
  2. Setup error tracking (Sentry)
  3. Log rotation
  4. Error alerts
- **Thời gian ước tính**: 2-3 ngày

#### 4.2. API Rate Limiting
- **Mục tiêu**: Protect API từ abuse
- **Tasks**:
  1. Implement rate limiting middleware
  2. Different limits cho different endpoints
  3. Handle rate limit errors
- **Thời gian ước tính**: 1-2 ngày

#### 4.3. Caching Strategy
- **Mục tiêu**: Improve performance với caching
- **Tasks**:
  1. Setup Redis
  2. Cache products, categories, brands
  3. Cache invalidation strategy
  4. Frontend caching (service worker)
- **Thời gian ước tính**: 3-4 ngày

#### 4.4. Testing
- **Mục tiêu**: Add tests để ensure code quality
- **Tasks**:
  1. Setup testing framework (Jest, Vitest)
  2. Unit tests cho services
  3. Integration tests cho API endpoints
  4. Frontend component tests
- **Thời gian ước tính**: 5-7 ngày

#### 4.5. Security Hardening
- **Mục tiêu**: Improve security
- **Tasks**:
  1. Input validation strengthening
  2. XSS protection
  3. CSRF protection
  4. Security headers
  5. API security review
- **Thời gian ước tính**: 3-4 ngày

#### 4.6. Performance Optimization
- **Mục tiêu**: Improve performance
- **Tasks**:
  1. Database query optimization
  2. Add missing indexes
  3. Implement pagination cho tất cả list endpoints
  4. Image optimization
  5. Bundle size optimization
- **Thời gian ước tính**: 3-4 ngày

---

## 📊 Database Assessment

### ✅ **Đã Đủ Collections:**
- ✅ users
- ✅ products
- ✅ carts
- ✅ orders
- ✅ promoCodes
- ✅ otps (TTL)
- ✅ resetPasswords (TTL)

### ⏳ **Có Thể Cần Bổ Sung:**

#### 1. **reviews** (cho product reviews)
```javascript
{
  userId: ObjectId (ref: user)
  productId: ObjectId (ref: product)
  orderId: ObjectId (ref: order) // Optional: chỉ review nếu đã mua
  rating: Number (1-5)
  comment: String
  images: [String] // Review images
  helpful: Number (default: 0)
  createdAt: Date
  updatedAt: Date
}
```

#### 2. **wishlists** (hoặc thêm vào user model)
```javascript
{
  userId: ObjectId (ref: user, unique)
  items: [{
    productId: ObjectId (ref: product)
    addedAt: Date
  }]
  createdAt: Date
  updatedAt: Date
}
```

#### 3. **notifications**
```javascript
{
  userId: ObjectId (ref: user, indexed)
  type: String (enum: order, payment, promotion, system)
  title: String
  message: String
  link: String
  isRead: Boolean (default: false, indexed)
  createdAt: Date
}
```

#### 4. **returnRequests**
```javascript
{
  orderId: ObjectId (ref: order, required)
  userId: ObjectId (ref: user, required)
  items: [{
    productId: ObjectId (ref: product)
    quantity: Number
    reason: String
  }]
  reason: String
  status: String (enum: pending, approved, rejected, completed)
  refundAmount: Number
  adminNotes: String
  createdAt: Date
  updatedAt: Date
}
```

#### 5. **orderTracking** (hoặc thêm vào order model)
```javascript
{
  orderId: ObjectId (ref: order, unique)
  trackingNumber: String
  carrier: String
  status: String (enum: pending, in_transit, out_for_delivery, delivered)
  events: [{
    status: String
    location: String
    timestamp: Date
    description: String
  }]
  estimatedDelivery: Date
  updatedAt: Date
}
```

---

## 🎯 Core Logic Assessment

### ✅ **Core Logic Đã Hoàn Chỉnh:**

1. **Authentication & Authorization**: ✅ Hoàn chỉnh
2. **Product Management**: ✅ Hoàn chỉnh
3. **Cart Management**: ✅ Hoàn chỉnh (bao gồm unauthenticated cart)
4. **Order Management**: ✅ Hoàn chỉnh
5. **Stock Management**: ✅ Hoàn chỉnh (trừ khi đặt, cộng khi hủy)
6. **Sold Count**: ✅ Hoàn chỉnh (tăng khi delivered)
7. **Payment Status**: ✅ Hoàn chỉnh (update khi delivered COD)
8. **Promo Code**: ✅ Hoàn chỉnh
9. **User Management**: ✅ Hoàn chỉnh

### ⚠️ **Core Logic Cần Bổ Sung:**

1. **Payment Integration**: 
   - ✅ COD: Hoàn chỉnh
   - ⚠️ VNPay: Đang debug
   - ⏳ MoMo: Chưa tích hợp

2. **Order Return/Refund**: Chưa có

3. **Product Reviews**: Chưa có

4. **Wishlist**: Chưa có

---

## 📝 Kết Luận

### ✅ **Điểm Mạnh:**
- Core logic đã hoàn chỉnh và ổn định
- Database structure tốt, đủ cho các tính năng hiện tại
- Code structure rõ ràng, dễ maintain
- Frontend UI/UX tốt
- Admin panel đầy đủ tính năng cơ bản

### ⚠️ **Điểm Yếu:**
- Payment integration chưa hoàn chỉnh (VNPay đang lỗi, MoMo chưa có)
- Thiếu một số tính năng quan trọng (reviews, wishlist, return/refund)
- Chưa có testing
- Chưa có proper error logging
- Performance optimization chưa đầy đủ

### 🎯 **Ưu Tiên Hành Động:**
1. **Ngay lập tức**: Fix VNPay payment integration
2. **Tiếp theo**: Implement MoMo payment
3. **Sau đó**: Bổ sung các tính năng quan trọng (reviews, wishlist, return/refund)
4. **Cuối cùng**: Technical improvements (testing, logging, optimization)

---

## 📅 Timeline Ước Tính

- **Week 1-2**: Fix VNPay + Implement MoMo
- **Week 3-4**: Order Return/Refund + Product Reviews
- **Week 5-6**: Wishlist + Notification System
- **Week 7-8**: Admin Analytics + Order Tracking
- **Week 9-10**: Technical Improvements (Testing, Logging, Optimization)

**Tổng thời gian ước tính**: 10-12 tuần để hoàn thiện tất cả features và improvements.

---

*Last Updated: 2025-02-03*

