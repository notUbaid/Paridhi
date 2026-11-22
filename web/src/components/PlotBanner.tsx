import React from 'react';
import type { PropertyRecord } from '../types';
import { MapPin, User, BatteryCharging, ShieldAlert, ShieldCheck, CalendarCheck, Scale } from 'lucide-react';

interface PlotBannerProps {
  property: PropertyRecord;
}

export const PlotBanner: React.FC<PlotBannerProps> = ({ property }) => {
  const isAlert = property.status !== 'ALL_CLEAR';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Property core metadata */}
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {property.name}
            </h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              {property.surveyNumber}
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1.5 border ${
                isAlert
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {isAlert ? (
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              )}
              {property.statusBadgeText}
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-y-1 gap-x-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {property.location.village}, {property.location.mandalTaluk},{' '}
                {property.location.district}, {property.location.state}
              </span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <span className="font-medium text-slate-700">{property.plotSizeDisplay}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Owner:</span>
              <span className="font-medium text-slate-800">{property.owner.name}</span>
              <span className="text-slate-400">({property.owner.overseasCity})</span>
            </div>
          </div>
        </div>

        {/* Right: Key Protection Metrics Pillars */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Revenue Registry Badge */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-lg px-3 py-2 text-xs">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">State Title Registry</div>
            <div className="flex items-center gap-1 text-slate-800 font-medium mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Clean • Zero Adverse Filings</span>
            </div>
          </div>

          {/* 4G Camera Pod Badge */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-lg px-3 py-2 text-xs">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">4G Solar Pod</div>
            <div className="flex items-center gap-1.5 text-slate-800 font-medium mt-0.5">
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
              <span>{property.cameraPod.batteryPercentage}% • Online</span>
            </div>
          </div>

          {/* Monthly Physical Inspection */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-lg px-3 py-2 text-xs">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Last Field Audit</div>
            <div className="flex items-center gap-1 text-slate-800 font-medium mt-0.5">
              <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>{property.latestInspection.inspectionDate}</span>
            </div>
          </div>

          {/* Standing Caveat */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-lg px-3 py-2 text-xs">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Legal Protection</div>
            <div className="flex items-center gap-1 text-slate-800 font-medium mt-0.5">
              <Scale className="w-3.5 h-3.5 text-purple-600" />
              <span>Sec 148A CPC Caveat Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
