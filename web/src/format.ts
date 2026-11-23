export const IST = 'Asia/Kolkata';

export function formatCrore(inr: number): string {
  return `₹${(inr / 10_000_000).toFixed(2)} Cr`;
}

export function formatDate(iso: string, timeZone = IST): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone });
}

export function formatDateTime(iso: string, timeZone = IST): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
    timeZoneName: 'short'
  });
}

export function formatClock(date: Date, timeZone: string): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone });
}

/** "just now", "12 min ago", "3 h ago", "4 days ago", "in 2 days" */
export function formatRelative(iso: string, now: Date): string {
  const diffMs = new Date(iso).getTime() - now.getTime();
  const future = diffMs > 0;
  const minutes = Math.round(Math.abs(diffMs) / 60_000);
  let text: string;
  if (minutes < 1) return 'just now';
  if (minutes < 60) text = `${minutes} min`;
  else if (minutes < 60 * 24) text = `${Math.round(minutes / 60)} h`;
  else {
    const days = Math.round(minutes / (60 * 24));
    text = `${days} day${days === 1 ? '' : 's'}`;
  }
  return future ? `in ${text}` : `${text} ago`;
}

export function formatMeters(meters: number): string {
  return meters >= 100 ? `${Math.round(meters)} m` : `${meters.toFixed(1)} m`;
}
