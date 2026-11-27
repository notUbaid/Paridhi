import type { ReactNode } from 'react';
import { Button } from '../ui/Button';
import { Wordmark } from '../ui/Wordmark';

interface StatusScreenProps {
  title?: string;
  message: ReactNode;
  action?: { label: string; onClick: () => void; icon?: ReactNode };
}

/** Full-page message for loading, errors and empty states. */
export function StatusScreen({ title, message, action }: StatusScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-6 bg-paper">
      <Wordmark />
      <div className="bg-surface border border-line rounded-card shadow-card p-7 max-w-md w-full text-center">
        {title && <h1 className="font-display text-title text-ink mb-2">{title}</h1>}
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
