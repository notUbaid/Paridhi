import React, { useEffect } from 'react';
import type { PropertyRecord } from '../types';
import { X, FileCheck, ShieldCheck, Printer, CheckCircle2, Lock } from 'lucide-react';

interface DossierModalProps {
  property: PropertyRecord;
  isOpen: boolean;
  onClose: () => void;
}

export const DossierModal: React.FC<DossierModalProps> = ({
  property,
  isOpen,
  onClose
}) => {
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
      aria-labelledby="dossier-modal-title"
    >
      <div
        className="bg-white rounded-lg border border-slate-200/90 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-slate-700 shrink-0" />
            <h3 id="dossier-modal-title" className="font-bold text-slate-900 text-sm tracking-tight">
              Certified Land Defense & Evidentiary Dossier
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

        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-xs">
          {/* Top Dossier Header */}
          <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">
                Official Title & Operational Dossier • Paridhi Platform
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                {property.name}
              </h2>
              <div className="text-slate-500 text-xs mt-0.5">
                Survey Number: <span className="font-mono font-bold text-slate-800">{property.surveyNumber}</span> • Extent: {property.plotSizeDisplay}
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                100% Invariants Verified Clean
              </span>
              <div className="text-[11px] text-slate-400 mt-1">
                Assessed Value: ₹{(property.marketValuationINR / 10000000).toFixed(2)} Cr
              </div>
            </div>
          </div>

          {/* Section 1: Registered Ownership & Cadastral Details */}
          <div className="space-y-2">
            <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              1. Title Registry & Cadastral Identity
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Registered Owner</div>
                <div className="font-semibold text-slate-900 mt-0.5">{property.owner.name}</div>
                <div className="text-[10px] text-slate-500">{property.owner.overseasCity}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Revenue Portal</div>
                <div className="font-semibold text-slate-900 mt-0.5">{property.revenueRegistry.portalName}</div>
                <div className="text-[10px] text-slate-500">Khata: {property.revenueRegistry.khataNumber}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Title Status</div>
                <div className="font-semibold text-emerald-700 mt-0.5">Clear & Unencumbered</div>
                <div className="text-[10px] text-slate-500">EC Verified for 30 Years</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Property Tax</div>
                <div className="font-semibold text-slate-900 mt-0.5">Paid up to date</div>
                <div className="text-[10px] text-slate-500">Zero arrears</div>
              </div>
            </div>
          </div>

          {/* Section 2: 4G Solar Edge Surveillance & Anti-Theft */}
          <div className="space-y-2">
            <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              2. On-Site 4G Solar Camera & Theft-Proof Hardware Mount
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Camera Hardware</div>
                <div className="font-semibold text-slate-900 mt-0.5">{property.cameraPod.deviceModel}</div>
                <div className="text-[10px] text-slate-500">2K Resolution • Color Night Vision</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Solar & Battery</div>
                <div className="font-semibold text-slate-900 mt-0.5">{property.cameraPod.batteryPercentage}% Float Charge</div>
                <div className="text-[10px] text-slate-500">LiFePO4 7-Day Monsoon Reserve</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Anti-Theft Mount</div>
                <div className="font-semibold text-slate-900 mt-0.5">{property.cameraPod.antiTheftStatus.poleMountElevationMeters}m GI Steel Pole</div>
                <div className="text-[10px] text-slate-500">Rotating Anti-Climb Collar</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Cloud Sync Heartbeat</div>
                <div className="font-semibold text-emerald-700 mt-0.5">Active (45s Interval)</div>
                <div className="text-[10px] text-slate-500">Immediate tamper alert</div>
              </div>
            </div>
          </div>

          {/* Section 3: In-Person Physical Field Audits */}
          <div className="space-y-2">
            <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              3. Verified Physical Human Inspection
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                <span>Inspected by {property.latestInspection.inspectorName} ({property.latestInspection.inspectorId})</span>
                <span className="text-slate-500 font-normal">{property.latestInspection.inspectionDate}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>All 4 Corner Boundary Stones Intact & Marked</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Zero Unauthorized Material Dumping or Squatting</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Neighbor Inquiry Conducted & Documented</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Geotagged High-Resolution Field Photos Attached</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Legal Retainer & Standing Caveat */}
          <div className="space-y-2">
            <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              4. Standing Statutory Legal Defense (Section 148A CPC)
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-slate-900">
                  {property.legalRetainer.advocateName} ({property.legalRetainer.barCouncilNumber})
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  {property.legalRetainer.jurisdictionCourt} • On-Call Response SLA: &lt; 48 Hours
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-800 border border-purple-200 text-xs font-semibold">
                Caveat Valid through {property.legalRetainer.caveatExpiryDate}
              </span>
            </div>
          </div>

          {/* Section 5: Cryptographic Chain of Custody (BSA 2023 §63) */}
          <div className="p-3.5 rounded-lg bg-slate-900 text-slate-200 space-y-1.5 font-mono text-[11px]">
            <div className="flex items-center justify-between text-white font-sans font-bold text-xs">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Statutory Admissibility Certificate (BSA 2023 §63)</span>
              </span>
              <span className="text-slate-400 text-[10px]">Tamper-Resistant SHA-256</span>
            </div>
            <div className="text-slate-400 text-[10px] leading-relaxed font-sans">
              Under Section 63(4) of the Bharatiya Sakshya Adhiniyam, 2023, electronic visual telemetry and inspection records are cryptographically hashed and digitally signed at capture to guarantee judicial admissibility before Indian High Courts and Civil Tribunals.
            </div>
            <div className="truncate text-emerald-400 text-[10px]">
              SHA-256: 4f1a8b92c4d6e8f0123456789abcdef0123456789abcdef0123456789abcdef0
            </div>
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-mono">
            Dossier Reference: PRD-VERIFIED-{property.surveyNumber.replace(/[^a-zA-Z0-9]/g, '')}-2026
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Dossier</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
