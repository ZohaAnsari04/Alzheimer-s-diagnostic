import React, { useState } from 'react';
import { ShieldCheck, Info, X } from 'lucide-react';

export const ClinicalTrustIndicator: React.FC = () => {
  const [showPopover, setShowPopover] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowPopover(!showPopover)}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FFFFFF] border border-[#D0D5DD] text-[11px] font-semibold text-[#101828] hover:border-[#0891B2] transition-all cursor-pointer shadow-xs select-none"
        title="Click to view clinical decision support guidelines"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-[#0891B2]" />
        <span>CLINICAL DECISION SUPPORT</span>
        <span className="text-[#667085] font-normal">· Non-diagnostic · Human review required</span>
        <Info className="w-3 h-3 text-[#667085]" />
      </button>

      {showPopover && (
        <div className="absolute right-0 top-full mt-2 w-80 p-4 rounded-xl bg-[#FFFFFF] border border-[#EAECF0] shadow-xl z-50 text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-[#EAECF0] pb-2">
            <span className="font-bold text-[#101828] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0891B2]" />
              Decision Support Guidelines
            </span>
            <button onClick={() => setShowPopover(false)} className="text-[#667085] hover:text-[#101828]">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[#475467] leading-relaxed text-[11px]">
            NeuroPath AI ranks screened patients for progressive diagnostic evaluation. Outputs are intended strictly to support clinician prioritization and do not diagnose Alzheimer's disease, recommend medication, or replace professional medical judgment.
          </p>
        </div>
      )}
    </div>
  );
};

