import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const SafetyBanner: React.FC = () => {
  return (
    <div className="bg-[#FFFFFF] border-b border-[#EAECF0] px-4 py-2 text-xs text-[#475467] flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-2 max-w-5xl">
        <ShieldCheck className="w-4 h-4 text-[#0891B2] shrink-0" />
        <span className="font-bold text-[#101828]">CLINICAL DECISION SUPPORT:</span>
        <span className="hidden sm:inline text-[#475467]">
          This system ranks screened patients for progressive diagnostic evaluation. It does NOT diagnose Alzheimer's disease, recommend medication, or replace medical judgment.
        </span>
        <span className="sm:hidden text-[#475467]">
          Prioritization tool only — Not a diagnostic device.
        </span>
      </div>
      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ECFEFF] text-[#087E8B] font-mono text-[10px] font-bold border border-[#A5F3FC] shrink-0">
        <span>Non-Diagnostic</span>
      </div>
    </div>
  );
};

