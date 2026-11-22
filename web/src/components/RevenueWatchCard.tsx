import React, { useState } from 'react';
import type { RevenueRegistryWatch } from '../types';
import {
  Landmark,
  ShieldCheck,
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
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Landmark className="w-4 h-4 text-slate-700" />
          <span className="font-semibold text-slate-900 text-sm">
            State Land Revenue Registry Watch
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Title Clean
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={getPortalUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 transition-colors px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-100"
            title="Open official state government land portal"
          >
            <span>Gov Portal</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Querying State Records...' : 'Poll State Registry'}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Government Portal Badge */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="text-xs text-slate-400 uppercase font-semibold">Government Land Portal</div>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {registry.portalName}
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Last automated audit: {registry.lastCheckedTimestamp}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                {registry.khataNumber}
              </span>
              <div className="text-[11px] text-slate-400 mt-1">
                Survey #{registry.surveyNumber}
              </div>
            </div>
          </div>

          {/* Key Title Records Grid */}
          <div className="py-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Registered Pattadar (Owner)</div>
                <div className="text-slate-900 font-semibold mt-0.5">{registry.pattadarName}</div>
                <div className="text-[11px] text-emerald-700 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Aadhaar KYC & Bank Linked</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Passbook & Title Status</div>
                <div className="text-slate-900 font-semibold mt-0.5">{registry.passbookStatus}</div>
                <div className="text-[11px] text-emerald-700 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>No court stay or injunctions</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Encumbrance Certificate (EC)</div>
                <div className="text-slate-900 font-semibold mt-0.5">{registry.encumbranceCertificateStatus}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Form 15 issued with nil liabilities</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Municipal / Gram Panchayat Tax</div>
                <div className="text-slate-900 font-semibold mt-0.5">{registry.propertyTaxStatus}</div>
                <div className="text-[11px] text-emerald-700 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Zero arrears or penalty dues</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Protection Guarantee Banner */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-lg p-3 text-xs text-emerald-900 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold">Zero Adverse Mutation Applications Detected.</span> Paridhi continuously polls state revenue databases daily. If any fraudulent patta transfer or duplicate survey application is filed with the Tahsildar, you and your partner advocate will be notified within 24 hours to file statutory objections.
          </div>
        </div>
      </div>
    </div>
  );
};
