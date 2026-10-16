import { apiClient } from "./client";

export interface MechanicProfile {
  id: number;
  userId: number;
  businessName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  businessAddress: string;
  licenseNumber: string;
  insurancePolicyNo: string;
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  rating: number;
  ratingCount: number;
  isActive: boolean;
  profilePic?: string;
  description?: string;
  googlePlaceId?: string | null;
  googleRating?: number | null;
  googleRatingCount?: number | null;
  googleReviews?: any;
}

export const mechanicsApi = {
  getProfile: async (): Promise<MechanicProfile> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: MechanicProfile }>(
        "/mechanics/profile"
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      throw error; // Let the component handle it
    }
  },

  updateProfile: async (data: FormData) => {
    const response = await apiClient.patch<{ success: boolean; data: MechanicProfile }>(
      "/mechanics/profile",
      data,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data.data;
  },

  submitVerification: async (formData: FormData) => {
    const response = await apiClient.post("/mechanics/verify", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  getDashboardData: async () => {
    const response = await apiClient.get<{ success: boolean; data: any }>("/mechanics/dashboard");
    return response.data.data;
  },

  getPortfolio: async (): Promise<PortfolioItem[]> => {
    const response = await apiClient.get<{ success: boolean; data: PortfolioItem[] }>(
      "/mechanics/portfolio"
    );
    return response.data.data;
  },

  uploadPortfolioPhoto: async (formData: FormData) => {
    const response = await apiClient.post<{ success: boolean; data: PortfolioItem }>(
      "/mechanics/portfolio",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data.data;
  },

  deletePortfolioPhoto: async (id: number) => {
    const response = await apiClient.delete<{ success: boolean }>(`/mechanics/portfolio/${id}`);
    return response.data;
  },

  syncGoogleReviews: async (mechanicId: number) => {
    const response = await apiClient.post<{ success: boolean; data: any }>(
      `/mechanics/${mechanicId}/sync-google-reviews`
    );
    return response.data.data;
  },
};

export interface PortfolioItem {
  id: number;
  mechanicId: number;
  url: string;
  fileName?: string;
  createdAt?: string;
}
