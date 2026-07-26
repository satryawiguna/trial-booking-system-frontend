// Route-segment loading fallback for `/` (Admin Dashboard), per
// PATTERNS.md §6. Mirrors the page's own skeleton so a fast route
// transition doesn't flash mismatched content.
import { Skeleton } from "@shared/components";

export default function Loading() {
  return (
    <main className="mx-auto max-w-page-list px-6 py-8">
      <Skeleton className="h-8 w-72" />
      <Skeleton className="mt-2 h-4 w-96" />
      <div
        className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
        role="status"
        aria-label="Loading dashboard"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="card" className="h-28" />
        ))}
      </div>
      <Skeleton className="mt-10 h-6 w-48" />
      <Skeleton variant="card" className="mt-4 h-64" />
    </main>
  );
}
