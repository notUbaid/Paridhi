import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

interface MenuProps {
  /** Renders the trigger button's content. */
  trigger: ReactNode;
  triggerClassName?: string;
  triggerLabel: string;
  align?: 'left' | 'right';
  width?: string;
  children: (close: () => void) => ReactNode;
}

/** A button that opens a popover panel; closes on outside click, Escape or selection. */
export function Menu({ trigger, triggerClassName = '', triggerLabel, align = 'left', width = 'w-72', children }: MenuProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={id}
        aria-label={triggerLabel}
        onClick={() => setOpen((value) => !value)}
        className={`cursor-pointer ${triggerClassName}`}
      >
        {trigger}
      </button>
      {open && (
        <div
          id={id}
          className={`absolute z-50 mt-2 ${width} max-w-[calc(100vw-2rem)] ${align === 'right' ? 'right-0' : 'left-0'} bg-surface border border-line rounded-xl shadow-pop p-1.5`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export function MenuItem({ onSelect, children, active = false }: { onSelect: () => void; children: ReactNode; active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-lg px-3 py-2.5 cursor-pointer transition-colors ${active ? 'bg-sunken' : 'hover:bg-sunken/70'}`}
    >
      {children}
    </button>
  );
}
