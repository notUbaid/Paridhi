import React from 'react';
import type { LegalRetainerInfo } from '../types';
import {
  Scale,
  ShieldCheck,
  FileText,
  Award,
  Download
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
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-slate-700" />
          <span className="font-semibold text-slate-900 text-sm">
            On-Call Legal Defense & Statutory Caveat
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-purple-600" />
            Advocate Retainer Active
          </span>
        </div>

        <button
          onClick={onOpenCaveatModal}
          className="text-xs font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          <span>View Section 148A Caveat</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Advocate Information */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="text-xs text-slate-400 uppercase font-semibold">Empanelled Revenue Advocate</div>
              <div className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                <span>{legalRetainer.advocateName}</span>
                <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {legalRetainer.barCouncilNumber}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {legalRetainer.jurisdictionCourt}
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Standing Caveat Active
              </span>
              <div className="text-[11px] text-slate-400 mt-1">
                Valid until {legalRetainer.caveatExpiryDate}
              </div>
            </div>
          </div>

          {/* Legal Protection Context */}
          <div className="py-4 space-y-3">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/90 text-xs leading-relaxed text-slate-700">
              <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-slate-600" />
                <span>Statutory Caveat Protection (Section 148A CPC)</span>
              </div>
              Under Indian civil law, local land grabbers often seek ex-parte temporary injunctions by filing bogus suits without naming the overseas owner. A Section 148A Caveat legally binds the Civil Court and Tahsildar to issue direct summons to your advocate before granting any order.
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Response SLA</div>
                <div className="text-slate-900 font-bold mt-0.5">&lt; 48 Hours</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Formal objection filed with Sub-Registrar</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-[10px] uppercase font-semibold text-slate-400">On-Call Phone</div>
                <div className="text-slate-900 font-bold mt-0.5">{legalRetainer.contactNumber}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Direct partner advocate line</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={onRetainLawyer}
            className="w-full sm:w-auto flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Retain Advocate for Legal Notice</span>
          </button>

          <button
            onClick={onDownloadDossier}
            className="w-full sm:w-auto bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Download Verified Dossier</span>
          </button>
        </div>
      </div>
    </div>
  );
};
