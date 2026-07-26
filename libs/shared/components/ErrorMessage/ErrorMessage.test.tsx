import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ErrorMessage } from "./ErrorMessage";

describe("ErrorMessage", () => {
  it("renders as an alert with the default heading and given message", () => {
    render(<ErrorMessage message="Failed to load trial classes." />);
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText("Failed to load trial classes."),
    ).toBeInTheDocument();
  });

  it("renders a custom heading when provided", () => {
    render(
      <ErrorMessage heading="Class not found" message="Try another class." />,
    );
    expect(screen.getByText("Class not found")).toBeInTheDocument();
  });

  it("does not render a retry button when onRetry is not provided", () => {
    render(<ErrorMessage message="Network error." />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders a retry button and calls onRetry when clicked", async () => {
    const user = userEvent.setup();
    const handleRetry = jest.fn();
    render(<ErrorMessage message="Network error." onRetry={handleRetry} />);

    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it("supports a custom retry label", () => {
    render(
      <ErrorMessage
        message="Payment failed."
        onRetry={jest.fn()}
        retryLabel="Retry payment"
      />,
    );
    expect(
      screen.getByRole("button", { name: "Retry payment" }),
    ).toBeInTheDocument();
  });
});
