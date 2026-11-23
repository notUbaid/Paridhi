import { useEffect, useState } from 'react';
import type { PropertyStatus } from '@shared/domain';
import type { PropertyRecord } from '@shared/types';
import { IST, formatClock, formatCrore } from '../format';
import { StatusBadge } from '../ui/Badge';

interface PlotHeaderProps {
  property: PropertyRecord;
  status: PropertyStatus;
  lastSyncedAt: Date | null;
  syncFailed: boolean;
}

export function PlotHeader({ property, status, lastSyncedAt, syncFailed }: PlotHeaderProps) {
  const [clock, setClock] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 15_000);
    return () => window.clearInterval(timer);
  }, []);

  const { location, owner } = property;
  const city = owner.overseasCity.split(',')[0];

  return (
    <div className="pt-8 pb-5 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
      <div className="min-w-0">
        <div className="eyebrow">
          {location.village}, {location.district} · {location.state}
        </div>
        <h1 className="font-display text-[34px] sm:text-[40px] leading-[1.1] text-ink mt-1.5">{property.name}</h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3 text-sm text-muted">
          <StatusBadge status={status} size="md" />
          <span>{property.surveyNumber}</span>
          <span aria-hidden className="text-line-strong">·</span>
          <span>{property.plotSizeDisplay}</span>
          <span aria-hidden className="text-line-strong">·</span>
          <span>Est. {formatCrore(property.marketValuationINR)}</span>
        </div>
      </div>

      <div className="text-sm text-muted lg:text-right shrink-0 space-y-0.5">
        <div>
          At the plot <span className="text-ink font-medium tabular-nums">{formatClock(clock, IST)}</span>
          <span aria-hidden className="mx-2 text-line-strong">·</span>
          {city} <span className="text-ink font-medium tabular-nums">{formatClock(clock, owner.timeZone)}</span>
        </div>
        <div className={`text-xs ${syncFailed ? 'text-warn' : 'text-faint'}`}>
          {syncFailed
            ? 'Offline: showing the last loaded data'
            : lastSyncedAt
              ? `Updated ${formatClock(lastSyncedAt, IST)} IST`
              : 'Connecting…'}
        </div>
      </div>
    </div>
  );
}
