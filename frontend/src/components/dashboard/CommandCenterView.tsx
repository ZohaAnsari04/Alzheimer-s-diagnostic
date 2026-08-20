import React from 'react';
import { 
  Users, 
  BrainCircuit, 
  Scan, 
  Activity, 
  ArrowRight,
  GitMerge
} from 'lucide-react';
import { MetricStrip } from '../common/MetricStrip';
import { PriorityBadge } from '../common/PriorityBadge';
import { ClinicalTrustIndicator } from '../common/ClinicalTrustIndicator';
import { DashboardSummary } from '../../types/analytics';
import { Patient } from '../../types/patient';

interface CommandCenterViewProps {
  summary: DashboardSummary | null;
  topPatients: Patient[];
  onSelectPatient: (patientId: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  summary,
  topPatients,
  onSelectPatient,
  onNavigateTab
}) => {
  const total = summary?.total_screened || 1;
  const highPct = Math.round(((summary?.high_priority || 0) / total) * 100);
  const medPct = Math.round(((summary?.medium_priority || 0) / total) * 100);
  const lowPct = Math.round(((summary?.low_priority || 0) / total) * 100);

  const pipelineStages = [
    { id: '01', name: 'Cognitive Screening', count: summary?.total_screened || 0, sub: 'Screened cohort', icon: Users, accent: 'text-[#0891B2]', badgeBg: 'bg-[#ECFEFF]' },
    { id: '02', name: 'Blood Biomarkers', count: summary?.biomarker_candidates || 0, sub: 'Biomarker candidates', icon: Activity, accent: 'text-[#D97706]', badgeBg: 'bg-[#FFFBEB]' },
    { id: '03', name: 'MRI Evaluation', count: summary?.mri_candidates || 0, sub: 'MRI candidates', icon: Scan, accent: 'text-[#0891B2]', badgeBg: 'bg-[#ECFEFF]' },
    { id: '04', name: 'PET Prioritization', count: summary?.pet_candidates || 0, sub: 'PET priority candidates', icon: BrainCircuit, accent: 'text-[#7C3AED]', badgeBg: 'bg-[#F5F3FF]' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      {/* Editorial Header Section */}
      <div className="space-y-3 pt-2 relative">
        <div className="flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="text-[11px] font-bold font-mono tracking-widest text-[#0891B2] uppercase">
            AI-ASSISTED CLINICAL PRIORITIZATION
          </span>
          <ClinicalTrustIndicator />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#101828] tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-3 duration-300">
          Prioritize the right patients, at the right stage.
        </h1>
        <p className="text-sm text-[#475467] max-w-3xl leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-400 font-normal">
          AI-assisted prioritization of screened patients across the progressive diagnostic pathway. NeuroPath AI analyzes available screening and clinical data to help clinicians prioritize patients for progressive diagnostic evaluation across limited MRI, PET, and specialist resources.
        </p>
      </div>

      {/* Horizontal Metric Strip */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <MetricStrip summary={summary} />
      </div>

      {/* Main Asymmetric Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-5 duration-600">
        {/* Left 2 Cols: Visual Diagnostic Pathway Pipeline */}
        <div className="lg:col-span-2 surface-card p-6 space-y-5 relative">
          <div className="flex items-center justify-between border-b border-[#EAECF0] pb-4">
            <div>
              <h2 className="text-base font-bold text-[#101828] flex items-center gap-2">
                <GitMerge className="w-4 h-4 text-[#0891B2]" />
                Progressive Diagnostic Pathway
              </h2>
              <p className="text-xs text-[#667085] mt-0.5">Four-stage clinical evaluation sequence candidate counts</p>
            </div>
            <button 
              onClick={() => onNavigateTab('diagnostic-pathway')}
              className="text-xs text-[#0891B2] hover:text-[#0E7490] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Pathway Overview</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Diagnostic Pathway Horizontal Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative pt-2">
            <div className="hidden sm:block pathway-particle"></div>

            {pipelineStages.map((stg) => {
              const Icon = stg.icon;
              return (
                <div 
                  key={stg.name} 
                  className="relative p-4 rounded-xl bg-[#FFFFFF] border border-[#EAECF0] hover:border-[#D0D5DD] hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-3 group cursor-default"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#667085]">
                    <span>STAGE {stg.id}</span>
                    <div className={`p-1.5 rounded-lg ${stg.badgeBg}`}>
                      <Icon className={`w-4 h-4 ${stg.accent}`} />
                    </div>
                  </div>

                  <div>
                    <div className="text-2xl font-extrabold text-[#101828] font-mono tracking-tight">{stg.count}</div>
                    <div className="text-xs font-bold text-[#101828] mt-1 group-hover:text-[#0891B2] transition-colors">{stg.name}</div>
                    <div className="text-[11px] text-[#667085] mt-0.5">{stg.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Priority Distribution Segmented Bar */}
        <div className="surface-card p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#101828]">Priority Distribution</h2>
            <p className="text-xs text-[#667085]">Risk stratification of screened cohort</p>
          </div>

          <div className="space-y-4 my-auto">
            {/* Big Central Total Number */}
            <div className="text-center py-2">
              <span className="text-4xl font-extrabold text-[#101828] font-mono tracking-tight">{summary?.total_screened || 0}</span>
              <span className="text-xs text-[#667085] block font-medium mt-1">Total Screened Patients</span>
            </div>

            {/* Horizontal Segmented Bar */}
            <div className="w-full bg-[#F8FAFC] h-3 rounded-full overflow-hidden flex p-0.5 border border-[#EAECF0]">
              <div style={{ width: `${highPct}%` }} className="bg-[#DC2626] h-full rounded-l-full transition-all duration-700" title={`High: ${highPct}%`}></div>
              <div style={{ width: `${medPct}%` }} className="bg-[#D97706] h-full transition-all duration-700" title={`Medium: ${medPct}%`}></div>
              <div style={{ width: `${lowPct}%` }} className="bg-[#059669] h-full rounded-r-full transition-all duration-700" title={`Low: ${lowPct}%`}></div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
              <div>
                <span className="text-[#DC2626] font-bold block">{summary?.high_priority || 0}</span>
                <span className="text-[10px] text-[#667085]">High ({highPct}%)</span>
              </div>
              <div>
                <span className="text-[#D97706] font-bold block">{summary?.medium_priority || 0}</span>
                <span className="text-[10px] text-[#667085]">Med ({medPct}%)</span>
              </div>
              <div>
                <span className="text-[#059669] font-bold block">{summary?.low_priority || 0}</span>
                <span className="text-[10px] text-[#667085]">Low ({lowPct}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Queue Snippet Table */}
      <div className="surface-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#EAECF0] pb-4">
          <div>
            <h2 className="text-base font-bold text-[#101828]">High-Priority Candidate Queue</h2>
            <p className="text-xs text-[#667085] mt-0.5">Top screened patients ranked by decision-support priority score</p>
          </div>
          <button 
            onClick={() => onNavigateTab('priority-queue')}
            className="text-xs text-[#0891B2] hover:text-[#0E7490] font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View Full Queue ({summary?.total_screened || 0})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[#667085] font-bold uppercase text-[10px] tracking-wider border-b border-[#EAECF0] bg-[#F8FAFC]">
              <tr>
                <th className="py-3 px-3">Patient</th>
                <th className="py-3 px-3">Age</th>
                <th className="py-3 px-3">Current Stage</th>
                <th className="py-3 px-3">Priority Score</th>
                <th className="py-3 px-3">Level</th>
                <th className="py-3 px-3">Key Contributing Factor</th>
                <th className="py-3 px-3">Recommended Next Stage</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAECF0]">
              {topPatients.slice(0, 5).map((p, idx) => {
                const res = p.prioritization_result;
                return (
                  <tr 
                    key={p.patient_id} 
                    className="hover:bg-[#F8FAFC] transition-all duration-150 cursor-pointer"
                    style={{ animationDelay: `${idx * 40}ms` }}
                    onClick={() => onSelectPatient(p.patient_id)}
                  >
                    <td className="py-3.5 px-3 font-mono font-bold text-[#087E8B]">{p.patient_id}</td>
                    <td className="py-3.5 px-3 text-[#101828] font-medium">{p.age} yrs</td>
                    <td className="py-3.5 px-3 text-[#475467] font-medium">{p.current_stage}</td>
                    <td className="py-3.5 px-3 font-mono font-bold text-[#101828]">
                      {res?.priority_score.toFixed(0)} <span className="text-[10px] font-normal text-[#667085]">/100</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <PriorityBadge level={res?.priority_level || 'LOW'} showScore={false} size="sm" />
                    </td>
                    <td className="py-3.5 px-3 text-[#475467] font-medium">
                      {res?.key_contributing_factor || 'Cognitive assessment'}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-[#0891B2]">
                      {res?.recommended_next_stage}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button className="px-3 py-1 rounded-lg bg-[#FFFFFF] border border-[#D0D5DD] hover:border-[#0891B2] text-[#101828] hover:text-[#0891B2] font-semibold text-[11px] transition-all shadow-xs cursor-pointer">
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

