import React from 'react';
import type { PropertyRecord } from '../types';
import { MapPin, CheckCircle2, AlertTriangle } from 'lucide-react';

interface PropertySelectorProps {
  properties: PropertyRecord[];
  selectedPropertyId: string;
  onSelectProperty: (id: string) => void;
}

export const PropertySelector: React.FC<PropertySelectorProps> = ({
  properties,
  selectedPropertyId,
  onSelectProperty
}) => {
  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Portfolio of Monitored Real Estate Holdings
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>All 3 plots registered under continuous 4G solar & revenue monitoring</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {properties.map((prop) => {
            const isSelected = prop.id === selectedPropertyId;
            const isAlert = prop.status !== 'ALL_CLEAR';

            return (
              <button
                key={prop.id}
                onClick={() => onSelectProperty(prop.id)}
                className={`text-left rounded-xl p-3.5 border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-slate-50/80 border-slate-900 shadow-xs ring-1 ring-slate-900/10'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="font-semibold text-slate-900 text-sm tracking-tight truncate">
                    {prop.name}
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 flex items-center gap-1 ${
                      isAlert
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {isAlert ? (
                      <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                    )}
                    {isAlert ? 'Attention' : 'Protected'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2 truncate">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{prop.location.cityNear}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="font-mono text-slate-600 text-[11px]">
                    {prop.surveyNumber} • {prop.plotSizeDisplay}
                  </div>
                  <div className="font-semibold text-slate-900">
                    ₹{(prop.marketValuationINR / 10000000).toFixed(2)} Cr
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
