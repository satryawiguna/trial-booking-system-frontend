import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Navbar } from "./Navbar";

describe("Navbar", () => {
  it("renders the product name and both role switch buttons", () => {
    render(<Navbar currentRole="parent" onRoleChange={jest.fn()} />);
    expect(screen.getByText("Trial Booking")).toBeInTheDocument();
    expect(screen.getByText("System")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Parent View" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Admin View" }),
    ).toBeInTheDocument();
  });

  it("marks the current role as pressed", () => {
    render(<Navbar currentRole="admin" onRoleChange={jest.fn()} />);
    expect(screen.getByRole("button", { name: "Admin View" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Parent View" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("calls onRoleChange with the clicked role", async () => {
    const user = userEvent.setup();
    const handleRoleChange = jest.fn();
    render(<Navbar currentRole="parent" onRoleChange={handleRoleChange} />);

    await user.click(screen.getByRole("button", { name: "Admin View" }));
    expect(handleRoleChange).toHaveBeenCalledWith("admin");
  });

  describe("link mode (crossAppUrl)", () => {
    it("renders active role as a next/link to '/' and inactive role as a native <a> to crossAppUrl", () => {
      render(
        <Navbar currentRole="parent" crossAppUrl="http://localhost:3001" />,
      );

      const parentLink = screen.getByRole("link", { name: "Parent View" });
      expect(parentLink).toHaveAttribute("href", "/");
      expect(parentLink).toHaveAttribute("aria-pressed", "true");

      const adminLink = screen.getByRole("link", { name: "Admin View" });
      expect(adminLink).toHaveAttribute("href", "http://localhost:3001");
      expect(adminLink).toHaveAttribute("aria-pressed", "false");
    });

    it("renders no buttons when in link mode", () => {
      render(
        <Navbar currentRole="admin" crossAppUrl="http://localhost:3000" />,
      );
      expect(screen.queryAllByRole("button")).toHaveLength(0);
    });

    it("swaps active/inactive when currentRole changes", () => {
      render(
        <Navbar currentRole="admin" crossAppUrl="http://localhost:3000" />,
      );

      expect(screen.getByRole("link", { name: "Admin View" })).toHaveAttribute(
        "href",
        "/",
      );
      expect(screen.getByRole("link", { name: "Admin View" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );

      expect(screen.getByRole("link", { name: "Parent View" })).toHaveAttribute(
        "href",
        "http://localhost:3000",
      );
      expect(screen.getByRole("link", { name: "Parent View" })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    });
  });
});
