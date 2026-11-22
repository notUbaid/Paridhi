import React from 'react';
import type { PropertyRecord } from '../types.js';
import {
  Video,
  PhoneCall,
  UserCheck,
  Send,
  Navigation,
  CheckCircle2,
  Shield
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
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-slate-100 border border-slate-200 text-slate-700">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                Ground Marshal Physical Escrow Network
              </h3>
              <p className="text-[11px] text-slate-500">
                Guaranteed &lt; 60-Minute SLA • Ex-Military Tactical Responders
              </p>
            </div>
          </div>

          {/* Status Badge */}
          {isOnSite ? (
            <span className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ON SITE
            </span>
          ) : isEnRoute ? (
            <span className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-semibold animate-pulse">
              <Navigation className="w-3.5 h-3.5 text-amber-600 animate-spin" />
              EN ROUTE ({marshal.etaMinutes}m ETA)
            </span>
          ) : (
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium">
              STATION STANDBY
            </span>
          )}
        </div>

        {/* Responder Dossier */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mb-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-mono font-bold text-slate-900 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-slate-600" />
                {marshal.callsign} • {marshal.leadResponder}
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                Service: {marshal.rankMilitaryEx}
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                PSARA License: {marshal.psaraLicenseNumber}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">RESPONSE ETA</div>
              <div className="text-base font-bold font-mono text-slate-900">
                {isOnSite ? 'DEPLOYED' : `${marshal.etaMinutes} mins`}
              </div>
            </div>
          </div>

          {/* Bodycam Link & Police Station Liaison */}
          <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
            <a
              href={marshal.bodycamStreamUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-slate-900 hover:text-slate-700 underline font-medium text-[11px] transition-colors"
            >
              <Video className="w-3.5 h-3.5 text-slate-600" />
              <span>4G Bodycam Live Uplink</span>
            </a>
            <div className="flex items-center gap-1 text-slate-600 text-[11px]">
              <PhoneCall className="w-3 h-3 text-slate-500" />
              <span>{marshal.contactNumber}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Dispatch Button */}
      <div className="pt-2">
        {isEnRoute || isOnSite ? (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-center text-xs font-mono text-emerald-800 font-medium">
            Escort unit active on ground. Police Station House Officer (SHO) alerted under CrPC §145.
          </div>
        ) : (
          <button
            onClick={onDispatchMarshal}
            disabled={isDispatching}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Dispatch Ground Marshal (&lt; 60-min SLA)</span>
          </button>
        )}
      </div>
    </div>
  );
};
