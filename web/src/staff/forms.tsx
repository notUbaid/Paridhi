import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

const controlClass =
  'w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 disabled:bg-slate-50';

interface FieldProps {
  label: string;
  hint?: ReactNode;
  className?: string;
}

export function TextField({ label, hint, className, ...input }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div className={`space-y-1 ${className ?? ''}`}>
      <label htmlFor={id} className="block text-[11px] font-medium text-slate-700">
        {label}
        {input.required && <span className="text-slate-400"> *</span>}
      </label>
      <input id={id} className={controlClass} {...input} />
      {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
    </div>
  );
}

export function TextArea({ label, hint, className, ...input }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <div className={`space-y-1 ${className ?? ''}`}>
      <label htmlFor={id} className="block text-[11px] font-medium text-slate-700">
        {label}
        {input.required && <span className="text-slate-400"> *</span>}
      </label>
      <textarea id={id} rows={3} className={controlClass} {...input} />
      {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
    </div>
  );
}

export function SelectField({
  label,
  hint,
  className,
  children,
  ...select
}: FieldProps & SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  const id = useId();
  return (
    <div className={`space-y-1 ${className ?? ''}`}>
      <label htmlFor={id} className="block text-[11px] font-medium text-slate-700">
        {label}
        {select.required && <span className="text-slate-400"> *</span>}
      </label>
      <select id={id} className={controlClass} {...select}>
        {children}
      </select>
      {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
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
    <fieldset className="space-y-1">
      <legend className="text-[11px] font-medium text-slate-700">{label}</legend>
      <div className="inline-flex rounded border border-slate-200 overflow-hidden text-xs">
        {([true, false] as const).map((option) => (
          <button
            key={String(option)}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className={`px-3 py-1.5 cursor-pointer ${
              value === option ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
            } ${option ? '' : 'border-l border-slate-200'}`}
          >
            {option ? yes : no}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2.5">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-900">{title}</h3>
      {children}
    </section>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded border border-red-200 bg-red-50 text-red-800 px-3 py-2 text-xs">
      {message}
    </div>
  );
}

export function FormActions({ busy, submitLabel, onCancel }: { busy: boolean; submitLabel: string; onCancel: () => void }) {
  return (
    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 rounded text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={busy}
        className="px-4 py-2 rounded text-xs font-semibold bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white cursor-pointer"
      >
        {busy ? 'Saving…' : submitLabel}
      </button>
    </div>
  );
}

export const todayIso = () => new Date().toISOString().slice(0, 10);
export const daysFromNowIso = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
