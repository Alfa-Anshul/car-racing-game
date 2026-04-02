import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((config) => {
  try {
    const stored = JSON.parse(localStorage.getItem('racing-auth') || '{}');
    const token = stored?.state?.token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

export default api;
