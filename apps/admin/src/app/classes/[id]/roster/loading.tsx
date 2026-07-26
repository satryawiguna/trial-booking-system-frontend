// Route-segment loading fallback for `/classes/{id}/roster`, per
// PATTERNS.md §6. Mirrors the page's own skeleton.
import { Skeleton } from "@shared/components";

export default function Loading() {
  return (
    <main className="mx-auto max-w-page-list px-6 py-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-2 h-4 w-80" />
      <div className="mt-6 flex flex-wrap gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-full" />
        ))}
      </div>
      <div
        className="mt-6 overflow-hidden rounded-card bg-surface shadow-card"
        role="status"
        aria-label="Loading participant roster"
      >
        <Skeleton variant="card" className="h-24 rounded-none" />
        <div className="flex flex-col gap-3 p-card-sm">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </main>
  );
}
