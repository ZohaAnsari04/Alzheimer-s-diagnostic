import React from 'react';
import { GitMerge, ArrowDown, Users, Activity, Scan, BrainCircuit, ShieldAlert } from 'lucide-react';
import { DashboardSummary } from '../../types/analytics';

interface DiagnosticPathwayViewProps {
  summary: DashboardSummary | null;
}

export const DiagnosticPathwayView: React.FC<DiagnosticPathwayViewProps> = ({ summary }) => {
  const stages = [
    {
      id: 1,
      name: 'Cognitive Screening',
      icon: Users,
      count: summary?.total_screened || 0,
      inputs: 'MMSE, MoCA, clinical history, age, memory decline flag',
      output: 'Initial prioritization score & risk stratification',
      description: 'Primary screening step for large outpatient or primary care population cohorts.',
      color: 'border-[#A5F3FC] bg-[#ECFEFF] text-[#087E8B]',
    },
    {
      id: 2,
      name: 'Blood-Based Biomarkers',
      icon: Activity,
      count: summary?.biomarker_candidates || 0,
      inputs: 'p-tau181, p-tau217, Aβ 42/40 ratio, NfL, ApoE4 allele status',
      output: 'Recommendation for progression to structural imaging',
      description: 'Secondary biomarker triage for higher-priority candidates to confirm pathology indications.',
      color: 'border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]',
    },
    {
      id: 3,
      name: 'MRI Evaluation',
      icon: Scan,
      count: summary?.mri_candidates || 0,
      inputs: 'Hippocampal volume, entorhinal cortical thickness, ventricular ratio',
      output: 'Structural lesion verification & narrowing for advanced PET',
      description: 'Structural neuroimaging assessment for narrow candidates showing biomarker indication.',
      color: 'border-[#A5F3FC] bg-[#ECFEFF] text-[#087E8B]',
    },
    {
      id: 4,
      name: 'PET Scan Prioritization',
      icon: BrainCircuit,
      count: summary?.pet_candidates || 0,
      inputs: 'Multimodal risk vector (Cognitive + Biomarker + MRI structural features)',
      output: 'Candidate for further advanced clinical evaluation',
      description: 'Final prioritization step for limited high-demand PET imaging resources.',
      color: 'border-[#DDD6FE] bg-[#F5F3FF] text-[#7C3AED]',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#EAECF0] flex items-center justify-between shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#101828] flex items-center gap-2">
            <GitMerge className="w-5 h-5 text-[#0891B2]" />
            Progressive Diagnostic Pathway Architecture
          </h2>
          <p className="text-xs text-[#667085] mt-0.5">
            Strict 4-stage pipeline for risk-stratified evaluation of screened patient populations
          </p>
        </div>
        <div className="px-3 py-1 rounded-full bg-[#F8FAFC] text-xs font-mono text-[#667085] font-semibold border border-[#EAECF0]">
          Strict Clinical Sequence
        </div>
      </div>

      {/* Required Disclaimer */}
      <div className="p-3 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#D97706] flex items-center gap-2 font-medium">
        <ShieldAlert className="w-4 h-4 text-[#D97706] shrink-0" />
        <span>
          Prototype workflow logic — not a clinical protocol. PET prioritization does not constitute a diagnostic confirmation.
        </span>
      </div>

      {/* Vertical Pipeline Cards with Connections */}
      <div className="space-y-4 max-w-3xl mx-auto py-4">
        {stages.map((stg, idx) => {
          const Icon = stg.icon;
          return (
            <React.Fragment key={stg.name}>
              <div className={`p-5 rounded-xl border ${stg.color} surface-card space-y-3 relative shadow-xs`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#FFFFFF] border border-[#EAECF0] flex items-center justify-center font-bold shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#667085] block">
                        Stage 0{stg.id}
                      </span>
                      <h3 className="text-base font-bold text-[#101828]">{stg.name}</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-[#101828] font-mono">{stg.count}</span>
                    <span className="text-[10px] text-[#667085] block font-medium">candidates</span>
                  </div>
                </div>

                <p className="text-xs text-[#475467] leading-relaxed font-normal">{stg.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#EAECF0] text-xs">
                  <div>
                    <span className="text-[10px] text-[#667085] block font-bold uppercase">Stage Inputs:</span>
                    <span className="text-[#101828] font-mono text-[11px]">{stg.inputs}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#667085] block font-bold uppercase">Stage Output:</span>
                    <span className="text-[#087E8B] font-semibold text-[11px]">{stg.output}</span>
                  </div>
                </div>
              </div>

              {idx < stages.length - 1 && (
                <div className="flex justify-center py-1">
                  <div className="w-8 h-8 rounded-full bg-[#FFFFFF] border border-[#EAECF0] flex items-center justify-center text-[#0891B2] shadow-xs">
                    <ArrowDown className="w-4 h-4" />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

