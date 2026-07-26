import { render, screen } from "@testing-library/react";

import { StepIndicator } from "./StepIndicator";

describe("StepIndicator", () => {
  it("renders all three step labels", () => {
    render(<StepIndicator currentStep="details" />);
    expect(screen.getByText("Details")).toBeInTheDocument();
    expect(screen.getByText("Payment")).toBeInTheDocument();
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
  });

  it("marks the current step as the active step via aria-current", () => {
    render(<StepIndicator currentStep="payment" />);
    const activeStep = screen.getByText("2");
    expect(activeStep).toHaveAttribute("aria-current", "step");
  });

  it("marks steps before the current one as done", () => {
    render(<StepIndicator currentStep="payment" />);
    // Step 1 (Details) is done, so it should not carry aria-current.
    expect(screen.getByText("1")).not.toHaveAttribute("aria-current");
  });

  it("marks all steps as done when currentStep is all-done", () => {
    render(<StepIndicator currentStep="all-done" />);
    expect(screen.getByText("1")).toHaveClass("bg-success-text");
    expect(screen.getByText("2")).toHaveClass("bg-success-text");
    expect(screen.getByText("3")).toHaveClass("bg-success-text");
  });
});
