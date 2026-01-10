# 📋 Danh Sách Task Frontend - TechStore

## ✅ Đã Hoàn Thành

### Pages & Components:
- [x] Home page (UI có, nhưng dùng mock data)
- [x] Login/Register/Forgot Password
- [x] Profile page
- [x] Orders page (UI có, nhưng dùng mock data)
- [x] Store page với map integration
- [x] Help & Policy pages (Help, Warranty, Shipping, Privacy, Terms)
- [x] NotFound page
- [x] Layout với Header và Footer

### Features:
- [x] Authentication flow hoàn chỉnh
- [x] Protected routes
- [x] User profile management
- [x] Avatar upload
- [x] Scroll to top on route change

---

## 🚧 Cần Làm - Ưu Tiên Cao

### 1. **Product Pages** ⭐⭐⭐ (Quan trọng nhất)

#### 1.1. Product List Page (`/products`)
- [ ] Tạo `ProductList.tsx`
- [ ] Hiển thị grid/list sản phẩm từ API
- [ ] Pagination
- [ ] Filter sidebar:
  - [ ] Filter theo category
  - [ ] Filter theo brand
  - [ ] Filter theo price range
  - [ ] Filter theo status (in stock, out of stock)
- [ ] Sort options (price, name, date, rating)
- [ ] Search functionality
- [ ] Loading states
- [ ] Empty states
- [ ] Product card component

#### 1.2. Product Detail Page (`/products/:id`)
- [ ] Tạo `ProductDetail.tsx`
- [ ] Hiển thị chi tiết sản phẩm:
  - [ ] Image gallery với zoom
  - [ ] Tên, giá, discount
  - [ ] Mô tả chi tiết
  - [ ] Thông số kỹ thuật
  - [ ] Stock status
  - [ ] Rating & reviews (nếu có)
- [ ] Add to cart button
- [ ] Quantity selector
- [ ] Related products section
- [ ] Breadcrumb navigation
- [ ] Share functionality

#### 1.3. Category Pages (`/category/:slug`)
- [ ] Tạo `CategoryPage.tsx`
- [ ] Hiển thị sản phẩm theo category
- [ ] Filter và sort
- [ ] Category banner/description

---

### 2. **Cart System** ⭐⭐⭐

#### 2.1. Cart Store
- [ ] Tạo `cartStore.ts` với Zustand
- [ ] State management:
  - [ ] Cart items
  - [ ] Total price
  - [ ] Cart count
- [ ] Actions:
  - [ ] Add to cart
  - [ ] Update quantity
  - [ ] Remove item
  - [ ] Clear cart
  - [ ] Sync với BE API

#### 2.2. Cart Service
- [ ] Tạo `cartService.ts`
- [ ] API integration:
  - [ ] GET `/api/cart` - Lấy giỏ hàng
  - [ ] POST `/api/cart/add` - Thêm vào giỏ
  - [ ] PUT `/api/cart/update` - Cập nhật số lượng
  - [ ] DELETE `/api/cart/remove` - Xóa item
  - [ ] DELETE `/api/cart/clear` - Xóa toàn bộ

#### 2.3. Cart Page (`/cart`)
- [ ] Tạo `Cart.tsx`
- [ ] Hiển thị danh sách items trong giỏ
- [ ] Update quantity
- [ ] Remove item
- [ ] Tính tổng tiền
- [ ] Shipping cost calculation
- [ ] Proceed to checkout button
- [ ] Empty cart state
- [ ] Loading states

#### 2.4. Cart Icon Badge
- [ ] Update Header để hiển thị số lượng items trong cart
- [ ] Real-time update khi add/remove items

---

### 3. **Checkout & Orders** ⭐⭐⭐

#### 3.1. Checkout Page (`/checkout`)
- [ ] Tạo `Checkout.tsx`
- [ ] Form sections:
  - [ ] Shipping address
  - [ ] Payment method
  - [ ] Order summary
