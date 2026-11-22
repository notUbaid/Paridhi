import React, { useEffect } from 'react';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export interface ToastNotification {
  id: string;
  type: 'SUCCESS' | 'INFO' | 'ALERT';
  title: string;
  message: string;
}

interface ToastProps {
  toast: ToastNotification | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'ALERT':
        return <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-600 shrink-0" />;
    }
  };

  const getBadgeStyle = () => {
    switch (toast.type) {
      case 'SUCCESS':
        return 'border-emerald-300 bg-white text-slate-900';
      case 'ALERT':
        return 'border-amber-300 bg-white text-slate-900';
      default:
        return 'border-slate-300 bg-white text-slate-900';
    }
  };

  return (
    <aside
      aria-label="Notification"
      className="fixed bottom-6 right-6 z-50 max-w-sm w-full"
    >
      <div className={`p-3.5 rounded-lg border shadow-xl ${getBadgeStyle()}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            {getIcon()}
            <div>
              <div className="text-xs font-bold leading-none mb-1 text-slate-900">
                {toast.title}
              </div>
              <div className="text-[11px] text-slate-600 leading-relaxed">
                {toast.message}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
