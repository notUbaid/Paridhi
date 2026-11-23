import type { ReactNode } from 'react';
import type { PropertyStatus } from '@shared/domain';
import { STATUS_LABEL, STATUS_TONE, TONE, type Tone } from './tone';

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ tone = 'neutral', children, size = 'sm', className = '' }: BadgeProps) {
  const t = TONE[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap ${t.soft} ${t.text} ${t.line} ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'
      } ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} aria-hidden />
      {children}
    </span>
  );
}

export function StatusBadge({ status, size }: { status: PropertyStatus; size?: 'sm' | 'md' }) {
  return (
    <Badge tone={STATUS_TONE[status]} size={size}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}

export function Dot({ tone }: { tone: Tone }) {
  return <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${TONE[tone].dot}`} aria-hidden />;
}
