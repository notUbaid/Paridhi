import { useEffect, useState, type ReactNode } from 'react';
import {
  ArrowRight,
  Camera,
  Check,
  FileCheck,
  Landmark,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Scale,
  ShieldCheck,
  UserCheck,
  Users
} from 'lucide-react';
import type { ContactInfo } from '@shared/types';
import { api } from '../api';
import { PlotRequestForm } from '../components/PlotRequestForm';
import { ILLUSTRATION } from '../owner/illustration';
import { SurveyPlate } from '../owner/SurveyPlate';
import { StatusBadge } from '../ui/Badge';
import { buttonClass } from '../ui/Button';
import { Wordmark } from '../ui/Wordmark';

/*
 * The public website. Prices, coverage and promises here are business decisions: keep them in
 * step with what Paridhi actually offers.
 */
const PRICE = '₹4,999';
const STATES_COVERED = 'Telangana, Karnataka and Punjab';

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

export function Landing() {
  const [contact, setContact] = useState<ContactInfo>({ whatsapp: null, email: null });

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
        <Hero />
        <Problem />
        <Layers />
        <Report />
        <Pricing />
        <Faq />
        <Book contact={contact} />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="bg-paper/90 backdrop-blur-sm border-b border-line sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-6">
        <a href="/" aria-label="Paridhi home">
          <Wordmark />
        </a>
        <nav aria-label="Sections" className="hidden md:flex items-center gap-6 text-sm text-ink-soft">
          <a href="#how" className="hover:text-ink">
            How it works
          </a>
          <a href="#pricing" className="hover:text-ink">
            Pricing
          </a>
          <a href="#faq" className="hover:text-ink">
            Questions
          </a>
        </nav>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <a href="/app" className={buttonClass('ghost', 'sm')}>
            Sign in
          </a>
          <a href="/demo" className={buttonClass('secondary', 'sm')}>
            <span className="sm:hidden">Demo</span>
            <span className="hidden sm:inline">See the demo</span>
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16 sm:pt-20 sm:pb-24 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
      <div>
        <div className="eyebrow">For plot owners living outside India</div>
        <h1 className="font-display text-hero text-ink mt-4">Protect your plot in India while you live abroad.</h1>
        <p className="text-lg text-ink-soft mt-5 max-w-xl">
          Paridhi keeps watch over vacant land: a camera on the plot, a monthly inspection of every boundary peg, regular
          checks of the land record, and a local advocate on retainer. You see all of it from wherever you live.
        </p>
        <div className="flex flex-wrap gap-3 mt-8">
          <a href="#book" className={buttonClass('primary', 'md', 'h-11 px-5')}>
            Book a free plot check
          </a>
          <a href="/demo" className={buttonClass('secondary', 'md', 'h-11 px-5')}>
            See a live demo
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        <p className="text-small text-muted mt-6">
          {PRICE} a month per plot, camera included. Starting in {STATES_COVERED}.
        </p>
      </div>

      <figure>
        <div className="rounded-card overflow-hidden border border-line-strong shadow-card bg-surface">
          <SurveyPlate location={ILLUSTRATION} surveyNumber="Sy. No. 412/A" />
        </div>
        <div className="mt-4 rounded-card border border-line-strong bg-surface shadow-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="eyebrow">Today</div>
              <div className="font-display text-heading text-ink mt-1">All checks are clear</div>
            </div>
            <StatusBadge status="ALL_CLEAR" />
          </div>
          <ul className="mt-4 space-y-2.5 text-sm">
            <HeroRow icon={<Camera className="w-4 h-4" />} label="Camera" value="Photo 32 min ago" />
            <HeroRow icon={<UserCheck className="w-4 h-4" />} label="Inspection" value="4 of 4 pegs intact" />
            <HeroRow icon={<Landmark className="w-4 h-4" />} label="Land record" value="No new applications" />
            <HeroRow icon={<Scale className="w-4 h-4" />} label="Court caveat" value="In force" />
          </ul>
        </div>
        <figcaption className="text-small text-faint mt-3">A sample plot, drawn to scale from its corner pegs.</figcaption>
      </figure>
    </section>
  );
}

function HeroRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <li className="flex items-center gap-2.5">
      <span className="text-ok shrink-0">{icon}</span>
      <span className="text-muted">{label}</span>
      <span className="ml-auto text-ink">{value}</span>
    </li>
  );
}

