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
  Printer
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-300 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-white border border-slate-200 text-slate-800 shadow-2xs">
              <Scale className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  BSA 2023 §63 Cryptographic Evidence Vault
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  STATUTORY COMPLIANT
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Statutory Electronic Record Certificate for Judicial Admissibility (Act No. 47 of 2023)
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs font-mono">
          {loading ? (
            <div className="py-12 text-center text-slate-500">
              Generating Hardware Cryptographic Attestation & Merkle Proof...
            </div>
          ) : certificate ? (
            <>
              {/* Custody Header Box */}
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/80 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">CERTIFICATE IDENTIFIER</div>
                  <div className="text-slate-900 font-bold text-sm mt-0.5">
                    {certificate.certificateId}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    Statutory Framework: {certificate.statutoryAct}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">OFFICIAL SYSTEM CUSTODIAN</div>
                  <div className="text-slate-900 font-semibold mt-0.5">
                    {certificate.custodianName}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    {certificate.custodianDesignation} • Class 3 DSC
                  </div>
                </div>
              </div>

              {/* Cryptographic Primitives Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* SHA-256 Frame Hash */}
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-semibold">
                    <Hash className="w-3.5 h-3.5 text-slate-600" />
                    <span>CONTEMPORANEOUS SHA-256 CHECKSUM</span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-800 break-all select-all font-mono">
                    {certificate.sha256PayloadHash}
                  </div>
                </div>

                {/* Ed25519 Hardware Signature */}
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-semibold">
                    <Key className="w-3.5 h-3.5 text-slate-600" />
                    <span>ED25519 HARDWARE HSM SIGNATURE</span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-800 break-all select-all font-mono">
                    {certificate.ed25519HardwareSignature}
                  </div>
                </div>

                {/* RFC 3161 Timestamp */}
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-semibold">
                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                    <span>RFC 3161 QTA QUALIFIED TIMESTAMP TOKEN</span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-800 break-all select-all font-mono">
                    {certificate.rfc3161TimestampToken}
                  </div>
                </div>

                {/* Merkle Root */}
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-semibold">
                    <GitBranch className="w-3.5 h-3.5 text-slate-600" />
                    <span>MERKLE LEDGER ROOT (AUDIT PATH PASS)</span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-800 break-all select-all font-mono">
                    {certificate.merkleRoot}
                  </div>
                </div>
              </div>

              {/* Court Document Markdown Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-800 font-semibold text-[11px] tracking-wide uppercase">
                    OFFICIAL COURT AFFIDAVIT FORMAT (FOR DISTRICT & HIGH COURTS)
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-slate-800 hover:text-slate-600 text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copied ? 'Copied to Clipboard' : 'Copy Affidavit Text'}</span>
                  </button>
                </div>

                <div className="p-4 bg-[#fafaf9] rounded-lg border border-slate-300 text-[11px] text-slate-800 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto font-mono selection:bg-slate-200">
                  {certificate.courtFilingFormatMarkdown}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono">
            Signed by Paridhi Systems Custodian • Authenticated under BSA 2023 Section 63(4)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-mono text-xs font-medium shadow-2xs transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied' : 'Copy Affidavit'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Court Dossier</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
