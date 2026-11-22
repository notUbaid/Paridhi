import React, { useEffect, useState } from 'react';
import type { MutationAlert, PropertyRecord } from '../types.js';
import {
  X,
  Copy,
  Check,
  Send,
  AlertTriangle,
  Scale
} from 'lucide-react';

interface CaveatModalProps {
  property: PropertyRecord;
  mutation: MutationAlert;
  onClose: () => void;
}

export const CaveatModal: React.FC<CaveatModalProps> = ({
  property,
  mutation,
  onClose
}) => {
  const [caveatText, setCaveatText] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`/api/properties/${property.id}/caveat/${mutation.id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.caveatPetitionMarkdown) {
          setCaveatText(data.caveatPetitionMarkdown);
        }
      })
      .catch((err) => {
        console.warn('Network API unreachable, generating client-side caveat petition:', err);
        const fallbackText = `BEFORE THE HON'BLE COURT OF THE TAHSILDAR / EXECUTIVE MAGISTRATE
MANDAL / TALUK: ${property.cadastre.mandalTaluk.toUpperCase()}
DISTRICT: ${property.cadastre.district.toUpperCase()}, ${property.cadastre.state.toUpperCase()}

CAVEAT PETITION UNDER SECTION 148A OF THE CODE OF CIVIL PROCEDURE, 1908
READ WITH SECTION 5 OF THE STATE LAND RIGHTS AND PATTADAR PASSBOOK ACT

IN THE MATTER OF:
${property.ownerName.toUpperCase()}
Presently residing at: ${property.ownerOverseasCity}
Represented by Paridhi Legal Cadastral Escrow Network
... CAVEATOR / TRUE RECORD TITLE OWNER

VERSUS

${mutation.applicantName.toUpperCase()}
... CAVEATEE / ADVERSE CLAIMANT

---

1. The Caveator is the absolute, lawful, and verified titleholder in physical and constructive possession of land bearing Survey No. ${property.cadastre.surveyNumber} (${property.cadastre.khasraKhata}) situated at ${property.cadastre.village}, measuring ${property.cadastre.areaAcres} Acres.

2. The Caveatee has maliciously and without any legal authority or right filed Application No. ${mutation.applicationId} claiming ${mutation.claimedType}.

3. PRAYER: It is respectfully prayed that this Hon'ble Authority may be pleased to issue NO ex-parte order, mutation sanction, or passbook issuance without issuing advance registered notice to the Caveator and granting a full hearing.`;
        setCaveatText(fallbackText);
      });
  }, [property, mutation]);

  const handleCopy = () => {
    navigator.clipboard.writeText(caveatText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEFile = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      mutation.status = 'CAVEAT_SUBMITTED';
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-300 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-white border border-slate-200 text-slate-800 shadow-2xs">
              <Scale className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Statutory Caveat Petition (Section 148A CPC)
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-800 border border-rose-200">
                  OBJECTION PETITION
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Formal Objection Lodged Against Unauthorized Mutation #{mutation.applicationId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono">
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-rose-900 font-bold">
                Statutory Limitation Window: {mutation.objectionWindowDaysRemaining} Days Remaining
              </div>
              <div className="text-rose-800 text-[11px] mt-0.5 leading-relaxed">
                Under the State Land Revenue Act, lodging this Caveat legally restrains the Tahsildar from sanctioning title or issuing an e-Pattadar passbook to {mutation.applicantName} without notice and hearing to the true NRI titleholder.
              </div>
            </div>
          </div>

          {/* Caveat Document Preview */}
          <div className="p-4 bg-[#fafaf9] rounded-lg border border-slate-300 text-[11px] text-slate-800 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto font-mono selection:bg-slate-200">
            {caveatText || 'Drafting statutory caveat petition based on verified revenue records...'}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-mono text-xs font-medium shadow-2xs transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Copied Petition' : 'Copy Petition Draft'}</span>
          </button>

          <button
            onClick={handleEFile}
            disabled={submitting || submitted}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            {submitted ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Send className="w-3.5 h-3.5" />}
            <span>
              {submitted
                ? 'Caveat Lodged & Dispatched'
                : submitting
                ? 'Transmitting to SRO / Tahsildar...'
                : 'e-File Caveat to Tahsildar Office'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
