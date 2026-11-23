import { getPropertyAlerts, getPropertyStatus, type PropertyStatus } from '@shared/domain';
import type { PropertyRecord } from '@shared/types';
import { formatCrore } from '../format';
import { StatusPill } from './StatusPill';

interface PropertySelectorProps {
  properties: PropertyRecord[];
  selectedId: string;
  now: Date;
  onSelect: (id: string) => void;
}

export function PropertySelector({ properties, selectedId, now, onSelect }: PropertySelectorProps) {
  const totalValue = properties.reduce((sum, p) => sum + p.marketValuationINR, 0);
  const stateCount = new Set(properties.map((p) => p.location.state)).size;

  return (
    <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span className="font-semibold text-slate-800 tracking-tight">
            Your plots <span className="font-normal text-slate-400">({properties.length})</span>
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            {formatCrore(totalValue)} across {stateCount} state{stateCount === 1 ? '' : 's'} (owner's estimate)
          </span>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-1 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
          {properties.map((property) => {
            const selected = property.id === selectedId;
            const status: PropertyStatus = getPropertyStatus(getPropertyAlerts(property, now));
            return (
              <button
                key={property.id}
                type="button"
                onClick={() => onSelect(property.id)}
                aria-pressed={selected}
                className={`text-left rounded-lg p-3 border transition-colors cursor-pointer shrink-0 w-64 md:w-auto ${
                  selected
                    ? 'bg-slate-50 border-slate-900'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="font-semibold text-slate-900 text-xs tracking-tight truncate">{property.name}</div>
                  <StatusPill status={status} compact />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 gap-2">
                  <span className="truncate">{property.location.cityNear}</span>
                  <span className="font-mono text-slate-900 font-semibold shrink-0">
                    {formatCrore(property.marketValuationINR)}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
                  {property.surveyNumber} · {property.plotSizeDisplay}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
