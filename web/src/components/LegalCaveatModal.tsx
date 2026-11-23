import { Printer, Scale } from 'lucide-react';
import { CAVEAT_VALIDITY_DAYS, getCaveatStatus } from '@shared/domain';
import type { PropertyRecord } from '@shared/types';
import { formatDate } from '../format';
import { Modal } from './Modal';
import { buttonClass } from '../ui/Button';

interface LegalCaveatModalProps {
  property: PropertyRecord;
  now: Date;
  open: boolean;
  onClose: () => void;
}

export function LegalCaveatModal({ property, now, open, onClose }: LegalCaveatModalProps) {
  const { owner, legal, location, revenue } = property;
  const caveat = getCaveatStatus(legal, now);
  const court = legal.caveat?.court ?? '[civil court with jurisdiction over the property]';

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      icon={<Scale className="w-4 h-4 text-ink-soft shrink-0" />}
      title="Caveat under Section 148A CPC: draft"
      footer={
        <>
          <span className="text-sm text-muted">
            {legal.caveat && caveat.expiresOn
              ? `Current caveat lodged ${formatDate(legal.caveat.lodgedOn)}; ${
                  caveat.state === 'EXPIRED' ? 'lapsed' : 'lapses'
                } ${formatDate(caveat.expiresOn)} (${CAVEAT_VALIDITY_DAYS} days).`
              : 'No caveat on file.'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className={buttonClass('secondary', 'sm')}
            >
              <Printer className="w-3.5 h-3.5" />
              Print draft
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
      <div className="p-6 space-y-4 text-ink text-sm leading-relaxed">
        <div className="rounded-lg border border-warn-line bg-warn-soft px-3 py-2 text-warn text-[13px]">
          Draft for your advocate to review and adapt. It has not been filed. The advocate decides the court, the
          parties to be served and the final wording.
        </div>

        <div className="text-center border-b border-line pb-4 font-display">
          <div className="font-bold uppercase tracking-wide text-ink text-sm">In the court of the {court}</div>
          <div className="text-muted mt-0.5">
            {location.district} district, {location.state}
          </div>
          <div className="text-muted text-[13px] mt-1">Caveat under Section 148A of the Code of Civil Procedure, 1908</div>
        </div>

        <div className="space-y-3 font-display">
          <p>
            <span className="font-sans font-bold">Caveator:</span> {owner.name}, residing at {owner.overseasCity},{' '}
            {owner.overseasCountry}, through counsel {legal.advocateName} (enrolment no. {legal.enrolmentNumber}).
          </p>
          <p>
            <span className="font-sans font-bold">Persons expected to apply:</span> [to be named by the advocate. Section
            148A(2) requires notice of this caveat to be served on them by registered post.]
          </p>

          <ol className="list-decimal pl-5 space-y-2">
            <li>
              The caveator is shown as owner of the property described in the schedule below in the {revenue.portalName}{' '}
              record ({revenue.accountLabel} {revenue.accountNumber}, recorded owner: {revenue.recordedOwner}).
            </li>
            <li>
              The caveator apprehends that a suit or application concerning the schedule property may be instituted,
              including an application for an interim injunction or other interim order.
            </li>
            <li>
              The caveator claims the right to appear before this court on the hearing of any such application and
              requests that no order be passed on it without notice to the caveator through the counsel named above.
            </li>
            <li>
              The caveator undertakes to serve notice of this caveat on the persons expected to apply, as required by
              Section 148A(2).
            </li>
          </ol>

          <div className="bg-paper p-3 rounded-lg border border-line font-sans text-[13px] space-y-1">
            <div className="font-semibold text-ink">Schedule of property</div>
            <div>Survey number: {property.surveyNumber}</div>
            <div>Extent: {property.plotSizeDisplay}</div>
            <div>
              Location: {location.village} village, {location.mandalTaluk}, {location.district} district, {location.state}
            </div>
            <div>
              {revenue.accountLabel}: {revenue.accountNumber}
            </div>
            <div>
              Boundaries: North: {location.boundaries.north}; East: {location.boundaries.east}; South:{' '}
              {location.boundaries.south}; West: {location.boundaries.west}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
