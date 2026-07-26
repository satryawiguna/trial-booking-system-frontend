"use client";

// Page: Admin Dashboard — per design/pages/admin-dashboard.md.
//
// API GAP (flagged, not fabricated): design/navigation.md's route table
// lists this screen's data source as "GET /bookings (or equivalent
// aggregate)", but `architecture/api-design.md`'s Endpoint Summary does not
// document any such endpoint — only per-class reads
// (`GET /trial-classes`, `GET /trial-classes/{id}/roster`) and per-booking
// reads (`GET /bookings/{id}`) exist. There is no way to list every booking
// or its status across the system from the documented API.
//
// Resolution: this page fetches `GET /trial-classes`, then
// `GET /trial-classes/{id}/roster` for every class (roster is documented to
// return confirmed participants only — BR-011/INV-007), and aggregates
// those into a real (not invented) "Confirmed" count and participant list.
// The Total / Pending / Cancelled / Payment Failed stat cards — and the
// Booking ID / Date columns of the table — have no data source in the
// documented API at all, so they are rendered as explicitly "Not available"
// rather than fabricated. A `GET /bookings` (or equivalent aggregate)
// endpoint would need to be added to the API contract to fully implement
// this screen as specced; flagged for the Backend/Architect agents.
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { ErrorMessage, Skeleton, StatusBadge } from "@shared/components";
import { ApiClientError } from "@shared/services/apiClient";
import { trialClassService } from "@shared/services/trialClassService";
import { BookingStatus } from "@shared/types";
import { cn, getErrorMessage } from "@shared/utils";

interface ConfirmedRow {
  studentId: string;
  studentName: string;
  classId: string;
  classTitle: string;
}

interface DashboardData {
  classCount: number;
  confirmedCount: number;
  confirmedRows: ConfirmedRow[];
}

function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const classes = await trialClassService.getAll();
      const rosters = await Promise.all(
        classes.map((trialClass) => trialClassService.getRoster(trialClass.id)),
      );

      const confirmedRows: ConfirmedRow[] = [];
      rosters.forEach((roster, index) => {
        const trialClass = classes[index];
        roster.participants.forEach((participant) => {
          confirmedRows.push({
            studentId: participant.studentId,
            studentName: participant.studentName,
            classId: trialClass.id,
            classTitle: trialClass.title,
          });
        });
      });

      setData({
        classCount: classes.length,
        confirmedCount: confirmedRows.length,
        confirmedRows,
      });
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? getErrorMessage(err.errorCode)
          : "Failed to load dashboard data. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Deliberate fetch-on-mount data loading; see @shared/hooks/useTrialClasses
  // for the rationale on client-side fetching used consistently across both
  // apps in this repo.
  //
  // NOTE: unlike the shared hooks in libs/shared/hooks (which live outside
  // this app's own `next lint` scope), this hook is defined directly inside
  // apps/admin/src, where `next lint` resolves `eslint-plugin-react-hooks`
  // from eslint-config-next's own bundled (older) copy that does not define
  // the `react-hooks/set-state-in-effect` rule at all — an
  // `eslint-disable-next-line` referencing it here would itself fail as an
  // "unknown rule" lint error, so it is intentionally omitted.
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

type StatTone = "neutral" | "success" | "pending" | "danger";

const STAT_TONE_CLASS: Record<StatTone, string> = {
  neutral: "bg-surface-subtle text-foreground",
  success: "bg-success-bg text-success-text",
  pending: "bg-pending-bg text-pending-text",
  danger: "bg-danger-bg text-danger-text",
};

interface StatCardConfig {
  key: string;
  label: string;
  tone: StatTone;
  value: number | null;
}

function StatCard({ label, tone, value }: Omit<StatCardConfig, "key">) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-card p-card-sm shadow-card",
        STAT_TONE_CLASS[tone],
      )}
    >
      <span className="text-eyebrow uppercase opacity-80">{label}</span>
      <span className="text-h1">{value === null ? "—" : value}</span>
      {value === null && (
        <span className="text-xs font-medium opacity-80">
          Not available — no bookings-list endpoint documented
        </span>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div role="status" aria-label="Loading dashboard">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="card" className="h-28" />
        ))}
      </div>
      <Skeleton className="mt-10 h-6 w-48" />
      <Skeleton variant="card" className="mt-4 h-64" />
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboardData();

  const stats: StatCardConfig[] = [
    {
      key: "total",
      label: "Total Bookings",
      tone: "neutral",
      value: null,
    },
    {
      key: "confirmed",
      label: "Confirmed",
      tone: "success",
      value: data ? data.confirmedCount : null,
    },
    { key: "pending", label: "Pending", tone: "pending", value: null },
    {
      key: "paymentFailed",
      label: "Payment Failed",
      tone: "danger",
      value: null,
    },
    { key: "cancelled", label: "Cancelled", tone: "danger", value: null },
  ];

  return (
    <main className="mx-auto max-w-page-list px-6 py-8">
      <h1 className="text-h1 text-foreground">Admin Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        A quick, at-a-glance count of booking activity across all trial classes.
      </p>

      <div className="mt-8">
        {isLoading && <DashboardSkeleton />}

        {!isLoading && error && (
          <ErrorMessage message={error} onRetry={refetch} />
        )}

        {!isLoading && !error && data && (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {stats.map(({ key, ...stat }) => (
                <StatCard key={key} {...stat} />
              ))}
            </div>

            <section className="mt-10">
              <h2 className="text-section-title text-foreground">
                All Bookings
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Only confirmed bookings are shown below.{" "}
                <code className="rounded bg-surface-subtle px-1 py-0.5 text-xs">
                  architecture/api-design.md
                </code>{" "}
                does not document a bookings-list (or equivalent aggregate)
                endpoint, so pending, payment-failed, and cancelled bookings —
                and each booking&apos;s ID and date — cannot be retrieved. Rows
                below are derived from{" "}
                <code className="rounded bg-surface-subtle px-1 py-0.5 text-xs">
                  GET /trial-classes
                </code>{" "}
                +{" "}
                <code className="rounded bg-surface-subtle px-1 py-0.5 text-xs">
                  GET /trial-classes/{"{id}"}/roster
                </code>
                .
              </p>

              {data.confirmedRows.length === 0 ? (
                <div className="mt-4 rounded-card border border-border bg-surface-subtle px-6 py-16 text-center text-sm text-muted-foreground">
                  No confirmed bookings yet.
                </div>
              ) : (
                <div className="mt-4 overflow-x-auto rounded-card bg-surface shadow-card">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border bg-surface-subtle text-eyebrow uppercase text-muted-foreground">
                        <th className="px-card-sm py-3">Booking ID</th>
                        <th className="px-card-sm py-3">Student</th>
                        <th className="px-card-sm py-3">Class</th>
                        <th className="px-card-sm py-3">Status</th>
                        <th className="px-card-sm py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.confirmedRows.map((row) => (
                        <tr
                          key={`${row.classId}-${row.studentId}`}
                          className="border-b border-border last:border-0"
                        >
                          <td className="px-card-sm py-3 text-muted-foreground">
                            —
                          </td>
                          <td className="px-card-sm py-3 font-bold text-foreground">
                            {row.studentName}
                          </td>
                          <td className="px-card-sm py-3 text-foreground">
                            <Link
                              href={`/classes/${row.classId}/roster`}
                              className="hover:underline"
                            >
                              {row.classTitle}
                            </Link>
                          </td>
                          <td className="px-card-sm py-3">
                            <StatusBadge status={BookingStatus.CONFIRMED} />
                          </td>
                          <td className="px-card-sm py-3 text-muted-foreground">
                            —
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
