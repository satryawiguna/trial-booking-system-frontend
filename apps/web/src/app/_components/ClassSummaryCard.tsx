// ClassSummaryCard — sticky trial-class summary panel reused by the Booking
// Form and Payment pages, per design/pages/booking.md ("sticky class-summary
// card (260px, 'Total: Free' line)") and design/pages/payment.md ("Sticky
// class-summary card (same as Booking Form)").
//
// Page-composition component (not a `design/components/*.md`-specced
// reusable design-system primitive), so it lives alongside the pages that
// use it in apps/web rather than in libs/shared/components.
import { formatDateTime } from "@shared/utils";
import type { TrialClass } from "@shared/types";

export interface ClassSummaryCardProps {
  trialClass: TrialClass;
  className?: string;
}

export function ClassSummaryCard({
  trialClass,
  className,
}: ClassSummaryCardProps) {
  const scheduleLabel = formatDateTime(trialClass.startTime);

  return (
    <aside
      className={`flex w-full flex-col gap-4 self-start rounded-card border border-border bg-surface p-card-sm shadow-card md:sticky md:top-24 md:w-[260px] ${className ?? ""}`}
      aria-label="Trial class summary"
    >
      <h2 className="text-section-title text-foreground">{trialClass.title}</h2>

      {scheduleLabel && (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
          />
          {scheduleLabel}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border pt-4 text-sm font-extrabold text-foreground">
        <span>Total</span>
        <span>Free</span>
      </div>
    </aside>
  );
}
