# 📋 Tài Liệu Luồng Hoạt Động Hệ Thống E-Commerce

## Mục Lục
1. [Authentication Flows](#1-authentication-flows)
2. [Cart Management Flows](#2-cart-management-flows)
3. [Order Management Flows](#3-order-management-flows)
4. [Payment Flows](#4-payment-flows)
5. [Product Management Flows](#5-product-management-flows)
6. [Promo Code Flows](#6-promo-code-flows)
7. [Admin Flows](#7-admin-flows)

---

## 1. Authentication Flows

### 1.1. User Registration Flow

#### Mô tả:
User đăng ký tài khoản mới với xác thực OTP qua email.

#### Luồng hoạt động:

**Step 1: Submit Registration Form**
- **Frontend**: `frontend/src/components/Modal/AuthModal.tsx`
  - User điền form: firstName, lastName, email, password, confirmPassword, gender, phone, address
  - Validation với Zod schema
  - Gọi API: `POST /api/user/register`

- **Backend**: `backend/controllers/userController.ts` → `registerUser()`
  - Validate input (email format, password strength, password match)
  - Check email đã tồn tại chưa
  - Generate OTP (6 digits)
  - Save OTP vào database với userData (password đã hash)
  - Send OTP email
  - Return: `{ success: true, email, expiresIn: 300 }`

**Step 2: Verify OTP**
- **Frontend**: `frontend/src/components/Modal/AuthModal.tsx`
  - User nhập OTP
  - Gọi API: `POST /api/user/verify-otp`

- **Backend**: `backend/controllers/userController.ts` → `verifyOTPAndRegister()`
  - Verify OTP với `backend/services/otpService.ts` → `verifyOTP()`
    - Check OTP exists
    - Check OTP expired
    - Check attempts (max 3)
    - Verify OTP code
    - Return userData nếu valid
  - Hash password với bcrypt
  - Create user trong database
  - Generate JWT tokens (access + refresh)
  - Save refreshToken vào user document
  - Delete OTP document
  - Return: `{ success: true, user, accessToken, refreshToken }`

- **Frontend**: Lưu tokens vào localStorage và Zustand store
  - `frontend/src/store/authStore.ts` → `setAuth()`

#### Files liên quan:
- `backend/controllers/userController.ts` (lines 222-420)
- `backend/services/otpService.ts`
- `backend/services/emailService.ts`
- `backend/models/otpModel.ts`
- `frontend/src/components/Modal/AuthModal.tsx`
- `frontend/src/services/authService.ts`
- `frontend/src/store/authStore.ts`

#### Điểm thiếu sót & Cần cải thiện:
- ⚠️ **Rate limiting**: Chưa có rate limiting cho OTP requests → có thể bị spam
- ⚠️ **OTP expiration**: OTP expire sau 5 phút, nhưng không có warning trước khi hết hạn
- ⚠️ **Email delivery**: Không có retry mechanism nếu email fail
- ⚠️ **Password strength**: Validation tốt, nhưng có thể thêm password history check
- ✅ **OTP attempts**: Đã có limit 3 attempts - tốt
- ⚠️ **Account lockout**: Chưa có account lockout sau nhiều failed attempts

---

### 1.2. User Login Flow

#### Mô tả:
User đăng nhập với email và password, nhận JWT tokens.

#### Luồng hoạt động:

**Step 1: Submit Login Form**
- **Frontend**: `frontend/src/components/Modal/AuthModal.tsx`
  - User điền email, password
  - Gọi API: `POST /api/user/login`

- **Backend**: `backend/controllers/userController.ts` → `loginUser()`
  - Validate email format
  - Find user by email
  - Compare password với bcrypt
  - Generate JWT tokens (access: 1h, refresh: 7d)
  - Save refreshToken vào user document
  - Return: `{ success: true, user, accessToken, refreshToken }`

**Step 2: Store Tokens & Update State**
- **Frontend**: `frontend/src/services/authService.ts` → `login()`
  - Lưu tokens vào localStorage
  - Update Zustand store: `frontend/src/store/authStore.ts`
  - Set user info

#### Files liên quan:
- `backend/controllers/userController.ts` (lines 74-148)
- `backend/middleware/authMiddleware.ts` → `verifyToken()`
- `frontend/src/components/Modal/AuthModal.tsx`
- `frontend/src/services/authService.ts`
- `frontend/src/store/authStore.ts`

#### Điểm thiếu sót & Cần cải thiện:
- ⚠️ **Rate limiting**: Chưa có rate limiting cho login attempts → có thể bị brute force
- ⚠️ **Account lockout**: Chưa có lockout sau nhiều failed login attempts
- ⚠️ **Login history**: Chưa track login history (IP, device, time)
- ⚠️ **2FA**: Chưa có two-factor authentication
- ✅ **Token expiration**: Access token 1h, refresh token 7d - hợp lý
- ⚠️ **Session management**: Chưa có session management, chỉ dùng JWT

---

### 1.3. Token Refresh Flow

#### Mô tả:
Tự động refresh access token khi hết hạn.

#### Luồng hoạt động:

**Step 1: API Request với Expired Token**
- **Frontend**: `frontend/src/services/api.ts`
  - API interceptor catch 401 error
  - Check không phải auth endpoint
  - Check chưa retry

**Step 2: Refresh Token**
- **Frontend**: `frontend/src/services/api.ts` (lines 28-78)
  - Gọi API: `POST /api/user/refresh-token` với refreshToken
  - Backend: `backend/controllers/userController.ts` → `refreshAccessToken()`
    - Verify refreshToken
    - Check refreshToken trong database match
    - Generate new accessToken
    - Return: `{ success: true, accessToken }`

**Step 3: Retry Original Request**
- **Frontend**: Update Authorization header với new accessToken
- Retry original request

#### Files liên quan:
- `backend/controllers/userController.ts` (lines 171-220)
- `frontend/src/services/api.ts` (lines 28-78)
- `admin/src/services/api.ts` (lines 25-69)

#### Điểm thiếu sót & Cần cải thiện:
- ⚠️ **Refresh token rotation**: Chưa rotate refresh token → security risk
- ⚠️ **Concurrent requests**: Nếu nhiều requests cùng lúc fail, sẽ có nhiều refresh calls → cần queue
- ⚠️ **Refresh token expiration**: Chưa handle refresh token expired
- ✅ **Token storage**: Lưu trong localStorage - OK cho web app, nhưng có thể dùng httpOnly cookies cho security tốt hơn

---

### 1.4. Forgot Password Flow

#### Mô tả:
User quên mật khẩu, yêu cầu reset qua OTP email.

#### Luồng hoạt động:

**Step 1: Request Reset Password**
- **Frontend**: `frontend/src/pages/ForgotPassword.tsx`
  - User nhập email
  - Gọi API: `POST /api/user/forgot-password`

- **Backend**: `backend/controllers/userController.ts` → `forgotPassword()`
  - Validate email
  - Check user exists
  - Generate reset OTP
  - Save vào `resetPasswords` collection
  - Send OTP email
  - Return: `{ success: true, expiresIn: 300 }`

**Step 2: Verify Reset OTP**
- **Frontend**: User nhập OTP
  - Gọi API: `POST /api/user/verify-reset-otp`

- **Backend**: `backend/controllers/userController.ts` → `verifyResetOTP()`
  - Verify OTP với `backend/services/resetPasswordService.ts`
  - Mark email as verified
  - Return: `{ success: true }`

**Step 3: Reset Password**
- **Frontend**: User nhập new password
  - Gọi API: `POST /api/user/reset-password`

- **Backend**: `backend/controllers/userController.ts` → `resetPassword()`
  - Check email verified
  - Validate password strength
  - Hash new password
  - Update user password
  - Delete reset OTP document
  - Return: `{ success: true }`

#### Files liên quan:
- `backend/controllers/userController.ts` (forgotPassword, verifyResetOTP, resetPassword)
- `backend/services/resetPasswordService.ts`
- `backend/models/resetPasswordModel.ts`
- `frontend/src/pages/ForgotPassword.tsx`

#### Điểm thiếu sót & Cần cải thiện:
- ⚠️ **Rate limiting**: Chưa có rate limiting cho reset password requests
- ⚠️ **Password history**: Chưa check password history (không cho dùng lại password cũ)
- ⚠️ **Email verification**: Cần verify email trước khi reset - đã có nhưng có thể improve
- ✅ **OTP expiration**: 5 phút - hợp lý

---

## 2. Cart Management Flows

### 2.1. Add to Cart Flow

#### Mô tả:
User thêm sản phẩm vào giỏ hàng.

#### Luồng hoạt động:

**Case 1: Authenticated User**
- **Frontend**: `frontend/src/pages/ProductDetail.tsx`, `ProductList.tsx`, `Home.tsx`
  - Check `isAuthenticated`
  - Gọi API: `POST /api/cart/add` với `{ productId, quantity }`

- **Backend**: `backend/controllers/cartController.ts` → `addToCart()`
  - Verify token với `verifyToken` middleware
  - Validate productId
  - Check product exists và active
  - Check stock availability
  - Get or create cart cho user
  - Check product đã có trong cart chưa:
    - Nếu có: Update quantity (check stock)
    - Nếu chưa: Add new item
  - Calculate total
  - Save cart
  - Populate product details
  - Return: `{ success: true, data: cart }`

- **Frontend**: Update cart state
  - `frontend/src/store/cartStore.ts` → `setCart()`
  - Show toast notification

**Case 2: Unauthenticated User**
- **Frontend**: `frontend/src/pages/ProductDetail.tsx`, `ProductList.tsx`, `Home.tsx`
  - Check `!isAuthenticated`
  - Add to local cart: `frontend/src/store/cartStore.ts` → `addItem()`
  - Lưu vào localStorage (Zustand persist)
  - Show toast notification

#### Files liên quan:
- `backend/controllers/cartController.ts` (lines 57-168)
- `backend/models/cartModel.ts`
- `frontend/src/pages/ProductDetail.tsx`
- `frontend/src/pages/ProductList.tsx`
- `frontend/src/pages/Home.tsx`
- `frontend/src/services/cartService.ts`
- `frontend/src/store/cartStore.ts`

#### Điểm thiếu sót & Cần cải thiện:
- ✅ **Stock check**: Đã check stock trước khi add - tốt
- ✅ **Unauthenticated cart**: Đã hỗ trợ local cart - tốt
- ⚠️ **Cart sync**: Khi user login, cần sync local cart với server cart
- ⚠️ **Price snapshot**: Cart lưu price tại thời điểm add, nhưng nếu price thay đổi, user có thể confused
- ⚠️ **Cart expiration**: Chưa có cart expiration (có thể clear cart sau X ngày)
- ⚠️ **Concurrent updates**: Nếu user add cùng product từ nhiều tab, có thể có race condition

---

### 2.2. Update Cart Item Quantity Flow

#### Mô tả:
User thay đổi số lượng sản phẩm trong giỏ hàng.

#### Luồng hoạt động:

**Case 1: Authenticated User**
- **Frontend**: `frontend/src/pages/Cart.tsx`
  - User thay đổi quantity
  - Gọi API: `PUT /api/cart/update` với `{ productId, quantity }`

- **Backend**: `backend/controllers/cartController.ts` → `updateCartItem()`
  - Verify token
  - Validate productId và quantity
  - Check quantity >= 1
  - Find cart
  - Find item in cart
  - Check product stock
  - Update quantity
  - Calculate total
  - Save cart
  - Return: `{ success: true, data: cart }`

**Case 2: Unauthenticated User**
- **Frontend**: `frontend/src/pages/Cart.tsx`
  - Update local cart: `frontend/src/store/cartStore.ts` → `updateItem()`
  - Lưu vào localStorage

#### Files liên quan:
- `backend/controllers/cartController.ts` (lines 170-263)
- `frontend/src/pages/Cart.tsx`
- `frontend/src/store/cartStore.ts`

#### Điểm thiếu sót & Cần cải thiện:
- ✅ **Stock validation**: Đã check stock - tốt
- ⚠️ **Max quantity**: Chưa có max quantity per item (ví dụ: max 10 items)
- ⚠️ **Real-time stock**: Stock có thể thay đổi giữa lúc add và checkout → cần re-check tại checkout

---

### 2.3. Remove from Cart Flow

#### Mô tả:
User xóa sản phẩm khỏi giỏ hàng.

#### Luồng hoạt động:

**Case 1: Authenticated User**
- **Frontend**: `frontend/src/pages/Cart.tsx`
  - User click remove
  - Gọi API: `DELETE /api/cart/remove` với `{ productId }`

- **Backend**: `backend/controllers/cartController.ts` → `removeFromCart()`
  - Verify token
  - Find cart
  - Remove item
  - Calculate total
  - Save cart
  - Return: `{ success: true, data: cart }`

**Case 2: Unauthenticated User**
- **Frontend**: `frontend/src/pages/Cart.tsx`
  - Remove from local cart: `frontend/src/store/cartStore.ts` → `removeItem()`

#### Files liên quan:
- `backend/controllers/cartController.ts` (lines 265-326)
- `frontend/src/pages/Cart.tsx`
- `frontend/src/store/cartStore.ts`

#### Điểm thiếu sót & Cần cải thiện:
- ✅ **Simple removal**: Logic đơn giản và đúng
- ⚠️ **Bulk remove**: Chưa có bulk remove (xóa nhiều items cùng lúc)

---

### 2.4. Load Cart Flow

#### Mô tả:
Load giỏ hàng khi user vào trang Cart hoặc khi login.

#### Luồng hoạt động:

**Case 1: Authenticated User**
- **Frontend**: `frontend/src/pages/Cart.tsx` → `loadCart()`
  - Gọi API: `GET /api/cart`

- **Backend**: `backend/controllers/cartController.ts` → `getCart()`
  - Verify token
  - Find user
  - Get or create cart
  - Populate product details
  - Return: `{ success: true, data: cart }`

- **Frontend**: Update cart state
  - `frontend/src/store/cartStore.ts` → `setCart()`

**Case 2: Unauthenticated User**
- **Frontend**: `frontend/src/pages/Cart.tsx`
  - Load từ localStorage
  - `frontend/src/store/cartStore.ts` → load từ persist storage

#### Files liên quan:
- `backend/controllers/cartController.ts` (lines 7-54)
- `frontend/src/pages/Cart.tsx`
- `frontend/src/store/cartStore.ts`

#### Điểm thiếu sót & Cần cải thiện:
- ⚠️ **Cart sync on login**: Khi user login, cần merge local cart với server cart
- ⚠️ **Product validation**: Khi load cart, nên check products còn active và stock còn đủ không
- ⚠️ **Price update**: Nếu product price thay đổi, nên notify user

---

## 3. Order Management Flows

### 3.1. Create Order Flow

#### Mô tả:
User tạo đơn hàng từ giỏ hàng.

#### Luồng hoạt động:

**Step 1: Submit Checkout Form**
- **Frontend**: `frontend/src/pages/Checkout.tsx`
  - User điền form: fullName, phone, email, address, paymentMethod, promoCode, notes
  - Validate form với Zod
  - Check user authenticated
  - Gọi API: `POST /api/orders` với order data

**Step 2: Validate & Process Order**
- **Backend**: `backend/controllers/orderController.ts` → `createOrder()`
  - Verify token
  - Validate shippingAddress
  - Get user và cart
  - Filter selected items (nếu có `selectedProductIds`)
  - Validate từng item:
    - Product exists
    - Product active
    - Stock sufficient
  - Calculate subtotal
  - Validate & apply promo code (nếu có):
    - `backend/controllers/promoCodeController.ts` → `validatePromoCode()`
    - Calculate discount
    - Check freeship
  - Calculate shipping fee
  - Calculate total
  - Handle customerInfo:
    - Priority: body customerInfo > user profile
    - Update user.phone nếu missing
  - Create order:
    - Auto-generate orderNumber (TS-YYYYMMDD-HHMMSS-XXXX)
    - Save order với customerInfo snapshot
  - Update product stock (decrement)
  - Increment promo code usedCount
  - Remove ordered items from cart (chỉ items đã order, không phải toàn bộ cart)
  - Return: `{ success: true, data: { order } }`

**Step 3: Handle Payment**
- **Frontend**: `frontend/src/pages/Checkout.tsx`
  - Nếu `paymentMethod === 'vnpay'`:
    - Gọi API: `POST /api/payments/vnpay/create` với `{ orderId }`
    - Redirect đến `paymentUrl`
  - Nếu `paymentMethod === 'cod'` hoặc `'momo'`:
    - Navigate to `/checkout/success`

#### Files liên quan:
- `backend/controllers/orderController.ts` (lines 9-242)
- `backend/models/orderModel.ts`
- `frontend/src/pages/Checkout.tsx`
- `frontend/src/services/orderService.ts`

#### Điểm thiếu sót & Cần cải thiện:
- ✅ **Stock validation**: Đã validate stock - tốt
- ✅ **Customer info snapshot**: Đã snapshot customerInfo - tốt
- ✅ **Partial cart checkout**: Đã hỗ trợ selected items - tốt
- ⚠️ **Race condition**: Nếu 2 users cùng checkout sản phẩm cuối cùng, có thể có race condition → cần transaction hoặc optimistic locking
- ⚠️ **Order confirmation email**: Chưa gửi email xác nhận đơn hàng
- ⚠️ **Inventory reservation**: Stock bị trừ ngay khi tạo order, nếu order bị cancel thì phải cộng lại → đã có logic cancel
- ⚠️ **Order timeout**: Chưa có timeout cho pending orders (nếu không thanh toán trong X phút thì cancel)

---

### 3.2. Order Status Update Flow

#### Mô tả:
Admin cập nhật trạng thái đơn hàng.

#### Luồng hoạt động:

**Step 1: Admin Update Status**
- **Admin Panel**: `admin/src/pages/OrderDetail.tsx`
  - Admin chọn status mới
  - Gọi API: `PUT /api/orders/:orderId/status` với `{ orderStatus }`

**Step 2: Validate & Update**
- **Backend**: `backend/controllers/orderController.ts` → `updateOrderStatus()`
  - Verify token và admin role
  - Validate orderStatus (pending, shipped, delivered, cancelled, returned)
  - Find order
  - Prevent changing FROM cancelled/returned
  - Update orderStatus

**Step 3: Handle Status-Specific Logic**
- **Nếu status = 'delivered'**:
  - Nếu paymentMethod = 'cod' và paymentStatus != 'paid':
    - Set paymentStatus = 'paid'
  - Increment product soldCount cho mỗi item
- **Nếu status = 'cancelled'**:
  - Restore product stock (increment)
  - Nếu đã paid, cần refund (chưa có logic)

**Step 4: Save & Return**
- Save order
- Populate order details
- Return: `{ success: true, data: { order } }`

#### Files liên quan:
- `backend/controllers/orderController.ts` (lines 416-513)
- `admin/src/pages/OrderDetail.tsx`
- `admin/src/services/orderService.ts`

#### Điểm thiếu sót & Cần cải thiện:
- ✅ **Sold count**: Đã increment soldCount khi delivered - tốt
- ✅ **Payment status**: Đã auto update paymentStatus cho COD - tốt
- ✅ **Stock restore**: Đã restore stock khi cancel - tốt
- ⚠️ **Refund logic**: Chưa có logic refund khi cancel order đã paid
- ⚠️ **Status workflow**: Chưa enforce status workflow (ví dụ: không thể skip từ pending → delivered)
- ⚠️ **Notification**: Chưa notify user khi order status thay đổi
- ⚠️ **Status history**: Chưa track status change history (ai, khi nào, từ gì → gì)

---

### 3.3. Order Cancellation Flow

#### Mô tả:
User hoặc Admin hủy đơn hàng.

#### Luồng hoạt động:

**Step 1: Request Cancellation**
- **Frontend**: `frontend/src/pages/OrderDetail.tsx`
  - User click "Hủy đơn"
  - Gọi API: `PUT /api/orders/:orderId/cancel`

**Step 2: Validate & Cancel**
- **Backend**: `backend/controllers/orderController.ts` → `cancelOrder()`
  - Verify token
  - Check order exists
  - Check order belongs to user (hoặc admin)
  - Check order status (chỉ có thể cancel pending orders)
  - Update orderStatus = 'cancelled'
  - Restore product stock (increment)
  - Nếu đã paid, cần refund (chưa có logic)
  - Save order
  - Return: `{ success: true, data: { order } }`

#### Files liên quan:
- `backend/controllers/orderController.ts` (cancelOrder function)
- `frontend/src/pages/OrderDetail.tsx`

#### Điểm thiếu sót & Cần cải thiện:
- ✅ **Stock restore**: Đã restore stock - tốt
- ⚠️ **Refund**: Chưa có logic refund
- ⚠️ **Cancellation reason**: Chưa có field để user nhập lý do hủy
- ⚠️ **Cancellation deadline**: Chưa có deadline (ví dụ: chỉ có thể hủy trong 24h sau khi đặt)

---

### 3.4. Get Orders Flow

#### Mô tả:
User xem danh sách đơn hàng của mình.

#### Luồng hoạt động:

**Frontend**: `frontend/src/pages/Orders.tsx`
  - Gọi API: `GET /api/orders?page=1&limit=10&status=pending`

**Backend**: `backend/controllers/orderController.ts` → `getUserOrders()`
  - Verify token
  - Get userId từ token
  - Build filter (status nếu có)
  - Paginate orders
  - Populate product details
  - Return: `{ success: true, data: { orders, pagination } }`

#### Files liên quan:
- `backend/controllers/orderController.ts` (getUserOrders)
- `frontend/src/pages/Orders.tsx`
- `frontend/src/services/orderService.ts`

#### Điểm thiếu sót & Cần cải thiện:
- ✅ **Pagination**: Đã có pagination - tốt
- ✅ **Status filter**: Đã có status filter - tốt
- ⚠️ **Search**: Chưa có search orders (theo orderNumber, product name)
- ⚠️ **Date filter**: Chưa có date range filter

---

## 4. Payment Flows

### 4.1. COD (Cash on Delivery) Flow

#### Mô tả:
Thanh toán khi nhận hàng.

#### Luồng hoạt động:

**Step 1: Create Order với COD**
- User chọn paymentMethod = 'cod' ở checkout
- Order được tạo với paymentStatus = 'pending'

**Step 2: Order Delivery**
- Admin update orderStatus = 'delivered'
- Backend auto update paymentStatus = 'paid' (trong `updateOrderStatus()`)

#### Files liên quan:
- `backend/controllers/orderController.ts` (lines 479-484)
- `frontend/src/pages/Checkout.tsx`

#### Điểm thiếu sót & Cần cải thiện:
- ✅ **Auto payment status**: Đã auto update khi delivered - tốt
- ⚠️ **Payment confirmation**: Chưa có confirmation từ shipper/delivery person
- ⚠️ **Payment receipt**: Chưa có receipt/invoice generation

---

### 4.2. VNPay Payment Flow

#### Mô tả:
Thanh toán qua cổng VNPay.

#### Luồng hoạt động:

**Step 1: Create Order với VNPay**
- User chọn paymentMethod = 'vnpay' ở checkout
- Order được tạo với paymentStatus = 'pending', paymentProvider = null

**Step 2: Create Payment URL**
- **Frontend**: `frontend/src/pages/Checkout.tsx`
  - Sau khi tạo order, gọi API: `POST /api/payments/vnpay/create` với `{ orderId }`

- **Backend**: `backend/controllers/paymentController.ts` → `createVnpayPayment()`
  - Verify token
  - Validate order exists và belongs to user
  - Check order paymentMethod = 'vnpay'
  - Check order chưa paid
  - Build VNPay params:
    - `backend/services/vnpayService.ts` → `buildVnpParams()`
      - Get VNPay config từ .env
      - Build params: vnp_Amount, vnp_Command, vnp_CreateDate, vnp_CurrCode, vnp_IpAddr, vnp_Locale, vnp_OrderInfo, vnp_OrderType, vnp_ReturnUrl, vnp_TmnCode, vnp_TxnRef, vnp_Version
      - Validate amount (>= 10,000 VND)
      - Convert amount to smallest currency unit (* 100)
      - Get client IP (convert IPv6 ::1 to IPv4 127.0.0.1)
  - Sign URL:
    - `backend/services/vnpayService.ts` → `buildSignedVnpUrl()`
      - `signParams()`: Sort params, build signData (không encode values), HMAC SHA512
      - Build final URL với encoded values
  - Return: `{ success: true, data: { paymentUrl } }`

**Step 3: Redirect to VNPay**
- **Frontend**: Redirect user đến `paymentUrl`
- User thanh toán trên VNPay sandbox

**Step 4: VNPay Return**
- VNPay redirect về `VNPAY_RETURN_URL` với query params
- **Frontend**: `frontend/src/pages/VnpayResult.tsx`
  - Parse query params
  - Gọi API: `GET /api/payments/vnpay/confirm?${queryString}`

**Step 5: Confirm Payment**
- **Backend**: `backend/controllers/paymentController.ts` → `confirmVnpayPayment()`
  - Verify signature:
    - `backend/services/vnpayService.ts` → `verifyVnpReturn()`
      - Parse query params
      - Remove vnp_SecureHash
      - Build signData (không encode values)
      - Calculate signature
      - Compare với received signature
  - Find order by orderNumber hoặc _id
  - Check responseCode:
    - Nếu '00': Set paymentStatus = 'paid', paymentProvider = 'vnpay', paymentTransactionId
    - Nếu khác: Set paymentStatus = 'failed'
  - Save order
  - Return: `{ success: true/false, message, data: { orderId, paymentStatus, ... } }`

**Step 6: Display Result**
- **Frontend**: `frontend/src/pages/VnpayResult.tsx`
  - Hiển thị success/failure message
  - Link đến order detail hoặc home

#### Files liên quan:
- `backend/controllers/paymentController.ts`
- `backend/services/vnpayService.ts`
- `backend/routes/paymentRoute.ts`
- `frontend/src/pages/Checkout.tsx`
- `frontend/src/pages/VnpayResult.tsx`

#### Điểm thiếu sót & Cần cải thiện:
- ⚠️ **Signature error**: Đang gặp lỗi "Sai chữ ký" - cần kiểm tra VNPay dashboard config (Return URL whitelist)
- ⚠️ **IPN handler**: Chưa có IPN (Instant Payment Notification) handler - VNPay có thể gọi webhook để confirm payment
- ⚠️ **Payment timeout**: Chưa có timeout cho pending VNPay payments
- ⚠️ **Retry payment**: Chưa có retry mechanism nếu payment fail
- ⚠️ **Payment history**: Chưa track payment attempts history
- ⚠️ **Error handling**: Cần improve error messages cho user

---

### 4.3. MoMo Payment Flow

#### Mô tả:
Thanh toán qua ví MoMo (chưa implement).

#### Luồng hoạt động:
- ⏳ **Chưa implement**
- Chỉ có UI ở checkout, chưa có backend logic

#### Điểm thiếu sót & Cần cải thiện:
- ❌ **Chưa implement**: Cần implement tương tự VNPay
- Cần research MoMo API documentation
- Cần implement MoMo service, controller, routes

---

## 5. Product Management Flows

### 5.1. Get Products Flow

#### Mô tả:
Lấy danh sách sản phẩm với filters và pagination.

#### Luồng hoạt động:

**Frontend**: `frontend/src/pages/ProductList.tsx`
  - Gọi API: `GET /api/products?page=1&limit=12&category=laptop&brand=dell&minPrice=1000000&maxPrice=5000000&search=...&sortBy=price&sortOrder=asc`

**Backend**: `backend/controllers/productController.ts` → `getProducts()`
  - Parse query params
  - Build filter object:
    - category, brand, price range, status
    - Search: name hoặc description (regex)
    - Default: chỉ show active products cho non-admin
  - Build sort object
  - Query với pagination
  - Return: `{ success: true, data: { products, pagination } }`

#### Files liên quan:
- `backend/controllers/productController.ts` (lines 6-100)
- `frontend/src/pages/ProductList.tsx`
- `frontend/src/services/productService.ts`

#### Điểm thiếu sót & Cần cải thiện:
- ✅ **Pagination**: Đã có pagination - tốt
- ✅ **Filters**: Đã có nhiều filters - tốt
- ⚠️ **Search performance**: Search bằng regex có thể chậm với dataset lớn → nên dùng full-text search
- ⚠️ **Caching**: Chưa có caching cho products list
- ⚠️ **Aggregation**: Chưa có aggregation cho categories/brands (count products per category)

---

### 5.2. Get Product Detail Flow

#### Mô tả:
Lấy chi tiết một sản phẩm.

#### Luồng hoạt động:

**Frontend**: `frontend/src/pages/ProductDetail.tsx`
  - Gọi API: `GET /api/products/:slug` (hoặc :id)

**Backend**: `backend/controllers/productController.ts` → `getProductById()`
  - Find product by ID hoặc slug
  - Check product active (nếu không phải admin)
  - Populate related products (nếu có)
  - Return: `{ success: true, data: { product } }`

#### Files liên quan:
- `backend/controllers/productController.ts` (getProductById)
- `frontend/src/pages/ProductDetail.tsx`

#### Điểm thiếu sót & Cần cải thiện:
- ✅ **Slug support**: Đã hỗ trợ slug - tốt
- ⚠️ **Related products**: Chưa có related products recommendation
- ⚠️ **Product views**: Chưa track product views
- ⚠️ **Recently viewed**: Chưa có recently viewed products

---

### 5.3. Admin Create/Update Product Flow

#### Mô tả:
Admin tạo hoặc cập nhật sản phẩm.

#### Luồng hoạt động:

**Create Product**:
- **Admin Panel**: `admin/src/pages/Products.tsx`
  - Admin điền form: name, description, price, images, etc.
  - Upload images to Cloudinary
  - Gọi API: `POST /api/products`

- **Backend**: `backend/controllers/productController.ts` → `createProduct()`
  - Verify admin token
  - Validate input
  - Generate slug từ name
  - Upload images to Cloudinary
  - Create product
  - Return: `{ success: true, data: { product } }`

**Update Product**:
- Tương tự, nhưng gọi `PUT /api/products/:id`

#### Files liên quan:
- `backend/controllers/productController.ts` (createProduct, updateProduct)
- `backend/services/cloudinaryService.ts`
- `admin/src/pages/Products.tsx`

#### Điểm thiếu sót & Cần cải thiện:
- ✅ **Image upload**: Đã có Cloudinary upload - tốt
- ✅ **Slug generation**: Đã auto generate slug - tốt
- ⚠️ **Bulk operations**: Chưa có bulk create/update
- ⚠️ **Product variants**: Chưa hỗ trợ variants (size, color)
- ⚠️ **Image optimization**: Chưa optimize images (resize, compress)
- ⚠️ **Product validation**: Cần strengthen validation (price > 0, stock >= 0, etc.)

---

## 6. Promo Code Flows

### 6.1. Validate Promo Code Flow

#### Mô tả:
User validate mã khuyến mãi ở checkout.

#### Luồng hoạt động:

**Frontend**: `frontend/src/pages/Checkout.tsx`
  - User nhập promo code
  - Gọi API: `POST /api/promo-code/validate` với `{ code, orderTotal }`

**Backend**: `backend/controllers/promoCodeController.ts` → `validatePromoCode()`
  - Find promo code (uppercase, active)
  - Validate với `promoCodeModel.methods.isValid()`:
    - Check isActive
    - Check validFrom <= now <= validTo
    - Check usageLimit (nếu có)
    - Check minOrder
  - Calculate discount với `promoCodeModel.methods.calculateDiscount()`
  - Return: `{ success: true, data: { code, type, discountAmount, isFreeShip, description } }`

#### Files liên quan:
- `backend/controllers/promoCodeController.ts` (lines 174-229)
- `backend/models/promoCodeModel.ts` (methods: isValid, calculateDiscount)
- `frontend/src/pages/Checkout.tsx`

#### Điểm thiếu sót & Cần cải thiện:
- ✅ **Validation logic**: Đã có validation đầy đủ - tốt
- ✅ **Discount calculation**: Đã có calculation cho percentage, fixed, freeship - tốt
- ⚠️ **User-specific codes**: Chưa hỗ trợ promo code chỉ dành cho user cụ thể
- ⚠️ **One-time use per user**: Chưa check user đã dùng code này chưa
- ⚠️ **Product-specific codes**: Chưa hỗ trợ promo code chỉ áp dụng cho sản phẩm/category cụ thể

---

### 6.2. Apply Promo Code Flow

#### Mô tả:
Áp dụng mã khuyến mãi khi tạo order (increment usedCount).

#### Luồng hoạt động:

**Backend**: `backend/controllers/orderController.ts` → `createOrder()`
  - Sau khi validate promo code
  - Gọi API: `POST /api/promo-code/apply` với `{ code }`

**Backend**: `backend/controllers/promoCodeController.ts` → `applyPromoCode()`
  - Find promo code
  - Increment usedCount
  - Save
  - Return: `{ success: true }`

**Note**: Logic này được gọi trong `createOrder()`, nhưng có thể tách riêng.

#### Files liên quan:
- `backend/controllers/promoCodeController.ts` (lines 231-271)
- `backend/controllers/orderController.ts` (lines 187-193)

#### Điểm thiếu sót & Cần cải thiện:
- ⚠️ **Race condition**: Nếu nhiều orders cùng apply code, có thể có race condition → cần atomic increment
- ⚠️ **Usage tracking per user**: Chưa track user nào đã dùng code này

---

## 7. Admin Flows

### 7.1. Admin Authentication Flow

#### Mô tả:
Admin đăng nhập vào admin panel.

#### Luồng hoạt động:

**Step 1: Login**
- **Admin Panel**: `admin/src/pages/Login.tsx`
  - Admin điền email, password
  - Gọi API: `POST /api/user/login` (dùng cùng endpoint với user)

**Step 2: Verify Role**
- **Backend**: `backend/controllers/userController.ts` → `loginUser()`
  - Login như user bình thường
  - Return user với role

**Step 3: Check Admin Role**
- **Admin Panel**: `admin/src/components/ProtectedRoute.tsx`
  - Check user.role === 'admin'
  - Nếu không phải admin, redirect về login

#### Files liên quan:
- `admin/src/pages/Login.tsx`
- `admin/src/components/ProtectedRoute.tsx`
- `backend/controllers/userController.ts`

#### Điểm thiếu sót & Cần cải thiện:
- ✅ **Role check**: Đã có role check - tốt
- ⚠️ **Admin-only endpoints**: Một số endpoints cần verify admin role ở backend (đã có `verifyAdmin` middleware)
- ⚠️ **Admin activity log**: Chưa log admin activities (ai làm gì, khi nào)
- ⚠️ **Admin permissions**: Chưa có granular permissions (ví dụ: admin A chỉ quản lý products, admin B quản lý orders)

---

### 7.2. Admin Dashboard Flow

#### Mô tả:
Admin xem dashboard với statistics.

#### Luồng hoạt động:

**Admin Panel**: `admin/src/pages/Dashboard.tsx`
  - Load statistics:
    - Total orders, revenue, users, products
    - Recent orders
    - Top selling products
  - Gọi các API endpoints để lấy data

#### Files liên quan:
- `admin/src/pages/Dashboard.tsx`
- `backend/controllers/adminController.ts` (nếu có)

#### Điểm thiếu sót & Cần cải thiện:
- ⚠️ **Statistics endpoints**: Có thể cần dedicated endpoints cho statistics (thay vì query nhiều endpoints)
- ⚠️ **Real-time updates**: Chưa có real-time updates (WebSocket)
- ⚠️ **Charts**: Chưa có charts/visualizations
- ⚠️ **Date range**: Chưa có date range filter cho statistics

---

## Tổng Kết Điểm Thiếu Sót & Cần Cải Thiện

### 🔴 Critical (Cần fix ngay):
1. **VNPay Payment**: Đang gặp lỗi "Sai chữ ký" - cần kiểm tra VNPay dashboard config
2. **Race Conditions**: Cần handle race conditions trong cart và order creation
3. **Rate Limiting**: Cần thêm rate limiting cho auth endpoints

### 🟠 Important (Cần làm sớm):
1. **Cart Sync**: Sync local cart với server cart khi login
2. **Order Confirmation Email**: Gửi email xác nhận đơn hàng
3. **Payment IPN**: Implement IPN handler cho VNPay
4. **Refund Logic**: Logic refund khi cancel order đã paid
5. **MoMo Payment**: Implement MoMo payment integration

### 🟡 Nice to Have:
1. **Product Reviews**: Review/rating system
2. **Wishlist**: Wishlist feature
3. **Notifications**: Real-time notifications
4. **Search Enhancement**: Full-text search với MongoDB
5. **Caching**: Redis caching cho products, categories
6. **Error Logging**: Proper error logging (Winston, Sentry)
7. **Testing**: Unit tests, integration tests

---

*Last Updated: 2025-02-03*

