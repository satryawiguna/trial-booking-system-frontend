# API Contract Compliance Checklist

**Verified against:** `../trial-booking-system-context/architecture/api-design.md`
**Verified on:** 2026-07-27 (Task 9–10, Frontend Agent — Environment/Docs & Final QA)
**Method:** Read the real service code (`libs/shared/services/*.ts`, `libs/shared/types/*.ts`) and the real spec doc side by side — not a restatement of prior task reports.

For each endpoint: method, path, request shape, response shape, and handled status codes.

---

## 1. `GET /trial-classes` → `trialClassService.getAll()`

| Aspect | Spec (`api-design.md`) | Implementation | Match |
|---|---|---|---|
| Method/Path | `GET /trial-classes` | `apiClient.get("/trial-classes")` | ✅ |
| Request | No body | No body | ✅ |
| Response | `[{ id, title, capacity, availableSeats, startTime }]` | `TrialClass[]` — `libs/shared/types/trialClass.ts` exposes exactly `id, title, capacity, availableSeats, startTime` | ✅ |
| Status codes | 500 | Generic `apiClient` throws `ApiClientError` on any non-2xx (incl. network errors as `NETWORK_ERROR`); no special-casing needed since there's nothing endpoint-specific to branch on | ✅ |

**Verdict: Compliant.**

---

## 2. `GET /trial-classes/{id}` → `trialClassService.getById()`

| Aspect | Spec | Implementation | Match |
|---|---|---|---|
| Method/Path | `GET /trial-classes/{id}` | `apiClient.get(\`/trial-classes/${id}\`)` | ✅ |
| Request | No body | No body | ✅ |
| Response | `{ id, title, capacity, availableSeats, startTime }` | `TrialClass` | ✅ |
| Status codes | 404 | `useTrialClass` catches `ApiClientError`, maps `errorCode` → user message via `getErrorMessage` (generic, not 404-specific — see §3 of the Undocumented Error Schema note below) | ✅ (handled, generically) |

**Verdict: Compliant.**

---

## 3. `GET /trial-classes/{id}/roster` → `trialClassService.getRoster()`

| Aspect | Spec | Implementation | Match |
|---|---|---|---|
| Method/Path | `GET /trial-classes/{id}/roster` | `apiClient.get(\`/trial-classes/${id}/roster\`)` | ✅ |
| Request | No body | No body | ✅ |
| Response | `{ trialClassId, participants: [{ studentId, studentName }] }` | `TrialClassRoster` — matches field-for-field, incl. the wrapping object (not a bare array) | ✅ |
| Business rule | "Only confirmed bookings are included" (server-side) | `useRoster.ts` explicitly does **not** re-filter client-side — documented as intentional since the contract already restricts this server-side | ✅ |
| Status codes | (none documented beyond generic) | Generic error handling | ✅ |

**Verdict: Compliant.**

---

## 4. `POST /bookings` → `bookingService.create()`

