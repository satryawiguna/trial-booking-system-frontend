export type SkeletonVariant = "text" | "card" | "image" | "circle";

export interface SkeletonProps {
  className?: string;
  variant?: SkeletonVariant;
}
