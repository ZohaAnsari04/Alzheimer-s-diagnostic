export function formatScore(score: number | undefined | null): string {
  if (score === undefined || score === null) return 'N/A';
  return score.toFixed(1);
}

export function getPriorityBadgeColor(level: string | undefined): { bg: string; text: string; border: string } {
  switch (level) {
    case 'HIGH':
      return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' };
    case 'MEDIUM':
      return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' };
    case 'LOW':
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    default:
      return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' };
  }
}

export function formatDateTime(isoString: string | undefined): string {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}
