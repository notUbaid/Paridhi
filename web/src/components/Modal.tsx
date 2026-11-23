import { useEffect, useId, useLayoutEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  icon?: ReactNode;
  /** Extra content on the right of the title bar. */
  badge?: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg' | 'xl';
  children: ReactNode;
}

const SIZES = { md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-3xl' };
const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Accessible dialog: closes on Escape or backdrop click, keeps keyboard focus
 * inside while open, returns focus afterwards, and prints on its own.
 */
export function Modal({ open, onClose, title, icon, badge, footer, size = 'lg', children }: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    document.body.classList.add('has-modal');

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('has-modal');
      previouslyFocused?.focus();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="modal-overlay fixed inset-0 z-50 bg-ink/45 flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`modal-panel bg-surface rounded-t-card sm:rounded-card border border-line shadow-pop w-full ${SIZES[size]} max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden outline-none`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-5 sm:px-6 py-4 border-b border-line flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && <span className="text-muted [&_svg]:text-muted shrink-0">{icon}</span>}
            <h2 id={titleId} className="font-display text-xl leading-tight text-ink truncate">
              {title}
            </h2>
            {badge}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="no-print text-muted hover:text-ink p-1.5 rounded-lg hover:bg-sunken transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="modal-body overflow-y-auto">{children}</div>
        {footer && (
          <div className="no-print px-5 sm:px-6 py-4 border-t border-line bg-paper/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
