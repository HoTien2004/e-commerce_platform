import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiStar, FiShoppingCart, FiPlus, FiMinus, FiCopy, FiCheck, FiMessageCircle, FiShield, FiHeadphones, FiDollarSign, FiPackage, FiRefreshCw, FiGrid, FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaFacebook, FaTiktok, FaTwitter, FaPinterest, FaFacebookMessenger } from 'react-icons/fa';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService';
import { reviewService, type Review } from '../services/reviewService';
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
  const { isAuthenticated, user } = useAuthStore();
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
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [ratingDistribution, setRatingDistribution] = useState<{ 1: number; 2: number; 3: number; 4: number; 5: number }>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | undefined>(undefined);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [hasRated, setHasRated] = useState<boolean>(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [userRatingsMap, setUserRatingsMap] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  useEffect(() => {
    if (product) {
      fetchRelatedProducts();
      fetchReviews();
    }
  }, [product, currentPage, selectedRatingFilter]);

  // Check if user has rated and build user ratings map when product changes
  useEffect(() => {
    if (product?._id) {
      if (isAuthenticated && user?.id) {
        checkUserRating();
      } else {
        setHasRated(false);
        setUserRating(null);
      }
      // Build user ratings map from all reviews
      buildUserRatingsMap();
    }
  }, [product?._id, isAuthenticated, user?.id]);

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

  const buildUserRatingsMap = async () => {
    if (!product?._id) return;

    try {
      // Fetch all reviews to build complete ratings map
      const response = await reviewService.getProductReviews(
        product._id,
        1,
        1000 // Large limit to get all reviews
      );

      if (response.success && response.data) {
        const ratingsMap = new Map<string, number>();
        response.data.reviews.forEach((review: Review) => {
          if (review.rating !== null && review.rating !== undefined) {
            const userId = review.userId._id;
            // Only set if not already set (keep the first/oldest rating)
            if (!ratingsMap.has(userId)) {
              ratingsMap.set(userId, review.rating);
            }
          }
        });
        setUserRatingsMap(ratingsMap);

        // Also check if current user has rated
        if (isAuthenticated && user?.id) {
          const userReviewWithRating = response.data.reviews.find(
            (review: Review) =>
              review.userId._id === user.id &&
              review.rating !== null &&
              review.rating !== undefined
          );

          if (userReviewWithRating) {
            setHasRated(true);
            setUserRating(userReviewWithRating.rating);
          } else {
            setHasRated(false);
            setUserRating(null);
          }
        }
      }
    } catch (error) {
      console.error('Error building user ratings map:', error);
    }
  };

  const checkUserRating = async () => {
    if (!product?._id || !isAuthenticated || !user?.id) return;

    try {
      // Fetch all reviews to check if user has rated
      const response = await reviewService.getProductReviews(
        product._id,
        1,
        1000 // Large limit to get all reviews
      );

      if (response.success && response.data) {
        const userReviewWithRating = response.data.reviews.find(
          (review: Review) =>
            review.userId._id === user.id &&
            review.rating !== null &&
            review.rating !== undefined
        );

        if (userReviewWithRating) {
          setHasRated(true);
          setUserRating(userReviewWithRating.rating);
        } else {
          setHasRated(false);
          setUserRating(null);
        }
      }
    } catch (error) {
      console.error('Error checking user rating:', error);
      // On error, assume not rated
      setHasRated(false);
      setUserRating(null);
    }
  };

  const fetchReviews = async () => {
    if (!product?._id) return;
    try {
      setReviewsLoading(true);
      const response = await reviewService.getProductReviews(
        product._id,
        currentPage,
        10,
        selectedRatingFilter
      );
      if (response.success && response.data) {
        setReviews(response.data.reviews);
        setRatingDistribution(response.data.ratingDistribution);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      toast.error('Không thể tải đánh giá');
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!product || !isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đánh giá');
      return;
    }

    // If user hasn't rated yet, rating is required
    if (!hasRated && selectedRating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá');
      return;
    }

    // If user has already rated, only allow comment (no rating)
    if (hasRated && !reviewComment.trim()) {
      toast.error('Vui lòng nhập bình luận');
      return;
    }

    try {
      setIsSubmittingReview(true);
      const response = await reviewService.createReview({
        productId: product._id,
        // Only send rating if user hasn't rated yet
        rating: hasRated ? undefined : selectedRating,
        comment: reviewComment.trim() || undefined,
      });

      if (response.success) {
        toast.success(hasRated ? 'Bình luận đã được gửi thành công!' : 'Đánh giá đã được gửi thành công!');
        if (!hasRated && selectedRating) {
          // User just rated for the first time
          setHasRated(true);
          setUserRating(selectedRating);
          // Update userRatingsMap
          if (user?.id) {
            setUserRatingsMap(prev => {
              const newMap = new Map(prev);
              newMap.set(user.id, selectedRating);
              return newMap;
            });
          }
        }
        if (!hasRated) {
          setSelectedRating(0);
        }
        setReviewComment('');
        // Refresh reviews, product, and user ratings map
        await fetchReviews();
        await fetchProduct();
        await buildUserRatingsMap();
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      const errorMessage = error.response?.data?.message || 'Không thể gửi đánh giá';
      toast.error(errorMessage);
      // If error is about already rated, update state
      if (errorMessage.includes('đã đánh giá')) {
        setHasRated(true);
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleToggleLike = async (reviewId: string) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thích đánh giá');
      return;
    }

    try {
      const response = await reviewService.toggleReviewLike(reviewId);
      if (response.success) {
        // Update local state
        setReviews((prev) =>
          prev.map((review) =>
            review._id === reviewId
              ? {
                ...review,
                userLiked: response.data.liked,
                helpfulCount: response.data.helpfulCount,
              }
              : review
          )
        );
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast.error('Không thể cập nhật lượt thích');
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} tuần trước`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} tháng trước`;
    return `${Math.floor(diffInSeconds / 31536000)} năm trước`;
  };

  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setIsAddingToCart(true);
      setCartLoading(true);

      // If not authenticated, use local cart only
      if (!isAuthenticated) {
        addItem({
          _id: product._id,
          productId: {
            _id: product._id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            images: (product.images || []).map(img => ({
              url: img.url,
              isPrimary: img.isPrimary || false,
            })),
            stock: product.stock,
          },
          quantity,
          price: product.price,
          addedAt: new Date().toISOString(),
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
          _id: relatedProduct._id,
          productId: {
            _id: relatedProduct._id,
            name: relatedProduct.name,
            slug: relatedProduct.slug,
            price: relatedProduct.price,
            images: (relatedProduct.images || []).map(img => ({
              url: img.url,
              isPrimary: img.isPrimary || false,
            })),
            stock: relatedProduct.stock,
          },
          quantity: 1,
          price: relatedProduct.price,
          addedAt: new Date().toISOString(),
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
              {product.rating && (product.rating.ratingCount || product.rating.count) > 0 && (
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
                    {product.rating.average.toFixed(1)} ({product.rating.ratingCount || product.rating.count || 0} đánh giá)
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

        {/* Product Reviews Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Đánh giá sản phẩm</h2>

          {/* Rating Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-gray-200">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold text-primary-600 mb-2">
                {product.rating?.average ? product.rating.average.toFixed(1) : '0.0'}
              </div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => {
                  const average = product.rating?.average || 0;
                  const filled = i < Math.floor(average);
                  const halfFilled = i === Math.floor(average) && average % 1 >= 0.5;
                  return (
                    <FiStar
                      key={i}
                      className={`w-6 h-6 ${filled
                        ? 'text-yellow-400 fill-current'
                        : halfFilled
                          ? 'text-yellow-400 fill-current opacity-50'
                          : 'text-gray-300'
                        }`}
                    />
                  );
                })}
              </div>
              <p className="text-sm text-gray-600">
                {product.rating?.ratingCount || product.rating?.count || 0} đánh giá
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="md:col-span-2 space-y-2">
              {[5, 4, 3, 2, 1].map((starCount) => {
                const count = ratingDistribution[starCount as keyof typeof ratingDistribution] || 0;
                const total = product.rating?.ratingCount || product.rating?.count || 0;
                const percentage = total > 0 ? (count / total) * 100 : 0;
                return (
                  <button
                    key={starCount}
                    onClick={() => {
                      if (selectedRatingFilter === starCount) {
                        setSelectedRatingFilter(undefined);
                        setCurrentPage(1);
                      } else {
                        setSelectedRatingFilter(starCount);
                        setCurrentPage(1);
                      }
                    }}
                    className={`flex items-center gap-3 w-full text-left hover:bg-gray-50 p-2 rounded transition-colors ${selectedRatingFilter === starCount ? 'bg-primary-50' : ''
                      }`}
                  >
                    <div className="flex items-center gap-1 w-20">
                      <span className="text-sm font-medium text-gray-700 w-4">{starCount}</span>
                      <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                    </div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add Review Form */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Viết đánh giá</h3>
            <div className="space-y-4">
              {/* Star Rating Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đánh giá của bạn
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    // If user has already rated, show their rating as read-only
                    const displayRating = hasRated ? userRating : (hoveredRating || selectedRating);
                    const isFilled = star <= (displayRating || 0);
                    return (
                      <button
                        key={star}
                        type="button"
                        disabled={hasRated}
                        className={`focus:outline-none transition-transform ${hasRated
                          ? 'cursor-not-allowed opacity-60'
                          : 'hover:scale-110'
                          }`}
                        onClick={() => !hasRated && setSelectedRating(star)}
                        onMouseEnter={() => !hasRated && setHoveredRating(star)}
                        onMouseLeave={() => !hasRated && setHoveredRating(0)}
                      >
                        <FiStar
                          className={`w-8 h-8 transition-colors ${isFilled
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                            }`}
                        />
                      </button>
                    );
                  })}
                  {(hasRated ? userRating : selectedRating) > 0 && (
                    <span className="ml-3 text-sm text-gray-600">
                      {hasRated && <span className="text-gray-500 italic">(Đã đánh giá) </span>}
                      {(hasRated ? userRating : selectedRating) === 1 && 'Rất không hài lòng'}
                      {(hasRated ? userRating : selectedRating) === 2 && 'Không hài lòng'}
                      {(hasRated ? userRating : selectedRating) === 3 && 'Bình thường'}
                      {(hasRated ? userRating : selectedRating) === 4 && 'Hài lòng'}
                      {(hasRated ? userRating : selectedRating) === 5 && 'Rất hài lòng'}
                    </span>
                  )}
                </div>
                {hasRated && (
                  <p className="mt-2 text-sm text-gray-500 italic">
                    Bạn đã đánh giá sản phẩm này. Bạn chỉ có thể thêm bình luận.
                  </p>
                )}
              </div>

              {/* Comment Input */}
              <div>
                <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Bình luận
                </label>
                <textarea
                  id="review-comment"
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  disabled={!hasRated && selectedRating === 0}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none ${!hasRated && selectedRating === 0
                      ? 'bg-gray-100 cursor-not-allowed opacity-60'
                      : ''
                    }`}
                  placeholder={
                    !hasRated && selectedRating === 0
                      ? "Vui lòng chọn số sao đánh giá trước..."
                      : "Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                  }
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={
                    (!hasRated && selectedRating === 0) ||
                    (hasRated && !reviewComment.trim()) ||
                    isSubmittingReview
                  }
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSubmitReview}
                >
                  {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Tất cả đánh giá ({product.rating?.ratingCount || product.rating?.count || 0})
              </h3>
              {selectedRatingFilter && (
                <button
                  onClick={() => {
                    setSelectedRatingFilter(undefined);
                    setCurrentPage(1);
                  }}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>

            {reviewsLoading ? (
              <div className="text-center py-12">
                <FiRefreshCw className="w-8 h-8 mx-auto mb-3 text-gray-400 animate-spin" />
                <p className="text-gray-500">Đang tải đánh giá...</p>
              </div>
            ) : reviews.length > 0 ? (
              <>
                <div className="space-y-6">
                  {reviews.map((review) => {
                    const userName = `${review.userId.firstName} ${review.userId.lastName}`;
                    const initials = getInitials(review.userId.firstName, review.userId.lastName);
                    const avatarUrl = review.userId.avatar;
                    // If review doesn't have rating, get it from userRatingsMap
                    const displayRating = review.rating !== null && review.rating !== undefined
                      ? review.rating
                      : (userRatingsMap.get(review.userId._id) || 0);

                    return (
                      <div
                        key={review._id}
                        className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
                      >
                        <div className="flex items-start gap-4">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={userName}
                              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-primary-600 font-semibold text-sm">
                                {initials}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h4 className="font-semibold text-gray-900">{userName}</h4>
                              {displayRating > 0 && (
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <FiStar
                                      key={i}
                                      className={`w-4 h-4 ${i < displayRating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                        }`}
                                    />
                                  ))}
                                </div>
                              )}
                              <span className="text-sm text-gray-500">
                                {formatTimeAgo(review.createdAt)}
                              </span>
                              {review.isVerifiedPurchase && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                  <FiCheck className="w-3 h-3" />
                                  Đã mua sản phẩm này
                                </span>
                              )}
                            </div>
                            {review.comment && (
                              <p className="text-gray-700 mb-2 whitespace-pre-wrap">
                                {review.comment}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <button
                                onClick={() => handleToggleLike(review._id)}
                                className={`flex items-center gap-1 transition-colors ${review.userLiked
                                  ? 'text-primary-600 font-medium'
                                  : 'text-gray-500 hover:text-primary-600'
                                  }`}
                              >
                                <span>Hữu ích</span>
                                {review.helpfulCount > 0 && (
                                  <span className="font-medium">({review.helpfulCount})</span>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FiChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-700">
                      Trang {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FiChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FiMessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-lg font-medium mb-1">Chưa có đánh giá nào</p>
                <p className="text-sm">
                  {selectedRatingFilter
                    ? `Chưa có đánh giá ${selectedRatingFilter} sao`
                    : 'Hãy là người đầu tiên đánh giá sản phẩm này!'}
                </p>
              </div>
            )}
          </div>
        </div>

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
