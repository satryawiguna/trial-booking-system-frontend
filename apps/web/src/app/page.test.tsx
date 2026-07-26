// Integration test — Trial Class List page (TS-001 View Available Trial
// Classes). Mocks `trialClassService` (the boundary the `useTrialClasses`
// hook talks to) rather than `fetch`/MSW — see the sibling test files' file
// header for the repo-wide rationale (no MSW dependency is installed in this
// repo; mocking the service module keeps these tests consistent with the
// existing `libs/shared` unit-test style while still exercising the real
// page -> hook -> service wiring end to end).
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { TrialClass } from "@shared/types";

const push = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: jest.fn() }),
}));

jest.mock("@shared/services/trialClassService", () => ({
  trialClassService: {
    getAll: jest.fn(),
    getById: jest.fn(),
    getRoster: jest.fn(),
  },
}));

import { trialClassService } from "@shared/services/trialClassService";
import TrialClassListPage from "./page";

const mockedGetAll = trialClassService.getAll as jest.Mock;

const openClass: TrialClass = {
  id: "11111111-1111-1111-1111-111111111111",
  title: "Beginner Mathematics",
  capacity: 4,
  availableSeats: 2,
  startTime: "2026-08-01T10:00:00Z",
};

const fullClass: TrialClass = {
  id: "22222222-2222-2222-2222-222222222222",
  title: "Intro to Science",
  capacity: 4,
  availableSeats: 0,
  startTime: "2026-08-02T10:00:00Z",
};

describe("Trial Class List Page (TS-001)", () => {
  beforeEach(() => {
    push.mockClear();
    mockedGetAll.mockReset();
  });

  it("displays available classes with remaining seat information", async () => {
    mockedGetAll.mockResolvedValueOnce([openClass, fullClass]);
    render(<TrialClassListPage />);

    await waitFor(() => {
      expect(screen.getByText("Beginner Mathematics")).toBeInTheDocument();
    });
    expect(screen.getByText("Intro to Science")).toBeInTheDocument();
    expect(screen.getByText("2 / 4 seats available")).toBeInTheDocument();
  });

  it("clearly identifies fully booked classes and does not let them be clicked", async () => {
    mockedGetAll.mockResolvedValueOnce([openClass, fullClass]);
    render(<TrialClassListPage />);

    await waitFor(() => {
      expect(screen.getByText("Intro to Science")).toBeInTheDocument();
    });

    const fullCard = screen.getByRole("article", {
      name: /Intro to Science/,
    });
    expect(fullCard).toBeInTheDocument();
    expect(screen.getAllByText("Full").length).toBeGreaterThan(0);

    await userEvent.click(fullCard);
    expect(push).not.toHaveBeenCalled();
  });

  it("navigates to the class detail page when an available class is clicked", async () => {
    mockedGetAll.mockResolvedValueOnce([openClass, fullClass]);
    render(<TrialClassListPage />);

    const openCard = await screen.findByRole("button", {
      name: /Beginner Mathematics/,
    });
    await userEvent.click(openCard);

    expect(push).toHaveBeenCalledWith(
      `/trial-classes/${openClass.id}`,
    );
  });

  it("shows an empty state when no trial classes are available", async () => {
    mockedGetAll.mockResolvedValueOnce([]);
    render(<TrialClassListPage />);

    await waitFor(() => {
      expect(
        screen.getByText(
          "No trial classes are available right now. Please check back later.",
        ),
      ).toBeInTheDocument();
    });
  });

  it("shows an error state with retry when the request fails", async () => {
    mockedGetAll.mockRejectedValueOnce(new Error("network down"));
    render(<TrialClassListPage />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(
      screen.getByText("Failed to load trial classes. Please try again."),
    ).toBeInTheDocument();
  });
});
