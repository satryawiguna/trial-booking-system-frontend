// Unit test — apps/web's ClassSummaryCard (sticky class-summary panel reused
// by the Booking Form and Payment pages).
import { render, screen } from "@testing-library/react";

import type { TrialClass } from "@shared/types";
import { formatDateTime } from "@shared/utils";

import { ClassSummaryCard } from "./ClassSummaryCard";

const trialClass: TrialClass = {
  id: "class-1",
  title: "Beginner Mathematics",
  capacity: 4,
  availableSeats: 2,
  startTime: "2026-08-01T10:00:00Z",
};

describe("ClassSummaryCard", () => {
  it("renders the class title, formatted schedule, and 'Total: Free' line", () => {
    render(<ClassSummaryCard trialClass={trialClass} />);

    expect(screen.getByText("Beginner Mathematics")).toBeInTheDocument();
    expect(
      screen.getByText(formatDateTime(trialClass.startTime)),
    ).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  it("exposes an accessible label for the summary region", () => {
    render(<ClassSummaryCard trialClass={trialClass} />);
    expect(
      screen.getByRole("complementary", { name: "Trial class summary" }),
    ).toBeInTheDocument();
  });
});
