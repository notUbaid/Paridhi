import React, { useState } from 'react';
import type { PropertyRecord } from '../types.js';
import {
  AlertOctagon,
  X,
  Truck,
  Footprints,
  Shovel,
  Home,
  ShieldAlert,
  Radio
} from 'lucide-react';

interface SimulateIncidentModalProps {
  property: PropertyRecord;
  onClose: () => void;
  onIncidentTriggered: () => void;
}

export const SimulateIncidentModal: React.FC<SimulateIncidentModalProps> = ({
  property,
  onClose,
  onIncidentTriggered
}) => {
  const [loadingType, setLoadingType] = useState<string | null>(null);

  const threatScenarios = [
    {
      type: 'MATERIAL_DUMPING',
      title: 'Construction Material Dumping (Pre-Squatter Signature)',
      icon: Truck,
      color: 'text-amber-400 border-amber-500/30 bg-amber-950/10',
      description: 'Tipper truck dumps red clay bricks and sand piles at boundary corner (earliest indicator of land grab).'
    },
    {
      type: 'TRIPWIRE_BREACH',
      title: 'Cadastral Boundary Tripwire Trespass',
      icon: Footprints,
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/10',
      description: 'Unauthorized individuals crossing calibrated ground homography boundary polygon.'
    },
    {
      type: 'EARTHMOVER_ACTIVITY',
      title: 'Heavy Machinery / JCB Excavator Activity',
      icon: Shovel,
      color: 'text-red-400 border-red-500/30 bg-red-950/10',
      description: 'JCB 3DX backhoe excavating foundation trenches within 4 meters of legal surveyed peg.'
    },
    {
      type: 'SQUATTER_STRUCTURE',
      title: 'Makeshift Squatter Shelter Erection',
      icon: Home,
      color: 'text-rose-400 border-rose-500/30 bg-rose-950/10',
      description: 'Corrugated tin-sheet shed and bamboo frame erected to claim adverse physical possession.'
    },
    {
      type: 'BOUNDARY_TAMPER',
      title: 'Sentinel Physical Pole Tamper & Tilt Shock',
      icon: ShieldAlert,
      color: 'text-purple-400 border-purple-500/30 bg-purple-950/10',
      description: '6-axis IMU accelerometer records high-g impact (14.8g) and optical flow orientation shift.'
    },
    {
      type: 'RF_JAMMING_ATTEMPT',
      title: 'Cellular LTE / GPS Jamming Attack',
      icon: Radio,
      color: 'text-indigo-400 border-indigo-500/30 bg-indigo-950/10',
      description: 'Cellular noise floor spike detected with sudden RSSI drop; triggers fail-safe local deterrence.'
    }
  ];

  const handleTrigger = async (type: string) => {
    setLoadingType(type);
    try {
      const res = await fetch(`/api/properties/${property.id}/trigger-incident`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threatType: type })
      });
      if (res.ok) {
        onIncidentTriggered();
        onClose();
      }
    } catch (err) {
      console.error('Failed to trigger breach incident:', err);
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0b1019] border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Simulate Encroachment Threat Scenarios
              </h2>
              <p className="text-xs text-slate-400">
                Trigger Edge AI Neural Classifier & Hardware Attestation for Survey {property.cadastre.surveyNumber}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-3">
          {threatScenarios.map((scenario) => {
            const Icon = scenario.icon;
            const isLoading = loadingType === scenario.type;

            return (
              <button
                key={scenario.type}
                disabled={isLoading}
                onClick={() => handleTrigger(scenario.type)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-start gap-3.5 hover:scale-[1.01] ${scenario.color} hover:bg-slate-900/80`}
              >
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-100 font-mono">
                      {scenario.title}
                    </div>
                    {isLoading && (
                      <span className="text-[10px] font-mono text-cyan-400 animate-pulse">
                        Injecting Edge Frame...
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {scenario.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/40 text-[10px] font-mono text-slate-500">
          Injected incidents immediately generate SHA-256 hashes, Ed25519 signatures, and update the BSA 2023 Evidentiary Vault.
        </div>
      </div>
    </div>
  );
};
