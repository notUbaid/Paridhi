import { LogoMark } from './LogoMark';

const SIZES = {
  sm: { text: 'text-lg', contours: 2 },
  md: { text: 'text-2xl', contours: 2 },
  lg: { text: 'text-3xl', contours: 2 },
  xl: { text: 'text-[clamp(3.5rem,11vw,7.5rem)]', contours: 4 }
} as const;

/** The paridhi lockup: the Landprint mark and the wordmark, as on the brand sheet. */
export function Wordmark({ size = 'md', className = '' }: { size?: keyof typeof SIZES; className?: string }) {
  const { text, contours } = SIZES[size];
  return (
    <span className={`inline-flex items-center gap-[0.3em] select-none leading-none ${text} ${className}`}>
      <LogoMark contours={contours} style={{ height: '1.2em', width: 'auto' }} className="shrink-0" />
      <span className="font-brand font-black text-ink tracking-[-0.045em] -translate-y-[0.04em]">paridhi</span>
    </span>
  );
}
