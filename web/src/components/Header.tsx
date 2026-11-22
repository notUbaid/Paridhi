import React, { useEffect, useState } from 'react';
import { Radio, Clock, Scale } from 'lucide-react';

interface HeaderProps {
  activeSentinelsCount: number;
  criticalThreatActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeSentinelsCount,
  criticalThreatActive
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
    <header className="border-b border-slate-800 bg-[#090d14]/90 backdrop-blur-md sticky top-0 z-40 px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Sanskrit Name */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/40">
            <span className="text-xl font-bold text-emerald-400 select-none">प</span>
            {criticalThreatActive && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-wider text-slate-100 flex items-center gap-2">
                PARIDHI <span className="text-xs font-normal text-slate-400 font-mono">(परिधि)</span>
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono tracking-tight font-semibold">
                SOVEREIGN DEFENSE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Autonomous Perimeter Intelligence & Cryptographic Land Defense for Diaspora Real Estate
            </p>
          </div>
        </div>

        {/* Global Diaspora Clock & Statutory Badges */}
        <div className="flex items-center flex-wrap gap-3 text-xs">
          {/* Dual Diaspora Time Sync */}
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-md px-2.5 py-1 text-slate-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Ground:</span>
            <span className="text-cyan-300 font-medium">{istTime}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Silicon Valley:</span>
            <span className="text-slate-200">{pstTime}</span>
          </div>

          {/* BSA 2023 Statutory Compliance */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-emerald-900/50 rounded-md px-2.5 py-1 text-emerald-300 font-mono">
            <Scale className="w-3.5 h-3.5 text-emerald-400" />
            <span>BSA 2023 §63 Compliant</span>
          </div>

          {/* Sentinel Status */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-md px-2.5 py-1 font-mono">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-400">{activeSentinelsCount} Sentinels Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};
