import { useEffect, useState, type FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Mail } from 'lucide-react';
import { ILLUSTRATION } from '../owner/illustration';
import { SurveyPlate } from '../owner/SurveyPlate';
import { Button } from '../ui/Button';
import { FormError, TextField } from '../ui/forms';
import { Wordmark } from '../ui/Wordmark';

type Mode = 'sign-in' | 'sign-up' | 'link';

const MIN_PASSWORD = 8;

/** Whether Google sign-in is switched on for this Supabase project (a public settings endpoint). */
function useGoogleEnabled(supabaseUrl: string, publishableKey: string): boolean {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    let active = true;
    fetch(`${supabaseUrl.replace(/\/+$/, '')}/auth/v1/settings`, { headers: { apikey: publishableKey } })
      .then((response) => (response.ok ? response.json() : null))
      .then((settings: { external?: { google?: boolean } } | null) => {
        if (active) setEnabled(settings?.external?.google === true);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [supabaseUrl, publishableKey]);
  return enabled;
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 18 18" className="w-4 h-4" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

interface SignInProps {
  supabase: SupabaseClient;
  supabaseUrl: string;
  publishableKey: string;
}

export function SignIn({ supabase, supabaseUrl, publishableKey }: SignInProps) {
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<'link' | 'confirm' | null>(null);
  const googleEnabled = useGoogleEnabled(supabaseUrl, publishableKey);
  const returnTo = `${window.location.origin}${window.location.pathname}`;

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === 'sign-in') {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (signInError) {
          setError(
            signInError.message === 'Invalid login credentials'
              ? 'That email and password do not match an account.'
              : signInError.message === 'Email not confirmed'
                ? 'Please confirm your email first. Check your inbox for the link we sent.'
                : signInError.message
          );
        }
      } else if (mode === 'sign-up') {
        if (password.length < MIN_PASSWORD) {
          setError(`Use at least ${MIN_PASSWORD} characters for your password.`);
          return;
        }
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: returnTo }
        });
        if (signUpError) setError(signUpError.message);
        // With email confirmation on, there is no session until the link is opened.
        else if (!data.session) setSent('confirm');
      } else {
        // Sign-in links only go to existing accounts. The reply is the same either way, so it
        // never reveals who has an account.
        await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: false, emailRedirectTo: returnTo } });
        setSent('link');
      }
    } catch {
      setError('Could not reach the sign-in service. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: returnTo } });
    if (oauthError) setError(oauthError.message);
  };

  const heading = mode === 'sign-up' ? 'Create your account' : 'Sign in';

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] bg-paper">
      <aside className="hidden lg:flex flex-col justify-between p-12 border-r border-line bg-sunken/60">
        <a href="/" aria-label="Paridhi home">
          <Wordmark size="lg" />
        </a>
        <div className="max-w-lg">
          <div className="rounded-card overflow-hidden border border-line shadow-card bg-surface">
            <SurveyPlate location={ILLUSTRATION} surveyNumber="Sy. No. 412/A" />
          </div>
          <h2 className="font-display text-title text-ink mt-8">Your land in India, watched over while you're away.</h2>
          <ul className="mt-5 space-y-2 text-ink-soft">
            <li>A local inspector walks the boundary every month and photographs every peg.</li>
            <li>The land record is checked regularly for applications you didn't make.</li>
            <li>Your advocate keeps a court caveat in place and acts when something is flagged.</li>
          </ul>
        </div>
        <p className="text-small text-faint">Illustration of a sample plot.</p>
      </aside>

      <main className="flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <a href="/" aria-label="Paridhi home" className="lg:hidden mb-10 inline-block">
            <Wordmark size="lg" />
          </a>
          <h1 className="font-display text-title text-ink">{heading}</h1>
          <p className="text-muted mt-1">
            {mode === 'sign-up' ? 'Then tell us about your plot and we’ll set it up.' : 'See your plots, inspection reports and documents.'}
          </p>

          {sent ? (
            <div className="mt-8 rounded-card border border-line bg-surface p-5" role="status">
              <Mail className="w-6 h-6 text-accent" aria-hidden />
              <p className="text-ink mt-3">
                {sent === 'confirm' ? (
                  <>
                    We've sent a confirmation link to <strong className="font-medium">{email.trim()}</strong>. Open it on this
                    device to finish creating your account.
                  </>
                ) : (
                  <>
                    If <strong className="font-medium">{email.trim()}</strong> has a Paridhi account, a sign-in link is on its
                    way. Open it on this device.
                  </>
                )}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 -ml-3"
                onClick={() => {
                  setSent(null);
                  switchMode('sign-in');
                }}
              >
                Back to sign in
              </Button>
            </div>
          ) : (
            <>
              {googleEnabled && mode !== 'link' && (
                <>
                  <Button className="w-full mt-8" onClick={signInWithGoogle} icon={<GoogleIcon />}>
                    Continue with Google
                  </Button>
                  <div className="flex items-center gap-3 mt-6 text-small text-faint" aria-hidden>
                    <span className="h-px flex-1 bg-line" />
                    or with email
                    <span className="h-px flex-1 bg-line" />
                  </div>
                </>
              )}
              <form onSubmit={submit} className={`${googleEnabled && mode !== 'link' ? 'mt-6' : 'mt-8'} space-y-4`}>
                <TextField label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                {mode !== 'link' && (
                  <TextField
                    label="Password"
                    type="password"
                    autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
                    required
                    minLength={mode === 'sign-up' ? MIN_PASSWORD : undefined}
                    hint={mode === 'sign-up' ? `At least ${MIN_PASSWORD} characters.` : undefined}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                )}
                <FormError message={error} />
                <Button type="submit" variant="primary" disabled={busy} className="w-full">
                  {busy ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : mode === 'sign-up' ? 'Create account' : 'Email me a sign-in link'}
                </Button>
                {mode !== 'sign-up' && (
                  <button
                    type="button"
                    onClick={() => switchMode(mode === 'sign-in' ? 'link' : 'sign-in')}
                    className="w-full text-center text-sm text-ink-soft hover:text-ink underline underline-offset-4 cursor-pointer"
                  >
                    {mode === 'sign-in' ? 'Email me a sign-in link instead' : 'Use my password instead'}
                  </button>
                )}
              </form>

              <p className="text-sm text-muted mt-10">
                {mode === 'sign-up' ? (
                  <>
                    Already have an account?{' '}
                    <button type="button" onClick={() => switchMode('sign-in')} className="text-ink underline underline-offset-4 cursor-pointer">
                      Sign in
                    </button>
                  </>
                ) : (
                  <>
                    New to Paridhi?{' '}
                    <button type="button" onClick={() => switchMode('sign-up')} className="text-ink underline underline-offset-4 cursor-pointer">
                      Create an account
                    </button>{' '}
                    or{' '}
                    <a href="/demo" className="text-ink underline underline-offset-4">
                      see the demo
                    </a>
                    .
                  </>
                )}
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
