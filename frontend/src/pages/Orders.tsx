import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { orderService } from '../services/orderService';
import type { Order } from '../types/order';
import { FiPackage, FiClock, FiTruck, FiCheckCircle, FiXCircle, FiRefreshCw, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { scrollToTop } from '../utils/scrollToTop';

const statusConfig = {
    pending: {
        label: 'Chờ xác nhận',
        icon: FiClock,
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    },
    shipped: {
        label: 'Chờ giao hàng',
        icon: FiTruck,
        color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    delivered: {
        label: 'Đã giao',
        icon: FiCheckCircle,
        color: 'text-green-600 bg-green-50 border-green-200',
    },
    cancelled: {
        label: 'Đã hủy',
        icon: FiXCircle,
        color: 'text-red-600 bg-red-50 border-red-200',
    },
    returned: {
        label: 'Trả hàng',
        icon: FiRefreshCw,
        color: 'text-gray-600 bg-gray-50 border-gray-200',
    },
};

const Orders = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const itemsPerPage = 10;

    useEffect(() => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để xem đơn hàng');
            navigate('/');
            return;
        }
        loadOrders();
    }, [isAuthenticated, currentPage, selectedStatus, navigate]);

    useEffect(() => {
        scrollToTop();
    }, [currentPage]);

    const loadOrders = async () => {
        try {
            setIsLoading(true);
            const params: any = {
                page: currentPage,
                limit: itemsPerPage,
            };
            if (selectedStatus !== 'all') {
                params.status = selectedStatus;
            }

            const response = await orderService.getOrders(params);
            if (response.success) {
                setOrders(response.data.orders);
                setTotalPages(response.data.pagination.totalPages);
            }
        } catch (error: any) {
            console.error('Error loading orders:', error);
            toast.error(error.response?.data?.message || 'Không thể tải danh sách đơn hàng');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelOrder = async (orderId: string) => {
        if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
            return;
        }

        try {
            const response = await orderService.cancelOrder(orderId);
            if (response.success) {
                toast.success('Hủy đơn hàng thành công!');
                loadOrders();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể hủy đơn hàng');
        }
    };

    const getStatusConfig = (status: Order['orderStatus']) => {
        return statusConfig[status] || statusConfig.pending;
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-[1200px] mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Đơn hàng của tôi</h1>
                </div>

                {/* Status filter */}
                <div className="mb-6 w-full flex justify-between gap-2">
                    <button
                        onClick={() => {
                            setSelectedStatus('all');
                            setCurrentPage(1);
                        }}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${selectedStatus === 'all'
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Tất cả
                    </button>
                    {Object.entries(statusConfig).map(([status, config]) => {
                        const Icon = config.icon;
                        return (
                            <button
                                key={status}
                                onClick={() => {
                                    setSelectedStatus(status);
                                    setCurrentPage(1);
                                }}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${selectedStatus === status
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {config.label}
                            </button>
                        );
                    })}
                </div>

                {/* Orders list */}
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-gray-600">Đang tải đơn hàng...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-2">Chưa có đơn hàng nào</p>
                        <p className="text-gray-600 mb-6">Bắt đầu mua sắm ngay để xem đơn hàng của bạn tại đây</p>
                        <Link
                            to="/"
                            className="inline-block btn-primary"
                        >
                            Mua sắm ngay
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            const statusInfo = getStatusConfig(order.orderStatus);
                            const StatusIcon = statusInfo.icon;

                            return (
                                <div
                                    key={order._id}
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Đơn hàng: {order.orderNumber}
                                                </h3>
                                                <span
                                                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}
                                                >
                                                    <StatusIcon className="w-3 h-3" />
                                                    {statusInfo.label}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                Đặt ngày: {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-primary-600">
                                                {order.total.toLocaleString('vi-VN')}₫
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {order.items.length} sản phẩm
                                            </p>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 pt-4 mb-4">
                                        <div className="space-y-2">
                                            {order.items.slice(0, 3).map((item) => {
                                                const product = typeof item.productId === 'object' ? item.productId : null;
                                                const primaryImage = product?.images?.find((img) => img.isPrimary) || product?.images?.[0];

                                                return (
                                                    <div key={item._id} className="flex items-center gap-3">
                                                        {primaryImage ? (
                                                            <div className="flex-shrink-0 w-12 h-12 bg-primary-50 rounded-lg overflow-hidden border-2 border-primary-600">
                                                                <img
                                                                    src={primaryImage.url}
                                                                    alt={item.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="flex-shrink-0 w-12 h-12 bg-primary-50 rounded-lg border-2 border-primary-600 flex items-center justify-center">
                                                                <span className="text-xs text-gray-400">No Image</span>
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {item.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                x{item.quantity} · {item.price.toLocaleString('vi-VN')}₫
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {order.items.length > 3 && (
                                                <p className="text-sm text-gray-500 italic">
                                                    +{order.items.length - 3} sản phẩm khác
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-600">
                                            <p>Địa chỉ giao hàng: {order.shippingAddress}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link
                                                to={`/orders/${order.orderNumber}`}
                                                onClick={() => scrollToTop()}
                                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium flex items-center gap-2"
                                            >
                                                <FiEye className="w-4 h-4" />
                                                Xem chi tiết
                                            </Link>
                                            {order.orderStatus === 'pending' && (
                                                <button
                                                    onClick={() => handleCancelOrder(order._id)}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                                >
                                                    Hủy đơn
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                        <button
                            onClick={() => {
                                setCurrentPage((prev) => Math.max(1, prev - 1));
                            }}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Trước
                        </button>
                        <span className="px-4 py-2 text-sm text-gray-700">
                            Trang {currentPage}/{totalPages}
                        </span>
                        <button
                            onClick={() => {
                                setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                            }}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Sau
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
