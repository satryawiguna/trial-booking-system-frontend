import type { BookingStatus } from "@shared/types";

export interface StatusBadgeProps {
  status: BookingStatus;
  className?: string;
}
