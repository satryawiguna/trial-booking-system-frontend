import { getErrorMessage } from "./errorMessages";

describe("getErrorMessage", () => {
  it("returns the mapped message for a known error code", () => {
    expect(getErrorMessage("CAPACITY_EXCEEDED")).toBe(
      "This class is already full. Please choose another class.",
    );
    expect(getErrorMessage("DUPLICATE_BOOKING")).toBe(
      "You have already booked this class.",
    );
  });

  it("falls back to a generic message for an unknown error code", () => {
    expect(getErrorMessage("SOMETHING_UNDOCUMENTED")).toBe(
      "An unexpected error occurred. Please try again.",
    );
  });
});
