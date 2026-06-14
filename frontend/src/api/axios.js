import axios from 'axios';
import { useAuthStore } from '../stores/useAuthStore';

// Use environment variable or fallback to localhost for development
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Response interceptor for 401 errors
// Only redirect to login if user is actually authenticated
// (i.e., we got a 401 after having a valid session)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentUser = useAuthStore.getState().user;
      // Only redirect if user was logged in (has a session that expired)
      // Don't redirect if they were never logged in (fetchUser returning 401)
      if (currentUser) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;