import React, { useEffect, useState } from 'react';
import type { BSA2023Certificate, IncidentDetection, PropertyRecord } from '../types.js';
import {
  Scale,
  X,
  Copy,
  Check,
  Hash,
  Key,
  Clock,
  GitBranch,
  Download
} from 'lucide-react';

interface EvidenceVaultModalProps {
  incident: IncidentDetection;
  property: PropertyRecord;
  onClose: () => void;
}

export const EvidenceVaultModal: React.FC<EvidenceVaultModalProps> = ({
  incident,
  property,
  onClose
}) => {
  const [certificate, setCertificate] = useState<BSA2023Certificate | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/properties/${property.id}/incidents/${incident.id}/certificate`)
      .then((res) => res.json())
      .then((data) => {
        if (data.certificate) {
          setCertificate(data.certificate);
        }
      })
      .catch((err) => console.error('Failed to load certificate:', err))
      .finally(() => setLoading(false));
  }, [incident, property]);

  const handleCopy = () => {
    if (!certificate) return;
    navigator.clipboard.writeText(certificate.courtFilingFormatMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0b1019] border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                BSA 2023 §63 Cryptographic Evidence Vault
              </h2>
              <p className="text-xs text-slate-400">
                Statutory Electronic Record Certificate for Indian Judicial Proceedings (Act No. 47 of 2023)
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs font-mono">
          {loading ? (
            <div className="py-12 text-center text-slate-400">
              Generating Hardware Cryptographic Attestation & Merkle Proof...
            </div>
          ) : certificate ? (
            <>
              {/* Top Summary Card */}
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/10 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] text-slate-400">CERTIFICATE IDENTIFIER</div>
                  <div className="text-emerald-400 font-bold text-sm mt-0.5">
                    {certificate.certificateId}
                  </div>
                  <div className="text-[11px] text-slate-300 mt-1">
                    Statute: {certificate.statutoryAct}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400">HARDWARE CUSTODIAN</div>
                  <div className="text-slate-200 font-semibold mt-0.5">
                    {certificate.custodianName}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {certificate.custodianDesignation}
                  </div>
                </div>
              </div>

              {/* Cryptographic Primitives Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* SHA-256 Frame Hash */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                    <Hash className="w-3.5 h-3.5 text-cyan-400" />
                    <span>CONTEMPORANEOUS SHA-256 CHECKSUM</span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-200 break-all select-all font-mono">
                    {certificate.sha256PayloadHash}
                  </div>
                </div>

                {/* Ed25519 Hardware Signature */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>ED25519 HARDWARE HSM SIGNATURE</span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-200 break-all select-all font-mono">
                    {certificate.ed25519HardwareSignature}
                  </div>
                </div>

                {/* RFC 3161 Timestamp */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>RFC 3161 QTA QUALIFIED TIMESTAMP TOKEN</span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-200 break-all select-all font-mono">
                    {certificate.rfc3161TimestampToken}
                  </div>
                </div>

                {/* Merkle Root */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                    <GitBranch className="w-3.5 h-3.5 text-purple-400" />
                    <span>MERKLE LEDGER ROOT (AUDIT PATH PASS)</span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-200 break-all select-all font-mono">
                    {certificate.merkleRoot}
                  </div>
                </div>
              </div>

              {/* Court Document Markdown Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 font-semibold text-[11px]">
                    OFFICIAL COURT AFFIDAVIT FORMAT (FOR DISTRICT & HIGH COURTS)
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-[11px] transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied to Clipboard' : 'Copy Affidavit Text'}</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                  {certificate.courtFilingFormatMarkdown}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 font-mono">
            Signed by Paridhi Systems Custodian • Class 3 DSC Token
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-medium transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied' : 'Copy Affidavit'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-semibold shadow-lg shadow-emerald-950/40 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print Court Dossier</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
