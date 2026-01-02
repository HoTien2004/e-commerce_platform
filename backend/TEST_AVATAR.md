# Test Upload Avatar từ File

## Cách 1: Swagger UI

1. Mở: `http://localhost:3000/api-docs`
2. Tìm API: `POST /api/user/avatar`
3. Click "Try it out"
4. Click "Authorize" → Nhập Bearer token (nếu chưa đăng nhập)
5. Click "Choose File" → Chọn file ảnh từ máy (jpg, png, webp...)
6. Click "Execute"

## Cách 2: Postman

1. Method: `POST`
2. URL: `http://localhost:3000/api/user/avatar`
3. Headers:
   - `Authorization`: `Bearer YOUR_ACCESS_TOKEN`
4. Body → form-data:
   - Key: `avatar` (type: File)
   - Value: Chọn file ảnh từ máy
5. Click "Send"

## Cách 3: cURL (Terminal)

```bash
curl -X POST http://localhost:3000/api/user/avatar \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "avatar=@/path/to/your/image.jpg"
```

## Cách 4: JavaScript (Frontend)

```javascript
const formData = new FormData();
formData.append('avatar', fileInput.files[0]);

fetch('http://localhost:3000/api/user/avatar', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
})
.then(res => res.json())
.then(data => console.log(data));
```

## Lưu ý:

- Phải có token (đăng nhập trước)
- File ảnh tối đa 5MB
- Chỉ chấp nhận file ảnh (jpg, png, gif, webp...)
- Ảnh sẽ tự động resize về 500x500 và optimize
- Ảnh cũ sẽ tự động xóa khi upload ảnh mới
- Ảnh được lưu trên Cloudinary (không mất khi deploy)

## Test Delete Avatar

**Swagger/Postman:**
- Method: `DELETE`
- URL: `http://localhost:3000/api/user/avatar`
- Headers: `Authorization: Bearer YOUR_ACCESS_TOKEN`

