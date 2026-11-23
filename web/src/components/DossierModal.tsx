import { useEffect, useState, type ReactNode } from 'react';
import { AlertTriangle, FileCheck, Lock, Printer } from 'lucide-react';
import { getCaveatStatus, isPhotoWithinGeofence, type PropertyAlert, type PropertyStatus } from '@shared/domain';
import type { Dossier, PropertyRecord } from '@shared/types';
import { api, errorMessage } from '../api';
import { formatCrore, formatDate, formatDateTime } from '../format';
import { Modal } from './Modal';
import { StatusPill } from './StatusPill';

interface SignedDossierContent {
  generatedAt: string;
  status: PropertyStatus;
  alerts: PropertyAlert[];
  property: PropertyRecord;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-1.5">
      <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">{title}</h3>
      <div className="bg-slate-50 p-3 rounded border border-slate-200">{children}</div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div className="text-[10px] text-slate-400 uppercase font-semibold">{label}</div>
      <div className="font-medium text-slate-900 mt-0.5">{value}</div>
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
      icon={<FileCheck className="w-4 h-4 text-slate-700 shrink-0" />}
      title={`Property dossier: ${property.name}`}
      footer={
        <>
          <span className="text-xs text-slate-500 font-mono truncate">{ready ? ready.dossier.id : ''}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              disabled={!ready}
              className="px-3 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium cursor-pointer"
            >
              Close
            </button>
          </div>
        </>
      }
    >
      <div className="p-6 space-y-5 text-slate-800 text-xs">
        {state.kind === 'loading' && <p className="text-slate-500">Generating a signed dossier…</p>}
        {state.kind === 'error' && (
          <div className="rounded border border-red-200 bg-red-50 text-red-800 px-3 py-2 flex items-center justify-between gap-3">
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
  const inspection = p.latestInspection;
  const photosInside = inspection.photos.filter((photo) => isPhotoWithinGeofence(photo, p.location.boundaryPegs)).length;

  return (
    <>
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-mono uppercase text-slate-400">
            Generated {formatDateTime(content.generatedAt)}
          </div>
          <div className="text-lg font-bold text-slate-900 mt-0.5">{p.name}</div>
          <div className="text-slate-500">
            {p.surveyNumber} · {p.plotSizeDisplay} · {p.location.village}, {p.location.district}, {p.location.state}
          </div>
        </div>
        <div className="sm:text-right space-y-1">
          <StatusPill status={content.status} />
          <div className="text-[11px] text-slate-400">Estimated value {formatCrore(p.marketValuationINR)}</div>
        </div>
      </div>

      {content.alerts.length > 0 && (
        <ul className="space-y-1">
          {content.alerts.map((alert) => (
            <li key={alert.message} className="flex items-start gap-2 text-amber-900">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              {alert.message}
            </li>
          ))}
        </ul>
      )}

      <Section title="1. Owner and land record">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field label="Owner" value={<>{p.owner.name}<div className="text-[10px] text-slate-500 font-normal">{p.owner.overseasCity}</div></>} />
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
          <Field label="Last checked" value={formatDateTime(p.revenue.lastCheckedAt)} />
          <Field label="Encumbrance" value={p.revenue.encumbranceStatus} />
          <Field label="Property tax" value={p.revenue.propertyTaxStatus} />
        </div>
      </Section>

      <Section title="2. Camera">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field label="Device" value={p.camera.deviceModel} />
          <Field label="Status" value={p.camera.online ? 'Online' : 'Offline'} />
          <Field label="Latest snapshot" value={formatDateTime(p.camera.latestSnapshot.capturedAt)} />
          <Field label="Weekly comparison" value={p.camera.changeDetected ? 'Change flagged' : 'No change'} />
        </div>
      </Section>

      <Section title="3. Last field inspection">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field label="Inspector" value={`${inspection.inspectorName} (${inspection.inspectorId})`} />
          <Field label="Visited" value={formatDateTime(inspection.inspectedAt)} />
          <Field
            label="Findings"
            value={[
              inspection.boundaryPegsIntact ? 'Pegs in place' : 'Pegs disturbed',
              inspection.debrisFound ? 'debris found' : 'no debris'
            ].join(', ')}
          />
          <Field label="Photos within 50 m of peg" value={`${photosInside} of ${inspection.photos.length}`} />
        </div>
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

      <section className="p-3.5 rounded bg-slate-900 text-slate-200 space-y-2 text-[11px]">
        <div className="flex items-center gap-1.5 text-white font-semibold text-xs">
          <Lock className="w-3.5 h-3.5 text-slate-300" />
          Integrity record
        </div>
        <dl className="font-mono space-y-1 break-all">
          <div>
            <dt className="inline text-slate-400">SHA-256 </dt>
            <dd className="inline text-slate-100">{dossier.sha256}</dd>
          </div>
          <div>
            <dt className="inline text-slate-400">Ed25519 signature </dt>
            <dd className="inline text-slate-100">{dossier.signature}</dd>
          </div>
          <div>
            <dt className="inline text-slate-400">Key </dt>
            <dd className="inline text-slate-100">{dossier.keyId}</dd>
          </div>
          <div>
            <dt className="inline text-slate-400">Evidence records </dt>
            <dd className="inline text-slate-100">
              {dossier.evidenceCount} (Merkle root {dossier.evidenceMerkleRoot.slice(0, 16)}…)
            </dd>
          </div>
        </dl>
        {dossier.signingKeyEphemeral && (
          <p className="text-amber-300">
            This server is using a temporary signing key, so this signature cannot be checked after a restart. Set
            PARIDHI_SIGNING_KEY in production.
          </p>
        )}
        <p className="text-slate-400 font-sans leading-relaxed">
          The signature shows this dossier has not changed since it was generated; check it with the public key at
          /api/evidence/public-key. It is not a certificate under Section 63 of the Bharatiya Sakshya Adhiniyam, 2023:
          that must be signed by the person responsible for the records, and admissibility is for the court to decide.
          Printed {formatDateTime(now.toISOString())}.
        </p>
      </section>
    </>
  );
}
