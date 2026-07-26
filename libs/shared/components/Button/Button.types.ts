// Props for the shared Button component.
//
// Variants per design/components/button.md:
//   - "primary": solid fill, main forward action (Book, Continue, Confirm).
//   - "text":    no background/border, used for "← Back to …" links and
//                admin tab items.
//   - "outline": white bg, colored border/text, used only for Cancel Booking.
//   - "chip":    admin roster filter chips / class-card pill tabs — has an
//                `isActive` on/off state rather than a `disabled` state.

import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "text" | "outline" | "chip";

export interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "className"
> {
  /** Visual style. Defaults to "primary". */
  variant?: ButtonVariant;
  /** Shows a spinner and disables the button (e.g. while a request is in flight). */
  isLoading?: boolean;
  /** "chip" variant only — whether this chip/tab is the active/selected one. */
  isActive?: boolean;
  /** Stretches the button to fill its container width. */
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}
