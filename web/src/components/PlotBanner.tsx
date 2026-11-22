import React from 'react';
import type { PropertyRecord } from '../types';
import { MapPin, User, ShieldAlert, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface PlotBannerProps {
  property: PropertyRecord;
}

export const PlotBanner: React.FC<PlotBannerProps> = ({ property }) => {
  const isAlert = property.status !== 'ALL_CLEAR';
  const isCaveatExpiringSoon = (property.legalRetainer.daysRemaining ?? 64) <= 15;

  return (
    <div className="bg-white rounded-lg border border-slate-200/90 p-5 mb-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        {/* Left: Parcel Core Title & Cadastral Coordinates */}
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              {property.name}
            </h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold border border-slate-200">
              Survey #{property.surveyNumber}
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded font-medium inline-flex items-center gap-1.5 border ${
                isAlert
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {isAlert ? (
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              )}
              <span>{property.statusBadgeText}</span>
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-y-1 gap-x-3 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {property.location.village}, {property.location.mandalTaluk},{' '}
                {property.location.district}, {property.location.state}
              </span>
            </div>
            <span className="text-slate-300">·</span>
            <div className="font-mono text-slate-700 font-medium">
              {property.plotSizeDisplay}
            </div>
            <span className="text-slate-300">·</span>
            <div className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-500">Pattadar:</span>
              <span className="text-slate-800 font-medium">{property.owner.name}</span>
              <span className="text-slate-400 font-mono">({property.owner.overseasCity})</span>
            </div>
          </div>
        </div>

        {/* Right: Asset Protection Attestation Strip */}
        <div className="flex items-center gap-3 text-xs">
          <div className="text-right">
            <div className="text-[11px] text-slate-400 uppercase tracking-wide font-mono">Assessed Value</div>
            <div className="text-base font-bold text-slate-900 font-mono">
              ₹{(property.marketValuationINR / 10000000).toFixed(2)} Cr
            </div>
          </div>
        </div>
      </div>

      {/* Cadastral Defense Telemetry Ribbon */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <div className="truncate">
            <div className="text-[10px] text-slate-400 font-mono uppercase">Title Registry</div>
            <div className="font-medium text-slate-800 truncate">{property.revenueRegistry.portalName} Verified Clean</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
          <div className="truncate">
            <div className="text-[10px] text-slate-400 font-mono uppercase">Optical Sentinel</div>
            <div className="font-medium text-slate-800 truncate">{property.cameraPod.batteryPercentage}% Batt · 4G LTE Online</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
          <div className="truncate">
            <div className="text-[10px] text-slate-400 font-mono uppercase">Ground Audit</div>
            <div className="font-medium text-slate-800 truncate">{property.latestInspection.inspectionDate}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full shrink-0 ${isCaveatExpiringSoon ? 'bg-amber-500' : 'bg-purple-500'}`}></span>
          <div className="truncate">
            <div className="text-[10px] text-slate-400 font-mono uppercase">CPC §148A Caveat</div>
            <div className="font-medium text-slate-800 truncate">
              {property.legalRetainer.standingCaveatActive
                ? `${property.legalRetainer.daysRemaining ?? 64}d Remaining`
                : 'Inactive'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
