import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "../../api/authApi";
import type { RootState } from "../store";

// --- TYPES DEFINITION ---

export interface User {
  id: string | number;
  profileId?: number;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  name?: string;
  businessName?: string;
  role: "MECHANIC" | "USER" | "ADMIN";
  avatarUrl?: string;
  phone?: string;
  phoneNo?: string;
  location?: string;
  documentsUploaded?: boolean;
  preferredLanguage?: "ENGLISH" | "FRENCH";
  bio?: string;
  skills?: string[];
  verificationStatus?: "PENDING" | "APPROVED" | "REJECTED";
}
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  address: string;
  postalCode?: string;
  siret?: string;
  vatNumber?: string;
  phone?: string;
  role?: string;
  otp?: string;
}

// Backend Error Format
interface BackendError {
  message?: string;
  errors?: Array<{ msg?: string; message?: string }>;
}

// Auth State Interface
export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const getUserFromStorage = (): User | null => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  token: localStorage.getItem("authToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  user: getUserFromStorage(),
  isAuthenticated: !!localStorage.getItem("authToken"),
  loading: false,
  error: null,
};

// --- ASYNC THUNKS ---

// 1. Login Async
export const loginAsync = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);

      // 👇 DEBUGGING: Backend என்ன அனுப்புகிறது என்று கன்சோலில் பார்க்கவும்
      console.log("LOGIN API RESPONSE:", response.data);

      // 👇 FIX: Data structure-ஐ சரியாக எடுக்கவும் (Register-ல் செய்தது போலவே)
      const data = response.data.data || response.data;
      const { token, refreshToken, user } = data;

      // Token இருக்கிறதா என்று உறுதி செய்யவும்
      if (!token) {
        throw new Error("Token not received from server");
      }

      localStorage.setItem("authToken", token);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
      return { token, refreshToken, user };
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const errorResponse = (err as { response: { data: BackendError } }).response;
        return rejectWithValue(errorResponse?.data?.message || "Login failed");
      }
      return rejectWithValue("Login failed due to network error");
    }
  }
);

// 2. Register Async
export const registerAsync = createAsyncThunk(
  "auth/register",
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authApi.register(userData);
      // Backend returns { success: true, data: { user, token } }
      // Adjust based on your exact backend response structure
      const { token, refreshToken, user } = response.data.data || response.data;

      if (token) {
        localStorage.setItem("authToken", token);
      }
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
      return { token, refreshToken, user };
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const errorResponse = (err as { response: { data: BackendError } }).response;
        console.log("FULL BACKEND ERROR:", errorResponse.data);

        if (errorResponse.data.errors) {
          const errorMessages = errorResponse.data.errors.map((e) => e.msg || e.message).join(", ");
          return rejectWithValue(errorMessages || "Validation Error");
        }
        return rejectWithValue(errorResponse.data.message || "Registration failed");
      }
      return rejectWithValue("Registration failed due to network error");
    }
  }
);

// 2.1 Send OTP Async
export const sendOtpAsync = createAsyncThunk(
  "auth/sendOtp",
  async (payload: { email: string; phone?: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.sendOtp(payload as any);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to send OTP");
    }
  }
);

// 3. Logout Async (Optional: If you need to invalidate token on server)
export const logoutAsync = createAsyncThunk("auth/logout", async (_, { dispatch }) => {
  // If backend has a logout endpoint: await apiClient.post('/auth/logout');
  // For JWT, mostly client-side removal is enough.
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
  dispatch(logout()); // Trigger sync logout reducer
  return;
});

// 4. Fetch Current User (Persist Session)
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getCurrentUser();
      // Backend returns { success: true, data: { user: ... } }
      const { user } = response.data.data;
      return user;
    } catch (err: unknown) {
      return rejectWithValue("Failed to fetch user profile");
    }
  }
);

// --- SLICE ---

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    },
    // ... (setError, clearError, setUser remain seemingly unchanged but need to be careful with context)
    setError(state, action) {
      state.error = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    setUser(state, action) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken || null;
        state.user = action.payload.user;
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Register
      .addCase(registerAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken || null;
        state.user = action.payload.user;
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Current User
      .addCase(fetchCurrentUser.pending, (_state) => {
        // We might not want to show global loading for this background check
        // state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload;
        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        // If token invalid/expired, logout
        state.isAuthenticated = false;
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      });
  },
});

// --- ACTIONS ---
export const { logout, setError, clearError, setUser } = authSlice.actions;

// --- SELECTORS ---
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectToken = (state: RootState) => state.auth.token;

export default authSlice.reducer;
