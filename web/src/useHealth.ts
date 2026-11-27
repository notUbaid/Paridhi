import { useCallback, useEffect, useState } from 'react';
import type { HealthResponse } from '@shared/types';
import { api, errorMessage } from './api';

/** The server's public settings: whether accounts are on, how to sign in, how to get in touch. */
export function useHealth() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setHealth(await api.health());
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { health, error, retry: load };
}
