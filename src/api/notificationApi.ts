import { apiClient } from "./client";

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

export const notificationApi = {
  getMyNotifications: async (limit = 20, offset = 0) => {
    const response = await apiClient.get(`/notifications?limit=${limit}&offset=${offset}`);
    // Backend returns: { success: true, data: { notifications: [], unreadCount: 0 }, message: "..." }
    // We need to return the 'data' part which matches the specific structure expected by the slice
    // or return response.data if the slice expects the full wrapper.
    // Looking at slice: const { notifications, unreadCount } = response.data.data;
    // So we should return response.data.
    return response.data;
  },

  markAsRead: async (id: number) => {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await apiClient.patch(`/notifications/read-all`);
    return response.data;
  },

  getPreferences: async () => {
    const response = await apiClient.get(`/notifications/preferences`);
    return response.data;
  },

  updatePreferences: async (data: any) => {
    const response = await apiClient.patch(`/notifications/preferences`, data);
    return response.data;
  },
};
