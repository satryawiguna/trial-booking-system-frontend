export interface ErrorMessageProps {
  /** Defaults to "Something went wrong" (matches PATTERNS.md §5's error.tsx template). */
  heading?: string;
  message: string;
  /** Shows a retry button when provided. */
  onRetry?: () => void;
  /** Defaults to "Try again". */
  retryLabel?: string;
  className?: string;
}
