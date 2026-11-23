import {
  REGISTRY_CHECK_STALE_DAYS,
  getCaveatStatus,
  getPropertyAlerts,
  getPropertyStatus,
  type PropertyStatus
} from '@shared/domain';
import type { PropertyRecord } from '@shared/types';
import { formatDate, formatRelative } from '../format';
import type { Tone } from '../ui/tone';

export type OwnerTab = 'overview' | 'site' | 'inspections' | 'land' | 'legal' | 'activity';

export type SummaryAction =
  | { kind: 'tab'; tab: OwnerTab; label: string }
  | { kind: 'request-visit'; label: string }
  | { kind: 'renew-caveat'; label: string };

export interface SummaryItem {
  area: 'inspection' | 'land' | 'legal' | 'camera';
  tone: Tone;
  title: string;
  detail: string;
  action?: SummaryAction;
}

export interface PlotSummary {
  status: PropertyStatus;
  headline: string;
  intro: string;
  items: SummaryItem[];
}

const DAY_MS = 86_400_000;
const TONE_ORDER: Record<Tone, number> = { bad: 0, warn: 1, neutral: 2, ok: 3 };

/** A plain-language answer to "is my land okay, and is there anything I should do?" */
export function summarise(property: PropertyRecord, now: Date): PlotSummary {
  const status = getPropertyStatus(getPropertyAlerts(property, now));
  const items: SummaryItem[] = [];
  const { inspection, revenue, legal, camera } = property;
  const visit = inspection.latestVisit;

  // Field inspection
  const overdueDays = Math.floor((now.getTime() - new Date(inspection.nextVisitDue).getTime()) / DAY_MS);
  if (visit && !visit.boundaryPegsIntact) {
    items.push({
      area: 'inspection',
      tone: 'bad',
      title: 'Boundary pegs were disturbed',
      detail: `${visit.inspectorName} found this ${formatRelative(visit.inspectedAt, now)}. Ask for a visit so they can check again and photograph the boundary.`,
      action: { kind: 'request-visit', label: 'Request a visit' }
    });
  } else if (visit?.debrisFound) {
    items.push({
      area: 'inspection',
      tone: 'warn',
      title: 'Material was dumped on the plot',
      detail: `${visit.inspectorName} found debris ${formatRelative(visit.inspectedAt, now)}. See the photos in the inspection report.`,
      action: { kind: 'tab', tab: 'inspections', label: 'See the report' }
    });
  } else if (overdueDays >= 3) {
    items.push({
      area: 'inspection',
      tone: 'warn',
      title: visit ? 'Monthly visit is overdue' : 'First visit is overdue',
      detail: `It was due on ${formatDate(inspection.nextVisitDue)}. You can ask for a visit now.`,
      action: { kind: 'request-visit', label: 'Request a visit' }
    });
  } else if (visit) {
    items.push({
      area: 'inspection',
      tone: 'ok',
      title: `Boundary walked ${formatRelative(visit.inspectedAt, now)}`,
      detail: `${visit.inspectorName} found all ${property.location.boundaryPegs.length} pegs in place and no dumping.`,
      action: { kind: 'tab', tab: 'inspections', label: 'See the report' }
    });
  } else {
    items.push({
      area: 'inspection',
      tone: 'neutral',
      title: 'First visit coming up',
      detail: `${inspection.inspectorName} is due to visit by ${formatDate(inspection.nextVisitDue)}.`
    });
  }

  // Land record
  const flagged = revenue.flaggedMutations.length;
  const checkAge = revenue.lastCheckedAt ? Math.floor((now.getTime() - new Date(revenue.lastCheckedAt).getTime()) / DAY_MS) : null;
  if (flagged > 0) {
    items.push({
      area: 'land',
      tone: 'bad',
      title: flagged === 1 ? 'Someone applied to change your land record' : `${flagged} applications to change your land record`,
      detail: 'You did not start this. Your advocate can object at the revenue office. Tell us at once if you did start it.',
      action: { kind: 'tab', tab: 'land', label: 'See the details' }
    });
  } else if (checkAge === null) {
    items.push({ area: 'land', tone: 'warn', title: 'Land record not checked yet', detail: `The first check on ${revenue.portalName} is pending.` });
  } else if (checkAge >= REGISTRY_CHECK_STALE_DAYS) {
    items.push({
      area: 'land',
      tone: 'warn',
      title: `Land record last checked ${checkAge} days ago`,
      detail: 'Checks are meant to happen every week.',
      action: { kind: 'tab', tab: 'land', label: 'See the record' }
    });
  } else {
    items.push({
      area: 'land',
      tone: 'ok',
      title: `Land record checked ${formatRelative(revenue.lastCheckedAt!, now)}`,
      detail: `${revenue.portalName} still shows ${revenue.recordedOwner}, with no new applications.`,
      action: { kind: 'tab', tab: 'land', label: 'See the record' }
    });
  }

  // Court caveat
  const caveat = getCaveatStatus(legal, now);
  if (caveat.state === 'NONE') {
    items.push({
      area: 'legal',
      tone: 'neutral',
      title: 'No court caveat yet',
      detail: caveat.renewalRequested
        ? `You asked ${legal.advocateName} to file one.`
        : 'A caveat means the civil court must tell your advocate before passing orders about this plot.',
      action: caveat.renewalRequested ? undefined : { kind: 'renew-caveat', label: 'Ask advocate to file' }
    });
  } else if (caveat.state === 'EXPIRED' || caveat.state === 'EXPIRING') {
    items.push({
      area: 'legal',
      tone: 'warn',
      title: caveat.state === 'EXPIRED' ? 'Court caveat has lapsed' : `Court caveat lapses in ${caveat.daysRemaining} days`,
      detail: caveat.renewalRequested
        ? `You asked ${legal.advocateName} to renew it. They will confirm the new date.`
        : 'Caveats last 90 days. Ask your advocate to lodge a fresh one.',
      action: caveat.renewalRequested ? { kind: 'tab', tab: 'legal', label: 'See legal cover' } : { kind: 'renew-caveat', label: 'Ask to renew' }
    });
  } else {
    items.push({
      area: 'legal',
      tone: 'ok',
      title: `Court caveat active, ${caveat.daysRemaining} days left`,
      detail: `Lodged in ${legal.caveat!.court}.`,
      action: { kind: 'tab', tab: 'legal', label: 'See legal cover' }
    });
  }

  // Camera
  if (camera) {
    if (camera.changeDetected) {
      items.push({ area: 'camera', tone: 'warn', title: 'The camera spotted a change', detail: camera.changeNotes, action: { kind: 'tab', tab: 'site', label: 'See the camera' } });
    } else if (!camera.online) {
      items.push({ area: 'camera', tone: 'warn', title: 'Camera is offline', detail: `Last heard from ${formatRelative(camera.lastHeartbeatAt, now)}.`, action: { kind: 'tab', tab: 'site', label: 'See the camera' } });
    } else if (!camera.tamperSwitchNormal) {
      items.push({ area: 'camera', tone: 'warn', title: 'Camera enclosure was opened', detail: 'The tamper switch tripped. An inspector should check the pole.', action: { kind: 'request-visit', label: 'Request a visit' } });
    } else {
      items.push({ area: 'camera', tone: 'ok', title: 'Camera online', detail: `Latest photo ${formatRelative(camera.latestSnapshot.capturedAt, now)}; no change since last week.`, action: { kind: 'tab', tab: 'site', label: 'See the camera' } });
    }
  }

  items.sort((a, b) => TONE_ORDER[a.tone] - TONE_ORDER[b.tone]);
  const needsLook = items.filter((item) => item.tone === 'bad' || item.tone === 'warn').length;

  const headline =
    status === 'ALL_CLEAR' ? 'All checks are clear' : status === 'ACTION_REQUIRED' ? 'Action needed' : 'Needs your attention';
  const intro =
    status === 'ALL_CLEAR'
      ? 'Nothing needs you right now. Here is what was checked.'
      : needsLook === 1
        ? 'One thing needs a look. Everything else is fine.'
        : `${needsLook} things need a look. Start with the first one.`;

  return { status, headline, intro, items };
}

