import React from 'react';
import type { PropertyRecord } from '../types.js';
import {
  Video,
  PhoneCall,
  UserCheck,
  Send,
  Navigation,
  CheckCircle2
} from 'lucide-react';

interface GroundMarshalCardProps {
  property: PropertyRecord;
  onDispatchMarshal: () => void;
  isDispatching: boolean;
}

export const GroundMarshalCard: React.FC<GroundMarshalCardProps> = ({
  property,
  onDispatchMarshal,
  isDispatching
}) => {
  const marshal = property.groundResponseTeam;
  const isEnRoute = marshal.status === 'EN_ROUTE';
  const isOnSite = marshal.status === 'ON_SITE_ESCORT';

  return (
    <div className="bg-[#0b1019] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                Ground Marshal Physical Escrow Network
              </h3>
              <p className="text-[11px] text-slate-400">
                Guaranteed &lt; 60-Minute SLA • Ex-Military Tactical Responders
              </p>
            </div>
          </div>

          {/* Status Badge */}
          {isOnSite ? (
            <span className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              ON SITE
            </span>
          ) : isEnRoute ? (
            <span className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold animate-pulse">
              <Navigation className="w-3.5 h-3.5 animate-spin" />
              EN ROUTE ({marshal.etaMinutes}m ETA)
            </span>
          ) : (
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              STATION STANDBY
            </span>
          )}
        </div>

        {/* Responder Dossier */}
        <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 mb-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-mono font-bold text-slate-200">
                {marshal.callsign} • {marshal.leadResponder}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Service: {marshal.rankMilitaryEx}
              </div>
              <div className="text-[10px] font-mono text-cyan-400 mt-0.5">
                License: {marshal.psaraLicenseNumber}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-mono">ESTIMATED ARRIVAL</div>
              <div className="text-base font-bold font-mono text-emerald-400">
                {isOnSite ? 'DEPLOYED' : `${marshal.etaMinutes} mins`}
              </div>
            </div>
          </div>

          {/* Bodycam Link & Police Station Liaison */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <a
              href={marshal.bodycamStreamUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-[11px] transition-colors"
            >
              <Video className="w-3.5 h-3.5" />
              <span>4G Bodycam Live Stream</span>
            </a>
            <div className="flex items-center gap-1 text-slate-400 text-[11px]">
              <PhoneCall className="w-3 h-3 text-slate-500" />
              <span>{marshal.contactNumber}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Dispatch Button */}
      <div className="pt-2">
        {isEnRoute || isOnSite ? (
          <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/40 text-center text-xs font-mono text-emerald-300">
            Escort unit active on ground. Police Station House Officer (SHO) alerted.
          </div>
        ) : (
          <button
            onClick={onDispatchMarshal}
            disabled={isDispatching}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-semibold shadow-lg shadow-emerald-950/40 transition-all duration-200"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Dispatch Ground Marshal (&lt; 60-min SLA)</span>
          </button>
        )}
      </div>
    </div>
  );
};
