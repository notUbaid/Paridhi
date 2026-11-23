import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { Button } from './Button';

export const controlClass =
  'w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink placeholder:text-faint focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10 disabled:bg-sunken';

interface FieldProps {
  label: string;
  hint?: ReactNode;
  className?: string;
}

function Label({ htmlFor, label, required }: { htmlFor: string; label: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-[13px] font-medium text-ink-soft">
      {label}
      {required && <span className="text-faint"> *</span>}
    </label>
  );
}

export function TextField({ label, hint, className = '', ...input }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label htmlFor={id} label={label} required={input.required} />
      <input id={id} className={controlClass} {...input} />
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function TextArea({ label, hint, className = '', ...input }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label htmlFor={id} label={label} required={input.required} />
      <textarea id={id} rows={3} className={controlClass} {...input} />
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function SelectField({
  label,
  hint,
  className = '',
  children,
  ...select
}: FieldProps & SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  const id = useId();
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label htmlFor={id} label={label} required={select.required} />
      <select id={id} className={controlClass} {...select}>
        {children}
      </select>
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

/** A yes/no question that must be answered explicitly. */
export function YesNo({
  label,
  value,
  onChange,
  yes = 'Yes',
  no = 'No'
}: {
  label: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
  yes?: string;
  no?: string;
}) {
  return (
    <fieldset className="space-y-1.5">
      <legend className="text-[13px] font-medium text-ink-soft">{label}</legend>
      <div className="inline-flex rounded-lg border border-line-strong overflow-hidden text-sm bg-surface">
        {([true, false] as const).map((option) => (
          <button
            key={String(option)}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className={`px-4 py-1.5 cursor-pointer transition-colors ${
              value === option ? 'bg-ink text-surface' : 'text-ink-soft hover:bg-sunken'
            } ${option ? '' : 'border-l border-line-strong'}`}
          >
            {option ? yes : no}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function FormSection({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="font-display text-lg text-ink">{title}</h3>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-lg border border-bad-line bg-bad-soft text-bad px-3 py-2 text-sm">
      {message}
    </div>
  );
}

export function FormActions({ busy, submitLabel, onCancel }: { busy: boolean; submitLabel: string; onCancel: () => void }) {
  return (
    <div className="flex items-center justify-end gap-2 pt-4 border-t border-line">
      <Button variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" variant="primary" disabled={busy}>
        {busy ? 'Saving…' : submitLabel}
      </Button>
    </div>
  );
}

export const todayIso = () => new Date().toISOString().slice(0, 10);
export const daysFromNowIso = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