function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="max-w-2xl">
      <div className="eyebrow">{eyebrow}</div>
      <h2 className="font-display text-display text-ink mt-3">{title}</h2>
      {children && <p className="text-lg text-ink-soft mt-4">{children}</p>}
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
    <section className="border-y border-line bg-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <SectionHeading eyebrow="The problem" title="Land is usually lost slowly, while the owner is far away." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {points.map((point, index) => (
            <div key={point.title} className="border-t-2 border-ink pt-5">
              <div className="font-mono text-small text-faint">0{index + 1}</div>
              <h3 className="font-display text-heading text-ink mt-2">{point.title}</h3>
              <p className="text-ink-soft mt-2">{point.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Layers() {
  return (
    <section id="how" className="scroll-mt-16 max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <SectionHeading eyebrow="How it works" title="Four layers of protection for one plot.">
        Each one covers a different way land is lost. Together they mean something is noticed in days, not years.
      </SectionHeading>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-12">
        {LAYERS.map(({ icon: Icon, title, text }, index) => (
          <div key={title} className="rounded-card border border-line-strong bg-surface shadow-card p-6">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-lg bg-accent-soft text-accent flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </span>
              <span className="font-mono text-small text-faint">Layer {index + 1}</span>
            </div>
            <h3 className="font-display text-heading text-ink mt-4">{title}</h3>
            <p className="text-ink-soft mt-2">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Report() {
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
    <section className="border-y border-line bg-sunken/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 items-start">
        <div>
          <SectionHeading eyebrow="What you see" title="Everything that was checked, in plain words.">
            Your dashboard says whether anything needs you, shows each inspection with its photos, and keeps a signed
            dossier ready for your advocate.
          </SectionHeading>
          <div className="flex flex-wrap gap-3 mt-8">
            <a href="/demo?tab=inspections" className={buttonClass('primary')}>
              See a sample inspection
            </a>
            <a href="/demo#dossier" className={buttonClass('secondary')}>
              Open a sample dossier
            </a>
          </div>
        </div>
        <ul className="space-y-4">
          {points.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4 rounded-card border border-line-strong bg-surface p-5">
              <Icon className="w-5 h-5 text-accent shrink-0 mt-0.5" aria-hidden />
              <div>
                <h3 className="font-medium text-ink">{title}</h3>
                <p className="text-ink-soft mt-1">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-16 max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <SectionHeading eyebrow="Pricing" title="One monthly price per plot.">
        The camera is included in the monthly price. If your plot needs court work beyond the caveat, your advocate quotes it first.
      </SectionHeading>
      <div className="rounded-card border border-line-strong bg-surface shadow-card p-6 sm:p-8">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-display text-ink">{PRICE}</span>
          <span className="text-muted">per plot, per month</span>
        </div>
        <ul className="mt-6 space-y-3">
          {INCLUDED.map((item) => (
            <li key={item} className="flex gap-3 text-ink-soft">
              <Check className="w-5 h-5 text-ok shrink-0" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
        <a href="#book" className={buttonClass('primary', 'md', 'w-full h-11 mt-8')}>
          Book a free plot check
        </a>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" className="scroll-mt-16 border-t border-line bg-surface">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <SectionHeading eyebrow="Questions" title="What owners ask us." />
        <div className="mt-10 divide-y divide-line border-y border-line">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group py-5">
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-medium text-ink [&::-webkit-details-marker]:hidden">
                {faq.q}
                <span aria-hidden className="text-muted text-xl leading-none transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="text-ink-soft mt-3 max-w-2xl">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Book({ contact }: { contact: ContactInfo }) {
  const whatsappLink = contact.whatsapp
    ? `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent('Hello Paridhi, I would like a plot check.')}`
    : null;
  return (
    <section id="book" className="scroll-mt-16 border-t border-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 items-start">
        <div>
          <SectionHeading eyebrow="Free plot check" title="Tell us where your plot is.">
            We'll look up its land record on the state portal and get back to you with what we find, and what protecting it
            would involve. There's no charge and no obligation.
          </SectionHeading>
          <ul className="mt-8 space-y-3 text-ink-soft">
            <li className="flex gap-3">
              <ShieldCheck className="w-5 h-5 text-accent shrink-0" aria-hidden />
              We only use your details to reply to you.
            </li>
            <li className="flex gap-3">
              <Users className="w-5 h-5 text-accent shrink-0" aria-hidden />
              We reply by email, or on WhatsApp if you'd rather.
            </li>
          </ul>
          {(whatsappLink || contact.email) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {whatsappLink && (
                <a href={whatsappLink} target="_blank" rel="noreferrer" className={buttonClass('secondary')}>
                  <MessageCircle className="w-4 h-4" />
                  Message us on WhatsApp
                </a>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`} className={buttonClass('ghost')}>
                  <Mail className="w-4 h-4" />
                  {contact.email}
                </a>
              )}
            </div>
          )}
        </div>
        <div className="rounded-card border border-line-strong bg-surface shadow-card p-5 sm:p-8">
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

function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row md:items-start justify-between gap-8">
        <div className="max-w-sm">
          <Wordmark />
          <p className="text-small text-muted mt-3">
            Protecting land in India for owners abroad. Not legal advice: caveats and objections are filed by your advocate.
          </p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
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
    </footer>
  );
}
