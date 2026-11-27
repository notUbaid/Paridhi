import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import {
  ArrowRight,
  Camera,
  Check,
  FileCheck,
  Landmark,
  Lock,
  Mail,
  MapPin,
  Menu as MenuIcon,
  MessageCircle,
  Minus,
  Plus,
  Scale,
  ShieldCheck,
  UserCheck,
  X
} from 'lucide-react';
import type { ContactInfo } from '@shared/types';
import { api } from '../api';
import { PlotRequestForm } from '../components/PlotRequestForm';
import { ILLUSTRATION } from '../owner/illustration';
import { SurveyPlate } from '../owner/SurveyPlate';
import { StatusBadge } from '../ui/Badge';
import { buttonClass } from '../ui/Button';
import { LogoMark } from '../ui/LogoMark';
import { TerrainLines } from '../ui/TerrainLines';
import { Wordmark } from '../ui/Wordmark';
import { CountUp, Words, delay, useInView } from './motion';

/*
 * The public website. Prices, coverage and promises here are business decisions: keep them in
 * step with what Paridhi actually offers.
 */
const PRICE = '₹4,999';
const STATES_COVERED = 'Telangana, Karnataka and Punjab';

const NAV = [
  { id: 'how', label: 'How it works' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'faq', label: 'Questions' }
];

const LAYERS = [
  {
    icon: Camera,
    title: 'A camera on the plot',
    text: 'A solar 4G camera on a tall pole. It needs no mains power or Wi-Fi, sends photos through the day, and a weekly comparison flags new material, vehicles or structures.'
  },
  {
    icon: UserCheck,
    title: 'A monthly inspection',
    text: 'A local inspector walks the boundary, photographs every corner peg and talks to neighbours. Photo locations are checked against the surveyed pegs. Ask for an extra visit any time.'
  },
  {
    icon: Landmark,
    title: 'Land record checks',
    text: 'We check the state land record portal for mutation applications you didn’t make: Bhu Bharati in Telangana, Bhoomi and E-Swathu in Karnataka, Jamabandi in Punjab.'
  },
  {
    icon: Scale,
    title: 'An advocate on retainer',
    text: 'A local advocate keeps a caveat in force in the civil court, so the court must notify them before passing orders about your plot, and advises you when something is found.'
  }
];

const STATS = [
  { value: 90, suffix: 'days', label: 'of court caveat cover, renewed before it lapses' },
  { value: 50, suffix: 'm', label: 'the furthest an inspection photo may be from its peg' },
  { value: 48, suffix: 'hours', label: 'our target for an extra visit when you ask' },
  { value: 4, suffix: 'layers', label: 'camera, inspection, land record and advocate' }
];

const STEPS = [
  { title: 'Tell us about your plot', text: 'Two minutes: where it is and how to reach you.' },
  { title: 'We check the land record', text: 'We look it up on the state portal and tell you what we find.' },
  { title: 'Survey and camera', text: 'If you go ahead, we survey the corner pegs and set up the camera.' },
  { title: 'Watch from anywhere', text: 'Inspections, photos and the land record, in one dashboard.' }
];

const INCLUDED = [
  'Solar 4G camera, installed and maintained',
  'Monthly inspection with GPS-checked photos of every peg',
  'Extra visits on request, aiming for within 48 hours',
  'Regular checks of the state land record',
  'A retained local advocate and a court caveat kept in force',
  'A signed dossier of your plot to share with your advocate'
];

