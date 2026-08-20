import React from 'react';

interface PatientContextBadgeProps {
  patientId?: string;
  isCollapsed?: boolean;
}

export const PatientContextBadge: React.FC<PatientContextBadgeProps> = ({ patientId, isCollapsed = false }) => {
  if (!patientId) return null;

  if (isCollapsed) {
    return <span className="w-1.5 h-1.5 rounded-full bg-[#0891B2]"></span>;
  }

  return (
    <span className="px-1.5 py-0.5 rounded-[6px] bg-[#ECFEFF] border border-[#A5F3FC] text-[#087E8B] text-[10px] font-mono font-bold tracking-tight">
      {patientId}
    </span>
  );
};

