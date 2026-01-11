import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService';
import { useCartStore } from '../store/cartStore';
import type { Product } from '../types/product';
import toast from 'react-hot-toast';

const ProductList = () => {
  const { addItem, setLoading: setCartLoading } = useCartStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'price:asc');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  // Pagination
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Options
  const [categories, setCategories] = useState<Array<{ category: string; count: number }>>([]);
  const [brands, setBrands] = useState<Array<{ brand: string; count: number }>>([]);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, selectedCategory, selectedBrand, sortBy, minPrice, maxPrice, search]);

  const fetchCategories = async () => {
    try {
      const response = await productService.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await productService.getBrands();
      setBrands(response.data || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
      setBrands([]);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 12,
      };

      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedBrand) params.brand = selectedBrand;
      if (sortBy) params.sort = sortBy;
      if (minPrice) params.minPrice = parseInt(minPrice);
      if (maxPrice) params.maxPrice = parseInt(maxPrice);

      const response = await productService.getProducts(params);
      setProducts(response.data.products);
      setTotalPages(response.data.pagination.pages);
      setTotalProducts(response.data.pagination.total);

      // Update URL params
      const newParams = new URLSearchParams();
      if (search) newParams.set('search', search);
      if (selectedCategory) newParams.set('category', selectedCategory);
      if (selectedBrand) newParams.set('brand', selectedBrand);
      if (sortBy) newParams.set('sort', sortBy);
      if (minPrice) newParams.set('minPrice', minPrice);
      if (maxPrice) newParams.set('maxPrice', maxPrice);
      if (currentPage > 1) newParams.set('page', currentPage.toString());
      setSearchParams(newParams);
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedBrand('');
    setSortBy('price:asc');
    setMinPrice('');
    setMaxPrice('');
    setCurrentPage(1);
  };

  const handleAddToCart = async (product: Product) => {
    try {
      setCartLoading(true);
      const response = await cartService.addToCart({
        productId: product._id,
        quantity: 1,
      });
      
      // Update cart store
      addItem(response.data.items[response.data.items.length - 1]);
      setCartLoading(false);
      
      toast.success(`Đã thêm "${product.name}" vào giỏ hàng`);
    } catch (error: any) {
      setCartLoading(false);
      toast.error(error.message || 'Lỗi khi thêm vào giỏ hàng');
    }
  };

  const hasActiveFilters =
    search || selectedCategory || selectedBrand || minPrice || maxPrice;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {selectedCategory ? `Danh mục: ${selectedCategory}` : 'Tất cả sản phẩm'}
          </h1>
          <p className="text-gray-600">
            {totalProducts > 0 ? `Tìm thấy ${totalProducts} sản phẩm` : 'Đang tải...'}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside
            className={`lg:w-64 flex-shrink-0 ${
              showFilters ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24">
              {/* Filter Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Bộ lọc</h2>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tìm kiếm
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Tên sản phẩm..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Category Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Tất cả</option>
                  {categories.map((cat) => (
                    <option key={cat.category} value={cat.category}>
                      {cat.category} {cat.count > 0 && `(${cat.count})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thương hiệu
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => {
                    setSelectedBrand(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Tất cả</option>
                  {brands.map((brandItem) => (
                    <option key={brandItem.brand} value={brandItem.brand}>
                      {brandItem.brand} {brandItem.count > 0 && `(${brandItem.count})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khoảng giá
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Từ"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Đến"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <FiFilter className="w-5 h-5" />
                <span>Bộ lọc</span>
                {showFilters ? (
                  <FiChevronUp className="w-4 h-4" />
                ) : (
                  <FiChevronDown className="w-4 h-4" />
                )}
              </button>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Sắp xếp:</label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="price:asc">Giá: Thấp → Cao</option>
                  <option value="price:desc">Giá: Cao → Thấp</option>
                  <option value="name:asc">Tên: A → Z</option>
                  <option value="name:desc">Tên: Z → A</option>
                  <option value="rating:desc">Đánh giá cao nhất</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 animate-pulse"
                  >
                    <div className="aspect-square bg-gray-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-6 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-lg text-gray-600 mb-2">Không tìm thấy sản phẩm nào</p>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Xóa bộ lọc để xem tất cả sản phẩm
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>

                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 border rounded-lg ${
                              currentPage === page
                                ? 'bg-primary-600 text-white border-primary-600'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="px-2">...</span>;
                      }
                      return null;
                    })}

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;