- [ ] Validation với react-hook-form + zod
- [ ] Order placement
- [ ] Success page redirect

#### 3.2. Orders Page Integration
- [ ] Replace mock data với API calls
- [ ] Tạo `orderService.ts`
- [ ] API integration:
  - [ ] GET `/api/orders` - Lấy danh sách đơn hàng
  - [ ] GET `/api/orders/:id` - Chi tiết đơn hàng
  - [ ] PUT `/api/orders/:id/cancel` - Hủy đơn hàng
- [ ] Filter theo status
- [ ] Order detail modal/page

---

### 4. **Search Functionality** ⭐⭐

#### 4.1. Search Bar Integration
- [ ] Update Header search bar
- [ ] Search API integration
- [ ] Search suggestions/dropdown
- [ ] Search results page (`/search?q=...`)
- [ ] Debounce search input

#### 4.2. Search Results Page
- [ ] Tạo `SearchResults.tsx`
- [ ] Hiển thị kết quả tìm kiếm
- [ ] Filter và sort
- [ ] "No results" state

---

### 5. **Home Page Integration** ⭐⭐

#### 5.1. Replace Mock Data
- [ ] Integrate với Product API:
  - [ ] Featured products
  - [ ] Best sellers
  - [ ] Promotions
  - [ ] Categories
- [ ] Loading states
- [ ] Error handling

#### 5.2. Product Cards Component
- [ ] Tạo reusable `ProductCard.tsx`
- [ ] Hiển thị:
  - [ ] Image với lazy loading
  - [ ] Name, price, discount
  - [ ] Rating
  - [ ] Quick add to cart
  - [ ] Link to detail page

---

## 🔄 Cải Tiến & Tối Ưu

### 6. **Performance Optimization**
- [ ] Image lazy loading
- [ ] Code splitting với React.lazy
- [ ] Memoization cho expensive components
- [ ] Virtual scrolling cho product lists
- [ ] Optimistic updates cho cart

### 7. **UX Improvements**
- [ ] Loading skeletons thay vì spinner
- [ ] Toast notifications cho actions
- [ ] Confirmation modals cho delete actions
- [ ] Form validation messages
- [ ] Error boundaries
- [ ] 404 handling cho products

### 8. **Responsive Design**
- [ ] Mobile-first approach
- [ ] Tablet optimization
- [ ] Touch-friendly interactions
- [ ] Mobile menu (hiện tại chưa có)

### 9. **Accessibility**
- [ ] ARIA labels
- [ ] Keyboard navigation
- [ ] Focus management
- [ ] Screen reader support

---

## 📦 Components Cần Tạo

### Reusable Components:
- [ ] `ProductCard.tsx` - Card hiển thị sản phẩm
- [ ] `ProductGrid.tsx` - Grid layout cho products
- [ ] `ProductFilter.tsx` - Filter sidebar
- [ ] `Pagination.tsx` - Pagination component
- [ ] `LoadingSpinner.tsx` - Loading indicator
- [ ] `EmptyState.tsx` - Empty state component
- [ ] `ImageGallery.tsx` - Image gallery với zoom
- [ ] `QuantitySelector.tsx` - Quantity input
- [ ] `Breadcrumb.tsx` - Breadcrumb navigation
- [ ] `Modal.tsx` - Reusable modal (có thể dùng lại từ AuthModal)

---

## 🔌 API Integration

### Services Cần Tạo/Cập Nhật:

#### `productService.ts` (Mới)
- [ ] `getProducts(params)` - Lấy danh sách
- [ ] `getProductById(id)` - Chi tiết sản phẩm
- [ ] `getFeaturedProducts()` - Featured products
- [ ] `getBestSellers()` - Best sellers
- [ ] `getCategories()` - Danh sách categories
- [ ] `getBrands()` - Danh sách brands
- [ ] `searchProducts(query)` - Tìm kiếm

