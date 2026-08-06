import axios from "axios";

export const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Ajout automatique du JWT
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("kirei_admin_token") ||
      localStorage.getItem("kirei_assistant_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Gestion simple des erreurs d'auth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Session expirée ou token invalide");
    }

    return Promise.reject(error);
  }
);

export default api;