const FAQS: { q: string; a: ReactNode }[] = [
  {
    q: 'What happens if something is found?',
    a: 'It shows on your dashboard straight away, with the photos and what was seen. The inspector goes to the plot, and your advocate explains the options: an objection at the revenue office for a mutation application, or a complaint or civil case for encroachment. Nothing is filed without your go-ahead.'
  },
  {
    q: 'Which states do you cover?',
    a: `We're starting with ${STATES_COVERED}, where we check the state land record portals. If your plot is somewhere else, send a request anyway: it tells us where to go next.`
  },
  {
    q: 'Is the advocate’s fee included?',
    a: 'Keeping a caveat in force for your plot is part of the monthly fee. If your plot needs more, such as an objection or a court case, your advocate tells you the fee first and you decide.'
  },
  {
    q: 'Does a caveat stop someone selling my land?',
    a: 'No. A caveat means the civil court must notify your advocate before passing orders on an application about your plot. It doesn’t stop a mutation at the revenue office; that is why we also watch the land record and file objections there.'
  },
  {
    q: 'Does the camera need electricity or internet at the plot?',
    a: 'No. It runs on a solar panel and battery and sends photos over 4G. It is sized for about a week without sun in the monsoon, and a camera that goes silent is noticed quickly.'
  },
  {
    q: 'Who can see my plot’s details?',
    a: 'You, and the Paridhi staff assigned to your plot: the inspector who visits it and the advocate who acts for you. Records are stored in a data centre in Mumbai.'
  }
];

const TICKER = ['Camera on the plot', 'Monthly inspection', 'Land record watch', 'Advocate on retainer', 'Telangana', 'Karnataka', 'Punjab'];

