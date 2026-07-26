// Unit test — apps/admin's AppNavbar composition wrapper around the shared
// Navbar in link mode. Mirrors apps/web's AppNavbar test: verifies the
// Admin View role switch renders with "Admin View" as an active client-side
// <Link> to "/" and "Parent View" as a cross-app <a href> to the parent app
// on port 3000.
import { render, screen } from "@testing-library/react";

import { AppNavbar } from "./AppNavbar";

describe("apps/admin AppNavbar", () => {
  it("renders both role-switch options with Admin View active", () => {
    render(<AppNavbar />);

    // Active "Admin View" is a next/link to home (dashboard).
    const adminLink = screen.getByRole("link", { name: "Admin View" });
    expect(adminLink).toHaveAttribute("href", "/");
    expect(adminLink).toHaveAttribute("aria-pressed", "true");

    // Inactive "Parent View" is a native <a> to the parent app.
    const parentLink = screen.getByRole("link", { name: "Parent View" });
    expect(parentLink).toHaveAttribute(
      "href",
      expect.stringContaining("localhost:3000"),
    );
    expect(parentLink).toHaveAttribute("aria-pressed", "false");
  });

  it("renders no buttons in the role switch (link mode)", () => {
    render(<AppNavbar />);
    const buttons = screen.queryAllByRole("button");
    expect(buttons).toHaveLength(0);
  });
});
