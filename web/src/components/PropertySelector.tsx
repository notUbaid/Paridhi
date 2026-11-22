import React from 'react';
import type { PropertyRecord } from '../types.js';
import { MapPin, AlertCircle, ShieldCheck, FileWarning } from 'lucide-react';

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
            className={`text-left p-4 rounded-xl border transition-all duration-150 relative bg-white ${
              isSelected
                ? 'border-slate-900 ring-2 ring-slate-900 shadow-md'
                : 'border-slate-200 hover:border-slate-400 hover:shadow-xs'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-slate-900 tracking-tight">
                  {property.name}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    Survey {property.cadastre.surveyNumber} • {property.cadastre.village},{' '}
                    {property.cadastre.district}
                  </span>
                </div>
              </div>

              {/* Status Indicator */}
              {hasCritical ? (
                <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-red-50 border border-red-200 text-red-700 shrink-0">
                  <AlertCircle className="w-3 h-3 text-red-600" />
                  Breach Alert
                </span>
              ) : hasWarning ? (
                <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-700 shrink-0">
                  <FileWarning className="w-3 h-3 text-amber-600" />
                  Mutation Flag
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 shrink-0">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Clear & Intact
                </span>
              )}
            </div>

            {/* Metrics footer */}
            <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                <span className="text-slate-400">Owner:</span>{' '}
                <span className="text-slate-700 font-medium">{property.ownerName.split(' ')[0]} ({property.ownerOverseasCity.split(',')[0]})</span>
              </div>
              <div className="font-mono text-slate-900 font-semibold">
                ₹{(property.cadastre.marketValuationINR / 10000000).toFixed(1)} Cr{' '}
                <span className="text-slate-400 font-normal">({property.cadastre.areaAcres} Ac)</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
