import { screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BidTable } from "../bids/BidTable";
import { renderWithProviders } from "../../utils/test-utils";
import { type Bid, BidStatus } from "../../store/slices/bidSlice";

// Mock Data
const mockBids: Bid[] = [
  {
    id: 1,
    requestId: 101,
    mechanicId: 5,
    price: 150,
    status: BidStatus.ACTIVE,
    durationDays: 2,
    durationHours: 0,
    notes: "Test Note",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe("BidTable Component", () => {
  it('renders "No bids found" when list is empty', () => {
    renderWithProviders(<BidTable bids={[]} loading={false} onView={vi.fn()} />);
    expect(screen.getByText(/No bids found/i)).toBeInTheDocument();
  });

  it("renders loading spinner when loading is true", () => {
    renderWithProviders(<BidTable bids={[]} loading={true} onView={vi.fn()} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders bid data correctly", () => {
    renderWithProviders(<BidTable bids={mockBids} loading={false} onView={vi.fn()} />);

    expect(screen.getByText("Request #101")).toBeInTheDocument();
    expect(screen.getByText("€150")).toBeInTheDocument();
  });

  // ✅ IMPROVED TEST: Specific selector using accessible name
  it("triggers onView when View button is clicked", () => {
    const handleView = vi.fn();
    renderWithProviders(<BidTable bids={mockBids} loading={false} onView={handleView} />);

    // Now we select the specific button using the aria-label we added
    const viewButton = screen.getByRole("button", { name: /View bid for request 101/i });
    fireEvent.click(viewButton);

    expect(handleView).toHaveBeenCalledWith(101);
  });
});
