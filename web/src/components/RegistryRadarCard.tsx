import React from 'react';
import type { PropertyRecord, MutationAlert } from '../types.js';
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  ShieldCheck,
  Building2,
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
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-slate-100 border border-slate-200 text-slate-700">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                Cadastral Revenue Registry Radar
              </h3>
              <p className="text-[11px] text-slate-500">
                {portalNames[property.cadastre.state] || 'State Land Registry Engine'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onPollPortal}
              disabled={isPolling}
              className="p-1.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs transition-colors cursor-pointer"
              title="Poll Government Revenue Portal"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPolling ? 'animate-spin text-slate-900' : ''}`} />
            </button>
            <button
              onClick={onSimulateMutation}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-mono font-medium transition-colors cursor-pointer"
              title="Simulate Fraudulent Mutation Filing"
            >
              <PlusCircle className="w-3 h-3 text-rose-600" />
              Simulate Claim
            </button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs font-mono">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-slate-500 text-[10px] tracking-wider uppercase">RECORD TITLE INTEGRITY</div>
            <div className="mt-1 flex items-center gap-1.5 font-bold">
              {radar.cleanTitle ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">UNENCUMBERED</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span className="text-rose-700">MUTATION FLAGGED</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-slate-500 text-[10px] tracking-wider uppercase">ENCUMBRANCE CERT (EC)</div>
            <div className="mt-1 flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
              <span>NIL LIEN • 100% PASS</span>
            </div>
          </div>
        </div>

        {/* Mutation Alert Box (If Pending Mutation Exists) */}
        {pendingMutation ? (
          <div className="p-4 rounded-lg border border-rose-300 bg-rose-50/70 mb-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 font-mono">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>UNAUTHORIZED MUTATION CLAIM DETECTED</span>
                </div>
                <div className="text-xs text-slate-900 font-medium mt-1">
                  Applicant: <span className="font-semibold text-slate-900">{pendingMutation.applicantName}</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Claimed Type: {pendingMutation.claimedType}
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-rose-800 border border-rose-200 shadow-2xs">
                APP #{pendingMutation.applicationId}
              </span>
            </div>

            {/* Statutory Action Bar */}
            <div className="mt-3 pt-3 border-t border-rose-200 flex items-center justify-between text-[11px] font-mono">
              <div className="flex items-center gap-1.5 text-amber-800 font-semibold">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>{pendingMutation.objectionWindowDaysRemaining} Days to File Statutory Caveat</span>
              </div>
              <button
                onClick={() => onOpenCaveat(pendingMutation)}
                className="px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-1 text-[11px] shadow-xs transition-colors cursor-pointer"
              >
                <FileText className="w-3 h-3 text-slate-300" />
                File Section 148A Caveat
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/60 mb-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <div className="font-semibold text-emerald-900 font-mono">
                No Adverse Claims or Pending Encumbrances
              </div>
              <div className="text-emerald-700 text-[11px] mt-0.5">
                Survey #{property.cadastre.surveyNumber} matches verified owner record ({property.ownerName}).
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span>Survey #{property.cadastre.surveyNumber} • {property.cadastre.khasraKhata}</span>
        <span>Registry Synced: {new Date(radar.lastChecked).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true })} IST</span>
      </div>
    </div>
  );
};
