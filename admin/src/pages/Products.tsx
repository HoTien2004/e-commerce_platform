import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import { productService, Product } from '../services/productService';
import toast from 'react-hot-toast';
import ProductModal from '../components/ProductModal';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<'createdAt' | 'name' | 'price'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, sortBy, sortOrder]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts({
        page: currentPage,
        limit: 15,
        search: searchTerm || undefined,
        sortBy,
        sortOrder,
        status: 'all', // Admin: lấy tất cả trạng thái
      });
      setProducts(response.data.products);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      return;
    }

    try {
      await productService.deleteProduct(id);
      toast.success('Xóa sản phẩm thành công!');
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa sản phẩm');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    fetchProducts();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <FiPlus className="h-5 w-5" />
          <span>Thêm sản phẩm</span>
        </button>
      </div>

      {/* Search & Sort */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Search */}
        <div className="relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm kiếm sản phẩm..."
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <FiX className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sắp xếp:</span>
          <select
            value={`${sortBy}_${sortOrder}`}
            onChange={(e) => {
              const value = e.target.value as
                | 'createdAt_desc'
                | 'createdAt_asc'
                | 'name_asc'
                | 'name_desc'
                | 'price_asc'
                | 'price_desc';
              const [field, order] = value.split('_') as ['createdAt' | 'name' | 'price', 'asc' | 'desc'];
              setSortBy(field);
              setSortOrder(order);
              setCurrentPage(1);
            }}
            className="text-sm"
          >
            <option value="createdAt_desc">Mới nhất</option>
            <option value="createdAt_asc">Cũ nhất</option>
            <option value="name_asc">Tên A → Z</option>
            <option value="name_desc">Tên Z → A</option>
            <option value="price_asc">Giá thấp → cao</option>
            <option value="price_desc">Giá cao → thấp</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-500">Đang tải...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Không có sản phẩm nào</p>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hình ảnh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Danh mục
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tồn kho
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="h-12 w-12 object-cover rounded"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-400">No image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.brand}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {product.price.toLocaleString('vi-VN')}₫
                      </div>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="text-xs text-gray-500 line-through">
                          {product.originalPrice.toLocaleString('vi-VN')}₫
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${product.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : product.status === 'out_of_stock'
                            ? 'bg-red-100 text-red-800'
                            : product.status === 'inactive'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                      >
                        {product.status === 'active'
                          ? 'Hoạt động'
                          : product.status === 'out_of_stock'
                            ? 'Hết hàng'
                            : product.status === 'inactive'
                              ? 'Không hoạt động'
                              : 'Ngừng kinh doanh'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-primary-600 hover:text-primary-900 p-2 rounded hover:bg-primary-50 transition-colors"
                          title="Sửa"
                        >
                          <FiEdit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition-colors"
                          title="Xóa"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-4 flex flex-col items-center justify-center gap-3 border-t border-gray-200">
                <div className="text-sm text-gray-700 text-center">
                  Hiển thị {products.length} sản phẩm - Trang {currentPage} / {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Trước
                  </button>
                  {/* Page numbers */}
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Sau →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <ProductModal
          product={editingProduct}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default Products;

