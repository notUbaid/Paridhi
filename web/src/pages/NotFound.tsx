import { useEffect } from 'react';
import { buttonClass } from '../ui/Button';
import { Wordmark } from '../ui/Wordmark';

/** The page for any address that doesn't exist, and for pages someone isn't allowed to see. */
export function NotFound() {
  useEffect(() => {
    const previous = document.title;
    document.title = 'Page not found · Paridhi';
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-6 bg-paper text-center">
      <a href="/" aria-label="Paridhi home">
        <Wordmark />
      </a>
      <div>
        <h1 className="font-display text-title text-ink">Page not found</h1>
        <p className="text-muted mt-2">There's nothing at this address.</p>
      </div>
      <a href="/" className={buttonClass('primary')}>
        Go to the home page
      </a>
    </div>
  );
}
