import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../utils/api';

export const useAuthStore = create(persist(
  (set) => ({
    token: null,
    user: null,
    setUser: (user) => set({ user }),
    login: async (username, password) => {
      const { data } = await api.post('/auth/login', { username, password });
      set({ token: data.access_token, user: { username: data.username } });
    },
    register: async (username, email, password) => {
      const { data } = await api.post('/auth/register', { username, email, password });
      set({ token: data.access_token, user: { username: data.username } });
    },
    logout: () => set({ token: null, user: null }),
  }),
  { name: 'auth-storage' }
));