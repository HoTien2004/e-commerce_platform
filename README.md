## HDQTShop E-commerce Platform

Một nền tảng thương mại điện tử fullstack bao gồm:

- **Frontend (User)**: Website mua sắm cho khách hàng, đặt hàng, thanh toán VNPay, chatbot hỗ trợ, đánh giá sản phẩm…
- **Backend API**: RESTful APIs với Express + MongoDB, tích hợp VNPay, Gemini (chatbot), xác thực JWT + refresh token, Swagger docs.
- **Admin Panel**: Dashboard quản trị (sản phẩm, đơn hàng, người dùng, đánh giá, mã giảm giá, biểu đồ thống kê).

---

## Tính năng chính

- **Khách hàng (Frontend)**
  - **Xem & tìm kiếm sản phẩm** theo danh mục, thương hiệu…
  - **Giỏ hàng**: thêm/xóa/cập nhật số lượng, lưu giỏ local, merge sau khi đăng nhập.
  - **Đặt hàng & thanh toán VNPay**: tạo đơn, redirect VNPay, xử lý callback.
  - **Tài khoản người dùng**:
    - Đăng ký bằng email + OTP xác thực.
    - Đăng nhập email/mật khẩu.
    - **Đăng nhập với Google** (Social Login).
    - Quản lý thông tin cá nhân, đổi mật khẩu.
    - Quản lý nhiều địa chỉ giao hàng, chọn địa chỉ mặc định.
  - **Đơn hàng**: xem lịch sử, chi tiết, huỷ đơn (theo trạng thái).
  - **Đánh giá sản phẩm**: tạo/sửa/xóa đánh giá, like đánh giá.
  - **Chatbot**: hỗ trợ khách hàng, lưu lịch sử hội thoại.

- **Admin Panel**
  - **Đăng nhập admin** (JWT + refresh, giữ phiên khi F5).
  - **Dashboard**:
    - Biểu đồ tròn tỷ lệ trạng thái đơn.
    - Biểu đồ cột số đơn 7 ngày gần nhất.
    - Biểu đồ cột doanh thu theo tháng.
    - Danh sách đơn mới nhất có phân trang.
  - **Quản lý sản phẩm**: CRUD, upload ảnh (Cloudinary), tồn kho, trạng thái.
  - **Quản lý đơn hàng**: xem, lọc, phân trang, cập nhật trạng thái nhiều lần, xoá đơn.
  - **Quản lý người dùng**:
    - Lọc theo vai trò (Tất cả / user / admin).
    - Cập nhật vai trò (user/admin) có confirm modal.
    - Xoá người dùng có confirm modal.
  - **Quản lý đánh giá, mã giảm giá**.
  - **Cài đặt**: giao diện, ngôn ngữ (vi/en).

- **Backend**
  - Express + MongoDB (Mongoose).
  - Xác thực JWT + Refresh token.
  - Tích hợp **VNPay**.
  - Tích hợp **Google OAuth** (verify ID Token).
  - Tích hợp **Gemini** cho chatbot.
  - **Swagger** tài liệu hóa toàn bộ API chính (`/api-docs`).

---

## Kiến trúc thư mục

- **`backend/`**: API server (Express, MongoDB, VNPay, Gemini, Swagger…)
- **`frontend/`**: Website khách hàng (React + Vite + Zustand + Tailwind).
- **`admin/`**: Admin panel (React + Vite + Zustand + Tailwind).

---

## Yêu cầu hệ thống

- **Node.js**: khuyến nghị **>= 20.19.0** (Vite 7 yêu cầu 20.19+ hoặc 22.12+).
- **npm**: kèm theo Node 20+.
- **MongoDB**: bản local hoặc cluster (MongoDB Atlas).
- **VNPay**: tài khoản sandbox / test (nếu muốn test thanh toán).
- **Google Cloud Project** để dùng Google Login (OAuth2 / Google Identity).

---

## Biến môi trường

### Backend (`backend/.env`)

Ví dụ:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/e-commerce_platform

JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_jwt_secret

# VNPay
VNP_TMNCODE=your_vnpay_tmncode
VNP_HASH_SECRET=your_vnpay_hash_secret
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:5173/payment/vnpay/return

# Gemini (chatbot)
GEMINI_API_KEY=your_gemini_api_key

# Google Login
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
```

### Admin (`admin/.env`)

Nếu admin dùng API backend chung, thường chỉ cần:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## Cấu hình VNPay

- Đăng ký tài khoản **VNPay sandbox** và lấy:
  - **TmnCode** → gán vào `VNP_TMNCODE`
  - **HashSecret** → gán vào `VNP_HASH_SECRET`
  - **Payment URL** (sandbox) → `VNP_URL` (ví dụ: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`)
  - **Return URL**: URL FE nhận kết quả thanh toán, ví dụ:
    - `VNP_RETURN_URL=http://localhost:5173/payment/vnpay/return`
