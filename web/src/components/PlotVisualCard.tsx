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
  Compass,
  MapPin
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
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
      {/* Header Bar */}
      <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-slate-700" />
          <span className="font-semibold text-slate-900 text-sm">
            4G Solar Camera & Cadastral Defense
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Online • 4G LTE
          </span>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-0.5 rounded-lg flex items-center text-xs">
            <button
              onClick={() => setViewMode('CURRENT')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === 'CURRENT'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live Snapshot
            </button>
            <button
              onClick={() => setViewMode('CADASTRAL_OVERLAY')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                viewMode === 'CADASTRAL_OVERLAY'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3 h-3 text-slate-500" />
              <span>Survey Overlay</span>
            </button>
            <button
              onClick={() => setViewMode('TIMELAPSE_COMPARE')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                viewMode === 'TIMELAPSE_COMPARE'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowRightLeft className="w-3 h-3 text-slate-500" />
              <span>Timelapse</span>
            </button>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
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

            {/* SVG Cadastral Boundary Vectors & Ground Pegs */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 600 380"
              preserveAspectRatio="none"
            >
              {/* Cadastral Polygon Enclosure */}
              <polygon
                points="110,65 510,85 450,315 70,285"
                fill="rgba(16, 185, 129, 0.15)"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeDasharray="8 4"
              />

              {/* Cadastral Diagonals for Triangular Stability */}
              <line x1="110" y1="65" x2="450" y2="315" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="510" y1="85" x2="70" y2="285" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" strokeDasharray="3 3" />

              {/* Perimeter Dimension Labels */}
              <text x="310" y="70" fill="#ffffff" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                North Frontage: 110.2m (Approach Road)
              </text>
              <text x="260" y="310" fill="#ffffff" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                South Boundary: 112.5m (Sy. 413)
              </text>
              <text x="500" y="200" fill="#ffffff" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                East: 46.1m
              </text>
              <text x="70" y="175" fill="#ffffff" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                West: 45.8m
              </text>
            </svg>

            {/* Interactive Corner Boundary Peg Pins */}
            <div
              onClick={() => setSelectedPeg('Peg #1 (North-East Corner Stone) • 17.240312° N, 78.429451° E')}
              className="absolute top-[17%] left-[85%] -translate-x-1/2 -translate-y-1/2 bg-emerald-500 hover:bg-emerald-400 text-white p-1.5 rounded-full cursor-pointer shadow-lg border-2 border-white animate-pulse"
              title="Click to view Peg #1 Ground Coordinates"
            >
              <MapPin className="w-3.5 h-3.5" />
            </div>

            <div
              onClick={() => setSelectedPeg('Peg #2 (South-East Corner Stone) • 17.240290° N, 78.429810° E')}
              className="absolute top-[83%] left-[75%] -translate-x-1/2 -translate-y-1/2 bg-emerald-500 hover:bg-emerald-400 text-white p-1.5 rounded-full cursor-pointer shadow-lg border-2 border-white animate-pulse"
              title="Click to view Peg #2 Ground Coordinates"
            >
              <MapPin className="w-3.5 h-3.5" />
            </div>

            <div
              onClick={() => setSelectedPeg('Peg #3 (South-West Corner Stone) • 17.240189° N, 78.429288° E')}
              className="absolute top-[75%] left-[12%] -translate-x-1/2 -translate-y-1/2 bg-emerald-500 hover:bg-emerald-400 text-white p-1.5 rounded-full cursor-pointer shadow-lg border-2 border-white animate-pulse"
              title="Click to view Peg #3 Ground Coordinates"
            >
              <MapPin className="w-3.5 h-3.5" />
            </div>

            <div
              onClick={() => setSelectedPeg('Peg #4 (North-West Corner Stone) • 17.240210° N, 78.429110° E')}
              className="absolute top-[17%] left-[18%] -translate-x-1/2 -translate-y-1/2 bg-emerald-500 hover:bg-emerald-400 text-white p-1.5 rounded-full cursor-pointer shadow-lg border-2 border-white animate-pulse"
              title="Click to view Peg #4 Ground Coordinates"
            >
              <MapPin className="w-3.5 h-3.5" />
            </div>

            {/* Selected Peg Info Pill */}
            {selectedPeg && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xs text-white px-3.5 py-1.5 rounded-lg text-xs font-mono border border-emerald-400/50 flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>{selectedPeg}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedPeg(null); }}
                  className="text-slate-400 hover:text-white ml-1"
                >
                  ×
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

      {/* Bottom Telemetry & Anti-Theft Specs Bar */}
      <div className="px-5 py-3.5 bg-slate-50 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <div className="text-[10px] uppercase font-semibold text-slate-400">Solar & Battery</div>
          <div className="flex items-center gap-1 text-slate-800 font-medium mt-0.5">
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
            <span>{cameraPod.batteryPercentage}% • Float Charge</span>
          </div>
          <div className="text-[10px] text-slate-500">LiFePO4 7-Day Backup</div>
        </div>

        <div>
          <div className="text-[10px] uppercase font-semibold text-slate-400">Cellular Link</div>
          <div className="flex items-center gap-1 text-slate-800 font-medium mt-0.5">
            <Wifi className="w-3.5 h-3.5 text-blue-600" />
            <span className="truncate">{cameraPod.cellularCarrier}</span>
          </div>
          <div className="text-[10px] text-slate-500">{cameraPod.signalStrengthDbm} dBm (Optimal)</div>
        </div>

        <div>
          <div className="text-[10px] uppercase font-semibold text-slate-400">Mount & Anti-Climb</div>
          <div className="flex items-center gap-1 text-slate-800 font-medium mt-0.5">
            <Lock className="w-3.5 h-3.5 text-slate-600" />
            <span>{cameraPod.antiTheftStatus.poleMountElevationMeters}m GI Pole</span>
          </div>
          <div className="text-[10px] text-slate-500">Rotating Anti-Climb Sleeve</div>
        </div>

        <div>
          <div className="text-[10px] uppercase font-semibold text-slate-400">Cloud Heartbeat</div>
          <div className="flex items-center gap-1 text-slate-800 font-medium mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Every {cameraPod.antiTheftStatus.cloudHeartbeatSeconds}s Ping</span>
          </div>
          <div className="text-[10px] text-slate-500">Tamper Alert Active</div>
        </div>
      </div>
    </div>
  );
};