| Aspect | Spec | Implementation | Match |
|---|---|---|---|
| Method/Path | `POST /bookings` | `apiClient.post("/bookings", input)` | ✅ |
| Request | `{ studentId, trialClassId }` | `CreateBookingInput`: `{ parentName, studentName, phoneNumber, email, grade, trialClassId }` (**no `studentId`**) | ❌ **Deviation (known gap #1)** |
| Response | `{ bookingId, status: "PENDING_PAYMENT" }` | `CreateBookingResult`: `{ bookingId, status: BookingStatus }` | ✅ |
| Status codes | 400, 404, 422 | Generic `ApiClientError` handling in `BookingFormPageContent.tsx`'s `handleSubmit` catch block — surfaces as an inline banner, no status-code-specific branching (relies on `errorCode`) | ✅ (handled, generically) |

**Deviation detail:** `api-design.md` documents this endpoint as accepting a pre-existing `studentId`, but no `Student` resource, no "create student" endpoint, and no student-lookup endpoint exists anywhere in the documented API. `design/pages/booking.md` / `design/components/booking-form.md` specify a form that collects `parentName, studentName, phoneNumber, email, grade` — none of which map onto a pre-existing `studentId`. The frontend's resolution (documented in detail in `libs/shared/types/booking.ts` and `libs/shared/types/student.ts`) is to send the full registrant payload directly to `POST /bookings`, assuming the backend derives/creates the `Student` record from it. **This is a judgment call, not a confirmed contract, and must be verified with the Backend Agent.** If the backend instead expects a `studentId` from a separate endpoint, `CreateBookingInput` and its one call site (`apps/web/src/app/booking/BookingFormPageContent.tsx`) need to change together.

**Verdict: Non-compliant on request shape (flagged, documented, coordinated deviation) — response shape and status handling are compliant.**

---

## 5. `GET /bookings/{id}` → `bookingService.getById()`

| Aspect | Spec | Implementation | Match |
|---|---|---|---|
| Method/Path | `GET /bookings/{id}` | `apiClient.get(\`/bookings/${id}\`)` | ✅ |
| Request | No body | No body | ✅ |
| Response | `{ bookingId, status, studentId, trialClassId }` | `Booking`: `{ bookingId, status, studentId, trialClassId }` | ✅ (field-for-field) |
| Status codes | 404 | Generic `ApiClientError` handling in `useBooking.ts` | ✅ |

**Related known gap (#2, not a contract mismatch):** the spec's response for this endpoint genuinely has no registrant fields (parent/student name, grade, phone, email) — Payment and Booking Status pages need these for their review panels. This is worked around client-side via `libs/shared/utils/registrantStorage.ts` (sessionStorage, keyed by `bookingId`, populated at booking-creation time). This is **not** a mismatch between implementation and spec — the implementation correctly restricts itself to the documented `Booking` shape; the gap is that the *spec itself* under-documents what the UI needs, which is a Backend/Design coordination item, not a frontend bug.

**Verdict: Compliant.**

---

## 6. `POST /bookings/{id}/payments` → `bookingService.submitPayment()`

| Aspect | Spec | Implementation | Match |
|---|---|---|---|
| Method/Path | `POST /bookings/{id}/payments` | `apiClient.post(\`/bookings/${bookingId}/payments\`)` (no body arg passed) | ✅ |
| Request | No request body | `apiClient.post<T>(endpoint, body?)` called with `body` omitted → no `body:` key sent in `fetch()` init | ✅ |
| Response (success) | `{ paymentAttemptId, paymentStatus: "SUCCESS", bookingStatus: "CONFIRMED" }` | `PaymentResult`: `{ paymentAttemptId, paymentStatus, bookingStatus }` | ✅ |
| Response (failure) | `{ paymentAttemptId, paymentStatus: "FAILED", bookingStatus: "PAYMENT_FAILED" }` | Same `PaymentResult` type, branched on `paymentStatus === PaymentStatus.FAILED` in `apps/web/src/app/booking/[id]/payment/page.tsx` | ✅ |
| Status codes | 404, 409 (×3 variants: already completed / class full / duplicate confirmed) | 409 is explicitly caught (`err.statusCode === 409`) and redirects to Booking Status with a `?reason=<errorCode>` query param so the status page can show a contextual message; 404 falls through to the generic `ApiClientError` → `getErrorMessage` branch | ✅ |

**Spec-conflict note (already flagged, not a new finding):** `design/pages/payment.md` describes a failed-payment outcome as "the booking stays PENDING_PAYMENT," but `api-design.md`'s documented 200 response for a failed mock payment always returns `bookingStatus: "PAYMENT_FAILED"` — there is no response shape matching payment.md's "stays pending" narrative. The implementation follows `payment.md`'s UX intent (inline decline message, stay on page, allow retry) by branching on `paymentStatus === "FAILED"` alone, regardless of the returned `bookingStatus`. Documented in-line at `apps/web/src/app/booking/[id]/payment/page.tsx`.

**Verdict: Compliant** (request/response shape and status codes match `api-design.md` exactly; the payment.md/api-design.md narrative conflict is a spec-vs-spec issue, not an implementation-vs-spec issue).

---

## 7. `POST /bookings/{id}/cancel` → `bookingService.cancel()`

| Aspect | Spec | Implementation | Match |
|---|---|---|---|
| Method/Path | `POST /bookings/{id}/cancel` | `apiClient.post(\`/bookings/${bookingId}/cancel\`)` | ✅ |
| Request | No request body | No body | ✅ |
| Response | `{ bookingId, status: "CANCELLED" }` | `CancelBookingResult`: `{ bookingId, status }` | ✅ |
| Status codes | 404, 409 (already cancelled) | Generic `ApiClientError` handling in `BookingStatusPageContent.tsx`'s `handleCancel` catch block | ✅ |
| UI gating | Purpose states "Cancel a confirmed booking" | The "Cancel Booking" button is only rendered when `booking.status === BookingStatus.CONFIRMED` — matches the documented purpose even though the endpoint itself doesn't explicitly reject non-confirmed bookings in the spec table | ✅ |

**Verdict: Compliant.**

---

## Cross-cutting: error response schema

`api-design.md` documents HTTP status codes and human-readable descriptions per endpoint (e.g. "404 Trial class not found") but **does not document a JSON error-body schema** — no `errorCode` field appears anywhere in the spec. `libs/shared/services/apiClient.ts` and `libs/shared/utils/errorMessages.ts` assume a `{ statusCode, errorCode, message }` shape (per `PATTERNS.md`'s conventions, which is more specific but not necessarily what the real backend returns), with an `UNKNOWN_ERROR` fallback if the response doesn't match. **This is known gap #3** — flagged, not silently guessed, defensively coded so a mismatched real backend shape degrades to a generic message rather than crashing. Should be confirmed against the real backend's actual error response format.

## Additional mismatches discovered during this pass

None found beyond the known-gaps list (#1–#3 above) carried forward from Task 4. All response shapes (`TrialClass`, `TrialClassRoster`, `Booking`, `CreateBookingResult`, `PaymentResult`, `CancelBookingResult`), enum values (`PENDING_PAYMENT`, `CONFIRMED`, `PAYMENT_FAILED`, `CANCELLED`, `SUCCESS`, `FAILED`), and endpoint paths/methods match `api-design.md` exactly on re-verification.

## Summary

| # | Endpoint | Service call | Compliant? |
|---|---|---|---|
| 1 | `GET /trial-classes` | `trialClassService.getAll()` | ✅ Compliant |
| 2 | `GET /trial-classes/{id}` | `trialClassService.getById()` | ✅ Compliant |
| 3 | `GET /trial-classes/{id}/roster` | `trialClassService.getRoster()` | ✅ Compliant |
| 4 | `POST /bookings` | `bookingService.create()` | ⚠️ Request shape deviates (flagged, coordinated — gap #1) |
| 5 | `GET /bookings/{id}` | `bookingService.getById()` | ✅ Compliant |
| 6 | `POST /bookings/{id}/payments` | `bookingService.submitPayment()` | ✅ Compliant |
| 7 | `POST /bookings/{id}/cancel` | `bookingService.cancel()` | ✅ Compliant |
