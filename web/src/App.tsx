import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import type { HealthResponse, PropertyRecord } from '@shared/types';
import { api, errorMessage } from './api';
import { DossierModal } from './components/DossierModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FieldInspectionCard } from './components/FieldInspectionCard';
import { Header } from './components/Header';
import { HowItWorksModal } from './components/HowItWorksModal';
import { LegalActionCard } from './components/LegalActionCard';
import { LegalCaveatModal } from './components/LegalCaveatModal';
import { PlotBanner } from './components/PlotBanner';
import { PlotVisualCard } from './components/PlotVisualCard';
import { PropertySelector } from './components/PropertySelector';
import { RecentActivityFeed } from './components/RecentActivityFeed';
import { RequestInspectionModal } from './components/RequestInspectionModal';
import { RevenueWatchCard } from './components/RevenueWatchCard';
import { Toast, type ToastNotification } from './components/Toast';

const POLL_INTERVAL_MS = 30_000;
const CLOCK_TICK_MS = 30_000;

type ModalName = 'how-it-works' | 'dossier' | 'caveat' | 'inspection';
const MODALS: ModalName[] = ['how-it-works', 'dossier', 'caveat', 'inspection'];

function modalFromHash(): ModalName | null {
  const hash = window.location.hash.slice(1) as ModalName;
  return MODALS.includes(hash) ? hash : null;
}

export default function App() {
  const [properties, setProperties] = useState<PropertyRecord[] | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncFailed, setSyncFailed] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalName | null>(modalFromHash);
  const [toast, setToast] = useState<ToastNotification | null>(null);
  const [busy, setBusy] = useState<'registry' | 'caveat' | 'demo' | null>(null);
  const [now, setNow] = useState(() => new Date());

  // Bumped whenever an action changes a property, so a poll that started earlier can't overwrite it.
  const mutationVersion = useRef(0);

  const refresh = useCallback(async () => {
    const versionAtStart = mutationVersion.current;
    try {
      const [list, healthInfo] = await Promise.all([api.listProperties(), api.health()]);
      if (mutationVersion.current === versionAtStart) setProperties(list);
      setHealth(healthInfo);
      setLastSyncedAt(new Date());
      setSyncFailed(false);
      setLoadError(null);
    } catch (error) {
      setSyncFailed(true);
      setLoadError(errorMessage(error));
    }
  }, []);

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
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.clearInterval(poll);
      window.clearInterval(clock);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [refresh]);

  const openModal = (name: ModalName) => {
    setModal(name);
    window.history.replaceState(null, '', `#${name}`);
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
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8fafc]">
        {loadError ? (
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-sm w-full text-center space-y-3">
            <h1 className="text-sm font-semibold text-slate-900">Can't load your properties</h1>
            <p className="text-xs text-slate-500">{loadError}</p>
            <button
              type="button"
              onClick={() => void refresh()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try again
            </button>
          </div>
        ) : (
          <p className="text-xs text-slate-500">Loading properties…</p>
        )}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs text-slate-500">
        No properties on this account yet.
      </div>
    );
  }

  const property = properties.find((p) => p.id === selectedId) ?? properties[0];
  const demoMode = health?.demoMode ?? false;

  const handleRequestInspection = async (notes: string) => {
    const updated = await api.requestInspection(property.id, notes);
    replaceProperty(updated);
    notify(
      'SUCCESS',
      'Inspection requested',
      `${updated.latestInspection.inspectorName} is assigned, with a target of a visit within 48 hours.`
    );
  };

  const handleCheckRegistry = async () => {
    setBusy('registry');
    try {
      const updated = await api.checkRegistry(property.id);
      replaceProperty(updated);
      const flagged = updated.revenue.flaggedMutations.length;
      if (flagged > 0) {
        notify('ALERT', 'Record checked', `${flagged} application${flagged === 1 ? ' is' : 's are'} still flagged on the land record.`);
      } else {
        notify('SUCCESS', 'Record checked', `No new mutation applications on ${updated.revenue.portalName}.`);
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
      const updated = await api.requestCaveatRenewal(property.id);
      replaceProperty(updated);
      notify('INFO', 'Request sent to your advocate', `${updated.legal.advocateName} will confirm once the caveat is lodged.`);
    } catch (error) {
      notify('ERROR', 'Request not sent', errorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const demoAlertActive = property.camera.changeDetected;
  const handleToggleDemoAlert = async () => {
    setBusy('demo');
    try {
      const updated = demoAlertActive ? await api.resetDemo(property.id) : await api.simulateAlert(property.id);
      replaceProperty(updated);
      notify(
        demoAlertActive ? 'INFO' : 'ALERT',
        demoAlertActive ? 'Demo reset' : 'Simulated camera alert',
        demoAlertActive ? `${updated.name} is back to its sample state.` : 'A camera change was flagged on this plot.'
      );
    } catch (error) {
      notify('ERROR', 'Demo action failed', errorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      <Header
        owner={property.owner}
        demoMode={demoMode}
        lastSyncedAt={lastSyncedAt}
        syncFailed={syncFailed}
        onOpenHowItWorks={() => openModal('how-it-works')}
        onOpenDossier={() => openModal('dossier')}
        demoAlert={
          demoMode ? { active: demoAlertActive, busy: busy === 'demo', onToggle: handleToggleDemoAlert } : undefined
        }
      />

      <PropertySelector properties={properties} selectedId={property.id} now={now} onSelect={setSelectedId} />

      <ErrorBoundary>
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
          <PlotBanner property={property} now={now} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PlotVisualCard key={`camera-${property.id}`} property={property} now={now} />
            <FieldInspectionCard
              key={`inspection-${property.id}`}
              property={property}
              now={now}
              onRequestVisit={() => openModal('inspection')}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueWatchCard
              revenue={property.revenue}
              now={now}
              checking={busy === 'registry'}
              onCheckNow={handleCheckRegistry}
            />
            <LegalActionCard
              legal={property.legal}
              now={now}
              requesting={busy === 'caveat'}
              onOpenDraft={() => openModal('caveat')}
              onRequestRenewal={handleRequestCaveatRenewal}
              onOpenDossier={() => openModal('dossier')}
            />
          </div>

          <RecentActivityFeed activities={property.activity} now={now} />
        </main>
      </ErrorBoundary>

      <footer className="border-t border-slate-200 bg-white py-5 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>
            <span className="font-semibold text-slate-900">Paridhi (परिधि)</span> · Remote protection for vacant land in India
          </span>
          <span className="text-slate-400">
            Not legal advice. Caveats and objections are filed by your advocate.
          </span>
        </div>
      </footer>

      <RequestInspectionModal
        property={property}
        open={modal === 'inspection'}
        onClose={closeModal}
        onSubmit={handleRequestInspection}
      />
      <LegalCaveatModal property={property} now={now} open={modal === 'caveat'} onClose={closeModal} />
      <DossierModal property={property} now={now} open={modal === 'dossier'} onClose={closeModal} />
      <HowItWorksModal open={modal === 'how-it-works'} onClose={closeModal} />

      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}
