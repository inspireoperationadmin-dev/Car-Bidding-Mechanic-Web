import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { bidsApi } from "../../api/bidsApi";
import type { Bid, PlaceBidDto, UpdateBidDto, GetBidsFilters } from "../../api/bidsApi";
export type { Bid, PlaceBidDto, UpdateBidDto, GetBidsFilters };
import type { RootState } from "../store";

// --- TYPES DEFINITION ---

export const BidStatus = {
  ACTIVE: "ACTIVE",
  SELECTED: "SELECTED",
  REJECTED: "REJECTED",
  WITHDRAWN: "WITHDRAWN",
  PENDING: "PENDING",
} as const;

export type BidStatus = (typeof BidStatus)[keyof typeof BidStatus];

// Types are now imported from src/api/bids.ts

interface BackendError {
  message?: string;
  errors?: Array<{ msg?: string; message?: string }>;
}

// --- STATE INTERFACE ---
export interface BidState {
  bids: Bid[];
  currentBid: Bid | null;
  jobBids: Bid[]; // Stores all bids for a specific job (Comparison View)
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: BidState = {
  bids: [],
  currentBid: null,
  jobBids: [],
  loading: false,
  error: null,
  successMessage: null,
};

// --- ASYNC THUNKS ---

export const placeBidAsync = createAsyncThunk(
  "bids/placeBid",
  async (bidData: PlaceBidDto, { rejectWithValue }) => {
    try {
      const response = await bidsApi.placeBid(bidData);
      return response.data.data;
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const errorResponse = (err as { response: { data: BackendError } }).response;
        if (errorResponse.data.errors) {
          const errorMessages = errorResponse.data.errors.map((e) => e.msg || e.message).join(", ");
          return rejectWithValue(errorMessages);
        }
        return rejectWithValue(errorResponse.data.message || "Failed to place bid");
      }
      return rejectWithValue("Network error occurred while placing bid");
    }
  }
);

export const fetchBidsAsync = createAsyncThunk(
  "bids/fetchBids",
  async (filters: GetBidsFilters, { rejectWithValue }) => {
    try {
      const response = await bidsApi.getMyBids(filters);
      return response.data.data;
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const errorResponse = (err as { response: { data: BackendError } }).response;
        return rejectWithValue(errorResponse?.data?.message || "Failed to fetch bids");
      }
      return rejectWithValue("Network error occurred");
    }
  }
);

export const fetchBidsForRequestAsync = createAsyncThunk(
  "bids/fetchForRequest",
  async (requestId: number, { rejectWithValue, getState }) => {
    try {
      const response = await bidsApi.getMyBidForRequest(requestId);
      const bids = response.data.data as Bid[];

      const state = getState() as RootState;
      const mechanicId = state.auth.user?.profileId;

      if (!mechanicId) return null;

      const myBid = bids.find((b) => String(b.mechanicId) === String(mechanicId));
      return myBid || null;
    } catch (err: unknown) {
      // Error handling suppressed for cleaner UI, or map to generic error
      return rejectWithValue("Failed to fetch request bids" + err);
    }
  }
);

export const updateBidAsync = createAsyncThunk(
  "bids/updateBid",
  async (updateData: { bidId: number } & UpdateBidDto, { rejectWithValue }) => {
    try {
      const { bidId, ...data } = updateData;
      const response = await bidsApi.updateBid(bidId, data);
      return response.data.data;
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const backendErr = err as { response: { status: number; data: BackendError } };

        // ✅ FIX: Handle 403 Deadline Error Specifically
        if (backendErr.response.status === 403) {
          return rejectWithValue("Deadline passed. Cannot update bid.");
        }

        const errorResponse = backendErr.response;
        return rejectWithValue(errorResponse?.data?.message || "bids.errors.updateFailed");
      }
      return rejectWithValue("Network error occurred");
    }
  }
);

// ✅ Fetch ALL Bids for Comparison View
export const fetchJobBidsAsync = createAsyncThunk(
  "bids/fetchJobBids",
  async (requestId: number, { rejectWithValue }) => {
    try {
      const response = await bidsApi.getBidsByRequestId(requestId);
      return response.data.data;
    } catch (err: unknown) {
      return rejectWithValue("Failed to load job bids" + err);
    }
  }
);

// --- SLICE ---

const bidSlice = createSlice({
  name: "bids",
  initialState,
  reducers: {
    clearBidMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
    resetCurrentBid(state) {
      state.currentBid = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Place Bid
      .addCase(placeBidAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(placeBidAsync.fulfilled, (state, action: PayloadAction<Bid>) => {
        state.loading = false;
        state.successMessage = "Bid placed successfully!";
        state.currentBid = action.payload;
        state.bids.unshift(action.payload);
      })
      .addCase(placeBidAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Bids (My Bids)
      .addCase(fetchBidsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBidsAsync.fulfilled, (state, action: PayloadAction<Bid[]>) => {
        state.loading = false;
        state.bids = action.payload;
      })
      .addCase(fetchBidsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Single Bid for Request (My Bid for a Job)
      .addCase(fetchBidsForRequestAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBidsForRequestAsync.fulfilled, (state, action: PayloadAction<Bid | null>) => {
        state.loading = false;
        state.currentBid = action.payload;
      })
      .addCase(fetchBidsForRequestAsync.rejected, (state, action) => {
        state.loading = false;
        console.error("Fetch bid error:", action.payload);
      })

      // Update Bid
      .addCase(updateBidAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBidAsync.fulfilled, (state, action: PayloadAction<Bid>) => {
        state.loading = false;
        state.successMessage = "Bid updated successfully!";
        state.currentBid = action.payload;
        // Update in list
        const index = state.bids.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.bids[index] = action.payload;
        }
      })
      .addCase(updateBidAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ Fetch Job Bids (Comparison)
      .addCase(fetchJobBidsAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobBidsAsync.fulfilled, (state, action: PayloadAction<Bid[]>) => {
        state.loading = false;
        state.jobBids = action.payload;
      })
      .addCase(fetchJobBidsAsync.rejected, (state, action) => {
        state.loading = false;
        console.error("Failed to load transparent bids", action.payload);
      });
  },
});

export const { clearBidMessages, resetCurrentBid } = bidSlice.actions;

// --- SELECTORS ---
export const selectAllBids = (state: RootState) => state.bids.bids;
export const selectCurrentBid = (state: RootState) => state.bids.currentBid;
export const selectBidLoading = (state: RootState) => state.bids.loading;
export const selectBidError = (state: RootState) => state.bids.error;
export const selectBidSuccess = (state: RootState) => state.bids.successMessage;
export const selectJobBids = (state: RootState) => state.bids.jobBids; // New Selector for Comparison

export default bidSlice.reducer;
