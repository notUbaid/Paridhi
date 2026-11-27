import { useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { PlotRequestInput } from '@shared/types';
import { errorMessage } from '../api';
import { Button } from '../ui/Button';
import { FormError, SelectField, TextArea, TextField } from '../ui/forms';

/** States with land record checks first, then the others people most often ask about. */
const STATES = ['Telangana', 'Karnataka', 'Punjab', 'Andhra Pradesh', 'Maharashtra', 'Tamil Nadu', 'Gujarat', 'Kerala', 'Delhi-NCR'];
const OTHER = 'Other';
const STEPS = ['About you', 'Your plot', 'Anything else'] as const;

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

/** A short form in three steps, each checked before moving on. */
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
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const stepRef = useRef<HTMLDivElement>(null);

  const set = (field: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));
  const optional = (value: string) => value.trim() || null;
  const last = step === STEPS.length - 1;

  /** Shows the browser's message on the first field in this step that isn't filled in properly. */
  const stepIsValid = () => {
    const fields = stepRef.current?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea');
    for (const field of fields ?? []) {
      if (!field.checkValidity()) {
        field.reportValidity();
        return false;
      }
    }
    return true;
  };

  const goTo = (next: number) => {
    setError(null);
    setStep(next);
    // Keep the form in view on phones, where the next step may start below the fold.
    requestAnimationFrame(() => stepRef.current?.querySelector<HTMLElement>('input, select, textarea')?.focus({ preventScroll: true }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!stepIsValid()) return;
    if (!last) {
      goTo(step + 1);
      return;
    }
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
      <div className="text-center py-6 fade-up" role="status">
        <span className="mx-auto w-14 h-14 rounded-full bg-ok-soft border border-ok-line flex items-center justify-center pop">
          <CheckCircle2 className="w-7 h-7 text-ok" aria-hidden />
        </span>
        <h3 className="font-display text-title text-ink mt-5">{doneTitle}</h3>
        <p className="text-ink-soft mt-2 max-w-sm mx-auto">{doneMessage}</p>
      </div>
    );
  }

  const place = [form.village, form.district, form.state === OTHER ? form.otherState : form.state].filter((part) => part.trim()).join(', ');

  return (
    <form onSubmit={submit}>
      {/* Progress */}
      <ol className="grid grid-cols-3 gap-2" aria-label="Form steps">
        {STEPS.map((label, index) => (
          <li key={label} aria-current={index === step ? 'step' : undefined}>
            <div className="h-1.5 rounded-full bg-sunken overflow-hidden">
              <div
                className={`h-full rounded-full bg-accent transition-transform duration-500 ease-out origin-left ${index <= step ? 'scale-x-100' : 'scale-x-0'}`}
              />
            </div>
            <div className={`text-small mt-2 ${index === step ? 'text-ink font-medium' : 'text-muted'}`}>
              <span className="sm:hidden">{index === step ? label : `${index + 1}`}</span>
              <span className="hidden sm:inline">
                {index + 1}. {label}
              </span>
            </div>
          </li>
        ))}
      </ol>

      <div ref={stepRef} key={step} className="mt-6 space-y-4 fade-up">
        {step === 0 && (
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
              pattern="[+0-9][0-9 .\(\)\-]{5,}"
              placeholder="+1 555 010 0000"
              hint="With the country code. Optional."
              value={form.phone}
              onChange={set('phone')}
            />
            <TextField label="Country you live in" autoComplete="country-name" maxLength={80} value={form.country} onChange={set('country')} />
          </div>
        )}

        {step === 1 && (
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
            {form.state === OTHER && (
              <TextField label="Which state?" required maxLength={60} value={form.otherState} onChange={set('otherState')} />
            )}
            <TextField label="District" required maxLength={80} value={form.district} onChange={set('district')} />
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
        )}

        {step === 2 && (
          <>
            <div className="rounded-xl border border-line bg-paper/60 px-4 py-3 text-sm">
              <div className="eyebrow">Sending</div>
              <p className="text-ink mt-1">
                {form.name.trim() || 'You'} · {mode === 'website' ? form.email.trim() : accountEmail}
              </p>
              <p className="text-ink-soft">{place || 'Plot location'}</p>
            </div>
            <TextArea
              label="Anything we should know"
              maxLength={1000}
              placeholder="When you bought it, whether anyone looks after it, anything that worries you."
              value={form.notes}
              onChange={set('notes')}
            />
            <p className="text-small text-muted">
              Please don't attach or paste documents here. If we can help, we'll ask for the sale deed and record extracts
              separately.
            </p>
          </>
        )}
      </div>

      {/* Left empty by people; bots fill it in. */}
      <div aria-hidden className="absolute -left-[9999px] w-px h-px overflow-hidden">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
        </label>
      </div>

      <div className="mt-5">
        <FormError message={error} />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {step > 0 && (
          <Button variant="ghost" onClick={() => goTo(step - 1)} icon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
        )}
        {step === 0 && onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="brand" size="lg" disabled={busy} className="ml-auto">
          {busy ? 'Sending…' : last ? submitLabel : 'Next'}
          {!busy && !last && <ArrowRight className="w-4 h-4" />}
        </Button>
      </div>
    </form>
  );
}
