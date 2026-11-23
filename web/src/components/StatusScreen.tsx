import type { ReactNode } from 'react';

interface StatusScreenProps {
  title?: string;
  message: ReactNode;
  action?: { label: string; onClick: () => void; icon?: ReactNode };
}

/** Full-page message for loading, errors and empty states. */
export function StatusScreen({ title, message, action }: StatusScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8fafc]">
      <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-sm w-full text-center space-y-3">
        {title && <h1 className="text-sm font-semibold text-slate-900">{title}</h1>}
        <p className="text-xs text-slate-500 leading-relaxed">{message}</p>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium cursor-pointer"
          >
            {action.icon}
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
