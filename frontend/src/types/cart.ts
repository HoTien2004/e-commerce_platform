// Cart types
export interface CartItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    images: Array<{
      url: string;
      isPrimary: boolean;
    }>;
    stock: number;
  };
  quantity: number;
  price: number;
  addedAt: string;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartData {
  productId: string;
  quantity?: number;
}

export interface UpdateCartItemData {
  productId: string;
  quantity: number;
}

