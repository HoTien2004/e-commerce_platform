import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus, FiShoppingCart, FiArrowRight } from 'react-icons/fi';
import { useCartStore } from '../store/cartStore';
import { cartService } from '../services/cartService';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const { items, total, itemCount, setCart, updateItem, removeItem, clearCart, setLoading } = useCartStore();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await cartService.getCart();
      setCart(response.data);
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

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
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
      return;
    }

    try {
      setIsUpdating(productId);
      const response = await cartService.removeFromCart(productId);
      setCart(response.data);
      removeItem(productId);
      toast.success('Đã xóa khỏi giỏ hàng');
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi xóa sản phẩm');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleClearCart = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')) {
      return;
    }

    try {
      setLoading(true);
      await cartService.clearCart();
      clearCart();
      toast.success('Đã xóa toàn bộ giỏ hàng');
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi xóa giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const shippingFee = total > 5000000 ? 0 : 30000; // Free shipping over 5M
  const finalTotal = total + shippingFee;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FiShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-600 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <Link
              to="/products"
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
              <span className="text-sm font-medium text-gray-700">
                {itemCount} {itemCount === 1 ? 'sản phẩm' : 'sản phẩm'}
              </span>
              {items.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Xóa toàn bộ
                </button>
              )}
            </div>

            {/* Items List */}
            {items.map((item) => {
              // Check if productId is an object and has images
              const product = typeof item.productId === 'object' && item.productId !== null ? item.productId : null;
              const primaryImage = product?.images?.find((img) => img.isPrimary) || product?.images?.[0];
              const productId = typeof item.productId === 'string' ? item.productId : (product?._id || '');
              const isUpdatingItem = isUpdating === productId;

              // Skip rendering if product is null
              if (!product && typeof item.productId !== 'string') {
                return null;
              }

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Image */}
                    <Link
                      to={`/products/${product?.slug || ''}`}
                      className="flex-shrink-0 w-full sm:w-24 h-24 bg-gray-100 rounded-lg overflow-hidden"
                    >
                      {primaryImage ? (
                        <img
                          src={primaryImage.url}
                          alt={product?.name || ''}
                          className="w-full h-full object-cover"
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
                            disabled={isUpdatingItem || (product && item.quantity >= product.stock)}
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
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tóm tắt đơn hàng</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính:</span>
                  <span>{total.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="text-green-600 font-medium">Miễn phí</span>
                    ) : (
                      `${shippingFee.toLocaleString('vi-VN')}₫`
                    )}
                  </span>
                </div>
                {total > 0 && total < 5000000 && (
                  <p className="text-xs text-gray-500">
                    Mua thêm {(5000000 - total).toLocaleString('vi-VN')}₫ để được miễn phí vận chuyển
                  </p>
                )}
                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Tổng cộng:</span>
                  <span className="text-primary-600">{finalTotal.toLocaleString('vi-VN')}₫</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <span>Tiến hành thanh toán</span>
                <FiArrowRight className="w-5 h-5" />
              </button>

              <Link
                to="/products"
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

