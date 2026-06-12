// lib/api.js
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://saddlebrown-lion-880900.hostingersite.com/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ AJOUT : laisser le navigateur gérer le Content-Type pour FormData
    // (il génère automatiquement le bon boundary multipart)
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      config.headers["Content-Type"] = undefined;

      // DEBUG - à retirer après
      console.log("Headers envoyés:", config.headers);
      console.log("FormData entries:");
      for (let [key, val] of config.data.entries()) {
        console.log(" ", key, "→", val);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Intercepteur pour gérer les erreurs 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthRoute =
        window.location.pathname === "/login" ||
        window.location.pathname === "/register";

      // ✅ Ne pas rediriger si on est déjà sur une page d'auth
      // (évite la boucle et le rechargement lors d'un mauvais mot de passe)
      if (!isAuthRoute) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
