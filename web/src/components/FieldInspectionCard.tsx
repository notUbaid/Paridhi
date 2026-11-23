import { useState } from 'react';
import { Camera, UserCheck } from 'lucide-react';
import { PHOTO_GEOFENCE_METERS, isPhotoWithinGeofence } from '@shared/domain';
import type { InspectionPhoto, PropertyRecord } from '@shared/types';
import { formatDate, formatDateTime, formatRelative } from '../format';
import { InspectionPhotoModal } from './InspectionPhotoModal';

interface FieldInspectionCardProps {
  property: PropertyRecord;
  now: Date;
  onRequestVisit: () => void;
}

function Check({ ok, label, detail }: { ok: boolean; label: string; detail: string }) {
  return (
    <li className="flex items-start gap-2">
      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${ok ? 'bg-emerald-500' : 'bg-red-500'}`} />
      <div>
        <strong className="text-slate-800 font-medium">{label}:</strong> {detail}
      </div>
    </li>
  );
}

export function FieldInspectionCard({ property, now, onRequestVisit }: FieldInspectionCardProps) {
  const [openPhoto, setOpenPhoto] = useState<InspectionPhoto | null>(null);
  const inspection = property.latestInspection;
  const pegs = property.location.boundaryPegs;

  const photosInside = inspection.photos.filter((photo) => isPhotoWithinGeofence(photo, pegs)).length;
  const allPhotosInside = photosInside === inspection.photos.length && inspection.photos.length > 0;
  const passed = inspection.boundaryPegsIntact && !inspection.debrisFound && inspection.neighborInquiryConducted && allPhotosInside;

  const pending =
    inspection.onDemandRequest && new Date(inspection.onDemandRequest.targetVisitBy) > now ? inspection.onDemandRequest : null;

  return (
    <section className="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col">
      <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-slate-700 shrink-0" />
          <h2 className="font-semibold text-slate-900 text-sm tracking-tight">Field inspection</h2>
          <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Monthly visit
          </span>
        </div>
        <button
          type="button"
          onClick={onRequestVisit}
          disabled={pending !== null}
          className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-default text-white text-xs font-medium px-2.5 py-1 rounded transition-colors cursor-pointer"
        >
          {pending ? 'Visit requested' : 'Request a visit'}
        </button>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-3.5">
        <div className="flex items-start justify-between gap-4 pb-3.5 border-b border-slate-100">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Inspector</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-2">
              {inspection.inspectorName}
              <span className="text-[10px] font-mono font-normal px-1.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                {inspection.inspectorId}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Visited {formatDateTime(inspection.inspectedAt)} ({formatRelative(inspection.inspectedAt, now)})
            </div>
          </div>
          <div className="text-right shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded border ${
                passed ? 'text-emerald-800 bg-emerald-50 border-emerald-200' : 'text-red-800 bg-red-50 border-red-200'
              }`}
            >
              {passed ? 'All checks passed' : 'Issues found'}
            </span>
            <div className="text-[10px] text-slate-400 font-mono mt-1">Next visit due {formatDate(inspection.nextVisitDue)}</div>
          </div>
        </div>

        {pending && (
          <div className="rounded border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-700">
            <strong className="font-semibold">Extra visit requested</strong> {formatRelative(pending.requestedAt, now)}, target by{' '}
            {formatDateTime(pending.targetVisitBy)}.{pending.notes && <> Your note: “{pending.notes}”</>}
          </div>
        )}

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
          <Check
            ok={inspection.boundaryPegsIntact}
            label="Boundary pegs"
            detail={inspection.boundaryPegsIntact ? `All ${pegs.length} in place` : 'One or more disturbed'}
          />
          <Check
            ok={!inspection.debrisFound}
            label="Dumping or debris"
            detail={inspection.debrisFound ? 'Found on the plot' : 'None found'}
          />
          <Check
            ok={inspection.neighborInquiryConducted}
            label="Neighbours"
            detail={inspection.neighborInquiryConducted ? inspection.neighborFeedback : 'Not spoken to this visit'}
          />
          <Check
            ok={allPhotosInside}
            label="Photo locations"
            detail={`${photosInside} of ${inspection.photos.length} taken within ${PHOTO_GEOFENCE_METERS} m of their peg`}
          />
        </ul>

        <div className="rounded p-2.5 bg-slate-50 border border-slate-200 text-xs">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wide mb-0.5">Inspector's notes</div>
          <p className="text-slate-600 leading-relaxed text-[11px]">{inspection.notes}</p>
        </div>

        <div>
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wide mb-1.5">Photos</div>
          <div className="grid grid-cols-2 gap-2">
            {inspection.photos.map((photo, index) => {
              const peg = pegs.find((p) => p.id === photo.pegId);
              return (
                <button
                  key={`${photo.pegId}-${index}`}
                  type="button"
                  onClick={() => setOpenPhoto(photo)}
                  className="relative rounded overflow-hidden border border-slate-200 h-24 bg-slate-100 group cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-900"
                  aria-label={`Open photo of peg ${photo.pegId}`}
                >
                  <img src={photo.url} alt="" className="w-full h-full object-cover" />
                  <span className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    View
                  </span>
                  <span className="absolute bottom-1 left-1.5 bg-slate-950/85 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                    Peg {photo.pegId}
                    {peg ? ` (${peg.corner})` : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <InspectionPhotoModal
        photo={openPhoto}
        property={property}
        inspectorName={inspection.inspectorName}
        onClose={() => setOpenPhoto(null)}
      />
    </section>
  );
}
