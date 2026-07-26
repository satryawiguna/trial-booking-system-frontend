// Unit test — apps/web's AppNavbar composition wrapper around the shared
// Navbar in link mode. Verifies the Parent View role switch renders with
// "Parent View" as an active client-side <Link> to "/" and "Admin View" as
// a cross-app <a href> to the admin app on port 3001.
import { render, screen } from "@testing-library/react";

import { AppNavbar } from "./AppNavbar";

describe("apps/web AppNavbar", () => {
  it("renders the product name and both role-switch options with Parent View active", () => {
    render(<AppNavbar />);
    expect(screen.getByText("Trial Booking")).toBeInTheDocument();
    expect(screen.getByText("System")).toBeInTheDocument();

    // Active "Parent View" is a next/link to home.
    const parentLink = screen.getByRole("link", { name: "Parent View" });
    expect(parentLink).toHaveAttribute("href", "/");
    expect(parentLink).toHaveAttribute("aria-pressed", "true");

    // Inactive "Admin View" is a native <a> to the admin app.
    const adminLink = screen.getByRole("link", { name: "Admin View" });
    expect(adminLink).toHaveAttribute(
      "href",
      expect.stringContaining("localhost:3001"),
    );
    expect(adminLink).toHaveAttribute("aria-pressed", "false");
  });

  it("renders no buttons in the role switch (link mode)", () => {
    render(<AppNavbar />);
    const buttons = screen.queryAllByRole("button");
    expect(buttons).toHaveLength(0);
  });
});
