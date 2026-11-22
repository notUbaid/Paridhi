import React, { useState } from 'react';
import type { LegalRetainerInfo } from '../types';
import {
  Scale,
  FileText,
  Award,
  Download,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface LegalActionCardProps {
  legalRetainer: LegalRetainerInfo;
  onOpenCaveatModal: () => void;
  onRetainLawyer: () => void;
  onDownloadDossier: () => void;
}

export const LegalActionCard: React.FC<LegalActionCardProps> = ({
  legalRetainer,
  onOpenCaveatModal,
  onRetainLawyer,
  onDownloadDossier
}) => {
  const [isLodging, setIsLodging] = useState(false);
  const isExpiringSoon = (legalRetainer.daysRemaining ?? 64) <= 15;

  const handleRetain = () => {
    setIsLodging(true);
    onRetainLawyer();
    setTimeout(() => {
      setIsLodging(false);
    }, 1500);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200/90 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col">
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-200/80 bg-slate-50/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-slate-700 shrink-0" />
          <span className="font-semibold text-slate-900 text-sm tracking-tight">
            Judicial Injunction Defense
          </span>
          <span className="text-[11px] font-mono text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/80 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
            <span>Advocate Retainer Active</span>
          </span>
        </div>

        <button
          onClick={onOpenCaveatModal}
          className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>Petition Draft</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Advocate Information */}
          <div className="flex items-start justify-between gap-4 pb-3.5 border-b border-slate-100">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Empanelled Revenue Advocate</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                <span>{legalRetainer.advocateName}</span>
                <span className="text-[10px] font-mono font-normal px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  {legalRetainer.barCouncilNumber}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {legalRetainer.jurisdictionCourt} · Direct: <span className="font-mono text-slate-700">{legalRetainer.contactNumber}</span>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded border ${
                  isExpiringSoon
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isExpiringSoon ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                <span>
                  {isExpiringSoon
                    ? `Renew in ${legalRetainer.daysRemaining}d`
                    : `Caveat Active · ${legalRetainer.daysRemaining ?? 64}d`}
                </span>
              </span>
              <div className="text-[10px] text-slate-400 font-mono mt-1">
                Expiry: {legalRetainer.caveatExpiryDate}
              </div>
            </div>
          </div>

          {/* Legal Protection Context (Clean Ledger, No Box Clutter) */}
          <div className="py-3 space-y-2.5 text-xs">
            {isExpiringSoon && (
              <div className="p-2.5 rounded bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed text-[11px]">
                  <strong className="font-semibold">Section 148A(5) CPC 90-Day Renewal Notice:</strong> Under Indian civil law, caveats strictly lapse after 90 days. Click below to file a timely renewal before the Tahsildar & Civil Judge.
                </div>
              </div>
            )}

            <div className="rounded p-2.5 bg-slate-50 border border-slate-200/80 leading-relaxed text-slate-600 text-[11px]">
              <div className="font-semibold text-slate-800 mb-0.5 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-slate-500" />
                <span>Statutory Injunction Defense Guarantee</span>
              </div>
              A standing Section 148A Caveat legally obligates the District Civil Court to issue formal notice to your empanelled advocate before any ex-parte stay, status-quo order, or fraudulent mutation can be passed in your absence.
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Emergency Response SLA: <strong className="text-slate-800 font-mono font-medium">&lt; 48 Hours</strong></span>
              <span>Bar Council: <strong className="text-slate-800 font-mono font-medium">High Court of Telangana</strong></span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
          <button
            onClick={handleRetain}
            disabled={isLodging}
            className="w-full sm:w-auto flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium py-2 px-3 rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isLodging ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Renewing 90-Day Protection...</span>
              </>
            ) : (
              <>
                <Scale className="w-3.5 h-3.5" />
                <span>{isExpiringSoon ? 'Renew Caveat Petition (90 Days)' : 'Re-file Section 148A Caveat'}</span>
              </>
            )}
          </button>

          <button
            onClick={onDownloadDossier}
            className="w-full sm:w-auto bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium py-2 px-3 rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Title Dossier</span>
          </button>
        </div>
      </div>
    </div>
  );
};
