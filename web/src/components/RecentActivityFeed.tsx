import { Activity, Camera, Landmark, Scale, UserCheck } from 'lucide-react';
import type { ActivityCategory, ActivityEvent, ActivitySeverity } from '@shared/types';
import { formatDateTime, formatRelative } from '../format';

const ICONS: Record<ActivityCategory, typeof Activity> = {
  CAMERA: Camera,
  INSPECTION: UserCheck,
  REGISTRY: Landmark,
  LEGAL: Scale,
  SYSTEM: Activity
};

const SEVERITY: Record<ActivitySeverity, { label: string; className: string }> = {
  ALERT: { label: 'Alert', className: 'bg-red-50 text-red-700 border-red-200' },
  WARNING: { label: 'Review', className: 'bg-amber-50 text-amber-800 border-amber-200' },
  SUCCESS: { label: 'OK', className: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  INFO: { label: 'Info', className: 'bg-slate-100 text-slate-600 border-slate-200' }
};

export function RecentActivityFeed({ activities, now }: { activities: ActivityEvent[]; now: Date }) {
  return (
    <section className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-700 shrink-0" />
          <h2 className="font-semibold text-slate-900 text-sm tracking-tight">Activity</h2>
        </div>
        <span className="text-xs text-slate-400">Most recent first</span>
      </div>

      {activities.length === 0 ? (
        <p className="p-5 text-xs text-slate-500">No activity yet.</p>
      ) : (
        <ol className="divide-y divide-slate-100">
          {activities.map((event) => {
            const Icon = ICONS[event.category];
            const severity = SEVERITY[event.severity];
            return (
              <li key={event.id} className="p-3.5 flex items-start gap-3">
                <div className="w-6 h-6 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5 flex-wrap">
                    <span className="text-xs font-semibold text-slate-900">{event.title}</span>
                    <div className="flex items-center gap-2">
                      <time dateTime={event.at} title={formatDateTime(event.at)} className="text-[11px] font-mono text-slate-400">
                        {formatRelative(event.at, now)}
                      </time>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono font-medium ${severity.className}`}>
                        {severity.label}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{event.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
