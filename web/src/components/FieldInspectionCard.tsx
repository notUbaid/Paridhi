import React, { useState } from 'react';
import type { FieldInspectionReport, InspectionPhotoDetail } from '../types';
import { InspectionPhotoModal } from './InspectionPhotoModal';
import {
  UserCheck,
  CheckCircle2,
  Camera
} from 'lucide-react';

interface FieldInspectionCardProps {
  inspection: FieldInspectionReport;
  onRequestVisit: () => void;
  surveyNumber?: string;
}

export const FieldInspectionCard: React.FC<FieldInspectionCardProps> = ({
  inspection,
  onRequestVisit,
  surveyNumber = 'Survey Boundary'
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<InspectionPhotoDetail | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const handleOpenPhoto = (idx: number) => {
    if (inspection.photoDetails && inspection.photoDetails[idx]) {
      setSelectedPhoto(inspection.photoDetails[idx]);
    } else {
      setSelectedPhoto({
        url: inspection.geotaggedPhotoUrls[idx] || '',
        cornerPeg: idx === 0 ? 'Peg #1 (North-East Corner Stone)' : 'Peg #3 (South-West Corner Stone)',
        captureTimestamp: 'Nov 19, 2026, 11:32:15 IST',
        gpsCoordinates: { lat: 17.240312, lng: 78.429451 },
        geofenceVerified: true
      });
    }
    setIsPhotoModalOpen(true);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200/90 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col">
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-200/80 bg-slate-50/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-slate-700 shrink-0" />
          <span className="font-semibold text-slate-900 text-sm tracking-tight">
            Physical Ground Verification
          </span>
          <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Monthly In-Person Audit
          </span>
        </div>

        <button
          onClick={onRequestVisit}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-2.5 py-1 rounded transition-colors cursor-pointer"
        >
          Dispatch Inspection
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        {/* Inspector Identity & Date */}
        <div className="flex items-start justify-between gap-4 pb-3.5 border-b border-slate-100">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Assigned Field Auditor</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-2">
              <span>{inspection.inspectorName}</span>
              <span className="text-[10px] font-mono font-normal px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                {inspection.inspectorId}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span>Audited: {inspection.inspectionDate}</span>
              <span className="text-slate-300">·</span>
              <span className="font-mono text-slate-600">{inspection.inspectorPhone}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Ground Verified</span>
            </span>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              Next: {inspection.nextScheduledDate}
            </div>
          </div>
        </div>

        {/* 4-Point Ground Verification Ledger (Clean, No Nested Cards) */}
        <div className="py-3 space-y-2">
          <div className="text-[11px] font-semibold text-slate-800 tracking-tight">
            Physical Inspection Protocol
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
              <div>
                <strong className="text-slate-800 font-medium">Boundary Stones:</strong> 4 corner pillars upright, unshifted, freshly painted.
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
              <div>
                <strong className="text-slate-800 font-medium">Encroachment Check:</strong> Zero debris, bricks, or unauthorized materials.
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
              <div>
                <strong className="text-slate-800 font-medium">Neighbor Inquiry:</strong> {inspection.neighborFeedbackSummary}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
              <div>
                <strong className="text-slate-800 font-medium">NavIC Verification:</strong> GNSS atomic time lock within 50m cadastral peg geofence.
              </div>
            </div>
          </div>
        </div>

        {/* Inspector's Field Log Summary */}
        <div className="rounded p-2.5 bg-slate-50 border border-slate-200/80 text-xs text-slate-700 mb-3.5">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wide mb-0.5">Auditor Contemporaneous Record</div>
          <p className="text-slate-600 leading-relaxed italic text-[11px]">
            "{inspection.summaryNotes}"
          </p>
        </div>

        {/* Geotagged Photo Thumbnails */}
        <div>
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wide mb-1.5 flex items-center justify-between">
            <span>Ground Truth Photos (Click to Enlarge)</span>
            <span className="text-slate-500">BSA 2023 §63 Compliant</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {inspection.geotaggedPhotoUrls.map((url, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleOpenPhoto(idx)}
                className="relative rounded overflow-hidden border border-slate-200/90 h-24 bg-slate-100 group cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-slate-900"
                aria-label={`Inspect high-resolution evidence photo ${idx + 1}`}
              >
                <img
                  src={url}
                  alt={`Field Inspection Photo ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform"
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  <span>View Proof</span>
                </div>
                <div className="absolute bottom-1 left-1.5 bg-slate-950/85 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                  {inspection.photoDetails && inspection.photoDetails[idx]
                    ? inspection.photoDetails[idx].cornerPeg
                    : `Station P${idx + 1}`}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* High-Resolution Photo Lightbox Modal */}
      <InspectionPhotoModal
        photo={selectedPhoto}
        surveyNumber={surveyNumber}
        inspectorName={inspection.inspectorName}
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
      />
    </div>
  );
};
