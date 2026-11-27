import type { CSSProperties, ReactNode } from 'react';
import { AlertTriangle, ArrowRight, CalendarClock, CheckCircle2, CircleDashed, FileCheck, FileText, OctagonAlert } from 'lucide-react';
import type { PropertyRecord } from '@shared/types';
import { formatDate, formatRelative } from '../format';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { TONE, type Tone } from '../ui/tone';
import { ActivityList } from './ActivityList';
import { PhotoImage } from '../components/PhotoImage';
import type { OwnerTab, PlotSummary, SummaryAction, UpcomingItem } from './summary';
import { SurveyPlate } from './SurveyPlate';

interface OverviewTabProps {
  property: PropertyRecord;
  summary: PlotSummary;
  upcoming: UpcomingItem[];
  now: Date;
  busy: boolean;
  onAction: (action: SummaryAction) => void;
  onGoTo: (tab: OwnerTab) => void;
  onOpenDossier: () => void;
  onOpenCaveatDraft: () => void;
}

const ITEM_ICON: Record<Tone, typeof CheckCircle2> = {
  ok: CheckCircle2,
  warn: AlertTriangle,
  bad: OctagonAlert,
  neutral: CircleDashed
};

/** The most recent photo of the plot: the camera's latest, otherwise the last inspection photo. */
function latestPhoto(property: PropertyRecord) {
  if (property.camera) {
    const { url, capturedAt } = property.camera.latestSnapshot;
    return { kind: 'camera' as const, url, capturedAt };
  }
  const photo = property.inspection.latestVisit?.photos[0];
  return photo ? { kind: 'inspection' as const, photo, capturedAt: photo.capturedAt } : null;
}

export function OverviewTab({ property, summary, upcoming, now, busy, onAction, onGoTo, onOpenDossier, onOpenCaveatDraft }: OverviewTabProps) {
  const photo = latestPhoto(property);
  const headlineTone = TONE[summary.status === 'ALL_CLEAR' ? 'ok' : summary.status === 'ACTION_REQUIRED' ? 'bad' : 'warn'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-6 items-start">
        {/* Hero: the plot itself, true to scale */}
        <figure className="order-2 lg:order-1 relative bg-surface rounded-card border border-line shadow-card overflow-hidden">
          <figcaption className="sr-only">Survey plan of {property.surveyNumber}, drawn to scale from the corner pegs</figcaption>
          <SurveyPlate
            location={property.location}
            surveyNumber={property.surveyNumber}
            pegsIntact={property.inspection.latestVisit?.boundaryPegsIntact ?? true}
            animate
          />
          <div className="border-t border-line">
            {photo ? (
              <button
                type="button"
                onClick={() => onGoTo(photo.kind === 'camera' ? 'site' : 'inspections')}
                className="w-full flex items-center gap-3.5 px-4 py-3 text-left hover:bg-paper/70 transition-colors cursor-pointer group"
              >
                <span className="w-16 h-12 rounded-md overflow-hidden border border-line shrink-0 bg-sunken">
                  {photo.kind === 'camera' ? (
                    <img src={photo.url} alt="" decoding="async" className="w-full h-full object-cover" />
                  ) : (
                    <PhotoImage propertyId={property.id} photo={photo.photo} alt="" className="w-full h-full object-cover" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ink">
                    {photo.kind === 'camera' ? 'Latest camera photo' : 'Latest inspection photo'}
                  </span>
                  <span className="block text-sm text-muted">
                    Taken {formatRelative(photo.capturedAt, now)}
                    {photo.kind === 'inspection' && ` at peg ${photo.photo.pegId}`}
                  </span>
                </span>
                <ArrowRight className="w-4 h-4 text-muted group-hover:text-ink shrink-0" />
              </button>
            ) : (
              <span className="block px-4 py-3 text-sm text-muted">No photos yet. The first inspection adds them.</span>
            )}
          </div>
        </figure>

        {/* Status in plain words */}
        <Card bodyClassName="p-6" className="order-1 lg:order-2">
          <div className="eyebrow">Today</div>
          <h2 className={`font-display text-title mt-1 ${summary.status === 'ALL_CLEAR' ? 'text-ink' : headlineTone.text}`}>
            {summary.headline}
          </h2>
          <p className="text-muted mt-1.5">{summary.intro}</p>

          <ul className="mt-5 divide-y divide-line border-t border-line">
            {summary.items.map((item, index) => {
              const Icon = ITEM_ICON[item.tone];
              return (
                <li key={item.area} className="py-4 flex gap-3 enter" style={{ '--delay': `${120 + index * 70}ms` } as CSSProperties}>
                  <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${TONE[item.tone].text}`} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-ink">{item.title}</div>
                    <p className="text-sm text-muted mt-0.5">{item.detail}</p>
                    {item.action && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onAction(item.action!)}
                        className={`mt-2 inline-flex items-center gap-1 text-sm font-medium cursor-pointer disabled:opacity-50 ${
                          item.tone === 'ok' || item.tone === 'neutral' ? 'text-ink-soft hover:text-ink' : TONE[item.tone].text
                        }`}
                      >
                        {item.action.label}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <Card title="Coming up" icon={<CalendarClock className="w-5 h-5" />}>
          <ol className="space-y-4">
            {upcoming.map((item) => (
              <li key={item.title} className="flex gap-4">
                <div className={`w-14 shrink-0 text-center rounded-lg border py-1.5 ${item.overdue ? 'border-warn-line bg-warn-soft text-warn' : 'border-line bg-paper text-ink'}`}>
                  <div className="text-xs uppercase tracking-wide">
                    {new Date(item.date).toLocaleDateString('en-IN', { month: 'short', timeZone: 'Asia/Kolkata' })}
                  </div>
                  <div className="font-display text-heading leading-none mt-0.5">
                    {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', timeZone: 'Asia/Kolkata' })}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-ink">
                    {item.title}
                    {item.overdue && <span className="text-warn font-normal"> · overdue</span>}
                  </div>
                  <p className="text-sm text-muted">{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>

        <Card
          title="Latest updates"
          className="lg:col-span-2"
          action={
            <Button variant="ghost" size="sm" onClick={() => onGoTo('activity')}>
              See all
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          }
        >
          <ActivityList events={property.activity.slice(0, 4)} now={now} grouped={false} />
        </Card>
      </div>

      <Card title="Documents" description="For you and your advocate. Both open in a printable view.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DocumentButton
            icon={<FileCheck className="w-5 h-5" />}
            title="Property dossier"
            detail={`Everything on file for ${property.surveyNumber}, signed so it can be checked later.`}
            onClick={onOpenDossier}
          />
          <DocumentButton
            icon={<FileText className="w-5 h-5" />}
            title="Caveat draft"
            detail={
              property.legal.caveat
                ? `Current caveat lodged ${formatDate(property.legal.caveat.lodgedOn)}. Draft for your advocate.`
                : 'A starting draft for your advocate to adapt and file.'
            }
            onClick={onOpenCaveatDraft}
          />
        </div>
      </Card>
    </div>
  );
}

function DocumentButton({ icon, title, detail, onClick }: { icon: ReactNode; title: string; detail: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left flex gap-3 p-4 rounded-xl border border-line bg-paper/60 hover:bg-sunken/60 hover:border-line-strong transition-colors cursor-pointer"
    >
      <span className="w-10 h-10 rounded-lg bg-surface border border-line text-accent flex items-center justify-center shrink-0">{icon}</span>
      <span className="min-w-0">
        <span className="block font-medium text-ink">{title}</span>
        <span className="block text-sm text-muted mt-0.5">{detail}</span>
      </span>
    </button>
  );
}
