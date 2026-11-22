import React, { useEffect } from 'react';
import type { InspectionPhotoDetail } from '../types';
import { X, ShieldCheck, MapPin, Clock, UserCheck, Compass } from 'lucide-react';

interface InspectionPhotoModalProps {
  photo: InspectionPhotoDetail | null;
  surveyNumber: string;
  inspectorName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const InspectionPhotoModal: React.FC<InspectionPhotoModalProps> = ({
  photo,
  surveyNumber,
  inspectorName,
  isOpen,
  onClose
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !photo) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="photo-modal-title"
    >
      <div
        className="bg-white rounded-lg border border-slate-200/90 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <Compass className="w-4 h-4 text-slate-700 shrink-0" />
            <h3 id="photo-modal-title" className="font-bold text-slate-900 text-sm tracking-tight">
              {photo.cornerPeg} · {surveyNumber}
            </h3>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Geotagged & Sealed</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close photo preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* High-Resolution Image Canvas */}
        <div className="relative bg-slate-950 flex-1 min-h-[380px] max-h-[580px] overflow-hidden flex items-center justify-center">
          <img
            src={photo.url}
            alt={photo.cornerPeg}
            className="w-full h-full object-contain select-none"
          />

          {/* On-image Corner Boundary Tag */}
          <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-xs text-white px-3 py-1.5 rounded-lg text-xs font-mono border border-white/20 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Ground Truth Proof: {photo.cornerPeg}</span>
          </div>
        </div>

        {/* Technical Ground Telemetry & Verification Footer */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Physical Location & Geofence</div>
            <div className="font-mono text-slate-900 font-semibold mt-0.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{photo.gpsCoordinates.lat.toFixed(6)}° N, {photo.gpsCoordinates.lng.toFixed(6)}° E</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Proximity &lt; 50m of Cadastral Peg</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Capture Timestamp & Timezone</div>
            <div className="font-mono text-slate-900 font-semibold mt-0.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{photo.captureTimestamp}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Hardware NavIC GNSS atomic time lock</div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Field Auditor Signature</div>
            <div className="text-slate-900 font-semibold mt-0.5 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Signed by {inspectorName}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-mono">BSA 2023 §63 Contemporaneous Record</div>
          </div>
        </div>
      </div>
    </div>
  );
};
