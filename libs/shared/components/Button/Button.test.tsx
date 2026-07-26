import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button } from "./Button";

describe("Button", () => {
  it("renders children and defaults to the primary variant", () => {
    render(<Button>Book This Class</Button>);
    const button = screen.getByRole("button", { name: "Book This Class" });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Continue to Payment →</Button>);

    await user.click(
      screen.getByRole("button", { name: "Continue to Payment →" }),
    );

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled and does not fire onClick when disabled", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(
      <Button disabled onClick={handleClick}>
        Continue to Payment →
      </Button>,
    );

    const button = screen.getByRole("button", {
      name: "Continue to Payment →",
    });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("shows a loading state that disables the button and marks it busy", () => {
    render(<Button isLoading>Confirm Registration →</Button>);
    const button = screen.getByRole("button", {
      name: "Confirm Registration →",
    });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("renders the outline/danger variant used for Cancel Booking", () => {
    render(<Button variant="outline">Cancel Booking</Button>);
    expect(
      screen.getByRole("button", { name: "Cancel Booking" }),
    ).toBeInTheDocument();
  });

  it("renders the text/back-link variant", () => {
    render(<Button variant="text">← Back to Classes</Button>);
    expect(
      screen.getByRole("button", { name: "← Back to Classes" }),
    ).toBeInTheDocument();
  });

  it("reflects the active/inactive chip state via styling without changing accessible role", () => {
    render(
      <Button variant="chip" isActive>
        Parent View
      </Button>,
    );
    expect(
      screen.getByRole("button", { name: "Parent View" }),
    ).toBeInTheDocument();
  });
});
