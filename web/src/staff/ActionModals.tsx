import { useState, type FormEvent, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Landmark, Scale } from 'lucide-react';
import { CAVEAT_VALIDITY_DAYS } from '@shared/domain';
import type { MutationEntry, PropertyRecord } from '@shared/types';
import { errorMessage } from '../api';
import { Modal } from '../components/Modal';
import { FormActions, FormError, TextArea, TextField, todayIso } from './forms';

interface ActionModalProps {
  property: PropertyRecord;
  onClose: () => void;
  onSaved: (property: PropertyRecord) => void;
}

/** A small form in a dialog that runs `action` and closes on success. */
function ActionForm({
  title,
  icon,
  submitLabel,
  onClose,
  run,
  children
}: {
  title: string;
  icon: ReactNode;
  submitLabel: string;
  onClose: () => void;
  run: () => Promise<void>;
  children: ReactNode;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await run();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open onClose={onClose} size="md" icon={icon} title={title}>
      <form onSubmit={submit} className="p-5 space-y-3.5 text-xs">
        {children}
        <FormError message={error} />
        <FormActions busy={busy} submitLabel={submitLabel} onCancel={onClose} />
      </form>
    </Modal>
  );
}

export function RecordCheckModal({ property, onClose, onSaved, save }: ActionModalProps & { save: (note: string) => Promise<PropertyRecord> }) {
  const [note, setNote] = useState('');
  return (
    <ActionForm
      title="Record a land record check"
      icon={<Landmark className="w-4 h-4 text-slate-700 shrink-0" />}
      submitLabel="Record check"
      onClose={onClose}
      run={async () => onSaved(await save(note.trim()))}
    >
      <p className="text-slate-600">
        Confirm you checked <strong className="font-medium">{property.revenue.portalName}</strong> for{' '}
        {property.revenue.accountLabel} {property.revenue.accountNumber} and found no new mutation applications. If you
        found one, flag it instead.
      </p>
      <TextField label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
    </ActionForm>
  );
}

export function FlagMutationModal({
  onClose,
  onSaved,
  save
}: ActionModalProps & { save: (flag: { reference: string; filedOn: string; description: string }) => Promise<PropertyRecord> }) {
  const [reference, setReference] = useState('');
  const [filedOn, setFiledOn] = useState(todayIso());
  const [description, setDescription] = useState('');
  return (
    <ActionForm
      title="Flag a mutation application"
      icon={<AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />}
      submitLabel="Flag application"
      onClose={onClose}
      run={async () => onSaved(await save({ reference: reference.trim(), filedOn, description: description.trim() }))}
    >
      <p className="text-slate-600">
        Use this for an application on the land record that the owner did not start. The owner is shown
        &ldquo;Action required&rdquo; until it is resolved.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Application reference" required value={reference} onChange={(e) => setReference(e.target.value)} maxLength={80} />
        <TextField label="Filed on" type="date" required value={filedOn} max={todayIso()} onChange={(e) => setFiledOn(e.target.value)} />
      </div>
      <TextArea
        label="What the application claims"
        required
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={500}
        placeholder="e.g. Khata transfer citing a sale deed dated 2026-10-02 that the owner did not sign."
      />
    </ActionForm>
  );
}

export function ResolveFlagModal({
  mutation,
  onClose,
  onSaved,
  save
}: ActionModalProps & { mutation: MutationEntry; save: (outcome: string) => Promise<PropertyRecord> }) {
  const [outcome, setOutcome] = useState('');
  return (
    <ActionForm
      title={`Resolve ${mutation.reference}`}
      icon={<CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
      submitLabel="Mark resolved"
      onClose={onClose}
      run={async () => onSaved(await save(outcome.trim()))}
    >
      <p className="text-slate-600">{mutation.description}</p>
      <TextArea
        label="Outcome"
        required
        value={outcome}
        onChange={(e) => setOutcome(e.target.value)}
        maxLength={500}
        placeholder="e.g. Objection filed with the Tahsildar on 2026-11-24; application rejected. Or: owner confirmed they started it."
      />
    </ActionForm>
  );
}

export function ConfirmCaveatModal({
  property,
  onClose,
  onSaved,
  save
}: ActionModalProps & { save: (court: string, lodgedOn: string) => Promise<PropertyRecord> }) {
  const [court, setCourt] = useState(property.legal.caveat?.court ?? '');
  const [lodgedOn, setLodgedOn] = useState(todayIso());
  return (
    <ActionForm
      title="Confirm a caveat was lodged"
      icon={<Scale className="w-4 h-4 text-slate-700 shrink-0" />}
      submitLabel="Confirm lodging"
      onClose={onClose}
      run={async () => onSaved(await save(court.trim(), lodgedOn))}
    >
      <p className="text-slate-600">
        Record the caveat under Section 148A CPC after it has been lodged. It stays in force for {CAVEAT_VALIDITY_DAYS}{' '}
        days from this date, and any pending renewal request is marked done.
      </p>
      <TextField label="Court" required value={court} onChange={(e) => setCourt(e.target.value)} maxLength={200} placeholder="e.g. Junior Civil Judge, Rajendranagar" />
      <TextField label="Lodged on" type="date" required value={lodgedOn} max={todayIso()} onChange={(e) => setLodgedOn(e.target.value)} />
    </ActionForm>
  );
}
