// Page: Booking Form (US-003) — per design/pages/booking.md.
//
// This wrapper stays a Server Component so `useSearchParams()` (used by
// `BookingFormPageContent` to read `?classId=`) can be wrapped in a
// `<Suspense>` boundary, per Next.js App Router guidance for Client
// Components that read the search string.
import { Suspense } from "react";

import { Skeleton } from "@shared/components";

import { BookingFormPageContent } from "./BookingFormPageContent";

function BookingFormSkeleton() {
  return (
    <main className="mx-auto max-w-page-form px-6 py-8">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="mt-6 h-8 w-64" />
      <div className="mt-8 flex flex-col gap-6 md:flex-row">
        <Skeleton variant="card" className="h-96 flex-1" />
        <Skeleton variant="card" className="h-40 md:w-[260px]" />
      </div>
    </main>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<BookingFormSkeleton />}>
      <BookingFormPageContent />
    </Suspense>
  );
}
