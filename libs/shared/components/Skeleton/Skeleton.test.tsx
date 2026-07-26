import { render, screen } from "@testing-library/react";

import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("is accessible as a status region announcing loading", () => {
    render(<Skeleton />);
    const el = screen.getByRole("status", { name: "Loading" });
    expect(el).toBeInTheDocument();
  });

  it.each([["text"], ["card"], ["image"], ["circle"]] as const)(
    "renders the %s variant",
    (variant) => {
      render(<Skeleton variant={variant} />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    },
  );

  it("merges a custom className", () => {
    render(<Skeleton className="w-20" />);
    expect(screen.getByRole("status")).toHaveClass("w-20");
  });
});
