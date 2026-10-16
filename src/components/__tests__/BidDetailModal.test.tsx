import { screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BidDetailModal } from "../bids/BidDetailModal";
import { renderWithProviders } from "../../utils/test-utils";
import { type Bid, BidStatus } from "../../store/slices/bidSlice";

// Mock Bid
const mockBid: Bid = {
  id: 1,
  requestId: 101,
  mechanicId: 5,
  price: 150,
  status: BidStatus.ACTIVE,
  durationDays: 2,
  durationHours: 0,
  notes: "My proposal notes",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock Job State
const preloadedState = {
  jobs: {
    selectedJob: {
      id: 101,
      carModel: "Toyota Camry",
      year: 2020,
      licensePlate: "WP CAB-1234",
      status: "OPEN" as const,
      description: "Brake issue",
      maxPrice: 500,
      deadline: new Date(Date.now() + 86400000).toISOString(),
      location: "Colombo",
      damageType: "Mechanical",
      images: [],
    },
    availableJobs: [],
    total: 0,
    page: 1,
    limit: 10,
    filters: {
      search: "",
      minPrice: 0,
      maxPrice: 0,
      locationRadius: 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    loading: false,
    error: null,
  },
};

describe("BidDetailModal Component", () => {
  it("does not render when open is false", () => {
    renderWithProviders(<BidDetailModal open={false} onClose={vi.fn()} bid={mockBid} />);
    expect(screen.queryByText("Bid Details #1")).not.toBeInTheDocument();
  });

  it("renders bid details correctly when open", () => {
    renderWithProviders(<BidDetailModal open={true} onClose={vi.fn()} bid={mockBid} />, {
      preloadedState,
    });

    expect(screen.getByText("Bid Details #1")).toBeInTheDocument();
    expect(screen.getByText("€150")).toBeInTheDocument();
    expect(screen.getByText(/My proposal notes/i)).toBeInTheDocument();
    expect(screen.getByText(/Toyota Camry/i)).toBeInTheDocument();
  });

  it("switches to Edit Mode when Edit button is clicked", () => {
    renderWithProviders(<BidDetailModal open={true} onClose={vi.fn()} bid={mockBid} />, {
      preloadedState,
    });

    fireEvent.click(screen.getByRole("button", { name: /Edit Bid/i }));
    expect(screen.getByRole("button", { name: /Update Bid/i })).toBeInTheDocument();
  });
});
