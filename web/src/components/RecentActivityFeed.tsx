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
      case 'SUCCESS':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
            Verified Clean
          </span>
        );
      case 'ALERT':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-medium flex items-center gap-1">
            <AlertTriangle className="w-2.5 h-2.5" />
            Anomaly
          </span>
        );
      case 'WARNING':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
            Attention
          </span>
        );
      default:
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
            Logged
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-700" />
          <span className="font-semibold text-slate-900 text-sm">
            Continuous Operational Audit Feed
          </span>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          Immutable 30-Day Activity Ledger
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {activities.map((act) => (
          <div key={act.id} className="p-4 hover:bg-slate-50/60 transition-colors flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
              {getCategoryIcon(act.category)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
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
