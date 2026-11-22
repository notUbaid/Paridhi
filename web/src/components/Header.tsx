import React, { useEffect, useState } from 'react';
import { Clock, ShieldCheck, FileCheck, HelpCircle, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  onOpenHowItWorks: () => void;
  onOpenDossier: () => void;
  onSimulateTamper: () => void;
  isSimulatedTamper: boolean;
  syncStatus?: 'LIVE_CLOUD' | 'LOCAL_OFFLINE';
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHowItWorks,
  onOpenDossier,
  onSimulateTamper,
  isSimulatedTamper,
  syncStatus = 'LIVE_CLOUD'
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
        {/* Brand identity: Authoritative, calm, trustworthy */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-lg select-none shrink-0 shadow-xs">
            प
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-lg font-bold tracking-tight text-slate-900">
                PARIDHI
              </span>
              <span className="text-xs text-slate-400 font-mono">
                / परिधि
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-medium border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                3 Plots Active & Protected
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${
                  syncStatus === 'LIVE_CLOUD'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    syncStatus === 'LIVE_CLOUD' ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'
                  }`}
                ></span>
                <span>{syncStatus === 'LIVE_CLOUD' ? 'Live Cloud Sync' : 'Local Fallback'}</span>
              </span>
            </div>
            <div className="text-[12px] text-slate-500 font-normal">
              Remote Vacant Land Security & Verified Title Protection for the Indian Diaspora
            </div>
          </div>
        </div>

        {/* Global Diaspora Time & Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5 text-xs">
          {/* Dual Diaspora Time Engine */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-400">Ground:</span>
            <span className="text-slate-900 font-semibold">{istTime}</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-400">Owner:</span>
            <span className="text-slate-700 font-medium">{pstTime}</span>
          </div>

          {/* Simulate Alert Button (for interactive demo) */}
          <button
            onClick={onSimulateTamper}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
              isSimulatedTamper
                ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="Simulate an unscheduled perimeter event to verify alerts and weekly timelapse change detection"
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${isSimulatedTamper ? 'text-amber-600' : 'text-slate-400'}`} />
            <span>{isSimulatedTamper ? 'Reset Demo State' : 'Test Alert Trigger'}</span>
          </button>

          {/* Verified Ownership Dossier */}
          <button
            onClick={onOpenDossier}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors cursor-pointer"
          >
            <FileCheck className="w-3.5 h-3.5 text-slate-600" />
            <span>Title & Evidence Dossier</span>
          </button>

          {/* How It Works Button */}
          <button
            onClick={onOpenHowItWorks}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-3.5 py-1.5 text-[11px] font-medium transition-colors shadow-xs cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-300" />
            <span>How Paridhi Works</span>
          </button>
        </div>
      </div>
    </header>
  );
};
