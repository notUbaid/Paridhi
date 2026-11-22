import React, { useState } from 'react';
import type { PropertyRecord, IncidentDetection } from '../types.js';
import {
  Sun,
  BatteryCharging,
  Signal,
  ShieldAlert,
  Volume2,
  Zap,
  FileCheck,
  Camera,
  AlertTriangle
} from 'lucide-react';

interface SentinelLiveFeedProps {
  property: PropertyRecord;
  onOpenEvidence: (incident: IncidentDetection) => void;
  onToggleDeterrence: (active: boolean, language: string) => void;
}

export const SentinelLiveFeed: React.FC<SentinelLiveFeedProps> = ({
  property,
  onOpenEvidence,
  onToggleDeterrence
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    property.cadastre.state === 'Telangana'
      ? 'Telugu'
      : property.cadastre.state === 'Punjab'
      ? 'Punjabi'
      : 'Kannada'
  );

  const node = property.sentinelNode;
  const isDeterrenceActive = node.systemStatus === 'DETERRENCE_ACTIVE';
  const latestIncident = property.activeIncidents[0];

  return (
    <div className="bg-[#0b1019] border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
      {/* Feed Header */}
      <div className="px-4 py-2.5 border-b border-slate-800/80 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Camera className="w-3.5 h-3.5" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-slate-100 font-mono">{node.nodeId}</h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                4K STARVIS 2 • LIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Solar-LTE Autonomous Sentinel • Dual Sony IMX678 + 6 TOPS NPU
            </p>
          </div>
        </div>

        {/* Live Physical Telemetry Badges */}
        <div className="flex items-center gap-2.5 font-mono text-[11px]">
          {/* Solar Harvest */}
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800 text-amber-300">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>{node.solarWatts.toFixed(1)} W</span>
          </div>

          {/* LiFePO4 Battery */}
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800 text-emerald-300">
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            <span>{node.batteryPercentage.toFixed(0)}% ({node.batteryVoltage.toFixed(1)}V)</span>
          </div>

          {/* 4G LTE Signal */}
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800 text-cyan-300">
            <Signal className="w-3.5 h-3.5 text-cyan-400" />
            <span>{node.lteSignalDbm} dBm</span>
          </div>

          {/* Tamper Score */}
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800 text-slate-300">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            <span>Tamper: {node.opticalTamperScore.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Simulated 4K HUD Camera Canvas */}
      <div className="relative w-full h-[320px] bg-slate-950 overflow-hidden flex items-center justify-center">
        {/* Synthetic Video Scene Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-950/80 to-[#070b12]" />

        {/* Optical Simulation Canvas */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Camera Perspective Landscape Mock (Simulating Indian plotted land) */}
        <div className="relative w-full h-full flex flex-col justify-end p-6">
          {/* Virtual Sky / Distant Horizon */}
          <div className="absolute top-12 left-0 right-0 h-[1px] bg-slate-800/80" />

          {/* Perspective boundary pegs & virtual tripwire */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Projected Homography Tripwire Vector Line */}
            <svg className="w-full h-full">
              <line
                x1="40"
                y1="240"
                x2="600"
                y2="280"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeDasharray="6 4"
              />
              <text
                x="50"
                y="232"
                fill="#06b6d4"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                CALIBRATED CADASTRAL TRIPWIRE #2 (SURVEY {property.cadastre.surveyNumber})
              </text>
            </svg>
          </div>

          {/* Neural Bounding Box: If there is an active incident */}
          {latestIncident && (
            <div className="absolute top-24 left-1/3 w-64 p-3 border-2 border-red-500 bg-red-950/30 rounded-lg shadow-2xl shadow-red-950/80 backdrop-blur-xs animate-threat-pulse">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-red-400 border-b border-red-500/50 pb-1.5 mb-1.5">
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {latestIncident.threatType}
                </span>
                <span>{(latestIncident.confidenceScore * 100).toFixed(0)}% NPU CONF</span>
              </div>
              <p className="text-[11px] text-slate-200 line-clamp-2">
                {latestIncident.description}
              </p>
              <div className="mt-2 pt-1.5 border-t border-red-500/30 flex items-center justify-between">
                <span className="text-[9px] font-mono text-red-300">
                  SHA-256: {latestIncident.sha256Hash.substring(0, 14)}...
                </span>
                <button
                  onClick={() => onOpenEvidence(latestIncident)}
                  className="px-2 py-0.5 rounded bg-red-500 hover:bg-red-600 text-white text-[10px] font-mono font-semibold transition-colors"
                >
                  View BSA 2023 Proof
                </button>
              </div>
            </div>
          )}

          {/* On-Screen Camera HUD Telemetry Overlay */}
          <div className="absolute top-3 left-3 bg-slate-950/80 border border-slate-800 rounded px-2.5 py-1 text-[10px] font-mono text-cyan-400 backdrop-blur-sm">
            REC ● STARVIS 4K HDR | NavIC LOCK: 17.2403°N, 78.4294°E | 30 FPS
          </div>

          <div className="absolute top-3 right-3 bg-slate-950/80 border border-slate-800 rounded px-2.5 py-1 text-[10px] font-mono text-slate-400 backdrop-blur-sm">
            HW-HSM ATTESTED: OPTIGA TRUST M
          </div>

          {/* Bottom Feed Status */}
          <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-950/80 p-2 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-slate-300">Continuous Encrypted Edge Buffer</span>
            </div>
            <div>LTE Band 3 (Airtel) • 1.4 Mbps Uplink</div>
          </div>
        </div>
      </div>

      {/* Active Edge Deterrence & Voice Warning Controls */}
      <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Vernacular Language Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">Audio Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
            >
              <option value="Telugu">Telugu (తెలుగు)</option>
              <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
              <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
              <option value="Hindi">Hindi (हिंदी)</option>
              <option value="Tamil">Tamil (தமிழ்)</option>
              <option value="Marathi">Marathi (मराठी)</option>
            </select>
          </div>

          {/* Siren Armed Status Indicator */}
          <div className="text-xs font-mono">
            {isDeterrenceActive ? (
              <span className="text-red-400 font-bold animate-pulse flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                110dB SIREN ACTIVE
              </span>
            ) : (
              <span className="text-slate-400">Deterrence Standby</span>
            )}
          </div>
        </div>

        {/* Deterrence Trigger Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {isDeterrenceActive ? (
            <button
              onClick={() => onToggleDeterrence(false, selectedLanguage)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium transition-colors"
            >
              Disarm Siren & Strobes
            </button>
          ) : (
            <button
              onClick={() => onToggleDeterrence(true, selectedLanguage)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-semibold shadow-lg shadow-red-900/40 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              Sound 110dB Siren & Voice
            </button>
          )}

          {latestIncident && (
            <button
              onClick={() => onOpenEvidence(latestIncident)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-medium transition-colors"
            >
              <FileCheck className="w-3.5 h-3.5" />
              BSA 2023 Vault
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
