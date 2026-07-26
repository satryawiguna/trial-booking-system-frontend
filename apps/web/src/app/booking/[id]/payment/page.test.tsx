// Integration test — Payment page (TS-004 Complete Successful Payment,
// EC-003 Payment Failure [recoverable], EC-004 Last-Seat Race Condition
// [non-recoverable]). Mocks `bookingService`/`trialClassService` (the
// boundary the page's hooks/handlers talk to) — see
// apps/web/src/app/page.test.tsx for the repo-wide mocking rationale.
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ApiClientError } from "@shared/services/apiClient";
import { BookingStatus, PaymentStatus } from "@shared/types";
import type { Booking, TrialClass } from "@shared/types";

const push = jest.fn();
const replace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
  useParams: () => ({ id: "booking-1" }),
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
import PaymentPage from "./page";

const mockedGetTrialClass = trialClassService.getById as jest.Mock;
const mockedGetBooking = bookingService.getById as jest.Mock;
const mockedSubmitPayment = bookingService.submitPayment as jest.Mock;

const trialClass: TrialClass = {
  id: "class-1",
  title: "Beginner Mathematics",
  capacity: 4,
  availableSeats: 1,
  startTime: "2026-08-01T10:00:00Z",
};

const pendingBooking: Booking = {
  bookingId: "booking-1",
  status: BookingStatus.PENDING_PAYMENT,
  studentId: "student-1",
  trialClassId: trialClass.id,
};

describe("Payment Page (TS-004 / EC-003 / EC-004)", () => {
  beforeEach(() => {
    push.mockClear();
    replace.mockClear();
    mockedGetTrialClass.mockReset();
    mockedGetBooking.mockReset();
    mockedSubmitPayment.mockReset();
    mockedGetTrialClass.mockResolvedValue(trialClass);
  });

  it("navigates to the booking status page when payment succeeds (TS-004)", async () => {
    mockedGetBooking.mockResolvedValueOnce(pendingBooking);
    mockedSubmitPayment.mockResolvedValueOnce({
      paymentAttemptId: "pay-1",
      paymentStatus: PaymentStatus.SUCCESS,
      bookingStatus: BookingStatus.CONFIRMED,
    });

    render(<PaymentPage />);
    const cta = await screen.findByRole("button", {
      name: "Confirm Registration →",
    });
    await userEvent.click(cta);

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/booking/booking-1/status");
    });
  });

  it("shows an inline decline banner and re-enables the CTA on a recoverable payment failure (EC-003)", async () => {
    mockedGetBooking.mockResolvedValueOnce(pendingBooking);
    mockedSubmitPayment.mockResolvedValueOnce({
      paymentAttemptId: "pay-2",
      paymentStatus: PaymentStatus.FAILED,
      bookingStatus: BookingStatus.PAYMENT_FAILED,
    });

    render(<PaymentPage />);
    const cta = await screen.findByRole("button", {
      name: "Confirm Registration →",
    });
    await userEvent.click(cta);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Payment was declined. You can try again.");

    // Stays on the Payment page — no navigation — and the CTA is re-enabled.
    expect(push).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Confirm Registration →" }),
    ).toBeEnabled();
  });

  it("navigates to the status page with a reason on a non-recoverable 409 (EC-004 last-seat race)", async () => {
    mockedGetBooking.mockResolvedValueOnce(pendingBooking);
    mockedSubmitPayment.mockRejectedValueOnce(
      new ApiClientError(
        409,
        "CAPACITY_EXCEEDED",
        "This class just filled up.",
      ),
    );

    render(<PaymentPage />);
    const cta = await screen.findByRole("button", {
      name: "Confirm Registration →",
    });
    await userEvent.click(cta);

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        "/booking/booking-1/status?reason=CAPACITY_EXCEEDED",
      );
    });
  });
});
