import { useState } from 'react';

type OrderStatus =
    | 'all'
    | 'pending_payment'
    | 'shipping'
    | 'waiting_delivery'
    | 'completed'
    | 'cancelled'
    | 'returned'
    | 'refunded';

const statusTabs: { key: OrderStatus; label: string }[] = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending_payment', label: 'Chờ thanh toán' },
    { key: 'shipping', label: 'Vận chuyển' },
    { key: 'waiting_delivery', label: 'Chờ giao hàng' },
    { key: 'completed', label: 'Hoàn thành' },
    { key: 'cancelled', label: 'Đã huỷ' },
    { key: 'returned', label: 'Trả hàng' },
    { key: 'refunded', label: 'Hoàn tiền' },
];

// Temporary mock orders (no BE logic yet)
const mockOrders = [
    {
        id: 'TS-20260001',
        date: '09/01/2026',
        status: 'completed' as OrderStatus,
        total: '25.490.000₫',
        itemsSummary: 'Laptop Gaming ASUS ROG, Chuột Logitech G Pro X Superlight',
    },
    {
        id: 'TS-20260002',
        date: '08/01/2026',
        status: 'shipping' as OrderStatus,
        total: '12.990.000₫',
        itemsSummary: 'Màn hình LG UltraGear 27"',
    },
    {
        id: 'TS-20260003',
        date: '07/01/2026',
        status: 'pending_payment' as OrderStatus,
        total: '1.290.000₫',
        itemsSummary: 'Bàn phím cơ Keychron K2',
    },
];

const Orders = () => {
    const [activeStatus, setActiveStatus] = useState<OrderStatus>('all');

    const filteredOrders =
        activeStatus === 'all'
            ? mockOrders
            : mockOrders.filter((order) => order.status === activeStatus);

    const getStatusLabel = (status: OrderStatus) => {
        const found = statusTabs.find((s) => s.key === status);
        return found ? found.label : status;
    };

    const getStatusBadgeClass = (status: OrderStatus) => {
        switch (status) {
            case 'pending_payment':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'shipping':
            case 'waiting_delivery':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'completed':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'cancelled':
            case 'returned':
            case 'refunded':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto px-4 py-8 md:py-10">
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Đơn hàng của bạn</h1>
                <p className="mt-2 text-sm md:text-base text-gray-600">
                    Theo dõi trạng thái tất cả đơn hàng đã đặt tại TechStore.
                </p>
            </div>

            {/* Status Tabs */}
            <div className="mb-6 md:mb-8">
                <div className="flex flex-wrap justify-between gap-2 border border-gray-200 rounded-full bg-white p-1 w-full">
                    {statusTabs.map((status) => (
                        <button
                            key={status.key}
                            type="button"
                            onClick={() => setActiveStatus(status.key)}
                            className={`flex-1 min-w-[110px] text-center px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm rounded-full font-medium whitespace-nowrap transition-colors ${activeStatus === status.key
                                ? 'bg-primary-600 text-white shadow-sm'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {status.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div className="border border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-500">
                    Hiện chưa có đơn hàng nào ở trạng thái này.
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => (
                        <div
                            key={order.id}
                            className="border border-gray-200 rounded-2xl bg-white p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm md:text-base font-semibold text-gray-900">
                                            Mã đơn: {order.id}
                                        </span>
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                                                order.status,
                                            )}`}
                                        >
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </div>
                                    <p className="text-xs md:text-sm text-gray-500">Ngày đặt: {order.date}</p>
                                    <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
                                        {order.itemsSummary}
                                    </p>
                                </div>
                                <div className="flex flex-col items-start md:items-end gap-2">
                                    <p className="text-sm md:text-base font-semibold text-primary-600">
                                        Tổng: {order.total}
                                    </p>
                                    <button
                                        type="button"
                                        className="text-xs md:text-sm font-medium text-primary-600 hover:text-primary-700"
                                    >
                                        Xem chi tiết
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;


