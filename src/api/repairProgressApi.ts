import { apiClient } from "./client";

export enum RepairStage {
  VEHICLE_RECEIVED = "VEHICLE_RECEIVED",
  DISASSEMBLY = "DISASSEMBLY",
  PARTS_ORDERED = "PARTS_ORDERED",
  REPAIR_IN_PROGRESS = "REPAIR_IN_PROGRESS",
  PAINTING = "PAINTING",
  QUALITY_INSPECTION = "QUALITY_INSPECTION",
  COMPLETED_READY_FOR_PICKUP = "COMPLETED_READY_FOR_PICKUP",
}

export interface RepairMilestone {
  id: number;
  requestId: number;
  mechanicId: number;
  stage: RepairStage;
  title: string;
  description?: string;
  photoUrls?: string[];
  estimatedCompletionDate?: string | null;
  durationDays?: number | null;
  durationHours?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface LogRepairProgressDto {
  stage: RepairStage;
  title: string;
  description?: string;
  photoUrls?: string[];
  estimatedCompletionDate?: string;
  durationDays?: number;
  durationHours?: number;
}

export interface RepairProgressResponse {
  request: any;
  milestones: RepairMilestone[];
  currentStage: RepairStage | null;
}

export const repairProgressApi = {
  // GET /api/requests/:id/repair-progress
  getRepairProgress: async (requestId: number) => {
    const response = await apiClient.get<{ success: boolean; data: RepairProgressResponse }>(
      `/requests/${requestId}/repair-progress`
    );
    return response.data.data;
  },

  // POST /api/requests/:id/repair-progress
  logRepairProgress: async (requestId: number, data: LogRepairProgressDto) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: RepairMilestone;
    }>(`/requests/${requestId}/repair-progress`, data);
    return response.data.data;
  },
};
