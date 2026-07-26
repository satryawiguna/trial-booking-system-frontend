// Integration test — Participant Roster page (TS-006 View Trial Class
// Roster). Mocks `trialClassService` (the boundary `useTrialClasses` /
// `useTrialClass` / `useRoster` talk to) — see
// apps/web/src/app/page.test.tsx for the repo-wide mocking rationale (shared
// across both apps for consistency).
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { TrialClass, TrialClassRoster } from "@shared/types";

const push = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: jest.fn() }),
  useParams: () => ({ id: "class-1" }),
}));

jest.mock("@shared/services/trialClassService", () => ({
  trialClassService: {
    getAll: jest.fn(),
    getById: jest.fn(),
    getRoster: jest.fn(),
  },
}));

import { trialClassService } from "@shared/services/trialClassService";
import ParticipantRosterPage from "./page";

const mockedGetAll = trialClassService.getAll as jest.Mock;
const mockedGetById = trialClassService.getById as jest.Mock;
const mockedGetRoster = trialClassService.getRoster as jest.Mock;

const classOne: TrialClass = {
  id: "class-1",
  title: "Beginner Mathematics",
  capacity: 4,
  availableSeats: 2,
  startTime: "2026-08-01T10:00:00Z",
};

const classTwo: TrialClass = {
  id: "class-2",
  title: "Intro to Science",
  capacity: 4,
  availableSeats: 4,
  startTime: "2026-08-02T10:00:00Z",
};

const rosterWithParticipants: TrialClassRoster = {
  trialClassId: "class-1",
  participants: [
    { studentId: "s-1", studentName: "Emily Smith" },
    { studentId: "s-2", studentName: "Liam Johnson" },
  ],
};

const emptyRoster: TrialClassRoster = {
  trialClassId: "class-1",
  participants: [],
};

describe("Participant Roster Page (TS-006)", () => {
  beforeEach(() => {
    push.mockClear();
    mockedGetAll.mockReset();
    mockedGetById.mockReset();
    mockedGetRoster.mockReset();
    mockedGetAll.mockResolvedValue([classOne, classTwo]);
    mockedGetById.mockResolvedValue(classOne);
  });

  it("renders only confirmed participants returned by the roster endpoint", async () => {
    mockedGetRoster.mockResolvedValueOnce(rosterWithParticipants);
    render(<ParticipantRosterPage />);

    await waitFor(() => {
      expect(screen.getByText("Emily Smith")).toBeInTheDocument();
    });
    expect(screen.getByText("Liam Johnson")).toBeInTheDocument();
    expect(screen.getByText("2 Confirmed")).toBeInTheDocument();
    expect(mockedGetRoster).toHaveBeenCalledWith("class-1");
  });

  it("shows an empty state when the class has zero confirmed participants", async () => {
    mockedGetRoster.mockResolvedValueOnce(emptyRoster);
    render(<ParticipantRosterPage />);

    await waitFor(() => {
      expect(screen.getByText("No confirmed participants yet.")).toBeInTheDocument();
    });
    expect(screen.getByText("0 Confirmed")).toBeInTheDocument();
  });

  it("renders one filter chip per class and switches the roster route when another chip is clicked", async () => {
    mockedGetRoster.mockResolvedValueOnce(rosterWithParticipants);
    render(<ParticipantRosterPage />);

    await waitFor(() => {
      expect(screen.getByText("Emily Smith")).toBeInTheDocument();
    });

    const chips = screen.getByRole("group", { name: "Filter by class" });
    expect(chips).toBeInTheDocument();
    const otherChip = screen.getByRole("button", { name: "Intro to Science" });

    await userEvent.click(otherChip);
    expect(push).toHaveBeenCalledWith("/classes/class-2/roster");
  });
});
