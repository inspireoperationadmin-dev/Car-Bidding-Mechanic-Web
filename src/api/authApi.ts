import { apiClient } from "./client";

export const authApi = {
  login: (credentials: any) => {
    return apiClient.post("/auth/login", credentials);
  },
  register: (userData: any) => {
    return apiClient.post("/auth/register", userData);
  },
  sendOtp: (payload: { email: string; phoneNo: string }) => {
    return apiClient.post("/auth/send-otp", payload);
  },
  getCurrentUser: () => {
    return apiClient.get("/auth/me");
  },
  resetPassword: (token: string, data: any) => {
    return apiClient.post(`/auth/reset-password/${token}`, data);
  },
  // For requesting a password reset email
  requestPasswordReset: (email: string) => {
    return apiClient.post("/auth/password-reset", { email });
  },
  // For logged-in users to change their password
  changePassword: (data: any) => {
    return apiClient.put("/auth/change-password", data);
  },
  logout: () => {
    // Clear local storage as session is client-side with JWT
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    return Promise.resolve();
  },
};
