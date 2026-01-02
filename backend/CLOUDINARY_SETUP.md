# Cloudinary Setup Guide

## Bước 1: Tạo tài khoản Cloudinary

1. Truy cập: https://cloudinary.com/users/register/free
2. Đăng ký tài khoản miễn phí (Free tier)
3. Xác thực email

## Bước 2: Lấy thông tin API

1. Đăng nhập vào Cloudinary Dashboard: https://console.cloudinary.com/
2. Vào **Settings** → **Security** (hoặc xem ở Dashboard)
3. Copy các thông tin sau:
   - **Cloud Name** (ví dụ: `dxyz123`)
   - **API Key** (ví dụ: `123456789012345`)
   - **API Secret** (ví dụ: `abcdefghijklmnopqrstuvwxyz`)

## Bước 3: Thêm vào .env

**Cách 1: Sử dụng CLOUDINARY_URL (Đơn giản hơn - Khuyến nghị)**

Thêm 1 biến duy nhất vào file `.env`:

```env
CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name
```

Ví dụ:
```env
CLOUDINARY_URL=cloudinary://123456789012345:abcdefghijklmnopqrstuvwxyz@dxf5tsrif
```

**Cách 2: Sử dụng 3 biến riêng**

Hoặc thêm 3 biến riêng:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> **Lưu ý**: Chỉ cần dùng 1 trong 2 cách. Cách 1 đơn giản hơn!

## Bước 4: Cài đặt package

```bash
cd backend
npm install cloudinary
```

## Bước 5: Test

Sau khi setup xong, bạn có thể test API upload avatar:
- `POST /api/user/avatar` - Upload từ file
- `POST /api/user/avatar/url` - Upload từ URL
- `DELETE /api/user/avatar` - Xóa avatar

## Lưu ý

- Free tier: 25GB storage, 25GB bandwidth/tháng
- Ảnh tự động resize về 500x500 và optimize
- Ảnh cũ tự động xóa khi upload ảnh mới
- Hỗ trợ upload từ file hoặc URL

