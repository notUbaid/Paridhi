import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import type { HealthResponse, Viewer } from '@shared/types';
import { api, errorMessage } from './api';
import { StatusScreen } from './components/StatusScreen';
import { Dashboard, type Account } from './Dashboard';
import { navigate, usePath } from './router';

const StaffConsole = lazy(() => import('./staff/StaffConsole'));

interface ShellProps {
  health: HealthResponse;
  account: Account | null;
}

/** Loads who the viewer is and shows the owner view or, for staff at /staff, the staff console. */
export function Shell({ health, account }: ShellProps) {
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const path = usePath();

  const load = useCallback(async () => {
    try {
      setError(null);
      setViewer(await api.me());
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Staff accounts land in the console; owners and the demo land in the owner view.
  useEffect(() => {
    if (viewer?.staffRole && !viewer.demo && path === '/') navigate('/staff');
  }, [viewer, path]);

  if (error) {
    return (
      <StatusScreen
        title="Can't load your account"
        message={error}
        action={{ label: 'Try again', onClick: () => void load(), icon: <RefreshCw className="w-3.5 h-3.5" /> }}
      />
    );
  }
  if (!viewer) return <StatusScreen message="Loading…" />;

  if (path.startsWith('/staff') && viewer.staffRole) {
    return (
      <Suspense fallback={<StatusScreen message="Loading the staff console…" />}>
        <StaffConsole health={health} viewer={viewer} account={account} onOpenOwnerView={() => navigate('/')} />
      </Suspense>
    );
  }

  return (
    <Dashboard
      health={health}
      account={account}
      onOpenStaffConsole={viewer.staffRole ? () => navigate('/staff') : undefined}
    />
  );
}
