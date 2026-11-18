const MINUTE_MS = 60 * 1000;
const HOUR_MINUTES = 60;

export function formatRemaining(ms: number): string {
  if (ms <= 0) return "Expiré";

  const totalMinutes = Math.ceil(ms / MINUTE_MS);
  if (totalMinutes < HOUR_MINUTES) return `${totalMinutes} min`;

  const hours = Math.floor(totalMinutes / HOUR_MINUTES);
  const minutes = totalMinutes % HOUR_MINUTES;
  return `${hours} h ${String(minutes).padStart(2, "0")}`;
}
