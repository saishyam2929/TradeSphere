import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', credentials);
          localStorage.setItem('token', data.data.token);
          set({
            user: data.data.user,
            token: data.data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          connectSocket();
          return data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', userData);
          localStorage.setItem('token', data.data.token);
          set({
            user: data.data.user,
            token: data.data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          connectSocket();
          return data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {
          // Continue logout even if API fails
        }
        localStorage.removeItem('token');
        disconnectSocket();
        set({ user: null, token: null, isAuthenticated: false });
      },

      fetchProfile: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
          const { data } = await api.get('/auth/profile');
          set({
            user: data.data,
            token,
            isAuthenticated: true,
          });
          connectSocket();
        } catch {
          localStorage.removeItem('token');
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      updateWallet: (balance) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, walletBalance: balance } });
        }
      },
    }),
    {
      name: 'tradesphere-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
