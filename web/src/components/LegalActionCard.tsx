import { AlertTriangle, FileCheck, FileText, Scale } from 'lucide-react';
import { CAVEAT_VALIDITY_DAYS, getCaveatStatus } from '@shared/domain';
import type { LegalRetainer } from '@shared/types';
import { formatDate, formatRelative } from '../format';

interface LegalActionCardProps {
  legal: LegalRetainer;
  now: Date;
  requesting: boolean;
  onOpenDraft: () => void;
  onRequestRenewal: () => void;
  onOpenDossier: () => void;
}

export function LegalActionCard({
  legal,
  now,
  requesting,
  onOpenDraft,
  onRequestRenewal,
  onOpenDossier
}: LegalActionCardProps) {
  const caveat = getCaveatStatus(legal, now);
  const warn = caveat.state === 'EXPIRING' || caveat.state === 'EXPIRED';

  const badge =
    caveat.state === 'NONE'
      ? 'No caveat'
      : caveat.state === 'EXPIRED'
        ? 'Caveat lapsed'
        : `${caveat.daysRemaining} days left`;

  const actionLabel = caveat.renewalRequested
    ? 'Renewal requested'
    : legal.caveat
      ? 'Ask advocate to renew'
      : 'Ask advocate to file a caveat';

  return (
    <section className="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col">
      <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-slate-700 shrink-0" />
          <h2 className="font-semibold text-slate-900 text-sm tracking-tight">Caveat &amp; advocate</h2>
        </div>
        <button
          type="button"
          onClick={onOpenDraft}
          className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          Caveat draft
        </button>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between gap-3">
        <div>
          <div className="flex items-start justify-between gap-4 pb-3.5 border-b border-slate-100">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Retained advocate</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-2 flex-wrap">
                {legal.advocateName}
                <span className="text-[10px] font-mono font-normal px-1.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  Enrolment {legal.enrolmentNumber}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{legal.courts}</div>
            </div>
            <div className="text-right shrink-0">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded border ${
                  warn
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : caveat.state === 'NONE'
                      ? 'bg-slate-50 text-slate-700 border-slate-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                {badge}
              </span>
              {caveat.expiresOn && (
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  {caveat.state === 'EXPIRED' ? 'Lapsed' : 'Lapses'} {formatDate(caveat.expiresOn)}
                </div>
              )}
            </div>
          </div>

          <div className="py-3 space-y-2.5 text-xs">
            {legal.caveat && (
              <div className="text-slate-600">
                Lodged in <strong className="font-medium text-slate-800">{legal.caveat.court}</strong> on{' '}
                {formatDate(legal.caveat.lodgedOn)}.
              </div>
            )}

            {warn && !caveat.renewalRequested && (
              <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">
                  A caveat stays in force for {CAVEAT_VALIDITY_DAYS} days (Section 148A(5) CPC). Ask your advocate to
                  lodge a fresh one before it lapses.
                </span>
              </div>
            )}

            {caveat.renewalRequested && legal.renewalRequestedAt && (
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-slate-700 text-[11px]">
                Renewal requested {formatRelative(legal.renewalRequestedAt, now)}. Your advocate will confirm the new
                lodging date.
              </div>
            )}

            <p className="text-[11px] text-slate-500 leading-relaxed">
              A caveat means the civil court must notify your advocate before passing an order on an application about
              this plot. It does not stop orders being made. It is a civil-court procedure: objections to a mutation
              before the Tahsildar are filed separately under the state's land records law.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          <button
            type="button"
            onClick={onRequestRenewal}
            disabled={requesting || caveat.renewalRequested}
            className="flex-1 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-default text-white text-xs font-medium py-2 px-3 rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Scale className="w-3.5 h-3.5" />
            {requesting ? 'Sending…' : actionLabel}
          </button>
          <button
            type="button"
            onClick={onOpenDossier}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium py-2 px-3 rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FileCheck className="w-3.5 h-3.5 text-slate-500" />
            Dossier
          </button>
        </div>
      </div>
    </section>
  );
}
