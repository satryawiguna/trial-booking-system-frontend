// Trial Class domain types.
//
// Field names and shapes match `architecture/api-design.md` exactly:
//   GET /trial-classes             -> TrialClass[]
//   GET /trial-classes/{id}        -> TrialClass
//   GET /trial-classes/{id}/roster -> TrialClassRoster
//
// NOTE: api-design.md does NOT document `description`, `teacherName`, or an
// `isFull` flag on the TrialClass resource (unlike the illustrative example
// in PATTERNS.md §9). Only `id`, `title`, `capacity`, `availableSeats`, and
// `startTime` are documented response fields, so those are the only fields
// modeled here. "Full" state should be derived client-side from
// `availableSeats <= 0` (see `@shared/utils/formatters`) rather than read
// from an API field that doesn't exist in the contract.

export interface TrialClass {
  id: string;
  title: string;
  capacity: number;
  availableSeats: number;
  /** ISO-8601 timestamp, e.g. "2026-07-25T10:00:00Z" */
  startTime: string;
}

export interface TrialClassRosterParticipant {
  bookingId: string;
  studentId: string;
  studentName: string;
  /** ISO-8601 timestamp, e.g. "2026-07-27T02:09:36.727Z" */
  createdAt: string;
}

/**
 * Response shape of GET /trial-classes/{id}/roster.
 *
 * NOTE: api-design.md returns a single object wrapping the participant list
 * (`{ trialClassId, participants }`), not a bare array as suggested by the
 * illustrative service example in PATTERNS.md §4/§9. This type follows
 * api-design.md.
 */
export interface TrialClassRoster {
  trialClassId: string;
  participants: TrialClassRosterParticipant[];
}
