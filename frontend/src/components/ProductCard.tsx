import { Link } from 'react-router-dom';
import { FiStar, FiShoppingCart } from 'react-icons/fi';
import type { Product } from '../types/product';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const discountPercent = product.discount || (product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span>No Image</span>
          </div>
        )}

        {/* Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{discountPercent}%
          </div>
        )}

        {/* Stock Badge */}
        {product.stock === 0 && (
          <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs font-semibold px-2 py-1 rounded">
            Hết hàng
          </div>
        )}

        {/* Quick Add to Cart Button */}
        {product.stock > 0 && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-2 right-2 bg-primary-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary-700 shadow-lg"
            title="Thêm vào giỏ"
          >
            <FiShoppingCart className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Brand - Luôn hiển thị, nếu không có thì là Custom */}
        <p className="text-xs text-gray-500 mb-1 min-h-[16px]">
          {product.brand && product.brand.trim() !== '' ? product.brand : 'Custom'}
        </p>

        {/* Name */}
        <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating && product.rating.count > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating.average)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">
              ({product.rating.count})
            </span>
          </div>
        )}

        {/* Price & Sold Count */}
        <div className="mt-auto">
          <div className="flex flex-col">
            {/* Price và Sold Count cùng hàng */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-lg font-bold text-primary-600">
                {product.price.toLocaleString('vi-VN')}₫
              </span>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                Đã bán:{' '}
                <span className="font-medium text-gray-700">
                  {(product.soldCount ?? 0).toLocaleString('vi-VN')}
                </span>
              </span>
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {product.originalPrice.toLocaleString('vi-VN')}₫
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;

