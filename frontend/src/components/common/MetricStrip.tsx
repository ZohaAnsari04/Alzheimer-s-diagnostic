import React from 'react';
import { DashboardSummary } from '../../types/analytics';
import { CountUp } from './CountUp';

interface MetricStripProps {
  summary: DashboardSummary | null;
}

export const MetricStrip: React.FC<MetricStripProps> = ({ summary }) => {
  const metrics = [
    {
      label: 'Patients screened',
      value: summary?.total_screened || 0,
      highlight: 'text-[#0891B2]',
      sub: 'Screened cohort'
    },
    {
      label: 'High priority candidates',
      value: summary?.high_priority || 0,
      highlight: 'text-[#DC2626]',
      sub: 'Score ≥ 70'
    },
    {
      label: 'MRI candidates',
      value: summary?.mri_candidates || 0,
      highlight: 'text-[#0891B2]',
      sub: 'Recommended stage 3'
    },
    {
      label: 'PET priority candidates',
      value: summary?.pet_candidates || 0,
      highlight: 'text-[#7C3AED]',
      sub: 'Recommended stage 4'
    },
  ];

  return (
    <div className="py-4 px-6 rounded-xl bg-[#FFFFFF] border border-[#EAECF0] flex flex-col sm:flex-row items-center justify-between gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[#EAECF0] shadow-xs">
      {metrics.map((m) => (
        <div 
          key={m.label} 
          className="flex-1 text-left sm:px-4 first:pl-0 last:pr-0 pt-2 sm:pt-0 transition-transform duration-200 hover:-translate-y-0.5 group cursor-default"
        >
          <div className={`text-3xl font-extrabold font-mono tracking-tight transition-colors ${m.highlight}`}>
            <CountUp end={m.value} duration={800} />
          </div>
          <div className="text-xs font-bold text-[#101828] mt-1 group-hover:text-[#0891B2] transition-colors">{m.label}</div>
          <div className="text-[11px] text-[#667085] mt-0.5">{m.sub}</div>
        </div>
      ))}
    </div>
  );
};

