import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw, RotateCcw, TriangleAlert } from 'lucide-react';
import type { PlotRequest, PropertyRecord } from '@shared/types';
import { api, errorMessage } from '../api';
import { AddPlotModal } from './AddPlotModal';
import { MyPlotsStart } from './MyPlotsStart';
import { useOwnerApi } from './ownerApi';
import { DossierModal } from '../components/DossierModal';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { HowItWorksModal } from '../components/HowItWorksModal';
import { LegalCaveatModal } from '../components/LegalCaveatModal';
import { RequestInspectionModal } from '../components/RequestInspectionModal';
import { StatusScreen } from '../components/StatusScreen';
import { Toast, type ToastNotification } from '../components/Toast';
import type { Account } from '../session';
import { Dot } from '../ui/Badge';
import { Tabs, type TabItem } from '../ui/Tabs';
import type { Tone } from '../ui/tone';
import { ActivityTab } from './ActivityTab';
import { InspectionsTab } from './InspectionsTab';
import { LandRecordTab } from './LandRecordTab';
import { LegalTab } from './LegalTab';
import { OverviewTab } from './OverviewTab';
import { PlotHeader } from './PlotHeader';
import { SiteTab } from './SiteTab';
import { summarise, upcoming, type OwnerTab, type SummaryAction } from './summary';
import { TopBar } from './TopBar';

const POLL_INTERVAL_MS = 30_000;
const CLOCK_TICK_MS = 30_000;

type ModalName = 'how-it-works' | 'dossier' | 'caveat' | 'inspection' | 'add-plot';
const MODALS: ModalName[] = ['how-it-works', 'dossier', 'caveat', 'inspection', 'add-plot'];
const TABS: OwnerTab[] = ['overview', 'site', 'inspections', 'land', 'legal', 'activity'];

function modalFromHash(): ModalName | null {
  const hash = window.location.hash.slice(1) as ModalName;
  return MODALS.includes(hash) ? hash : null;
}

function tabFromUrl(): OwnerTab {
  const tab = new URLSearchParams(window.location.search).get('tab') as OwnerTab | null;
  return tab && TABS.includes(tab) ? tab : 'overview';
}

interface OwnerViewProps {
  /** The signed-in owner, or null for the demo of sample plots. */
  account: Account | null;
}

