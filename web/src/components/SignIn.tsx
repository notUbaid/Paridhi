import { useState, type FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Mail } from 'lucide-react';
import type { PropertyLocation } from '@shared/types';
import { SurveyPlate } from '../owner/SurveyPlate';
import { Button } from '../ui/Button';
import { FormError, TextField } from '../ui/forms';
import { Wordmark } from '../ui/Wordmark';

type Mode = 'password' | 'link';

/** A sample plot, drawn on the sign-in screen as an illustration. */
const ILLUSTRATION: PropertyLocation = {
  village: 'Sample plot',
  mandalTaluk: '',
  district: '',
  state: 'Telangana',
  cityNear: '',
  center: { lat: 17.24, lng: 78.43 },
  boundaryPegs: [
    { id: 'P1', corner: 'NE', position: { lat: 17.24025, lng: 78.43048 } },
    { id: 'P2', corner: 'SE', position: { lat: 17.23984, lng: 78.43041 } },
    { id: 'P3', corner: 'SW', position: { lat: 17.2398, lng: 78.42952 } },
    { id: 'P4', corner: 'NW', position: { lat: 17.24019, lng: 78.42958 } }
  ],
  boundaries: { north: 'Village road', east: 'Canal feeder', south: 'Sy. No. 413', west: 'Sy. No. 411' }
};

export function SignIn({ supabase }: { supabase: SupabaseClient }) {
  const [mode, setMode] = useState<Mode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkSent, setLinkSent] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === 'password') {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (signInError) {
          setError(
            signInError.message === 'Invalid login credentials'
              ? 'That email and password do not match an account.'
              : signInError.message
          );
        }
      } else {
        // Accounts are created by Paridhi, so never sign up a new user from here. The reply is the
        // same whether or not the email has an account, to avoid revealing who is a customer.
        await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: { shouldCreateUser: false, emailRedirectTo: window.location.origin + window.location.pathname }
        });
        setLinkSent(true);
      }
    } catch {
      setError('Could not reach the sign-in service. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] bg-paper">
      <aside className="hidden lg:flex flex-col justify-between p-12 border-r border-line bg-sunken/60">
        <Wordmark size="lg" />
        <div className="max-w-lg">
          <div className="rounded-card overflow-hidden border border-line shadow-card bg-surface">
            <SurveyPlate location={ILLUSTRATION} surveyNumber="Sy. No. 412/A" />
          </div>
          <h2 className="font-display text-[34px] leading-tight text-ink mt-8">Your land in India, watched over while you're away.</h2>
          <ul className="mt-5 space-y-2 text-ink-soft">
            <li>A local inspector walks the boundary every month and photographs every peg.</li>
            <li>The land record is checked every week for applications you didn't make.</li>
            <li>Your advocate keeps a court caveat in place and acts when something is flagged.</li>
          </ul>
        </div>
        <p className="text-sm text-faint">Illustration of a sample plot.</p>
      </aside>

      <main className="flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-10">
            <Wordmark size="lg" />
          </div>
          <h1 className="font-display text-3xl text-ink">Sign in</h1>
          <p className="text-muted mt-1">See your plots, inspection reports and documents.</p>

          {linkSent ? (
            <div className="mt-8 rounded-card border border-line bg-surface p-5">
              <Mail className="w-6 h-6 text-accent" />
              <p className="text-ink mt-3">
                If <strong className="font-medium">{email.trim()}</strong> has a Paridhi account, a sign-in link is on its
                way. Open it on this device.
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 -ml-3"
                onClick={() => {
                  setLinkSent(false);
                  setMode('password');
                }}
              >
                Back to sign in
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-8 space-y-4">
              <TextField label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              {mode === 'password' && (
                <TextField
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              )}
              <FormError message={error} />
              <Button type="submit" variant="primary" disabled={busy} className="w-full">
                {busy ? 'Please wait…' : mode === 'password' ? 'Sign in' : 'Email me a sign-in link'}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'password' ? 'link' : 'password');
                  setError(null);
                }}
                className="w-full text-center text-sm text-ink-soft hover:text-ink underline underline-offset-4 cursor-pointer"
              >
                {mode === 'password' ? 'Email me a sign-in link instead' : 'Use my password instead'}
              </button>
            </form>
          )}

          <p className="text-sm text-muted mt-10">
            Accounts are set up by Paridhi when your plot is surveyed. Contact us if you need access.
          </p>
        </div>
      </main>
    </div>
  );
}
