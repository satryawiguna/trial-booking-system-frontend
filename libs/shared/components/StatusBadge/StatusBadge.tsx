// StatusBadge — pill badge for a Booking's status.
//
// Text: `BOOKING_STATUS_LABEL` (@shared/utils/constants).
// Color mapping per design/pages/booking-status.md's States table:
//   CONFIRMED        -> green  (success)
//   PAYMENT_FAILED    -> red    (danger)
//   CANCELLED         -> red    (danger)
//   PENDING_PAYMENT   -> amber  (pending)
//
// Sizing per design-system.md's "Status Badge" pattern: border-radius 20px,
// font-size 11px, font-weight 700. `rounded-full` is used instead of a fixed
// 20px radius token (no matching badge-radius token exists — "panel" is an
// unrelated large-panel token) since a fully-rounded pill is the correct
// generalization of "20px radius" at this badge height.
import { BookingStatus } from "@shared/types";
import { BOOKING_STATUS_LABEL, cn } from "@shared/utils";

import type { StatusBadgeProps } from "./StatusBadge.types";

const STATUS_STYLES: Record<BookingStatus, string> = {
  [BookingStatus.CONFIRMED]: "bg-success-bg text-success-text",
  [BookingStatus.PENDING_PAYMENT]: "bg-pending-bg text-pending-text",
  [BookingStatus.PAYMENT_FAILED]: "bg-danger-bg text-danger-text",
  [BookingStatus.CANCELLED]: "bg-danger-bg text-danger-text",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold",
        STATUS_STYLES[status],
        className,
      )}
    >
      {BOOKING_STATUS_LABEL[status]}
    </span>
  );
}
