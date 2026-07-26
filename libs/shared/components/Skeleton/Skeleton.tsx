// Skeleton — loading placeholder per PATTERNS.md §6 (Loading Pattern).
// No standalone design spec exists for this component; styling follows the
// PATTERNS.md §6 template, adapted to this repo's rounded-card token.
import { cn } from "@shared/utils";

import type { SkeletonProps } from "./Skeleton.types";

export function Skeleton({ className, variant = "text" }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded bg-border/60",
        variant === "text" && "h-4 w-full",
        variant === "card" && "h-40 w-full rounded-card",
        variant === "image" && "aspect-video w-full rounded-card",
        variant === "circle" && "h-10 w-10 rounded-full",
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
