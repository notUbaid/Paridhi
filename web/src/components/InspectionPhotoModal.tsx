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
      icon={<Compass className="w-4 h-4 text-ink-soft shrink-0" />}
      title={`Peg ${photo.pegId}${peg ? ` (${peg.corner})` : ''} · ${property.surveyNumber}`}
    >
      <div className="bg-ink flex items-center justify-center h-[min(60vh,560px)]">
        <PhotoImage
          propertyId={property.id}
          photo={photo}
          alt={`Inspection photo of peg ${photo.pegId}`}
          className="w-full h-full object-contain"
        />
      </div>

      <div className="px-5 py-4 bg-paper border-t border-line grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-xs uppercase font-semibold text-faint">Phone location when added</div>
          <div className="font-mono text-ink font-semibold mt-0.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-muted shrink-0" />
            {photo.position.lat.toFixed(6)}°N, {photo.position.lng.toFixed(6)}°E
          </div>
          <div className={`text-[13px] font-medium mt-0.5 ${inside ? 'text-ok' : 'text-bad'}`}>
            {distance === null
              ? 'Peg not found in the survey'
              : `${formatMeters(distance)} from peg ${photo.pegId} (${inside ? 'within' : 'outside'} ${PHOTO_GEOFENCE_METERS} m)`}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase font-semibold text-faint">Taken</div>
          <div className="font-mono text-ink font-semibold mt-0.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-muted shrink-0" />
            {formatDateTime(photo.capturedAt)}
          </div>
          <div className="text-[13px] text-muted mt-0.5 font-mono break-all">
            {photo.sha256 ? `SHA-256 ${photo.sha256.slice(0, 16)}…` : "From the phone's clock at capture"}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase font-semibold text-faint">Inspector</div>
          <div className="text-ink font-semibold mt-0.5 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-muted shrink-0" />
            {inspectorName}
          </div>
          <div className="text-[13px] text-muted mt-0.5">Phone GPS can be spoofed; the visit log is the primary record</div>
        </div>
      </div>
    </Modal>
  );
}
