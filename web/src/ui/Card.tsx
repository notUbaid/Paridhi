import type { ReactNode } from 'react';

interface CardProps {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  bodyClassName?: string;
  id?: string;
}

/** The basic surface: warm white, hairline border, soft shadow, optional header. */
export function Card({ title, description, icon, action, children, className = '', bodyClassName = 'p-5', id }: CardProps) {
  return (
    <section id={id} className={`bg-surface rounded-card border border-line shadow-card overflow-hidden ${className}`}>
      {(title || action) && (
        <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-4 pb-3 border-b border-line">
          <div className="flex items-start gap-2.5 min-w-0">
            {icon && <span className="mt-0.5 text-muted shrink-0">{icon}</span>}
            <div className="min-w-0">
              {title && <h2 className="font-display text-heading text-ink">{title}</h2>}
              {description && <p className="text-sm text-muted mt-0.5">{description}</p>}
            </div>
          </div>
          {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
        </header>
      )}
      {children !== undefined && <div className={bodyClassName}>{children}</div>}
    </section>
  );
}

/** Label/value rows separated by hairlines. */
export function KeyValueList({ items }: { items: { label: ReactNode; value: ReactNode }[] }) {
  return (
    <dl className="divide-y divide-line">
      {items.map((item, index) => (
        <div key={index} className="flex items-baseline justify-between gap-6 py-2.5 first:pt-0 last:pb-0">
          <dt className="text-sm text-muted shrink-0">{item.label}</dt>
          <dd className="text-sm text-ink text-right">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function EmptyState({ icon, title, children }: { icon?: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="text-center py-8 px-4">
      {icon && <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-sunken text-muted flex items-center justify-center">{icon}</div>}
      <p className="font-display text-heading text-ink">{title}</p>
      {children && <div className="text-sm text-muted mt-1 max-w-sm mx-auto">{children}</div>}
    </div>
  );
}

/** A circle with someone's initials. */
export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const initials =
    name
      .replace(/^Adv\.\s*/i, '')
      .split(/\s+/)
      .filter((part) => /^[A-Za-z]/.test(part))
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('') || '?';
  return (
    <span
      aria-hidden
      className={`inline-flex items-center justify-center rounded-full bg-sunken text-ink-soft font-medium shrink-0 border border-line ${
        size === 'sm' ? 'w-7 h-7 text-xs' : 'w-10 h-10 text-sm'
      }`}
    >
      {initials}
    </span>
  );
}
