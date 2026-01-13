import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus, FiShoppingCart, FiArrowRight } from 'react-icons/fi';
import { useCartStore } from '../store/cartStore';
import { cartService } from '../services/cartService';
import toast from 'react-hot-toast';
import type { CartItem } from '../types/cart';

// Helper function to validate image URL
const isValidImageUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    // Check if it's a valid HTTP/HTTPS URL and not a placeholder service
    return (
      (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') &&
      !urlObj.hostname.includes('placeholder.com') &&
      !urlObj.hostname.includes('via.placeholder.com')
    );
  } catch {
    // If URL parsing fails, it might be a relative URL, which is OK
    return url.startsWith('/') || url.startsWith('./');
  }
};

const Cart = () => {
  const navigate = useNavigate();
  const { items, total, itemCount, setCart, updateItem, removeItem, clearCart, setLoading } = useCartStore();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;
    let abortController: AbortController | null = null;

    const loadCart = async () => {
      // If we already have items from localStorage, use them immediately
      // and sync with backend in the background
      if (items.length > 0) {
        // Show cached data immediately, sync in background
        setLoading(true);
        try {
          abortController = new AbortController();
          const response = await cartService.getCart();
          if (isMounted && !abortController.signal.aborted) {
            setCart(response.data);
          }
        } catch (error: any) {
          if (isMounted && !abortController?.signal.aborted) {
            // Only show error if it's not a timeout or network error
            if (error.code !== 'ECONNABORTED' && error.message !== 'Network Error' && error.name !== 'AbortError') {
              console.error('Error syncing cart:', error);
            }
          }
        } finally {
          if (isMounted && !abortController?.signal.aborted) {
            setLoading(false);
          }
        }
      } else {
        // No cached data, load from API
        try {
          setLoading(true);
          abortController = new AbortController();
          const response = await cartService.getCart();
          if (isMounted && !abortController.signal.aborted) {
            setCart(response.data);
          }
        } catch (error: any) {
          if (isMounted && !abortController?.signal.aborted) {
            if (error.code !== 'ECONNABORTED' && error.message !== 'Network Error' && error.name !== 'AbortError') {
              toast.error(error.response?.data?.message || error.message || 'Lỗi khi tải giỏ hàng');
            }
          }
        } finally {
          if (isMounted && !abortController?.signal.aborted) {
            setLoading(false);
          }
        }
      }
    };

    loadCart();

    return () => {
      isMounted = false;
      if (abortController) {
        abortController.abort();
      }
    };
  }, []); // Only run once on mount

  // Điều chỉnh trang hiện tại nếu số lượng item thay đổi
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [items.length, currentPage, itemsPerPage]);

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      setIsUpdating(productId);
      const response = await cartService.updateCartItem({ productId, quantity: newQuantity });
      setCart(response.data);
      updateItem(productId, newQuantity);
      toast.success('Đã cập nhật số lượng');
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi cập nhật giỏ hàng');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      setIsUpdating(productId);
      const response = await cartService.removeFromCart(productId);
      setCart(response.data);
      removeItem(productId);
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi xóa sản phẩm');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleClearSelected = async () => {
    if (selectedItems.size === 0) {
      toast.error('Vui lòng chọn sản phẩm cần xóa');
      return;
    }

    const selectedCount = selectedItems.size;
    const selectedItemsArray = Array.from(selectedItems);

    try {
      setLoading(true);

      // Collect productIds to remove
      const productIdsToRemove: string[] = [];
      for (const itemId of selectedItemsArray) {
        const item = items.find((i) => i._id === itemId);
        if (item) {
          const productId = typeof item.productId === 'string' ? item.productId : (item.productId as any)?._id;
          if (productId) {
            productIdsToRemove.push(productId);
          }
        }
      }

      // Remove items sequentially to avoid race conditions
      let successCount = 0;
      for (const productId of productIdsToRemove) {
        try {
          await cartService.removeFromCart(productId);
          removeItem(productId);
          successCount++;
        } catch (error: any) {
          // Continue removing other items even if one fails
          console.error(`Error removing product ${productId}:`, error);
        }
      }

      // Reload cart to sync with backend
      const response = await cartService.getCart();
      setCart(response.data);

      // Clear selected items
      setSelectedItems(new Set());

      if (successCount === selectedCount) {
        toast.success(`Đã xóa ${selectedCount} sản phẩm khỏi giỏ hàng`);
      } else {
        toast.success(`Đã xóa ${successCount}/${selectedCount} sản phẩm khỏi giỏ hàng`);
      }
    } catch (error: any) {
      console.error('Error in handleClearSelected:', error);
      toast.error(error.response?.data?.message || error.message || 'Lỗi khi xóa sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = items.slice(startIndex, startIndex + itemsPerPage);

  // Handle select/deselect items
  const handleToggleSelect = (itemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === paginatedItems.length && paginatedItems.length > 0) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(paginatedItems.map((item) => item._id)));
    }
  };

  // Calculate totals for selected items only
  const selectedItemsList = items.filter((item) => selectedItems.has(item._id));
  const selectedTotal = selectedItemsList.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedItemCount = selectedItemsList.reduce((sum, item) => sum + item.quantity, 0);

  // Use selected items total if any items are selected, otherwise 0
  const displayTotal = selectedItems.size > 0 ? selectedTotal : 0;
  const displayItemCount = selectedItems.size > 0 ? selectedItemCount : 0;

  // Miễn phí vận chuyển cho đơn trên 1,000,000; ngược lại 50,000
  const shippingFee = displayTotal > 1000000 ? 0 : (displayTotal > 0 ? 50000 : 0);
  const finalTotal = displayTotal + shippingFee;

  // Handle checkout with selected items
  const handleCheckout = () => {
    if (selectedItems.size === 0) {
      toast.error('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
      return;
    }

    // Get productIds of selected items
    const selectedProductIds = items
      .filter((item) => selectedItems.has(item._id))
      .map((item) => {
        const productId = typeof item.productId === 'string' ? item.productId : (item.productId as any)?._id;
        return productId;
      })
      .filter((id): id is string => !!id);

    // Navigate to checkout with selected items
    navigate('/checkout', { state: { selectedProductIds } });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Reset selected items when changing page
    setSelectedItems(new Set());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset selected items when items change
  useEffect(() => {
    setSelectedItems(new Set());
  }, [items.length]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FiShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-600 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              <span>Tiếp tục mua sắm</span>
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1200px] mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Giỏ hàng</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === paginatedItems.length && paginatedItems.length > 0}
                    onChange={handleSelectAll}
                    className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Chọn tất cả ({paginatedItems.length})
                  </span>
                </label>
                <span className="text-sm text-gray-500">
                  {selectedItems.size > 0 && `Đã chọn: ${selectedItems.size}`}
                </span>
              </div>
              {selectedItems.size > 0 && (
                <button
                  onClick={handleClearSelected}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Xóa tất cả sản phẩm đã chọn
                </button>
              )}
            </div>

            {/* Items List */}
            {paginatedItems.map((item) => {
              // Check if productId is an object and has images
              const product = typeof item.productId === 'object' && item.productId !== null ? item.productId : null;
              const primaryImage = product?.images?.find((img) => img.isPrimary) || product?.images?.[0];
              const productId = typeof item.productId === 'string' ? item.productId : (product?._id || '');
              const isUpdatingItem = isUpdating === productId;

              // Skip rendering if product is null
              if (!product && typeof item.productId !== 'string') {
                return null;
              }

              const isSelected = selectedItems.has(item._id);

              return (
                <div
                  key={item._id}
                  className={`bg-white rounded-lg shadow-sm border p-4 ${isSelected ? 'border-primary-500 border-2' : 'border-gray-200'
                    }`}
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Checkbox */}
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(item._id)}
                        className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500 mt-2"
                      />
                    </div>

                    {/* Image */}
                    <Link
                      to={`/products/${product?.slug || ''}`}
                      className="flex-shrink-0 w-full sm:w-24 h-24 bg-gray-100 rounded-lg overflow-hidden"
                    >
                      {primaryImage &&
                        primaryImage.url &&
                        isValidImageUrl(primaryImage.url) &&
                        !imageErrors.has(primaryImage.url) ? (
                        <img
                          src={primaryImage.url}
                          alt={product?.name || ''}
                          className="w-full h-full object-cover"
                          onError={() => {
                            // Mark this image URL as failed
                            setImageErrors((prev) => new Set(prev).add(primaryImage.url));
                          }}
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/products/${product?.slug || ''}`}
                        className="block mb-2"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2">
                          {product?.name || 'Sản phẩm không xác định'}
                        </h3>
                      </Link>
                      <p className="text-lg font-bold text-primary-600 mb-4">
                        {item.price.toLocaleString('vi-VN')}₫
                      </p>

                      {/* Quantity & Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => handleUpdateQuantity(productId, item.quantity - 1)}
                            disabled={isUpdatingItem || item.quantity <= 1}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FiMinus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 min-w-[60px] text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(productId, item.quantity + 1)}
                            disabled={isUpdatingItem || (!!product && item.quantity >= product.stock)}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FiPlus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold text-gray-900">
                            {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                          </span>
                          <button
                            onClick={() => handleRemoveItem(productId)}
                            disabled={isUpdatingItem}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Xóa"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <div className="flex items-center gap-1 mx-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1.5 text-sm rounded-lg border ${currentPage === page
                        ? 'border-primary-600 text-primary-600 bg-primary-50'
                        : 'border-gray-300 bg-white hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  <span className="ml-2 text-xs text-gray-500">
                    Trang {currentPage}/{totalPages}
                  </span>
                </div>
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tóm tắt đơn hàng</h2>

              <div className="space-y-3 mb-6">
                {selectedItems.size > 0 && (
                  <p className="text-sm text-gray-600 mb-2">
                    Đã chọn {selectedItems.size} sản phẩm
                  </p>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính:</span>
                  <span>{displayTotal.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển (Tạm tính):</span>
                  <span>
                    {shippingFee === 0 ? (
                      displayTotal > 0 ? (
                        <span className="text-green-600 font-medium">Miễn phí</span>
                      ) : (
                        <span>0₫</span>
                      )
                    ) : (
                      `${shippingFee.toLocaleString('vi-VN')}₫`
                    )}
                  </span>
                </div>
                {displayTotal > 0 && displayTotal <= 1000000 && (
                  <p className="text-xs text-gray-500">
                    Mua thêm {(1000000 - displayTotal + 1).toLocaleString('vi-VN')}₫ để được miễn phí vận chuyển
                  </p>
                )}
                {displayTotal > 1000000 && (
                  <p className="text-xs text-green-600 font-medium">
                    Đơn trên 1.000.000₫: Miễn phí vận chuyển
                  </p>
                )}
                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Tổng cộng:</span>
                  <span className="text-primary-600">{finalTotal.toLocaleString('vi-VN')}₫</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={selectedItems.size === 0 && items.length > 0}
                className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Tiến hành thanh toán</span>
                <FiArrowRight className="w-5 h-5" />
              </button>

              <Link
                to="/"
                className="block mt-4 text-center text-primary-600 hover:text-primary-700 font-medium"
              >
                ← Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

