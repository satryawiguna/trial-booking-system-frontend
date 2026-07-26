// Booking service module per PATTERNS.md §4.
//
// Endpoints per architecture/api-design.md:
//   POST /bookings                -> create()        (request: { studentId, trialClassId })
//   GET  /bookings/{id}           -> getById()
//   POST /bookings/{id}/payments  -> submitPayment()  (no request body — backend
//                                    determines the mock payment outcome internally)
//   POST /bookings/{id}/cancel    -> cancel()         (no request body)

import { apiClient } from "./apiClient";
import type {
  Booking,
  CancelBookingResult,
  CreateBookingInput,
  CreateBookingResult,
  PaymentResult,
} from "@shared/types";

export const bookingService = {
  create: (input: CreateBookingInput) =>
    apiClient.post<CreateBookingResult>("/bookings", input),

  getById: (id: string) => apiClient.get<Booking>(`/bookings/${id}`),

  submitPayment: (bookingId: string) =>
    apiClient.post<PaymentResult>(`/bookings/${bookingId}/payments`),

  cancel: (bookingId: string) =>
    apiClient.post<CancelBookingResult>(`/bookings/${bookingId}/cancel`),
};
