import { useEffect, useState } from 'react';
import { AlertTriangle, Clock, FileCheck, HelpCircle, LogOut, RotateCcw } from 'lucide-react';
import type { Owner } from '@shared/types';
import { IST, formatClock } from '../format';

interface HeaderProps {
  /** The signed-in owner, or null for the open demo. */
  account: { email: string; signOut: () => void } | null;
  owner: Owner;
  demoMode: boolean;
  lastSyncedAt: Date | null;
  syncFailed: boolean;
  onOpenHowItWorks: () => void;
  onOpenDossier: () => void;
  demoAlert?: { active: boolean; busy: boolean; onToggle: () => void };
}

export function Header({
  account,
  owner,
  demoMode,
  lastSyncedAt,
  syncFailed,
  onOpenHowItWorks,
  onOpenDossier,
  demoAlert
}: HeaderProps) {
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 15_000);
    return () => window.clearInterval(timer);
  }, []);

  const ownerCity = owner.overseasCity.split(',')[0];
  const syncLabel = syncFailed
    ? 'Offline: showing last loaded data'
    : lastSyncedAt
      ? `Synced ${formatClock(lastSyncedAt, IST)} IST`
      : 'Connecting…';

  return (
    <header className="md:sticky top-0 z-40">
      <div className="border-b border-slate-200 bg-white px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-base select-none shrink-0">
              प
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-slate-900">PARIDHI</span>
                <span className="text-slate-300 text-xs">/</span>
                <span className="text-xs text-slate-500 font-medium">Land protection for owners abroad</span>
              </div>
              <div className={`text-[11px] font-mono ${syncFailed ? 'text-amber-700' : 'text-slate-400'}`}>{syncLabel}</div>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 text-xs">
            <div
              className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-slate-600 font-mono text-[11px]"
              title="Time at the plot and at the owner's location"
            >
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 font-medium">India {formatClock(clock, IST)}</span>
              <span className="text-slate-300">·</span>
              <span>
                {ownerCity} {formatClock(clock, owner.timeZone)}
              </span>
            </div>

            {demoAlert && (
              <button
                type="button"
                onClick={demoAlert.onToggle}
                disabled={demoAlert.busy}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-60"
                title="Demo only: simulate or clear a camera alert on this plot"
              >
                {demoAlert.active ? (
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{demoAlert.active ? 'Reset demo plot' : 'Simulate alert'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenDossier}
              className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Dossier</span>
            </button>

            <button
              type="button"
              onClick={onOpenHowItWorks}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded px-3 py-1 text-[11px] font-medium transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-300" />
              <span>How it works</span>
            </button>

            {account && (
              <div className="flex items-center gap-2 pl-2 ml-1 border-l border-slate-200">
                <span className="text-[11px] text-slate-500 max-w-40 truncate" title={account.email}>
                  {account.email}
                </span>
                <button
                  type="button"
                  onClick={account.signOut}
                  className="flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-400" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {demoMode && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-6 py-1.5 text-[11px] text-amber-900">
          <div className="max-w-7xl mx-auto">
            <strong className="font-semibold">Demo.</strong> These properties, people and records are samples. Registry
            checks, inspections and advocate requests are simulated, and nothing is filed with any court or office.
          </div>
        </div>
      )}
    </header>
  );
}
