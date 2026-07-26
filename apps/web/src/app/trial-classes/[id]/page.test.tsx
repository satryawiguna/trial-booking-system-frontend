// Integration test — Class Detail page (TS-002 View Trial Class Details).
// Mocks `trialClassService` (the boundary `useTrialClass` talks to) — see
// apps/web/src/app/page.test.tsx for the repo-wide mocking rationale.
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { TrialClass } from "@shared/types";

const push = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: jest.fn() }),
  useParams: () => ({ id: "11111111-1111-1111-1111-111111111111" }),
}));

jest.mock("@shared/services/trialClassService", () => ({
  trialClassService: {
    getAll: jest.fn(),
    getById: jest.fn(),
    getRoster: jest.fn(),
  },
}));

import { trialClassService } from "@shared/services/trialClassService";
import ClassDetailPage from "./page";

const mockedGetById = trialClassService.getById as jest.Mock;

const openClass: TrialClass = {
  id: "11111111-1111-1111-1111-111111111111",
  title: "Beginner Mathematics",
  capacity: 4,
  availableSeats: 2,
  startTime: "2026-08-01T10:00:00Z",
};

const fullClass: TrialClass = {
  ...openClass,
  availableSeats: 0,
};

describe("Class Detail Page (TS-002)", () => {
  beforeEach(() => {
    push.mockClear();
    mockedGetById.mockReset();
  });

  it("displays class information, schedule, and remaining seats", async () => {
    mockedGetById.mockResolvedValueOnce(openClass);
    render(<ClassDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Beginner Mathematics")).toBeInTheDocument();
    });
    expect(mockedGetById).toHaveBeenCalledWith(openClass.id);
    expect(screen.getByText("2 / 4 seats available")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Book This Class" }),
    ).toBeEnabled();
  });

  it("disables booking and shows 'Class is Full' when the class has no seats left", async () => {
    mockedGetById.mockResolvedValueOnce(fullClass);
    render(<ClassDetailPage />);

    const cta = await screen.findByRole("button", { name: "Class is Full" });
    expect(cta).toBeDisabled();
  });

  it("navigates to the booking form when 'Book This Class' is clicked", async () => {
    mockedGetById.mockResolvedValueOnce(openClass);
    render(<ClassDetailPage />);

    const cta = await screen.findByRole("button", {
      name: "Book This Class",
    });
    await userEvent.click(cta);

    expect(push).toHaveBeenCalledWith(`/booking?classId=${openClass.id}`);
  });

  it("shows an error state with retry when the request fails", async () => {
    mockedGetById.mockRejectedValueOnce(new Error("network down"));
    render(<ClassDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });
});
