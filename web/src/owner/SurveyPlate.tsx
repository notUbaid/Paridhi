import { useId } from 'react';
import { bearingDegrees, centerOf, distanceMeters, formatQuadrantBearing, polygonAreaAcres } from '@shared/domain';
import type { BoundaryPeg, PropertyLocation } from '@shared/types';

const W = 640;
const H = 480;
const PAD = 92;
const METERS_PER_DEG_LAT = 111_195;
const NICE_STEPS = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500];

interface SurveyPlateProps {
  location: PropertyLocation;
  surveyNumber: string;
  /** False marks the pegs as disturbed. */
  pegsIntact?: boolean;
  className?: string;
}

/**
 * A true-to-scale survey plan drawn from the plot's peg coordinates: north up, with side
 * lengths and bearings, neighbours, a scale bar and the enclosed area.
 */
export function SurveyPlate({ location, surveyNumber, pegsIntact = true, className = '' }: SurveyPlateProps) {
  const hatchId = useId().replace(/:/g, '');
  const pegs = location.boundaryPegs;
  if (pegs.length < 3) {
    return (
      <div className={`flex items-center justify-center bg-sunken text-sm text-muted ${className}`}>
        The survey needs at least three pegs.
      </div>
    );
  }

  // Project to local metres around the centre (east = x, north = y), then fit to the plate.
  const origin = centerOf(pegs);
  const metersPerDegLng = METERS_PER_DEG_LAT * Math.cos((origin.lat * Math.PI) / 180);
  const local = pegs.map((peg) => ({
    x: (peg.position.lng - origin.lng) * metersPerDegLng,
    y: (peg.position.lat - origin.lat) * METERS_PER_DEG_LAT
  }));
  const xs = local.map((p) => p.x);
  const ys = local.map((p) => p.y);
  const spanX = Math.max(...xs) - Math.min(...xs) || 1;
  const spanY = Math.max(...ys) - Math.min(...ys) || 1;
  const scale = Math.min((W - PAD * 2) / spanX, (H - PAD * 2) / spanY);
  const midX = (Math.max(...xs) + Math.min(...xs)) / 2;
  const midY = (Math.max(...ys) + Math.min(...ys)) / 2;
  const toSvg = (p: { x: number; y: number }) => ({ x: W / 2 + (p.x - midX) * scale, y: H / 2 - (p.y - midY) * scale });
  const points = local.map(toSvg);
  const centroid = {
    x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
    y: points.reduce((sum, p) => sum + p.y, 0) / points.length
  };

  // Grid and scale bar use a round number of metres.
  const gridMeters = NICE_STEPS.find((step) => step * scale >= 34) ?? 1000;
  const gridPx = gridMeters * scale;
  const scaleMeters = NICE_STEPS.find((step) => step * scale >= 70) ?? gridMeters;
  const scalePx = scaleMeters * scale;

  const edges = pegs.map((peg, i) => {
    const next = pegs[(i + 1) % pegs.length];
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    let nx = b.y - a.y;
    let ny = -(b.x - a.x);
    const length = Math.hypot(nx, ny) || 1;
    nx /= length;
    ny /= length;
    if (nx * (mid.x - centroid.x) + ny * (mid.y - centroid.y) < 0) {
      nx = -nx;
      ny = -ny;
    }
    let angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    if (angle > 90) angle -= 180;
    if (angle < -90) angle += 180;
    return {
      key: `${peg.id}-${next.id}`,
      x: mid.x + nx * 16,
      y: mid.y + ny * 16,
      angle,
      meters: distanceMeters(peg.position, next.position),
      bearing: formatQuadrantBearing(bearingDegrees(peg.position, next.position))
    };
  });

  const acres = polygonAreaAcres(pegs);
  const squareMeters = acres * 4046.8564224;
  const pegColor = pegsIntact ? 'var(--color-accent)' : 'var(--color-bad)';
  const neighbours = location.boundaries;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={`block w-full h-auto ${className}`}
      role="img"
      aria-label={`Survey plan of ${surveyNumber}: ${pegs.length} corner pegs enclosing ${acres.toFixed(3)} acres`}
    >
      <defs>
        <pattern id={`grid-${hatchId}`} width={gridPx} height={gridPx} patternUnits="userSpaceOnUse" x={W / 2} y={H / 2}>
          <path d={`M ${gridPx} 0 L 0 0 0 ${gridPx}`} fill="none" stroke="var(--color-line)" strokeWidth="0.75" />
        </pattern>
        <pattern id={`hatch-${hatchId}`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="7" stroke="var(--color-accent)" strokeWidth="1" strokeOpacity="0.28" />
        </pattern>
      </defs>

      {/* Sheet */}
      <rect width={W} height={H} fill="var(--color-surface)" />
      <rect width={W} height={H} fill={`url(#grid-${hatchId})`} />
      <rect x="8" y="8" width={W - 16} height={H - 16} fill="none" stroke="var(--color-line-strong)" strokeWidth="1" />

      {/* Plot */}
      <polygon
        points={points.map((p) => `${p.x},${p.y}`).join(' ')}
        fill="var(--color-accent-soft)"
        fillOpacity="0.55"
        stroke="none"
      />
      <polygon points={points.map((p) => `${p.x},${p.y}`).join(' ')} fill={`url(#hatch-${hatchId})`} />
      <polygon
        points={points.map((p) => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />

      {/* Side lengths and bearings */}
      {edges.map((edge) => (
        <g key={edge.key} transform={`translate(${edge.x} ${edge.y}) rotate(${edge.angle})`}>
          <text textAnchor="middle" y="-3" fontFamily="var(--font-sans)" fontSize="13" fontWeight="500" fill="var(--color-ink)">
            {edge.meters >= 100 ? edge.meters.toFixed(0) : edge.meters.toFixed(1)} m
          </text>
          <text textAnchor="middle" y="11" fontFamily="var(--font-mono)" fontSize="10" fill="var(--color-muted)">
            {edge.bearing}
          </text>
        </g>
      ))}

      {/* Area */}
      <g transform={`translate(${centroid.x} ${centroid.y})`}>
        <text textAnchor="middle" y="-2" fontFamily="var(--font-display)" fontSize="22" fill="var(--color-ink)">
          {acres >= 0.1 ? acres.toFixed(2) : acres.toFixed(3)} acres
        </text>
        <text textAnchor="middle" y="16" fontFamily="var(--font-sans)" fontSize="11" fill="var(--color-muted)">
          {Math.round(squareMeters).toLocaleString('en-IN')} m²
        </text>
      </g>

      {/* Pegs */}
      {points.map((point, i) => {
        const peg: BoundaryPeg = pegs[i];
        const dx = point.x - centroid.x;
        const dy = point.y - centroid.y;
        const d = Math.hypot(dx, dy) || 1;
        return (
          <g key={peg.id}>
            <circle cx={point.x} cy={point.y} r="6" fill="var(--color-surface)" stroke={pegColor} strokeWidth="2.25" />
            <circle cx={point.x} cy={point.y} r="2" fill={pegColor} />
            <text
              x={point.x + (dx / d) * 20}
              y={point.y + (dy / d) * 20 + 4}
              textAnchor={dx > 0 ? 'start' : 'end'}
              fontFamily="var(--font-mono)"
              fontSize="11"
              fill="var(--color-ink-soft)"
            >
              {peg.id} {peg.corner}
            </text>
          </g>
        );
      })}

      {/* Neighbours */}
      <g fontFamily="var(--font-display)" fontStyle="italic" fontSize="14" fill="var(--color-muted)">
        {neighbours.north && (
          <text x={W / 2} y="34" textAnchor="middle">
            {neighbours.north}
          </text>
        )}
        {neighbours.south && (
          <text x={W / 2} y={H - 22} textAnchor="middle">
            {neighbours.south}
          </text>
        )}
        {neighbours.west && (
          <text transform={`translate(32 ${H / 2}) rotate(-90)`} textAnchor="middle">
            {neighbours.west}
          </text>
        )}
        {neighbours.east && (
          <text transform={`translate(${W - 32} ${H / 2}) rotate(90)`} textAnchor="middle">
            {neighbours.east}
          </text>
        )}
      </g>

      {/* North arrow */}
      <g transform={`translate(${W - 50} 60)`}>
        <circle r="17" fill="var(--color-surface)" stroke="var(--color-line-strong)" />
        <path d="M 0 -11 L 6 8 L 0 4 L -6 8 Z" fill="var(--color-ink)" />
        <text y="-22" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="11" fontWeight="600" fill="var(--color-ink)">
          N
        </text>
      </g>

      {/* Scale bar */}
      <g transform={`translate(28 ${H - 52})`} fontFamily="var(--font-sans)" fontSize="10" fill="var(--color-muted)">
        <rect width={scalePx / 2} height="5" fill="var(--color-ink)" />
        <rect x={scalePx / 2} width={scalePx / 2} height="5" fill="var(--color-surface)" stroke="var(--color-ink)" strokeWidth="0.75" />
        <text y="18">0</text>
        <text x={scalePx} y="18" textAnchor="middle">
          {scaleMeters} m
        </text>
      </g>

      {/* Title block */}
      <g transform={`translate(${W - 28} ${H - 46})`} textAnchor="end">
        <text fontFamily="var(--font-mono)" fontSize="10.5" fill="var(--color-ink-soft)">
          {surveyNumber}
        </text>
        <text y="14" fontFamily="var(--font-sans)" fontSize="10" fill="var(--color-faint)">
          {location.village} · grid {gridMeters} m
        </text>
      </g>
    </svg>
  );
}
