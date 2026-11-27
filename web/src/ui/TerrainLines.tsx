/*
 * Topographic contour lines, the brand's background texture ("the same terrain lines spread into
 * backgrounds"). Generated once, deterministically: two hills, each a set of wavy closed curves.
 */

const W = 1440;
const H = 900;

interface Hill {
  cx: number;
  cy: number;
  rings: number;
  spacing: number;
  /** Phase offsets, so the two hills don't look alike. */
  seed: number;
}

const HILLS: Hill[] = [
  { cx: 260, cy: 760, rings: 11, spacing: 64, seed: 0.7 },
  { cx: 1260, cy: 120, rings: 9, spacing: 70, seed: 2.3 }
];

/** A closed smooth curve through points, as cubic Béziers (Catmull-Rom). */
function smoothClosed(points: { x: number; y: number }[]): string {
  const n = points.length;
  const p = (i: number) => points[(i + n) % n];
  let d = `M ${p(0).x.toFixed(1)} ${p(0).y.toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [p(i - 1), p(i), p(i + 1), p(i + 2)];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return `${d} Z`;
}

const PATHS = HILLS.flatMap(({ cx, cy, rings, spacing, seed }) =>
  Array.from({ length: rings }, (_, k) => {
    const r = (k + 1) * spacing;
    const points = Array.from({ length: 28 }, (_, i) => {
      const a = (i / 28) * Math.PI * 2;
      // Gentle wobble that drifts from ring to ring, like real terrain.
      const wobble = 1 + 0.09 * Math.sin(2 * a + seed + k * 0.22) + 0.05 * Math.sin(3 * a + seed * 2 - k * 0.15) + 0.03 * Math.sin(5 * a + seed);
      return { x: cx + Math.cos(a) * r * wobble * 1.25, y: cy + Math.sin(a) * r * wobble };
    });
    return smoothClosed(points);
  })
);

export function TerrainLines({ className = '', color = 'var(--color-terrain)' }: { className?: string; color?: string }) {
  return (
    <svg aria-hidden className={`pointer-events-none ${className}`} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
      <g fill="none" stroke={color} strokeWidth="3">
        {PATHS.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}
