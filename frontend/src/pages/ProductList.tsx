import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX, FiChevronDown, FiChevronUp, FiChevronRight } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService';
import { useCartStore } from '../store/cartStore';
import { useCartModalStore } from '../store/cartModalStore';
import type { Product } from '../types/product';
import { scrollToTop } from '../utils/scrollToTop';
import toast from 'react-hot-toast';

const ProductList = () => {
  const { setCart, setLoading: setCartLoading } = useCartStore();
  const { addModal } = useCartModalStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isBrandOpen, setIsBrandOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isCategoryClosing, setIsCategoryClosing] = useState(false);
  const [isBrandClosing, setIsBrandClosing] = useState(false);
  const [isSortClosing, setIsSortClosing] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const closingTimeoutsRef = useRef<{
    category: ReturnType<typeof setTimeout> | null;
    brand: ReturnType<typeof setTimeout> | null;
    sort: ReturnType<typeof setTimeout> | null;
  }>({ category: null, brand: null, sort: null });

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
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

  // Helper function to close dropdown with fade out effect
  const handleCloseDropdown = (
    isOpen: boolean,
    setIsOpen: (value: boolean) => void,
    setIsClosing: (value: boolean) => void,
    key: 'category' | 'brand' | 'sort'
  ) => {
    if (isOpen && !closingTimeoutsRef.current[key]) {
      setIsClosing(true);
      closingTimeoutsRef.current[key] = setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
        closingTimeoutsRef.current[key] = null;
      }, 200);
    }
  };

  // Helper function to toggle dropdown with proper handling of closing state
  const handleToggleDropdown = (
    isOpen: boolean,
    setIsOpen: (value: boolean) => void,
    setIsClosing: (value: boolean) => void,
    key: 'category' | 'brand' | 'sort'
  ) => {
    // If closing, cancel the timeout and open immediately
    if (closingTimeoutsRef.current[key]) {
      clearTimeout(closingTimeoutsRef.current[key]);
      closingTimeoutsRef.current[key] = null;
      setIsClosing(false);
      setIsOpen(true);
    } else if (isOpen) {
      // If open, close with fade out
      handleCloseDropdown(isOpen, setIsOpen, setIsClosing, key);
    } else {
      // If closed, open immediately
      setIsOpen(true);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        handleCloseDropdown(isCategoryOpen, setIsCategoryOpen, setIsCategoryClosing, 'category');
      }
      if (brandRef.current && !brandRef.current.contains(event.target as Node)) {
        handleCloseDropdown(isBrandOpen, setIsBrandOpen, setIsBrandClosing, 'brand');
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        handleCloseDropdown(isSortOpen, setIsSortOpen, setIsSortClosing, 'sort');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCategoryOpen, isBrandOpen, isSortOpen]);

  // Close dropdowns when scrolling with smooth fade out
  useEffect(() => {
    const handleScroll = () => {
      handleCloseDropdown(isCategoryOpen, setIsCategoryOpen, setIsCategoryClosing, 'category');
      handleCloseDropdown(isBrandOpen, setIsBrandOpen, setIsBrandClosing, 'brand');
      handleCloseDropdown(isSortOpen, setIsSortOpen, setIsSortClosing, 'sort');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      // Clear any pending timeouts
      if (closingTimeoutsRef.current.category) {
        clearTimeout(closingTimeoutsRef.current.category);
      }
      if (closingTimeoutsRef.current.brand) {
        clearTimeout(closingTimeoutsRef.current.brand);
      }
      if (closingTimeoutsRef.current.sort) {
        clearTimeout(closingTimeoutsRef.current.sort);
      }
    };
  }, [isCategoryOpen, isBrandOpen, isSortOpen]);

  // Sync state with URL params and reset filters when search or category changes from URL
  useEffect(() => {
    const searchFromUrl = searchParams.get('search') || '';
    const categoryFromUrl = searchParams.get('category') || '';
    const brandFromUrl = searchParams.get('brand') || '';
    const sortFromUrl = searchParams.get('sort') || '';

    // If sort changes from URL (e.g., clicking "Xem tất cả" from promotions/best sellers), set sort
    if (sortFromUrl && sortFromUrl !== sortBy) {
      setSortBy(sortFromUrl);
      setSearch('');
      setSearchInput('');
      setSelectedCategory('');
      setSelectedBrand('');
      setMinPrice('');
      setMaxPrice('');
      setCurrentPage(1);
      scrollToTop();
      return;
    }

    // If category changes from URL (e.g., clicking footer links), reset other filters and set category
    if (categoryFromUrl && categoryFromUrl !== selectedCategory) {
      setSelectedCategory(categoryFromUrl);
      setSearch('');
      setSearchInput('');
      setSelectedBrand('');
      setMinPrice('');
      setMaxPrice('');
      setSortBy('price:asc'); // Reset sort when category changes
      setCurrentPage(1);
      scrollToTop();
      return;
    }

    // If search changes from URL (e.g., clicking footer links), reset other filters
    if (searchFromUrl !== search) {
      setSearch(searchFromUrl);
      setSearchInput(searchFromUrl);
      // Reset all other filters when new search comes from URL
      if (searchFromUrl) {
        setSelectedCategory('');
        setSelectedBrand('');
        setMinPrice('');
        setMaxPrice('');
        setSortBy('price:asc'); // Reset sort when search changes
        setCurrentPage(1);
        // Scroll to top when new search is applied
        scrollToTop();
      }
    }

    // Sync other params (only if not being reset by search, category, or sort)
    if (!searchFromUrl && !categoryFromUrl && !sortFromUrl) {
      if (brandFromUrl !== selectedBrand) {
        setSelectedBrand(brandFromUrl);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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

      // Handle "Phụ kiện" category - fetch all products except PC, Laptop, and Linh kiện máy tính
      if (selectedCategory === 'Phụ kiện') {
        // Categories to exclude
        const excludedCategories = [
          'PC Gaming', 'PC Văn phòng', 'PC Workstation', 'PC MINI',
          'Laptop gaming', 'Laptop văn phòng',
          'Linh kiện máy tính'
        ];

        // Fetch all products
        const allProductsParams: any = {
          page: 1,
          limit: 1000, // Get more to filter
          status: 'active',
        };

        if (search) allProductsParams.search = search;
        if (selectedBrand) allProductsParams.brand = selectedBrand;
        if (sortBy) {
          const [field, order] = sortBy.split(':');
          if (field) allProductsParams.sortBy = field;
          if (order) allProductsParams.sortOrder = order;
        }
        if (minPrice) allProductsParams.minPrice = parseInt(minPrice);
        if (maxPrice) allProductsParams.maxPrice = parseInt(maxPrice);

        const allProductsResponse = await productService.getProducts(allProductsParams);
        let filteredProducts = (allProductsResponse.data?.products || []).filter(
          (product: Product) => !excludedCategories.includes(product.category)
        );

        // Apply additional filters
        if (selectedBrand) {
          filteredProducts = filteredProducts.filter((p: Product) => p.brand === selectedBrand);
        }
        if (minPrice) {
          filteredProducts = filteredProducts.filter((p: Product) => p.price >= parseInt(minPrice));
        }
        if (maxPrice) {
          filteredProducts = filteredProducts.filter((p: Product) => p.price <= parseInt(maxPrice));
        }

        // Sort
        if (sortBy) {
          const [field, order] = sortBy.split(':');
          const isAsc = order === 'asc';
          filteredProducts.sort((a: Product, b: Product) => {
            let aVal: any, bVal: any;
            if (field === 'price') {
              aVal = a.price;
              bVal = b.price;
            } else if (field === 'name') {
              aVal = a.name.toLowerCase();
              bVal = b.name.toLowerCase();
            } else if (field === 'discount') {
              aVal = a.discount || 0;
              bVal = b.discount || 0;
            } else if (field === 'soldCount') {
              aVal = a.soldCount || 0;
              bVal = b.soldCount || 0;
            } else {
              return 0;
            }
            if (aVal < bVal) return isAsc ? -1 : 1;
            if (aVal > bVal) return isAsc ? 1 : -1;
            return 0;
          });
        }

        // Paginate
        const limit = 12;
        const startIndex = (currentPage - 1) * limit;
        const paginatedProducts = filteredProducts.slice(startIndex, startIndex + limit);
        const totalPages = Math.ceil(filteredProducts.length / limit);

        setProducts(paginatedProducts);
        setTotalPages(totalPages);
        setTotalProducts(filteredProducts.length);

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
      } else {
        // Normal category filtering
        const params: any = {
          page: currentPage,
          limit: 12,
        };

        if (search) params.search = search;
        if (selectedCategory) params.category = selectedCategory;
        if (selectedBrand) params.brand = selectedBrand;
        if (sortBy) {
          const [field, order] = sortBy.split(':');
          if (field) params.sortBy = field;
          if (order) params.sortOrder = order;
        }
        if (minPrice) params.minPrice = parseInt(minPrice);
        if (maxPrice) params.maxPrice = parseInt(maxPrice);

        const response = await productService.getProducts(params);
        setProducts(response.data.products);
        setTotalPages(response.data.pagination.totalPages);
        setTotalProducts(response.data.pagination.totalItems);

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
      }

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
    setSearchInput('');
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

      // Update cart store with the complete cart from backend
      setCart(response.data);

      // Show modal using store
      addModal(product, 1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Lỗi khi thêm vào giỏ hàng');
    } finally {
      setCartLoading(false);
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
            {selectedCategory === 'Phụ kiện' ? 'Phụ kiện máy tính' : selectedCategory ? `Danh mục: ${selectedCategory}` : 'Tất cả sản phẩm'}
          </h1>
          {!loading && totalProducts > 0 && (
            <p className="text-gray-600">
              {`Tìm thấy ${totalProducts} sản phẩm`}
            </p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside
            className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'
              }`}
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                  }}
                  placeholder="Tên sản phẩm..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Category Filter */}
              <div className="mb-4" ref={categoryRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => handleToggleDropdown(isCategoryOpen, setIsCategoryOpen, setIsCategoryClosing, 'category')}
                    className="w-full px-3 py-2 h-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white flex items-center justify-between text-left"
                  >
                    <span className={selectedCategory ? 'text-gray-900' : 'text-gray-500'}>
                      {selectedCategory || 'Tất cả'}
                    </span>
                    <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {(isCategoryOpen || isCategoryClosing) && (
                    <div className={`absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[200px] overflow-y-auto no-scrollbar transition-all duration-200 ${isCategoryClosing ? 'opacity-0 transform translate-y-[-10px]' : 'opacity-100 transform translate-y-0'}`}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory('');
                          setIsCategoryOpen(false);
                          setCurrentPage(1);
                          scrollToTop();
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${!selectedCategory ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700'}`}
                      >
                        Tất cả
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory('Phụ kiện');
                          setIsCategoryOpen(false);
                          setCurrentPage(1);
                          scrollToTop();
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${selectedCategory === 'Phụ kiện' ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700'}`}
                      >
                        Phụ kiện
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.category}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat.category);
                            setIsCategoryOpen(false);
                            setCurrentPage(1);
                            scrollToTop();
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${selectedCategory === cat.category ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700'}`}
                        >
                          {cat.category}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Brand Filter */}
              <div className="mb-4" ref={brandRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thương hiệu
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => handleToggleDropdown(isBrandOpen, setIsBrandOpen, setIsBrandClosing, 'brand')}
                    className="w-full px-3 py-2 h-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white flex items-center justify-between text-left"
                  >
                    <span className={selectedBrand ? 'text-gray-900' : 'text-gray-500'}>
                      {selectedBrand || 'Tất cả'}
                    </span>
                    <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isBrandOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {(isBrandOpen || isBrandClosing) && (
                    <div className={`absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[200px] overflow-y-auto no-scrollbar transition-all duration-200 ${isBrandClosing ? 'opacity-0 transform translate-y-[-10px]' : 'opacity-100 transform translate-y-0'}`}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBrand('');
                          setIsBrandOpen(false);
                          setCurrentPage(1);
                          scrollToTop();
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${!selectedBrand ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700'}`}
                      >
                        Tất cả
                      </button>
                      {brands.map((brandItem) => (
                        <button
                          key={brandItem.brand}
                          type="button"
                          onClick={() => {
                            setSelectedBrand(brandItem.brand);
                            setIsBrandOpen(false);
                            setCurrentPage(1);
                            scrollToTop();
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${selectedBrand === brandItem.brand ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700'}`}
                        >
                          {brandItem.brand}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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

              {/* Apply Filters Button */}
              <button
                type="button"
                onClick={() => {
                  setSearch(searchInput.trim());
                  setCurrentPage(1);
                  scrollToTop();
                }}
                className="w-full mt-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-semibold"
              >
                Tìm kiếm
              </button>
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
              <div className="flex items-center gap-2" ref={sortRef}>
                <label className="text-sm text-gray-700">Sắp xếp:</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => handleToggleDropdown(isSortOpen, setIsSortOpen, setIsSortClosing, 'sort')}
                    className="px-3 py-2 h-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white flex items-center justify-between text-left min-w-[200px]"
                  >
                    <span className="text-gray-900">
                      {sortBy === 'price:asc' && 'Giá: Thấp → Cao'}
                      {sortBy === 'price:desc' && 'Giá: Cao → Thấp'}
                      {sortBy === 'name:asc' && 'Tên: A → Z'}
                      {sortBy === 'name:desc' && 'Tên: Z → A'}
                      {sortBy === 'discount:desc' && 'Khuyến mãi nhiều nhất'}
                      {sortBy === 'soldCount:desc' && 'Bán chạy nhất'}
                    </span>
                    <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform ml-1 ${isSortOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {(isSortOpen || isSortClosing) && (
                    <div className={`absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 transition-all duration-200 ${isSortClosing ? 'opacity-0 transform translate-y-[-10px]' : 'opacity-100 transform translate-y-0'}`}>
                      <button
                        type="button"
                        onClick={() => {
                          setSortBy('price:asc');
                          setIsSortOpen(false);
                          setCurrentPage(1);
                          scrollToTop();
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${sortBy === 'price:asc' ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700'}`}
                      >
                        Giá: Thấp → Cao
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSortBy('price:desc');
                          setIsSortOpen(false);
                          setCurrentPage(1);
                          scrollToTop();
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${sortBy === 'price:desc' ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700'}`}
                      >
                        Giá: Cao → Thấp
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSortBy('name:asc');
                          setIsSortOpen(false);
                          setCurrentPage(1);
                          scrollToTop();
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${sortBy === 'name:asc' ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700'}`}
                      >
                        Tên: A → Z
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSortBy('name:desc');
                          setIsSortOpen(false);
                          setCurrentPage(1);
                          scrollToTop();
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${sortBy === 'name:desc' ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700'}`}
                      >
                        Tên: Z → A
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSortBy('discount:desc');
                          setIsSortOpen(false);
                          setCurrentPage(1);
                          scrollToTop();
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${sortBy === 'discount:desc' ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700'}`}
                      >
                        Khuyến mãi nhiều nhất
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSortBy('soldCount:desc');
                          setIsSortOpen(false);
                          setCurrentPage(1);
                          scrollToTop();
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${sortBy === 'soldCount:desc' ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700'}`}
                      >
                        Bán chạy nhất
                      </button>
                    </div>
                  )}
                </div>
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
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      setCurrentPage((prev) => Math.max(1, prev - 1));
                      scrollToTop();
                    }}
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
                          onClick={() => {
                            setCurrentPage(page);
                            scrollToTop();
                          }}
                          className={`px-4 py-2 border rounded-lg ${currentPage === page
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
                    onClick={() => {
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                      scrollToTop();
                    }}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;

