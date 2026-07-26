// Navbar — App Shell spec per design/navigation.md's "App Shell" section.

export type AppRole = "parent" | "admin";

export interface NavbarProps {
  currentRole: AppRole;
  /**
   * Callback for button-based role switching (non-link mode).
   * Omit this and provide `crossAppUrl` instead for link-based navigation.
   */
  onRoleChange?: (role: AppRole) => void;
  /**
   * When provided, the role switch renders native <a> / <Link> elements
   * instead of <button> + onClick. The active role gets a client-side
   * <Link href="/">, and the inactive role gets a cross-app <a href>
   * pointing to `crossAppUrl`.
   */
  crossAppUrl?: string;
  className?: string;
}
