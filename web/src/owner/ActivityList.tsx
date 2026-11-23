import { Activity, Camera, Landmark, Scale, UserCheck } from 'lucide-react';
import type { ActivityCategory, ActivityEvent, ActivitySeverity } from '@shared/types';
import { IST, formatDate, formatDateTime, formatRelative } from '../format';
import { TONE, type Tone } from '../ui/tone';

const ICONS: Record<ActivityCategory, typeof Activity> = {
  CAMERA: Camera,
  INSPECTION: UserCheck,
  REGISTRY: Landmark,
  LEGAL: Scale,
  SYSTEM: Activity
};

const SEVERITY_TONE: Record<ActivitySeverity, Tone> = { ALERT: 'bad', WARNING: 'warn', SUCCESS: 'ok', INFO: 'neutral' };

function dayLabel(iso: string, now: Date): string {
  const day = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: IST });
  const date = new Date(iso);
  if (day(date) === day(now)) return 'Today';
  if (day(date) === day(new Date(now.getTime() - 86_400_000))) return 'Yesterday';
  return formatDate(iso);
}

/** A timeline of activity, grouped by day (IST). */
export function ActivityList({ events, now, grouped = true }: { events: ActivityEvent[]; now: Date; grouped?: boolean }) {
  if (events.length === 0) return <p className="text-sm text-muted">Nothing has happened yet.</p>;

  let lastDay = '';
  return (
    <ol className="relative">
      {events.map((event, index) => {
        const Icon = ICONS[event.category];
        const tone = TONE[SEVERITY_TONE[event.severity]];
        const label = dayLabel(event.at, now);
        const showDay = grouped && label !== lastDay;
        lastDay = label;
        const isLast = index === events.length - 1;
        return (
          <li key={event.id}>
            {showDay && <div className="eyebrow pt-1 pb-3">{label}</div>}
            <div className="flex gap-3.5 pb-5 relative">
              {!isLast && <span className="absolute left-[15px] top-8 bottom-0 w-px bg-line" aria-hidden />}
              <span className={`relative w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${tone.soft} ${tone.line} ${tone.text}`}>
                <Icon className="w-4 h-4" />
              </span>
              <div className="min-w-0 pt-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-sm font-medium text-ink">{event.title}</span>
                  <time dateTime={event.at} title={formatDateTime(event.at)} className="text-xs text-faint">
                    {formatRelative(event.at, now)}
                  </time>
                </div>
                <p className="text-sm text-muted mt-0.5 leading-relaxed">{event.description}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
