// TrialCard — see design/components/trial-card.md for the anatomy this
// implements (tinted header, metadata rows, seat indicator, footer CTA) and
// design/design-system.md for the accentHue / seat-indicator color rules.
//
// DATA GAP (flagged, not silently invented): trial-card.md's anatomy calls
// for "Teacher", "Room/Duration", and "grade/age band" metadata, but
// `@shared/types#TrialClass` (per architecture/api-design.md) only exposes
// `id`, `title`, `capacity`, `availableSeats`, `startTime` — there is no
// teacher/room/grade field in the documented API contract. This component
// therefore only renders a single metadata row (Date/Time, from
// `startTime`); the Teacher/Room/Grade rows are omitted rather than
// fabricated. Coordinate with Backend/Domain agents if those fields should
// be added to the TrialClass resource.
//
// VARIANT NOTE: for the `row` variant (Admin Classes, per
// design/pages/admin-classes.md), only the avatar tint + seat-indicator
// sub-pattern are reused, per trial-card.md's "Used In" note ("row layout,
// same seat-indicator sub-pattern"). The tinted full-header block and the
// "View Details →" / "Class is Full" footer CTA are grid-only — Admin
// Classes composes its own separate "View Participants" action next to the
// row (a page-level concern, out of scope for this component).
import type { KeyboardEvent } from "react";

import {
  cn,
  formatDateTime,
  formatSeatsAvailable,
  getInitials,
  hashStringToHue,
  isTrialClassFull,
} from "@shared/utils";

import type { TrialCardProps } from "./TrialCard.types";

type SeatState = "success" | "pending" | "danger";

/** Thresholds per design-system.md's "Capacity / Seat Indicator Color". */
function getSeatState(availableSeats: number): SeatState {
  if (availableSeats <= 0) return "danger";
  if (availableSeats <= 3) return "pending";
  return "success";
}

const SEAT_BAR_FILL_CLASS: Record<SeatState, string> = {
  success: "bg-success-text",
  pending: "bg-pending-text",
  danger: "bg-danger-text",
};

const SEAT_LABEL_CLASS: Record<SeatState, string> = {
  success: "text-success-text",
  pending: "text-pending-text",
  danger: "text-danger-text",
};

export function TrialCard({
  trialClass,
  onClick,
  variant = "grid",
  className,
}: TrialCardProps) {
  const isFull = isTrialClassFull(trialClass);
  const isClickable = Boolean(onClick) && !isFull;
  const isRow = variant === "row";

  const seatState = getSeatState(trialClass.availableSeats);
  const seatsLabel = formatSeatsAvailable(
    trialClass.availableSeats,
    trialClass.capacity,
  );
  const seatPercent = Math.max(
    0,
    Math.min(100, (trialClass.availableSeats / trialClass.capacity) * 100),
  );

  const hue = hashStringToHue(trialClass.id || trialClass.title);
  const headerBg = `oklch(0.88 0.10 ${hue})`;
  const headerColor = `oklch(0.28 0.12 ${hue})`;
  const initials = getInitials(trialClass.title);
  const scheduleLabel = formatDateTime(trialClass.startTime);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isClickable) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      role={isClickable ? "button" : "article"}
      tabIndex={isClickable ? 0 : undefined}
      aria-disabled={isFull || undefined}
      aria-label={`${trialClass.title} — ${seatsLabel}`}
      onClick={isClickable ? onClick : undefined}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative overflow-hidden rounded-card bg-surface shadow-card transition-all duration-200",
        isRow ? "flex items-center gap-4 p-4" : "flex flex-col",
        isFull && "cursor-not-allowed opacity-90",
        isClickable &&
          "cursor-pointer hover:-translate-y-[3px] hover:shadow-card-hover",
        className,
      )}
    >
      {isFull && (
        <span className="absolute right-3 top-3 z-10 rounded-full bg-danger-bg px-3 py-1 text-eyebrow uppercase text-danger-text">
          Full
        </span>
      )}

      <div
        className={cn(
          "flex items-center gap-3",
          !isRow && "px-card-sm pb-3 pt-card-sm",
        )}
        style={!isRow ? { backgroundColor: headerBg } : undefined}
      >
        <span
          aria-hidden="true"
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full text-lg font-extrabold"
          style={{ backgroundColor: headerBg, color: headerColor }}
        >
          {initials}
        </span>
        <div className="flex flex-col">
          <span
            className="text-base font-extrabold"
            style={!isRow ? { color: headerColor } : undefined}
          >
            {trialClass.title}
          </span>
          {isRow && scheduleLabel && (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
              />
              {scheduleLabel}
            </span>
          )}
        </div>
      </div>

      {!isRow && (
        <div className="flex flex-col gap-3 px-card-sm pb-card-sm pt-3">
          {scheduleLabel && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
              />
              {scheduleLabel}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
              <div
                className={cn(
                  "h-full rounded-full",
                  SEAT_BAR_FILL_CLASS[seatState],
                )}
                style={{ width: `${seatPercent}%` }}
              />
            </div>
            <span
              className={cn("text-xs font-bold", SEAT_LABEL_CLASS[seatState])}
            >
              {seatsLabel}
            </span>
          </div>

          <span
            aria-hidden="true"
            className={cn(
              "mt-1 flex w-full items-center justify-center rounded-button px-4 py-3 text-sm font-extrabold",
              isFull
                ? "bg-[oklch(0.88_0.02_80)] text-[oklch(0.55_0.02_80)]"
                : "bg-primary text-white",
            )}
          >
            {isFull ? "Class is Full" : "View Details →"}
          </span>
        </div>
      )}

      {isRow && (
        <div className="ml-auto flex min-w-[160px] flex-col gap-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
            <div
              className={cn(
                "h-full rounded-full",
                SEAT_BAR_FILL_CLASS[seatState],
              )}
              style={{ width: `${seatPercent}%` }}
            />
          </div>
          <span
            className={cn("text-xs font-bold", SEAT_LABEL_CLASS[seatState])}
          >
            {seatsLabel}
          </span>
        </div>
      )}
    </div>
  );
}
