// Route-segment loading fallback for `/` (Trial Class List), per
// PATTERNS.md §6. Mirrors the page's own skeleton so a fast route
// transition doesn't flash mismatched content.
import { Skeleton } from "@shared/components";

export default function Loading() {
  return (
    <main className="mx-auto max-w-page-list px-6 py-8">
      <Skeleton className="h-8 w-72" />
      <Skeleton className="mt-2 h-4 w-96" />
      <div
        className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-5"
        role="status"
        aria-label="Loading trial classes"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="card" className="h-64" />
        ))}
      </div>
    </main>
  );
}
