import { Skeleton } from "@shared/components";

export default function Loading() {
  return (
    <main className="mx-auto max-w-page-form px-6 py-8">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-6 h-8 w-64" />
      <div className="mt-8 flex flex-col gap-6 md:flex-row">
        <Skeleton variant="card" className="h-96 flex-1" />
        <Skeleton variant="card" className="h-40 md:w-[260px]" />
      </div>
    </main>
  );
}
