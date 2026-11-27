import { useEffect, useState } from 'react';

/**
 * Minimal client-side routing. Pages link to each other with plain links (full page loads);
 * this only follows the back and forward buttons within a page.
 */
export function usePath(): string {
  const [path, setPath] = useState(() => window.location.pathname);
  useEffect(() => {
    const onChange = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onChange);
    return () => window.removeEventListener('popstate', onChange);
  }, []);
  return path;
}
