// Integration test — Booking Form page (TS-003 Create Trial Booking, EC-001
// Duplicate Booking Attempt). Mocks `trialClassService`/`studentService`/`bookingService`
// (the boundary the page's hooks/handlers talk to) — see
// apps/web/src/app/page.test.tsx for the repo-wide mocking rationale.
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ApiClientError } from "@shared/services/apiClient";
import type { TrialClass } from "@shared/types";

const push = jest.fn();
let searchParams = new URLSearchParams({
  classId: "11111111-1111-1111-1111-111111111111",
});

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: jest.fn() }),
  useSearchParams: () => searchParams,
}));

jest.mock("@shared/services/trialClassService", () => ({
  trialClassService: {
    getAll: jest.fn(),
    getById: jest.fn(),
    getRoster: jest.fn(),
  },
}));

jest.mock("@shared/services/studentService", () => ({
  studentService: {
    create: jest.fn(),
    list: jest.fn(),
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
import { studentService } from "@shared/services/studentService";
import { bookingService } from "@shared/services/bookingService";
import { BookingFormPageContent } from "./BookingFormPageContent";

const mockedGetById = trialClassService.getById as jest.Mock;
const mockedCreateStudent = studentService.create as jest.Mock;
const mockedCreateBooking = bookingService.create as jest.Mock;

const trialClass: TrialClass = {
  id: "11111111-1111-1111-1111-111111111111",
  title: "Beginner Mathematics",
  capacity: 4,
  availableSeats: 2,
  startTime: "2026-08-01T10:00:00Z",
};

async function fillForm() {
  await userEvent.type(
    screen.getByLabelText("Parent / Guardian Name"),
    "Jane Smith",
  );
  await userEvent.type(screen.getByLabelText("Student Name"), "Emily Smith");
  await userEvent.type(
    screen.getByLabelText("Phone Number"),
    "+62 812 3456 7890",
  );
  await userEvent.type(
    screen.getByLabelText("Email Address"),
    "jane@email.com",
  );
  await userEvent.selectOptions(
    screen.getByLabelText("Student Grade"),
    "Grade 1",
  );
}

describe("Booking Form Page (TS-003 / EC-001)", () => {
  beforeEach(() => {
    push.mockClear();
    mockedGetById.mockReset();
    mockedCreateStudent.mockReset();
    mockedCreateBooking.mockReset();
    searchParams = new URLSearchParams({ classId: trialClass.id });
    window.sessionStorage.clear();
  });

  it("submits the booking via two-step flow: POST /students then POST /bookings, and navigates to payment", async () => {
    mockedGetById.mockResolvedValueOnce(trialClass);
    mockedCreateStudent.mockResolvedValueOnce({
      studentId: "student-uuid-1",
    });
    mockedCreateBooking.mockResolvedValueOnce({
      bookingId: "booking-1",
      status: "PENDING_PAYMENT",
    });

    render(<BookingFormPageContent />);
    await screen.findByText("Beginner Mathematics");

    await fillForm();
    await userEvent.click(
      screen.getByRole("button", { name: "Continue to Payment →" }),
    );

    // Step 1: create student from form fields
    await waitFor(() => {
      expect(mockedCreateStudent).toHaveBeenCalledWith({
        parentName: "Jane Smith",
        studentName: "Emily Smith",
        phoneNumber: "+62 812 3456 7890",
        email: "jane@email.com",
        grade: "Grade 1",
      });
    });

    // Step 2: create booking with studentId + trialClassId
    await waitFor(() => {
      expect(mockedCreateBooking).toHaveBeenCalledWith({
        studentId: "student-uuid-1",
        trialClassId: trialClass.id,
      });
    });

    expect(push).toHaveBeenCalledWith("/booking/booking-1/payment");
  });

  it("shows an inline error and keeps field values on a duplicate-booking rejection (EC-001)", async () => {
    mockedGetById.mockResolvedValueOnce(trialClass);
    mockedCreateStudent.mockResolvedValueOnce({
      studentId: "student-uuid-1",
    });
    mockedCreateBooking.mockRejectedValueOnce(
      new ApiClientError(
        409,
        "DUPLICATE_BOOKING",
        "You have already booked this class.",
      ),
    );

    render(<BookingFormPageContent />);
    await screen.findByText("Beginner Mathematics");

    await fillForm();
    await userEvent.click(
      screen.getByRole("button", { name: "Continue to Payment →" }),
    );

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("You have already booked this class.");

    // Fields retain their values — no reset, no navigation.
    expect(screen.getByLabelText("Parent / Guardian Name")).toHaveValue(
      "Jane Smith",
    );
    expect(screen.getByLabelText("Student Name")).toHaveValue("Emily Smith");
    expect(push).not.toHaveBeenCalled();
  });
});
