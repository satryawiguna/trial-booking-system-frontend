import type { TrialClass } from "@shared/types";

/**
 * "grid" — vertical card used on Trial Class List (design/pages/trial-class-list.md).
 * "row"  — horizontal row layout reused on Admin Classes (design/pages/admin-classes.md).
 */
export type TrialCardVariant = "grid" | "row";

export interface TrialCardProps {
  trialClass: TrialClass;
  /** Not called (and the card is not focusable/clickable) when the class is full. */
  onClick?: () => void;
  variant?: TrialCardVariant;
  className?: string;
}
