import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { BookingFormFields } from "@shared/types";

import { BookingForm } from "./BookingForm";

const emptyValues: BookingFormFields = {
  parentName: "",
  studentName: "",
  phoneNumber: "",
  email: "",
  grade: "",
};

const filledValues: BookingFormFields = {
  parentName: "Jane Smith",
  studentName: "Emily Smith",
  phoneNumber: "+62 812 3456 7890",
  email: "jane@email.com",
  grade: "Grade 1",
};

describe("BookingForm", () => {
  it("renders all five fields", () => {
    render(
      <BookingForm
        values={emptyValues}
        onChange={jest.fn()}
        onSubmit={jest.fn()}
      />,
    );
    expect(screen.getByLabelText("Parent / Guardian Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Student Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Phone Number")).toBeInTheDocument();
    expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
    expect(screen.getByLabelText("Student Grade")).toBeInTheDocument();
  });

  it("disables the submit button until all fields are filled", () => {
    render(
      <BookingForm
        values={emptyValues}
        onChange={jest.fn()}
        onSubmit={jest.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Continue to Payment →" }),
    ).toBeDisabled();
  });

  it("enables the submit button once all fields are filled", () => {
    render(
      <BookingForm
        values={filledValues}
        onChange={jest.fn()}
        onSubmit={jest.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Continue to Payment →" }),
    ).toBeEnabled();
  });

  it("calls onChange with the field name and new value when typing", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(
      <BookingForm
        values={emptyValues}
        onChange={handleChange}
        onSubmit={jest.fn()}
      />,
    );

    await user.type(screen.getByLabelText("Parent / Guardian Name"), "J");
    expect(handleChange).toHaveBeenCalledWith("parentName", "J");
  });

  it("calls onSubmit when the form is submitted while valid", async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn();
    render(
      <BookingForm
        values={filledValues}
        onChange={jest.fn()}
        onSubmit={handleSubmit}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Continue to Payment →" }),
    );
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("renders field-level error messages", () => {
    render(
      <BookingForm
        values={filledValues}
        errors={{ email: "Enter a valid email address." }}
        onChange={jest.fn()}
        onSubmit={jest.fn()}
      />,
    );
    expect(
      screen.getByText("Enter a valid email address."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email Address")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("renders the submitError banner above the fields", () => {
    render(
      <BookingForm
        values={filledValues}
        submitError="This student already has a confirmed booking for this class."
        onChange={jest.fn()}
        onSubmit={jest.fn()}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      /already has a confirmed booking/i,
    );
  });

  it("shows a loading state and disables the submit button while submitting", () => {
    render(
      <BookingForm
        values={filledValues}
        isSubmitting
        onChange={jest.fn()}
        onSubmit={jest.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Continue to Payment →" }),
    ).toBeDisabled();
  });
});
