import { apiClient } from "./client";

export interface JobFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  deadlineBefore?: string;
  radiusKm?: number;
  location?: string;
}

// TODO: Define strict types based on backend response
export interface JobRequest {
  id: number;
  carBrand: string;
  carModel: string;
  year: number;
  licensePlate: string;
  damageDescription: string;
  status: string;
  images: string[];
  customer: {
    firstName: string;
    lastName: string;
    phoneNo: string;
  };
  locationLat: number;
  locationLng: number;
  createdAt: string;
  expectedPrice?: number;
}

export const jobsApi = {
  // GET /api/requests/available
  getAvailableJobs: async (params: JobFilterParams) => {
    return apiClient.get<{ data: JobRequest[]; total: number }>("/requests/available", { params });
  },

  // GET /api/requests/:id
  getJobDetail: async (id: string | number) => {
    return apiClient.get<{ success: boolean; data: JobRequest }>(`/requests/${id}`);
  },
};
