import { Clock, Compass, MapPin, UserCheck } from 'lucide-react';
import { PHOTO_GEOFENCE_METERS, photoDistanceToPeg } from '@shared/domain';
import type { InspectionPhoto, PropertyRecord } from '@shared/types';
import { formatDateTime, formatMeters } from '../format';
import { Modal } from './Modal';
import { PhotoImage } from './PhotoImage';

interface InspectionPhotoModalProps {
  photo: InspectionPhoto | null;
  property: PropertyRecord;
  inspectorName: string;
  onClose: () => void;
}

export function InspectionPhotoModal({ photo, property, inspectorName, onClose }: InspectionPhotoModalProps) {
  if (!photo) return null;

  const peg = property.location.boundaryPegs.find((p) => p.id === photo.pegId);
  const distance = photoDistanceToPeg(photo, property.location.boundaryPegs);
  const inside = distance !== null && distance <= PHOTO_GEOFENCE_METERS;

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      icon={<Compass className="w-4 h-4 text-slate-700 shrink-0" />}
      title={`Peg ${photo.pegId}${peg ? ` (${peg.corner})` : ''} · ${property.surveyNumber}`}
    >
      <div className="bg-slate-950 flex items-center justify-center h-[min(60vh,560px)]">
        <PhotoImage
          propertyId={property.id}
          photo={photo}
          alt={`Inspection photo of peg ${photo.pegId}`}
          className="w-full h-full object-contain"
        />
      </div>

      <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <div className="text-[10px] uppercase font-semibold text-slate-400">Phone location when added</div>
          <div className="font-mono text-slate-900 font-semibold mt-0.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            {photo.position.lat.toFixed(6)}°N, {photo.position.lng.toFixed(6)}°E
          </div>
          <div className={`text-[11px] font-medium mt-0.5 ${inside ? 'text-emerald-700' : 'text-red-700'}`}>
            {distance === null
              ? 'Peg not found in the survey'
              : `${formatMeters(distance)} from peg ${photo.pegId} (${inside ? 'within' : 'outside'} ${PHOTO_GEOFENCE_METERS} m)`}
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase font-semibold text-slate-400">Taken</div>
          <div className="font-mono text-slate-900 font-semibold mt-0.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            {formatDateTime(photo.capturedAt)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 font-mono break-all">
            {photo.sha256 ? `SHA-256 ${photo.sha256.slice(0, 16)}…` : "From the phone's clock at capture"}
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase font-semibold text-slate-400">Inspector</div>
          <div className="text-slate-900 font-semibold mt-0.5 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            {inspectorName}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Phone GPS can be spoofed; the visit log is the primary record</div>
        </div>
      </div>
    </Modal>
  );
}
