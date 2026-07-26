import { cn } from "./cn";

describe("cn", () => {
  it("merges class names, keeping the later conflicting Tailwind class", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("filters out falsy values", () => {
    expect(cn("text-sm", false && "hidden", undefined, "font-bold")).toBe(
      "text-sm font-bold",
    );
  });
});
