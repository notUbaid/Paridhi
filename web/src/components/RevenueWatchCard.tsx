import React, { useState } from 'react';
import type { RevenueRegistryWatch } from '../types';
import {
  Landmark,
  RefreshCw,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';

interface RevenueWatchCardProps {
  registry: RevenueRegistryWatch;
  onVerifyNow: () => void;
}

export const RevenueWatchCard: React.FC<RevenueWatchCardProps> = ({ registry, onVerifyNow }) => {
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = () => {
    setIsVerifying(true);
    onVerifyNow();
    setTimeout(() => {
      setIsVerifying(false);
    }, 1200);
  };

  const getPortalUrl = () => {
    if (registry.portalName.includes('Dharani')) {
      return 'https://dharani.telangana.gov.in';
    } else if (registry.portalName.includes('Bhoomi')) {
      return 'https://bhoomoj.karnataka.gov.in';
    } else if (registry.portalName.includes('Jamabandi')) {
      return 'https://jamabandi.punjab.gov.in';
    }
    return 'https://indiacode.nic.in';
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200/90 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col">
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-200/80 bg-slate-50/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Landmark className="w-4 h-4 text-slate-700 shrink-0" />
          <span className="font-semibold text-slate-900 text-sm tracking-tight">
            Revenue Registry Watch
          </span>
          <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Title Clean</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={getPortalUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 transition-colors px-2 py-1 rounded border border-slate-200 hover:bg-slate-50"
            title="Open official state government land portal"
          >
            <span>State Portal</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium px-2.5 py-1 rounded transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Querying...' : 'Poll Registry'}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Government Portal Badge */}
          <div className="flex items-start justify-between gap-4 pb-3.5 border-b border-slate-100">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Official State Registry</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {registry.portalName}
              </div>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 font-mono">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Checked: {registry.lastCheckedTimestamp}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                Khata #{registry.khataNumber}
              </span>
              <div className="text-[10px] text-slate-400 font-mono mt-1">
                Survey #{registry.surveyNumber}
              </div>
            </div>
          </div>

          {/* Key Title Records Ledger (Clean Structured Rows, No Nested Box Cards) */}
          <div className="py-3 space-y-2.5 text-xs">
            <div className="flex items-baseline justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Recorded Pattadar:</span>
              <span className="font-semibold text-slate-900">{registry.pattadarName} <span className="text-emerald-700 font-normal text-[11px]">(Aadhaar Linked)</span></span>
            </div>

            <div className="flex items-baseline justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Title & Mutation Status:</span>
              <span className="font-semibold text-emerald-700">{registry.passbookStatus}</span>
            </div>

            <div className="flex items-baseline justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Encumbrance Certificate (EC):</span>
              <span className="font-semibold text-slate-900 font-mono">{registry.encumbranceCertificateStatus} <span className="text-slate-400 font-normal">(Nil Liability)</span></span>
            </div>

            <div className="flex items-baseline justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Local Property Tax:</span>
              <span className="font-semibold text-slate-900">{registry.propertyTaxStatus} <span className="text-emerald-700 font-normal text-[11px]">(Nil Arrears)</span></span>
            </div>
          </div>
        </div>

        {/* Protection Guarantee Strip */}
        <div className="bg-emerald-50/60 border border-emerald-200/70 rounded p-2.5 text-xs text-emerald-900 flex items-start gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed text-[11px]">
            <span className="font-semibold">Sub-Registrar Office (SRO) Lock:</span> Automated Dharani/Bhoomi webhooks trigger instant SMS and email notifications upon any mutation application.
          </div>
        </div>
      </div>
    </div>
  );
};
