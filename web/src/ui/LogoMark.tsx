import { useId, type CSSProperties } from 'react';

/*
 * The Landprint mark: a "p" drawn as evenly spaced contour lines, with a survey point at the centre
 * of its bowl. Each contour is a fixed distance from the letter's centre line (a vertical stem and
 * a circular bowl), so the lines stay parallel everywhere. Measured from the brand sheet.
 */
export const MARK_WIDTH = 851;
export const MARK_HEIGHT = 1354;
const STEM_X = 162.5;
const STEM_TOP = 162.5;
const STEM_BOTTOM = 1191;
const BOWL = { cx: 425.5, cy: 425.5, r: 263 };
const DOT_RADIUS = 49;

/** Distance bands from the centre line, [inner, outer], outermost last. */
const CONTOURS: Record<2 | 4, [number, number][]> = {
  4: [
    [10.5, 38],
    [52.5, 79.5],
    [93.5, 121.5],
    [135.5, 162.5]
  ],
  // Icons: two thicker contours, the same outline.
  2: [
    [21, 77],
    [106.5, 162.5]
  ]
};

/** The p's centre line, stroked at a given width: everything within `distance` of it. */
function Spine({ distance, color }: { distance: number; color: string }) {
  if (distance <= 0) return null;
  return (
    <g stroke={color} fill="none" strokeWidth={distance * 2}>
      <line x1={STEM_X} y1={STEM_TOP} x2={STEM_X} y2={STEM_BOTTOM} strokeLinecap="round" />
      <circle cx={BOWL.cx} cy={BOWL.cy} r={BOWL.r} />
    </g>
  );
}

export interface LogoMarkProps {
  /** Four contours for large sizes, two for icons and anything under about 32 px tall. */
  contours?: 2 | 4;
  color?: string;
  dotColor?: string;
  className?: string;
  style?: CSSProperties;
  /** Accessible name. Leave out when the mark sits next to the word "paridhi". */
  title?: string;
  /** Pulse a ring out from the survey point, inside the innermost contour. */
  pulse?: boolean;
}

export function LogoMark({ contours = 4, color = 'var(--color-accent)', dotColor, className = '', style, title, pulse = false }: LogoMarkProps) {
  const maskId = `landprint-${useId().replace(/:/g, '')}`;
  // Paint every band outermost first: white keeps the band, black clears inside it.
  const bands = [...CONTOURS[contours]].reverse();
  return (
    <svg
      viewBox={`0 0 ${MARK_WIDTH} ${MARK_HEIGHT}`}
      className={className}
      style={style}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={MARK_WIDTH} height={MARK_HEIGHT}>
          {bands.map(([inner, outer]) => (
            <g key={outer}>
              <Spine distance={outer} color="white" />
              <Spine distance={inner} color="black" />
            </g>
          ))}
        </mask>
      </defs>
      <rect width={MARK_WIDTH} height={MARK_HEIGHT} fill={color} mask={`url(#${maskId})`} />
      {pulse && (
        <circle
          className="watch-ring"
          cx={BOWL.cx}
          cy={BOWL.cy}
          r={BOWL.r - 162.5 - 12}
          fill="none"
          stroke={dotColor ?? color}
          strokeWidth="18"
          opacity="0"
        />
      )}
      <circle cx={BOWL.cx} cy={BOWL.cy} r={DOT_RADIUS} fill={dotColor ?? color} />
    </svg>
  );
}
