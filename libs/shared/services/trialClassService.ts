// Trial Class service module per PATTERNS.md §4.
//
// Endpoints per architecture/api-design.md:
//   GET /trial-classes             -> TrialClass[]
//   GET /trial-classes/{id}        -> TrialClass
//   GET /trial-classes/{id}/roster -> TrialClassRoster ({ trialClassId, participants })

import { apiClient } from "./apiClient";
import type { TrialClass, TrialClassRoster } from "@shared/types";

export const trialClassService = {
  getAll: () => apiClient.get<TrialClass[]>("/trial-classes"),

  getById: (id: string) => apiClient.get<TrialClass>(`/trial-classes/${id}`),

  getRoster: (id: string) =>
    apiClient.get<TrialClassRoster>(`/trial-classes/${id}/roster`),
};
