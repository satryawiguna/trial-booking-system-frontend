// ErrorMessage — no standalone component spec exists for this one; it
// follows PATTERNS.md §5 (Error Handling Pattern)'s error.tsx template
// (icon + heading + message + retry action) and the "danger" semantic
// colors from design-system.md.
import { Button } from "../Button";
import { cn } from "@shared/utils";

import type { ErrorMessageProps } from "./ErrorMessage.types";

function AlertIcon() {
  return (
    <svg
      className="h-10 w-10 text-danger-text"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a1 1 0 0 0 .86 1.5h18.64a1 1 0 0 0 .86-1.5L13.71 3.86a1 1 0 0 0-1.72 0Z"
      />
    </svg>
  );
}

export function ErrorMessage({
  heading = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try again",
  className,
}: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center gap-3 rounded-card bg-danger-bg px-6 py-10 text-center",
        className,
      )}
    >
      <AlertIcon />
      <h2 className="text-section-title text-foreground">{heading}</h2>
      <p className="text-sm text-danger-text">{message}</p>
      {onRetry && (
        <Button variant="primary" onClick={onRetry} className="mt-2">
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
