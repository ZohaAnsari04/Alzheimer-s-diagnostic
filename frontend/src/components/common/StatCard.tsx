import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  color: 'cyan' | 'red' | 'amber' | 'emerald' | 'indigo' | 'purple';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend
}) => {
  const colorMap = {
    cyan: { bg: 'bg-[#ECFEFF]', border: 'border-[#EAECF0]', text: 'text-[#0891B2]', iconBg: 'bg-[#ECFEFF] border border-[#A5F3FC]' },
    red: { bg: 'bg-[#FEF2F2]', border: 'border-[#EAECF0]', text: 'text-[#DC2626]', iconBg: 'bg-[#FEF2F2] border border-[#FCA5A5]' },
    amber: { bg: 'bg-[#FFFBEB]', border: 'border-[#EAECF0]', text: 'text-[#D97706]', iconBg: 'bg-[#FFFBEB] border border-[#FDE68A]' },
    emerald: { bg: 'bg-[#ECFDF3]', border: 'border-[#EAECF0]', text: 'text-[#059669]', iconBg: 'bg-[#ECFDF3] border border-[#A7F3D0]' },
    indigo: { bg: 'bg-[#F5F3FF]', border: 'border-[#EAECF0]', text: 'text-[#7C3AED]', iconBg: 'bg-[#F5F3FF] border border-[#DDD6FE]' },
    purple: { bg: 'bg-[#F5F3FF]', border: 'border-[#EAECF0]', text: 'text-[#7C3AED]', iconBg: 'bg-[#F5F3FF] border border-[#DDD6FE]' },
  };

  const style = colorMap[color];

  return (
    <div className={`p-4 rounded-xl bg-[#FFFFFF] border ${style.border} surface-card surface-card-hover relative overflow-hidden`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-[#667085] tracking-wide uppercase">{title}</span>
        <div className={`w-8 h-8 rounded-lg ${style.iconBg} flex items-center justify-center ${style.text}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-extrabold text-[#101828] tracking-tight font-mono">{value}</span>
        {trend && <span className="text-[10px] font-medium text-[#667085]">{trend}</span>}
      </div>
      {subtitle && <p className="text-[11px] text-[#667085] mt-1 font-medium">{subtitle}</p>}
    </div>
  );
};

