import { ExternalLink, Landmark, OctagonAlert, RefreshCw } from 'lucide-react';
import type { PropertyRecord } from '@shared/types';
import { formatDate, formatDateTime, formatRelative } from '../format';
import { Badge } from '../ui/Badge';
import { Button, buttonClass } from '../ui/Button';
import { Card, KeyValueList } from '../ui/Card';

interface LandRecordTabProps {
  property: PropertyRecord;
  now: Date;
  checking: boolean;
  /** Only in the demo: run a simulated check. With a database, staff record checks. */
  onCheckNow?: () => void;
}

export function LandRecordTab({ property, now, checking, onCheckNow }: LandRecordTabProps) {
  const { revenue } = property;
  const flagged = revenue.flaggedMutations;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 items-start">
      <div className="space-y-6">
        {flagged.map((mutation) => (
          <section key={mutation.id} className="rounded-card border border-bad-line bg-bad-soft p-5">
            <div className="flex items-start gap-3">
              <OctagonAlert className="w-5 h-5 text-bad shrink-0 mt-0.5" />
              <div className="min-w-0">
                <h2 className="font-display text-heading text-bad">Someone applied to change your land record</h2>
                <p className="text-sm text-ink-soft mt-1">{mutation.description}</p>
                <dl className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-sm">
                  <div>
                    <dt className="inline text-muted">Reference </dt>
                    <dd className="inline font-mono text-ink">{mutation.reference}</dd>
                  </div>
                  <div>
                    <dt className="inline text-muted">Filed </dt>
                    <dd className="inline text-ink">{formatDate(mutation.filedOn)}</dd>
                  </div>
                </dl>
                <div className="mt-4 rounded-lg bg-surface/70 border border-bad-line p-3 text-sm text-ink-soft">
                  <strong className="font-medium text-ink">What happens now.</strong> Your advocate can file a written
                  objection with the Tahsildar before the notice period ends. If you did start this application yourself,
                  tell us at once so the flag can be closed.
                </div>
              </div>
            </div>
          </section>
        ))}

        <Card
          title="Land record"
          description={revenue.portalName}
          icon={<Landmark className="w-5 h-5" />}
          action={
            <a href={revenue.portalUrl} target="_blank" rel="noopener noreferrer" className={buttonClass('secondary', 'sm')}>
              Open portal
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          }
        >
          <KeyValueList
            items={[
              { label: 'Recorded owner', value: revenue.recordedOwner },
              { label: revenue.accountLabel, value: <span className="font-mono">{revenue.accountNumber}</span> },
              { label: 'Survey number', value: revenue.surveyNumber },
              { label: 'Record status', value: revenue.recordStatus || '—' },
              { label: 'Encumbrance', value: revenue.encumbranceStatus || '—' },
              { label: 'Property tax', value: revenue.propertyTaxStatus || '—' },
              {
                label: 'Applications flagged',
                value: flagged.length === 0 ? <Badge tone="ok">None</Badge> : <Badge tone="bad">{flagged.length} open</Badge>
              },
              {
                label: 'Last checked',
                value: revenue.lastCheckedAt ? (
                  <span title={formatDateTime(revenue.lastCheckedAt)}>{formatRelative(revenue.lastCheckedAt, now)}</span>
                ) : (
                  'Not yet'
                )
              }
            ]}
          />
          {onCheckNow && (
            <div className="mt-5 flex justify-end">
              <Button onClick={onCheckNow} disabled={checking} icon={<RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />}>
                {checking ? 'Checking…' : 'Check now (demo)'}
              </Button>
            </div>
          )}
        </Card>
      </div>

      <Card title="How we watch the record">
        <div className="space-y-3 text-sm text-ink-soft">
          <p>
            Paridhi staff look up this plot on the state's land records portal every week and before each caveat
            renewal, checking for any application to change the owner, split the plot or record a sale.
          </p>
          <p>
            State portals don't send alerts, so a filing can appear between checks. Most applications have a notice
            period, which is the window your advocate uses to object.
          </p>
          <p className="text-muted">Encumbrance details come from the Sub-Registrar's office, not the land records portal.</p>
        </div>
      </Card>
    </div>
  );
}
