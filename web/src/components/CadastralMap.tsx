import React, { useState } from 'react';
import type { PropertyRecord, IncidentDetection } from '../types.js';
import {
  AlertOctagon,
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

  const coords = property.cadastre.coordinates;
  const lats = coords.map((c) => c.latitude);
  const lons = coords.map((c) => c.longitude);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);

  const padding = 75;
  const width = 640;
  const height = 370;

  const project = (lat: number, lon: number, clamp = false) => {
    const latSpan = maxLat - minLat || 0.001;
    const lonSpan = maxLon - minLon || 0.001;
    let x = padding + ((lon - minLon) / lonSpan) * (width - 2 * padding);
    let y = height - padding - ((lat - minLat) / latSpan) * (height - 2 * padding);
    if (clamp) {
      x = Math.max(30, Math.min(width - 30, x));
      y = Math.max(30, Math.min(height - 30, y));
    }
    return { x, y };
  };

  const polygonPoints = coords
    .map((c) => {
      const p = project(c.latitude, c.longitude);
      return `${p.x},${p.y}`;
    })
    .join(' ');

  const sentinelPos = project(coords[0].latitude, coords[0].longitude);
  const marshalPos = project(
    property.groundResponseTeam.currentLocation.latitude,
    property.groundResponseTeam.currentLocation.longitude,
    true
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col">
      {/* Top Map Control Bar */}
      <div className="px-5 py-3 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">
              Cadastral Demarcation Survey • Survey #{property.cadastre.surveyNumber}
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono font-medium">
              Scale 1:1000
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Village: {property.cadastre.village} • Taluk: {property.cadastre.mandalTaluk} • District: {property.cadastre.district} ({property.cadastre.state})
          </p>
        </div>

        {/* View Switchers: Segmented pill control */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setMapMode('cadastral')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                mapMode === 'cadastral'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Survey Vector</span>
            </button>
            <button
              onClick={() => setMapMode('satellite')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                mapMode === 'satellite'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Satellite className="w-3.5 h-3.5 text-purple-600" />
              <span>Orbital SAR</span>
            </button>
            <button
              onClick={() => setMapMode('thermal')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                mapMode === 'thermal'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-orange-600" />
              <span>Thermal FLIR</span>
            </button>
          </div>

          <button
            onClick={onTriggerTestModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors shadow-xs"
          >
            <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
            <span>Simulate Breach</span>
          </button>
        </div>
      </div>

      {/* Architectural Blueprint SVG Canvas */}
      <div className="relative w-full h-[360px] bg-[#fafaf9] cadastral-grid flex items-center justify-center overflow-hidden border-b border-slate-200">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full select-none"
        >
          <defs>
            {/* Architectural Hatch Pattern for land parcel */}
            <pattern id="surveyHatch" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="12" stroke="#cbd5e1" strokeWidth="0.75" />
            </pattern>

            {/* Radar Field on white canvas */}
            <radialGradient id="lightRadar" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.08" />
              <stop offset="80%" stopColor="#0284c7" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>

            {/* Camera FOV */}
            <radialGradient id="lightFov" cx="0%" cy="0%" r="100%">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Coordinate Crosshairs */}
          <g stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.3">
            <line x1="0" y1={height / 2} x2={width} y2={height / 2} />
            <line x1={width / 2} y1="0" x2={width / 2} y2={height} />
          </g>

          {/* Doppler Radar Sweep Area */}
          <g transform={`translate(${sentinelPos.x}, ${sentinelPos.y})`}>
            <circle r="110" fill="url(#lightRadar)" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
            <line
              x1="0"
              y1="0"
              x2="105"
              y2="28"
              stroke="#0284c7"
              strokeWidth="1.5"
              opacity="0.6"
              className="animate-compass-sweep"
            />
          </g>

          {/* Camera Field of View Cone */}
          <path
            d={`M ${sentinelPos.x} ${sentinelPos.y} L ${sentinelPos.x + 150} ${
              sentinelPos.y - 65
            } A 170 170 0 0 1 ${sentinelPos.x + 170} ${sentinelPos.y + 100} Z`}
            fill="url(#lightFov)"
          />

          {/* Cadastral Land Parcel Polygon */}
          <polygon
            points={polygonPoints}
            fill={mapMode === 'satellite' ? '#f3e8ff' : mapMode === 'thermal' ? '#ffedd5' : 'url(#surveyHatch)'}
            stroke="#0f172a"
            strokeWidth="2.5"
          />

          {/* Mode-specific overlays: SAR Interfogram */}
          {mapMode === 'satellite' && (
            <g>
              <ellipse cx={sentinelPos.x + 120} cy={sentinelPos.y + 35} rx="65" ry="40" fill="none" stroke="#9333ea" strokeWidth="1.5" strokeDasharray="4 3" />
              <ellipse cx={sentinelPos.x + 120} cy={sentinelPos.y + 35} rx="40" ry="24" fill="#fae8ff" stroke="#7e22ce" strokeWidth="2" opacity="0.7" />
              <text
                x={sentinelPos.x + 65}
                y={sentinelPos.y + 40}
                fill="#6b21a8"
                fontSize="11"
                fontFamily="monospace"
                fontWeight="bold"
              >
                InSAR Coherence Anomaly Δγ = -0.42
              </text>
            </g>
          )}

          {/* Mode-specific overlays: FLIR Thermal */}
          {mapMode === 'thermal' && (
            <g>
              <circle cx={sentinelPos.x + 120} cy={sentinelPos.y + 35} r="28" fill="#ea580c" fillOpacity="0.25" />
              <circle cx={sentinelPos.x + 120} cy={sentinelPos.y + 35} r="10" fill="#dc2626" />
              <text
                x={sentinelPos.x + 135}
                y={sentinelPos.y + 32}
                fill="#991b1b"
                fontSize="11"
                fontFamily="monospace"
                fontWeight="bold"
              >
                Engine Hotspot: 78.4°C
              </text>
            </g>
          )}

          {/* Boundary Peg Markers & Coordinates */}
          {coords.map((c, idx) => {
            const p = project(c.latitude, c.longitude);
            return (
              <g key={`peg-${idx}`}>
                <rect x={p.x - 4} y={p.y - 4} width="8" height="8" fill="#0f172a" />
                <text
                  x={p.x + 8}
                  y={p.y - 6}
                  fill="#0f172a"
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  PEG {idx + 1}
                </text>
                <text
                  x={p.x + 8}
                  y={p.y + 7}
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {c.latitude.toFixed(4)}°N, {c.longitude.toFixed(4)}°E
                </text>
              </g>
            );
          })}

          {/* Sentinel Hardware Location */}
          <g transform={`translate(${sentinelPos.x}, ${sentinelPos.y})`}>
            <circle r="12" fill="#0284c7" fillOpacity="0.15" />
            <circle r="6" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
            <text
              x="-28"
              y="-12"
              fill="#0369a1"
              fontSize="10"
              fontFamily="monospace"
              fontWeight="bold"
            >
              SENTINEL-X1
            </text>
          </g>

          {/* Active Incidents / Breach Markers */}
          {property.activeIncidents.map((incident) => {
            const incPos = project(incident.coordinates.latitude, incident.coordinates.longitude, true);
            return (
              <g
                key={incident.id}
                transform={`translate(${incPos.x}, ${incPos.y})`}
                className="cursor-pointer"
                onClick={() => onOpenIncidentEvidence(incident)}
              >
                <circle r="14" fill="#fee2e2" stroke="#dc2626" strokeWidth="1.5" />
                <circle r="5" fill="#dc2626" />
                <rect
                  x="-55"
                  y="-30"
                  width="110"
                  height="20"
                  rx="4"
                  fill="#ffffff"
                  stroke="#dc2626"
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="-16"
                  fill="#991b1b"
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
                stroke="#059669"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <rect x="-7" y="-7" width="14" height="14" fill="#059669" stroke="#ffffff" strokeWidth="1.5" />
              <text
                x="12"
                y="4"
                fill="#065f46"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {property.groundResponseTeam.callsign} ({property.groundResponseTeam.etaMinutes}m ETA)
              </text>
            </g>
          )}

          {/* Official Compass Rose */}
          <g transform="translate(45, 45)">
            <circle r="18" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <polygon points="0,-14 4,-2 0,0 -4,-2" fill="#0f172a" />
            <polygon points="0,14 4,2 0,0 -4,2" fill="#94a3b8" />
            <text x="0" y="-17" textAnchor="middle" fill="#0f172a" fontSize="9" fontWeight="bold">N</text>
          </g>
        </svg>

        {/* Valuation & Area Stamp: Top Right */}
        <div className="absolute top-3 right-3 bg-white/95 border border-slate-300 rounded-lg px-3 py-2 text-right shadow-xs">
          <div className="text-[10px] text-slate-500 font-medium">ASSESSED MARKET VALUE</div>
          <div className="text-base font-bold text-slate-900 font-mono">
            ₹{(property.cadastre.marketValuationINR / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-[11px] text-slate-600 font-medium">
            {property.cadastre.areaAcres} Acres ({property.cadastre.khasraKhata})
          </div>
        </div>

        {/* Bottom Legend */}
        <div className="absolute bottom-3 left-3 bg-white/95 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 shadow-xs flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-slate-900"></span>
            <span>Survey Peg Pegged</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span>24GHz Radar (40m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
            <span>Detected Anomaly</span>
          </div>
        </div>
      </div>
    </div>
  );
};