#### `cartService.ts` (Mới)
- [ ] `getCart()` - Lấy giỏ hàng
- [ ] `addToCart(productId, quantity)` - Thêm vào giỏ
- [ ] `updateCartItem(itemId, quantity)` - Cập nhật
- [ ] `removeFromCart(itemId)` - Xóa item
- [ ] `clearCart()` - Xóa toàn bộ

#### `orderService.ts` (Mới)
- [ ] `getOrders(params)` - Lấy danh sách đơn hàng
- [ ] `getOrderById(id)` - Chi tiết đơn hàng
- [ ] `createOrder(data)` - Tạo đơn hàng
- [ ] `cancelOrder(id)` - Hủy đơn hàng

---

## 📝 Routes Cần Thêm

```typescript
// Product routes
/products                    // Product list
/products/:id                // Product detail
/category/:slug              // Category page
/search                      // Search results

// Cart & Checkout
/cart                        // Cart page
/checkout                    // Checkout page
/checkout/success            // Order success

// Orders (đã có, cần integrate API)
/orders                      // Orders list
/orders/:id                  // Order detail
```

---

## 🎯 Thứ Tự Ưu Tiên Thực Hiện

### Phase 1: Core E-Commerce (Tuần 1)
1. **Product Service & Store** (Day 1)
   - Tạo productService.ts
   - Tạo productStore.ts (nếu cần)
   - Test API integration

2. **Product List Page** (Day 2-3)
   - ProductCard component
   - ProductList page với pagination
   - Filter sidebar
   - Sort functionality

3. **Product Detail Page** (Day 4)
   - ProductDetail page
   - Image gallery
   - Add to cart functionality

### Phase 2: Cart System (Tuần 2)
4. **Cart Store & Service** (Day 1)
   - cartStore.ts
   - cartService.ts
   - Sync với BE

5. **Cart Page** (Day 2)
   - Cart page UI
   - Update/Remove items
   - Cart icon badge

6. **Checkout Page** (Day 3-4)
   - Checkout form
   - Order creation
   - Success page

### Phase 3: Integration & Polish (Tuần 3)
7. **Home Page Integration** (Day 1)
   - Replace mock data
   - Featured products
   - Best sellers

8. **Search Functionality** (Day 2)
   - Search bar integration
   - Search results page

9. **Orders Integration** (Day 3)
   - Replace mock data
   - Order detail page

10. **Polish & Optimization** (Day 4-5)
    - Loading states
    - Error handling
    - Performance optimization
    - Responsive improvements

---

## 📊 Checklist Trước Khi Hoàn Thành

### Functionality:
- [ ] Tất cả pages đều có loading states
- [ ] Tất cả forms đều có validation
- [ ] Error handling đầy đủ
- [ ] Toast notifications cho user actions
- [ ] Protected routes hoạt động đúng

### UI/UX:
- [ ] Responsive trên mobile/tablet/desktop
- [ ] Consistent design language
- [ ] Accessible (keyboard navigation, ARIA)
- [ ] Smooth transitions và animations

### Performance:
- [ ] Code splitting
- [ ] Image optimization
- [ ] Lazy loading
- [ ] API calls được optimize

### Testing:
- [ ] Test tất cả user flows
- [ ] Test trên các browsers
- [ ] Test responsive breakpoints
- [ ] Test error scenarios

---

## 💡 Notes

- **Backend API đã sẵn sàng:** Product API, Cart API đã có
- **Cần tạo Order API:** Backend chưa có Order API, cần implement trước
- **State Management:** Dùng Zustand cho global state (cart, auth)
- **Styling:** Tiếp tục dùng Tailwind CSS
- **Icons:** Tiếp tục dùng react-icons/fi

---

## 🚀 Bắt Đầu Ngay

Bạn muốn tôi bắt đầu implement phần nào trước? 

**Đề xuất:** Bắt đầu với **Product Service** và **Product List Page** vì đây là core feature của e-commerce.

