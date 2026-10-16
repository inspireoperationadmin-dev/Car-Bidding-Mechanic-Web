import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { mechanicsApi } from "../../api/mechanicsApi";

export interface VerificationState {
  loading: boolean;
  error: string | null;
  status: "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED";
}

const initialState: VerificationState = {
  loading: false,
  error: null,
  status: "NOT_SUBMITTED",
};

// --- SUBMIT DOCUMENTS THUNK ---
export const submitVerificationAsync = createAsyncThunk(
  "mechanic/submitVerification",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await mechanicsApi.submitVerification(formData);
      return response;
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const errorResponse = (err as { response: { data: { message: string } } }).response;
        return rejectWithValue(errorResponse?.data?.message || "Upload failed");
      }
      return rejectWithValue("Upload failed due to network error");
    }
  }
);

const mechanicSlice = createSlice({
  name: "mechanic",
  initialState,
  reducers: {
    resetStatus(state) {
      state.status = "NOT_SUBMITTED";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitVerificationAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitVerificationAsync.fulfilled, (state) => {
        state.loading = false;
        state.status = "PENDING";
      })
      .addCase(submitVerificationAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetStatus } = mechanicSlice.actions;
export default mechanicSlice.reducer;
