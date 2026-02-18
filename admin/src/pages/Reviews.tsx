import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reviewService, type Review } from '../services/reviewService';
import { FiStar, FiTrash2, FiSearch, FiEye, FiFilter, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Reviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [productIdFilter, setProductIdFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [userRatingsMap, setUserRatingsMap] = useState<Map<string, Map<string, number>>>(new Map()); // productId -> userId -> rating

  useEffect(() => {
    loadReviews();
  }, [currentPage, selectedRating, productIdFilter, userIdFilter]);

  // Build user ratings map on mount
  useEffect(() => {
    buildUserRatingsMap();
  }, []);

  const buildUserRatingsMap = async () => {
    try {
      // Fetch all reviews to build complete ratings map
      const response = await reviewService.getAllReviews({
        page: 1,
        limit: 1000, // Large limit to get all reviews
      });
      
      if (response.success && response.data) {
        // Build user ratings map (productId -> userId -> rating)
        const ratingsMap = new Map<string, Map<string, number>>();
        response.data.reviews.forEach((review: Review) => {
          if (review.rating !== null && review.rating !== undefined) {
            const productId = review.productId._id;
            const userId = review.userId._id;
            
            if (!ratingsMap.has(productId)) {
              ratingsMap.set(productId, new Map());
            }
            const productRatings = ratingsMap.get(productId)!;
            // Only set if not already set (keep the first/oldest rating)
            if (!productRatings.has(userId)) {
              productRatings.set(userId, review.rating);
            }
          }
        });
        setUserRatingsMap(ratingsMap);
      }
    } catch (error) {
      console.error('Error building user ratings map:', error);
    }
  };

  const loadReviews = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 20,
      };

      if (selectedRating !== 'all') {
        params.rating = parseInt(selectedRating, 10);
      }

      if (productIdFilter) {
        params.productId = productIdFilter;
      }

      if (userIdFilter) {
        params.userId = userIdFilter;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await reviewService.getAllReviews(params);
      if (response.success && response.data) {
        setReviews(response.data.reviews);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error: any) {
      console.error('Error loading reviews:', error);
      toast.error('Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadReviews();
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) {
      return;
    }

    try {
      const response = await reviewService.deleteReview(reviewId);
      if (response.success) {
        toast.success('Đã xóa đánh giá thành công');
        loadReviews();
        // Refresh user ratings map
        buildUserRatingsMap();
      }
    } catch (error: any) {
      console.error('Error deleting review:', error);
      toast.error(error.response?.data?.message || 'Không thể xóa đánh giá');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const clearFilters = () => {
    setSelectedRating('all');
    setSearchQuery('');
    setProductIdFilter('');
    setUserIdFilter('');
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedRating !== 'all' || searchQuery || productIdFilter || userIdFilter;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý đánh giá</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đánh giá
            </label>
            <select
              value={selectedRating}
              onChange={(e) => {
                setSelectedRating(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Tất cả</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>
          </div>

          {/* Product ID Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã sản phẩm
            </label>
            <input
              type="text"
              value={productIdFilter}
              onChange={(e) => setProductIdFilter(e.target.value)}
              placeholder="Nhập mã sản phẩm..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* User ID Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã người dùng
            </label>
            <input
              type="text"
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              placeholder="Nhập mã người dùng..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm bình luận
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Tìm trong bình luận..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <FiSearch className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiX className="w-4 h-4" />
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-500">Đang tải...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p>Chưa có đánh giá nào</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sản phẩm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Đánh giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bình luận
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hữu ích
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reviews.map((review) => (
                    <tr key={review._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {review.userId.avatar ? (
                            <img
                              src={review.userId.avatar}
                              alt={review.userId.firstName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-primary-600 font-semibold text-sm">
                                {review.userId.firstName.charAt(0)}
                                {review.userId.lastName.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {review.userId.firstName} {review.userId.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{review.userId.email}</p>
                            {review.isVerifiedPurchase && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                                Đã mua
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {review.productId.images?.[0] && (
                            <img
                              src={review.productId.images.find(img => img.isPrimary)?.url || review.productId.images[0].url}
                              alt={review.productId.name}
                              className="w-12 h-12 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">
                              {review.productId.name}
                            </p>
                            <p className="text-xs text-gray-500">{review.productId.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          // If review doesn't have rating, get it from userRatingsMap
                          const displayRating = review.rating !== null && review.rating !== undefined
                            ? review.rating
                            : (userRatingsMap.get(review.productId._id)?.get(review.userId._id) || null);
                          
                          if (displayRating === null) {
                            return <span className="text-sm text-gray-400">Chưa đánh giá</span>;
                          }
                          
                          return (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <FiStar
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < displayRating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className={`ml-2 text-sm font-medium ${getRatingColor(displayRating)}`}>
                                {displayRating}
                              </span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 line-clamp-2 max-w-xs">
                          {review.comment || <span className="text-gray-400">Không có bình luận</span>}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{review.helpfulCount}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDelete(review._id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Xóa đánh giá"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Trang {currentPage} / {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Reviews;

