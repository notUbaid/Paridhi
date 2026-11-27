import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

export interface TabItem<T extends string> {
  id: T;
  label: string;
  /** A small marker after the label, such as a status dot. */
  marker?: ReactNode;
}

interface TabsProps<T extends string> {
  tabs: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  label: string;
}

/**
 * Underlined tabs with arrow-key navigation. On narrow screens they scroll sideways, with a fade
 * on whichever edge has more tabs beyond it, and the selected tab is kept in view.
 */
export function Tabs<T extends string>({ tabs, value, onChange, label }: TabsProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const scroller = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState({ left: false, right: false });
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setOverflow({ left: el.scrollLeft > 2, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2 });
  }, []);

  useEffect(() => {
    measure();
    const el = scroller.current;
    if (!el) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    el.addEventListener('scroll', measure, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener('scroll', measure);
    };
  }, [measure]);

  // The underline slides to the selected tab.
  useLayoutEffect(() => {
    const place = () => {
      const tab = refs.current[tabs.findIndex((t) => t.id === value)];
      if (tab) setIndicator({ left: tab.offsetLeft, width: tab.offsetWidth });
    };
    place();
    const el = scroller.current;
    if (!el) return;
    const observer = new ResizeObserver(place);
    observer.observe(el);
    return () => observer.disconnect();
  }, [tabs, value]);

  useEffect(() => {
    // Scroll only the tab strip sideways, never the page.
    const el = scroller.current;
    const tab = refs.current[tabs.findIndex((t) => t.id === value)];
    if (el && tab && el.scrollWidth > el.clientWidth) {
      el.scrollTo({ left: tab.offsetLeft - (el.clientWidth - tab.clientWidth) / 2, behavior: 'smooth' });
    }
  }, [tabs, value]);

  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (index + delta + tabs.length) % tabs.length;
    onChange(tabs[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div className="relative">
      <div ref={scroller} role="tablist" aria-label={label} className="relative flex gap-1 overflow-x-auto -mb-px [scrollbar-width:none]">
        {tabs.map((tab, index) => {
          const selected = tab.id === value;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                refs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(tab.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={`relative flex items-center gap-1.5 px-3 py-3 text-sm whitespace-nowrap cursor-pointer border-b-2 border-transparent transition-colors ${
                selected ? 'text-ink font-medium' : 'text-muted hover:text-ink'
              }`}
            >
              {tab.label}
              {tab.marker}
            </button>
          );
        })}
        {indicator && (
          <span
            aria-hidden
            className="absolute bottom-0 h-[3px] rounded-full bg-accent transition-[left,width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ left: indicator.left, width: indicator.width }}
          />
        )}
      </div>
      {/* Shows there is more to scroll to. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 left-0 w-8 bg-linear-to-r from-paper to-transparent transition-opacity ${
          overflow.left ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 right-0 w-12 bg-linear-to-l from-paper via-paper/80 to-transparent transition-opacity ${
          overflow.right ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
