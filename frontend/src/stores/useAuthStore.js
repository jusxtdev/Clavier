import { create } from 'zustand';
import api from '../api/axios';

export const useAuthStore = create((set) => ({
  user: null,
  isLoading: false,

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/users/me');
      set({ user: response.data.data, isLoading: false });
    } catch (error) {
      // 401 means not logged in - that's fine, just set user to null
      // Don't call logout() here as that would trigger API call and potential redirect loops
      set({ user: null, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors - we still want to clear local state
    }
    set({ user: null });
  },
}));