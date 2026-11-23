import { AlertTriangle, MapPin, User } from 'lucide-react';
import { getCaveatStatus, getPropertyAlerts, getPropertyStatus } from '@shared/domain';
import type { PropertyRecord } from '@shared/types';
import { formatCrore, formatRelative } from '../format';
import { StatusPill } from './StatusPill';

type Tone = 'ok' | 'warn' | 'bad' | 'neutral';
const DOT: Record<Tone, string> = {
  ok: 'bg-emerald-500',
  warn: 'bg-amber-500',
  bad: 'bg-red-500',
  neutral: 'bg-slate-400'
};

function Fact({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className={`w-2 h-2 rounded-full shrink-0 ${DOT[tone]}`} />
      <div className="min-w-0">
        <div className="text-[10px] text-slate-400 font-mono uppercase">{label}</div>
        <div className="font-medium text-slate-800 truncate">{value}</div>
      </div>
    </div>
  );
}

export function PlotBanner({ property, now }: { property: PropertyRecord; now: Date }) {
  const alerts = getPropertyAlerts(property, now);
  const status = getPropertyStatus(alerts);
  const caveat = getCaveatStatus(property.legal, now);
  const flagged = property.revenue.flaggedMutations.length;
  const { location, owner, camera, latestInspection } = property;

  const caveatValue =
    caveat.state === 'NONE'
      ? 'None on file'
      : caveat.state === 'EXPIRED'
        ? 'Lapsed'
        : `${caveat.daysRemaining} days left`;

  return (
    <section className="bg-white rounded-lg border border-slate-200 p-5">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">{property.name}</h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold border border-slate-200">
              {property.surveyNumber}
            </span>
            <StatusPill status={status} />
          </div>

          <div className="flex items-center flex-wrap gap-y-1 gap-x-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {location.village}, {location.mandalTaluk}, {location.district}, {location.state}
            </span>
            <span className="hidden sm:inline text-slate-300">·</span>
            <span className="font-mono text-slate-700 font-medium">{property.plotSizeDisplay}</span>
            <span className="hidden sm:inline text-slate-300">·</span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-800 font-medium">{owner.name}</span>
              <span className="text-slate-400">({owner.overseasCity})</span>
            </span>
          </div>
        </div>

        <div className="lg:text-right">
          <div className="text-[11px] text-slate-400 uppercase tracking-wide font-mono">Estimated value</div>
          <div className="text-base font-bold text-slate-900 font-mono">{formatCrore(property.marketValuationINR)}</div>
        </div>
      </div>

      {alerts.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {alerts.map((alert) => (
            <li
              key={alert.message}
              className={`flex items-start gap-2 text-xs rounded px-2.5 py-1.5 border ${
                alert.level === 'ACTION'
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <AlertTriangle
                className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${alert.level === 'ACTION' ? 'text-red-600' : 'text-amber-600'}`}
              />
              <span>{alert.message}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <Fact
          label="Land record"
          value={flagged === 0 ? 'No flagged applications' : `${flagged} flagged application${flagged === 1 ? '' : 's'}`}
          tone={flagged === 0 ? 'ok' : 'bad'}
        />
        <Fact
          label="Camera"
          value={camera.online ? `Online · battery ${Math.round(camera.batteryPercentage)}%` : 'Offline'}
          tone={!camera.online || camera.changeDetected ? 'warn' : 'ok'}
        />
        <Fact
          label="Last inspection"
          value={formatRelative(latestInspection.inspectedAt, now)}
          tone={latestInspection.boundaryPegsIntact && !latestInspection.debrisFound ? 'ok' : 'bad'}
        />
        <Fact
          label="Caveat (§148A CPC)"
          value={caveatValue}
          tone={caveat.state === 'ACTIVE' ? 'ok' : caveat.state === 'NONE' ? 'neutral' : 'warn'}
        />
      </div>
    </section>
  );
}
