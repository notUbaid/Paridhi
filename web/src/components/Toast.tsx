import { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

export interface ToastNotification {
  id: string;
  type: 'SUCCESS' | 'INFO' | 'ALERT' | 'ERROR';
  title: string;
  message: string;
}

const STYLES = {
  SUCCESS: { icon: CheckCircle2, iconClass: 'text-emerald-600', border: 'border-emerald-300' },
  INFO: { icon: Info, iconClass: 'text-slate-500', border: 'border-slate-300' },
  ALERT: { icon: AlertTriangle, iconClass: 'text-amber-600', border: 'border-amber-300' },
  ERROR: { icon: XCircle, iconClass: 'text-red-600', border: 'border-red-300' }
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
      <div className={`p-3.5 rounded-lg border bg-white shadow-xl ${style.border}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <Icon className={`w-4 h-4 shrink-0 ${style.iconClass}`} />
            <div>
              <div className="text-xs font-bold leading-none mb-1 text-slate-900">{toast.title}</div>
              <div className="text-[11px] text-slate-600 leading-relaxed">{toast.message}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
