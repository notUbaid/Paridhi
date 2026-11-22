import React from 'react';
import type { PropertyRecord } from '../types';

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
    <div className="bg-white border-b border-slate-200/80 px-6 py-2.5">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span className="font-semibold text-slate-800 tracking-tight">Portfolio Holdings</span>
          <span className="font-mono text-[11px] text-slate-400">Total Asset Base: ₹13.80 Cr across 3 States</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {properties.map((prop) => {
            const isSelected = prop.id === selectedPropertyId;
            const isAlert = prop.status !== 'ALL_CLEAR';

            return (
              <button
                key={prop.id}
                onClick={() => onSelectProperty(prop.id)}
                className={`text-left rounded-lg p-3 border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900/10'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="font-semibold text-slate-900 text-xs tracking-tight truncate">
                    {prop.name}
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium shrink-0 flex items-center gap-1 ${
                      isAlert
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isAlert ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                    {isAlert ? 'Attention' : 'Clean'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="truncate">{prop.location.cityNear}</span>
                  <span className="font-mono text-slate-900 font-semibold shrink-0">
                    ₹{(prop.marketValuationINR / 10000000).toFixed(2)} Cr
                  </span>
                </div>

                <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
                  {prop.surveyNumber} · {prop.plotSizeDisplay}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
