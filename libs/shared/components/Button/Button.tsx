// Button — see design/components/button.md for the variant spec this
// implements (Primary / Text / Outline / Chip).
import { forwardRef } from "react";

import { cn } from "@shared/utils";

import type { ButtonProps } from "./Button.types";

const BASE_STYLES =
  "inline-flex items-center justify-center gap-2 rounded-button font-extrabold transition-colors " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary " +
  "disabled:cursor-not-allowed";

// Exact color values are taken from design/components/button.md. Where a
// value has no equivalent design token in tailwind.config.base.js (e.g. the
// primary-disabled / outline-danger / text-link colors), an arbitrary oklch
// value matching the spec is used instead of inventing a new token.
const VARIANT_STYLES: Record<
  Exclude<ButtonProps["variant"], undefined>,
  string
> = {
  primary:
    "bg-primary px-9 py-[15px] text-[15px] text-white hover:bg-primary-hover " +
    "disabled:bg-[oklch(0.88_0.02_80)] disabled:text-[oklch(0.55_0.02_80)] disabled:hover:bg-[oklch(0.88_0.02_80)]",
  text: "bg-transparent px-0 py-1 text-[15px] font-bold text-[oklch(0.55_0.16_48)] hover:text-[oklch(0.435_0.16_48)] disabled:text-muted-foreground",
  outline:
    "border-[1.5px] border-[oklch(0.80_0.10_25)] bg-white px-6 py-3 text-[15px] text-danger-text " +
    "hover:bg-danger-bg disabled:border-border disabled:text-muted-foreground disabled:hover:bg-white",
  chip: "rounded-full border px-4 py-2 text-sm",
};

const CHIP_ACTIVE_STYLES = "border-primary bg-primary/10 text-primary-active";
const CHIP_INACTIVE_STYLES =
  "border-transparent bg-surface-subtle text-muted-foreground hover:bg-border/40";

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-4 w-4 animate-spin", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"
      />
    </svg>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      isLoading = false,
      isActive = false,
      fullWidth = false,
      disabled,
      className,
      children,
      type = "button",
      ...rest
    },
    ref,
  ) {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading || undefined}
        className={cn(
          BASE_STYLES,
          VARIANT_STYLES[variant],
          variant === "chip" &&
            (isActive ? CHIP_ACTIVE_STYLES : CHIP_INACTIVE_STYLES),
          fullWidth && "w-full",
          className,
        )}
        {...rest}
      >
        {isLoading && <Spinner />}
        {children}
      </button>
    );
  },
);
