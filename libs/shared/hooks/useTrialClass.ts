// useTrialClass — data-fetching hook for `GET /trial-classes/{id}`, per
// PATTERNS.md §7. See `useTrialClasses.ts` for the rationale on fetching
// client-side rather than via an RSC `async` page component.
//
// `id` may be `null`/`undefined` (e.g. the Booking Form page reads `classId`
// from a query param that may briefly be absent) — the hook simply stays
// idle (`isLoading: false`, `trialClass: null`) until a truthy id is
// provided.
import { useCallback, useEffect, useState } from "react";

import { ApiClientError } from "@shared/services/apiClient";
import { trialClassService } from "@shared/services/trialClassService";
import type { TrialClass } from "@shared/types";
import { getErrorMessage } from "@shared/utils/errorMessages";

export interface UseTrialClassResult {
  trialClass: TrialClass | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTrialClass(
  id: string | null | undefined,
): UseTrialClassResult {
  const [trialClass, setTrialClass] = useState<TrialClass | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  const fetchTrialClass = useCallback(async () => {
    if (!id) {
      setTrialClass(null);
      setIsLoading(false);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await trialClassService.getById(id);
      setTrialClass(data);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? getErrorMessage(err.errorCode)
          : "Failed to load this trial class. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // Deliberate fetch-on-mount/fetch-on-id-change data loading;
  // `fetchTrialClass` sets loading/data/error state asynchronously after
  // awaiting the API call, not synchronously within the effect body itself.
  // See useTrialClasses.ts for the rationale on client-side fetching here.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTrialClass();
  }, [fetchTrialClass]);

  return { trialClass, isLoading, error, refetch: fetchTrialClass };
}
