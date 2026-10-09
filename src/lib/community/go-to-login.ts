import { loginUrlFor } from "./safe-next";

/**
 * Sends a logged-out visitor to the login page and, after they log in, back
 * to the page they're on. Browsing is open to everyone; voting, commenting,
 * posting and downloading call this when the visitor isn't logged in (or an
 * API call comes back 401).
 */
export function goToLogin(): void {
  window.location.assign(loginUrlFor(window.location.pathname + window.location.search));
}