export default function OwnerView({ account }: OwnerViewProps) {
  const ownerApi = useOwnerApi();
  const demo = ownerApi.demo;
  const [properties, setProperties] = useState<PropertyRecord[] | null>(null);
  const [requests, setRequests] = useState<PlotRequest[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncFailed, setSyncFailed] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(() => new URLSearchParams(window.location.search).get('plot'));
  const [tab, setTabState] = useState<OwnerTab>(tabFromUrl);
  const [modal, setModal] = useState<ModalName | null>(modalFromHash);
  const [toast, setToast] = useState<ToastNotification | null>(null);
  const [busy, setBusy] = useState<'registry' | 'caveat' | 'demo' | null>(null);
  const [now, setNow] = useState(() => new Date());

  // Bumped whenever an action changes a property, so a poll that started earlier can't overwrite it.
  const mutationVersion = useRef(0);

  const refresh = useCallback(async () => {
    const versionAtStart = mutationVersion.current;
    try {
      const [list, pending] = await Promise.all([ownerApi.listProperties(), demo ? [] : api.myPlotRequests()]);
      if (mutationVersion.current === versionAtStart) setProperties(list);
      setRequests(pending);
      setLastSyncedAt(new Date());
      setSyncFailed(false);
      setLoadError(null);
    } catch (error) {
      setSyncFailed(true);
      setLoadError(errorMessage(error));
    }
  }, [ownerApi, demo]);

  useEffect(() => {
    void refresh();
    const poll = window.setInterval(() => {
      if (document.visibilityState === 'visible') void refresh();
    }, POLL_INTERVAL_MS);
    const clock = window.setInterval(() => setNow(new Date()), CLOCK_TICK_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    const onHashChange = () => setModal(modalFromHash());
    const onPopState = () => {
      setTabState(tabFromUrl());
      setSelectedId(new URLSearchParams(window.location.search).get('plot'));
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('popstate', onPopState);
    return () => {
      window.clearInterval(poll);
      window.clearInterval(clock);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('popstate', onPopState);
    };
  }, [refresh]);

  const setTab = (next: OwnerTab) => {
    setTabState(next);
    const url = new URL(window.location.href);
    if (next === 'overview') url.searchParams.delete('tab');
    else url.searchParams.set('tab', next);
    url.hash = '';
    window.history.replaceState(null, '', url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openModal = (name: ModalName) => {
    setModal(name);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${name}`);
  };
  const closeModal = useCallback(() => {
    setModal(null);
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }, []);
  const closeToast = useCallback(() => setToast(null), []);

  const notify = (type: ToastNotification['type'], title: string, message: string) =>
    setToast({ id: crypto.randomUUID(), type, title, message });

  const replaceProperty = (updated: PropertyRecord) => {
    mutationVersion.current += 1;
    setProperties((current) => current?.map((p) => (p.id === updated.id ? updated : p)) ?? current);
    setNow(new Date());
  };

  if (!properties) {
    return loadError ? (
      <StatusScreen
        title="Can't load your plots"
        message={loadError}
        action={{ label: 'Try again', onClick: () => void refresh(), icon: <RefreshCw className="w-4 h-4" /> }}
      />
    ) : (
      <StatusScreen message="Loading your plots…" />
    );
  }

  if (properties.length === 0) {
    return account ? (
      <MyPlotsStart account={account} requests={requests} onRequested={(request) => setRequests((current) => [request, ...current])} />
    ) : (
      <StatusScreen title="No sample plots" message="The demo has no plots to show right now." />
    );
  }

  const property = properties.find((p) => p.id === selectedId) ?? properties[0];
  const summary = summarise(property, now);
  const schedule = upcoming(property, now);

  const handleRequestInspection = async (notes: string) => {
    const updated = await ownerApi.requestInspection(property.id, notes);
    replaceProperty(updated);
    notify('SUCCESS', 'Visit requested', `${updated.inspection.inspectorName} will aim to visit within 48 hours.`);
  };

  const handleCheckRegistry = async () => {
    setBusy('registry');
    try {
      const updated = await ownerApi.checkRegistry(property.id);
      replaceProperty(updated);
      const flagged = updated.revenue.flaggedMutations.length;
      if (flagged > 0) {
        notify('ALERT', 'Record checked', `${flagged} application${flagged === 1 ? ' is' : 's are'} still flagged on the land record.`);
      } else {
        notify('SUCCESS', 'Record checked', `No new applications on ${updated.revenue.portalName}.`);
      }
    } catch (error) {
      notify('ERROR', 'Check failed', errorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const handleRequestCaveatRenewal = async () => {
    setBusy('caveat');
    try {
      const updated = await ownerApi.requestCaveatRenewal(property.id);
      replaceProperty(updated);
      notify('INFO', 'Sent to your advocate', `${updated.legal.advocateName} will confirm once the caveat is lodged.`);
    } catch (error) {
      notify('ERROR', 'Request not sent', errorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const demoAlertActive = property.camera?.changeDetected ?? false;
  const handleToggleDemoAlert = async () => {
    setBusy('demo');
    try {
      const updated = demoAlertActive ? await ownerApi.resetDemo(property.id) : await ownerApi.simulateAlert(property.id);
      replaceProperty(updated);
      notify(
        demoAlertActive ? 'INFO' : 'ALERT',
        demoAlertActive ? 'Demo reset' : 'Simulated camera alert',
        demoAlertActive ? `${updated.name} is back to its sample state.` : 'The camera flagged a change on this plot.'
      );
    } catch (error) {
      notify('ERROR', 'Demo action failed', errorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const onSummaryAction = (action: SummaryAction) => {
    if (action.kind === 'tab') setTab(action.tab);
    else if (action.kind === 'request-visit') openModal('inspection');
    else void handleRequestCaveatRenewal();
  };

  // A dot on each tab that has something to look at.
  const areaTone = (area: string): Tone | null => {
    const item = summary.items.find((i) => i.area === area);
    return item && (item.tone === 'bad' || item.tone === 'warn') ? item.tone : null;
  };
  const marker = (tone: Tone | null) => (tone ? <Dot tone={tone} /> : undefined);
  const tabs: TabItem<OwnerTab>[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'site', label: 'Site & camera', marker: marker(areaTone('camera')) },
    { id: 'inspections', label: 'Inspections', marker: marker(areaTone('inspection')) },
    { id: 'land', label: 'Land record', marker: marker(areaTone('land')) },
    { id: 'legal', label: 'Legal cover', marker: marker(areaTone('legal')) },
    { id: 'activity', label: 'Activity' }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar
        properties={properties}
        requests={requests}
        selected={property}
        now={now}
        account={account}
        demo={demo}
        onSelect={(id) => {
          setSelectedId(id);
          const url = new URL(window.location.href);
          url.searchParams.set('plot', id);
          url.searchParams.delete('tab');
          url.hash = '';
          window.history.pushState(null, '', url);
          setTabState('overview');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenHowItWorks={() => openModal('how-it-works')}
        onAddPlot={account ? () => openModal('add-plot') : undefined}
      />

      {demo && (
        <div className="bg-warn-soft border-b border-warn-line">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 text-sm text-warn">
            <span>
              <strong className="font-semibold">Demo.</strong> Sample plots, people and records. Nothing is filed with any
              court or office.{' '}
              <a href="/#book" className="font-medium underline underline-offset-2">
                Book a free plot check
              </a>
            </span>
            {property.camera && (
              <button
                type="button"
                onClick={handleToggleDemoAlert}
                disabled={busy === 'demo'}
                className="inline-flex items-center gap-1.5 font-medium underline underline-offset-2 cursor-pointer disabled:opacity-50"
              >
                {demoAlertActive ? <RotateCcw className="w-3.5 h-3.5" /> : <TriangleAlert className="w-3.5 h-3.5" />}
                {demoAlertActive ? 'Reset this plot' : 'Simulate a camera alert'}
              </button>
            )}
          </div>
        </div>
      )}

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6">
        <PlotHeader property={property} status={summary.status} lastSyncedAt={lastSyncedAt} syncFailed={syncFailed} />

        <div className="border-b border-line mb-6">
          <Tabs tabs={tabs} value={tab} onChange={setTab} label="Plot sections" />
        </div>

        <ErrorBoundary>
          <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="pb-16 enter" key={`${property.id}-${tab}`}>
            {tab === 'overview' && (
              <OverviewTab
                property={property}
                summary={summary}
                upcoming={schedule}
                now={now}
                busy={busy !== null}
                onAction={onSummaryAction}
                onGoTo={setTab}
                onOpenDossier={() => openModal('dossier')}
                onOpenCaveatDraft={() => openModal('caveat')}
              />
            )}
            {tab === 'site' && <SiteTab property={property} now={now} />}
            {tab === 'inspections' && <InspectionsTab property={property} now={now} onRequestVisit={() => openModal('inspection')} />}
            {tab === 'land' && (
              <LandRecordTab
                property={property}
                now={now}
                checking={busy === 'registry'}
                onCheckNow={demo ? handleCheckRegistry : undefined}
              />
            )}
            {tab === 'legal' && (
              <LegalTab
                property={property}
                now={now}
                requesting={busy === 'caveat'}
                onRequestRenewal={handleRequestCaveatRenewal}
                onOpenDraft={() => openModal('caveat')}
                onOpenDossier={() => openModal('dossier')}
              />
            )}
            {tab === 'activity' && <ActivityTab property={property} now={now} />}
          </div>
        </ErrorBoundary>
      </main>

      <footer className="border-t border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-muted">
          <span>
            <span className="font-display text-ink">Paridhi</span> · Protecting land in India for owners abroad
          </span>
          <span>Not legal advice. Caveats and objections are filed by your advocate.</span>
        </div>
      </footer>

      <RequestInspectionModal property={property} open={modal === 'inspection'} onClose={closeModal} onSubmit={handleRequestInspection} />
      <LegalCaveatModal property={property} now={now} open={modal === 'caveat'} onClose={closeModal} />
      <DossierModal property={property} now={now} open={modal === 'dossier'} onClose={closeModal} />
      <HowItWorksModal open={modal === 'how-it-works'} onClose={closeModal} />
      {account && (
        <AddPlotModal
          open={modal === 'add-plot'}
          account={account}
          onClose={closeModal}
          onRequested={(request) => setRequests((current) => [request, ...current])}
        />
      )}

      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}

