import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService, type Order } from '../services/orderService';
import { FiEye, FiEdit, FiSearch, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchOrderNumber, setSearchOrderNumber] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [pendingStatusChange, setPendingStatusChange] = useState<{ orderId: string; newStatus: string } | null>(
    null
  );
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const [deleteOrderNumber, setDeleteOrderNumber] = useState<string>('');

  useEffect(() => {
    loadOrders();
  }, [currentPage, selectedStatus]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 10,
      };
      
      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }
      
      if (searchOrderNumber) {
        params.orderNumber = searchOrderNumber;
      }
      
      if (searchEmail) {
        params.email = searchEmail;
      }

      const response = await orderService.getOrders(params);
      if (response.success) {
        setOrders(response.data.orders);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error: any) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadOrders();
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setPendingStatusChange({ orderId, newStatus });
  };

  const confirmStatusChange = async () => {
    if (!pendingStatusChange) return;
    try {
      await orderService.updateOrderStatus(pendingStatusChange.orderId, {
        orderStatus: pendingStatusChange.newStatus as any,
      });
      toast.success('Cập nhật trạng thái đơn hàng thành công!');
      setPendingStatusChange(null);
      loadOrders();
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái đơn hàng');
    }
  };

  const cancelStatusChange = () => {
    setPendingStatusChange(null);
    // Reload to reset select value to actual status
    loadOrders();
  };

  const handleOpenDeleteOrder = (order: Order) => {
    setDeleteOrderId(order._id);
    setDeleteOrderNumber(order.orderNumber);
  };

  const handleDeleteOrder = async () => {
    if (!deleteOrderId) return;
    try {
      const response = await orderService.deleteOrder(deleteOrderId);
      if (response.success) {
        setOrders((prev) => prev.filter((o) => o._id !== deleteOrderId));
        toast.success('Xóa đơn hàng thành công!');
      } else {
        toast.error(response.message || 'Không thể xóa đơn hàng');
      }
    } catch (error: any) {
      console.error('Error deleting order:', error);
      toast.error(error.response?.data?.message || 'Không thể xóa đơn hàng');
    } finally {
      setDeleteOrderId(null);
      setDeleteOrderNumber('');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'returned':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Chờ xử lý',
      shipped: 'Đang giao',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy',
      returned: 'Đã trả hàng',
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn hàng</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all cursor-pointer shadow-sm hover:shadow-md bg-white text-gray-900 font-medium"
              style={{
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23374151' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                paddingRight: '2.5rem'
              }}
            >
              <option value="all" className="py-2 px-3 rounded-md">Tất cả</option>
              <option value="pending" className="py-2 px-3 rounded-md">Chờ xử lý</option>
              <option value="shipped" className="py-2 px-3 rounded-md">Đang giao</option>
              <option value="delivered" className="py-2 px-3 rounded-md">Đã giao</option>
              <option value="cancelled" className="py-2 px-3 rounded-md">Đã hủy</option>
              <option value="returned" className="py-2 px-3 rounded-md">Đã trả hàng</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mã đơn hàng</label>
            <input
              type="text"
              value={searchOrderNumber}
              onChange={(e) => setSearchOrderNumber(e.target.value)}
              placeholder="Tìm theo mã đơn hàng"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email khách hàng</label>
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="Tìm theo email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
            >
              <FiSearch className="w-4 h-4" />
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Đang tải...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Không tìm thấy đơn hàng nào
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã đơn hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số lượng sản phẩm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tổng tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div className="font-medium">{order.customerInfo.fullName}</div>
                          <div className="text-xs">{order.customerInfo.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.items.length} sản phẩm
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer shadow-sm hover:shadow-md ${getStatusColor(order.orderStatus)}`}
                          style={{ 
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            MozAppearance: 'none',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23374151' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 0.75rem center',
                            paddingRight: '2.5rem',
                            minWidth: '140px'
                          }}
                        >
                          <option value="pending" className="py-1.5 px-3 rounded-md font-medium">Chờ xử lý</option>
                          <option value="shipped" className="py-1.5 px-3 rounded-md font-medium">Đang giao</option>
                          <option value="delivered" className="py-1.5 px-3 rounded-md font-medium">Đã giao</option>
                          <option value="cancelled" className="py-1.5 px-3 rounded-md font-medium">Đã hủy</option>
                          <option value="returned" className="py-1.5 px-3 rounded-md font-medium">Đã trả hàng</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => navigate(`/orders/${order.orderNumber}`)}
                            className="text-primary-600 hover:text-primary-900 flex items-center gap-1"
                          >
                            <FiEye className="w-4 h-4" />
                            Xem
                          </button>
                          <button
                            onClick={() => handleOpenDeleteOrder(order)}
                            className="text-red-600 hover:text-red-800 flex items-center gap-1"
                          >
                            <FiTrash2 className="w-4 h-4" />
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow">
              <div className="text-sm text-gray-700">
                Trang {currentPage} / {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Trước
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirm status change modal */}
      <ConfirmModal
        isOpen={!!pendingStatusChange}
        title="Cập nhật trạng thái đơn hàng"
        message={
          pendingStatusChange
            ? `Bạn có chắc muốn cập nhật trạng thái đơn hàng thành "${getStatusLabel(
                pendingStatusChange.newStatus,
              )}"?`
            : ''
        }
        confirmLabel="Cập nhật"
        cancelLabel="Hủy"
        onConfirm={confirmStatusChange}
        onCancel={cancelStatusChange}
      />

      <ConfirmModal
        isOpen={!!deleteOrderId}
        title="Xóa đơn hàng"
        message={
          deleteOrderId
            ? `Bạn có chắc chắn muốn xóa đơn hàng "${deleteOrderNumber}"? Hành động này không thể hoàn tác.`
            : ''
        }
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        onConfirm={handleDeleteOrder}
        onCancel={() => {
          setDeleteOrderId(null);
          setDeleteOrderNumber('');
        }}
      />
    </div>
  );
};

export default Orders;

