import { useState } from 'react';
import { AlertTriangle, BatteryCharging, Camera, Clock, Compass, Radio, ShieldCheck, TowerControl } from 'lucide-react';
import { bearingDegrees, distanceMeters, formatQuadrantBearing } from '@shared/domain';
import type { BoundaryPeg, CameraPod, PropertyRecord } from '@shared/types';
import { formatDate, formatDateTime, formatMeters, formatRelative } from '../format';

type View = 'latest' | 'survey' | 'compare';

// Where the four corner pegs (NE, SE, SW, NW) sit on the illustrative survey drawing.
const PEG_POINTS = [
  { x: 510, y: 85 },
  { x: 450, y: 315 },
  { x: 70, y: 285 },
  { x: 110, y: 65 }
];
// Label positions for the east, south, west and north sides (peg i to peg i+1).
const EDGE_LABELS = [
  { style: { right: '2%', top: '50%' }, className: '-translate-y-1/2' },
  { style: { left: '50%', top: '91%' }, className: '-translate-x-1/2 -translate-y-1/2' },
  { style: { left: '2%', top: '46%' }, className: '-translate-y-1/2' },
  { style: { left: '50%', top: '9%' }, className: '-translate-x-1/2 -translate-y-1/2' }
];

function SurveyOverlay({ pegs, pegsIntact }: { pegs: BoundaryPeg[]; pegsIntact: boolean }) {
  const [selected, setSelected] = useState<BoundaryPeg | null>(null);
  if (pegs.length !== 4) {
    return <div className="text-xs text-slate-300 p-6">Survey drawing needs exactly four corner pegs.</div>;
  }

  const edges = pegs.map((peg, i) => {
    const next = pegs[(i + 1) % 4];
    return `${formatQuadrantBearing(bearingDegrees(peg.position, next.position))} · ${formatMeters(
      distanceMeters(peg.position, next.position)
    )}`;
  });

  return (
    <div className="absolute inset-0">
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 380" preserveAspectRatio="none">
        <polygon
          points={PEG_POINTS.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="rgba(16, 185, 129, 0.12)"
          stroke="#10b981"
          strokeWidth="1.5"
          strokeDasharray="6 3"
        />
      </svg>

      {edges.map((label, i) => (
        <span
          key={label + i}
          style={EDGE_LABELS[i].style}
          className={`absolute ${EDGE_LABELS[i].className} bg-slate-900/75 text-white font-mono text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none`}
        >
          {label}
        </span>
      ))}

      {pegs.map((peg, i) => (
        <button
          key={peg.id}
          type="button"
          onClick={() => setSelected(peg)}
          className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
          style={{ left: `${(PEG_POINTS[i].x / 600) * 100}%`, top: `${(PEG_POINTS[i].y / 380) * 100}%` }}
          aria-label={`Peg ${peg.id} (${peg.corner})`}
        >
          <span className="flex h-5 w-5 items-center justify-center">
            <span
              className={`w-2.5 h-2.5 rounded-full border border-slate-900 group-hover:scale-125 transition-transform ${
                pegsIntact ? 'bg-emerald-400' : 'bg-red-400'
              }`}
            />
          </span>
          <span className="absolute top-5 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white font-mono text-[9px] px-1 py-0.5 rounded whitespace-nowrap">
            {peg.id} ({peg.corner})
          </span>
        </button>
      ))}

      {selected && (
        <div className="absolute top-[18%] left-1/2 -translate-x-1/2 bg-slate-950/95 text-white px-3 py-1.5 rounded text-[11px] font-mono flex items-center gap-2 z-10 max-w-[95%]">
          <span className="truncate">
            {selected.id} ({selected.corner}) · {selected.position.lat.toFixed(6)}°N, {selected.position.lng.toFixed(6)}°E
          </span>
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="text-slate-400 hover:text-white cursor-pointer"
            aria-label="Close peg details"
          >
            ✕
          </button>
        </div>
      )}

      <div
        className="absolute bottom-2 right-2 text-[10px] text-slate-200 bg-slate-900/80 rounded px-1.5 py-0.5"
        title="The drawing is illustrative. Bearings and lengths are calculated from the surveyed peg coordinates."
      >
        Not to scale
      </div>
    </div>
  );
}

function CameraView({ property, camera, now }: { property: PropertyRecord; camera: CameraPod; now: Date }) {
  const [view, setView] = useState<View>('latest');
  const [compareFrame, setCompareFrame] = useState<'latest' | 'baseline'>('latest');
  const { location, inspection } = property;

  const views: { id: View; label: string }[] = [
    { id: 'latest', label: 'Latest' },
    { id: 'survey', label: 'Survey' },
    { id: 'compare', label: 'Compare week' }
  ];

  const shown = view === 'compare' && compareFrame === 'baseline' ? camera.baselineSnapshot : camera.latestSnapshot;

  return (
    <section className="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col">
      <div className="px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-slate-700 shrink-0" />
          <h2 className="font-semibold text-slate-900 text-sm tracking-tight">Camera &amp; survey</h2>
          <span
            className={`text-[11px] font-mono px-2 py-0.5 rounded border inline-flex items-center gap-1.5 ${
              camera.online
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : 'text-amber-800 bg-amber-50 border-amber-300'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${camera.online ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {camera.online ? 'Online' : 'Offline'}
          </span>
        </div>

        <div className="bg-slate-100 p-0.5 rounded flex items-center text-xs" role="tablist" aria-label="Camera view">
          {views.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={view === id}
              onClick={() => setView(id)}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                view === id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {id === 'survey' && <Compass className="w-3 h-3 text-slate-500" />}
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative bg-slate-900 h-[360px] overflow-hidden">
        <img
          src={shown.url}
          alt={`Camera snapshot of ${property.name}, ${formatDateTime(shown.capturedAt)}`}
          className={`w-full h-full object-cover select-none ${view === 'survey' ? 'brightness-90' : ''}`}
        />

        {view === 'survey' && <SurveyOverlay pegs={location.boundaryPegs} pegsIntact={inspection.latestVisit?.boundaryPegsIntact ?? true} />}

        {view !== 'survey' && (
          <div className="absolute top-3 right-3 bg-slate-900/85 text-white px-2.5 py-1 rounded-md text-[11px] font-mono flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-slate-300" />
            {formatDateTime(shown.capturedAt)}
          </div>
        )}

        {view === 'compare' && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 p-1 rounded-lg flex items-center gap-1 text-xs text-white">
            {(
              [
                ['baseline', `Baseline · ${formatDate(camera.baselineSnapshot.capturedAt)}`],
                ['latest', `Latest · ${formatDate(camera.latestSnapshot.capturedAt)}`]
              ] as const
            ).map(([frame, label]) => (
              <button
                key={frame}
                type="button"
                onClick={() => setCompareFrame(frame)}
                aria-pressed={compareFrame === frame}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  compareFrame === frame ? 'bg-white text-slate-900 font-medium' : 'text-slate-300 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        className={`px-5 py-3 border-b text-xs flex items-start gap-2.5 ${
          camera.changeDetected ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-emerald-50/60 border-emerald-100 text-emerald-900'
        }`}
      >
        {camera.changeDetected ? (
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        ) : (
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        )}
        <div className="leading-relaxed">
          <div className="font-semibold mb-0.5">
            {camera.changeDetected ? 'Change flagged against last week' : 'No change against last week'}
          </div>
          <div className="text-slate-600 text-[11px]">{camera.changeNotes}</div>
        </div>
      </div>

      <dl className="px-5 py-3 bg-slate-50 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <dt className="text-[10px] uppercase font-mono text-slate-400">Battery</dt>
          <dd className="flex items-center gap-1.5 text-slate-800 font-medium mt-0.5">
            <BatteryCharging className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="font-mono">{Math.round(camera.batteryPercentage)}%</span>
            <span className="text-slate-400">{camera.solarCharging ? 'charging' : 'on battery'}</span>
          </dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase font-mono text-slate-400">Network</dt>
          <dd className="flex items-center gap-1.5 text-slate-800 font-medium mt-0.5">
            <Radio className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{camera.carrier}</span>
          </dd>
          <dd className="text-[10px] font-mono text-slate-500">{camera.signalStrengthDbm} dBm</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase font-mono text-slate-400">Mount</dt>
          <dd className="flex items-center gap-1.5 text-slate-800 font-medium mt-0.5">
            <TowerControl className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="font-mono">{camera.poleHeightMeters} m pole</span>
          </dd>
          <dd className={`text-[10px] font-mono ${camera.tamperSwitchNormal ? 'text-slate-500' : 'text-red-700'}`}>
            {camera.tamperSwitchNormal ? 'Enclosure closed' : 'Tamper switch tripped'}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase font-mono text-slate-400">Last heartbeat</dt>
          <dd className="text-slate-800 font-medium mt-0.5 font-mono">{formatRelative(camera.lastHeartbeatAt, now)}</dd>
          <dd className="text-[10px] font-mono text-slate-500">every {camera.heartbeatIntervalSeconds} s</dd>
        </div>
      </dl>
    </section>
  );
}

/** A plot protected by inspections alone, before a camera is installed. */
function NoCameraView({ property }: { property: PropertyRecord }) {
  return (
    <section className="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col">
      <div className="px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-slate-700 shrink-0" />
          <h2 className="font-semibold text-slate-900 text-sm tracking-tight">Survey</h2>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded border text-slate-600 bg-slate-50 border-slate-200">
            No camera installed
          </span>
        </div>
      </div>
      <div className="relative bg-slate-800 h-[360px] overflow-hidden">
        <SurveyOverlay
          pegs={property.location.boundaryPegs}
          pegsIntact={property.inspection.latestVisit?.boundaryPegsIntact ?? true}
        />
      </div>
      <div className="px-5 py-3 text-xs text-slate-600 leading-relaxed">
        This plot is watched through monthly field inspections and land record checks. Camera monitoring can be added
        later; snapshots and weekly comparisons will appear here once it is installed.
      </div>
    </section>
  );
}

export function PlotVisualCard({ property, now }: { property: PropertyRecord; now: Date }) {
  return property.camera ? (
    <CameraView property={property} camera={property.camera} now={now} />
  ) : (
    <NoCameraView property={property} />
  );
}
