import { Skeleton } from "@shared/components";

export default function Loading() {
  return (
    <main className="mx-auto max-w-page-form px-6 py-8">
      <Skeleton className="h-5 w-40" />
      <div
        className="mt-6 flex flex-col gap-4 rounded-card border border-border bg-surface p-card-sm shadow-card"
        role="status"
        aria-label="Loading class details"
      >
        <Skeleton variant="circle" className="h-14 w-14" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-11 w-full" />
      </div>
    </main>
  );
}
