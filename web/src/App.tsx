import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import type { HealthResponse } from '@shared/types';
import { api, errorMessage } from './api';
import { StatusScreen } from './components/StatusScreen';
import { Shell } from './Shell';

// Only loaded when the server requires sign-in, so the open demo never downloads the auth client.
const AuthGate = lazy(() => import('./AuthGate'));

export default function App() {
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

  if (error) {
    return (
      <StatusScreen
        title="Can't reach Paridhi"
        message={error}
        action={{ label: 'Try again', onClick: () => void load(), icon: <RefreshCw className="w-3.5 h-3.5" /> }}
      />
    );
  }
  if (!health) return <StatusScreen message="Loading…" />;

  if (health.auth.required) {
    return (
      <Suspense fallback={<StatusScreen message="Loading sign-in…" />}>
        <AuthGate health={health} supabaseUrl={health.auth.supabaseUrl} publishableKey={health.auth.publishableKey} />
      </Suspense>
    );
  }

  return <Shell health={health} account={null} />;
}
