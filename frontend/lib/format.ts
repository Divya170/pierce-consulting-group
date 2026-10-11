export function formatDate(iso: string | null | undefined, isSample = false): string {
  if (isSample || !iso) return 'DATE ON PUBLISH';
  try {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase();
  } catch {
    return '';
  }
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export function pad2(n: number) {
  return String(n).padStart(2, '0');
}

export const INQUIRY_STATUS_LABEL = {
  new: 'NEW',
  review: 'IN REVIEW',
  contacted: 'CONTACTED',
  closed: 'CLOSED',
} as const;
