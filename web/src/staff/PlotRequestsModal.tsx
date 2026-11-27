import { useEffect, useState } from 'react';
import { Inbox, Mail, MessageCircle } from 'lucide-react';
import type { PlotRequest } from '@shared/types';
import { api, errorMessage } from '../api';
import { Modal } from '../components/Modal';
import { formatDateTime } from '../format';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/Card';
import { FormError } from '../ui/forms';

/** People who asked for a plot check on the website, or added a plot from their account. */
export function PlotRequestsModal({ onClose }: { onClose: () => void }) {
  const [requests, setRequests] = useState<PlotRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.staff
      .plotRequests()
      .then(setRequests)
      .catch((err) => setError(errorMessage(err)));
  }, []);

  return (
    <Modal open onClose={onClose} size="xl" icon={<Inbox className="w-4 h-4 text-ink-soft shrink-0" />} title="Plot requests">
      <div className="p-6 space-y-4">
        <FormError message={error} />
        {!requests && !error && <p className="text-muted">Loading…</p>}
        {requests?.length === 0 && (
          <EmptyState icon={<Inbox className="w-5 h-5" />} title="No requests yet">
            Requests from the website's plot check form and from owners' accounts appear here.
          </EmptyState>
        )}
        {requests && requests.length > 0 && (
          <ul className="divide-y divide-line">
            {requests.map((request) => {
              const whatsapp = request.phone?.replace(/\D/g, '');
              return (
                <li key={request.id} className="py-4 first:pt-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-ink">{request.name}</span>
                    <Badge>{request.source === 'account' ? 'Account' : 'Website'}</Badge>
                    {request.status !== 'new' && <Badge>{request.status === 'contacted' ? 'Contacted' : 'Closed'}</Badge>}
                    <span className="text-small text-faint ml-auto">{formatDateTime(request.createdAt)}</span>
                  </div>
                  <div className="text-sm text-ink-soft">
                    {[request.village, request.district, request.state].filter(Boolean).join(', ')}
                    {request.surveyNumber && ` · Sy. No. ${request.surveyNumber}`}
                    {request.country && <span className="text-muted"> · lives in {request.country}</span>}
                  </div>
                  {request.notes && <p className="text-sm text-muted whitespace-pre-line">{request.notes}</p>}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    <a href={`mailto:${request.email}`} className="inline-flex items-center gap-1.5 text-ink underline underline-offset-2">
                      <Mail className="w-3.5 h-3.5" aria-hidden />
                      {request.email}
                    </a>
                    {request.phone && whatsapp && (
                      <a
                        href={`https://wa.me/${whatsapp}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-ink underline underline-offset-2"
                      >
                        <MessageCircle className="w-3.5 h-3.5" aria-hidden />
                        {request.phone}
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
}
