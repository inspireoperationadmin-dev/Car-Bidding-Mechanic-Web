import { screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BidForm } from "../bids/BidForm";
import { renderWithProviders } from "../../utils/test-utils";

describe("BidForm Component", () => {
  it("renders all fields correctly", () => {
    renderWithProviders(<BidForm adminMaxPrice={500} onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/Bid Amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Duration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Notes/i)).toBeInTheDocument();
  });

  it("shows validation error for negative price", async () => {
    const handleSubmit = vi.fn();
    renderWithProviders(<BidForm adminMaxPrice={500} onSubmit={handleSubmit} />);

    // Enter invalid price
    fireEvent.change(screen.getByLabelText(/Bid Amount/i), { target: { value: "-50" } });
    fireEvent.click(screen.getByRole("button", { name: /Submit Bid/i }));

    // Expect validation message (Zod schema min(1))
    await waitFor(() => {
      expect(screen.getByText(/Amount is required/i)).toBeInTheDocument(); // Or whatever Zod message is set for min(1)
    });

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("submits form with valid data", async () => {
    const handleSubmit = vi.fn();
    renderWithProviders(<BidForm adminMaxPrice={500} onSubmit={handleSubmit} />);

    // Fill Form
    fireEvent.change(screen.getByLabelText(/Bid Amount/i), { target: { value: "200" } });
    fireEvent.change(screen.getByLabelText(/Duration/i), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText(/Notes/i), {
      target: { value: "I can fix this easily within 3 days." },
    });

    // Submit
    fireEvent.click(screen.getByRole("button", { name: /Submit Bid/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });
  });

  it("shows warning if price > max budget", async () => {
    renderWithProviders(<BidForm adminMaxPrice={100} onSubmit={vi.fn()} />);

    // Enter High Price
    fireEvent.change(screen.getByLabelText(/Bid Amount/i), { target: { value: "150" } });

    await waitFor(() => {
      expect(screen.getByText(/higher than the client's budget/i)).toBeInTheDocument();
    });
  });
});
