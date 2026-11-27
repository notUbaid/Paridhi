import { Clock, LogOut } from 'lucide-react';
import type { PlotRequest } from '@shared/types';
import { api } from '../api';
import { PlotRequestForm } from '../components/PlotRequestForm';
import { formatDate } from '../format';
import type { Account } from '../session';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Wordmark } from '../ui/Wordmark';

interface MyPlotsStartProps {
  account: Account;
  requests: PlotRequest[];
  onRequested: (request: PlotRequest) => void;
}

/** A new account with no monitored plots yet: add the first one, or see the requests already sent. */
export function MyPlotsStart({ account, requests, onRequested }: MyPlotsStartProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-surface border-b border-line">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <a href="/" aria-label="Paridhi home">
            <Wordmark />
          </a>
          <Button variant="ghost" size="sm" onClick={account.signOut} icon={<LogOut className="w-4 h-4" />}>
            Sign out
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div>
          <div className="eyebrow">My plots</div>
          <h1 className="font-display text-title text-ink mt-1.5">
            {requests.length > 0 ? 'Your plot is being set up' : 'Add your first plot'}
          </h1>
          <p className="text-muted mt-2 max-w-xl">
            {requests.length > 0
              ? "We'll contact you to arrange the survey and the camera. Your plot appears here as soon as monitoring starts."
              : "Tell us where your land is. We'll contact you to arrange a survey, then your plot appears here with its camera, inspections and land record."}
          </p>
        </div>

        {requests.length > 0 && (
          <Card title="Requests" icon={<Clock className="w-5 h-5" />}>
            <ul className="divide-y divide-line">
              {requests.map((request) => (
                <li key={request.id} className="py-3 first:pt-0 last:pb-0 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <span className="text-ink">
                    {[request.village, request.district, request.state].filter(Boolean).join(', ')}
                    {request.surveyNumber && <span className="text-muted"> · Sy. No. {request.surveyNumber}</span>}
                  </span>
                  <span className="text-small text-muted">
                    Sent {formatDate(request.createdAt)} · {request.status === 'new' ? 'Waiting for our call' : request.status === 'contacted' ? 'In touch' : 'Closed'}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card title={requests.length > 0 ? 'Add another plot' : 'Where is your plot?'} bodyClassName="p-5 sm:p-6">
          <PlotRequestForm
            mode="account"
            accountEmail={account.email}
            submitLabel="Send request"
            doneTitle="Request sent"
            doneMessage="We'll be in touch at your account email to arrange the survey."
            onSubmit={async ({ website: _website, ...input }) => onRequested(await api.addMyPlotRequest(input))}
          />
        </Card>

        <p className="text-small text-muted">
          Signed in as {account.email}. Want to see what a monitored plot looks like?{' '}
          <a href="/demo" className="text-ink underline underline-offset-2">
            Open the demo
          </a>
          .
        </p>
      </main>
    </div>
  );
}
