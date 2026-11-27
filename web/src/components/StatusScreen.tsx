import type { ReactNode } from 'react';
import { Button } from '../ui/Button';
import { LogoMark } from '../ui/LogoMark';
import { Wordmark } from '../ui/Wordmark';

interface StatusScreenProps {
  title?: string;
  message: ReactNode;
  action?: { label: string; onClick: () => void; icon?: ReactNode };
}

/** The mark, its survey point pulsing: shown while something loads. */
function Loader() {
  return <LogoMark contours={4} pulse className="h-20 w-auto mx-auto mb-5" />;
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
