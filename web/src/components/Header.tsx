import React, { useEffect, useState } from 'react';
import { Clock, FileText, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  activeSentinelsCount: number;
  criticalThreatActive: boolean;
  onOpenPitchModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeSentinelsCount,
  criticalThreatActive,
  onOpenPitchModal
}) => {
  const [istTime, setIstTime] = useState('');
  const [pstTime, setPstTime] = useState('');

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      setIstTime(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }) + ' IST'
      );
      setPstTime(
        now.toLocaleTimeString('en-US', {
          timeZone: 'America/Los_Angeles',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }) + ' PST'
      );
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40 px-6 py-3.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand identity: Authoritative, architectural, unadorned */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-lg select-none shrink-0">
            प
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-lg font-bold tracking-tight text-slate-900">
                PARIDHI
              </span>
              <span className="text-xs text-slate-500 font-mono">
                / परिधि
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
                Cadastral Defense Workstation • {activeSentinelsCount} Nodes Active
              </span>
            </div>
            <div className="text-[11px] text-slate-500 tracking-normal">
              Autonomous Off-Grid Boundary Intelligence & Statutory Evidence Custody (BSA 2023)
            </div>
          </div>
        </div>

        {/* Global Diaspora Time & Key Statutory Stamps */}
        <div className="flex items-center flex-wrap gap-3 text-xs">
          {/* Dual Diaspora Time Engine */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-lg px-3 py-1.5 text-slate-700 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-400">Ground:</span>
            <span className="text-slate-900 font-semibold">{istTime}</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-400">Owner:</span>
            <span className="text-slate-700 font-medium">{pstTime}</span>
          </div>

          {/* Statutory Court Stamp */}
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5 text-emerald-800 text-[11px] font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>BSA 2023 §63 Certified</span>
          </div>

          {/* Incident Alert indicator if critical */}
          {criticalThreatActive && (
            <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5 text-red-700 text-[11px] font-medium animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <span>Active Breach Triggered</span>
            </div>
          )}

          {/* Founder Presentation Dossier Action */}
          <button
            onClick={onOpenPitchModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Founder Brief & Thesis</span>
          </button>
        </div>
      </div>
    </header>
  );
};
