export interface OrderItem {
    _id?: string;
    productId: string | {
        _id: string;
        name: string;
        images?: Array<{
            url: string;
            isPrimary?: boolean;
        }>;
    };
    quantity: number;
    price: number;
    name: string;
}

export interface Order {
    _id: string;
    orderNumber: string;
    userId: string | {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
    };
    items: OrderItem[];
    shippingAddress: string;
    shippingFee: number;
    subtotal: number;
    discount: number;
    total: number;
    paymentMethod: 'cod' | 'bank' | 'momo';
    orderStatus: 'pending' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
    promoCode?: string | null;
    notes?: string | null;
    customerInfo: {
        fullName: string;
        phone: string;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface OrdersResponse {
    success: boolean;
    data: {
        orders: Order[];
        pagination: {
            currentPage: number;
            itemsPerPage: number;
            totalItems: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    };
}

export interface OrderResponse {
    success: boolean;
    data: {
        order: Order;
    };
}

export interface CreateOrderRequest {
    shippingAddress: string;
    paymentMethod?: 'cod' | 'bank' | 'momo';
    promoCode?: string;
    notes?: string;
    selectedProductIds?: string[]; // Product IDs to include in order
    customerInfo?: {
        fullName: string;
        phone: string;
        email: string;
    };
}

export interface UpdateOrderStatusRequest {
    orderStatus: 'pending' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
}

