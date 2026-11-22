import React from 'react';
import type { PropertyRecord } from '../types.js';
import { MapPin, Globe, AlertTriangle, ShieldCheck } from 'lucide-react';

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {properties.map((property) => {
        const isSelected = property.id === selectedPropertyId;
        const hasCritical = property.activeIncidents.some((i) => i.severity === 'CRITICAL');
        const hasWarning = property.activeIncidents.length > 0 || !property.registryRadar.cleanTitle;

        return (
          <button
            key={property.id}
            onClick={() => onSelectProperty(property.id)}
            className={`text-left p-3.5 rounded-xl border transition-all duration-200 relative overflow-hidden ${
              isSelected
                ? 'bg-slate-900/90 border-cyan-500/70 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/40'
                : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
            }`}
          >
            {/* Top highlight bar */}
            {isSelected && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-500" />
            )}

            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                  {property.name}
                </h2>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                  <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>
                    Survey {property.cadastre.surveyNumber} • {property.cadastre.mandalTaluk},{' '}
                    {property.cadastre.district}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              {hasCritical ? (
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/40 text-red-400 font-medium shrink-0 animate-pulse">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  BREACH
                </span>
              ) : hasWarning ? (
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-400 font-medium shrink-0">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  RADAR FLAG
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-medium shrink-0">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  SECURED
                </span>
              )}
            </div>

            {/* Owner & Valuation Details */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1 text-slate-400">
                <Globe className="w-3 h-3 text-slate-500" />
                <span className="truncate max-w-[140px]">{property.ownerOverseasCity}</span>
              </div>
              <div className="font-mono text-slate-300 font-medium flex items-center">
                <span>₹{(property.cadastre.marketValuationINR / 10000000).toFixed(1)} Cr</span>
                <span className="text-slate-500 ml-1.5">({property.cadastre.areaAcres} Ac)</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
