import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { notificationApi } from "../../api/notificationApi";
import type { Notification as ApiNotification } from "../../api/notificationApi";

// --- TYPES ---
export interface Notification extends ApiNotification {}

export interface NotificationPrefs {
  push: boolean;
  email: boolean;
  jobSelected: boolean;
  newBid: boolean;
  payment: boolean;
}

interface NotificationsState {
  items: Notification[];
  unreadCount: number;
  preferences: NotificationPrefs | null;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  preferences: null,
  loading: false,
  error: null,
};

// --- ASYNC THUNKS (API Calls) ---

// 1. Fetch Notifications
export const fetchNotifications = createAsyncThunk("notifications/fetch", async () => {
  const response = await notificationApi.getMyNotifications();
  return response.data; // Expected { notifications: [], unreadCount: number }
});

// 2. Mark as Read
export const markAsRead = createAsyncThunk("notifications/markAsRead", async (id: number) => {
  await notificationApi.markAsRead(id);
  return id;
});

// 3. Mark All as Read
export const markAllAsRead = createAsyncThunk("notifications/markAllAsRead", async () => {
  await notificationApi.markAllAsRead();
});

// --- SLICE ---
const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch notifications";
      })
      // Mark as Read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.items.findIndex((n) => n.id === action.payload);
        if (index !== -1 && !state.items[index].isRead) {
          state.items[index].isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      // Mark All as Read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items.forEach((n) => (n.isRead = true));
        state.unreadCount = 0;
      })
      // Fetch Preferences
      .addCase(fetchPreferences.fulfilled, (state, action) => {
        state.preferences = action.payload;
      })
      // Update Preferences
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.preferences = action.payload;
      });
  },
});

export const { addNotification } = notificationsSlice.actions;

// 4. Fetch Preferences
export const fetchPreferences = createAsyncThunk("notifications/fetchPreferences", async () => {
  const response = await notificationApi.getPreferences();
  return response.data;
});

// 5. Update Preferences
export const updatePreferences = createAsyncThunk(
  "notifications/updatePreferences",
  async (prefs: NotificationPrefs) => {
    const response = await notificationApi.updatePreferences(prefs);
    return response.data;
  }
);

export const selectAllNotifications = (state: { notifications: NotificationsState }) =>
  state.notifications.items;
export const selectUnreadCount = (state: { notifications: NotificationsState }) =>
  state.notifications.unreadCount;
export const selectNotificationsLoading = (state: { notifications: NotificationsState }) =>
  state.notifications.loading;

export default notificationsSlice.reducer;
