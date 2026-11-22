import React from 'react';
import type { PropertyRecord } from '../types';
import { X, Scale, CheckCircle2, Printer } from 'lucide-react';

interface LegalCaveatModalProps {
  property: PropertyRecord;
  isOpen: boolean;
  onClose: () => void;
}

export const LegalCaveatModal: React.FC<LegalCaveatModalProps> = ({
  property,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-sm">
              Section 148A CPC Statutory Caveat Petition
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 font-serif text-slate-800 text-xs leading-relaxed bg-[#fdfdfd]">
          <div className="text-center border-b border-slate-200 pb-4 not-italic">
            <div className="font-bold uppercase tracking-wider text-slate-900 text-sm font-sans">
              In the Court of the Senior Civil Judge / Tahsildar & Sub-Registrar
            </div>
            <div className="text-slate-600 font-sans mt-0.5">
              At {property.location.mandalTaluk}, {property.location.district}, {property.location.state}
            </div>
            <div className="font-mono text-slate-500 font-sans text-[11px] mt-1">
              Caveat Petition No. CP-{property.surveyNumber.replace(/[^a-zA-Z0-9]/g, '')}-2026 under Section 148A of the Code of Civil Procedure, 1908
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="font-sans font-bold">CAVEATOR:</span>{' '}
              <span className="font-bold">{property.owner.name}</span>, Residing at {property.owner.overseasCity}, {property.owner.overseasCountry}. Represented through duly appointed Advocate on Record: <strong>{property.legalRetainer.advocateName}</strong> (Enrollment No. {property.legalRetainer.barCouncilNumber}).
            </div>

            <div className="text-center font-sans font-bold py-1">
              — VERSUS —
            </div>

            <div>
              <span className="font-sans font-bold">ANY UNKNOWN PERSONS / INTENDING ENCROACHERS:</span>{' '}
              Any third party, builder, or prospective applicant seeking ex-parte title mutation, patta transfer, boundary amendment, or interim stay in respect of the Schedule Property.
            </div>

            <div className="pt-2 font-sans font-bold uppercase tracking-wide border-t border-slate-200 text-slate-900">
              Petition for Caveat under Section 148A, C.P.C.
            </div>

            <p>
              1. The Caveator is the sole, absolute, and unencumbered registered owner and title holder of the agricultural/commercial land bearing <strong>{property.surveyNumber}</strong>, admeasuring {property.plotSizeDisplay}, situated at Village {property.location.village}, Mandal {property.location.mandalTaluk}, District {property.location.district}, State of {property.location.state} (hereinafter referred to as the <em>"Schedule Property"</em>).
            </p>

            <p>
              2. The Caveator has reason to apprehend that certain unscrupulous local land-grabbing elements or unauthorized third parties may institute frivolous suits, applications, or mutation requests seeking an ex-parte interim injunction, boundary alteration, or fraudulent revenue entry without due notice.
            </p>

            <p>
              3. The Caveator respectfully submits that no adverse order, ex-parte injunction, revenue mutation, or administrative record alteration be granted or passed in respect of the Schedule Property without serving a formal statutory notice upon the Caveator's counsel.
            </p>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-sans not-italic text-[11px] space-y-1">
              <div className="font-semibold text-slate-900">Schedule of Property:</div>
              <div>• Survey / Khasra Number: {property.surveyNumber}</div>
              <div>• Total Extent: {property.plotSizeDisplay}</div>
              <div>• Khata Number: {property.revenueRegistry.khataNumber}</div>
              <div>• Registered Pattadar: {property.revenueRegistry.pattadarName}</div>
              <div>• Boundaries: North: Approach Road; South: Sy 413; East: Canal Feeder; West: Sy 411</div>
            </div>
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Standing Caveat Active until {property.legalRetainer.caveatExpiryDate}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Draft</span>
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
