import { useEffect, useState, type ReactNode } from 'react';
import { AlertTriangle, FileCheck, Lock, Printer } from 'lucide-react';
import { getCaveatStatus, isPhotoWithinGeofence, type PropertyAlert, type PropertyStatus } from '@shared/domain';
import type { Dossier, PropertyRecord } from '@shared/types';
import { api, errorMessage } from '../api';
import { buttonClass } from '../ui/Button';
import { formatCrore, formatDate, formatDateTime } from '../format';
import { Modal } from './Modal';
import { StatusBadge } from '../ui/Badge';

interface SignedDossierContent {
  generatedAt: string;
  status: PropertyStatus;
  alerts: PropertyAlert[];
  property: PropertyRecord;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-1.5">
      <h3 className="font-display text-lg text-ink">{title}</h3>
      <div className="bg-paper/70 p-4 rounded-xl border border-line">{children}</div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div className="eyebrow">{label}</div>
      <div className="font-medium text-ink mt-0.5">{value}</div>
    </div>
  );
}

interface DossierModalProps {
  property: PropertyRecord;
  now: Date;
  open: boolean;
  onClose: () => void;
}

/** Shows exactly what the server signed: every section is read from the signed payload. */
export function DossierModal({ property, now, open, onClose }: DossierModalProps) {
  const [state, setState] = useState<
    { kind: 'loading' } | { kind: 'error'; message: string } | { kind: 'ready'; dossier: Dossier; content: SignedDossierContent }
  >({ kind: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const propertyId = property.id;
  // Re-fetch when the property changes on the server (e.g. after an action), not on every render.
  const version = property.activity[0]?.id;

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setState({ kind: 'loading' });
    api
      .getDossier(propertyId)
      .then((dossier) => {
        if (!cancelled) setState({ kind: 'ready', dossier, content: JSON.parse(dossier.payload) as SignedDossierContent });
      })
      .catch((error) => {
        if (!cancelled) setState({ kind: 'error', message: errorMessage(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [open, propertyId, version, attempt]);

  const ready = state.kind === 'ready' ? state : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      icon={<FileCheck className="w-4 h-4 text-ink-soft shrink-0" />}
      title={`Property dossier: ${property.name}`}
      footer={
        <>
          <span className="text-sm text-muted font-mono truncate">{ready ? ready.dossier.id : ''}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              disabled={!ready}
              className={buttonClass('secondary', 'sm')}
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              type="button"
              onClick={onClose}
              className={buttonClass('primary', 'sm')}
            >
              Close
            </button>
          </div>
        </>
      }
    >
      <div className="p-6 space-y-5 text-ink text-sm">
        {state.kind === 'loading' && <p className="text-muted">Generating a signed dossier…</p>}
        {state.kind === 'error' && (
          <div className="rounded-lg border border-bad-line bg-bad-soft text-bad px-3 py-2 flex items-center justify-between gap-3">
            <span>Couldn't generate the dossier: {state.message}</span>
            <button type="button" onClick={() => setAttempt((n) => n + 1)} className="underline cursor-pointer">
              Try again
            </button>
          </div>
        )}
        {ready && <DossierBody dossier={ready.dossier} content={ready.content} now={now} />}
      </div>
    </Modal>
  );
}

function DossierBody({ dossier, content, now }: { dossier: Dossier; content: SignedDossierContent; now: Date }) {
  const p = content.property;
  const caveat = getCaveatStatus(p.legal, new Date(content.generatedAt));
  const visit = p.inspection.latestVisit;
  const photosInside = (visit?.photos ?? []).filter((photo) => isPhotoWithinGeofence(photo, p.location.boundaryPegs)).length;

  return (
    <>
      <div className="border-b border-line pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="eyebrow">
            Generated {formatDateTime(content.generatedAt)}
          </div>
          <div className="font-display text-3xl text-ink mt-1">{p.name}</div>
          <div className="text-muted">
            {p.surveyNumber} · {p.plotSizeDisplay} · {p.location.village}, {p.location.district}, {p.location.state}
          </div>
        </div>
        <div className="sm:text-right space-y-1">
          <StatusBadge status={content.status} />
          <div className="text-[13px] text-faint">Estimated value {formatCrore(p.marketValuationINR)}</div>
        </div>
      </div>

      {content.alerts.length > 0 && (
        <ul className="space-y-1">
          {content.alerts.map((alert) => (
            <li key={alert.message} className="flex items-start gap-2 text-warn">
              <AlertTriangle className="w-3.5 h-3.5 text-warn shrink-0 mt-0.5" />
              {alert.message}
            </li>
          ))}
        </ul>
      )}

      <Section title="1. Owner and land record">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field label="Owner" value={<>{p.owner.name}<div className="text-xs text-muted font-normal">{p.owner.overseasCity}</div></>} />
          <Field label="Recorded owner" value={p.revenue.recordedOwner} />
          <Field label={p.revenue.accountLabel} value={<span className="font-mono">{p.revenue.accountNumber}</span>} />
          <Field
            label="Flagged applications"
            value={
              p.revenue.flaggedMutations.length === 0
                ? 'None'
                : p.revenue.flaggedMutations.map((m) => m.reference).join(', ')
            }
          />
          <Field label="Source" value={p.revenue.portalName} />
          <Field label="Last checked" value={p.revenue.lastCheckedAt ? formatDateTime(p.revenue.lastCheckedAt) : 'Not yet'} />
          <Field label="Encumbrance" value={p.revenue.encumbranceStatus} />
          <Field label="Property tax" value={p.revenue.propertyTaxStatus} />
        </div>
      </Section>

      <Section title="2. Camera">
        {p.camera ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Field label="Device" value={p.camera.deviceModel} />
            <Field label="Status" value={p.camera.online ? 'Online' : 'Offline'} />
            <Field label="Latest snapshot" value={formatDateTime(p.camera.latestSnapshot.capturedAt)} />
            <Field label="Weekly comparison" value={p.camera.changeDetected ? 'Change flagged' : 'No change'} />
          </div>
        ) : (
          <div className="text-muted">No camera installed. The plot is monitored by field inspections.</div>
        )}
      </Section>

      <Section title="3. Last field inspection">
        {visit ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Field label="Inspector" value={`${visit.inspectorName}${visit.inspectorId ? ` (${visit.inspectorId})` : ''}`} />
            <Field label="Visited" value={formatDateTime(visit.inspectedAt)} />
            <Field
              label="Findings"
              value={[visit.boundaryPegsIntact ? 'Pegs in place' : 'Pegs disturbed', visit.debrisFound ? 'debris found' : 'no debris'].join(', ')}
            />
            <Field label="Photos within 50 m of peg" value={`${photosInside} of ${visit.photos.length}`} />
          </div>
        ) : (
          <div className="text-muted">No visit recorded yet. First visit due {formatDate(p.inspection.nextVisitDue)}.</div>
        )}
      </Section>

      <Section title="4. Advocate and caveat">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field label="Advocate" value={`${p.legal.advocateName} (${p.legal.enrolmentNumber})`} />
          <Field label="Court" value={p.legal.caveat?.court ?? 'No caveat on file'} />
          <Field label="Lodged" value={p.legal.caveat ? formatDate(p.legal.caveat.lodgedOn) : '–'} />
          <Field
            label="Lapses"
            value={caveat.expiresOn ? `${formatDate(caveat.expiresOn)}${caveat.state === 'EXPIRED' ? ' (lapsed)' : ''}` : '–'}
          />
        </div>
      </Section>

      <section className="p-4 rounded-xl border border-line-strong bg-sunken/50 space-y-2.5 text-[13px]">
        <div className="flex items-center gap-2 font-display text-lg text-ink">
          <Lock className="w-4 h-4 text-accent" />
          Integrity record
        </div>
        <dl className="font-mono space-y-1 break-all">
          <div>
            <dt className="inline text-muted">SHA-256 </dt>
            <dd className="inline text-ink">{dossier.sha256}</dd>
          </div>
          <div>
            <dt className="inline text-muted">Ed25519 signature </dt>
            <dd className="inline text-ink">{dossier.signature}</dd>
          </div>
          <div>
            <dt className="inline text-muted">Key </dt>
            <dd className="inline text-ink">{dossier.keyId}</dd>
          </div>
          <div>
            <dt className="inline text-muted">Evidence records </dt>
            <dd className="inline text-ink">
              {dossier.evidenceCount} (Merkle root {dossier.evidenceMerkleRoot.slice(0, 16)}…)
            </dd>
          </div>
        </dl>
        {dossier.signingKeyEphemeral && (
          <p className="text-warn">
            This server is using a temporary signing key, so this signature cannot be checked after a restart. Set
            PARIDHI_SIGNING_KEY in production.
          </p>
        )}
        <p className="text-muted font-sans leading-relaxed">
          The signature shows this dossier has not changed since it was generated; check it with the public key at
          /api/evidence/public-key. It is not a certificate under Section 63 of the Bharatiya Sakshya Adhiniyam, 2023:
          that must be signed by the person responsible for the records, and admissibility is for the court to decide.
          Printed {formatDateTime(now.toISOString())}.
        </p>
      </section>
    </>
  );
}
