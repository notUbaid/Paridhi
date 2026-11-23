import { useState, type FormEvent } from 'react';
import { Send, UserCheck } from 'lucide-react';
import type { PropertyRecord } from '@shared/types';
import { errorMessage } from '../api';
import { Modal } from './Modal';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Card';
import { FormError, TextArea } from '../ui/forms';

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
      icon={<UserCheck className="w-4 h-4 text-ink-soft shrink-0" />}
      title="Request an extra inspection"
    >
      <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-3 rounded-xl bg-paper/70 border border-line p-4">
          <Avatar name={property.inspection.inspectorName} />
          <div className="min-w-0">
            <div className="font-medium text-ink">{property.inspection.inspectorName}</div>
            <div className="text-sm text-muted">
              Will visit {property.name} ({property.surveyNumber})
            </div>
          </div>
        </div>

        <div>
          <TextArea
            label="What should the inspector look at? (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={MAX_NOTES}
            rows={4}
            placeholder="e.g. A relative heard someone was asking about the plot. Please check the north-west peg and speak to the neighbours."
          />
          <div className="text-right text-xs text-faint mt-1 tabular-nums">
            {notes.length}/{MAX_NOTES}
          </div>
        </div>

        <p className="text-sm text-muted leading-relaxed">
          The inspector walks the boundary, checks each corner peg, talks to neighbours and uploads photos taken at each
          peg. The target is a visit within 48 hours; weather and access can delay it.
        </p>

        <FormError message={error} />

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-line">
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting} icon={<Send className="w-4 h-4" />}>
            {submitting ? 'Sending…' : 'Send request'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
