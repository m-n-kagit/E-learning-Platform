import axios from "axios";

axios.defaults.withCredentials = true;

let isRefreshing = false;
let refreshPromise = null;

const shouldSkipRefresh = (config = {}) =>
  config.skipAuthRefresh ||
  config.url?.includes("/api/auth/login") ||
  config.url?.includes("/api/auth/refresh-token");

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;

    if (status !== 401 || shouldSkipRefresh(originalRequest) || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = axios.post(
          "/api/auth/refresh-token",
          {},
          { skipAuthRefresh: true }
        );
      }

      await refreshPromise;
      return axios(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  }
);

