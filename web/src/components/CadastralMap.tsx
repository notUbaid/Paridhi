import React, { useState } from 'react';
import type { PropertyRecord, IncidentDetection } from '../types.js';
import {
  Compass,
  AlertOctagon,
  Radio,
  Satellite,
  Flame,
  Layers
} from 'lucide-react';

interface CadastralMapProps {
  property: PropertyRecord;
  onOpenIncidentEvidence: (incident: IncidentDetection) => void;
  onTriggerTestModal: () => void;
}

export const CadastralMap: React.FC<CadastralMapProps> = ({
  property,
  onOpenIncidentEvidence,
  onTriggerTestModal
}) => {
  const [mapMode, setMapMode] = useState<'cadastral' | 'satellite' | 'thermal'>('cadastral');
  const [showRadarRange, setShowRadarRange] = useState(true);

  // SVG coordinate projection logic
  const coords = property.cadastre.coordinates;
  const lats = coords.map((c) => c.latitude);
  const lons = coords.map((c) => c.longitude);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);

  const padding = 70;
  const width = 640;
  const height = 380;

  const project = (lat: number, lon: number) => {
    const latSpan = maxLat - minLat || 0.001;
    const lonSpan = maxLon - minLon || 0.001;
    const x = padding + ((lon - minLon) / lonSpan) * (width - 2 * padding);
    const y = height - padding - ((lat - minLat) / latSpan) * (height - 2 * padding);
    return { x, y };
  };

  const polygonPoints = coords
    .map((c) => {
      const p = project(c.latitude, c.longitude);
      return `${p.x},${p.y}`;
    })
    .join(' ');

  // Place Sentinel Node at Peg 0
  const sentinelPos = project(coords[0].latitude, coords[0].longitude);

  // Place Marshal Unit if available
  const marshalPos = project(
    property.groundResponseTeam.currentLocation.latitude,
    property.groundResponseTeam.currentLocation.longitude
  );

  return (
    <div className="bg-[#0b1019] border border-slate-800 rounded-2xl overflow-hidden relative shadow-xl flex flex-col">
      {/* Map Control Bar */}
      <div className="px-4 py-2.5 border-b border-slate-800/80 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
              Cadastral Survey Map • Khasra {property.cadastre.surveyNumber}
              {mapMode === 'satellite' && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  ESA Sentinel-1 C-Band InSAR
                </span>
              )}
              {mapMode === 'thermal' && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  FLIR Radiometric LWIR 160x120
                </span>
              )}
            </h3>
            <p className="text-[10px] text-slate-400">
              Village: {property.cadastre.village} | Area: {property.cadastre.areaAcres} Acres | State:{' '}
              {property.cadastre.state}
            </p>
          </div>
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px] font-mono">
            <button
              onClick={() => setMapMode('cadastral')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                mapMode === 'cadastral'
                  ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Cadastral Vector</span>
            </button>
            <button
              onClick={() => setMapMode('satellite')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                mapMode === 'satellite'
                  ? 'bg-purple-500/20 text-purple-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Satellite className="w-3 h-3" />
              <span>Orbital SAR</span>
            </button>
            <button
              onClick={() => setMapMode('thermal')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                mapMode === 'thermal'
                  ? 'bg-orange-500/20 text-orange-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>Thermal FLIR</span>
            </button>
          </div>

          <button
            onClick={() => setShowRadarRange(!showRadarRange)}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              showRadarRange
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
            title="Toggle Doppler Radar Sweep Radius"
          >
            <Radio className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onTriggerTestModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-mono font-medium transition-colors"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            Simulate Breach
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full h-[360px] bg-[#070b12] hud-grid flex items-center justify-center overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full select-none"
        >
          <defs>
            {/* Radar Sweep Gradient */}
            <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="70%" stopColor="#10b981" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>

            {/* Polygon fill gradient */}
            <linearGradient id="parcelGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.04" />
            </linearGradient>

            {/* SAR Coherence Gradient */}
            <radialGradient id="sarCoherenceGlow" cx="65%" cy="35%" r="40%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.45" />
              <stop offset="40%" stopColor="#8b5cf6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
            </radialGradient>

            {/* Thermal FLIR Ironbow Heatmap Gradient */}
            <radialGradient id="flirHotspot" cx="65%" cy="35%" r="30%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="25%" stopColor="#fbbf24" stopOpacity="0.7" />
              <stop offset="60%" stopColor="#ef4444" stopOpacity="0.5" />
              <stop offset="85%" stopColor="#7c3aed" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.1" />
            </radialGradient>

            {/* Camera FOV Vision Cone */}
            <radialGradient id="fovCone" cx="0%" cy="0%" r="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="80%" stopColor="#38bdf8" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Grid lines & Sub-division Marks */}
          <g opacity="0.15">
            {Array.from({ length: 9 }).map((_, i) => (
              <line
                key={`h-${i}`}
                x1="0"
                y1={i * 45}
                x2={width}
                y2={i * 45}
                stroke="#64748b"
                strokeDasharray="3 3"
              />
            ))}
            {Array.from({ length: 14 }).map((_, i) => (
              <line
                key={`v-${i}`}
                x1={i * 50}
                y1="0"
                x2={i * 50}
                y2={height}
                stroke="#64748b"
                strokeDasharray="3 3"
              />
            ))}
          </g>

          {/* Radar Detection Range Circle (40m radius) */}
          {showRadarRange && (
            <g transform={`translate(${sentinelPos.x}, ${sentinelPos.y})`}>
              <circle r="120" fill="url(#radarGlow)" />
              <circle
                r="120"
                fill="none"
                stroke="#10b981"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.4"
              />
              <circle
                r="60"
                fill="none"
                stroke="#10b981"
                strokeWidth="0.8"
                opacity="0.25"
              />
              {/* Rotating sweep line */}
              <line
                x1="0"
                y1="0"
                x2="115"
                y2="30"
                stroke="#10b981"
                strokeWidth="1.5"
                opacity="0.7"
                className="animate-radar-sweep"
              />
            </g>
          )}

          {/* Camera FOV Cone */}
          <path
            d={`M ${sentinelPos.x} ${sentinelPos.y} L ${sentinelPos.x + 160} ${
              sentinelPos.y - 70
            } A 180 180 0 0 1 ${sentinelPos.x + 180} ${sentinelPos.y + 110} Z`}
            fill="url(#fovCone)"
          />

          {/* Cadastral Polygon (The Sovereign Land Parcel) */}
          <polygon
            points={polygonPoints}
            fill={
              mapMode === 'satellite'
                ? 'url(#sarCoherenceGlow)'
                : mapMode === 'thermal'
                ? 'url(#flirHotspot)'
                : 'url(#parcelGlow)'
            }
            stroke={mapMode === 'satellite' ? '#a855f7' : mapMode === 'thermal' ? '#f97316' : '#06b6d4'}
            strokeWidth="2.5"
          />

          {/* SAR Interferometric Fringe Contours in Satellite Mode */}
          {mapMode === 'satellite' && (
            <g opacity="0.6">
              <ellipse cx={sentinelPos.x + 120} cy={sentinelPos.y + 40} rx="70" ry="45" fill="none" stroke="#ec4899" strokeWidth="1.5" strokeDasharray="5 3" />
              <ellipse cx={sentinelPos.x + 120} cy={sentinelPos.y + 40} rx="45" ry="28" fill="none" stroke="#f43f5e" strokeWidth="2" />
              <text
                x={sentinelPos.x + 60}
                y={sentinelPos.y + 45}
                fill="#ec4899"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                InSAR COHERENCE LOSS Δγ = -0.42
              </text>
            </g>
          )}

          {/* Thermal FLIR Hotspot Radiometry in Thermal Mode */}
          {mapMode === 'thermal' && (
            <g opacity="0.8">
              <circle cx={sentinelPos.x + 120} cy={sentinelPos.y + 40} r="25" fill="#f59e0b" fillOpacity="0.4" />
              <circle cx={sentinelPos.x + 120} cy={sentinelPos.y + 40} r="10" fill="#ffffff" />
              <text
                x={sentinelPos.x + 135}
                y={sentinelPos.y + 35}
                fill="#fbbf24"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                ENGINE EXHAUST: 78.4°C
              </text>
              <circle cx={sentinelPos.x + 80} cy={sentinelPos.y + 60} r="6" fill="#ef4444" />
              <text
                x={sentinelPos.x + 92}
                y={sentinelPos.y + 64}
                fill="#ef4444"
                fontSize="9"
                fontFamily="monospace"
              >
                BODY: 36.8°C
              </text>
            </g>
          )}

          {/* Cadastral Boundary Line Glow */}
          <polygon
            points={polygonPoints}
            fill="none"
            stroke={mapMode === 'satellite' ? '#a855f7' : mapMode === 'thermal' ? '#f97316' : '#06b6d4'}
            strokeWidth="6"
            opacity="0.2"
          />

          {/* Boundary Peg Markers */}
          {coords.map((c, idx) => {
            const p = project(c.latitude, c.longitude);
            return (
              <g key={`peg-${idx}`}>
                <circle cx={p.x} cy={p.y} r="4" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />
                <text
                  x={p.x + 8}
                  y={p.y - 6}
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  PEG-{idx + 1} ({c.latitude.toFixed(4)}, {c.longitude.toFixed(4)})
                </text>
              </g>
            );
          })}

          {/* Sentinel Node Icon on Peg 1 */}
          <g transform={`translate(${sentinelPos.x}, ${sentinelPos.y})`}>
            <circle r="14" fill="#0284c7" fillOpacity="0.3" className="animate-ping" />
            <circle r="9" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
            <circle r="3" fill="#ffffff" />
            <text
              x="-25"
              y="-15"
              fill="#38bdf8"
              fontSize="10"
              fontFamily="monospace"
              fontWeight="bold"
            >
              SENTINEL-X1
            </text>
          </g>

          {/* Active Incidents / Perimeter Breach Pins */}
          {property.activeIncidents.map((incident) => {
            const incPos = project(incident.coordinates.latitude, incident.coordinates.longitude);
            const isCritical = incident.severity === 'CRITICAL';

            return (
              <g
                key={incident.id}
                transform={`translate(${incPos.x}, ${incPos.y})`}
                className="cursor-pointer"
                onClick={() => onOpenIncidentEvidence(incident)}
              >
                {/* Threat beacon ring */}
                <circle
                  r="18"
                  fill={isCritical ? '#ef4444' : '#f59e0b'}
                  fillOpacity="0.25"
                  className={isCritical ? 'animate-ping' : ''}
                />
                <circle
                  r="10"
                  fill={isCritical ? '#dc2626' : '#d97706'}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <circle r="3" fill="#ffffff" />

                {/* Threat label bubble */}
                <rect
                  x="-60"
                  y="-34"
                  width="120"
                  height="20"
                  rx="4"
                  fill="#0f172a"
                  stroke={isCritical ? '#ef4444' : '#f59e0b'}
                  strokeWidth="1"
                  opacity="0.95"
                />
                <text
                  x="0"
                  y="-20"
                  fill="#ffffff"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {incident.threatType.replace('_', ' ')}
                </text>
              </g>
            );
          })}

          {/* Ground Marshal Unit Position */}
          {property.groundResponseTeam && (
            <g transform={`translate(${marshalPos.x}, ${marshalPos.y})`}>
              <line
                x1="0"
                y1="0"
                x2={sentinelPos.x - marshalPos.x}
                y2={sentinelPos.y - marshalPos.y}
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.5"
              />
              <circle r="12" fill="#10b981" fillOpacity="0.2" className="animate-pulse" />
              <rect x="-8" y="-8" width="16" height="16" rx="3" fill="#059669" stroke="#ffffff" strokeWidth="1.5" />
              <text
                x="12"
                y="4"
                fill="#34d399"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {property.groundResponseTeam.callsign} ({property.groundResponseTeam.etaMinutes}m ETA)
              </text>
            </g>
          )}
        </svg>

        {/* Cadastral Legend & Stats Overlay */}
        <div className="absolute bottom-2 left-2 bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[10px] font-mono backdrop-blur-sm flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span className="text-slate-300">Homography Boundary Tripwire</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-slate-300">24GHz Radar Sweep (40m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-slate-300">Breach Marker</span>
          </div>
        </div>

        {/* Valuation & Area Stamp */}
        <div className="absolute top-2 right-2 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 text-right font-mono backdrop-blur-sm">
          <div className="text-[10px] text-slate-400">ESTIMATED VALUATION</div>
          <div className="text-sm font-bold text-slate-100">
            ₹{(property.cadastre.marketValuationINR / 10000000).toFixed(2)} Cr
          </div>
        </div>
      </div>
    </div>
  );
};
