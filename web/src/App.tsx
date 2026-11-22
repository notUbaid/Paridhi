import { useEffect, useState, useRef } from 'react';
import type { PropertyRecord, IncidentDetection, MutationAlert } from './types.js';
import { initialMockProperties } from './defaultData.js';
import { Header } from './components/Header.js';
import { PropertySelector } from './components/PropertySelector.js';
import { CadastralMap } from './components/CadastralMap.js';
import { SentinelLiveFeed } from './components/SentinelLiveFeed.js';
import { RegistryRadarCard } from './components/RegistryRadarCard.js';
import { GroundMarshalCard } from './components/GroundMarshalCard.js';
import { EvidenceVaultModal } from './components/EvidenceVaultModal.js';
import { CaveatModal } from './components/CaveatModal.js';
import { SimulateIncidentModal } from './components/SimulateIncidentModal.js';
import { FounderPitchModal } from './components/FounderPitchModal.js';
import { History, ShieldCheck } from 'lucide-react';

export function App() {
  const [properties, setProperties] = useState<PropertyRecord[]>(initialMockProperties);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('PRD-PROP-500081-01');
  const [activeEvidenceIncident, setActiveEvidenceIncident] = useState<IncidentDetection | null>(null);
  const [activeMutationAlert, setActiveMutationAlert] = useState<MutationAlert | null>(null);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);
  const [isPollingRegistry, setIsPollingRegistry] = useState(false);
  const [isDispatchingMarshal, setIsDispatchingMarshal] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch initial properties from REST API
  const refreshProperties = async () => {
    try {
      const res = await fetch('/api/properties');
      if (res.ok) {
        const data = await res.json();
        if (data.properties && data.properties.length > 0) {
          setProperties(data.properties);
        }
      }
    } catch (err) {
      console.warn('REST API unavailable, using local mock data fallback:', err);
    }
  };

  useEffect(() => {
    refreshProperties();

    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    // Setup WebSocket connection when running locally on HTTP with daemon
    const connectWs = () => {
      if (!isLocalhost) {
        setWsConnected(true);
        return;
      }

      try {
        const wsUrl = `ws://${window.location.hostname}:4001`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.type === 'INITIAL_STATE' && payload.properties) {
              setProperties(payload.properties);
            } else if (payload.type === 'TELEMETRY_BATCH_UPDATE') {
              setProperties((prev) =>
                prev.map((prop) => {
                  const update = payload.properties.find((u: { id: string }) => u.id === prop.id);
                  if (update) {
                    return {
                      ...prop,
                      sentinelNode: update.sentinelNode || prop.sentinelNode,
                      groundResponseTeam: update.groundResponseTeam || prop.groundResponseTeam,
                      registryRadar: update.registryRadar || prop.registryRadar
                    };
                  }
                  return prop;
                })
              );
            } else if (payload.type === 'INCIDENT_ALERT') {
              refreshProperties();
            } else if (payload.type === 'REGISTRY_RADAR_ALERT') {
              refreshProperties();
            }
          } catch (err) {
            console.error('Error handling WebSocket message:', err);
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          setTimeout(connectWs, 3000);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch {
        setWsConnected(false);
      }
    };

    connectWs();

    // Regular cloud fallback polling interval (keeps Vercel serverless deployment live & fresh)
    const pollInterval = setInterval(() => {
      refreshProperties();
    }, 4000);

    return () => {
      clearInterval(pollInterval);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const selectedProperty =
    properties.find((p) => p.id === selectedPropertyId) || properties[0];

  // Actions
  const handleToggleDeterrence = async (active: boolean, language: string) => {
    if (!selectedProperty) return;
    try {
      await fetch(`/api/properties/${selectedProperty.id}/deterrence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active, language })
      });
      refreshProperties();
    } catch (err) {
      console.error('Failed to update deterrence:', err);
    }
  };

  const handleDispatchMarshal = async () => {
    if (!selectedProperty) return;
    setIsDispatchingMarshal(true);
    try {
      await fetch(`/api/properties/${selectedProperty.id}/dispatch-marshal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId: selectedProperty.activeIncidents[0]?.id
        })
      });
      refreshProperties();
    } catch (err) {
      console.error('Failed to dispatch marshal:', err);
    } finally {
      setIsDispatchingMarshal(false);
    }
  };

  const handlePollRegistry = async () => {
    if (!selectedProperty) return;
    setIsPollingRegistry(true);
    try {
      await fetch(`/api/properties/${selectedProperty.id}/poll-registry`);
      refreshProperties();
    } catch (err) {
      console.error('Failed to poll revenue portal:', err);
    } finally {
      setIsPollingRegistry(false);
    }
  };

  const handleSimulateMutation = async () => {
    if (!selectedProperty) return;
    try {
      await fetch(`/api/properties/${selectedProperty.id}/simulate-mutation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantName: 'M. Venkat Reddy & Associates',
          claimedType: 'Fraudulent Partition & Mutation Application'
        })
      });
      refreshProperties();
    } catch (err) {
      console.error('Failed to simulate mutation:', err);
    }
  };

  const criticalThreatActive = properties.some((p) =>
    p.activeIncidents.some((i) => i.severity === 'CRITICAL')
  );

  if (!selectedProperty) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-700 flex items-center justify-center font-mono text-sm">
        Connecting to Paridhi Sovereign Defense Network...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col antialiased selection:bg-slate-200">
      {/* Top Sovereign Bar */}
      <Header
        activeSentinelsCount={properties.length}
        criticalThreatActive={criticalThreatActive}
        onOpenPitchModal={() => setIsPitchModalOpen(true)}
      />

      {/* Main Command Center Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Top Property Selector Bento */}
        <section>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
              Protected Diaspora Land Holdings
            </h2>
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  wsConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                }`}
              />
              <span className="text-slate-500">
                {wsConnected ? 'Telemetry Synchronized' : 'Reconnecting Telemetry...'}
              </span>
            </div>
          </div>
          <PropertySelector
            properties={properties}
            selectedPropertyId={selectedPropertyId}
            onSelectProperty={(id) => setSelectedPropertyId(id)}
          />
        </section>

        {/* Tactical Grid: Map & Live Video Feed + Registry & Response Teams */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Cadastral Map & 4K Sentinel Live Stream (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <CadastralMap
              property={selectedProperty}
              onOpenIncidentEvidence={(incident) => setActiveEvidenceIncident(incident)}
              onTriggerTestModal={() => setIsSimulateModalOpen(true)}
            />

            <SentinelLiveFeed
              property={selectedProperty}
              onOpenEvidence={(incident) => setActiveEvidenceIncident(incident)}
              onToggleDeterrence={handleToggleDeterrence}
            />
          </div>

          {/* Right Column: Registry Radar, Ground Marshal & Threat Ledger (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <RegistryRadarCard
              property={selectedProperty}
              onOpenCaveat={(mut) => setActiveMutationAlert(mut)}
              onPollPortal={handlePollRegistry}
              onSimulateMutation={handleSimulateMutation}
              isPolling={isPollingRegistry}
            />

            <GroundMarshalCard
              property={selectedProperty}
              onDispatchMarshal={handleDispatchMarshal}
              isDispatching={isDispatchingMarshal}
            />

            {/* Active Threat Ledger */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-700" />
                  <h3 className="text-xs font-semibold text-slate-900 font-mono tracking-tight">
                    Cryptographic Threat Audit Ledger
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {selectedProperty.activeIncidents.length} Events Recorded
                </span>
              </div>

              <div className="space-y-2.5 max-h-56 overflow-y-auto">
                {selectedProperty.activeIncidents.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 font-mono">
                    <ShieldCheck className="w-6 h-6 text-emerald-600 mx-auto mb-1.5 opacity-80" />
                    Zero perimeter violations or encroachment signatures recorded.
                  </div>
                ) : (
                  selectedProperty.activeIncidents.map((incident) => {
                    const isCritical = incident.severity === 'CRITICAL';
                    return (
                      <div
                        key={incident.id}
                        onClick={() => setActiveEvidenceIncident(incident)}
                        className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                          isCritical
                            ? 'bg-rose-50/70 border-rose-200 hover:border-rose-400'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2 text-xs font-mono font-bold">
                            <span
                              className={isCritical ? 'text-rose-700' : 'text-slate-800'}
                            >
                              {incident.threatType}
                            </span>
                            <span className="text-[10px] text-slate-500 font-normal">
                              {new Date(incident.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">
                            {incident.description}
                          </p>
                          <div className="text-[9px] font-mono text-slate-500 mt-1">
                            SHA: {incident.sha256Hash.substring(0, 16)}...
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-800 text-[10px] font-mono font-semibold shrink-0 shadow-2xs">
                          BSA §63
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modals */}
      {activeEvidenceIncident && (
        <EvidenceVaultModal
          incident={activeEvidenceIncident}
          property={selectedProperty}
          onClose={() => setActiveEvidenceIncident(null)}
        />
      )}

      {activeMutationAlert && (
        <CaveatModal
          property={selectedProperty}
          mutation={activeMutationAlert}
          onClose={() => setActiveMutationAlert(null)}
        />
      )}

      {isSimulateModalOpen && (
        <SimulateIncidentModal
          property={selectedProperty}
          onClose={() => setIsSimulateModalOpen(false)}
          onIncidentTriggered={refreshProperties}
        />
      )}

      {isPitchModalOpen && (
        <FounderPitchModal
          onClose={() => setIsPitchModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
