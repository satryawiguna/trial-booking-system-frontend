/**
 * Shared Tailwind design tokens for the Trial Booking System.
 *
 * Source of truth: https://github.com/satryawiguna/trial-booking-system-context/blob/master/design/design-system.md
 * Values are taken verbatim from that document. Where the doc gives a range
 * (e.g. "oklch(0.40–0.55 0.03 50)"), the midpoint is used here.
 *
 * Each app (apps/web, apps/admin) requires this file and spreads
 * `theme.extend` into its own tailwind.config.js so tokens stay in sync
 * across both apps without duplication.
 *
 * NOT included here (by design):
 * - Category accent colors (per subject/class): computed dynamically from a
 *   per-class `accentHue` value — `headerBg = oklch(0.88 0.10 {accentHue})`,
 *   `headerColor = oklch(0.28 0.12 {accentHue})`. These are not fixed tokens
 *   and should be generated at runtime (e.g. inline style or a small helper)
 *   when the TrialCard component is implemented.
 * - Capacity/seat indicator colors: these reuse the semantic success/pending
 *   /danger tokens below, derived from `seatsLeft` at render time, not a
 *   separate static token set.
 */

/** @type {{ theme: { extend: import('tailwindcss').Config['theme'] } }} */
module.exports = {
  theme: {
    extend: {
      colors: {
        background: "oklch(0.97 0.012 80)",
        foreground: "oklch(0.18 0.02 50)",
        "muted-foreground": "oklch(0.48 0.03 50)",
        border: "oklch(0.90 0.02 80)",
        surface: "#ffffff",
        "surface-subtle": "oklch(0.955 0.015 80)",

        primary: {
          DEFAULT: "oklch(0.62 0.17 48)",
          hover: "oklch(0.54 0.17 48)",
          active: "oklch(0.45 0.16 48)",
        },

        success: {
          text: "oklch(0.415 0.14 155)",
          bg: "oklch(0.935 0.06 155)",
        },
        pending: {
          text: "oklch(0.48 0.14 60)",
          bg: "oklch(0.93 0.06 80)",
        },
        danger: {
          text: "oklch(0.50 0.14 25)",
          bg: "oklch(0.945 0.05 25)",
        },
      },

      fontFamily: {
        sans: ["var(--font-nunito)", "Nunito", "sans-serif"],
      },
      fontSize: {
        // Page title (H1): 26–30px / weight 800–900
        h1: ["28px", { lineHeight: "1.2", fontWeight: "800" }],
        // Section title: 20px / weight 800
        "section-title": ["20px", { lineHeight: "1.3", fontWeight: "800" }],
        // Label / eyebrow: 10–12px / weight 700 / uppercase / tracking .05–.08em
        eyebrow: [
          "11px",
          { lineHeight: "1.4", fontWeight: "700", letterSpacing: "0.065em" },
        ],
      },

      borderRadius: {
        // input/button: 10–12px
        button: "11px",
        input: "11px",
        // card: 14–16px
        card: "15px",
        // large panel (status page): 20px
        panel: "20px",
      },

      spacing: {
        // Card padding ranges from 20–40px depending on card size
        "card-sm": "20px",
        "card-lg": "40px",
      },

      maxWidth: {
        // Page max width — list views
        "page-list": "1140px",
        // Page max width — detail/form views
        "page-form": "860px",
        // Page max width — status view
        "page-status": "640px",
      },

      boxShadow: {
        navbar: "0 1px 8px rgba(0,0,0,.05)",
        card: "0 2px 12px rgba(0,0,0,.07)",
        "card-hover": "0 8px 28px rgba(0,0,0,.12)",
      },
    },
  },
};
