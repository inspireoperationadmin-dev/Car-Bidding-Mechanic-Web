import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import mechanicReducer from "./slices/mechanicSlice";
import jobsReducer from "./slices/jobsSlice";
import bidReducer from "./slices/bidSlice";
import notificationsReducer from "./slices/notificationsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    mechanic: mechanicReducer,
    jobs: jobsReducer,
    bids: bidReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
