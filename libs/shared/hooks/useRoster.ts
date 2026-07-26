// useRoster — data-fetching hook for `GET /trial-classes/{id}/roster`, per
// PATTERNS.md §7. See `useTrialClasses.ts` for the rationale on fetching
// client-side rather than via an RSC `async` page component.
//
// BR-011 / INV-007 note: the documented response of
// `GET /trial-classes/{id}/roster` ("Only confirmed bookings are included.")
// already restricts the payload to confirmed participants server-side, so
// this hook does not re-filter the result — there is nothing to filter
// client-side against the documented contract. Consumers (e.g. the
// Participant Roster page) render `roster.participants` as-is.
import { useCallback, useEffect, useState } from "react";

import { ApiClientError } from "@shared/services/apiClient";
import { trialClassService } from "@shared/services/trialClassService";
import type { TrialClassRoster } from "@shared/types";
import { getErrorMessage } from "@shared/utils/errorMessages";

export interface UseRosterResult {
  roster: TrialClassRoster | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRoster(id: string | null | undefined): UseRosterResult {
  const [roster, setRoster] = useState<TrialClassRoster | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  const fetchRoster = useCallback(async () => {
    if (!id) {
      setRoster(null);
      setIsLoading(false);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await trialClassService.getRoster(id);
      setRoster(data);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? getErrorMessage(err.errorCode)
          : "Failed to load the participant roster. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // Deliberate fetch-on-mount/fetch-on-id-change data loading;
  // `fetchRoster` sets loading/data/error state asynchronously after
  // awaiting the API call, not synchronously within the effect body itself.
  // See useTrialClasses.ts for the rationale on client-side fetching here.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRoster();
  }, [fetchRoster]);

  return { roster, isLoading, error, refetch: fetchRoster };
}
