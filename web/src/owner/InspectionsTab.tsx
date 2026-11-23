import { useState } from 'react';
import { CalendarClock, Camera, Check, ClipboardCheck, Quote, X } from 'lucide-react';
import { PHOTO_GEOFENCE_METERS, photoDistanceToPeg } from '@shared/domain';
import type { InspectionPhoto, PropertyRecord } from '@shared/types';
import { InspectionPhotoModal } from '../components/InspectionPhotoModal';
import { PhotoImage } from '../components/PhotoImage';
import { formatDate, formatDateTime, formatMeters, formatRelative } from '../format';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Avatar, Card, EmptyState } from '../ui/Card';

interface InspectionsTabProps {
  property: PropertyRecord;
  now: Date;
  onRequestVisit: () => void;
}

function CheckRow({ ok, label, detail }: { ok: boolean; label: string; detail: string }) {
  return (
    <li className="flex gap-3">
      <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${ok ? 'bg-ok-soft text-ok' : 'bg-bad-soft text-bad'}`}>
        {ok ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
      </span>
      <div>
        <div className="text-sm font-medium text-ink">{label}</div>
        <div className="text-sm text-muted">{detail}</div>
      </div>
    </li>
  );
}

export function InspectionsTab({ property, now, onRequestVisit }: InspectionsTabProps) {
  const [openPhoto, setOpenPhoto] = useState<InspectionPhoto | null>(null);
  const { inspection, location } = property;
  const visit = inspection.latestVisit;
  const pegs = location.boundaryPegs;
  const pending = inspection.onDemandRequest && new Date(inspection.onDemandRequest.targetVisitBy) > now ? inspection.onDemandRequest : null;

  const inside = (visit?.photos ?? []).filter((photo) => {
    const distance = photoDistanceToPeg(photo, pegs);
    return distance !== null && distance <= PHOTO_GEOFENCE_METERS;
  }).length;
  const passed = !!visit && visit.boundaryPegsIntact && !visit.debrisFound;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 items-start">
      <Card
        title="Latest visit"
        icon={<ClipboardCheck className="w-5 h-5" />}
        action={visit && <Badge tone={passed ? 'ok' : visit.boundaryPegsIntact ? 'warn' : 'bad'}>{passed ? 'All checks passed' : 'Issues found'}</Badge>}
      >
        {!visit ? (
          <EmptyState icon={<ClipboardCheck className="w-5 h-5" />} title="No visit recorded yet">
            {inspection.inspectorName} will walk the boundary, check each corner peg, look for dumping and talk to
            neighbours. The report and photos will appear here.
          </EmptyState>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Avatar name={visit.inspectorName} />
              <div>
                <div className="font-medium text-ink">
                  {visit.inspectorName}
                  {visit.inspectorId && <span className="text-muted font-normal"> · {visit.inspectorId}</span>}
                </div>
                <div className="text-sm text-muted">
                  Visited {formatDateTime(visit.inspectedAt)} ({formatRelative(visit.inspectedAt, now)})
                </div>
              </div>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CheckRow ok={visit.boundaryPegsIntact} label="Boundary pegs" detail={visit.boundaryPegsIntact ? `All ${pegs.length} in place` : 'One or more disturbed'} />
              <CheckRow ok={!visit.debrisFound} label="Dumping or debris" detail={visit.debrisFound ? 'Found on the plot' : 'None found'} />
              <CheckRow ok={visit.neighborInquiryConducted} label="Neighbours" detail={visit.neighborInquiryConducted ? 'Spoken to' : 'Not spoken to this time'} />
              <CheckRow
                ok={visit.photos.length > 0 && inside === visit.photos.length}
                label="Photo locations"
                detail={`${inside} of ${visit.photos.length} taken within ${PHOTO_GEOFENCE_METERS} m of their peg`}
              />
            </ul>

            {visit.neighborInquiryConducted && visit.neighborFeedback && (
              <blockquote className="flex gap-3 rounded-xl bg-paper border border-line p-4">
                <Quote className="w-4 h-4 text-accent shrink-0 mt-1" />
                <p className="font-display text-lg leading-snug text-ink">{visit.neighborFeedback}</p>
              </blockquote>
            )}

            <div>
              <div className="eyebrow mb-1.5">Inspector's notes</div>
              <p className="text-ink-soft leading-relaxed">{visit.notes}</p>
            </div>

            {visit.photos.length > 0 && (
              <div>
                <div className="eyebrow mb-2">Photos</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {visit.photos.map((photo, index) => {
                    const peg = pegs.find((p) => p.id === photo.pegId);
                    const distance = photoDistanceToPeg(photo, pegs);
                    const ok = distance !== null && distance <= PHOTO_GEOFENCE_METERS;
                    return (
                      <button
                        key={photo.photoId ?? `${photo.pegId}-${index}`}
                        type="button"
                        onClick={() => setOpenPhoto(photo)}
                        className="group text-left rounded-xl overflow-hidden border border-line bg-surface hover:border-line-strong cursor-pointer"
                        aria-label={`Open photo of peg ${photo.pegId}`}
                      >
                        <div className="relative aspect-[4/3] bg-sunken">
                          <PhotoImage propertyId={property.id} photo={photo} alt="" className="w-full h-full object-cover" />
                          <span className="absolute inset-0 bg-ink/0 group-hover:bg-ink/25 transition-colors flex items-center justify-center">
                            <Camera className="w-5 h-5 text-surface opacity-0 group-hover:opacity-100" />
                          </span>
                        </div>
                        <div className="px-3 py-2">
                          <div className="text-sm font-medium text-ink">
                            Peg {photo.pegId} {peg && <span className="text-muted font-normal">{peg.corner}</span>}
                          </div>
                          <div className={`text-xs ${ok ? 'text-ok' : 'text-bad'}`}>
                            {distance === null ? 'Unknown peg' : `${formatMeters(distance)} from the peg`}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      <div className="space-y-6">
        <Card title="Schedule" icon={<CalendarClock className="w-5 h-5" />}>
          <div className="eyebrow">{visit ? 'Next monthly visit' : 'First visit'}</div>
          <div className="font-display text-3xl text-ink mt-1">{formatDate(inspection.nextVisitDue)}</div>
          <div className="text-sm text-muted mt-1">
            {inspection.inspectorName}
            {inspection.inspectorId && ` · ${inspection.inspectorId}`}
          </div>

          {pending ? (
            <div className="mt-5 rounded-xl border border-line bg-paper p-4 text-sm">
              <div className="font-medium text-ink">Extra visit requested</div>
              <p className="text-muted mt-0.5">
                Asked {formatRelative(pending.requestedAt, now)}. Target: by {formatDateTime(pending.targetVisitBy)}.
              </p>
              {pending.notes && <p className="text-ink-soft mt-2">“{pending.notes}”</p>}
            </div>
          ) : (
            <div className="mt-5">
              <Button variant="primary" onClick={onRequestVisit} className="w-full">
                Request an extra visit
              </Button>
              <p className="text-xs text-muted mt-2 text-center">Target: within 48 hours. Weather and access can delay it.</p>
            </div>
          )}
        </Card>

        <Card title="What a visit covers">
          <ul className="space-y-2 text-sm text-ink-soft list-disc pl-5 marker:text-faint">
            <li>Walking the full boundary and checking every corner peg.</li>
            <li>Looking for dumped material, vehicles or new structures.</li>
            <li>Talking to neighbours about anyone asking after the plot.</li>
            <li>A photo of each peg, with the phone's location checked against the survey.</li>
          </ul>
        </Card>
      </div>

      <InspectionPhotoModal
        photo={openPhoto}
        property={property}
        inspectorName={visit?.inspectorName ?? inspection.inspectorName}
        onClose={() => setOpenPhoto(null)}
      />
    </div>
  );
}
