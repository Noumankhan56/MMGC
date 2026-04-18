import axios from "axios";

const API_BASE = "/api";

const authApi = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach JWT to outgoing requests ──
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("mmgc_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: auto-refresh on 401 ──
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(authApi(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("mmgc_refresh_token");
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(`${API_BASE}/auth/refresh`, {
          refreshToken,
        });

        localStorage.setItem("mmgc_access_token", data.accessToken);
        localStorage.setItem("mmgc_refresh_token", data.refreshToken);

        onTokenRefreshed(data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return authApi(originalRequest);
      } catch {
        // Refresh failed — clear tokens and redirect to login
        localStorage.removeItem("mmgc_access_token");
        localStorage.removeItem("mmgc_refresh_token");
        localStorage.removeItem("mmgc_user");
        window.location.href = "/auth/login";
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default authApi;
