import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiStar, FiShoppingCart, FiPlus, FiMinus, FiCopy, FiCheck, FiMessageCircle, FiShield, FiHeadphones, FiDollarSign, FiPackage, FiRefreshCw } from 'react-icons/fi';
import { FaFacebook } from 'react-icons/fa';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService';
import { useCartStore } from '../store/cartStore';
import type { Product } from '../types/product';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem, setLoading: setCartLoading } = useCartStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

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
      const response = await cartService.addToCart({
        productId: product._id,
        quantity,
      });

      // Update cart store
      addItem(response.data.items[response.data.items.length - 1]);
      setCartLoading(false);

      toast.success(`Đã thêm ${quantity} "${product.name}" vào giỏ hàng`);
    } catch (error: any) {
      setCartLoading(false);
      toast.error(error.message || 'Lỗi khi thêm vào giỏ hàng');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/cart');
  };

  const handleRelatedProductAddToCart = async (relatedProduct: Product) => {
    try {
      setCartLoading(true);
      const response = await cartService.addToCart({
        productId: relatedProduct._id,
        quantity: 1,
      });

      // Update cart store
      addItem(response.data.items[response.data.items.length - 1]);
      setCartLoading(false);

      toast.success(`Đã thêm "${relatedProduct.name}" vào giỏ hàng`);
    } catch (error: any) {
      setCartLoading(false);
      toast.error(error.message || 'Lỗi khi thêm vào giỏ hàng');
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
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
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImageIndex === index
                        ? 'border-primary-600'
                        : 'border-gray-200'
                        }`}
                    >
                      <img
                        src={img.url}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
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

              {/* Status & Brand */}
              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Tình trạng:</span>
                  {product.stock > 0 ? (
                    <span className="text-green-600 font-medium">Còn hàng</span>
                  ) : (
                    <span className="text-red-600 font-medium">Hết hàng</span>
                  )}
                </div>
                {product.brand && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Thương hiệu:</span>
                    <Link
                      to={`/products?brand=${encodeURIComponent(product.brand)}`}
                      className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
                    >
                      {product.brand}
                    </Link>
                  </div>
                )}
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
                        type="number"
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          if (val >= 1 && val <= product.stock) {
                            setQuantity(val);
                          }
                        }}
                        min={1}
                        max={product.stock}
                        className="w-16 text-center border-0 focus:outline-none focus:ring-0"
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
                <p className="text-sm font-medium text-gray-700 mb-2">Chia sẻ:</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShareFacebook}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="Chia sẻ lên Facebook"
                  >
                    <FaFacebook className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleShareZalo}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                    title="Chia sẻ lên Zalo"
                  >
                    <FiMessageCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className={`p-2 rounded-lg transition-colors ${linkCopied
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

        {/* Description - Full width */}
        {product.description && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Mô tả sản phẩm</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
            </div>
          </div>
        )}

        {/* Related Products - Khối riêng */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sản phẩm liên quan</h2>
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
