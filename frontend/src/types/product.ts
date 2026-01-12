// Product types
export interface Product {
    _id: string;
    name: string;
    slug: string;
    description: string;
    specifications?: Array<{
        description: string;
        quantity: string;
        warranty: string;
    }>;
    price: number;
    originalPrice?: number;
    discount: number;
    images: Array<{
        url: string;
        publicId?: string;
        isPrimary: boolean;
    }>;
    category: string;
    brand: string;
    stock: number;
    soldCount?: number;
    status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
    rating: {
        average: number;
        count: number;
    };
    createdAt: string;
    updatedAt: string;
}

export interface ProductsResponse {
    success: boolean;
    data: {
        products: Product[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    };
}

export interface ProductResponse {
    success: boolean;
    data: Product;
}

