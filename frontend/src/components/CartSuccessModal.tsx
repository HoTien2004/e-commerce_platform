import { FiX } from 'react-icons/fi';
import type { Product } from '../types/product';

interface CartSuccessModalProps {
  product: Product;
  quantity: number;
  isOpen: boolean;
  onClose: () => void;
}

const CartSuccessModal = ({ product, quantity, isOpen, onClose }: CartSuccessModalProps) => {
  if (!isOpen || !product) return null;

  return (
    <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 flex items-center gap-4 min-w-[320px] max-w-[400px]">
      <div className="flex-shrink-0">
        <img
          src={product.images?.[0]?.url || '/placeholder.png'}
          alt={product.name}
          className="w-16 h-16 object-cover rounded-lg border-2 border-primary-600"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 mb-1">
              Đã thêm vào giỏ hàng
            </p>
            <p className="text-xs text-gray-600 line-clamp-2 mb-1">{product.name}</p>
            <p className="text-xs text-gray-500">
              Số lượng: <span className="font-semibold">{quantity}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors ml-2"
            aria-label="Đóng"
          >
            <FiX className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartSuccessModal;

