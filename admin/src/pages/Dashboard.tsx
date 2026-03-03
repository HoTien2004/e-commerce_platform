import { useState, useEffect } from 'react';
import { adminService, type DashboardStats, type RecentOrder } from '../services/adminService';
import { FiPackage, FiShoppingCart, FiUsers, FiDollarSign } from 'react-icons/fi';

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentPage, setRecentPage] = useState(1);
  const [recentTotalPages, setRecentTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [recentPage]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboardStats({
        page: recentPage,
        limit: 10,
      });
      if (response.success) {
        setStats(response.data.stats);
        setRecentOrders(response.data.recentOrders);
        setRecentTotalPages(response.data.recentOrdersPagination.totalPages);
      }
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý';
      case 'shipped':
        return 'Đang giao';
      case 'delivered':
        return 'Đã giao';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  // Chuẩn hóa dữ liệu biểu đồ để tránh lỗi khi BE chưa trả về mảng
  const rawOrdersByDay = stats?.ordersByDay ?? [];
  const rawRevenueByMonth = stats?.revenueByMonth ?? [];

  // Xây mảng đủ 7 ngày (kể cả ngày không có đơn -> count = 0)
  const ordersByDay = (() => {
    const days: { label: string; count: number }[] = [];
    const today = new Date();
    // Duyệt từ 6 ngày trước tới hôm nay
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const day = d.getDate();
      const found = rawOrdersByDay.find(
        (x) => x._id.year === year && x._id.month === month && x._id.day === day,
      );
      const label = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      days.push({
        label,
        count: found?.count ?? 0,
      });
    }
    return days;
  })();


  // Xây mảng 6 tháng gần nhất (kể cả tháng không có doanh thu -> total = 0)
  const revenueByMonth = (() => {
    const months: { label: string; total: number; raw: typeof rawRevenueByMonth[number] | null }[] = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const found = rawRevenueByMonth.find(
        (x) => x._id.year === year && x._id.month === month,
      ) || null;
      const label = `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
      months.push({
        label,
        total: found?.total ?? 0,
        raw: found,
      });
    }
    return months;
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Tổng quan</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Tổng sản phẩm</h3>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
            </div>
            <FiPackage className="w-12 h-12 text-primary-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Tổng đơn hàng</h3>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
            </div>
            <FiShoppingCart className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Tổng người dùng</h3>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
            </div>
            <FiUsers className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Doanh thu</h3>
              <p className="text-3xl font-bold text-gray-900">
                {stats ? formatCurrency(stats.totalRevenue) : '0₫'}
              </p>
            </div>
            <FiDollarSign className="w-12 h-12 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Biểu đồ tổng quan đơn hàng & doanh thu */}
      {stats && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Orders by Status - donut style */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tỷ lệ đơn theo trạng thái</h2>
            <div className="flex flex-col items-center gap-6">
              <div className="relative w-48 h-48">
                {(() => {
                  const values = [
                    stats.ordersByStatus.pending,
                    stats.ordersByStatus.shipped,
                    stats.ordersByStatus.delivered,
                    stats.ordersByStatus.cancelled,
                  ];
                  const total = values.reduce((a, b) => a + b, 0) || 1;
                  const percentages = values.map((v) => (v / total) * 100);
                  const colors = ['#facc15', '#3b82f6', '#22c55e', '#ef4444'];

                  let offset = 0;
                  const radius = 17;
                  const circumference = 2 * Math.PI * radius;

                  return (
                    <svg viewBox="0 0 40 40" className="w-full h-full">
                      {percentages.map((pct, idx) => {
                        const length = (pct / 100) * circumference;
                        const dashArray = `${length} ${circumference - length}`;
                        const circle = (
                          <circle
                            key={idx}
                            cx="20"
                            cy="20"
                            r={radius}
                            fill="transparent"
                            stroke={colors[idx]}
                            strokeWidth="6"
                            strokeDasharray={dashArray}
                            strokeDashoffset={offset}
                          />
                        );
                        offset -= length;
                        return circle;
                      })}
                      {/* Inner circle for donut effect */}
                      <circle cx="20" cy="20" r="11" fill="#ffffff" />
                      <text
                        x="50%"
                        y="50%"
                        dominantBaseline="middle"
                        textAnchor="middle"
                        className="text-xs font-semibold"
                        fill="#111827"
                      >
                        {stats.totalOrders} đơn
                      </text>
                    </svg>
                  );
                })()}
              </div>
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-yellow-400" />
                    <span className="text-base text-gray-700">Chờ xử lý</span>
                  </div>
                  <span className="text-base font-semibold text-gray-900">
                    {stats.ordersByStatus.pending} đơn
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-base text-gray-700">Đang giao</span>
                  </div>
                  <span className="text-base font-semibold text-gray-900">
                    {stats.ordersByStatus.shipped} đơn
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-base text-gray-700">Đã giao</span>
                  </div>
                  <span className="text-base font-semibold text-gray-900">
                    {stats.ordersByStatus.delivered} đơn
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-base text-gray-700">Đã hủy</span>
                  </div>
                  <span className="text-base font-semibold text-gray-900">
                    {stats.ordersByStatus.cancelled} đơn
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gray-500" />
                    <span className="text-base text-gray-700">Đã trả hàng</span>
                  </div>
                  <span className="text-base font-semibold text-gray-900">
                    {stats.ordersByStatus.returned} đơn
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Orders last 7 days - bar chart */}
          <div className="bg-white rounded-lg shadow px-6 pt-6 pb-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Số đơn 7 ngày gần nhất</h2>
            <p className="text-sm text-gray-500 mb-3">
              Mỗi cột (màu <span className="font-semibold text-blue-600">xanh dương</span>) biểu diễn số đơn trong một ngày.
            </p>
            {ordersByDay.length > 0 ? (
              <>
                <div className="mt-4 h-80 flex items-end justify-between gap-3">
                  {(() => {
                    const maxCount = Math.max(...ordersByDay.map((x) => x.count), 1);
                    return ordersByDay.map((d, idx) => {
                      const heightPx = (d.count / maxCount) * 200; // tối đa ~200px
                      const isZero = d.count === 0;
                      return (
                        <div key={idx} className="flex flex-col items-center justify-end group">
                          {/* Số đơn trên đỉnh cột */}
                          <span className="mb-1 text-base font-semibold text-gray-800">
                            {d.count}
                          </span>
                          <div
                            className={`w-10 rounded-t-md transition-all ${isZero ? 'bg-gray-300' : 'bg-blue-500 group-hover:bg-blue-600'
                              }`}
                            style={{ height: `${Math.max(heightPx, 8)}px` }}
                          />
                          <span className="mt-1 text-sm text-gray-700 font-medium">{d.label}</span>
                        </div>
                      );
                    });
                  })()}
                </div>
                {(() => {
                  const totalOrders7 = ordersByDay.reduce((sum, d) => sum + d.count, 0);
                  return (
                    <p className="mt-3 text-base text-gray-700">
                      Tổng <span className="font-semibold">{totalOrders7}</span> đơn trong 7 ngày gần nhất.
                    </p>
                  );
                })()}
              </>
            ) : (
              <p className="text-sm text-gray-500 italic">Chưa có dữ liệu đơn hàng trong 7 ngày gần nhất.</p>
            )}
          </div>

          {/* Revenue by month - bar chart */}
          <div className="bg-white rounded-lg shadow px-6 pt-6 pb-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Doanh thu theo tháng</h2>
            <p className="text-sm text-gray-500 mb-3">
              Mỗi cột (màu <span className="font-semibold text-emerald-600">xanh lá</span>) biểu diễn tổng doanh thu của từng tháng.
            </p>
            {revenueByMonth.length > 0 ? (
              <>
                <div className="mt-4 h-80 flex items-end justify-between gap-3">
                  {(() => {
                    const maxTotal = Math.max(...revenueByMonth.map((x) => x.total), 1);
                    return revenueByMonth.map((m, idx) => {
                      const heightPx = (m.total / maxTotal) * 200; // tối đa ~200px
                      const isZero = m.total === 0;
                      return (
                        <div key={idx} className="flex flex-col items-center justify-end group">
                          {/* Giá trị doanh thu (rút gọn, đơn vị triệu) */}
                          <span className="mb-1 text-base font-semibold text-gray-800">
                            {m.total === 0 ? '0' : `${(m.total / 1_000_000).toFixed(1)}M`}
                          </span>
                          <div
                            className={`w-10 rounded-t-md transition-all ${isZero ? 'bg-gray-300' : 'bg-emerald-500 group-hover:bg-emerald-600'
                              }`}
                            style={{ height: `${Math.max(heightPx, 8)}px` }}
                          />
                          <span className="mt-1 text-sm text-gray-700 font-medium">{m.label}</span>
                        </div>
                      );
                    });
                  })()}
                </div>
                {(() => {
                  const totalRevenueAll = revenueByMonth.reduce((sum, m) => sum + m.total, 0);
                  return (
                    <p className="mt-3 text-base text-gray-700">
                      Tổng doanh thu khoảng{' '}
                      <span className="font-semibold">
                        {totalRevenueAll === 0 ? '0' : formatCurrency(totalRevenueAll)}
                      </span>{' '}
                      trong 6 tháng gần nhất.
                    </p>
                  );
                })()}
              </>
            ) : (
              <p className="text-sm text-gray-500 italic">Chưa có dữ liệu doanh thu theo tháng.</p>
            )}
          </div>
        </div>
      )}

      {/* Recent Orders (with pagination) */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Tất cả đơn hàng (mới nhất)</h2>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Chưa có đơn hàng nào</p>
        ) : (
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
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => {
                  const customerName = order.customerInfo?.fullName ||
                    (order.userId ? `${order.userId.firstName} ${order.userId.lastName}` : 'N/A');
                  return (
                    <tr key={order._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
                          {getStatusLabel(order.orderStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {recentTotalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Trang {recentPage} / {recentTotalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setRecentPage((p) => Math.max(1, p - 1))}
                disabled={recentPage === 1}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Trước
              </button>
              <button
                onClick={() => setRecentPage((p) => Math.min(recentTotalPages, p + 1))}
                disabled={recentPage === recentTotalPages}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
