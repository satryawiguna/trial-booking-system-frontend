// BookingForm — field set per design/components/booking-form.md.
//
// Presentational only: this component never calls trialClassService /
// bookingService / apiClient directly. All state (`values`), validation
// (`errors`), backend error banner (`submitError`) and the submit action
// are supplied by the caller (a page/hook, in a later task).
import type { ChangeEvent, FormEvent } from "react";

import type { BookingFormFields, Grade } from "@shared/types";
import { GRADE_OPTIONS, cn, isRequired } from "@shared/utils";

import { Button } from "../Button";
import type { BookingFormProps } from "./BookingForm.types";

// Label styling per booking-form.md ("12px / weight 700 / uppercase /
// letter-spacing .05em") — implemented with the `eyebrow` design token
// (11px / 700 / .065em), the design system's dedicated "Label / eyebrow"
// typographic scale, since 12px/.05em falls within that token's documented
// 10–12px / .05–.08em range.
const LABEL_CLASS = "text-eyebrow uppercase text-muted-foreground";

const INPUT_CLASS =
  "w-full rounded-input border-[1.5px] border-border bg-white px-[14px] py-3 text-sm text-foreground " +
  "outline-none transition-colors focus:border-primary";

const INPUT_ERROR_CLASS = "border-danger-text focus:border-danger-text";

interface TextFieldConfig {
  name: Exclude<keyof BookingFormFields, "grade">;
  label: string;
  type: "text" | "tel" | "email";
  placeholder: string;
}

const TEXT_FIELDS: TextFieldConfig[] = [
  {
    name: "parentName",
    label: "Parent / Guardian Name",
    type: "text",
    placeholder: "e.g. Jane Smith",
  },
  {
    name: "studentName",
    label: "Student Name",
    type: "text",
    placeholder: "e.g. Emily Smith",
  },
  {
    name: "phoneNumber",
    label: "Phone Number",
    type: "tel",
    placeholder: "e.g. +62 812 3456 7890",
  },
  {
    name: "email",
    label: "Email Address",
    type: "email",
    placeholder: "e.g. jane@email.com",
  },
];

function isFormValid(values: BookingFormFields): boolean {
  return (
    isRequired(values.parentName) &&
    isRequired(values.studentName) &&
    isRequired(values.phoneNumber) &&
    isRequired(values.email) &&
    isRequired(values.grade)
  );
}

export function BookingForm({
  values,
  errors = {},
  submitError,
  isSubmitting = false,
  onChange,
  onSubmit,
  submitLabel = "Continue to Payment →",
  className,
}: BookingFormProps) {
  const formValid = isFormValid(values);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formValid || isSubmitting) return;
    onSubmit();
  };

  const handleFieldChange =
    (field: keyof BookingFormFields) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      onChange(field, event.target.value);
    };

  return (
    <form
      className={cn("flex flex-col gap-5", className)}
      onSubmit={handleSubmit}
      noValidate
    >
      {submitError && (
        <div
          role="alert"
          className="rounded-input bg-danger-bg px-4 py-3 text-sm text-danger-text"
        >
          {submitError}
        </div>
      )}

      {TEXT_FIELDS.map((field) => {
        const errorMessage = errors[field.name];
        const errorId = `${field.name}-error`;

        return (
          <div key={field.name} className="flex flex-col gap-1.5">
            <label htmlFor={field.name} className={LABEL_CLASS}>
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              placeholder={field.placeholder}
              value={values[field.name]}
              onChange={handleFieldChange(field.name)}
              disabled={isSubmitting}
              aria-invalid={Boolean(errorMessage) || undefined}
              aria-describedby={errorMessage ? errorId : undefined}
              className={cn(INPUT_CLASS, errorMessage && INPUT_ERROR_CLASS)}
            />
            {errorMessage && (
              <span
                id={errorId}
                className="text-xs text-danger-text"
                aria-live="polite"
              >
                {errorMessage}
              </span>
            )}
          </div>
        );
      })}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="grade" className={LABEL_CLASS}>
          Student Grade
        </label>
        <select
          id="grade"
          name="grade"
          value={values.grade}
          onChange={handleFieldChange("grade")}
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.grade) || undefined}
          aria-describedby={errors.grade ? "grade-error" : undefined}
          className={cn(INPUT_CLASS, errors.grade && INPUT_ERROR_CLASS)}
        >
          <option value="" disabled>
            Select grade...
          </option>
          {GRADE_OPTIONS.map((grade: Grade) => (
            <option key={grade} value={grade}>
              {grade}
            </option>
          ))}
        </select>
        {errors.grade && (
          <span
            id="grade-error"
            className="text-xs text-danger-text"
            aria-live="polite"
          >
            {errors.grade}
          </span>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        disabled={!formValid}
        isLoading={isSubmitting}
      >
        {submitLabel}
      </Button>
    </form>
  );
}
