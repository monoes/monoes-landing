// Dates rendered in components that run on both the server (UTC, English)
// and in the browser (the visitor's locale and time zone) must format the
// same way in both places, or React's hydration fails (minified error #418)
// and throws the server HTML away. Fixed locale and UTC everywhere.
const DATE = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const DATE_TIME = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});

/** "Sep 28, 2026" */
export function formatDate(value: string | number | Date): string {
  return DATE.format(new Date(value));
}

/** "Sep 28, 2026, 07:27 PM UTC" */
export function formatDateTime(value: string | number | Date): string {
  return DATE_TIME.format(new Date(value));
}
