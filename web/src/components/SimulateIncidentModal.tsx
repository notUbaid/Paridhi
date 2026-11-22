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
      tag: 'PRE-ENCROACHMENT',
      description: 'Tipper truck dumps red clay bricks and sand aggregate at survey corner boundary (classic adverse possession preparatory act).'
    },
    {
      type: 'TRIPWIRE_BREACH',
      title: 'Cadastral Boundary Tripwire Trespass',
      icon: Footprints,
      tag: 'BOUNDARY CROSSING',
      description: 'Unauthorized individuals cross the calibrated ground homography boundary polygon inside surveyed perimeter.'
    },
    {
      type: 'EARTHMOVER_ACTIVITY',
      title: 'Heavy Machinery / JCB Excavator Operation',
      icon: Shovel,
      tag: 'HIGH IMPACT',
      description: 'JCB 3DX backhoe excavating foundation trenches within 4 meters of legal surveyed boundary peg.'
    },
    {
      type: 'SQUATTER_STRUCTURE',
      title: 'Makeshift Squatter Shelter Erection',
      icon: Home,
      tag: 'ADVERSE POSSESSION',
      description: 'Corrugated tin-sheet shed and bamboo frame erected overnight to claim adverse physical possession.'
    },
    {
      type: 'BOUNDARY_TAMPER',
      title: 'Sentinel Physical Pole Tamper & Tilt Shock',
      icon: ShieldAlert,
      tag: 'HARDWARE ATTACK',
      description: '6-axis IMU accelerometer records high-g mechanical impact (14.8g) and optical flow orientation shift.'
    },
    {
      type: 'RF_JAMMING_ATTEMPT',
      title: 'Cellular LTE / GPS Electronic Jamming',
      icon: Radio,
      tag: 'ELECTRONIC COUNTERMEASURE',
      description: 'Cellular carrier noise floor spike detected with sudden RSSI drop; triggers fail-safe local siren deterrence.'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-300 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-white border border-slate-200 text-slate-800 shadow-2xs">
              <AlertOctagon className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Simulate Encroachment Threat Scenarios
              </h2>
              <p className="text-xs text-slate-500">
                Trigger Edge AI Neural Classifier & Hardware Attestation for Survey #{property.cadastre.surveyNumber}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
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
                className="w-full text-left p-4 rounded-lg border border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50/80 transition-all flex items-start gap-3.5 shadow-2xs cursor-pointer group"
              >
                <div className="p-2.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 group-hover:bg-slate-200 transition-colors shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-900 font-mono">
                      {scenario.title}
                    </div>
                    <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {scenario.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    {scenario.description}
                  </p>
                  {isLoading && (
                    <div className="mt-2 text-[10px] font-mono text-slate-900 font-semibold animate-pulse">
                      Injecting synthetic camera frame & computing SHA-256 hash...
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 text-[10px] font-mono text-slate-500">
          Injected events immediately compute SHA-256 frame hashes, Ed25519 signatures, and update the BSA 2023 Evidentiary Vault.
        </div>
      </div>
    </div>
  );
};
