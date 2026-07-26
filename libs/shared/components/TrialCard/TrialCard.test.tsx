import { render, screen, fireEvent } from "@testing-library/react";

import type { TrialClass } from "@shared/types";

import { TrialCard } from "./TrialCard";

const openClass: TrialClass = {
  id: "11111111-1111-1111-1111-111111111111",
  title: "Beginner Mathematics",
  capacity: 4,
  availableSeats: 4,
  startTime: "2026-08-01T10:00:00Z",
};

const lowSeatsClass: TrialClass = {
  ...openClass,
  id: "22222222-2222-2222-2222-222222222222",
  availableSeats: 2,
};

const fullClass: TrialClass = {
  ...openClass,
  id: "33333333-3333-3333-3333-333333333333",
  availableSeats: 0,
};

describe("TrialCard", () => {
  it("renders the trial class title and seat availability", () => {
    render(<TrialCard trialClass={openClass} onClick={jest.fn()} />);
    expect(screen.getByText("Beginner Mathematics")).toBeInTheDocument();
    expect(screen.getByText("4 / 4 seats available")).toBeInTheDocument();
  });

  it("shows a 'Full' ribbon and 'Class is Full' CTA when the class is full", () => {
    render(<TrialCard trialClass={fullClass} onClick={jest.fn()} />);
    expect(screen.getAllByText("Full").length).toBeGreaterThan(0);
    expect(screen.getByText("Class is Full")).toBeInTheDocument();
  });

  it("shows the 'View Details →' CTA when the class is available", () => {
    render(<TrialCard trialClass={openClass} onClick={jest.fn()} />);
    expect(screen.getByText("View Details →")).toBeInTheDocument();
  });

  it("renders as a clickable button role and calls onClick when available", () => {
    const handleClick = jest.fn();
    render(<TrialCard trialClass={openClass} onClick={handleClick} />);

    const card = screen.getByRole("button");
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("supports keyboard activation (Enter) when available", () => {
    const handleClick = jest.fn();
    render(<TrialCard trialClass={openClass} onClick={handleClick} />);

    fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders as a non-interactive article and does not call onClick when full", () => {
    const handleClick = jest.fn();
    render(<TrialCard trialClass={fullClass} onClick={handleClick} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    const card = screen.getByRole("article");
    fireEvent.click(card);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("shows the amber/pending seat label when seats are low but not full", () => {
    render(<TrialCard trialClass={lowSeatsClass} onClick={jest.fn()} />);
    const label = screen.getByText("2 / 4 seats available");
    expect(label).toHaveClass("text-pending-text");
  });

  it("shows the green/success seat label when seats are plentiful", () => {
    render(<TrialCard trialClass={openClass} onClick={jest.fn()} />);
    const label = screen.getByText("4 / 4 seats available");
    expect(label).toHaveClass("text-success-text");
  });

  it("shows the red/danger seat label and 'Full' text when at capacity", () => {
    render(<TrialCard trialClass={fullClass} onClick={jest.fn()} />);
    const labels = screen.getAllByText("Full");
    expect(labels.length).toBeGreaterThan(0);
  });

  it("renders without a footer CTA in the row variant (Admin Classes)", () => {
    render(
      <TrialCard trialClass={openClass} onClick={jest.fn()} variant="row" />,
    );
    expect(screen.queryByText("View Details →")).not.toBeInTheDocument();
  });

  // 6.5: seat-indicator color thresholds at capacity=4, per
  // design-system.md's "Capacity / Seat Indicator Color" —
  //   seatsLeft <= 0 -> red/danger, seatsLeft <= 3 -> amber/pending,
  //   else -> green/success. With capacity fixed at 4 (BR-001), this means
  //   4/4 is the only "comfortable" (green) count and 3/4, 2/4, 1/4 are all
  //   amber — verified explicitly below for every boundary value so a
  //   4-seat class never misleadingly shows green with only 1 seat left.
  describe("seat-indicator color at capacity=4 (design-system.md thresholds)", () => {
    it.each([
      [4, "text-success-text", "4 / 4 seats available"],
      [3, "text-pending-text", "3 / 4 seats available"],
      [2, "text-pending-text", "2 / 4 seats available"],
      [1, "text-pending-text", "1 / 4 seats available"],
    ])(
      "shows %i of 4 seats left as %s",
      (availableSeats, expectedClass, expectedLabel) => {
        render(
          <TrialCard
            trialClass={{ ...openClass, availableSeats }}
            onClick={jest.fn()}
          />,
        );
        const label = screen.getByText(expectedLabel);
        expect(label).toHaveClass(expectedClass);
      },
    );

    it("shows 0 of 4 seats left as red/danger ('Full')", () => {
      render(<TrialCard trialClass={fullClass} onClick={jest.fn()} />);
      // formatSeatsAvailable collapses 0-of-4 to "Full" rather than
      // "0 / 4 seats available" — the danger-colored label is the "Full"
      // ribbon/CTA text asserted in the earlier "Full ribbon" tests. Here we
      // additionally assert the seat-bar label itself carries the danger
      // color class.
      const labels = screen.getAllByText("Full");
      const seatBarLabel = labels.find((el) =>
        el.className.includes("text-danger-text"),
      );
      expect(seatBarLabel).toBeDefined();
    });
  });
});