export interface UpcomingItem {
  date: string;
  title: string;
  detail: string;
  overdue: boolean;
}

/** What is scheduled next, soonest first. */
export function upcoming(property: PropertyRecord, now: Date): UpcomingItem[] {
  const items: UpcomingItem[] = [];
  const { inspection, legal, revenue } = property;

  if (inspection.onDemandRequest && new Date(inspection.onDemandRequest.targetVisitBy) > now) {
    items.push({
      date: inspection.onDemandRequest.targetVisitBy,
      title: 'Extra visit you asked for',
      detail: `${inspection.inspectorName} aims to visit by then.`,
      overdue: false
    });
  }
  items.push({
    date: inspection.nextVisitDue,
    title: inspection.latestVisit ? 'Monthly inspection' : 'First inspection',
    detail: `${inspection.inspectorName} walks the boundary and photographs every peg.`,
    overdue: new Date(inspection.nextVisitDue) < now
  });

  const caveat = getCaveatStatus(legal, now);
  if (caveat.expiresOn) {
    items.push({
      date: caveat.expiresOn,
      title: caveat.state === 'EXPIRED' ? 'Court caveat lapsed' : 'Court caveat lapses',
      detail: caveat.renewalRequested ? 'Renewal requested from your advocate.' : 'Renew before this date to stay covered.',
      overdue: caveat.state === 'EXPIRED'
    });
  }

  if (revenue.lastCheckedAt) {
    const next = new Date(new Date(revenue.lastCheckedAt).getTime() + 7 * DAY_MS).toISOString();
    items.push({ date: next, title: 'Land record check', detail: `On ${revenue.portalName}, weekly.`, overdue: new Date(next) < now });
  }

  return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
