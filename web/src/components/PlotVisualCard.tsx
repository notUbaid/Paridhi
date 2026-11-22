import React, { useState } from 'react';
import type { CameraPodInfo } from '../types';
import {
  Camera,
  BatteryCharging,
  Wifi,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Lock,
  ArrowRightLeft,
  Compass
} from 'lucide-react';

interface PlotVisualCardProps {
  cameraPod: CameraPodInfo;
  surveyNumber: string;
}

export const PlotVisualCard: React.FC<PlotVisualCardProps> = ({ cameraPod, surveyNumber }) => {
  const [viewMode, setViewMode] = useState<'CURRENT' | 'CADASTRAL_OVERLAY' | 'TIMELAPSE_COMPARE'>('CURRENT');
  const [activeCompareFrame, setActiveCompareFrame] = useState<'CURRENT' | 'PREVIOUS'>('CURRENT');
  const [selectedPeg, setSelectedPeg] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200/90 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col">
      {/* Header Bar */}
      <div className="px-5 py-3 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-slate-700 shrink-0" />
          <span className="font-semibold text-slate-900 text-sm tracking-tight">
            Optical Sentinel & Cadastral Survey
          </span>
          <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Live 4G Link</span>
          </span>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-0.5 rounded flex items-center text-xs">
            <button
              onClick={() => setViewMode('CURRENT')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer text-xs ${
                viewMode === 'CURRENT'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Optical View
            </button>
            <button
              onClick={() => setViewMode('CADASTRAL_OVERLAY')}
              className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1 cursor-pointer text-xs ${
                viewMode === 'CADASTRAL_OVERLAY'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3 h-3 text-slate-500" />
              <span>Cadastral Map</span>
            </button>
            <button
              onClick={() => setViewMode('TIMELAPSE_COMPARE')}
              className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1 cursor-pointer text-xs ${
                viewMode === 'TIMELAPSE_COMPARE'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowRightLeft className="w-3 h-3 text-slate-500" />
              <span>Timelapse Delta</span>
            </button>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors cursor-pointer"
            title="Refresh snapshot feed"
            aria-label="Refresh live camera snapshot"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Image Display Area */}
      <div className="relative bg-slate-900 min-h-[360px] max-h-[460px] overflow-hidden flex items-center justify-center">
        {/* Render Image based on View Mode */}
        {viewMode === 'CURRENT' ? (
          <img
            src={cameraPod.currentSnapshotUrl}
            alt="Perimeter Camera Live Snapshot"
            className="w-full h-full object-cover select-none"
          />
        ) : viewMode === 'CADASTRAL_OVERLAY' ? (
          <div className="w-full h-full relative">
            <img
              src={cameraPod.currentSnapshotUrl}
              alt="Cadastral Boundary Survey Overlay"
              className="w-full h-full object-cover select-none filter brightness-95"
            />

            {/* Surveyor-Grade Cadastral Boundary Vectors & Ground Benchmarks */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 600 380"
              preserveAspectRatio="none"
            >
              <defs>
                <pattern id="surveyGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="0.75" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#surveyGrid)" />

              {/* Cadastral Polygon Enclosure */}
              <polygon
                points="110,65 510,85 450,315 70,285"
                fill="rgba(16, 185, 129, 0.12)"
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="6 3"
              />

              {/* Cadastral Triangulation Tie-Lines */}
              <line x1="110" y1="65" x2="450" y2="315" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.75" strokeDasharray="3 3" />
              <line x1="510" y1="85" x2="70" y2="285" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.75" strokeDasharray="3 3" />

              {/* Perimeter Dimension Callouts */}
              <text x="310" y="58" fill="#ffffff" fontSize="10" fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
                N 84°12' E · 110.2m (Approach Road)
              </text>
              <text x="260" y="325" fill="#ffffff" fontSize="10" fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
                S 83°45' W · 112.5m (Sy. 413)
              </text>
              <text x="515" y="200" fill="#ffffff" fontSize="10" fontFamily="'JetBrains Mono', monospace" textAnchor="start">
                S 06°30' E · 46.1m
              </text>
              <text x="55" y="175" fill="#ffffff" fontSize="10" fontFamily="'JetBrains Mono', monospace" textAnchor="end">
                N 05°55' W · 45.8m
              </text>
            </svg>

            {/* Cadastral Corner Benchmark Stations */}
            <button
              onClick={() => setSelectedPeg('Station P1 (NE) · 17.240312° N, 78.429451° E · Elev 542m · Stone Unshifted')}
              className="absolute top-[17%] left-[85%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              title="Station P1: North-East Corner Stone"
            >
              <span className="relative flex h-5 w-5 items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900 group-hover:scale-125 transition-transform"></span>
              </span>
              <span className="absolute top-5 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white font-mono text-[9px] px-1 py-0.5 rounded pointer-events-none whitespace-nowrap">P1 (NE)</span>
            </button>

            <button
              onClick={() => setSelectedPeg('Station P2 (SE) · 17.240290° N, 78.429810° E · Elev 541m · Road Datum')}
              className="absolute top-[83%] left-[75%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              title="Station P2: South-East Corner Stone"
            >
              <span className="relative flex h-5 w-5 items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900 group-hover:scale-125 transition-transform"></span>
              </span>
              <span className="absolute top-5 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white font-mono text-[9px] px-1 py-0.5 rounded pointer-events-none whitespace-nowrap">P2 (SE)</span>
            </button>

            <button
              onClick={() => setSelectedPeg('Station P3 (SW) · 17.240189° N, 78.429288° E · Elev 540m · Stone Intact')}
              className="absolute top-[75%] left-[12%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              title="Station P3: South-West Corner Stone"
            >
              <span className="relative flex h-5 w-5 items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900 group-hover:scale-125 transition-transform"></span>
              </span>
              <span className="absolute top-5 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white font-mono text-[9px] px-1 py-0.5 rounded pointer-events-none whitespace-nowrap">P3 (SW)</span>
            </button>

            <button
              onClick={() => setSelectedPeg('Station P4 (NW) · 17.240210° N, 78.429110° E · Elev 541m · Stone Intact')}
              className="absolute top-[17%] left-[18%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              title="Station P4: North-West Corner Stone"
            >
              <span className="relative flex h-5 w-5 items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900 group-hover:scale-125 transition-transform"></span>
              </span>
              <span className="absolute top-5 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white font-mono text-[9px] px-1 py-0.5 rounded pointer-events-none whitespace-nowrap">P4 (NW)</span>
            </button>

            {/* Selected Station Benchmark Callout */}
            {selectedPeg && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-950/95 text-white px-3 py-1.5 rounded text-[11px] font-mono border border-emerald-500/40 flex items-center gap-2 shadow-lg z-20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{selectedPeg}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedPeg(null); }}
                  className="text-slate-400 hover:text-white ml-2 text-xs"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full relative">
            <img
              src={
                activeCompareFrame === 'CURRENT'
                  ? cameraPod.currentSnapshotUrl
                  : cameraPod.previousWeekSnapshotUrl
              }
              alt="Perimeter Timelapse Compare"
              className="w-full h-full object-cover select-none"
            />
            {/* Frame Indicator Pill */}
            <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-xs text-white px-3 py-1.5 rounded-lg text-xs font-mono border border-white/20 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>
                Viewing: {activeCompareFrame === 'CURRENT' ? 'Latest (Nov 22)' : 'Baseline (Nov 15)'}
              </span>
            </div>

            {/* Compare Frame Toggle Switch */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xs p-1 rounded-xl border border-white/20 flex items-center gap-1 text-xs text-white">
              <button
                onClick={() => setActiveCompareFrame('PREVIOUS')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeCompareFrame === 'PREVIOUS'
                    ? 'bg-blue-600 text-white font-medium shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                7 Days Ago (Nov 15)
              </button>
              <button
                onClick={() => setActiveCompareFrame('CURRENT')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeCompareFrame === 'CURRENT'
                    ? 'bg-blue-600 text-white font-medium shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Today (Nov 22)
              </button>
            </div>
          </div>
        )}

        {/* Live HUD Badges on image */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <div className="bg-slate-900/85 backdrop-blur-xs text-white px-2.5 py-1 rounded-md text-[11px] font-mono border border-white/15 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>{cameraPod.lastSnapshotTimestamp}</span>
          </div>
        </div>

        {/* Corner Boundary Stone Overlay Legend */}
        <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white px-3 py-1.5 rounded-lg text-xs font-mono border border-white/15 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Survey Peg #1..#4 Verified</span>
          </div>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">{surveyNumber}</span>
        </div>
      </div>

      {/* AI Visual Change Detection Status Strip */}
      <div
        className={`px-5 py-3 border-b text-xs flex items-start gap-2.5 ${
          cameraPod.timelapseDifferenceDetected
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-emerald-50/70 border-emerald-100 text-emerald-900'
        }`}
      >
        {cameraPod.timelapseDifferenceDetected ? (
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        ) : (
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        )}
        <div className="leading-relaxed">
          <div className="font-semibold mb-0.5">
            {cameraPod.timelapseDifferenceDetected
              ? 'Weekly Visual Delta Flagged'
              : 'Weekly Perimeter Integrity Verified'}
          </div>
          <div className="text-slate-600 text-[11px]">
            {cameraPod.timelapseNotes}
          </div>
        </div>
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-200/90 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <div className="text-[10px] uppercase font-mono text-slate-400">Power Subsystem</div>
          <div className="flex items-center gap-1.5 text-slate-800 font-medium mt-0.5">
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-mono">{cameraPod.batteryPercentage}%</span>
            <span className="text-slate-400">· Float 13.2V</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500">25W Solar / LiFePO4</div>
        </div>

        <div>
          <div className="text-[10px] uppercase font-mono text-slate-400">Cellular Uplink</div>
          <div className="flex items-center gap-1.5 text-slate-800 font-medium mt-0.5">
            <Wifi className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">{cameraPod.cellularCarrier}</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500">{cameraPod.signalStrengthDbm} dBm RSRP</div>
        </div>

        <div>
          <div className="text-[10px] uppercase font-mono text-slate-400">Station Geometry</div>
          <div className="flex items-center gap-1.5 text-slate-800 font-medium mt-0.5">
            <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span className="font-mono">{cameraPod.antiTheftStatus.poleMountElevationMeters}m Monopole</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500">IP67 Enclosure · Tamper Gyro</div>
        </div>

        <div>
          <div className="text-[10px] uppercase font-mono text-slate-400">Proof of Time</div>
          <div className="flex items-center gap-1.5 text-slate-800 font-medium mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="font-mono">{cameraPod.antiTheftStatus.cloudHeartbeatSeconds}s Heartbeat</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500">NavIC GNSS Atomic Lock</div>
        </div>
      </div>
    </div>
  );
};
