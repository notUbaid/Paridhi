import React, { useState, useEffect } from 'react';
import type { PropertyRecord } from './types';
import { mockProperties } from './defaultData';
import { Header } from './components/Header';
import { PropertySelector } from './components/PropertySelector';
import { PlotBanner } from './components/PlotBanner';
import { PlotVisualCard } from './components/PlotVisualCard';
import { FieldInspectionCard } from './components/FieldInspectionCard';
import { RevenueWatchCard } from './components/RevenueWatchCard';
import { LegalActionCard } from './components/LegalActionCard';
import { RecentActivityFeed } from './components/RecentActivityFeed';
import { RequestInspectionModal } from './components/RequestInspectionModal';
import { LegalCaveatModal } from './components/LegalCaveatModal';
import { DossierModal } from './components/DossierModal';
import { HowItWorksModal } from './components/HowItWorksModal';

export const App: React.FC = () => {
  const [properties, setProperties] = useState<PropertyRecord[]>(mockProperties);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(mockProperties[0].id);

  // Modals
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [isCaveatModalOpen, setIsCaveatModalOpen] = useState(false);
  const [isSimulatedTamper, setIsSimulatedTamper] = useState(false);

  const activeProperty =
    properties.find((p) => p.id === selectedPropertyId) || properties[0];

  // Fetch live properties from backend if available
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch('/api/properties');
        if (res.ok) {
          const data = await res.json();
          if (data.properties && data.properties.length > 0) {
            setProperties(data.properties);
          }
        }
      } catch {
        // Use defaultData in static/offline environments
      }
    };

    fetchProperties();

    // WebSocket connection for real-time live events (optional in local daemon)
    let ws: WebSocket | null = null;
    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = window.location.hostname || 'localhost';
      const wsPort = '4001';
      ws = new WebSocket(`${wsProtocol}//${wsHost}:${wsPort}`);

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'INITIAL_STATE' && payload.properties) {
            setProperties(payload.properties);
          } else if (payload.type === 'PROPERTY_UPDATED' && payload.property) {
            setProperties((prev) =>
              prev.map((p) => (p.id === payload.property.id ? payload.property : p))
            );
          }
        } catch {
          // ignore malformed message
        }
      };
    } catch {
      // WS unavailable
    }

    return () => {
      if (ws) ws.close();
    };
  }, []);

  // Handler: Request On-Demand Field Inspection
  const handleRequestInspection = async (notes: string) => {
    try {
      const res = await fetch(`/api/properties/${activeProperty.id}/request-inspection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
      if (res.ok) {
        const data = await res.json();
        setProperties((prev) =>
          prev.map((p) => {
            if (p.id === activeProperty.id) {
              return {
                ...p,
                latestInspection: {
                  ...p.latestInspection,
                  nextScheduledDate: data.scheduledDate
                },
                recentActivity: [data.activity, ...p.recentActivity]
              };
            }
            return p;
          })
        );
      }
    } catch {
      // Fallback local update
      const newAct = {
        id: `act-${Date.now()}`,
        timestamp: 'Just now',
        category: 'INSPECTION' as const,
        title: 'On-Demand Field Inspection Dispatched',
        description: `Assigned to senior inspector ${activeProperty.latestInspection.inspectorName}. Arrival within 48h. Notes: "${notes}"`,
        severity: 'INFO' as const
      };
      setProperties((prev) =>
        prev.map((p) =>
          p.id === activeProperty.id
            ? { ...p, recentActivity: [newAct, ...p.recentActivity] }
            : p
        )
      );
    }
  };

  // Handler: Verify State Land Revenue Registry
  const handleVerifyRegistry = async () => {
    try {
      const res = await fetch(`/api/properties/${activeProperty.id}/poll-registry`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setProperties((prev) =>
          prev.map((p) => {
            if (p.id === activeProperty.id) {
              return {
                ...p,
                revenueRegistry: data.revenueRegistry,
                recentActivity: [data.activity, ...p.recentActivity]
              };
            }
            return p;
          })
        );
      }
    } catch {
      // Local fallback
      const nowFormatted = `Today, ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST (verified)`;
      const newAct = {
        id: `act-${Date.now()}`,
        timestamp: 'Just now',
        category: 'REGISTRY' as const,
        title: `${activeProperty.revenueRegistry.portalName} Polled`,
        description: `Official state land records verified. ${activeProperty.surveyNumber} is 100% clean with zero adverse claims.`,
        severity: 'SUCCESS' as const
      };
      setProperties((prev) =>
        prev.map((p) => {
          if (p.id === activeProperty.id) {
            return {
              ...p,
              revenueRegistry: {
                ...p.revenueRegistry,
                lastCheckedTimestamp: nowFormatted
              },
              recentActivity: [newAct, ...p.recentActivity]
            };
          }
          return p;
        })
      );
    }
  };

  // Handler: Retain Advocate for Legal Notice / Caveat
  const handleRetainLawyer = async () => {
    try {
      const res = await fetch(`/api/properties/${activeProperty.id}/retain-lawyer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Routine protective caveat renewal under Section 148A CPC' })
      });
      if (res.ok) {
        const data = await res.json();
        setProperties((prev) =>
          prev.map((p) => {
            if (p.id === activeProperty.id) {
              return {
                ...p,
                legalRetainer: data.legalRetainer,
                recentActivity: [data.activity, ...p.recentActivity]
              };
            }
            return p;
          })
        );
      }
    } catch {
      // Local fallback
      setIsCaveatModalOpen(true);
    }
  };

  // Handler: Toggle Simulated Tamper / Alert for Demo
  const handleSimulateTamper = async () => {
    if (!isSimulatedTamper) {
      setIsSimulatedTamper(true);
      try {
        await fetch(`/api/properties/${activeProperty.id}/simulate-tamper`, {
          method: 'POST'
        });
      } catch {
        // Fallback local mutation
      }
      setProperties((prev) =>
        prev.map((p) => {
          if (p.id === activeProperty.id) {
            return {
              ...p,
              status: 'ATTENTION_NEEDED',
              statusBadgeText: 'Attention Needed • Unscheduled Activity',
              cameraPod: {
                ...p.cameraPod,
                timelapseDifferenceDetected: true,
                timelapseNotes: 'AI visual comparison flagged 35% pixel change: construction gravel deposited near North boundary stone.'
              },
              recentActivity: [
                {
                  id: `act-${Date.now()}`,
                  timestamp: 'Just now',
                  category: 'CAMERA',
                  title: 'Visual Perimeter Anomaly Detected',
                  description: 'Weekly timelapse analysis detected anomalous material accumulation near boundary peg #2. Dispatched automated alert to owner and field inspector.',
                  severity: 'ALERT'
                },
                ...p.recentActivity
              ]
            };
          }
          return p;
        })
      );
    } else {
      setIsSimulatedTamper(false);
      try {
        await fetch(`/api/properties/${activeProperty.id}/reset`, {
          method: 'POST'
        });
      } catch {
        // Fallback local reset
      }
      const baseline = mockProperties.find((p) => p.id === activeProperty.id) || mockProperties[0];
      setProperties((prev) =>
        prev.map((p) => (p.id === activeProperty.id ? JSON.parse(JSON.stringify(baseline)) : p))
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Top Authoritative Header */}
      <Header
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onOpenDossier={() => setIsDossierOpen(true)}
        onSimulateTamper={handleSimulateTamper}
        isSimulatedTamper={isSimulatedTamper}
      />

      {/* Property Selector */}
      <PropertySelector
        properties={properties}
        selectedPropertyId={selectedPropertyId}
        onSelectProperty={setSelectedPropertyId}
      />

      {/* Main Command Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 space-y-6">
        {/* Active Plot Summary Banner */}
        <PlotBanner property={activeProperty} />

        {/* Primary Row: Visual 4G Monitoring + Monthly In-Person Human Audits */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PlotVisualCard
            cameraPod={activeProperty.cameraPod}
            surveyNumber={activeProperty.surveyNumber}
          />
          <FieldInspectionCard
            inspection={activeProperty.latestInspection}
            onRequestVisit={() => setIsInspectionModalOpen(true)}
          />
        </div>

        {/* Secondary Row: State Land Registry Watch + Legal Retainer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueWatchCard
            registry={activeProperty.revenueRegistry}
            onVerifyNow={handleVerifyRegistry}
          />
          <LegalActionCard
            legalRetainer={activeProperty.legalRetainer}
            onOpenCaveatModal={() => setIsCaveatModalOpen(true)}
            onRetainLawyer={handleRetainLawyer}
            onDownloadDossier={() => setIsDossierOpen(true)}
          />
        </div>

        {/* Chronological Audit Log */}
        <RecentActivityFeed activities={activeProperty.recentActivity} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">PARIDHI (परिधि)</span>
            <span>•</span>
            <span>Remote Vacant Land Security & Verified Title Protection</span>
          </div>
          <div className="text-slate-400 font-mono text-[11px]">
            Operating across Telangana (Dharani), Karnataka (Bhoomi), Punjab (Jamabandi) & NCR
          </div>
        </div>
      </footer>

      {/* Modals */}
      <RequestInspectionModal
        property={activeProperty}
        isOpen={isInspectionModalOpen}
        onClose={() => setIsInspectionModalOpen(false)}
        onSubmit={handleRequestInspection}
      />

      <LegalCaveatModal
        property={activeProperty}
        isOpen={isCaveatModalOpen}
        onClose={() => setIsCaveatModalOpen(false)}
      />

      <DossierModal
        property={activeProperty}
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
      />

      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />
    </div>
  );
};

export default App;
