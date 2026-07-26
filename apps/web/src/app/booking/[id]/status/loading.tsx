import { Skeleton } from "@shared/components";

export default function Loading() {
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
