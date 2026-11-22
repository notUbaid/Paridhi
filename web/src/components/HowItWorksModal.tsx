import React, { useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Camera,
  UserCheck,
  Landmark,
  Scale,
  Lock
} from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="how-it-works-title"
    >
      <div
        className="bg-white rounded-lg border border-slate-200/90 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-700 shrink-0" />
            <h3 id="how-it-works-title" className="font-bold text-slate-900 text-sm tracking-tight">
              Paridhi Operational Architecture & Defense Model
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-xs leading-relaxed">
          {/* Section: The Reality of Indian Plotted Land */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span>The Problem: Why Conventional Security Fails on Vacant Plots</span>
            </h4>
            <p className="text-slate-600">
              Over 68% of NRI real estate holdings in India are vacant plots. Standard security cameras (Ring, Nest, CP Plus) require mains 230V electricity and broadband Wi-Fi—neither of which exists on an empty plot in Shamshabad, Devanahalli, or Mohali.
            </p>
            <p className="text-slate-600">
              Meanwhile, land grabbers exploit the 8,000-mile timezone gap. They don't invade overnight; they dump a pile of bricks, shift boundary pegs by 1 foot, or collude with corrupt village revenue clerks to apply for a fraudulent title transfer while the owner is overseas. Once physical possession is taken, civil court eviction in India takes an average of <strong>15 to 22 years</strong>.
            </p>
          </div>

          {/* 4 Pillars of Paridhi's Hybrid Solution */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3">
              Paridhi's 4-Tier Operational & Technology Stack
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Pillar 1 */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-1.5 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                  <span>1. 4G Solar COTS Edge Cameras</span>
                </div>
                <p className="text-slate-600">
                  We deploy commercial off-the-shelf (COTS) 4G Solar PTZ cameras (Hikvision, Dahua, Reolink, CP Plus) powered by 25W monocrystalline solar panels and 20Ah LiFePO4 batteries. Zero utility power or Wi-Fi needed. Delivers 7–10 days continuous power even in heavy monsoon rains.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-1.5 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <span>2. Monthly Human Field Audits</span>
                </div>
                <p className="text-slate-600">
                  Hardware alone cannot save land. Vetted local field inspectors physically visit your plot once a month, inspect all 4 corner boundary stones, interview adjacent landowners, and file a signed geotagged inspection report with high-res photos.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-1.5 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Landmark className="w-3.5 h-3.5" />
                  </div>
                  <span>3. State Revenue Registry Watch</span>
                </div>
                <p className="text-slate-600">
                  Automated daily queries against official state land portals (Telangana Dharani, Karnataka Bhoomi, Punjab Jamabandi) monitor your Survey Number and Khata. We instantly alert you if an unauthorized mutation or patta transfer application is filed.
                </p>
              </div>

              {/* Pillar 4 */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-1.5 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <div className="w-6 h-6 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Scale className="w-3.5 h-3.5" />
                  </div>
                  <span>4. On-Call Legal Caveat Protection</span>
                </div>
                <p className="text-slate-600">
                  Our network of empanelled High Court and Civil Court advocates files statutory Caveat Petitions under <strong>Section 148A of the Code of Civil Procedure (CPC)</strong> with the Tahsildar and Sub-Registrar, legally forbidding any registration or mutation without notice to you.
                </p>
              </div>
            </div>
          </div>

          {/* Theft Proof Engineering Breakdown */}
          <div className="border-t border-slate-200 pt-4 space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-700" />
              <span>Real-World Theft-Proof & Tamper Engineering</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-semibold text-slate-900 mb-0.5">4.8m High GI Pole</div>
                <div className="text-slate-600 text-[11px]">
                  Mounted 15+ feet high on heavy galvanized iron pole in concrete footing with rotating anti-climb sleeve.
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-semibold text-slate-900 mb-0.5">Instant Cloud Evidence</div>
                <div className="text-slate-600 text-[11px]">
                  Approach footage streams instantly over 4G LTE. Even if the pole is attacked, the intruder's face and vehicle are already saved in the cloud.
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-semibold text-slate-900 mb-0.5">Legal Warning Signage</div>
                <div className="text-slate-600 text-[11px]">
                  Bilingual reflective metal board at eye level warning of 24/7 cloud surveillance and non-bailable prosecution under Bharatiya Nyaya Sanhita.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Subscription: ₹4,999/mo ($60/mo) • Turnkey 4G Solar Pod + Monthly Field Inspections + Title Watch
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
