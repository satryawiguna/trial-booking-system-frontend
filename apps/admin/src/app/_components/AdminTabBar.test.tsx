// Unit test — apps/admin's AdminTabBar (Dashboard / Classes / Participants
// tab row), per design/navigation.md's Admin Navigation section.
import { render, screen } from "@testing-library/react";

let pathname = "/";

jest.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

import { AdminTabBar } from "./AdminTabBar";

describe("AdminTabBar", () => {
  it("renders Dashboard, Classes, and Participants tabs", () => {
    pathname = "/";
    render(<AdminTabBar />);

    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Classes" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Participants" }),
    ).toBeInTheDocument();
  });

  it("marks Dashboard as the active tab on '/'", () => {
    pathname = "/";
    render(<AdminTabBar />);

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("link", { name: "Classes" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("marks Classes as the active tab on '/classes'", () => {
    pathname = "/classes";
    render(<AdminTabBar />);

    expect(screen.getByRole("link", { name: "Classes" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("marks Participants as active on '/participants' and on a resolved '/classes/{id}/roster' route", () => {
    pathname = "/participants";
    const { rerender } = render(<AdminTabBar />);
    expect(
      screen.getByRole("link", { name: "Participants" }),
    ).toHaveAttribute("aria-current", "page");

    pathname = "/classes/class-1/roster";
    rerender(<AdminTabBar />);
    expect(
      screen.getByRole("link", { name: "Participants" }),
    ).toHaveAttribute("aria-current", "page");
  });

  it("links to the correct hrefs", () => {
    pathname = "/";
    render(<AdminTabBar />);

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "Classes" })).toHaveAttribute(
      "href",
      "/classes",
    );
    expect(
      screen.getByRole("link", { name: "Participants" }),
    ).toHaveAttribute("href", "/participants");
  });
});
