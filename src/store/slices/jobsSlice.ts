import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { jobsApi, type JobFilterParams } from "../../api/jobsApi";
import type { RootState } from "../store";

// --- TYPES ---
export interface Job {
  id: number;
  carModel: string;
  year: number;
  licensePlate: string;
  damageType: string;
  description: string;
  maxPrice: number;
  location: string;
  distance?: string;
  biddingRadiusKm?: number;
  deadline: string;
  status: "OPEN" | "ASSIGNED" | "COMPLETED" | "CANCELLED";
  images: string[];
}

export interface JobFiltersState {
  search: string;
  locationRadius: number;
  minPrice: number;
  maxPrice: number;
  location: string;
  deadline: string;
}

interface JobsState {
  availableJobs: Job[];
  selectedJob: Job | null;
  total: number;
  page: number;
  limit: number;
  filters: JobFiltersState;
  loading: boolean;
  error: string | null;
}

// Initial State
const initialState: JobsState = {
  availableJobs: [],
  selectedJob: null,
  total: 0,
  page: 1,
  limit: 10,
  filters: {
    search: "",
    locationRadius: 50,
    minPrice: 0,
    maxPrice: 20000,
    location: "All",
    deadline: "",
  },
  loading: false,
  error: null,
};

// --- ASYNC THUNKS ---

// 1. Fetch Available Jobs (Supports Pagination & Filters)
export const fetchAvailableJobs = createAsyncThunk(
  "jobs/fetchAvailable",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const { page, limit, filters } = state.jobs;

      const params: JobFilterParams = {
        page,
        limit,
        search: filters.search,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        deadlineBefore: filters.deadline,
        radiusKm: filters.locationRadius,
        location: filters.location === "All" ? undefined : filters.location,
      };

      const response = await jobsApi.getAvailableJobs(params);

      // Map API Response (AvailableJobDto) to UI Model (Job)
      const jobsArray = response.data?.data || [];
      const mappedJobs: Job[] = jobsArray.map((req: any) => ({
        id: req.id,
        carModel: `${req.carBrand} ${req.carModel}`,
        year: req.year,
        licensePlate: req.licensePlate,
        damageType: "Collision", // Default fallback
        description: req.description,
        maxPrice: req.adminMaxPrice || 0,
        location: req.location || "N/A",
        distance: req.distanceKm
          ? `${req.distanceKm}km`
          : req.distance
            ? `${req.distance}km`
            : undefined,
        biddingRadiusKm: req.biddingRadiusKm || 25,
        deadline: req.biddingDeadline || new Date().toISOString(),
        status: req.status || "OPEN",
        images: req.images || [],
      }));

      return { data: mappedJobs, total: response.data?.total || 0 };
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch jobs");
    }
  }
);

// 2. Fetch Single Job by ID
export const fetchJobById = createAsyncThunk(
  "jobs/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await jobsApi.getJobDetail(id);
      const req: any = response.data.data; // Fixed: Access nested data property

      // Map API Response to UI Model
      const job: Job = {
        id: req.id,
        carModel: `${req.carBrand} ${req.carModel}`,
        year: parseInt(req.carYear) || 0,
        licensePlate: req.licensePlate || "N/A",
        damageType: "Collision",
        description: req.description,
        maxPrice: req.adminMaxPrice || 0,
        location: req.location || "N/A",
        distance: req.distanceKm
          ? `${req.distanceKm}km`
          : req.distance
            ? `${req.distance}km`
            : undefined,
        biddingRadiusKm: req.biddingRadiusKm || 25,
        deadline: req.biddingDeadline || new Date().toISOString(),
        status: req.status,
        images: req.images || [],
      };

      return job;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch job details");
    }
  }
);

// --- SLICE ---
const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setFilters(state, action: PayloadAction<Partial<JobFiltersState>>) {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1; // Reset to page 1 on filter change
    },
    resetFilters(state) {
      state.filters = initialState.filters;
      state.page = 1;
    },
    clearSelectedJob(state) {
      state.selectedJob = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Available Jobs
      .addCase(fetchAvailableJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.availableJobs = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchAvailableJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Job By ID
      .addCase(fetchJobById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedJob = action.payload;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// --- ACTIONS & SELECTORS ---
export const { setPage, setFilters, resetFilters, clearSelectedJob } = jobsSlice.actions;

export const selectAllJobs = (state: RootState) => state.jobs.availableJobs;
export const selectJobDetail = (state: RootState) => state.jobs.selectedJob;
export const selectJobsLoading = (state: RootState) => state.jobs.loading;
export const selectJobsError = (state: RootState) => state.jobs.error;
export const selectJobsPagination = (state: RootState) => ({
  page: state.jobs.page,
  total: state.jobs.total,
  limit: state.jobs.limit,
});
export const selectJobFilters = (state: RootState) => state.jobs.filters;

export default jobsSlice.reducer;
