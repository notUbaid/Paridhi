import { useState, type FormEvent } from 'react';
import { Send, UserCheck } from 'lucide-react';
import type { PropertyRecord } from '@shared/types';
import { errorMessage } from '../api';
import { Modal } from './Modal';

const MAX_NOTES = 500;

interface RequestInspectionModalProps {
  property: PropertyRecord;
  open: boolean;
  onClose: () => void;
  onSubmit: (notes: string) => Promise<void>;
}

export function RequestInspectionModal({ property, open, onClose, onSubmit }: RequestInspectionModalProps) {
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(notes.trim());
      setNotes('');
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      size="md"
      icon={<UserCheck className="w-4 h-4 text-slate-700 shrink-0" />}
      title="Request an extra inspection"
    >
      <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
        <div className="bg-slate-50 rounded p-3 border border-slate-200 text-slate-700">
          <div className="font-semibold text-slate-900">
            {property.name} ({property.surveyNumber})
          </div>
          <div className="text-slate-500">
            {property.location.village}, {property.location.mandalTaluk}, {property.location.district}
          </div>
          <div className="mt-1.5 text-slate-600">
            Inspector: <span className="font-medium text-slate-900">{property.inspection.inspectorName}</span>{' '}
            {property.inspection.inspectorId && (
              <span className="font-mono text-slate-400">({property.inspection.inspectorId})</span>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="inspection-notes" className="font-semibold text-slate-800">
            What should the inspector look at? <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <textarea
            id="inspection-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={MAX_NOTES}
            placeholder="e.g. A relative heard someone was asking about the plot. Please check the north-west peg and speak to the neighbours."
            rows={4}
            className="w-full rounded border border-slate-200 p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
          />
          <div className="text-right text-[10px] text-slate-400 font-mono">
            {notes.length}/{MAX_NOTES}
          </div>
        </div>

        <p className="text-slate-500 leading-relaxed">
          The inspector walks the boundary, checks each corner peg, talks to neighbours and uploads geotagged photos.
          The target is a visit within 48 hours; weather and access can delay it.
        </p>

        {error && <div className="rounded border border-red-200 bg-red-50 text-red-800 px-3 py-2">{error}</div>}

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2 rounded font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded font-semibold bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? 'Sending…' : 'Send request'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
