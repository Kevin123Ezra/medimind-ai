import axios from "axios";

// Platform-aware Storage Helper (localStorage for Expo Web/iframe, with in-memory fallback for other platforms)
const inMemoryTokens = {
  accessToken: null as string | null,
  refreshToken: null as string | null,
};

export const tokenStorage = {
  getAccessToken: (): string | null => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem("access_token");
      }
    } catch (e) {
      console.warn("Storage access failed", e);
    }
    return inMemoryTokens.accessToken;
  },
  getRefreshToken: (): string | null => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem("refresh_token");
      }
    } catch (e) {
      console.warn("Storage access failed", e);
    }
    return inMemoryTokens.refreshToken;
  },
  setTokens: (accessToken: string, refreshToken: string) => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("access_token", accessToken);
        window.localStorage.setItem("refresh_token", refreshToken);
      }
    } catch (e) {
      console.warn("Storage write failed", e);
    }
    inMemoryTokens.accessToken = accessToken;
    inMemoryTokens.refreshToken = refreshToken;
  },
  clearTokens: () => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem("access_token");
        window.localStorage.removeItem("refresh_token");
      }
    } catch (e) {
      console.warn("Storage clear failed", e);
    }
    inMemoryTokens.accessToken = null;
    inMemoryTokens.refreshToken = null;
  }
};

// Helper to dynamically normalise the API base URL, ensuring version suffix is appended properly
const getBaseURL = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  const fallback = "https://ais-dev-ykos2peszbuvigz62knxjg-635557335307.europe-west2.run.app/api/v1";
  if (!envUrl) {
    return fallback;
  }
  return envUrl.endsWith("/api") ? `${envUrl}/v1` : envUrl;
};

// Axios instance matching the FastAPI v1 API specification
export const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  }
});

// Request interceptor to automatically inject active JWT Access token
api.interceptors.request.use(
  async (config) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to manage token rotation and automatic refresh upon 401 expiration
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is unauthorized and hasn't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject: (err: any) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) {
        isRefreshing = false;
        tokenStorage.clearTokens();
        return Promise.reject(error);
      }

      try {
        // Call the refresh endpoint to obtain new credentials
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        const { access_token, refresh_token } = response.data;
        // Access token rotation: update client tokens
        tokenStorage.setTokens(access_token, refresh_token || refreshToken);

        processQueue(null, access_token);

        // Retry original request
        originalRequest.headers["Authorization"] = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStorage.clearTokens();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
