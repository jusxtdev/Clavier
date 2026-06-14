import { create } from 'zustand';
import api from '../api/axios';

export const useCartStore = create((set, get) => ({
  cart: null,
  isLoading: false,

  getItemCount: () => {
    const cart = get().cart;
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  },

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/cart');
      set({ cart: response.data.data, isLoading: false });
    } catch (error) {
      set({ cart: null, isLoading: false });
    }
  },

  clearCart: () => {
    set({ cart: null });
  },
}));