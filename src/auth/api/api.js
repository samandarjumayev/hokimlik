import axios from "axios";

const URL = "http://docnarpay.evodevtech.uz/api";

// 🔹 instance
export const baseURL = axios.create({
  baseURL: URL,
  timeout: 10000,
});

// 🔐 REQUEST INTERCEPTOR
baseURL.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 🔄 REFRESH TOKEN LOGIC
let isRefreshing = false;
let failedQueue = [];

// queue handler
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// 🔐 RESPONSE INTERCEPTOR
baseURL.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // ❗ agar 401 bo‘lsa
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve,
            reject,
          });
        })
          .then((token) => {
            originalRequest.headers.Authorization =
              "Bearer " + token;
            return baseURL(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refresh = localStorage.getItem("refresh");

      try {
        const res = await axios.post(
          `${URL}/v1/auth/refresh/`,
          {
            refresh,
          }
        );

        const newAccess = res.data.access;

        localStorage.setItem("access", newAccess);

        processQueue(null, newAccess);

        originalRequest.headers.Authorization =
          "Bearer " + newAccess;

        return baseURL(originalRequest);
      } catch (err) {
        processQueue(err, null);

        // ❌ refresh ham ishlamadi → logout
        localStorage.clear();
        window.location.href = "/login";

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);