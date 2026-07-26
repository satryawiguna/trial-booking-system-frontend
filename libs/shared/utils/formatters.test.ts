import {
  formatDate,
  formatDateTime,
  formatSeatsAvailable,
  formatTime,
  isTrialClassFull,
} from "./formatters";
import type { TrialClass } from "@shared/types";

describe("formatDate", () => {
  it("formats an ISO date as a human-readable date", () => {
    expect(formatDate("2026-07-25T10:00:00Z")).toBe("Jul 25, 2026");
  });

  it("returns an empty string for an invalid date", () => {
    expect(formatDate("not-a-date")).toBe("");
  });
});

describe("formatTime", () => {
  it("formats an ISO date as a human-readable time", () => {
    expect(formatTime("2026-07-25T10:00:00Z")).toMatch(/10:00/);
  });

  it("returns an empty string for an invalid date", () => {
    expect(formatTime("not-a-date")).toBe("");
  });
});

describe("formatDateTime", () => {
  it("combines date and time", () => {
    expect(formatDateTime("2026-07-25T10:00:00Z")).toBe(
      `${formatDate("2026-07-25T10:00:00Z")}, ${formatTime("2026-07-25T10:00:00Z")}`,
    );
  });

  it("returns an empty string for an invalid date", () => {
    expect(formatDateTime("not-a-date")).toBe("");
  });
});

describe("formatSeatsAvailable", () => {
  it("shows remaining seats when seats are available", () => {
    expect(formatSeatsAvailable(2, 4)).toBe("2 / 4 seats available");
  });

  it("shows 'Full' when there are no seats left", () => {
    expect(formatSeatsAvailable(0, 4)).toBe("Full");
  });

  it("shows 'Full' when seats are somehow negative", () => {
    expect(formatSeatsAvailable(-1, 4)).toBe("Full");
  });
});

describe("isTrialClassFull", () => {
  const baseTrialClass: TrialClass = {
    id: "1",
    title: "Beginner Piano",
    capacity: 4,
    availableSeats: 2,
    startTime: "2026-07-25T10:00:00Z",
  };

  it("returns false when seats are available", () => {
    expect(isTrialClassFull(baseTrialClass)).toBe(false);
  });

  it("returns true when there are no seats left", () => {
    expect(isTrialClassFull({ ...baseTrialClass, availableSeats: 0 })).toBe(
      true,
    );
  });
});
