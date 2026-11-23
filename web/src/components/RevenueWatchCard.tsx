import type { ReactNode } from 'react';
import { AlertTriangle, ExternalLink, Landmark, RefreshCw } from 'lucide-react';
import type { RevenueRecord } from '@shared/types';
import { formatDate, formatDateTime, formatRelative } from '../format';

interface RevenueWatchCardProps {
  revenue: RevenueRecord;
  now: Date;
  checking: boolean;
  /** Only the demo lets owners run a (simulated) check; otherwise staff record checks. */
  onCheckNow?: () => void;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1 border-b border-slate-50">
      <dt className="text-slate-500 font-medium shrink-0">{label}</dt>
      <dd className="font-medium text-slate-900 text-right">{children}</dd>
    </div>
  );
}

export function RevenueWatchCard({ revenue, now, checking, onCheckNow }: RevenueWatchCardProps) {
  const flagged = revenue.flaggedMutations;

  return (
    <section className="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col">
      <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Landmark className="w-4 h-4 text-slate-700 shrink-0" />
          <h2 className="font-semibold text-slate-900 text-sm tracking-tight whitespace-nowrap">Land record watch</h2>
          <span
            className={`text-[11px] font-mono px-2 py-0.5 rounded border inline-flex items-center gap-1 whitespace-nowrap ${
              flagged.length === 0
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : 'text-red-800 bg-red-50 border-red-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${flagged.length === 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {flagged.length === 0 ? 'Nothing flagged' : `${flagged.length} flagged`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={revenue.portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 whitespace-nowrap text-[11px] font-medium text-slate-600 hover:text-slate-900 px-2 py-1 rounded border border-slate-200 hover:bg-slate-50"
            title="Open the official state land records portal"
          >
            State portal
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
          {onCheckNow && (
          <button
            type="button"
            onClick={onCheckNow}
            disabled={checking}
            className="flex items-center gap-1.5 whitespace-nowrap bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-60 text-slate-700 text-xs font-medium px-2.5 py-1 rounded transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${checking ? 'animate-spin' : ''}`} />
            {checking ? 'Checking…' : 'Check now'}
          </button>
          )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between gap-3">
        <div>
          <div className="flex items-start justify-between gap-4 pb-3.5 border-b border-slate-100">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Source</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{revenue.portalName}</div>
              <div
                className="text-xs text-slate-500 mt-0.5 font-mono"
                title={revenue.lastCheckedAt ? formatDateTime(revenue.lastCheckedAt) : undefined}
              >
                {revenue.lastCheckedAt ? `Last checked ${formatRelative(revenue.lastCheckedAt, now)}` : 'Not checked yet'}
              </div>
            </div>
            <div className="text-right">
              <span className="whitespace-nowrap text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                {revenue.accountLabel} {revenue.accountNumber}
              </span>
              <div className="text-[10px] text-slate-400 font-mono mt-1">Survey {revenue.surveyNumber}</div>
            </div>
          </div>

          {flagged.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {flagged.map((mutation) => (
                <li
                  key={mutation.reference}
                  className="rounded border border-red-200 bg-red-50 p-2.5 text-xs text-red-900 flex items-start gap-2"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">
                      {mutation.reference} · filed {formatDate(mutation.filedOn)}
                    </div>
                    <div className="text-[11px] mt-0.5">{mutation.description}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <dl className="py-3 space-y-1.5 text-xs">
            <Row label="Recorded owner">{revenue.recordedOwner}</Row>
            <Row label="Record status">{revenue.recordStatus}</Row>
            <Row label="Encumbrance">{revenue.encumbranceStatus}</Row>
            <Row label="Property tax">{revenue.propertyTaxStatus}</Row>
          </dl>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          Paridhi staff check the public record for new mutation applications. State portals do not send
          notifications, so a filing can appear between checks. Encumbrance details come from the Sub-Registrar, not
          the land records portal.
        </p>
      </div>
    </section>
  );
}
