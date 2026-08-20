import React from 'react';
import { X, ArrowRightLeft } from 'lucide-react';
import { Patient } from '../../types/patient';
import { PriorityBadge } from '../common/PriorityBadge';

interface PatientCompareModalProps {
  patientA: Patient;
  patientB: Patient;
  onClose: () => void;
}

export const PatientCompareModal: React.FC<PatientCompareModalProps> = ({
  patientA,
  patientB,
  onClose
}) => {
  const resA = patientA.prioritization_result;
  const resB = patientB.prioritization_result;

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[#FFFFFF] border border-[#EAECF0] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-[#F8FAFC] border-b border-[#EAECF0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-[#0891B2]" />
            <h3 className="text-sm font-bold text-[#101828]">
              Side-by-Side Clinical Prioritization Comparison
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-[#FFFFFF] border border-[#EAECF0] hover:bg-[#F1F7FA] text-[#667085] hover:text-[#101828] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto grid grid-cols-2 gap-6 text-xs divide-x divide-[#EAECF0]">
          {/* Patient A */}
          <div className="space-y-4 pr-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono font-extrabold text-[#087E8B] text-base">{patientA.patient_id}</span>
                <p className="text-[#667085]">Age {patientA.age} yrs • {patientA.current_stage}</p>
              </div>
              <PriorityBadge level={resA?.priority_level || 'LOW'} score={resA?.priority_score} size="md" />
            </div>

            <div className="p-3 rounded-lg bg-[#ECFEFF] border border-[#A5F3FC] space-y-1">
              <span className="text-[10px] text-[#087E8B] uppercase font-bold">Recommended Next Stage:</span>
              <span className="text-[#087E8B] font-extrabold block text-sm">{resA?.recommended_next_stage}</span>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-[#101828] block border-b border-[#EAECF0] pb-1">Cognitive Assessment</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>MMSE: <b className="text-[#101828]">{patientA.cognitive_assessment?.mmse_score ?? 'N/A'}</b></div>
                <div>MoCA: <b className="text-[#101828]">{patientA.cognitive_assessment?.moca_score ?? 'N/A'}</b></div>
                <div>Decline Flag: <b className={patientA.cognitive_assessment?.cognitive_decline_indicator ? 'text-[#DC2626]' : 'text-[#667085]'}>{patientA.cognitive_assessment?.cognitive_decline_indicator ? 'Yes' : 'No'}</b></div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-[#101828] block border-b border-[#EAECF0] pb-1">Blood Biomarkers</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>p-tau181: <b className="text-[#D97706]">{patientA.blood_markers?.ptau_181 ?? 'N/A'} pg/mL</b></div>
                <div>Aβ Ratio: <b className="text-[#101828]">{patientA.blood_markers?.abeta_42_44_ratio ?? 'N/A'}</b></div>
                <div>ApoE4: <b className={patientA.blood_markers?.apoe4_carrier ? 'text-[#D97706]' : 'text-[#667085]'}>{patientA.blood_markers?.apoe4_carrier ? 'ε4+' : 'Non-carrier'}</b></div>
              </div>
            </div>
          </div>

          {/* Patient B */}
          <div className="space-y-4 pl-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono font-extrabold text-[#087E8B] text-base">{patientB.patient_id}</span>
                <p className="text-[#667085]">Age {patientB.age} yrs • {patientB.current_stage}</p>
              </div>
              <PriorityBadge level={resB?.priority_level || 'LOW'} score={resB?.priority_score} size="md" />
            </div>

            <div className="p-3 rounded-lg bg-[#ECFEFF] border border-[#A5F3FC] space-y-1">
              <span className="text-[10px] text-[#087E8B] uppercase font-bold">Recommended Next Stage:</span>
              <span className="text-[#087E8B] font-extrabold block text-sm">{resB?.recommended_next_stage}</span>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-[#101828] block border-b border-[#EAECF0] pb-1">Cognitive Assessment</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>MMSE: <b className="text-[#101828]">{patientB.cognitive_assessment?.mmse_score ?? 'N/A'}</b></div>
                <div>MoCA: <b className="text-[#101828]">{patientB.cognitive_assessment?.moca_score ?? 'N/A'}</b></div>
                <div>Decline Flag: <b className={patientB.cognitive_assessment?.cognitive_decline_indicator ? 'text-[#DC2626]' : 'text-[#667085]'}>{patientB.cognitive_assessment?.cognitive_decline_indicator ? 'Yes' : 'No'}</b></div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-[#101828] block border-b border-[#EAECF0] pb-1">Blood Biomarkers</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>p-tau181: <b className="text-[#D97706]">{patientB.blood_markers?.ptau_181 ?? 'N/A'} pg/mL</b></div>
                <div>Aβ Ratio: <b className="text-[#101828]">{patientB.blood_markers?.abeta_42_44_ratio ?? 'N/A'}</b></div>
                <div>ApoE4: <b className={patientB.blood_markers?.apoe4_carrier ? 'text-[#D97706]' : 'text-[#667085]'}>{patientB.blood_markers?.apoe4_carrier ? 'ε4+' : 'Non-carrier'}</b></div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#F8FAFC] border-t border-[#EAECF0] text-center text-[10px] text-[#667085] font-mono">
          Decision-support prioritization comparison — outputs support clinician triage allocation.
        </div>
      </div>
    </div>
  );
};

