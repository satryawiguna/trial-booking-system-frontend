// Pure formatting helpers per PATTERNS.md.
//
// NOTE on currency: architecture/api-design.md never models a payment
// amount (POST /bookings/{id}/payments takes no request body and no price
// field appears on TrialClass). design/pages/booking.md confirms trial
// classes are always free ("Total: Free"). No currency formatter is
// provided since there is no documented monetary value to format.

import type { TrialClass } from "@shared/types";

/**
 * Formats an ISO-8601 timestamp (e.g. TrialClass.startTime) as a
 * human-readable date, e.g. "Jul 25, 2026".
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Formats an ISO-8601 timestamp as a human-readable time, e.g. "10:00 AM".
 */
export function formatTime(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Formats an ISO-8601 timestamp as a combined human-readable date and time,
 * e.g. "Jul 25, 2026, 10:00 AM".
 */
export function formatDateTime(isoDate: string): string {
  const date = formatDate(isoDate);
  const time = formatTime(isoDate);
  if (!date || !time) return "";
  return `${date}, ${time}`;
}

/**
 * Formats seat availability text for a trial class, e.g. "2 / 4 seats
 * available" or "Full".
 */
export function formatSeatsAvailable(
  availableSeats: number,
  capacity: number,
): string {
  if (availableSeats <= 0) return "Full";
  return `${availableSeats} / ${capacity} seats available`;
}

/**
 * Derives whether a trial class is full from its API-provided seat counts.
 * `TrialClass` has no `isFull` field in the documented API contract (see
 * `@shared/types/trialClass`), so "full" is always computed client-side.
 */
export function isTrialClassFull(trialClass: TrialClass): boolean {
  return trialClass.availableSeats <= 0;
}

/**
 * Deterministic hue derived from a stable identifier (e.g. a trial class
 * id), per design-system.md's Category Accent system ("Each trial class
 * gets a tinted header derived from a single hue value... New subjects
 * simply need a new hue"). There is no `accentHue`/subject field on
 * `TrialClass`, so the hue is generated at render time instead.
 *
 * Shared by `TrialCard` (grid/row header tint) and the Class Detail page
 * (`apps/web/src/app/trial-classes/[id]/page.tsx`), which reuses the same
 * accent-hue treatment per `design/pages/class-detail.md`.
 */
export function hashStringToHue(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 360;
  }
  return Math.abs(hash);
}

/** Two-letter abbreviation avatar text derived from a title, e.g. "Beginner Piano" -> "BP". */
export function getInitials(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}
