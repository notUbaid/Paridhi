import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Camera, ClipboardCheck, Trash2 } from 'lucide-react';
import { PHOTO_GEOFENCE_METERS, distanceMeters } from '@shared/domain';
import type { BoundaryPeg, PropertyRecord, UploadedPhoto } from '@shared/types';
import { api, errorMessage } from '../api';
import { Modal } from '../components/Modal';
import { formatMeters } from '../format';
import { FormActions, FormError, TextArea, YesNo } from './forms';
import { currentPosition, prepareImage } from './image';

interface RecordVisitModalProps {
  property: PropertyRecord;
  open: boolean;
  demo: boolean;
  onClose: () => void;
  onSaved: (property: PropertyRecord) => void;
}

interface PhotoDraft extends UploadedPhoto {
  previewUrl: string;
}

function PegRow({
  peg,
  photos,
  busy,
  onAdd,
  onRemove
}: {
  peg: BoundaryPeg;
  photos: PhotoDraft[];
  busy: boolean;
  onAdd: (peg: BoundaryPeg, file: File) => void;
  onRemove: (photoId: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="rounded border border-slate-200 p-2.5 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-medium text-slate-800">
          Peg {peg.id} <span className="text-slate-400">({peg.corner})</span>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-60 cursor-pointer"
        >
          <Camera className="w-3.5 h-3.5 text-slate-500" />
          {busy ? 'Uploading…' : 'Add photo'}
        </button>
        <input
          ref={input}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (file) onAdd(peg, file);
          }}
        />
      </div>
      {photos.length > 0 && (
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {photos.map((photo) => {
            const distance = distanceMeters(photo.position, peg.position);
            const inside = distance <= PHOTO_GEOFENCE_METERS;
            return (
              <li key={photo.photoId} className="relative rounded overflow-hidden border border-slate-200">
                <img src={photo.previewUrl} alt={`Photo of peg ${peg.id}`} className="w-full h-20 object-cover" />
                <div className={`px-1.5 py-1 text-[10px] font-mono ${inside ? 'text-emerald-800 bg-emerald-50' : 'text-red-800 bg-red-50'}`}>
                  {formatMeters(distance)} from peg {inside ? '✓' : `(over ${PHOTO_GEOFENCE_METERS} m)`}
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(photo.photoId)}
                  className="absolute top-1 right-1 bg-white/90 rounded p-0.5 text-slate-600 hover:text-red-700 cursor-pointer"
                  aria-label="Remove photo from this visit"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function RecordVisitModal({ property, open, demo, onClose, onSaved }: RecordVisitModalProps) {
  const [pegsIntact, setPegsIntact] = useState<boolean | null>(null);
  const [debris, setDebris] = useState<boolean | null>(null);
  const [spokeToNeighbours, setSpokeToNeighbours] = useState<boolean | null>(null);
  const [neighbourFeedback, setNeighbourFeedback] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<PhotoDraft[]>([]);
  const [uploadingPeg, setUploadingPeg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Release local previews when the form closes.
  const previews = useRef<string[]>([]);
  useEffect(() => () => previews.current.forEach((url) => URL.revokeObjectURL(url)), []);

  const addPhoto = async (peg: BoundaryPeg, file: File) => {
    setUploadingPeg(peg.id);
    setError(null);
    try {
      let position: { lat: number; lng: number };
      try {
        position = await currentPosition();
      } catch (locationError) {
        // The demo has no inspector on site, so it falls back to the peg's own position.
        if (!demo) throw locationError;
        position = peg.position;
      }
      const image = await prepareImage(file);
      const uploaded = await api.staff.uploadPhoto(property.id, image, {
        pegId: peg.id,
        lat: position.lat,
        lng: position.lng,
        capturedAt: new Date(file.lastModified || Date.now()).toISOString()
      });
      const previewUrl = URL.createObjectURL(image);
      previews.current.push(previewUrl);
      setPhotos((current) => [...current, { ...uploaded, previewUrl }]);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setUploadingPeg(null);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (pegsIntact === null || debris === null || spokeToNeighbours === null) {
      setError('Answer the three questions about pegs, debris and neighbours.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { property: updated } = await api.staff.recordVisit(property.id, {
        boundaryPegsIntact: pegsIntact,
        debrisFound: debris,
        neighborInquiryConducted: spokeToNeighbours,
        neighborFeedback: spokeToNeighbours ? neighbourFeedback.trim() : '',
        notes: notes.trim(),
        photoIds: photos.map((photo) => photo.photoId)
      });
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const missingPegs = property.location.boundaryPegs.filter((peg) => !photos.some((photo) => photo.pegId === peg.id));

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      icon={<ClipboardCheck className="w-4 h-4 text-slate-700 shrink-0" />}
      title={`Record a visit: ${property.name}`}
    >
      <form onSubmit={submit} className="p-5 space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <YesNo label="Are all boundary pegs in place?" value={pegsIntact} onChange={setPegsIntact} />
          <YesNo label="Any dumping or debris?" value={debris} onChange={setDebris} yes="Found" no="None" />
          <YesNo label="Spoke to neighbours?" value={spokeToNeighbours} onChange={setSpokeToNeighbours} />
        </div>

        {spokeToNeighbours && (
          <TextArea
            label="What the neighbours said"
            value={neighbourFeedback}
            onChange={(e) => setNeighbourFeedback(e.target.value)}
            maxLength={500}
          />
        )}

        <TextArea
          label="Notes for the owner"
          required
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={2000}
          placeholder="What you checked, anything unusual, anything you fixed (e.g. repainted survey flags)."
        />

        <div className="space-y-2">
          <div className="text-[11px] font-medium text-slate-700">Photos of each corner peg</div>
          <p className="text-[11px] text-slate-500">
            Take each photo standing at the peg. Your phone's location is recorded with it and checked against the
            surveyed peg ({PHOTO_GEOFENCE_METERS} m).
          </p>
          {property.location.boundaryPegs.map((peg) => (
            <PegRow
              key={peg.id}
              peg={peg}
              photos={photos.filter((photo) => photo.pegId === peg.id)}
              busy={uploadingPeg === peg.id}
              onAdd={addPhoto}
              onRemove={(photoId) => setPhotos((current) => current.filter((photo) => photo.photoId !== photoId))}
            />
          ))}
          {missingPegs.length > 0 && photos.length > 0 && (
            <p className="text-[11px] text-amber-800">No photo yet for {missingPegs.map((peg) => peg.id).join(', ')}.</p>
          )}
        </div>

        <FormError message={error} />
        <FormActions busy={busy || uploadingPeg !== null} submitLabel="Save visit" onCancel={onClose} />
      </form>
    </Modal>
  );
}
