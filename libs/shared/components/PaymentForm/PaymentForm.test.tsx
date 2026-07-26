import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PaymentForm } from "./PaymentForm";
import type { PaymentFormRegistrant } from "./PaymentForm.types";

const registrant: PaymentFormRegistrant = {
  parentName: "Jane Smith",
  studentName: "Emily Smith",
  grade: "Grade 1",
  phoneNumber: "+62 812 3456 7890",
  email: "jane@email.com",
};

describe("PaymentForm", () => {
  it("renders the mock payment info banner with the documented copy", () => {
    render(<PaymentForm registrant={registrant} onSubmit={jest.fn()} />);
    expect(screen.getByText("Mock Payment")).toBeInTheDocument();
    expect(
      screen.getByText(
        "This is a simulated payment for demo purposes. Click below to process it.",
      ),
    ).toBeInTheDocument();
  });

  it("renders the read-only registrant details", () => {
    render(<PaymentForm registrant={registrant} onSubmit={jest.fn()} />);
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Emily Smith")).toBeInTheDocument();
    expect(screen.getByText("Grade 1")).toBeInTheDocument();
    expect(screen.getByText("+62 812 3456 7890")).toBeInTheDocument();
    expect(screen.getByText("jane@email.com")).toBeInTheDocument();
  });

  it("renders the default CTA label and calls onSubmit when clicked", async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn();
    render(<PaymentForm registrant={registrant} onSubmit={handleSubmit} />);

    const cta = screen.getByRole("button", { name: "Confirm Registration →" });
    await user.click(cta);
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("shows a loading state on the CTA while submitting", () => {
    render(
      <PaymentForm registrant={registrant} isSubmitting onSubmit={jest.fn()} />,
    );
    expect(
      screen.getByRole("button", { name: "Confirm Registration →" }),
    ).toBeDisabled();
  });
});
