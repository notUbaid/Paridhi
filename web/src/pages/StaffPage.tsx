import { Suspense, lazy, useEffect, useState } from 'react';
import type { Viewer } from '@shared/types';
import { api } from '../api';
import { StatusScreen } from '../components/StatusScreen';
import type { Account } from '../session';
import { useHealth } from '../useHealth';
import { NotFound } from './NotFound';

const AuthGate = lazy(() => import('../AuthGate'));
const StaffConsole = lazy(() => import('../staff/StaffConsole'));

/**
 * The staff console. It is linked from nowhere and looks like any missing page to everyone
 * except signed-in staff, who sign in on the normal sign-in page and are sent here.
 */
export default function StaffPage() {
  const { health, error } = useHealth();

  useEffect(() => {
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);
    return () => robots.remove();
  }, []);

  if (error) return <NotFound />;
  if (!health) return <StatusScreen message="Loading…" />;
  if (!health.auth.required) return <NotFound />;

  return (
    <Suspense fallback={<StatusScreen message="Loading…" />}>
      <AuthGate supabaseUrl={health.auth.supabaseUrl} publishableKey={health.auth.publishableKey} signedOut={<NotFound />}>
        {(account) => <StaffOnly account={account} />}
      </AuthGate>
    </Suspense>
  );
}

function StaffOnly({ account }: { account: Account }) {
  const [viewer, setViewer] = useState<Viewer | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    api
      .me()
      .then((me) => active && setViewer(me))
      .catch(() => active && setViewer(null));
    return () => {
      active = false;
    };
  }, []);

  if (viewer === undefined) return <StatusScreen message="Loading…" />;
  if (!viewer?.staffRole) return <NotFound />;
  return (
    <Suspense fallback={<StatusScreen message="Loading…" />}>
      <StaffConsole viewer={viewer} account={account} />
    </Suspense>
  );
}
