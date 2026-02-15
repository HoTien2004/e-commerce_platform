import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiStar, FiShoppingCart, FiPlus, FiMinus, FiCopy, FiCheck, FiMessageCircle, FiShield, FiHeadphones, FiDollarSign, FiPackage, FiRefreshCw, FiGrid, FiArrowRight } from 'react-icons/fi';
import { FaFacebook, FaTiktok, FaTwitter, FaPinterest, FaFacebookMessenger } from 'react-icons/fa';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService';
import { useCartStore } from '../store/cartStore';
import { useCartModalStore } from '../store/cartModalStore';
import { useAuthStore } from '../store/authStore';
import type { Product } from '../types/product';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { setCart, setLoading: setCartLoading, addItem } = useCartStore();
  const { addModal } = useCartModalStore();
  const { isAuthenticated } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const thumbnailsRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef<{ startX: number; scrollLeft: number }>({ startX: 0, scrollLeft: 0 });

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  useEffect(() => {
    if (product) {
      fetchRelatedProducts();
    }
  }, [product]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productService.getProductBySlug(slug!);
      setProduct(response.data);
    } catch (error: any) {
      toast.error(error.message || 'Không tìm thấy sản phẩm');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      if (!product?.category) {
        setRelatedProducts([]);
        return;
      }
      const response = await productService.getProducts({
        category: product.category,
        limit: 20,
        status: 'active',
      });
      // Filter out current product
      const filtered = response.data.products.filter((p) => p._id !== product._id);
      setRelatedProducts(filtered.slice(0, 8));
    } catch (error) {
      console.error('Error fetching related products:', error);
      setRelatedProducts([]);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setIsAddingToCart(true);
      setCartLoading(true);

      // If not authenticated, use local cart only
      if (!isAuthenticated) {
        const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
        addItem({
          productId: {
            _id: product._id,
            name: product.name,
            images: product.images || [],
          },
          quantity,
          price: product.price,
        });
        toast.success('Đã thêm vào giỏ hàng');
        addModal(product, quantity);
        return;
      }

      // If authenticated, sync with backend
      const response = await cartService.addToCart({
        productId: product._id,
        quantity,
      });

      // Update cart store with the complete cart from backend
      setCart(response.data);

      // Show modal using store
      addModal(product, quantity);
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Lỗi khi thêm vào giỏ hàng');
    } finally {
      setIsAddingToCart(false);
      setCartLoading(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/cart');
  };

  const handleRelatedProductAddToCart = async (relatedProduct: Product) => {
    try {
      setCartLoading(true);

      // If not authenticated, use local cart only
      if (!isAuthenticated) {
        addItem({
          productId: {
            _id: relatedProduct._id,
            name: relatedProduct.name,
            images: relatedProduct.images || [],
          },
          quantity: 1,
          price: relatedProduct.price,
        });
        toast.success('Đã thêm vào giỏ hàng');
        addModal(relatedProduct, 1);
        return;
      }

      // If authenticated, sync with backend
      const response = await cartService.addToCart({
        productId: relatedProduct._id,
        quantity: 1,
      });

      // Update cart store with the complete cart from backend
      setCart(response.data);

      // Show modal using store
      addModal(relatedProduct, 1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Lỗi khi thêm vào giỏ hàng');
    } finally {
      setCartLoading(false);
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
      setQuantity(newQuantity);
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    toast.success('Đã sao chép link!');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handleShareZalo = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://zalo.me/share?url=${url}`, '_blank');
  };

  // Drag-to-scroll thumbnails (ẩn scrollbar, kéo ngang)
  const handleThumbMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Chỉ kéo khi giữ chuột trái
    if (e.button !== 0 || !thumbnailsRef.current) return;
    setIsDragging(true);
    dragState.current = {
      startX: e.pageX - thumbnailsRef.current.offsetLeft,
      scrollLeft: thumbnailsRef.current.scrollLeft,
    };
  };

  const handleThumbMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !thumbnailsRef.current) return;
    e.preventDefault();
    const x = e.pageX - thumbnailsRef.current.offsetLeft;
    const walk = (x - dragState.current.startX) * 1.2; // tăng nhẹ độ nhạy
    thumbnailsRef.current.scrollLeft = dragState.current.scrollLeft - walk;
  };

  const handleThumbMouseUp = () => setIsDragging(false);
  const handleThumbMouseLeave = () => setIsDragging(false);

  // Click thumbnail: đổi ảnh và auto lướt nhẹ để thumbnail được đưa về phía trái
  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);

    if (!thumbnailsRef.current) return;
    const container = thumbnailsRef.current;

    const thumbWidth = 80; // w-20 = 80px
    const gap = 8; // gap-2 = 8px
    const itemSize = thumbWidth + gap;

    const visibleCount = Math.max(1, Math.floor(container.clientWidth / itemSize));

    // Cho cảm giác "lướt" như mô tả: thumbnail được click sẽ trở thành item thứ 2 (index 1) nếu có thể
    const targetFirstIndex = Math.max(0, Math.min(index - 1, (product?.images?.length || 0) - visibleCount));

    const newScrollLeft = targetFirstIndex * itemSize;
    container.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
  };

  const handleShareTikTok = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(product?.name || '');
    window.open(`https://www.tiktok.com/share?url=${url}&text=${text}`, '_blank');
  };

  const handleShareX = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(product?.name || '');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  const handleSharePinterest = () => {
    const url = encodeURIComponent(window.location.href);
    const media = product?.images?.[0]?.url ? encodeURIComponent(product.images[0].url) : '';
    const description = encodeURIComponent(product?.name || '');
    window.open(`https://pinterest.com/pin/create/button/?url=${url}&media=${media}&description=${description}`, '_blank');
  };

  const handleShareMessenger = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/dialog/send?link=${url}&app_id=YOUR_APP_ID`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded-lg" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-12 bg-gray-200 rounded w-1/3" />
                <div className="h-32 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-lg text-gray-600">Không tìm thấy sản phẩm</p>
            <Link
              to="/products"
              className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Quay lại danh sách sản phẩm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const primaryImage = product.images?.[selectedImageIndex] || product.images?.[0];
  const discountPercent =
    product.discount ||
    (product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center gap-2 text-gray-600">
            <li>
              <Link to="/" className="hover:text-primary-600">
                Trang chủ
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link to="/products" className="hover:text-primary-600">
                Sản phẩm
              </Link>
            </li>
            {product.category && (
              <>
                <li>/</li>
                <li>
                  <Link
                    to={`/products?category=${encodeURIComponent(product.category)}`}
                    className="hover:text-primary-600"
                  >
                    {product.category}
                  </Link>
                </li>
              </>
            )}
            <li>/</li>
            <li className="text-gray-900 font-medium">{product.name}</li>
          </ol>
        </nav>

        {/* Product Info - 3 cột: Hình ảnh | Thông tin | Chính sách */}
        <div className="bg-gradient-to-br from-primary-50 via-white to-primary-50 rounded-lg shadow-sm border border-primary-200 p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Images (4 cột) */}
            <div className="lg:col-span-4">
              {/* Main Image */}
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                {primaryImage ? (
                  <img
                    src={primaryImage.url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div
                  ref={thumbnailsRef}
                  onMouseDown={handleThumbMouseDown}
                  onMouseMove={handleThumbMouseMove}
                  onMouseUp={handleThumbMouseUp}
                  onMouseLeave={handleThumbMouseLeave}
                  className={`flex gap-2 overflow-x-auto no-scrollbar select-none w-full max-w-[344px] mx-auto ${isDragging ? 'cursor-grabbing' : 'cursor-grab'
                    }`}
                >
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => handleThumbnailClick(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImageIndex === index ? 'border-primary-600' : 'border-gray-200'
                        }`}
                    >
                      <img
                        src={img.url}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Middle: Product Info (6 cột) */}
            <div className="lg:col-span-6">
              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4 line-clamp-2">{product.name}</h1>

              {/* Status & Brand & Sold Count */}
              <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Tình trạng:</span>
                  {product.stock > 0 ? (
                    <span className="text-green-600 font-medium">Còn hàng</span>
                  ) : (
                    <span className="text-red-600 font-medium">Hết hàng</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Thương hiệu:</span>
                  <Link
                    to={`/products?brand=${encodeURIComponent(product.brand || 'Custom')}`}
                    className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
                  >
                    {product.brand && product.brand.trim() !== '' ? product.brand : 'Custom'}
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Đã bán:</span>
                  <span className="text-gray-900 font-medium">{(product.soldCount ?? 0).toLocaleString('vi-VN')}</span>
                </div>
              </div>

              {/* Rating */}
              {product.rating && product.rating.count > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(product.rating.average)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating.average.toFixed(1)} ({product.rating.count} đánh giá)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="mb-6">
                <div className="flex flex-col gap-2 mb-2">
                  <span className="text-4xl font-bold text-primary-600">
                    {product.price.toLocaleString('vi-VN')}₫
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="flex items-center gap-2">
                      <span className="text-xl text-gray-500 line-through">
                        {product.originalPrice.toLocaleString('vi-VN')}₫
                      </span>
                      {discountPercent > 0 && (
                        <span className="bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
                          -{discountPercent}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              {product.stock > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số lượng
                  </label>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiMinus className="w-4 h-4" />
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={quantity}
                        onChange={(e) => {
                          const numeric = parseInt(e.target.value.replace(/\D/g, ''), 10);
                          if (!numeric) {
                            setQuantity(1);
                            return;
                          }
                          const clamped = Math.min(Math.max(numeric, 1), product.stock);
                          setQuantity(clamped);
                        }}
                        className="w-16 text-center border-0 focus:outline-none focus:ring-0 appearance-none"
                      />
                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.stock}
                        className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiPlus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={isAddingToCart}
                      className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiShoppingCart className="w-5 h-5" />
                      <span>{isAddingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}</span>
                    </button>
                    <button
                      onClick={handleBuyNow}
                      disabled={isAddingToCart}
                      className="flex-1 flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Mua ngay</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Share */}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Chia sẻ:</p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleShareFacebook}
                    className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="Chia sẻ lên Facebook"
                  >
                    <FaFacebook className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleShareMessenger}
                    className="p-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    title="Chia sẻ qua Messenger"
                  >
                    <FaFacebookMessenger className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleShareZalo}
                    className="p-2.5 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
                    title="Chia sẻ lên Zalo"
                  >
                    <FiMessageCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleShareX}
                    className="p-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    title="Chia sẻ lên X (Twitter)"
                  >
                    <FaTwitter className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleShareTikTok}
                    className="p-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    title="Chia sẻ lên TikTok"
                  >
                    <FaTiktok className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSharePinterest}
                    className="p-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    title="Chia sẻ lên Pinterest"
                  >
                    <FaPinterest className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className={`p-2.5 rounded-lg transition-colors ${linkCopied
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    title="Sao chép link"
                  >
                    {linkCopied ? (
                      <FiCheck className="w-5 h-5" />
                    ) : (
                      <FiCopy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Policy Info (2 cột - vừa phải) */}
            <div className="lg:col-span-2">
              {/* Khối chính sách riêng với border */}
              <div className="bg-gray-50 rounded-lg border border-gray-300 p-4">
                {/* Chính sách bán hàng */}
                <div className="mb-5">
                  <h3 className="text-base font-bold text-gray-900 mb-3">Chính sách bán hàng</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <FiShield className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-900">Cam kết 100% chính hãng</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <FiHeadphones className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-900">Hỗ trợ 24/7 (Thứ 2 - Chủ nhật)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thông tin thêm */}
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-3">Thông tin thêm</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <FiDollarSign className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-900">Hoàn tiền 111% nếu hàng giả</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <FiPackage className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-900">Mở hộp kiểm tra nhận hàng</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <FiRefreshCw className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-900">Đổi trả trong 7 ngày</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description + Specifications - chung 1 khối */}
        {(product.description || (product.specifications && product.specifications.length > 0)) && (
          <div className="bg-gradient-to-br from-primary-50 via-white to-primary-50 rounded-lg shadow-sm border border-primary-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Mô tả chi tiết</h2>

            {product.description && (
              <div className="prose max-w-none mb-4">
                <p className="text-base text-gray-700 whitespace-pre-line">{product.description}</p>
              </div>
            )}

            {product.specifications && product.specifications.length > 0 && (
              <div className="overflow-x-auto mt-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Thông số kỹ thuật</h3>
                <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-primary-600 uppercase tracking-wider w-16 border-r border-gray-200">
                        STT
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-primary-600 uppercase tracking-wider border-r border-gray-200">
                        Mô tả sản phẩm
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-primary-600 uppercase tracking-wider w-32 border-r border-gray-200">
                        Số lượng
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-primary-600 uppercase tracking-wider w-32">
                        Bảo hành
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {product.specifications.map((spec, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 whitespace-nowrap text-base font-semibold text-gray-900 text-center border-r border-gray-200">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-base text-gray-800 text-center border-r border-gray-200">
                          {spec.description}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-base text-gray-800 text-center border-r border-gray-200">
                          {spec.quantity}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-base text-gray-800 text-center">
                          {spec.warranty}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Related Products - Khối riêng */}
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 rounded-lg shadow-sm border border-purple-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FiGrid className="w-6 h-6 text-purple-600" />
              <span>Sản phẩm liên quan</span>
            </h2>
            {product.category && (
              <Link
                to={`/products?category=${encodeURIComponent(product.category)}`}
                className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
              >
                <span>Xem tất cả</span>
                <FiArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
          {relatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.slice(0, 8).map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct._id}
                  product={relatedProduct}
                  onAddToCart={handleRelatedProductAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Chưa có sản phẩm liên quan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
