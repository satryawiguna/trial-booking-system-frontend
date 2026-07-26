// Page: Booking Status (US-005, US-006) — per design/pages/booking-status.md.
//
// This wrapper stays a Server Component so `useSearchParams()` (used by
// `BookingStatusPageContent` to read the optional `?reason=` context param
// set by the Payment page on a non-recoverable 409) can be wrapped in a
// `<Suspense>` boundary, per Next.js App Router guidance.
import { Suspense } from "react";

import { Skeleton } from "@shared/components";

import { BookingStatusPageContent } from "./BookingStatusPageContent";

function StatusSkeleton() {
  return (
    <main className="mx-auto max-w-page-status px-6 py-8">
      <Skeleton className="mx-auto h-6 w-40" />
      <Skeleton
        variant="card"
        className="mx-auto mt-8 h-[420px] max-w-page-status"
      />
    </main>
  );
}

export default function BookingStatusPage() {
  return (
    <Suspense fallback={<StatusSkeleton />}>
      <BookingStatusPageContent />
    </Suspense>
  );
}
