import React from 'react';
import type { ActivityEvent } from '../types';
import {
  Activity,
  Camera,
  UserCheck,
  Landmark,
  Scale,
  AlertTriangle
} from 'lucide-react';

interface RecentActivityFeedProps {
  activities: ActivityEvent[];
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ activities }) => {
  const getCategoryIcon = (category: ActivityEvent['category']) => {
    switch (category) {
      case 'CAMERA':
        return <Camera className="w-3.5 h-3.5 text-blue-600" />;
      case 'INSPECTION':
        return <UserCheck className="w-3.5 h-3.5 text-emerald-600" />;
      case 'REGISTRY':
        return <Landmark className="w-3.5 h-3.5 text-indigo-600" />;
      case 'LEGAL':
        return <Scale className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const getSeverityBadge = (severity: ActivityEvent['severity']) => {
    switch (severity) {
      case 'ALERT':
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-mono font-medium flex items-center gap-1">
            <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
            <span>ALERT</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-mono font-medium">
            REVIEW
          </span>
        );
      case 'SUCCESS':
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-mono font-medium">
            ATTESTED
          </span>
        );
      default:
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono font-medium">
            RECORDED
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200/90 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="px-5 py-3 border-b border-slate-200/80 bg-slate-50/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-700 shrink-0" />
          <span className="font-semibold text-slate-900 text-sm tracking-tight">
            Operational Audit Trail
          </span>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Immutable 30-Day Physical & Judicial Ledger
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {activities.map((act) => (
          <div key={act.id} className="p-3.5 hover:bg-slate-50/60 transition-colors flex items-start gap-3">
            <div className="w-6 h-6 rounded bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 mt-0.5">
              {getCategoryIcon(act.category)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5 flex-wrap">
                <span className="text-xs font-semibold text-slate-900">
                  {act.title}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400">
                    {act.timestamp}
                  </span>
                  {getSeverityBadge(act.severity)}
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {act.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
