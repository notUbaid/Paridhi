import React from 'react';
import type { PropertyRecord, MutationAlert } from '../types.js';
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  ShieldCheck,
  Building,
  RefreshCw,
  PlusCircle
} from 'lucide-react';

interface RegistryRadarCardProps {
  property: PropertyRecord;
  onOpenCaveat: (mutation: MutationAlert) => void;
  onPollPortal: () => void;
  onSimulateMutation: () => void;
  isPolling: boolean;
}

export const RegistryRadarCard: React.FC<RegistryRadarCardProps> = ({
  property,
  onOpenCaveat,
  onPollPortal,
  onSimulateMutation,
  isPolling
}) => {
  const radar = property.registryRadar;
  const pendingMutation = radar.pendingMutations[0];

  const portalNames: Record<string, string> = {
    Telangana: 'Dharani Portal (Telangana Land Administration)',
    Karnataka: 'Bhoomi RTC & Kaveri 2.0 (Karnataka Revenue)',
    Punjab: 'Jamabandi Portal (Punjab Land Records Society)',
    Maharashtra: 'Mahabhumi 7/12 e-Ferfar',
    'Uttar Pradesh': 'Bhulekh UP (Revenue Board)',
    Gujarat: 'AnyRoR Urban & Rural'
  };

  return (
    <div className="bg-[#0b1019] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                Cadastral Revenue Registry Radar
              </h3>
              <p className="text-[11px] text-slate-400">
                {portalNames[property.cadastre.state] || 'State Land Registry'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onPollPortal}
              disabled={isPolling}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs transition-colors"
              title="Poll Government Portal Now"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPolling ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              onClick={onSimulateMutation}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-mono transition-colors"
              title="Simulate Fraudulent Mutation Filing"
            >
              <PlusCircle className="w-3 h-3" />
              Simulate Claim
            </button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs font-mono">
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
            <div className="text-slate-400 text-[10px]">RECORD TITLE STATUS</div>
            <div className="mt-1 flex items-center gap-1.5 font-bold">
              {radar.cleanTitle ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">CLEAN / UNENCUMBERED</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-red-400">MUTATION ATTEMPT FLAGGED</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
            <div className="text-slate-400 text-[10px]">ENCUMBRANCE CERT (EC)</div>
            <div className="mt-1 flex items-center gap-1.5 font-bold text-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>NIL LIEN • 100% PASS</span>
            </div>
          </div>
        </div>

        {/* Mutation Alert Box (If Pending Mutation Exists) */}
        {pendingMutation ? (
          <div className="p-3.5 rounded-xl border border-red-500/40 bg-red-950/20 mb-4 animate-threat-pulse">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 font-mono">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>UNAUTHORIZED MUTATION PETITION</span>
                </div>
                <div className="text-xs text-slate-200 font-medium mt-1">
                  Applicant: <span className="font-semibold text-white">{pendingMutation.applicantName}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Claim: {pendingMutation.claimedType}
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40">
                APP #{pendingMutation.applicationId}
              </span>
            </div>

            {/* Countdown Bar */}
            <div className="mt-3 pt-2.5 border-t border-red-500/30 flex items-center justify-between text-[11px] font-mono">
              <div className="flex items-center gap-1 text-amber-300">
                <Clock className="w-3.5 h-3.5" />
                <span>{pendingMutation.objectionWindowDaysRemaining} Days to File Objection</span>
              </div>
              <button
                onClick={() => onOpenCaveat(pendingMutation)}
                className="px-2.5 py-1 rounded-md bg-red-600 hover:bg-red-500 text-white font-semibold flex items-center gap-1 text-[11px] transition-colors"
              >
                <FileText className="w-3 h-3" />
                Generate Caveat Petition
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-emerald-900/40 bg-emerald-950/10 mb-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <div className="font-semibold text-emerald-300 font-mono">
                No Pending Mutations or Liens
              </div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                Survey #{property.cadastre.surveyNumber} matches verified owner record ({property.ownerName}).
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span>Survey: {property.cadastre.surveyNumber} ({property.cadastre.khasraKhata})</span>
        <span>Synced: {new Date(radar.lastChecked).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true })} IST</span>
      </div>
    </div>
  );
};