export function Landing() {
  const [contact, setContact] = useState<ContactInfo>({ whatsapp: null, email: null });
  const heroRef = useRef<HTMLElement>(null);
  const bookRef = useRef<HTMLElement>(null);

  useEffect(() => {
    api
      .health()
      .then((health) => setContact(health.contact))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <main>
        <Hero sectionRef={heroRef} />
        <Ticker />
        <Problem />
        <Layers />
        <Stats />
        <Report />
        <Steps />
        <Pricing />
        <Faq />
        <Book sectionRef={bookRef} contact={contact} />
      </main>
      <Footer />
      <MobileCta heroRef={heroRef} bookRef={bookRef} />
    </div>
  );
}

/* ---------------------------------------------------------------------------------------- */

function Header() {
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Highlight the section in view.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    for (const { id } of NAV) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 bg-mustard/95 backdrop-blur-md border-b border-ink/15">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-6">
        <a href="/" aria-label="Paridhi home" className="shrink-0">
          <Wordmark />
        </a>
        <nav aria-label="Sections" className="hidden md:flex items-center gap-1 text-sm">
          {NAV.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active === id ? 'true' : undefined}
              className={`relative px-3 py-2 rounded-lg transition-colors ${active === id ? 'text-ink font-medium' : 'text-ink-soft hover:text-ink'}`}
            >
              {label}
              <span
                aria-hidden
                className={`absolute left-3 right-3 bottom-0.5 h-0.5 rounded-full bg-accent origin-left transition-transform duration-300 ${
                  active === id ? 'scale-x-100' : 'scale-x-0'
                }`}
              />
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {/* Wrappers carry the breakpoints: buttonClass already sets its own display. */}
          <span className="hidden sm:block">
            <a href="/app" className={buttonClass('ghost', 'sm')}>
              Sign in
            </a>
          </span>
          <span className="hidden sm:block">
            <a href="/demo" className={buttonClass('secondary', 'sm')}>
              See the demo
            </a>
          </span>
          <span className="hidden lg:block">
            <a href="#book" className={buttonClass('brand', 'sm')}>
              Book a plot check
            </a>
          </span>
          <span className="md:hidden">
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="site-menu"
              className={buttonClass('ghost', 'sm')}
            >
              {open ? <X className="w-4 h-4" /> : <MenuIcon className="w-4 h-4" />}
              Menu
            </button>
          </span>
        </div>
      </div>
      {/* Reading progress, driven by the scroll position. */}
      <div aria-hidden className="absolute inset-x-0 -bottom-px h-[3px] bg-accent scale-x-0 scroll-progress" />

      {open && (
        <div id="site-menu" className="md:hidden border-t border-ink/15 bg-mustard sheet-in">
          <nav aria-label="Menu" className="max-w-6xl mx-auto px-4 py-3 flex flex-col">
            {NAV.map(({ id, label }) => (
              <a key={id} href={`#${id}`} onClick={() => setOpen(false)} className="py-3 border-b border-ink/15 font-medium text-ink">
                {label}
              </a>
            ))}
            <a href="/demo" className="py-3 border-b border-ink/15 font-medium text-ink">
              See the demo
            </a>
            <a href="/app" className="py-3 font-medium text-ink">
              Sign in
            </a>
            <a href="#book" onClick={() => setOpen(false)} className={buttonClass('brand', 'lg', 'mt-2 mb-1')}>
              Book a free plot check
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

/* ---------------------------------------------------------------------------------------- */

const ROAD = 'M 1560 60 C 1200 90 1010 250 1120 430 C 1230 610 1090 790 780 990';

function Hero({ sectionRef }: { sectionRef: RefObject<HTMLElement | null> }) {
  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-mustard">
      <TerrainLines className="absolute inset-0 w-full h-full fade-in" />
      {/* The red road sweeping behind the plot, like a printed poster. */}
      <svg aria-hidden className="absolute inset-0 w-full h-full hidden lg:block" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <path d={ROAD} pathLength={1} className="draw" style={{ '--duration': '2200ms' } as CSSProperties} fill="none" stroke="var(--color-accent)" strokeWidth="190" />
        <path d={ROAD} className="fade-in road-dash" style={delay(1700)} fill="none" stroke="var(--color-marigold)" strokeWidth="7" strokeDasharray="34 30" />
      </svg>
      <svg aria-hidden className="absolute right-0 bottom-0 w-full h-[42%] lg:hidden" viewBox="0 0 400 300" preserveAspectRatio="xMaxYMax slice">
        <path d="M 470 20 C 300 40 190 110 250 190 S 200 300 60 340" pathLength={1} className="draw" fill="none" stroke="var(--color-accent)" strokeWidth="110" />
      </svg>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16 sm:pt-20 sm:pb-24 grid grid-cols-1 lg:grid-cols-[1.08fr_1fr] gap-12 lg:gap-14 items-center">
        <div>
          <div className="eyebrow text-accent fade-up">For plot owners living outside India</div>
          <h1 className="font-display font-bold text-hero text-ink mt-5 tracking-tight">
            <Words text="Protect your plot in India" /> <Words text="while you live abroad." start={5} className="text-accent" />
          </h1>
          <p className="text-lg text-ink-soft mt-6 max-w-xl fade-up" style={delay(700)}>
            Paridhi keeps watch over vacant land: a camera on the plot, a monthly inspection of every boundary peg, regular
            checks of the land record, and a local advocate on retainer. You see all of it from wherever you live.
          </p>
          <div className="flex flex-wrap gap-3 mt-8 fade-up" style={delay(850)}>
            <a href="#book" className={buttonClass('brand', 'lg')}>
              Book a free plot check
            </a>
            <a href="/demo" className={buttonClass('secondary', 'lg', 'group')}>
              See a live demo
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 mt-7 text-small text-ink-soft fade-up" style={delay(1000)}>
            <li className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-accent" aria-hidden />
              {PRICE} a month, camera included
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-accent" aria-hidden />
              {STATES_COVERED}
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-accent" aria-hidden />
              The plot check is free
            </li>
          </ul>
        </div>

        <figure className="relative">
          <div className="relative rounded-card overflow-hidden border-2 border-ink bg-surface shadow-print -rotate-1 fade-up" style={delay(200)}>
            <SurveyPlate location={ILLUSTRATION} surveyNumber="Sy. No. 412/A" animate watch />
            <span className="absolute left-3 top-3 rounded-full border border-ink bg-mustard px-2.5 py-0.5 text-xs font-semibold text-ink">
              Sample plot
            </span>
          </div>
          <div
            className="relative mt-4 lg:-mt-6 lg:ml-10 lg:-mr-6 rounded-card border-2 border-ink bg-surface shadow-pop p-5 rotate-1 fade-up"
            style={delay(1500)}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="eyebrow">Today</div>
                <div className="font-display font-semibold text-heading text-ink mt-1">All checks are clear</div>
              </div>
              <span className="pop inline-block" style={delay(1700)}>
                <StatusBadge status="ALL_CLEAR" />
              </span>
            </div>
            <ul className="mt-4 space-y-2.5 text-sm">
              <HeroRow at={1800} icon={<Camera className="w-3.5 h-3.5" />} label="Camera" value="Photo 32 min ago" />
              <HeroRow at={1950} icon={<UserCheck className="w-3.5 h-3.5" />} label="Inspection" value="4 of 4 pegs intact" />
              <HeroRow at={2100} icon={<Landmark className="w-3.5 h-3.5" />} label="Land record" value="No new applications" />
              <HeroRow at={2250} icon={<Scale className="w-3.5 h-3.5" />} label="Court caveat" value="In force" />
            </ul>
          </div>
          <figcaption className="sr-only">A sample plot, drawn to scale from its corner pegs, and its status today.</figcaption>
        </figure>
      </div>
    </section>
  );
}

function HeroRow({ icon, label, value, at }: { icon: ReactNode; label: string; value: string; at: number }) {
  return (
    <li className="flex items-center gap-2.5 fade-up" style={delay(at)}>
      <span className="w-6 h-6 rounded-full bg-ok-soft text-ok flex items-center justify-center shrink-0">{icon}</span>
      <span className="text-muted">{label}</span>
      <span className="ml-auto text-ink font-medium text-right">{value}</span>
    </li>
  );
}

/* ---------------------------------------------------------------------------------------- */

function Ticker() {
  const items = [...TICKER, ...TICKER];
  return (
    <div className="marquee bg-accent text-surface border-y-2 border-ink overflow-hidden">
      <p className="sr-only">{TICKER.join(', ')}</p>
      <div aria-hidden className="marquee-track flex w-max">
        {items.map((item, index) => (
          <span key={index} className="flex items-center font-display font-bold uppercase tracking-wide text-xl sm:text-2xl py-4">
            <span className="px-6">{item}</span>
            <svg viewBox="0 0 20 20" className="w-4 h-4 text-marigold" fill="currentColor">
              <path d="M10 0 L13 7 L20 10 L13 13 L10 20 L7 13 L0 10 L7 7 Z" />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------------------- */

function SectionHeading({ eyebrow, title, children, light = false }: { eyebrow: string; title: ReactNode; children?: ReactNode; light?: boolean }) {
  return (
    <div className="max-w-2xl reveal">
      <div className={`eyebrow ${light ? 'text-marigold' : 'text-accent'}`}>{eyebrow}</div>
      <h2 className={`font-display font-bold text-display mt-3 tracking-tight ${light ? 'text-surface' : 'text-ink'}`}>{title}</h2>
      {children && <p className={`text-lg mt-4 ${light ? 'text-surface/90' : 'text-ink-soft'}`}>{children}</p>}
    </div>
  );
}

function Problem() {
  const points = [
    {
      title: 'Encroachment starts small',
      text: 'A load of bricks or gravel, a boundary peg moved a foot, a tin shed. Vacant plots have no power, no internet and often no wall, so no one notices.'
    },
    {
      title: 'Fraud starts on paper',
      text: 'A mutation application at the revenue office can change the name on the land record. Portals don’t send alerts, so owners hear about it late.'
    },
    {
      title: 'Disputes take years',
      text: 'Once someone is on the land or on the record, a civil case can run for many years. Catching it in the first days is what makes the difference.'
    }
  ];
  return (
    <section className="relative overflow-hidden bg-paper">
      <LogoMark className="absolute -right-12 top-10 h-[26rem] w-auto hidden md:block" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
        <SectionHeading
          eyebrow="The problem"
          title={
            <>
              Land is usually lost{' '}
              <span className="relative inline-block">
                slowly,
                <svg aria-hidden viewBox="0 0 200 20" preserveAspectRatio="none" className="absolute left-0 -bottom-2 w-full h-3">
                  <path d="M 2 14 C 50 2 120 2 198 10" pathLength={1} className="scroll-draw" fill="none" stroke="var(--color-accent)" strokeWidth="5" strokeLinecap="round" />
                </svg>
              </span>{' '}
              while the owner is far away.
            </>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
          {points.map((point, index) => (
            <div key={point.title} className="reveal">
              <div className="lift h-full rounded-card bg-surface border-2 border-ink p-6 shadow-print">
                <div className="font-display font-bold text-display text-accent leading-none">0{index + 1}</div>
                <h3 className="font-display font-semibold text-heading text-ink mt-4">{point.title}</h3>
                <p className="text-ink-soft mt-2">{point.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------------------- */

function Layers() {
  return (
    <section id="how" className="scroll-mt-16 relative overflow-hidden bg-mustard border-y-2 border-ink">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
        <SectionHeading eyebrow="How it works" title="Four layers of protection for one plot.">
          Each one covers a different way land is lost. Together they mean something is noticed in days, not years.
        </SectionHeading>

        <div className="relative mt-14">
          {/* A road that winds through the four layers and draws itself as you scroll. */}
          <WindingRoad />
          <div aria-hidden className="absolute left-[18px] top-0 bottom-0 w-3 rounded-full bg-accent md:hidden scroll-grow-y" />

          <ol className="relative grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-x-20 md:gap-y-16">
            {LAYERS.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="reveal pl-12 md:pl-0">
                <div className="lift relative rounded-card border-2 border-ink bg-surface shadow-print p-6">
                  <span className="absolute -left-12 top-5 md:-left-4 md:-top-4 w-9 h-9 rounded-full bg-ink text-surface font-display font-bold flex items-center justify-center border-2 border-mustard">
                    {index + 1}
                  </span>
                  <span className="w-11 h-11 rounded-xl bg-accent text-surface flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </span>
                  <h3 className="font-display font-semibold text-heading text-ink mt-4">{title}</h3>
                  <p className="text-ink-soft mt-2">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/** The red road behind the layer cards, drawn in real pixels so its width stays even. */
function WindingRoad() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  let d = '';
  if (size) {
    const { w, h } = size;
    const [left, right] = [w * 0.25, w * 0.75];
    d = [
      `M ${left} -24`,
      `C ${left} ${h * 0.2}, ${right} ${h * 0.12}, ${right} ${h * 0.34}`,
      `C ${right} ${h * 0.58}, ${left} ${h * 0.44}, ${left} ${h * 0.68}`,
      `C ${left} ${h * 0.9}, ${right} ${h * 0.82}, ${right} ${h + 24}`
    ].join(' ');
  }

  return (
    <div ref={ref} aria-hidden className="absolute inset-0 hidden md:block">
      {size && (
        <svg width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} className="overflow-visible">
          <path d={d} pathLength={1} className="scroll-draw" fill="none" stroke="var(--color-accent)" strokeWidth="44" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------------------- */

function Stats() {
  return (
    <section className="bg-accent text-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
        {STATS.map((stat) => (
          <div key={stat.label} className="reveal border-t-2 border-surface/40 pt-5">
            <div className="font-display font-bold text-hero leading-none">
              <CountUp value={stat.value} />
              <span className="text-heading font-semibold ml-1.5 text-marigold">{stat.suffix}</span>
            </div>
            <p className="text-surface/90 mt-3 max-w-[16rem]">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------------------- */

function Report() {
  const phoneRef = useRef<HTMLDivElement>(null);
  const inView = useInView(phoneRef);
  const points = [
    {
      icon: MapPin,
      title: 'Your plot, drawn to scale',
      text: 'The survey plan is drawn from the GPS positions of your corner pegs, so you can see exactly what is being protected.'
    },
    {
      icon: FileCheck,
      title: 'A record you can check',
      text: 'Inspections, camera incidents and your plot dossier are signed when we receive them, so anyone can check they haven’t been changed since.'
    },
    {
      icon: Lock,
      title: 'Private to you',
      text: 'Only you and the staff assigned to your plot can see it. Your records are stored in a data centre in Mumbai.'
    }
  ];
  return (
    <section className="relative overflow-hidden bg-paper">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-14 items-center">
        <div>
          <SectionHeading eyebrow="What you see" title="Everything that was checked, in plain words.">
            Your dashboard says whether anything needs you, shows each inspection with its photos, and keeps a signed dossier
            ready for your advocate.
          </SectionHeading>
          <ul className="mt-10 space-y-5">
            {points.map(({ icon: Icon, title, text }) => (
              <li key={title} className="reveal flex gap-4">
                <span className="w-10 h-10 rounded-xl bg-surface border-2 border-ink text-accent flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" aria-hidden />
                </span>
                <div>
                  <h3 className="font-semibold text-ink">{title}</h3>
                  <p className="text-ink-soft mt-0.5">{text}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3 mt-10 reveal">
            <a href="/demo?tab=inspections" className={buttonClass('primary', 'lg')}>
              See a sample inspection
            </a>
            <a href="/demo#dossier" className={buttonClass('secondary', 'lg')}>
              Open a sample dossier
            </a>
          </div>
        </div>

        {/* A phone showing the dashboard; its plan draws itself when it comes into view. */}
        <div ref={phoneRef} className="reveal mx-auto w-[290px] sm:w-[320px]">
          <div className="relative rounded-[2.6rem] border-[10px] border-ink bg-surface shadow-print overflow-hidden">
            <div className="absolute left-1/2 top-2 -translate-x-1/2 w-24 h-6 rounded-full bg-ink z-10" aria-hidden />
            <div className="px-4 pt-11 pb-5 space-y-3">
              <div className="flex items-center justify-between">
                <Wordmark size="sm" />
                <StatusBadge status="ALL_CLEAR" />
              </div>
              <div>
                <div className="eyebrow">Mamidipally · Telangana</div>
                <div className="font-display font-semibold text-xl leading-tight text-ink mt-1">Sample plot, Sy. No. 412/A</div>
              </div>
              <div className="rounded-xl overflow-hidden border border-line">
                {inView ? (
                  <SurveyPlate location={ILLUSTRATION} surveyNumber="Sy. No. 412/A" animate watch />
                ) : (
                  <div className="aspect-[4/3] bg-surface" />
                )}
              </div>
              <ul className="text-small space-y-2">
                <PhoneRow on={inView} at={900} text="Boundary walked 3 days ago" />
                <PhoneRow on={inView} at={1050} text="Land record checked today" />
                <PhoneRow on={inView} at={1200} text="Court caveat active" />
              </ul>
            </div>
          </div>
          <p className="text-small text-muted text-center mt-4">Sample data</p>
        </div>
      </div>
    </section>
  );
}

function PhoneRow({ on, at, text }: { on: boolean; at: number; text: string }) {
  return (
    <li className={`flex items-center gap-2 ${on ? 'fade-up' : 'opacity-0'}`} style={delay(at)}>
      <Check className="w-4 h-4 text-ok shrink-0" aria-hidden />
      <span className="text-ink">{text}</span>
    </li>
  );
}

/* ---------------------------------------------------------------------------------------- */

function Steps() {
  return (
    <section className="bg-surface border-y-2 border-ink">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
        <SectionHeading eyebrow="Getting started" title="From a short form to a watched plot." />
        <ol className="relative mt-14 grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6">
          <div aria-hidden className="absolute left-6 right-[calc(25%-1.5rem)] top-[23px] h-[3px] rounded-full bg-ink hidden md:block scroll-grow-x" />
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative reveal flex md:block gap-4">
              <span className="relative w-12 h-12 rounded-full bg-accent text-surface font-display font-bold text-xl flex items-center justify-center border-2 border-ink shrink-0">
                {index + 1}
              </span>
              <div>
                <h3 className="font-display font-semibold text-heading text-ink md:mt-5">{step.title}</h3>
                <p className="text-ink-soft mt-1.5">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------------------- */

function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-16 relative overflow-hidden bg-mustard">
      <TerrainLines className="absolute inset-0 w-full h-full" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
        <SectionHeading eyebrow="Pricing" title="One monthly price per plot.">
          The camera is included in the monthly price. If your plot needs court work beyond the caveat, your advocate quotes it
          first.
        </SectionHeading>

        {/* A ticket: the price on the stub, what's included on the body. */}
        <div className="reveal flex flex-col sm:flex-row rounded-card border-2 border-ink bg-surface shadow-print">
          <div className="relative bg-accent text-surface p-6 sm:p-8 sm:w-60 shrink-0 flex flex-col justify-between gap-6 rounded-t-[calc(var(--radius-card)-2px)] sm:rounded-tr-none sm:rounded-l-[calc(var(--radius-card)-2px)]">
            <div className="eyebrow text-marigold">Monthly plan</div>
            <div>
              <div className="font-display font-bold text-display leading-none">{PRICE}</div>
              <div className="text-surface/90 mt-2">per plot, per month</div>
            </div>
            {/* Perforation notches */}
            <span aria-hidden className="hidden sm:block absolute -right-3.5 -top-3.5 w-7 h-7 rounded-full bg-mustard border-2 border-ink" />
            <span aria-hidden className="hidden sm:block absolute -right-3.5 -bottom-3.5 w-7 h-7 rounded-full bg-mustard border-2 border-ink" />
          </div>
          <div className="flex-1 p-6 sm:p-8 border-t-2 sm:border-t-0 sm:border-l-2 border-dashed border-ink">
            <ul className="space-y-3">
              {INCLUDED.map((item) => (
                <li key={item} className="flex gap-3 text-ink-soft">
                  <span className="w-5 h-5 rounded-full bg-ok-soft text-ok flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" aria-hidden />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <a href="#book" className={buttonClass('brand', 'lg', 'w-full mt-8')}>
              Book a free plot check
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------------------- */

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="scroll-mt-16 bg-paper">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
        <SectionHeading eyebrow="Questions" title="What owners ask us." />
        <div className="mt-10 space-y-3">
          {FAQS.map((faq, index) => {
            const expanded = open === index;
            const id = `faq-${index}`;
            return (
              <div
                key={faq.q}
                className={`reveal rounded-card border-2 border-ink bg-surface transition-shadow duration-300 ${expanded ? 'shadow-print' : ''}`}
              >
                <h3>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={id}
                    onClick={() => setOpen(expanded ? null : index)}
                    className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 font-semibold text-ink cursor-pointer"
                  >
                    {faq.q}
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        expanded ? 'bg-accent text-surface' : 'bg-sunken text-ink'
                      }`}
                    >
                      {expanded ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </span>
                  </button>
                </h3>
                {/* The grid row animates between no height and the answer's height. */}
                <div
                  id={id}
                  role="region"
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  <div className="overflow-hidden">
                    <p className="text-ink-soft px-5 pb-5 max-w-2xl">{faq.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------------------- */

function Book({ sectionRef, contact }: { sectionRef: RefObject<HTMLElement | null>; contact: ContactInfo }) {
  const whatsappLink = contact.whatsapp
    ? `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent('Hello Paridhi, I would like a plot check.')}`
    : null;
  return (
    <section id="book" ref={sectionRef} className="scroll-mt-16 relative overflow-hidden bg-accent border-t-2 border-ink">
      <LogoMark className="absolute -left-24 -top-24 h-[40rem] w-auto opacity-25" color="var(--color-marigold)" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-12 items-start">
        <div>
          <SectionHeading eyebrow="Free plot check" title="Tell us where your plot is." light>
            We'll look up its land record on the state portal and get back to you with what we find, and what protecting it
            would involve. There's no charge and no obligation.
          </SectionHeading>
          <ul className="mt-8 space-y-3 text-surface reveal">
            <li className="flex gap-3">
              <ShieldCheck className="w-5 h-5 text-marigold shrink-0" aria-hidden />
              We only use your details to reply to you.
            </li>
            <li className="flex gap-3">
              <MessageCircle className="w-5 h-5 text-marigold shrink-0" aria-hidden />
              We reply by email, or on WhatsApp if you'd rather.
            </li>
          </ul>
          {(whatsappLink || contact.email) && (
            <div className="mt-8 flex flex-wrap gap-3 reveal">
              {whatsappLink && (
                <a href={whatsappLink} target="_blank" rel="noreferrer" className={buttonClass('secondary', 'lg')}>
                  <MessageCircle className="w-4 h-4" />
                  Message us on WhatsApp
                </a>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`} className={buttonClass('ghost', 'lg', 'text-surface hover:text-ink')}>
                  <Mail className="w-4 h-4" />
                  {contact.email}
                </a>
              )}
            </div>
          )}
        </div>
        <div className="reveal rounded-card border-2 border-ink bg-surface shadow-print p-5 sm:p-8">
          <PlotRequestForm
            mode="website"
            submitLabel="Book my free plot check"
            doneTitle="Thank you. We've got your request."
            doneMessage="We'll get back to you by email. If you gave a WhatsApp number, we may message you there."
            onSubmit={async (input) => {
              await api.sendPlotRequest(input);
            }}
          />
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------------------- */

function Footer() {
  return (
    <footer className="relative overflow-hidden bg-mustard border-t-2 border-ink pb-24 md:pb-0">
      <TerrainLines className="absolute inset-0 w-full h-full" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div>
            <Wordmark size="xl" />
            <p className="font-deva text-accent text-xl mt-5" lang="hi">
              परिधि <span className="font-sans text-small text-muted">· the boundary around a place</span>
            </p>
            <p className="text-ink-soft mt-4 max-w-sm">
              Protecting land in India for owners abroad. Not legal advice: caveats and objections are filed by your advocate.
            </p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-2.5 text-sm">
            <a href="#how" className="text-ink-soft hover:text-ink">
              How it works
            </a>
            <a href="/demo" className="text-ink-soft hover:text-ink">
              Live demo
            </a>
            <a href="#pricing" className="text-ink-soft hover:text-ink">
              Pricing
            </a>
            <a href="/app" className="text-ink-soft hover:text-ink">
              Sign in
            </a>
            <a href="#faq" className="text-ink-soft hover:text-ink">
              Questions
            </a>
            <a href="/api/evidence/public-key" className="text-ink-soft hover:text-ink">
              Signing key
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

/* ---------------------------------------------------------------------------------------- */

/** On phones: a bar to book, shown once the hero has scrolled away and hidden at the form. */
function MobileCta({ heroRef, bookRef }: { heroRef: RefObject<HTMLElement | null>; bookRef: RefObject<HTMLElement | null> }) {
  // Starts hidden: the page opens on the hero.
  const heroVisible = useInView(heroRef, { once: false, rootMargin: '0px', initial: true });
  const bookVisible = useInView(bookRef, { once: false, rootMargin: '0px' });
  const show = !heroVisible && !bookVisible;
  return (
    <div
      className={`md:hidden fixed inset-x-3 bottom-3 z-40 transition-all duration-300 ease-out ${
        show ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'
      }`}
      aria-hidden={!show}
    >
      <div className="flex items-center gap-2 rounded-2xl border-2 border-ink bg-surface p-2 shadow-pop">
        <a href="/demo" tabIndex={show ? 0 : -1} className={buttonClass('ghost', 'lg', 'px-4')}>
          Demo
        </a>
        <a href="#book" tabIndex={show ? 0 : -1} className={buttonClass('brand', 'lg', 'flex-1')}>
          Book a free plot check
        </a>
      </div>
    </div>
  );
}
