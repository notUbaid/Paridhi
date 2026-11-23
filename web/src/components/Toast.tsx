import { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

export interface ToastNotification {
  id: string;
  type: 'SUCCESS' | 'INFO' | 'ALERT' | 'ERROR';
  title: string;
  message: string;
}

const STYLES = {
  SUCCESS: { icon: CheckCircle2, iconClass: 'text-ok', bar: 'bg-ok' },
  INFO: { icon: Info, iconClass: 'text-muted', bar: 'bg-ink' },
  ALERT: { icon: AlertTriangle, iconClass: 'text-warn', bar: 'bg-warn' },
  ERROR: { icon: XCircle, iconClass: 'text-bad', bar: 'bg-bad' }
};

export function Toast({ toast, onClose }: { toast: ToastNotification | null; onClose: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(onClose, toast.type === 'ERROR' ? 8000 : 5000);
    return () => window.clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;
  const style = STYLES[toast.type];
  const Icon = style.icon;

  return (
    <div
      role={toast.type === 'ERROR' || toast.type === 'ALERT' ? 'alert' : 'status'}
      className="fixed bottom-4 right-4 left-4 sm:left-auto z-50 sm:max-w-sm sm:w-full"
    >
      <div className="relative overflow-hidden rounded-xl border border-line bg-surface shadow-pop pl-5 pr-3 py-3.5">
        <span className={`absolute left-0 top-0 bottom-0 w-1 ${style.bar}`} aria-hidden />
        <div className="flex items-start gap-3">
          <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${style.iconClass}`} />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-ink">{toast.title}</div>
            <div className="text-sm text-muted mt-0.5">{toast.message}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-faint hover:text-ink p-1 rounded-md transition-colors cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
