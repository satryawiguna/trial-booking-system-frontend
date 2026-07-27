// Student service module per PATTERNS.md §4.
//
// Endpoints:
//   POST /students  -> create()  (request: CreateStudentInput)
//   GET  /students  -> list()
//
// RESOLUTION (Option 2): POST /students is called by the Booking Form page
// before POST /bookings, so the backend receives a `studentId` (UUID) rather
// than raw registrant fields in the booking payload.

import { apiClient } from "./apiClient";
import type { CreateStudentInput, CreateStudentResult } from "@shared/types";

export const studentService = {
  create: (input: CreateStudentInput) =>
    apiClient.post<CreateStudentResult>("/students", input),

  list: () =>
    apiClient.get<{
      students: Array<{ id: string; name: string; birthDate: string }>;
    }>("/students"),
};
