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
      content: (
        <div className="space-y-4">
          <p className="text-slate-700 leading-relaxed text-sm">
            Non-Resident Indians (NRIs) hold over <strong className="text-slate-900 font-semibold">$1.2 Trillion</strong> in ancestral and investment property across India—68% in vacant plotted land. Being 8,000 miles away with a 12-hour timezone gap creates severe vulnerability:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-slate-900 font-bold">The Infrastructure Paradox</div>
              <p className="text-slate-600 mt-1 leading-relaxed">Empty plots have no grid electricity, no Wi-Fi, and no boundary walls. Standard consumer cameras (Ring, Nest, CP Plus) are completely non-viable.</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-rose-800 font-bold">The 20-Year Judicial Trap</div>
              <p className="text-slate-600 mt-1 leading-relaxed">Under Section 6 of Specific Relief Act, once squatters occupy land for weeks, police declare it a "civil dispute". Civil litigation takes 14–22 years.</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-slate-900 font-bold">Boundary Creep Strategy</div>
              <p className="text-slate-600 mt-1 leading-relaxed">Encroachers do not storm in overnight; they dump bricks, shift boundary pegs by 6 inches, or install temporary shrines to anchor adverse possession.</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-slate-900 font-bold">The Evidentiary Failure</div>
              <p className="text-slate-600 mt-1 leading-relaxed">Ordinary CCTV footage is rejected under BSA 2023 Section 63 without contemporaneous, hardware-attested cryptographic chain of custody.</p>
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
      content: (
        <div className="space-y-4">
          <p className="text-slate-700 leading-relaxed text-sm">
            Paridhi deploys the <strong className="text-slate-900 font-semibold">Model PRD-SENTINEL-X1</strong>, an industrial off-grid perimeter defense computer designed specifically for Indian terrain:
          </p>
          <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-xl font-bold text-slate-900">25W</div>
              <div className="text-[10px] text-slate-500 mt-1">Bifacial Monocrystalline PV</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-xl font-bold text-emerald-700">30+ Days</div>
              <div className="text-[10px] text-slate-500 mt-1">Monsoon LiFePO4 Autonomy</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-xl font-bold text-slate-900">Dual eSIM</div>
              <div className="text-[10px] text-slate-500 mt-1">Airtel + Jio 4G Failover</div>
            </div>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1.5 leading-relaxed">
            <div className="font-semibold text-slate-900">Multi-Modal Industrial Sensory Array:</div>
            <p>• Dual Sony STARVIS 2 4K Sensors (0.001 lux ultra-low light night vision)</p>
            <p>• 24GHz FMCW Doppler Radar (40m human velocity tracking through dense monsoon foliage)</p>
            <p>• 6-Axis IMU Accelerometer detecting pole climb, tilt shifts, and high-g physical impact shock</p>
          </div>
        </div>
      )
    },
    {
      id: 'ai',
      title: '3. Edge AI: Indian Encroachment Taxonomy',
      subtitle: 'YOLOv11-nano On-Device Neural Detection with Planar Homography',
      icon: Shield,
      content: (
        <div className="space-y-4">
          <p className="text-slate-700 leading-relaxed text-sm">
            Generic AI models look for dogs and cars. Paridhi runs neural models trained specifically on the <strong className="text-slate-900 font-semibold">Indian land-grabbing playbook</strong>:
          </p>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <span className="font-mono text-slate-900 font-bold">MATERIAL_DUMPING</span>
              <span className="text-slate-600">Classifies red clay bricks, river sand piles, and cement bags within 30 seconds</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <span className="font-mono text-slate-900 font-bold">EARTHMOVER_ACTIVITY</span>
              <span className="text-slate-600">Detects JCB 3DX excavators leveling adjacent boundaries or digging trenches</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <span className="font-mono text-slate-900 font-bold">SQUATTER_STRUCTURE</span>
              <span className="text-slate-600">Flags tin-sheet roofs, bamboo scaffolding, or makeshift shrines instantly</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <span className="font-mono text-slate-900 font-bold">HOMOGRAPHY TRIPWIRE</span>
              <span className="text-slate-600">Projects official cadastral survey boundary pegs onto camera plane with 5cm precision</span>
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
      content: (
        <div className="space-y-4">
          <p className="text-slate-700 leading-relaxed text-sm">
            Under India's new <strong className="text-slate-900 font-semibold">Bharatiya Sakshya Adhiniyam, 2023</strong> (replacing the Evidence Act 1872), Section 63 mandates contemporaneous statutory certificates:
          </p>
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Hardware-Rooted SHA-256 Frame Hashing on ATECC608A HSM
            </div>
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Ed25519 Device Key Signature + NavIC Atomic Time Lock
            </div>
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Immutable Merkle DAG with RFC 3161 Qualified Timestamp
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-900">Judicial Outcome:</strong> In 1 click, the owner generates a court-ready High Court affidavit (Order 39 CPC) signed with Class 3 DSC, securing immediate interim injunction before squatters unpack.
          </p>
        </div>
      )
    },
    {
      id: 'radar',
      title: '5. Cadastral Revenue Registry Radar',
      subtitle: 'Stopping Land Theft in the Tehsildar Office Before Fences Break',
      icon: Building,
      content: (
        <div className="space-y-4">
          <p className="text-slate-700 leading-relaxed text-sm">
            Land theft frequently occurs through fraudulent mutation applications filed collusively with local Patwaris while the NRI owner is abroad.
          </p>
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1.5 leading-relaxed">
            <div className="font-semibold text-slate-900">Continuous State Land Records Polling:</div>
            <p>• <strong>Telangana:</strong> Dharani Mutation & Passbook Status</p>
            <p>• <strong>Karnataka:</strong> Bhoomi RTC & Kaveri 2.0</p>
            <p>• <strong>Punjab & Haryana:</strong> Jamabandi Fard Registry</p>
            <p>• <strong>Maharashtra / UP / Gujarat:</strong> Mahabhumi, Bhulekh, AnyRoR</p>
          </div>
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 leading-relaxed">
            <strong>Automated Section 148A CPC Caveat:</strong> When an unauthorized mutation is detected, Paridhi auto-generates a statutory caveat served on the Tahsildar, legally blocking title transfer within the 30-day window.
          </div>
        </div>
      )
    },
    {
      id: 'marshal',
      title: '6. Tactical Escrow: Ground Marshal Network',
      subtitle: 'Guaranteed < 60-Minute SLA Physical Response with Live Bodycam',
      icon: Users,
      content: (
        <div className="space-y-4">
          <p className="text-slate-700 leading-relaxed text-sm">
            Detection without physical response is just digital anxiety. Paridhi partners with licensed, bonded private security networks (PSARA certified):
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-slate-900 font-bold">&lt; 60-Minute Physical SLA</div>
              <p className="text-slate-600 mt-1 leading-relaxed">Ex-military tactical responders (Indian Army veterans) dispatched with guaranteed arrival times.</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-slate-900 font-bold">Live 4G Bodycam Stream</div>
              <p className="text-slate-600 mt-1 leading-relaxed">NRI owners watch live video from San Jose, London, or Dubai directly on their dashboard.</p>
            </div>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed">
            <strong className="text-slate-900">Active Edge Deterrence:</strong> 110dB Directional Horn fires localized warnings in regional languages (Telugu, Punjabi, Hindi, Kannada) warning intruders of immediate police arrest.
          </div>
        </div>
      )
    },
    {
      id: 'financials',
      title: '7. Unit Economics & The $4.8B Market Moat',
      subtitle: 'Target Itch Score: 85.8 | TAM Score: 70 | Whitespace: 7 | Severity: 7',
      icon: TrendingUp,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-center text-xs font-mono">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-base font-bold text-slate-900">$4.8B</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Immediate TAM</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-base font-bold text-slate-900">$231</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Hardware BOM</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-base font-bold text-emerald-700">84%</div>
              <div className="text-[10px] text-slate-500 mt-0.5">SaaS Gross Margin</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-base font-bold text-slate-900">&gt; 8.5x</div>
              <div className="text-[10px] text-slate-500 mt-0.5">LTV / CAC Ratio</div>
            </div>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1.5 leading-relaxed">
            <div className="font-semibold text-slate-900">Defensibility Moats:</div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-300 rounded-xl w-full max-w-3xl overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-white border border-slate-200 text-slate-800 shadow-2xs">
              <Icon className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  FOUNDER THESIS & ARCHITECTURE
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Stage {currentStep + 1} of {pitchSteps.length}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-0.5 tracking-tight">{step.title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div className="px-6 pt-3 flex items-center gap-1.5">
          {pitchSteps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-1 flex-1 rounded-full transition-all duration-200 cursor-pointer ${
                idx === currentStep
                  ? 'bg-slate-900'
                  : idx < currentStep
                  ? 'bg-slate-400'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 text-sm">{step.content}</div>

        {/* Footer Navigation Controls */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border text-xs font-mono transition-colors ${
              currentStep === 0
                ? 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400'
                : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer'
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
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <span>Next Stage</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore Live Workstation</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
