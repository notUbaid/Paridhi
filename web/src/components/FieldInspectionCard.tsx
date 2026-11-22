import React from 'react';
import type { FieldInspectionReport } from '../types';
import {
  UserCheck,
  CheckCircle2,
  Calendar,
  Phone,
  Camera,
  MapPin,
  ShieldCheck
} from 'lucide-react';

interface FieldInspectionCardProps {
  inspection: FieldInspectionReport;
  onRequestVisit: () => void;
}

export const FieldInspectionCard: React.FC<FieldInspectionCardProps> = ({
  inspection,
  onRequestVisit
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-slate-700" />
          <span className="font-semibold text-slate-900 text-sm">
            Verified Physical Field Inspections
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-blue-600" />
            Monthly Human Audit
          </span>
        </div>

        <button
          onClick={onRequestVisit}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shadow-xs cursor-pointer"
        >
          Request On-Demand Visit
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        {/* Inspector Identity & Date */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Assigned Field Inspector</div>
            <div className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-2">
              <span>{inspection.inspectorName}</span>
              <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {inspection.inspectorId}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Audited: {inspection.inspectionDate}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{inspection.inspectorPhone}</span>
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Verified In-Person
            </span>
            <div className="text-[11px] text-slate-400 mt-1">
              Next scheduled: {inspection.nextScheduledDate}
            </div>
          </div>
        </div>

        {/* 4-Point Ground Verification Checklist */}
        <div className="py-4 space-y-2.5">
          <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            In-Person Verification Checklist
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800">Corner Boundary Stones:</span>{' '}
                <span className="text-slate-600">
                  All 4 corner boundary pillars verified intact, upright, and visibly painted.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800">Zero Encroachment / Dumping:</span>{' '}
                <span className="text-slate-600">
                  Confirmed no bricks, sand, construction debris, or unauthorized structures.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800">Neighbor Inquiry Conducted:</span>{' '}
                <span className="text-slate-600">
                  {inspection.neighborFeedbackSummary}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800">Geotagged Photo Archive:</span>{' '}
                <span className="text-slate-600">
                  High-res 360° ground photos archived with GPS coordinate & time stamp.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Inspector's Field Log Summary */}
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs text-slate-700 mb-4">
          <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>Inspector Field Log Notes</span>
          </div>
          <p className="text-slate-600 leading-relaxed italic">
            "{inspection.summaryNotes}"
          </p>
        </div>

        {/* Geotagged Photo Thumbnails */}
        <div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase mb-2 flex items-center justify-between">
            <span>Archived Ground Evidence Photos</span>
            <span className="font-normal lowercase text-slate-400">2 high-res photos verified</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {inspection.geotaggedPhotoUrls.map((url, idx) => (
              <div
                key={idx}
                className="relative rounded-lg overflow-hidden border border-slate-200 h-24 bg-slate-100 group cursor-pointer"
              >
                <img
                  src={url}
                  alt={`Field Inspection Photo ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1">
                  <Camera className="w-3.5 h-3.5" />
                  <span>View Full Photo</span>
                </div>
                <div className="absolute bottom-1 left-1.5 bg-slate-900/75 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                  Peg #{idx + 1} • {idx === 0 ? 'NE Corner' : 'SW Corner'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
