import axios, { type InternalAxiosRequestConfig, type AxiosError } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_BASE || 'http://localhost:3001/api',
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
  config.headers = config.headers || {};
  // Optional legacy bearer token support
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // Inject admin api key header if defined in env
  const adminKey = import.meta.env.VITE_ADMIN_API_KEY;
  if (adminKey) config.headers['x-admin-key'] = adminKey;
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

export default api;
