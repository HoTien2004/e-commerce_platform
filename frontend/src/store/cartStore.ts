import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, Cart } from '../types/cart';

interface CartState {
  cart: Cart | null;
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  setCart: (cart: Cart) => void;
  addItem: (item: CartItem) => void;
  updateItem: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  setLoading: (loading: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      items: [],
      total: 0,
      itemCount: 0,
      isLoading: false,

      setCart: (cart) => {
        set({
          cart,
          items: cart.items || [],
          total: cart.total || 0,
          itemCount: cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
        });
      },

      addItem: (item) => {
        const { items } = get();
        const existingItemIndex = items.findIndex(
          (i) => i.productId._id === item.productId._id
        );

        let newItems: CartItem[];
        if (existingItemIndex > -1) {
          // Update quantity if item exists
          newItems = items.map((i, index) =>
            index === existingItemIndex
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          );
        } else {
          // Add new item
          newItems = [...items, item];
        }

        const newTotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

        set({
          items: newItems,
          total: newTotal,
          itemCount: newItemCount,
        });
      },

      updateItem: (productId, quantity) => {
        const { items } = get();
        const newItems = items
          .map((item) => {
            const itemProductId = typeof item.productId === 'string' ? item.productId : item.productId._id;
            return itemProductId === productId ? { ...item, quantity } : item;
          })
          .filter((item) => item.quantity > 0); // Remove if quantity is 0

        const newTotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

        set({
          items: newItems,
          total: newTotal,
          itemCount: newItemCount,
        });
      },

      removeItem: (productId) => {
        const { items } = get();
        const newItems = items.filter((item) => {
          const itemProductId = typeof item.productId === 'string' ? item.productId : item.productId._id;
          return itemProductId !== productId;
        });

        const newTotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

        set({
          items: newItems,
          total: newTotal,
          itemCount: newItemCount,
        });
      },

      clearCart: () => {
        set({
          cart: null,
          items: [],
          total: 0,
          itemCount: 0,
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        total: state.total,
        itemCount: state.itemCount,
      }),
    }
  )
);

