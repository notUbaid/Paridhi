import { useState, type FormEvent } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { PlotRequestInput } from '@shared/types';
import { errorMessage } from '../api';
import { Button } from '../ui/Button';
import { FormError, SelectField, TextArea, TextField } from '../ui/forms';

/** States with land record checks first, then the others people most often ask about. */
const STATES = ['Telangana', 'Karnataka', 'Punjab', 'Andhra Pradesh', 'Maharashtra', 'Tamil Nadu', 'Gujarat', 'Kerala', 'Delhi-NCR'];
const OTHER = 'Other';

interface PlotRequestFormProps {
  /** "website" asks for name and email; "account" uses the signed-in email. */
  mode: 'website' | 'account';
  accountEmail?: string;
  submitLabel: string;
  onSubmit: (input: PlotRequestInput & { website: string }) => Promise<void>;
  onCancel?: () => void;
  /** Shown after a successful submit, in place of the form. */
  doneTitle: string;
  doneMessage: string;
}

export function PlotRequestForm({ mode, accountEmail, submitLabel, onSubmit, onCancel, doneTitle, doneMessage }: PlotRequestFormProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    state: '',
    otherState: '',
    district: '',
    village: '',
    surveyNumber: '',
    notes: '',
    website: ''
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const set = (field: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));
  const optional = (value: string) => value.trim() || null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSubmit({
        name: form.name.trim(),
        email: mode === 'account' ? (accountEmail ?? '') : form.email.trim(),
        phone: optional(form.phone),
        country: optional(form.country),
        state: form.state === OTHER ? form.otherState.trim() : form.state,
        district: form.district.trim(),
        village: optional(form.village),
        surveyNumber: optional(form.surveyNumber),
        notes: optional(form.notes),
        website: form.website
      });
      setDone(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-card border border-ok-line bg-ok-soft p-6" role="status">
        <CheckCircle2 className="w-6 h-6 text-ok" aria-hidden />
        <h3 className="font-display text-heading text-ink mt-3">{doneTitle}</h3>
        <p className="text-ink-soft mt-1">{doneMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Your name" required autoComplete="name" maxLength={120} value={form.name} onChange={set('name')} />
        {mode === 'website' ? (
          <TextField label="Email" type="email" required autoComplete="email" maxLength={254} value={form.email} onChange={set('email')} />
        ) : (
          <TextField label="Email" value={accountEmail ?? ''} disabled hint="We'll reply to your account email." />
        )}
        <TextField
          label="WhatsApp or phone"
          type="tel"
          autoComplete="tel"
          maxLength={40}
          placeholder="+1 555 010 0000"
          hint="With the country code. Optional."
          value={form.phone}
          onChange={set('phone')}
        />
        <TextField
          label="Country you live in"
          autoComplete="country-name"
          maxLength={80}
          value={form.country}
          onChange={set('country')}
        />
      </div>

      <fieldset className="space-y-4 pt-2">
        <legend className="eyebrow mb-3">The plot</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField label="State" required value={form.state} onChange={set('state')}>
            <option value="" disabled>
              Choose a state
            </option>
            {STATES.map((state) => (
              <option key={state}>{state}</option>
            ))}
            <option value={OTHER}>Another state</option>
          </SelectField>
          {form.state === OTHER ? (
            <TextField label="Which state?" required maxLength={60} value={form.otherState} onChange={set('otherState')} />
          ) : (
            <TextField label="District" required maxLength={80} value={form.district} onChange={set('district')} />
          )}
          {form.state === OTHER && (
            <TextField label="District" required maxLength={80} value={form.district} onChange={set('district')} />
          )}
          <TextField label="Village or town" maxLength={120} value={form.village} onChange={set('village')} />
          <TextField
            label="Survey number"
            maxLength={80}
            placeholder="e.g. 412/A"
            hint="If you know it. It's on the sale deed."
            value={form.surveyNumber}
            onChange={set('surveyNumber')}
          />
        </div>
        <TextArea
          label="Anything we should know"
          maxLength={1000}
          placeholder="When you bought it, whether anyone looks after it, anything that worries you."
          value={form.notes}
          onChange={set('notes')}
        />
      </fieldset>

      {/* Left empty by people; bots fill it in. */}
      <div aria-hidden className="absolute -left-[9999px] w-px h-px overflow-hidden">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
        </label>
      </div>

      <p className="text-small text-muted">
        Please don't attach or paste documents here. If we can help, we'll ask for the sale deed and record extracts
        separately.
      </p>
      <FormError message={error} />
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? 'Sending…' : submitLabel}
        </Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
