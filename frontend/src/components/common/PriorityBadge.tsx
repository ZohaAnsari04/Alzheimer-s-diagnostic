import React from 'react';

interface PriorityBadgeProps {
  level: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  score?: number;
  showScore?: boolean;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  level,
  score,
  showScore = true,
  size = 'md'
}) => {
  const getBadgeStyle = (lvl: string) => {
    switch (lvl) {
      case 'HIGH':
        return 'bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5]';
      case 'MEDIUM':
        return 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]';
      case 'LOW':
        return 'bg-[#ECFDF3] text-[#059669] border-[#A7F3D0]';
      default:
        return 'bg-[#F8FAFC] text-[#667085] border-[#EAECF0]';
    }
  };

  const padClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full font-mono font-bold border ${getBadgeStyle(level)} ${padClass} shrink-0 select-none`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      <span>{level}</span>
      {showScore && score !== undefined && (
        <span className="opacity-80 border-l border-current/30 pl-1.5 font-sans font-medium">
          {score.toFixed(0)}/100
        </span>
      )}
    </div>
  );
};