- Kiểm tra route VNPay confirm/return trong backend `paymentRoute.ts` + controller để trùng với `VNP_RETURN_URL`.

### Thông tin thẻ test VNPay (sandbox)

Có thể dùng thông tin sau để test thanh toán (do VNPay cung cấp cho môi trường sandbox):

- **Ngân hàng**: `NCB`
- **Số thẻ**: `9704198526191432198`
- **Tên chủ thẻ**: `NGUYEN VAN A`
- **Ngày phát hành**: `07/15`
- **Mật khẩu OTP**: `123456`

---

## Cấu hình Gemini (Chatbot)

1. Vào trang **Google AI Studio / Gemini** để tạo **API Key**.
2. Gán vào:

```env
GEMINI_API_KEY=your_gemini_api_key
```

3. Backend đã dùng key này trong `geminiService.ts` để gọi model (ví dụ `gemini-3-flash-preview`).
4. Nếu không cấu hình, chatbot sẽ báo lỗi “Chatbot chưa được cấu hình…”.

---

## Cách chạy dự án (local)

### 1. Clone source & cài dependency

```bash
git clone https://github.com/your-username/e-commerce_platform.git
cd e-commerce_platform

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Admin
cd ../admin
npm install
```

Đảm bảo đã tạo file `.env` cho `backend`, `frontend`, `admin` như phần trên.

### 2. Chạy Backend

```bash
cd backend
npm run dev
```

Backend sẽ chạy tại:

- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api-docs`

### 3. Chạy Frontend (User)

Trong terminal khác:

```bash
cd frontend
npm run dev
```

Mặc định Vite chạy `http://localhost:5173` (hoặc cổng khác nếu 5173 đang bận – xem log).

### 4. Chạy Admin Panel

Trong terminal khác nữa:

```bash
cd admin
npm run dev
```

Admin thường chạy ở `http://localhost:4000` hoặc cổng kế tiếp (tuỳ lúc bạn start).

---

## Google Login – Lưu ý cấu hình

1. Vào **Google Cloud Console → APIs & Services → Credentials**.
2. Tạo / chọn **OAuth 2.0 Client ID** (Web application).
3. Trong **Authorized JavaScript origins**, thêm:
   - `http://localhost:5173`
   - (nếu Vite chạy cổng khác, thêm domain tương ứng).
4. Lấy **Client ID** và gán vào:
   - `GOOGLE_CLIENT_ID` (backend `.env`)
   - `VITE_GOOGLE_CLIENT_ID` (frontend `.env`)

Sau khi chỉnh `.env`, restart backend + frontend.

---

## Swagger API Docs

- Khi backend chạy, truy cập:
  - **`http://localhost:3000/api-docs`**
- Bao gồm:
  - **User APIs**: đăng ký, verify OTP, login, login Google, quên mật khẩu, profile, địa chỉ…
  - **Order APIs**: tạo đơn, lấy danh sách, update trạng thái, hủy, xóa.
  - **Product APIs**: CRUD, upload ảnh, lọc/sort.
  - **Review, Promo code, Cart, Payment VNPay**.
  - **Admin dashboard**: thống kê đơn, doanh thu, trạng thái…

---

## Demo / Product link

- **Demo (tạm)**: `[Đường dẫn demo sẽ được cập nhật tại đây](https://example.com/)`

Bạn có thể thay bằng link deploy thực tế (Vercel/Netlify/Render/Nginx…).

---

## Hướng dẫn nhanh luồng chính

- **Đăng ký user mới**
  1. Mở frontend user → mở modal đăng ký.
  2. Điền thông tin → nhận OTP qua email.
  3. Nhập OTP để hoàn tất đăng ký và tự động đăng nhập.

- **Đăng nhập**
  - **Email/mật khẩu**: như bình thường.
  - **Google Login**:
    - Bấm nút “Đăng nhập với Google”.
    - Chọn tài khoản Google.
    - Hệ thống sẽ tự:
      - Verify token với Google.
      - Tự tạo user (nếu email chưa tồn tại) hoặc dùng user cũ.
      - Trả JWT + refresh token, lưu vào FE.

- **Mua hàng & thanh toán**
  1. Thêm sản phẩm vào giỏ (kể cả khi chưa login).
  2. Đăng nhập (local hoặc Google) → giỏ sẽ được merge lên server.
  3. Thanh toán → chuyển đến VNPay → quay lại site, xác nhận trạng thái đơn.

- **Quản trị**
  - Truy cập admin → đăng nhập bằng tài khoản admin.
  - Sử dụng menu bên trái để quản lý sản phẩm, đơn hàng, người dùng, đánh giá, mã giảm giá, xem dashboard.