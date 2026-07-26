// Route-segment loading fallback for `/classes` (Admin Classes), per
// PATTERNS.md §6. Mirrors the page's own row skeleton.
import { Skeleton } from "@shared/components";

export default function Loading() {
  return (
    <main className="mx-auto max-w-page-list px-6 py-8">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-2 h-4 w-96" />
      <div
        className="mt-8 flex flex-col gap-4"
        role="status"
        aria-label="Loading trial classes"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-card bg-surface p-4 shadow-card sm:flex-row sm:items-center sm:gap-4"
          >
            <div className="flex items-center gap-4">
              <Skeleton variant="circle" className="h-[52px] w-[52px]" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-8 w-full sm:ml-auto sm:w-40" />
          </div>
        ))}
      </div>
    </main>
  );
}
