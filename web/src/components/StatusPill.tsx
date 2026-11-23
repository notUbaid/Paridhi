import type { PropertyStatus } from '@shared/domain';

const STYLES: Record<PropertyStatus, { label: string; short: string; className: string; dot: string }> = {
  ALL_CLEAR: {
    label: 'All checks clear',
    short: 'Clear',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500'
  },
  ATTENTION_NEEDED: {
    label: 'Needs attention',
    short: 'Attention',
    className: 'bg-amber-50 text-amber-900 border-amber-300',
    dot: 'bg-amber-500'
  },
  ACTION_REQUIRED: {
    label: 'Action required',
    short: 'Action',
    className: 'bg-red-50 text-red-800 border-red-200',
    dot: 'bg-red-500'
  }
};

export function StatusPill({ status, compact = false }: { status: PropertyStatus; compact?: boolean }) {
  const style = STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border font-medium shrink-0 ${style.className} ${
        compact ? 'text-[10px] px-1.5 py-0.5 font-mono' : 'text-xs px-2.5 py-0.5'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {compact ? style.short : style.label}
    </span>
  );
}
