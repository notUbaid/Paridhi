import React, { useEffect, useState } from 'react';
import type { MutationAlert, PropertyRecord } from '../types.js';
import {
  FileText,
  X,
  Copy,
  Check,
  Send,
  AlertTriangle
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
      .then((res) => res.json())
      .then((data) => {
        if (data.caveatPetitionMarkdown) {
          setCaveatText(data.caveatPetitionMarkdown);
        }
      })
      .catch((err) => console.error('Failed to load caveat petition:', err));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0b1019] border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Statutory Caveat Petition (Section 148A CPC)
              </h2>
              <p className="text-xs text-slate-400">
                Formal Objection Against Fraudulent Mutation #{mutation.applicationId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono">
          <div className="p-3.5 bg-red-950/20 border border-red-500/40 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-red-300 font-bold">
                Critical Statutory Deadline: {mutation.objectionWindowDaysRemaining} Days Remaining
              </div>
              <div className="text-slate-300 text-[11px] mt-0.5">
                Under the State Land Revenue Act, lodging this Caveat legally forbids the Tahsildar from issuing title or passbook to {mutation.applicantName} without a formal court hearing with advance written notice to the true NRI owner.
              </div>
            </div>
          </div>

          {/* Caveat Document Preview */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
            {caveatText || 'Loading statutory caveat draft...'}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-medium transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Petition' : 'Copy Petition'}</span>
          </button>

          <button
            onClick={handleEFile}
            disabled={submitting || submitted}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-mono text-xs font-semibold shadow-lg shadow-red-950/40 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
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
