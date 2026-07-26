// useBooking — data-fetching hook for `GET /bookings/{id}`, per
// PATTERNS.md §7. See `useTrialClasses.ts` for the rationale on fetching
// client-side rather than via an RSC `async` page component.
//
// Mutations on a booking (`POST /bookings/{id}/payments`,
// `POST /bookings/{id}/cancel`) are deliberately NOT part of this hook —
// they're triggered directly from the Payment / Booking Status pages (each
// has different loading/error UX for its own action), which call
// `refetch()` afterwards to re-sync `booking` with the server.
import { useCallback, useEffect, useState } from "react";

import { bookingService } from "@shared/services/bookingService";
import { ApiClientError } from "@shared/services/apiClient";
import type { Booking } from "@shared/types";
import { getErrorMessage } from "@shared/utils/errorMessages";

export interface UseBookingResult {
  booking: Booking | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useBooking(id: string | null | undefined): UseBookingResult {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  const fetchBooking = useCallback(async () => {
    if (!id) {
      setBooking(null);
      setIsLoading(false);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await bookingService.getById(id);
      setBooking(data);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? getErrorMessage(err.errorCode)
          : "Failed to load this booking. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // Deliberate fetch-on-mount/fetch-on-id-change data loading;
  // `fetchBooking` sets loading/data/error state asynchronously after
  // awaiting the API call, not synchronously within the effect body itself.
  // See useTrialClasses.ts for the rationale on client-side fetching here.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBooking();
  }, [fetchBooking]);

  return { booking, isLoading, error, refetch: fetchBooking };
}
