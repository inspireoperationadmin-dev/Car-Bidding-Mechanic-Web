import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || "30000", 10),
  headers: { "Content-Type": "application/json" },
  // ✅ SECURITY: CSRF Protection & Cookies
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

// Request Interceptor: Attach Token
apiClient.interceptors.request.use((config: any) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- ✅ TOKEN REFRESH LOGIC ---
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

// Response Interceptor: Handle 401 Unauthorized (Automatic Token Refresh & Logout)
apiClient.interceptors.response.use(
  (response) => response,
  async (error: any) => {
    const { config, response } = error;
    const originalRequest = config;

    // If we get a 403 Forbidden (Insufficient permissions / verification required)
    // Do NOT log out the user, just reject so the UI can show the restriction
    if (response && response.status === 403) {
      return Promise.reject(error);
    }

    // If we get a 401 Unauthorized
    if (response && response.status === 401) {
      const isLoginRequest = originalRequest.url?.includes("/auth/login");
      const isRefreshRequest = originalRequest.url?.includes("/auth/refresh");

      // If it's not a login or refresh request, try to refresh the token
      if (!isLoginRequest && !isRefreshRequest) {
        if (!isRefreshing) {
          isRefreshing = true;
          const refreshToken = localStorage.getItem("refreshToken");

          if (!refreshToken) {
            // No refresh token? Force logout.
            handleLogout();
            return Promise.reject(error);
          }

          try {
            // Try to get a new access token
            // Note: We use a fresh axios instance to avoid interceptor loops
            const refreshResponse = await axios.post(
              `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"}/auth/refresh`,
              {
                refreshToken,
              }
            );

            const { token, refreshToken: newRefreshToken } = refreshResponse.data.data;

            // Save new tokens
            localStorage.setItem("authToken", token);
            if (newRefreshToken) {
              localStorage.setItem("refreshToken", newRefreshToken);
            }

            isRefreshing = false;
            onRefreshed(token);

            // Retry the original request
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          } catch (refreshError) {
            isRefreshing = false;
            handleLogout();
            return Promise.reject(refreshError);
          }
        }

        // If refresh is already in progress, wait for it to finish
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      // If it WAS a login request that failed, just pass the error
      if (isLoginRequest) {
        return Promise.reject(error);
      }

      // If it WAS a refresh request that failed, logout
      if (isRefreshRequest) {
        handleLogout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Helper for forced logout
function handleLogout() {
  console.warn("Session expired. Logging out...");
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");

  if (!window.location.pathname.includes("/login")) {
    window.location.href = "/login";
  }
}

export default apiClient;
