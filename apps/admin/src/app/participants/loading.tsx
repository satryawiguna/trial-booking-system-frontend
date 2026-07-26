import { Skeleton } from "@shared/components";

export default function Loading() {
  return (
    <main className="mx-auto max-w-page-list px-6 py-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton variant="card" className="mt-8 h-64" />
    </main>
  );
}
