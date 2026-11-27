import { Fragment, useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** True once the element has come into view (or immediately where IntersectionObserver is missing). */
export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  { once = true, rootMargin = '0px 0px -10% 0px', initial = false } = {}
) {
  const [inView, setInView] = useState(initial);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) observer.disconnect();
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, once, rootMargin]);
  return inView;
}

/** Counts up to `value` once on screen. Screen readers get the final value straight away. */
export function CountUp({ value, prefix = '', duration = 1400 }: { value: number; prefix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion()) {
      setShown(value);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      setShown(Math.round(value * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, duration]);

  const format = (n: number) => `${prefix}${n.toLocaleString('en-IN')}`;
  return (
    <span ref={ref}>
      <span className="sr-only">{format(value)}</span>
      <span aria-hidden className="tabular-nums">
        {format(shown)}
      </span>
    </span>
  );
}

/** Splits a line into words that rise in one after another, continuing the count from `start`. */
export function Words({ text, start = 0, className = '' }: { text: string; start?: number; className?: string }) {
  const words = text.split(' ');
  return (
    <>
      {words.map((word, index) => (
        <Fragment key={index}>
          {/* The clip hides each word until it rises into place. */}
          <span className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em]">
            <span className={`word-rise ${className}`} style={{ '--i': start + index } as CSSProperties}>
              {word}
            </span>
          </span>
          {index < words.length - 1 && ' '}
        </Fragment>
      ))}
    </>
  );
}

/** `style` with an animation delay, for the utility classes in index.css. */
export const delay = (ms: number) => ({ '--delay': `${ms}ms` }) as CSSProperties;
