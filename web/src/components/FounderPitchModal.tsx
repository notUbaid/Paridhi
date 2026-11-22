import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Shield,
  Cpu,
  Scale,
  Building,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface FounderPitchModalProps {
  onClose: () => void;
}

export const FounderPitchModal: React.FC<FounderPitchModalProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const pitchSteps = [
    {
      id: 'problem',
      title: '1. The Problem: $1.2 Trillion Diaspora Anxiety',
      subtitle: 'Why 32 Million Overseas Indians Live with Permanent Fear',
      icon: AlertTriangle,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 leading-relaxed">
            Non-Resident Indians (NRIs) hold over <strong className="text-white">$1.2 Trillion</strong> in ancestral and investment property across India—68% in vacant plotted land. Being 8,000 miles away with a 12-hour timezone gap creates severe vulnerability:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-amber-400 font-bold">The Infrastructure Paradox</div>
              <p className="text-slate-400 mt-1">Empty plots have no electricity, no Wi-Fi, and no walls. Standard consumer cameras (Ring, Nest, CP Plus) are non-viable.</p>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-red-400 font-bold">The 20-Year Judicial Trap</div>
              <p className="text-slate-400 mt-1">Under Section 6 of Specific Relief Act, once squatters occupy land for weeks, police declare it a "civil dispute". Litigation takes 14–22 years.</p>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-purple-400 font-bold">Boundary Creep Strategy</div>
              <p className="text-slate-400 mt-1">Encroachers don't storm in overnight; they dump bricks, shift boundary pegs by 6 inches, or install temporary shrines.</p>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-cyan-400 font-bold">The Evidentiary Failure</div>
              <p className="text-slate-400 mt-1">Ordinary CCTV footage is rejected under BSA 2023 Section 63 without hardware-attested cryptographic custody.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'hardware',
      title: '2. The Sentinel Node: Off-Grid Hardware Marvel',
      subtitle: 'Zero Infrastructure Required • 30+ Days Monsoon Battery Autonomy',
      icon: Cpu,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 leading-relaxed">
            Paridhi deploys the <strong className="text-white">Model PRD-SENTINEL-X1</strong>, an industrial off-grid perimeter computer:
          </p>
          <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-lg font-bold text-cyan-300 font-mono">25W</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Bifacial Monocrystalline PV</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-lg font-bold text-emerald-300 font-mono">30+ Days</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Zero-Sunlight LiFePO4 Reserve</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-lg font-bold text-purple-300 font-mono">Dual eSIM</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Airtel + Jio 4G/LTE Failover</div>
            </div>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
            <div className="font-semibold text-slate-100">Multi-Modal Sensory Array:</div>
            <p>• Dual Sony STARVIS 2 4K Sensors (0.001 lux ultra-low light color vision)</p>
            <p>• 24GHz FMCW Doppler Radar (40m human motion through dense foliage)</p>
            <p>• 6-Axis IMU Accelerometer detecting pole climb, tilt, and physical impact shock</p>
          </div>
        </div>
      )
    },
    {
      id: 'ai',
      title: '3. Edge AI: Indian Encroachment Taxonomy',
      subtitle: 'YOLOv11-nano On-Device Neural Detection with Planar Homography',
      icon: Shield,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 leading-relaxed">
            Generic AI models look for dogs and cups. Paridhi runs neural models trained specifically on the <strong className="text-white">Indian land-grabbing playbook</strong>:
          </p>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="font-mono text-amber-300 font-semibold">MATERIAL_DUMPING</span>
              <span className="text-slate-400">Classifies red clay bricks, river sand piles, and cement bags within 30 seconds</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="font-mono text-red-300 font-semibold">EARTHMOVER_ACTIVITY</span>
              <span className="text-slate-400">Detects JCB 3DX excavators leveling adjacent boundaries or digging trenches</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="font-mono text-rose-300 font-semibold">SQUATTER_STRUCTURE</span>
              <span className="text-slate-400">Flags tin-sheet roofs, bamboo scaffolding, or makeshift shrines instantly</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="font-mono text-cyan-300 font-semibold">HOMOGRAPHY TRIPWIRE</span>
              <span className="text-slate-400">Projects official cadastral survey boundary pegs onto camera plane with 5cm precision</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'bsa2023',
      title: '4. Legal Moat: BSA 2023 §63 Cryptographic Vault',
      subtitle: 'The First Court-Admissible Electronic Evidence Engine in India',
      icon: Scale,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 leading-relaxed">
            Under India's new <strong className="text-white">Bharatiya Sakshya Adhiniyam, 2023</strong> (replacing the Evidence Act 1872), Section 63 mandates contemporaneous statutory certificates:
          </p>
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-purple-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              Hardware-Rooted SHA-256 Frame Hashing on ATECC608A HSM
            </div>
            <div className="flex items-center gap-2 text-purple-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              Ed25519 Device Key Signature + NavIC Atomic Time Lock
            </div>
            <div className="flex items-center gap-2 text-purple-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              Immutable Merkle DAG with RFC 3161 Qualified Timestamp
            </div>
          </div>
          <p className="text-xs text-slate-400">
            <strong>Outcome:</strong> In 1 click, the owner generates a court-ready High Court affidavit (Order 39 CPC) signed with Class 3 DSC, securing immediate interim injunction before squatters unpack.
          </p>
        </div>
      )
    },
    {
      id: 'radar',
      title: '5. Cadastral Revenue Registry Radar',
      subtitle: 'Stopping Land Theft in the Tehsildar Office Before Fences Break',
      icon: Building,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 leading-relaxed">
            Land theft frequently occurs through fraudulent mutation applications filed collusively with local Patwaris.
          </p>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
            <div className="font-semibold text-slate-100">Continuous State Land Records Polling:</div>
            <p>• <strong>Telangana:</strong> Dharani Mutation & Passbook Status</p>
            <p>• <strong>Karnataka:</strong> Bhoomi RTC & Kaveri 2.0</p>
            <p>• <strong>Punjab & Haryana:</strong> Jamabandi Fard Registry</p>
            <p>• <strong>Maharashtra / UP / Gujarat:</strong> Mahabhumi, Bhulekh, AnyRoR</p>
          </div>
          <div className="p-3 bg-red-950/20 border border-red-500/40 rounded-xl text-xs text-slate-300">
            <strong className="text-red-300">Automated Section 148A CPC Caveat:</strong> When a bogus mutation is detected, Paridhi auto-generates a statutory caveat served on the Tahsildar, legally blocking title transfer within the 30-day window.
          </div>
        </div>
      )
    },
    {
      id: 'marshal',
      title: '6. Tactical Escrow: Ground Marshal Network',
      subtitle: 'Guaranteed < 60-Minute SLA Physical Response with Live Bodycam',
      icon: Users,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 leading-relaxed">
            Detection without physical response is just digital anxiety. Paridhi partners with licensed, bonded private security networks (PSARA certified):
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-emerald-400 font-bold">&lt; 60-Minute Physical SLA</div>
              <p className="text-slate-400 mt-1">Ex-military responders (Indian Army veterans) dispatched with guaranteed arrival times.</p>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-cyan-400 font-bold">Live 4G Bodycam Stream</div>
              <p className="text-slate-400 mt-1">NRI owners watch live video from San Jose, London, or Dubai directly on their dashboard.</p>
            </div>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
            <strong>Active Edge Deterrence:</strong> 110dB Directional Horn fires localized warnings in regional languages (Telugu, Punjabi, Hindi, Kannada) warning intruders of immediate police arrest.
          </div>
        </div>
      )
    },
    {
      id: 'financials',
      title: '7. Unit Economics & The $4.8B Market Moat',
      subtitle: 'Target Itch Score: 85.8 | TAM Score: 70 | Whitespace: 7 | Severity: 7',
      icon: TrendingUp,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-center text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-base font-bold text-emerald-400 font-mono">$4.8B</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Immediate TAM</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-base font-bold text-cyan-400 font-mono">$231</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Hardware BOM</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-base font-bold text-purple-400 font-mono">84%</div>
              <div className="text-[10px] text-slate-400 mt-0.5">SaaS Gross Margin</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-base font-bold text-amber-400 font-mono">&gt; 8.5x</div>
              <div className="text-[10px] text-slate-400 mt-0.5">LTV / CAC Ratio</div>
            </div>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
            <div className="font-semibold text-slate-100">Defensibility Moats:</div>
            <p>1. <strong>Hardware-Software Coupling:</strong> Low-power solar microgrid is hard for software-only startups to copy.</p>
            <p>2. <strong>Judicial Precedent:</strong> BSA 2023 §63 cryptographic custody creates 98%+ annual customer retention.</p>
            <p>3. <strong>High Stakes Willingness to Pay:</strong> Property owners willingly pay $79–$149/mo to protect $200k–$2M assets.</p>
          </div>
        </div>
      )
    }
  ];

  const step = pitchSteps[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0b1019] border border-slate-700/80 rounded-2xl w-full max-w-3xl overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg border ${step.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  FOUNDER PITCH DECK
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Stage {currentStep + 1} of {pitchSteps.length}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-100 mt-0.5">{step.title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div className="px-6 pt-3 flex items-center gap-1.5">
          {pitchSteps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                  : idx < currentStep
                  ? 'bg-slate-700'
                  : 'bg-slate-900'
              }`}
            />
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 text-sm">{step.content}</div>

        {/* Footer Navigation Controls */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-mono transition-colors ${
              currentStep === 0
                ? 'opacity-40 cursor-not-allowed border-slate-800 text-slate-600'
                : 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="text-[11px] font-mono text-slate-500">
            PARIDHI • Diaspora Land Defense Architecture
          </div>

          {currentStep < pitchSteps.length - 1 ? (
            <button
              onClick={() => setCurrentStep((prev) => Math.min(pitchSteps.length - 1, prev + 1))}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs font-mono font-semibold shadow-lg shadow-cyan-950/40 transition-colors"
            >
              <span>Next Stage</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-semibold shadow-lg shadow-emerald-950/40 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore Live Console</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
