import {
  isRequired,
  isValidEmail,
  isValidPhone,
  isValidUUID,
  validateBookingFormFields,
} from "./validators";
import type { BookingFormFields } from "@shared/types";

describe("isRequired", () => {
  it("returns false for empty/whitespace-only strings", () => {
    expect(isRequired("")).toBe(false);
    expect(isRequired("   ")).toBe(false);
  });

  it("returns true for non-empty strings", () => {
    expect(isRequired("Jane Smith")).toBe(true);
  });
});

describe("isValidEmail", () => {
  it("accepts valid email addresses", () => {
    expect(isValidEmail("jane@email.com")).toBe(true);
  });

  it("rejects invalid email addresses", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("jane@")).toBe(false);
  });
});

describe("isValidPhone", () => {
  it("accepts a valid phone number with formatting", () => {
    expect(isValidPhone("+62 812 3456 7890")).toBe(true);
  });

  it("rejects a phone number with too few digits", () => {
    expect(isValidPhone("123")).toBe(false);
  });

  it("rejects a phone number containing letters", () => {
    expect(isValidPhone("+62 abc 3456 7890")).toBe(false);
  });
});

describe("isValidUUID", () => {
  it("accepts a valid UUID", () => {
    expect(isValidUUID("123e4567-e89b-42d3-a456-426614174000")).toBe(true);
  });

  it("rejects a non-UUID string", () => {
    expect(isValidUUID("not-a-uuid")).toBe(false);
  });
});

describe("validateBookingFormFields", () => {
  const validFields: BookingFormFields = {
    parentName: "Jane Smith",
    studentName: "Emily Smith",
    phoneNumber: "+62 812 3456 7890",
    email: "jane@email.com",
    grade: "Grade 1",
  };

  it("returns no errors for a fully valid form", () => {
    expect(validateBookingFormFields(validFields)).toEqual({});
  });

  it("flags all required fields when empty", () => {
    const errors = validateBookingFormFields({
      parentName: "",
      studentName: "",
      phoneNumber: "",
      email: "",
      grade: "",
    });

    expect(Object.keys(errors)).toEqual(
      expect.arrayContaining([
        "parentName",
        "studentName",
        "phoneNumber",
        "email",
        "grade",
      ]),
    );
  });

  it("flags an invalid email format", () => {
    const errors = validateBookingFormFields({
      ...validFields,
      email: "not-an-email",
    });
    expect(errors.email).toBeDefined();
  });

  it("flags an invalid phone format", () => {
    const errors = validateBookingFormFields({
      ...validFields,
      phoneNumber: "abc",
    });
    expect(errors.phoneNumber).toBeDefined();
  });
});
