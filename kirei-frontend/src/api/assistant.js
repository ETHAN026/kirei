import axios from 'axios';
import { API_BASE } from './client';

const assistantApi = axios.create({
  baseURL: `${API_BASE}/api`,
});

assistantApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('kirei_assistant_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

assistantApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && window.location.pathname.startsWith('/assistant')) {
      localStorage.removeItem('kirei_assistant_token');
      if (window.location.pathname !== '/assistant/login') {
        window.location.href = '/assistant/login';
      }
    }
    return Promise.reject(err);
  }
);

export const assistantLogin = (email, password) =>
  assistantApi.post('/assistant-auth/login', { email, password }).then((r) => r.data);
export const assistantMe = () => assistantApi.get('/assistant-auth/me').then((r) => r.data);
export const assistantGetRendezVous = (params) =>
  assistantApi.get('/assistant/rendez-vous', { params }).then((r) => r.data);

export default assistantApi;
