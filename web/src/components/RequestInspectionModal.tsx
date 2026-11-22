import React, { useState } from 'react';
import type { PropertyRecord } from '../types';
import { X, UserCheck, ShieldCheck, Send } from 'lucide-react';

interface RequestInspectionModalProps {
  property: PropertyRecord;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (notes: string) => void;
}

export const RequestInspectionModal: React.FC<RequestInspectionModalProps> = ({
  property,
  isOpen,
  onClose,
  onSubmit
}) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit(notes || 'Owner requested priority verification of boundary stones.');
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-sm">
              Request On-Demand Field Inspection
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs text-slate-700">
            <div className="font-semibold text-slate-900 mb-0.5">
              {property.name} ({property.surveyNumber})
            </div>
            <div className="text-slate-500">
              {property.location.village}, {property.location.mandalTaluk}, {property.location.district}
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="font-semibold text-slate-800">
              Assigned Field Inspector
            </label>
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-medium text-slate-900">
                  {property.latestInspection.inspectorName}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  ({property.latestInspection.inspectorId})
                </span>
              </div>
              <span className="text-slate-500 text-[11px]">SLA: &lt; 48 Hours</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="font-semibold text-slate-800">
              Specific Instructions or Focus Areas
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Please verify North-West boundary stone peg #2, take extra photos of neighbor boundary wall, speak with village sarpanch / caretaker."
              rows={3}
              className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            />
          </div>

          <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold">Inspection Protocol:</span> Inspector will conduct in-person physical survey, inspect all 4 corner boundary stones, interview adjacent landowners, take 360° geotagged photos, and upload an official signed report to your dashboard.
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Dispatching...' : 'Dispatch Field Agent'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
