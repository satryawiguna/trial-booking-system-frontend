"use client";

import { useEffect } from "react";

import { ErrorMessage } from "@shared/components";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Never surface the raw thrown Error's `.message` to the user
  // (PATTERNS.md §5, "JANGAN expose internal error details ke user") —
  // this boundary is a safety net for unexpected render exceptions (all
  // documented API errors are already caught and translated via
  // `getErrorMessage()` inline within each page's own data-fetching hook),
  // so only a generic, friendly message is ever shown here; the real error
  // is logged for debugging instead.
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-page-form px-6 py-16">
      <ErrorMessage
        message="Failed to load the payment step. Please try again."
        onRetry={reset}
      />
    </main>
  );
}
