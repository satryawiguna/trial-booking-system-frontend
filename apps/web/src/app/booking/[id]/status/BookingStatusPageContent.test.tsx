// Integration test — Booking Status page (TS-005 View Booking Status,
// TS-007 Cancel Booking). Mocks `bookingService`/`trialClassService` (the
// boundary the page's hooks/handlers talk to) — see
// apps/web/src/app/page.test.tsx for the repo-wide mocking rationale.
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ApiClientError } from "@shared/services/apiClient";
import { BookingStatus } from "@shared/types";
import type { Booking, TrialClass } from "@shared/types";

const push = jest.fn();
let searchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: jest.fn() }),
  useParams: () => ({ id: "booking-1" }),
  useSearchParams: () => searchParams,
}));

jest.mock("@shared/services/trialClassService", () => ({
  trialClassService: {
    getAll: jest.fn(),
    getById: jest.fn(),
    getRoster: jest.fn(),
  },
}));

jest.mock("@shared/services/bookingService", () => ({
  bookingService: {
    create: jest.fn(),
    getById: jest.fn(),
    submitPayment: jest.fn(),
    cancel: jest.fn(),
  },
}));

import { trialClassService } from "@shared/services/trialClassService";
import { bookingService } from "@shared/services/bookingService";
import { BookingStatusPageContent } from "./BookingStatusPageContent";

const mockedGetTrialClass = trialClassService.getById as jest.Mock;
const mockedGetBooking = bookingService.getById as jest.Mock;
const mockedCancel = bookingService.cancel as jest.Mock;

const trialClass: TrialClass = {
  id: "class-1",
  title: "Beginner Mathematics",
  capacity: 4,
  availableSeats: 1,
  startTime: "2026-08-01T10:00:00Z",
};

function booking(status: BookingStatus): Booking {
  return {
    bookingId: "booking-1",
    status,
    studentId: "student-1",
    trialClassId: trialClass.id,
    createdAt: "2026-08-01T10:00:00Z",
  };
}

describe("Booking Status Page (TS-005 / TS-007)", () => {
  beforeEach(() => {
    push.mockClear();
    mockedGetTrialClass.mockReset();
    mockedGetBooking.mockReset();
    mockedCancel.mockReset();
    mockedGetTrialClass.mockResolvedValue(trialClass);
    searchParams = new URLSearchParams();
  });

  it("displays the Confirmed state with a Cancel Booking action", async () => {
    mockedGetBooking.mockResolvedValueOnce(booking(BookingStatus.CONFIRMED));
    render(<BookingStatusPageContent />);

    expect(await screen.findByText("Booking Confirmed!")).toBeInTheDocument();
    expect(screen.getAllByText("Confirmed").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: "Cancel Booking" }),
    ).toBeInTheDocument();
  });

  it("displays the Pending Payment state with no cancel/retry actions", async () => {
    mockedGetBooking.mockResolvedValueOnce(
      booking(BookingStatus.PENDING_PAYMENT),
    );
    render(<BookingStatusPageContent />);

    expect(await screen.findByText("Pending Payment")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Cancel Booking" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Try Payment Again →" }),
    ).not.toBeInTheDocument();
  });

  it("displays the Payment Failed state with a 'Try Payment Again' action", async () => {
    mockedGetBooking.mockResolvedValueOnce(
      booking(BookingStatus.PAYMENT_FAILED),
    );
    render(<BookingStatusPageContent />);

    expect(
      await screen.findByRole("heading", { name: "Payment Failed" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Try Payment Again →" }),
    ).toBeInTheDocument();
  });

  it("displays the Cancelled state with no cancel/retry actions", async () => {
    mockedGetBooking.mockResolvedValueOnce(booking(BookingStatus.CANCELLED));
    render(<BookingStatusPageContent />);

    expect(await screen.findByText("Booking Cancelled")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Cancel Booking" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Try Payment Again →" }),
    ).not.toBeInTheDocument();
  });

  it("re-renders in the Cancelled state in place (no navigation) after a successful cancel (TS-007)", async () => {
    mockedGetBooking
      .mockResolvedValueOnce(booking(BookingStatus.CONFIRMED))
      .mockResolvedValueOnce(booking(BookingStatus.CANCELLED));
    mockedCancel.mockResolvedValueOnce({
      bookingId: "booking-1",
      status: BookingStatus.CANCELLED,
    });

    render(<BookingStatusPageContent />);
    const cancelButton = await screen.findByRole("button", {
      name: "Cancel Booking",
    });
    await userEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByText("Booking Cancelled")).toBeInTheDocument();
    });
    expect(mockedCancel).toHaveBeenCalledWith("booking-1");
    expect(push).not.toHaveBeenCalled();
  });

  it("shows an inline error and keeps the Confirmed state when cancel fails", async () => {
    mockedGetBooking.mockResolvedValueOnce(booking(BookingStatus.CONFIRMED));
    mockedCancel.mockRejectedValueOnce(
      new ApiClientError(
        422,
        "INVALID_TRANSITION",
        "This action is not allowed for the current booking status.",
      ),
    );

    render(<BookingStatusPageContent />);
    const cancelButton = await screen.findByRole("button", {
      name: "Cancel Booking",
    });
    await userEvent.click(cancelButton);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      "This action is not allowed for the current booking status.",
    );
    expect(screen.getByText("Booking Confirmed!")).toBeInTheDocument();
  });
});
