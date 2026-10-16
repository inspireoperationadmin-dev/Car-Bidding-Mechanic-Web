import { apiClient } from "./client";

export interface Bid {
  id: number;
  requestId: number;
  mechanicId: number;
  price: number;
  status: "ACTIVE" | "SELECTED" | "REJECTED" | "WITHDRAWN" | "PENDING";
  notes?: string;
  durationDays: number;
  durationHours: number;
  appointmentDates?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PlaceBidDto {
  requestId: number;
  price: number;
  estimatedDurationDays: number;
  estimatedDurationHours: number;
  notes?: string;
}

export interface UpdateBidDto {
  price?: number;
  estimatedDurationDays?: number;
  estimatedDurationHours?: number;
  notes?: string;
  status?: string;
  appointmentDates?: string[];
}

export interface GetBidsFilters {
  mechanicId?: number;
  requestId?: number;
  status?: string;
  limit?: number;
  offset?: number;
}

export const bidsApi = {
  // 1. Create Bid
  placeBid: (data: PlaceBidDto) => {
    return apiClient.post<{ success: boolean; data: Bid }>("/bids", data);
  },

  // 2. Get Bids for a specific Request (For Comparison View)
  getBidsByRequestId: (requestId: number) => {
    return apiClient.get<{ success: boolean; data: Bid[] }>(`/bids/request/${requestId}`);
  },

  // 3. Get My Bids (For MyBids Page)
  getMyBids: (params?: GetBidsFilters) => {
    return apiClient.get<{ success: boolean; data: Bid[] }>("/bids/my-bids", { params });
  },

  // 4. Get Single Bid for Request (My Bid for a Job)
  getMyBidForRequest: (requestId: number) => {
    return apiClient.get<{ success: boolean; data: Bid[] }>(`/bids/request/${requestId}`);
  },

  // 5. Update Bid (For Edit Modal)
  updateBid: (bidId: number, data: UpdateBidDto) => {
    return apiClient.put<{ success: boolean; data: Bid }>(`/bids/${bidId}`, data);
  },
};
