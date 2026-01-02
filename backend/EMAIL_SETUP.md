# Hướng dẫn cấu hình Gmail App Password

## Bước 1: Bật 2-Step Verification

1. Truy cập: https://myaccount.google.com/security
2. Tìm phần **"2-Step Verification"**
3. Nhấp vào và làm theo hướng dẫn để bật 2-Step Verification
   - Bạn sẽ cần xác thực bằng số điện thoại
   - Google sẽ gửi mã xác thực qua SMS

## Bước 2: Tạo App Password

1. Sau khi bật 2-Step Verification, quay lại trang Security
2. Tìm phần **"App passwords"** (Mật khẩu ứng dụng)
   - Nếu không thấy, tìm kiếm "App passwords" trong thanh tìm kiếm
3. Nhấp vào **"App passwords"**
4. Chọn:
   - **App**: Chọn "Mail"
   - **Device**: Chọn "Other (Custom name)"
   - Nhập tên: **"E-commerce Platform"**
5. Nhấp **"Generate"** (Tạo)
6. Google sẽ hiển thị mật khẩu 16 ký tự (có khoảng trắng giữa các nhóm)
   - Ví dụ: `abcd efgh ijkl mnop`
   - **Copy toàn bộ 16 ký tự này** (bao gồm cả khoảng trắng hoặc bỏ khoảng trắng đều được)

## Bước 3: Cấu hình file .env

1. Mở file `.env` trong thư mục `backend`
2. Cập nhật 2 dòng sau:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=abcdefghijklmnop
```

**Ví dụ:**
```env
EMAIL_USER=myemail@gmail.com
EMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

**Lưu ý:**
- `EMAIL_USER`: Email Gmail của bạn (đầy đủ)
- `EMAIL_APP_PASSWORD`: Mật khẩu 16 ký tự vừa tạo (có thể có hoặc không có khoảng trắng)

## Bước 4: Kiểm tra

1. Lưu file `.env`
2. Khởi động lại server:
   ```bash
   npm run dev
   ```
3. Test bằng cách gọi API `/api/user/request-otp`
4. Kiểm tra email inbox để xem có nhận được OTP không

## Troubleshooting

### Lỗi: "Invalid login"
- Kiểm tra lại `EMAIL_USER` và `EMAIL_APP_PASSWORD`
- Đảm bảo đã bật 2-Step Verification
- Đảm bảo đã copy đúng 16 ký tự App Password

### Lỗi: "Less secure app access"
- Gmail không còn hỗ trợ "Less secure app access"
- **Bắt buộc phải dùng App Password** (không dùng mật khẩu Gmail thông thường)

### Không nhận được email
- Kiểm tra thư mục Spam/Junk
- Kiểm tra lại cấu hình trong `.env`
- Xem log server để biết lỗi chi tiết

## Lưu ý bảo mật

- **KHÔNG** commit file `.env` lên Git (đã có trong `.gitignore`)
- **KHÔNG** chia sẻ App Password với ai
- Nếu App Password bị lộ, hãy xóa và tạo mới ngay
