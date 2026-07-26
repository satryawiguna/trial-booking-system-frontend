// useTrialClasses — data-fetching hook for `GET /trial-classes`, per
// PATTERNS.md §7 (Custom Hooks Pattern): returns `{ data, isLoading, error,
// refetch }`.
//
// DESIGN NOTE: PATTERNS.md §3 prefers server-component (RSC) data fetching
// over client hooks + useEffect where possible. This hook is nevertheless
// used from a `"use client"` page (`apps/web/src/app/page.tsx`) rather than
// an `async` server component, for two reasons specific to this app:
//   1. Next.js redacts custom error properties (e.g. `ApiClientError`'s
//      `errorCode`/`statusCode`) when an error thrown in a Server Component
//      crosses the serialization boundary into a Client Component
//      `error.tsx` in production builds — only a generic message + `digest`
//      survive. Fetching client-side keeps `ApiClientError` intact end to
//      end, so `getErrorMessage(err.errorCode)` continues to work.
//   2. Three of the five Parent View pages (Booking Form, Payment, Booking
//      Status) require client-side interactivity/mutations regardless, so
//      fetching uniformly via shared hooks keeps the data-fetching approach
//      consistent across the whole booking flow.
// Route-level `loading.tsx`/`error.tsx` files are still provided per route
// (per PATTERNS.md §3/§6) as a safety net for route-segment transitions and
// unexpected render errors; the primary loading/error UX for data fetching
// itself is handled inline via this hook's returned state.
import { useCallback, useEffect, useState } from "react";

import { ApiClientError } from "@shared/services/apiClient";
import { trialClassService } from "@shared/services/trialClassService";
import type { TrialClass } from "@shared/types";
import { getErrorMessage } from "@shared/utils/errorMessages";

export interface UseTrialClassesResult {
  trialClasses: TrialClass[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTrialClasses(): UseTrialClassesResult {
  const [trialClasses, setTrialClasses] = useState<TrialClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrialClasses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await trialClassService.getAll();
      setTrialClasses(data);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? getErrorMessage(err.errorCode)
          : "Failed to load trial classes. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Deliberate fetch-on-mount data loading (see the file-level comment
  // above for why this hook fetches client-side instead of via RSC);
  // `fetchTrialClasses` sets loading/data/error state asynchronously after
  // awaiting the API call, not synchronously within the effect body itself.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTrialClasses();
  }, [fetchTrialClasses]);

  return { trialClasses, isLoading, error, refetch: fetchTrialClasses };
}
