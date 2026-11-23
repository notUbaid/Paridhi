import { FileCheck, FileText, Scale } from 'lucide-react';
import { CAVEAT_VALIDITY_DAYS, getCaveatStatus } from '@shared/domain';
import type { PropertyRecord } from '@shared/types';
import { formatDate, formatRelative } from '../format';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Avatar, Card, EmptyState } from '../ui/Card';

interface LegalTabProps {
  property: PropertyRecord;
  now: Date;
  requesting: boolean;
  onRequestRenewal: () => void;
  onOpenDraft: () => void;
  onOpenDossier: () => void;
}

export function LegalTab({ property, now, requesting, onRequestRenewal, onOpenDraft, onOpenDossier }: LegalTabProps) {
  const { legal } = property;
  const caveat = getCaveatStatus(legal, now);
  const elapsed = caveat.daysRemaining === null ? 0 : Math.min(CAVEAT_VALIDITY_DAYS, CAVEAT_VALIDITY_DAYS - caveat.daysRemaining);
  const progress = Math.max(0, Math.min(100, (elapsed / CAVEAT_VALIDITY_DAYS) * 100));
  const tone = caveat.state === 'ACTIVE' ? 'ok' : caveat.state === 'NONE' ? 'neutral' : 'warn';
  const barColor = caveat.state === 'ACTIVE' ? 'bg-ok' : 'bg-warn';

  const actionLabel = caveat.renewalRequested ? 'Renewal requested' : legal.caveat ? 'Ask advocate to renew' : 'Ask advocate to file a caveat';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 items-start">
      <div className="space-y-6">
        <Card
          title="Court caveat"
          description="Section 148A, Code of Civil Procedure"
          icon={<Scale className="w-5 h-5" />}
          action={
            <Badge tone={tone}>
              {caveat.state === 'NONE' ? 'None on file' : caveat.state === 'EXPIRED' ? 'Lapsed' : caveat.state === 'EXPIRING' ? 'Lapsing soon' : 'Active'}
            </Badge>
          }
        >
          {legal.caveat && caveat.expiresOn ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="font-display text-4xl text-ink leading-none">
                    {caveat.state === 'EXPIRED' ? 'Lapsed' : `${caveat.daysRemaining} days`}
                  </div>
                  <div className="text-sm text-muted mt-1.5">{caveat.state === 'EXPIRED' ? `on ${formatDate(caveat.expiresOn)}` : 'of cover left'}</div>
                </div>
                <div className="text-sm text-right">
                  <div className="text-ink">{legal.caveat.court}</div>
                  <div className="text-muted">Lodged {formatDate(legal.caveat.lodgedOn)}</div>
                </div>
              </div>

              <div>
                <div className="h-2 rounded-full bg-sunken overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={CAVEAT_VALIDITY_DAYS} aria-valuenow={elapsed} aria-label="Days of the caveat used">
                  <div className={`h-full rounded-full ${barColor}`} style={{ width: `${progress}%` }} />
                </div>
                <div className="flex justify-between text-xs text-muted mt-1.5">
                  <span>Lodged {formatDate(legal.caveat.lodgedOn)}</span>
                  <span>Lapses {formatDate(caveat.expiresOn)}</span>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState icon={<Scale className="w-5 h-5" />} title="No caveat on file">
              Your advocate can lodge one in the civil court with jurisdiction over the plot.
            </EmptyState>
          )}

          <div className="mt-6 pt-5 border-t border-line flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <p className="text-sm text-muted">
              {caveat.renewalRequested && legal.renewalRequestedAt
                ? `You asked ${formatRelative(legal.renewalRequestedAt, now)}. Your advocate will confirm the new lodging date.`
                : `A caveat lasts ${CAVEAT_VALIDITY_DAYS} days. We remind you 15 days before it lapses.`}
            </p>
            <Button variant="primary" onClick={onRequestRenewal} disabled={requesting || caveat.renewalRequested}>
              {requesting ? 'Sending…' : actionLabel}
            </Button>
          </div>
        </Card>

        <Card title="What a caveat does">
          <div className="space-y-3 text-sm text-ink-soft">
            <p>
              A caveat asks the civil court to notify your advocate before it passes an order on an application about this
              plot, such as an injunction. It does not stop orders being made; it makes sure you are heard first.
            </p>
            <p>
              It is a civil-court step. If someone applies to change the land record at the Tahsildar's office, your
              advocate files an objection there separately under the state's land records law.
            </p>
            <p className="text-muted">Paridhi is not a law firm. Your advocate advises on what to file.</p>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Your advocate">
          {legal.advocateName === 'Not assigned' ? (
            <p className="text-sm text-muted">An advocate will be assigned when your plot is set up.</p>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar name={legal.advocateName} />
              <div className="min-w-0">
                <div className="font-medium text-ink">{legal.advocateName}</div>
                {legal.enrolmentNumber && <div className="text-sm text-muted font-mono">{legal.enrolmentNumber}</div>}
              </div>
            </div>
          )}
          {legal.courts && <p className="text-sm text-muted mt-4">Practises in {legal.courts}.</p>}
        </Card>

        <Card title="Documents">
          <div className="space-y-2">
            <Button onClick={onOpenDraft} icon={<FileText className="w-4 h-4" />} className="w-full justify-start">
              Caveat draft
            </Button>
            <Button onClick={onOpenDossier} icon={<FileCheck className="w-4 h-4" />} className="w-full justify-start">
              Property dossier
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
