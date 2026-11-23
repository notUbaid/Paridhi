import { useEffect, useMemo, useState } from 'react';
import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';
import type { HealthResponse } from '@shared/types';
import { configureAuth } from './api';
import { SignIn } from './components/SignIn';
import { StatusScreen } from './components/StatusScreen';
import { Shell } from './Shell';

const clients = new Map<string, SupabaseClient>();

function supabaseFor(url: string, publishableKey: string): SupabaseClient {
  const cacheKey = `${url}|${publishableKey}`;
  let client = clients.get(cacheKey);
  if (!client) {
    client = createClient(url, publishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    clients.set(cacheKey, client);
  }
  return client;
}

interface AuthGateProps {
  health: HealthResponse;
  supabaseUrl: string;
  publishableKey: string;
}

/** Shows the sign-in screen until the owner has a Supabase session, then the dashboard. */
export default function AuthGate({ health, supabaseUrl, publishableKey }: AuthGateProps) {
  const supabase = useMemo(() => supabaseFor(supabaseUrl, publishableKey), [supabaseUrl, publishableKey]);
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    configureAuth(
      async () => (await supabase.auth.getSession()).data.session?.access_token ?? null,
      () => void supabase.auth.signOut()
    );
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSession(data.session);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => {
      active = false;
      data.subscription.unsubscribe();
      configureAuth(null, null);
    };
  }, [supabase]);

  if (session === undefined) return <StatusScreen message="Checking your session…" />;
  if (!session) return <SignIn supabase={supabase} />;

  return (
    <Shell
      key={session.user.id}
      health={health}
      account={{ email: session.user.email ?? 'Signed in', signOut: () => void supabase.auth.signOut() }}
    />
  );
}
