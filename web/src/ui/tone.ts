import type { PropertyStatus } from '@shared/domain';

export type Tone = 'ok' | 'warn' | 'bad' | 'neutral';

export const STATUS_TONE: Record<PropertyStatus, Tone> = {
  ALL_CLEAR: 'ok',
  ATTENTION_NEEDED: 'warn',
  ACTION_REQUIRED: 'bad'
};

export const STATUS_LABEL: Record<PropertyStatus, string> = {
  ALL_CLEAR: 'All clear',
  ATTENTION_NEEDED: 'Needs attention',
  ACTION_REQUIRED: 'Action needed'
};

/** Classes for a tone: text colour, soft background, border, and solid dot. */
export const TONE: Record<Tone, { text: string; soft: string; line: string; dot: string }> = {
  ok: { text: 'text-ok', soft: 'bg-ok-soft', line: 'border-ok-line', dot: 'bg-ok' },
  warn: { text: 'text-warn', soft: 'bg-warn-soft', line: 'border-warn-line', dot: 'bg-warn' },
  bad: { text: 'text-bad', soft: 'bg-bad-soft', line: 'border-bad-line', dot: 'bg-bad' },
  neutral: { text: 'text-muted', soft: 'bg-sunken', line: 'border-line', dot: 'bg-faint' }
};
