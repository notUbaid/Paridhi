import { useState, type FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Mail } from 'lucide-react';

type Mode = 'password' | 'link';

const inputClass =
  'w-full rounded border border-slate-200 px-2.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900';

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
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8fafc]">
      <div className="w-full max-w-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-slate-900 text-white flex items-center justify-center font-bold select-none">प</div>
          <div>
            <div className="text-base font-bold tracking-tight text-slate-900">PARIDHI</div>
            <div className="text-xs text-slate-500">Land protection for owners abroad</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          <h1 className="text-sm font-semibold text-slate-900">Sign in to see your plots</h1>

          {linkSent ? (
            <div className="space-y-3 text-xs text-slate-600">
              <p className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                If {email.trim()} has a Paridhi account, a sign-in link is on its way. Open it on this device.
              </p>
              <button
                type="button"
                onClick={() => {
                  setLinkSent(false);
                  setMode('password');
                }}
                className="underline text-slate-700 cursor-pointer"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label htmlFor="signin-email" className="font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>

              {mode === 'password' && (
                <div className="space-y-1">
                  <label htmlFor="signin-password" className="font-medium text-slate-700">
                    Password
                  </label>
                  <input
                    id="signin-password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>
              )}

              {error && (
                <div role="alert" className="rounded border border-red-200 bg-red-50 text-red-800 px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full py-2 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-xs font-semibold cursor-pointer"
              >
                {busy ? 'Please wait…' : mode === 'password' ? 'Sign in' : 'Email me a sign-in link'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'password' ? 'link' : 'password');
                  setError(null);
                }}
                className="w-full text-center text-slate-600 hover:text-slate-900 underline cursor-pointer"
              >
                {mode === 'password' ? 'Email me a sign-in link instead' : 'Sign in with a password instead'}
              </button>
            </form>
          )}
        </div>

        <p className="text-[11px] text-slate-400 text-center">
          Accounts are set up by Paridhi when your plot is surveyed. Contact us if you need access.
        </p>
      </div>
    </div>
  );
}
