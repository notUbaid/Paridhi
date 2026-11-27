import { Suspense, lazy, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { api, errorMessage } from '../api';
import { StatusScreen } from '../components/StatusScreen';
import OwnerView from '../owner/OwnerView';
import type { Account } from '../session';
import { buttonClass } from '../ui/Button';
import { Wordmark } from '../ui/Wordmark';
import { useHealth } from '../useHealth';

const AuthGate = lazy(() => import('../AuthGate'));

/** Customer accounts: sign in, then your plots. */
export default function AccountPage() {
  const { health, error, retry } = useHealth();

  if (error) {
    return (
      <StatusScreen
        title="Can't reach Paridhi"
        message={error}
        action={{ label: 'Try again', onClick: () => void retry(), icon: <RefreshCw className="w-3.5 h-3.5" /> }}
      />
    );
  }
  if (!health) return <StatusScreen message="Loading…" />;
  if (!health.auth.required) return <AccountsNotOpen />;

  return (
    <Suspense fallback={<StatusScreen message="Loading sign-in…" />}>
      <AuthGate supabaseUrl={health.auth.supabaseUrl} publishableKey={health.auth.publishableKey}>
        {(account) => <SignedIn account={account} />}
      </AuthGate>
    </Suspense>
  );
}

/** Staff who sign in here are taken to their console; everyone else sees their plots. */
function SignedIn({ account }: { account: Account }) {
  const [state, setState] = useState<'loading' | 'owner' | { error: string }>('loading');

  useEffect(() => {
    let active = true;
    api
      .me()
      .then((viewer) => {
        if (!active) return;
        if (viewer.staffRole) window.location.replace('/staff');
        else setState('owner');
      })
      .catch((err) => active && setState({ error: errorMessage(err) }));
    return () => {
      active = false;
    };
  }, []);

  if (state === 'loading') return <StatusScreen message="Loading your plots…" />;
  if (state !== 'owner') {
    return <StatusScreen title="Can't load your account" message={state.error} action={{ label: 'Sign out', onClick: account.signOut }} />;
  }
  return <OwnerView account={account} />;
}

function AccountsNotOpen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-6 bg-paper text-center">
      <a href="/" aria-label="Paridhi home">
        <Wordmark />
      </a>
      <div className="max-w-md">
        <h1 className="font-display text-title text-ink">Accounts open soon</h1>
        <p className="text-muted mt-2">
          We're setting up owner accounts. In the meantime, book a free plot check and we'll get in touch, or look around
          the demo.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <a href="/#book" className={buttonClass('brand')}>
          Book a free plot check
        </a>
        <a href="/demo" className={buttonClass('secondary')}>
          See the demo
        </a>
      </div>
    </div>
  );
}
