import React, { useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { PatientContextBadge } from './PatientContextBadge';

interface SidebarItemProps {
  id: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick: () => void;
  isCollapsed?: boolean;
  selectedPatientId?: string;
  versionTag?: string;
  isEthics?: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  id,
  label,
  icon: Icon,
  isActive,
  onClick,
  isCollapsed = false,
  selectedPatientId,
  versionTag,
  isEthics = false
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const isPatientItem = id === 'patient-intelligence';

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`w-full h-10 px-3 rounded-lg text-sm font-medium transition-all duration-150 ease-out flex items-center justify-between group relative cursor-pointer ${
          isActive
            ? 'bg-[#ECFEFF] text-[#087E8B] font-semibold'
            : isEthics
            ? 'text-[#475467] hover:text-[#101828] hover:bg-[#F8FAFC]'
            : 'text-[#475467] hover:text-[#101828] hover:bg-[#F8FAFC]'
        } ${isCollapsed ? 'justify-center px-0' : ''}`}
      >
        {/* Left-edge 2px Cyan Indicator Bar */}
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-[#0891B2] rounded-r-full"></span>
        )}

        <div className="flex items-center gap-3 min-w-0">
          <Icon
            className={`w-4 h-4 shrink-0 transition-colors duration-150 ${
              isActive
                ? 'text-[#0891B2]'
                : 'text-[#667085] group-hover:text-[#0891B2]'
            }`}
          />
          {!isCollapsed && <span className="truncate">{label}</span>}
        </div>

        {/* Right Badges / Context Tags */}
        {!isCollapsed && (
          <div className="flex items-center gap-1.5 shrink-0">
            {isPatientItem && selectedPatientId && (
              <PatientContextBadge patientId={selectedPatientId} isCollapsed={false} />
            )}
            {versionTag && (
              <span className="text-[10px] font-mono text-[#667085] bg-[#F1F7FA] px-1.5 py-0.5 rounded border border-[#EAECF0]">
                {versionTag}
              </span>
            )}
          </div>
        )}
      </button>

      {/* Collapsed View Hover Tooltip */}
      {isCollapsed && showTooltip && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 rounded-md bg-[#FFFFFF] border border-[#EAECF0] text-xs text-[#101828] font-medium whitespace-nowrap shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100">
          {label}
          {isPatientItem && selectedPatientId && ` (${selectedPatientId})`}
        </div>
      )}
    </div>
  );
};

