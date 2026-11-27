import { MapPinPlus } from 'lucide-react';
import type { PlotRequest } from '@shared/types';
import { api } from '../api';
import { Modal } from '../components/Modal';
import { PlotRequestForm } from '../components/PlotRequestForm';
import type { Account } from '../session';

interface AddPlotModalProps {
  open: boolean;
  account: Account;
  onClose: () => void;
  onRequested: (request: PlotRequest) => void;
}

/** A signed-in owner asks for another plot to be protected. */
export function AddPlotModal({ open, account, onClose, onRequested }: AddPlotModalProps) {
  return (
    <Modal open={open} onClose={onClose} size="lg" icon={<MapPinPlus className="w-4 h-4 text-ink-soft shrink-0" />} title="Add a plot">
      <div className="p-6">
        <p className="text-muted mb-5">
          Tell us where it is. We'll contact you to arrange a survey, and the plot appears here once monitoring starts.
        </p>
        <PlotRequestForm
          mode="account"
          accountEmail={account.email}
          submitLabel="Send request"
          onCancel={onClose}
          doneTitle="Request sent"
          doneMessage="We'll be in touch at your account email to arrange the survey."
          onSubmit={async ({ website: _website, ...input }) => onRequested(await api.addMyPlotRequest(input))}
        />
      </div>
    </Modal>
  );
}
