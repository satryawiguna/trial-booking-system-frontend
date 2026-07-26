"use client";

import { useEffect } from "react";

// Top-level error boundary, per PATTERNS.md §5. This only catches
// unexpected render exceptions that escape a page's own inline error
// handling (all pages in this app fetch via `@shared/hooks`/local
// data-fetching hooks, which already surface API errors as in-page
// `ErrorMessage` state) — a safety net, not the primary error UX. Mirrors
// apps/web/src/app/error.tsx.
import { ErrorMessage } from "@shared/components";

export default function GlobalError({
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
    <main className="mx-auto max-w-page-list px-6 py-16">
      <ErrorMessage
        message="Failed to load this page. Please try again."
        onRetry={reset}
      />
    </main>
  );
}
