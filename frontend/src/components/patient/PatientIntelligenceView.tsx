import React, { useEffect, useState } from 'react';
import { 
  BrainCircuit, 
  Activity, 
  Scan, 
  Dna, 
  HelpCircle, 
  ChevronLeft, 
  Printer, 
  ArrowRightLeft, 
  Save, 
  Check, 
  UserCheck,
  Copy,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { Patient } from '../../types/patient';
import { PriorityBadge } from '../common/PriorityBadge';
import { api } from '../../services/apiClient';
import { PatientCompareModal } from './PatientCompareModal';
import { CountUp } from '../common/CountUp';

interface PatientIntelligenceViewProps {
  patient: Patient | null;
  onBack: () => void;
}

export const PatientIntelligenceView: React.FC<PatientIntelligenceViewProps> = ({
  patient,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'clinical' | 'factors' | 'pathway'>('overview');
  const [explainability, setExplainability] = useState<any>(null);
  const [pathwayInfo, setPathwayInfo] = useState<any>(null);
  const [comparePatient, setComparePatient] = useState<Patient | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const [reviewStatus, setReviewStatus] = useState<string>('Pending Review');
  const [clinicalNote, setClinicalNote] = useState<string>('');
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (patient?.patient_id) {
      setReviewStatus(patient.review_status || 'Pending Review');
      api.getPatientExplainability(patient.patient_id).then(setExplainability).catch(console.error);
      api.getPatientPathway(patient.patient_id).then(setPathwayInfo).catch(console.error);
    }
  }, [patient?.patient_id]);

  if (!patient) {
    return (
      <div className="p-8 text-center text-[#667085] text-xs">
        No patient selected. Please select a patient from the Priority Queue.
      </div>
    );
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(patient.patient_id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 1800);
  };

  const handleSaveStatus = async () => {
    setIsSavingStatus(true);
    try {
      await api.updatePatientStatus(patient.patient_id, reviewStatus, clinicalNote);
      patient.review_status = reviewStatus;
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleCompareClick = async () => {
    try {
      const compId = patient.patient_id === 'P-1042' ? 'P-1088' : 'P-1042';
      const pB = await api.getPatientById(compId);
      setComparePatient(pB);
      setShowCompareModal(true);
    } catch (err) {
      console.error('Compare failed:', err);
    }
  };

  const res = patient.prioritization_result;
  const cog = patient.cognitive_assessment || {};
  const blood = patient.blood_markers || {};
  const img = patient.imaging_features || {};

  const contribData = explainability?.factor_contributions?.map((c: any) => ({
    name: c.factor_name,
    points: c.points,
    percentage: c.percentage,
    description: c.description
  })) || [];

  const scoreVal = Math.round(res?.priority_score || 0);
  const ringColor = scoreVal > 69 ? '#DC2626' : scoreVal > 39 ? '#D97706' : '#059669';

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#EAECF0] text-xs text-[#667085] hover:text-[#101828] hover:border-[#D0D5DD] transition-all cursor-pointer font-medium shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Priority Queue</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCompareClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#D0D5DD] text-xs text-[#087E8B] hover:text-[#0891B2] transition-all cursor-pointer font-semibold shadow-xs"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Side-by-Side Compare</span>
          </button>

          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#EAECF0] text-xs text-[#101828] hover:border-[#D0D5DD] transition-all cursor-pointer font-medium shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-[#667085]" />
            <span>Export Clinical Summary</span>
          </button>
        </div>
      </div>

      {/* Patient Header Banner */}
      <div className="p-6 rounded-xl bg-[#FFFFFF] border border-[#EAECF0] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-[#101828] font-mono tracking-tight flex items-center gap-2">
              <span>{patient.patient_id}</span>
              <button 
                onClick={handleCopyId} 
                className="text-[#667085] hover:text-[#0891B2] text-xs transition-colors p-1"
                title="Copy Patient ID"
              >
                {copiedId ? <span className="text-emerald-600 font-sans text-xs flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Copied</span> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#F8FAFC] text-[#667085] text-xs font-semibold border border-[#EAECF0]">
              {patient.age} years ({patient.sex || 'F'})
            </span>
            <PriorityBadge level={res?.priority_level || 'LOW'} showScore={false} size="sm" />
          </div>

          <div className="text-xs text-[#667085] flex flex-wrap gap-4 font-medium">
            <span>Current stage: <b className="text-[#101828]">{patient.current_stage}</b></span>
            <span>Recommended next: <b className="text-[#0891B2] font-bold">{res?.recommended_next_stage}</b></span>
            <span>Status: <b className="text-[#101828]">{patient.review_status}</b></span>
          </div>
        </div>

        {/* Circular Progress Ring Score Display */}
        <div className="p-4 rounded-xl bg-[#F9FBFD] border border-[#EAECF0] flex items-center gap-4 shrink-0">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="#EAECF0" strokeWidth="4" fill="transparent" />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke={ringColor}
                strokeWidth="4"
                strokeDasharray="175.9"
                strokeDashoffset={175.9 - (175.9 * scoreVal) / 100}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-mono font-extrabold text-sm text-[#101828]">
              <CountUp end={scoreVal} duration={900} />
            </div>
          </div>

          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] block">
              Decision-Support Priority Score
            </span>
            <span className="text-xs font-bold text-[#087E8B] block mt-0.5">{res?.priority_level} Priority</span>
          </div>
        </div>
      </div>

      {/* Status Management Bar */}
      <div className="surface-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[#EAECF0] pb-2">
          <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="w-3.5 h-3.5 text-[#0891B2]" />
            Clinician Decision Management
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-[10px] text-[#667085] block font-bold mb-1">Review Status:</label>
            <select
              value={reviewStatus}
              onChange={(e) => setReviewStatus(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#D0D5DD] rounded-lg px-2.5 py-1.5 text-[#101828] focus:border-[#0891B2] outline-none font-medium"
            >
              <option value="Pending Review">Pending Review</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved for Biomarker">Approved for Biomarker</option>
              <option value="Approved for MRI">Approved for MRI</option>
              <option value="Approved for PET">Approved for PET</option>
              <option value="Completed">Completed</option>
              <option value="Escalated">Escalated</option>
            </select>
          </div>

          <div className="sm:col-span-2 flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-[#667085] block font-bold mb-1">Clinician Note:</label>
              <input
                type="text"
                placeholder="Add clinician review note (e.g. Approved for MRI based on p-tau181)..."
                value={clinicalNote}
                onChange={(e) => setClinicalNote(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#D0D5DD] rounded-lg px-2.5 py-1.5 text-[#101828] font-medium"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSaveStatus}
                disabled={isSavingStatus}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#ECFEFF] text-[#087E8B] font-bold text-xs border border-[#A5F3FC] hover:bg-[#0891B2] hover:text-white disabled:opacity-50 transition-all shrink-0 cursor-pointer shadow-xs"
              >
                {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Save className="w-3.5 h-3.5" />}
                <span>{savedSuccess ? 'Saved' : 'Save Status'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#EAECF0] text-xs font-semibold text-[#667085]">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'overview' ? 'border-[#0891B2] text-[#0891B2] font-bold' : 'border-transparent hover:text-[#101828]'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('clinical')}
          className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'clinical' ? 'border-[#0891B2] text-[#0891B2] font-bold' : 'border-transparent hover:text-[#101828]'
          }`}
        >
          Clinical Data
        </button>
        <button
          onClick={() => setActiveTab('factors')}
          className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'factors' ? 'border-[#0891B2] text-[#0891B2] font-bold' : 'border-transparent hover:text-[#101828]'
          }`}
        >
          Contributing Factors
        </button>
        <button
          onClick={() => setActiveTab('pathway')}
          className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'pathway' ? 'border-[#0891B2] text-[#0891B2] font-bold' : 'border-transparent hover:text-[#101828]'
          }`}
        >
          Pathway & Timeline
        </button>
      </div>

      {/* Tab 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Why is this patient prioritized? */}
          <div className="p-5 rounded-xl bg-[#FFFFFF] border border-[#EAECF0] space-y-2 shadow-xs">
            <h3 className="text-xs font-bold text-[#101828] uppercase tracking-wider flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-[#0891B2]" />
              Why is this patient prioritized?
            </h3>
            <p className="text-xs text-[#475467] leading-relaxed font-normal">
              Multiple available indicators contributed to the elevated prioritization score.
              Key contributing factor: <b className="text-[#087E8B] font-semibold">{res?.key_contributing_factor || 'Cognitive assessment features'}</b>. 
              The decision-support system recommends progression to <b>{res?.recommended_next_stage}</b>.
            </p>
          </div>

          {/* Factor Contribution Progress Bars */}
          <div className="surface-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#101828]">Contributing Factors Breakdown</h3>
            <div className="space-y-3">
              {contribData.map((c: any, idx: number) => (
                <div key={c.name} className="space-y-1 group cursor-default">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[#101828] group-hover:text-[#0891B2] transition-colors">{c.name}</span>
                    <span className="font-mono text-[#0891B2] font-bold">+{c.points.toFixed(1)} pts ({c.percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-[#EAECF0] h-2.5 rounded-full overflow-hidden border border-[#E4E7EC]">
                    <div
                      className="bg-[#0891B2] h-full rounded-full transition-all duration-700 ease-out"
                      style={{ 
                        width: `${Math.min(100, Math.max(5, c.percentage))}%`,
                        transitionDelay: `${idx * 80}ms`
                      }}
                    />
                  </div>
                  <div className="text-[10px] text-[#667085]">{c.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: CLINICAL DATA */}
      {activeTab === 'clinical' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cognitive */}
          <div className="surface-card p-5 space-y-3">
            <h4 className="text-xs font-bold text-[#101828] uppercase tracking-wider flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-[#0891B2]" />
              Cognitive Assessment
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded bg-[#F8FAFC]">
                <span className="text-[#667085]">MMSE Score:</span>
                <span className="font-bold text-[#101828] font-mono">{cog.mmse_score !== null && cog.mmse_score !== undefined ? `${cog.mmse_score}/30` : 'Not available'}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-[#F8FAFC]">
                <span className="text-[#667085]">MoCA Score:</span>
                <span className="font-bold text-[#101828] font-mono">{cog.moca_score !== null && cog.moca_score !== undefined ? `${cog.moca_score}/30` : 'Not available'}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-[#F8FAFC]">
                <span className="text-[#667085]">Decline Flag:</span>
                <span className={`font-bold ${cog.cognitive_decline_indicator ? 'text-[#DC2626]' : 'text-[#059669]'}`}>{cog.cognitive_decline_indicator ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* Biomarkers */}
          <div className="surface-card p-5 space-y-3">
            <h4 className="text-xs font-bold text-[#101828] uppercase tracking-wider flex items-center gap-2">
              <Dna className="w-4 h-4 text-[#D97706]" />
              Blood Biomarkers
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded bg-[#F8FAFC]">
                <span className="text-[#667085]">p-tau181 (pg/mL):</span>
                <span className="font-bold text-[#D97706] font-mono">{blood.ptau_181 !== null && blood.ptau_181 !== undefined ? blood.ptau_181 : 'Not available'}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-[#F8FAFC]">
                <span className="text-[#667085]">Aβ 42/40 Ratio:</span>
                <span className="font-bold text-[#101828] font-mono">{blood.abeta_42_44_ratio !== null && blood.abeta_42_44_ratio !== undefined ? blood.abeta_42_44_ratio : 'Not available'}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-[#F8FAFC]">
                <span className="text-[#667085]">ApoE4 Carrier:</span>
                <span className={`font-bold ${blood.apoe4_carrier ? 'text-[#D97706]' : 'text-[#475467]'}`}>{blood.apoe4_carrier ? 'Carrier (ε4+)' : 'Non-carrier'}</span>
              </div>
            </div>
          </div>

          {/* MRI */}
          <div className="surface-card p-5 space-y-3">
            <h4 className="text-xs font-bold text-[#101828] uppercase tracking-wider flex items-center gap-2">
              <Scan className="w-4 h-4 text-[#7C3AED]" />
              MRI Indicators
            </h4>
            <div className="p-2 rounded bg-[#F5F3FF] text-[10px] text-[#7C3AED] flex items-center gap-1.5 font-medium">
              <HelpCircle className="w-3.5 h-3.5 shrink-0" />
              <span>MRI image analysis not enabled in prototype; structured features used only.</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded bg-[#F8FAFC]">
                <span className="text-[#667085]">Hippocampal Vol:</span>
                <span className="font-bold text-[#101828] font-mono">{img.hippocampal_volume_mm3 ? `${img.hippocampal_volume_mm3} mm³` : 'Not available'}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-[#F8FAFC]">
                <span className="text-[#667085]">Entorhinal Thickness:</span>
                <span className="font-bold text-[#101828] font-mono">{img.entorhinal_cortical_thickness ? `${img.entorhinal_cortical_thickness} mm` : 'Not available'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: CONTRIBUTING FACTORS */}
      {activeTab === 'factors' && (
        <div className="surface-card p-6 space-y-3 text-xs">
          <h3 className="text-sm font-bold text-[#101828]">Detailed Factor Point Allocation</h3>
          {explainability?.factor_contributions?.map((c: any) => (
            <div key={c.factor_name} className="p-3 rounded-xl bg-[#FFFFFF] border border-[#EAECF0] flex items-center justify-between hover:border-[#D0D5DD] transition-colors">
              <div>
                <span className="font-bold text-[#101828] block">{c.factor_name}</span>
                <span className="text-[11px] text-[#667085]">{c.description}</span>
              </div>
              <span className="font-mono text-[#0891B2] font-bold">+{c.points.toFixed(1)} pts</span>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: PATHWAY & TIMELINE */}
      {activeTab === 'pathway' && (
        <div className="surface-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#101828]">Diagnostic Pathway Timeline</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {pathwayInfo?.timeline?.map((step: any) => {
              const isDone = step.status === 'Completed';
              const isCurr = step.is_current;
              return (
                <div key={step.stage_name} className={`p-4 rounded-xl border ${isCurr ? 'bg-[#ECFEFF] border-[#A5F3FC]' : 'bg-[#FFFFFF] border-[#EAECF0]'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#667085]">Stage 0{step.stage_index}</span>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                    ) : isCurr ? (
                      <Circle className="w-4 h-4 text-[#0891B2]" />
                    ) : (
                      <Circle className="w-4 h-4 text-[#98A2B3]" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-[#101828] mt-2">{step.stage_name}</h4>
                  <span className={`text-[10px] block mt-2 font-bold ${isCurr ? 'text-[#087E8B]' : 'text-[#667085]'}`}>{step.status}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Modal */}
      {showCompareModal && comparePatient && (
        <PatientCompareModal
          patientA={patient}
          patientB={comparePatient}
          onClose={() => setShowCompareModal(false)}
        />
      )}

      {/* Printable Clinical Summary Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#FFFFFF] border border-[#EAECF0] rounded-2xl p-6 space-y-4 text-xs text-[#101828] shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#EAECF0] pb-3">
              <h3 className="text-base font-bold text-[#101828] font-mono">Clinical Decision Support Triage Summary</h3>
              <button onClick={() => setShowPrintModal(false)} className="text-[#667085] hover:text-[#101828]">Close</button>
            </div>
            <div className="space-y-2 font-mono text-xs">
              <p><b>Patient ID:</b> {patient.patient_id}</p>
              <p><b>Age:</b> {patient.age} yrs | <b>Sex:</b> {patient.sex || 'F'}</p>
              <p><b>Current Stage:</b> {patient.current_stage}</p>
              <p><b>Diagnostic Priority Score:</b> {res?.priority_score.toFixed(0)}/100 ({res?.priority_level})</p>
              <p><b>Recommended Next Stage:</b> {res?.recommended_next_stage}</p>
              <p><b>Key Contributing Factor:</b> {res?.key_contributing_factor}</p>
              <p><b>Review Status:</b> {reviewStatus}</p>
            </div>
            <div className="p-3 bg-[#FFFBEB] border border-[#FDE68A] text-[10px] text-[#D97706] rounded font-medium">
              DISCLAIMER: Clinical Decision Support Output Only. Not a diagnostic confirmation or treatment plan.
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => window.print()} className="px-4 py-2 bg-[#0891B2] text-white font-bold text-xs rounded-lg shadow-xs hover:bg-[#0E7490] transition-colors cursor-pointer">
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

