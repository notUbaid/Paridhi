import React, { useEffect, useState } from 'react';
import { Clock, FileCheck, HelpCircle, AlertTriangle } from 'lucide-react';

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
    <header className="border-b border-slate-200/80 bg-white sticky top-0 z-40 px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        {/* Brand identity: Sovereign Cadastral Workstation */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-base select-none shrink-0 tracking-wider">
            प
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900">
                PARIDHI
              </span>
              <span className="text-slate-300 font-mono text-xs">/</span>
              <span className="text-xs text-slate-500 font-medium">
                Sovereign Land Defense
              </span>
              <span className="inline-flex items-center gap-1.5 ml-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>3 Plots Under Watch</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-slate-500">
                <span className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'LIVE_CLOUD' ? 'bg-blue-500' : 'bg-slate-400'}`}></span>
                <span>{syncStatus === 'LIVE_CLOUD' ? 'Attestation Active' : 'Offline Ledger'}</span>
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-normal">
              Continuous 4G Optical Cadastre • Monthly Physical Ground Audits • Section 148A CPC Legal Protection
            </div>
          </div>
        </div>

        {/* Global Diaspora Clocks & Command Actions */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Dual Diaspora Time */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded px-2.5 py-1 text-slate-600 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-medium">{istTime}</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500">{pstTime}</span>
          </div>

          {/* Sandbox Tamper Simulator */}
          <button
            onClick={onSimulateTamper}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
              isSimulatedTamper
                ? 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
            title="Simulate perimeter anomaly for demonstration"
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${isSimulatedTamper ? 'text-white' : 'text-slate-400'}`} />
            <span>{isSimulatedTamper ? 'Active Anomaly (Clear)' : 'Simulate Threat'}</span>
          </button>

          {/* Verified Title Dossier */}
          <button
            onClick={onOpenDossier}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer"
          >
            <FileCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Title Dossier</span>
          </button>

          {/* Architecture / How It Works */}
          <button
            onClick={onOpenHowItWorks}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded px-3 py-1 text-[11px] font-medium transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-300" />
            <span>Architecture</span>
          </button>
        </div>
      </div>
    </header>
  );
};
