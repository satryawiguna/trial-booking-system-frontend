import { render, screen } from "@testing-library/react";

import { BookingStatus } from "@shared/types";

import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it.each([
    [BookingStatus.PENDING_PAYMENT, "Pending"],
    [BookingStatus.CONFIRMED, "Confirmed"],
    [BookingStatus.PAYMENT_FAILED, "Payment Failed"],
    [BookingStatus.CANCELLED, "Cancelled"],
  ])("renders the %s label", (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("uses the success color classes for a confirmed booking", () => {
    render(<StatusBadge status={BookingStatus.CONFIRMED} />);
    expect(screen.getByText("Confirmed")).toHaveClass(
      "bg-success-bg",
      "text-success-text",
    );
  });

  it("uses the danger color classes for a payment-failed booking", () => {
    render(<StatusBadge status={BookingStatus.PAYMENT_FAILED} />);
    expect(screen.getByText("Payment Failed")).toHaveClass(
      "bg-danger-bg",
      "text-danger-text",
    );
  });

  it("uses the danger color classes for a cancelled booking", () => {
    render(<StatusBadge status={BookingStatus.CANCELLED} />);
    expect(screen.getByText("Cancelled")).toHaveClass(
      "bg-danger-bg",
      "text-danger-text",
    );
  });

  it("uses the pending/amber color classes for a pending-payment booking", () => {
    render(<StatusBadge status={BookingStatus.PENDING_PAYMENT} />);
    expect(screen.getByText("Pending")).toHaveClass(
      "bg-pending-bg",
      "text-pending-text",
    );
  });
});
