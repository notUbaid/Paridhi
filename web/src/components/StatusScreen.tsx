import type { ReactNode } from 'react';
import { Button } from '../ui/Button';
import { Wordmark } from '../ui/Wordmark';

interface StatusScreenProps {
  title?: string;
  message: ReactNode;
  action?: { label: string; onClick: () => void; icon?: ReactNode };
}

/** A plot boundary drawing itself: shown while something loads. */
function Loader() {
  return (
    <svg viewBox="0 0 64 48" className="w-16 h-12 mx-auto mb-4" aria-hidden>
      <path d="M 10 12 L 54 6 L 50 40 L 8 36 Z" pathLength={1} className="loader-draw" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinejoin="round" />
      {[
        [10, 12],
        [54, 6],
        [50, 40],
        [8, 36]
      ].map(([cx, cy], index) => (
        <circle key={index} cx={cx} cy={cy} r="3" fill="var(--color-surface)" stroke="var(--color-ink)" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

/** Full-page message for loading, errors and empty states. */
export function StatusScreen({ title, message, action }: StatusScreenProps) {
  const loading = !title && !action;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-6 bg-paper">
      <a href="/" aria-label="Paridhi home">
        <Wordmark />
      </a>
      <div className="bg-surface border-2 border-ink rounded-card shadow-print p-7 max-w-md w-full text-center enter" role={loading ? 'status' : undefined}>
        {loading && <Loader />}
        {title && <h1 className="font-display font-bold text-title text-ink mb-2">{title}</h1>}
        <p className={`leading-relaxed ${title ? 'text-muted' : 'text-ink-soft'}`}>{message}</p>
        {action && (
          <Button variant="primary" onClick={action.onClick} icon={action.icon} className="mt-5">
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
