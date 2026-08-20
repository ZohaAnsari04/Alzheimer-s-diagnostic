import React, { useState } from 'react';
import { 
  Users, 
  Filter, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight,
  RotateCcw,
  Download
} from 'lucide-react';
import { Patient } from '../../types/patient';
import { PriorityBadge } from '../common/PriorityBadge';

interface PriorityQueueViewProps {
  patients: Patient[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  onFilterChange: (filters: any) => void;
  onSelectPatient: (patientId: string) => void;
}

export const PriorityQueueView: React.FC<PriorityQueueViewProps> = ({
  patients,
  total,
  page,
  pageSize,
  onPageChange,
  onFilterChange,
  onSelectPatient
}) => {
  const [search, setSearch] = useState('');
  const [priorityLevel, setPriorityLevel] = useState('ALL');
  const [currentStage, setCurrentStage] = useState('ALL');
  const [recommendedNext, setRecommendedNext] = useState('ALL');
  const [reviewStatus, setReviewStatus] = useState('ALL');
  const [minAge, setMinAge] = useState<string>('');
  const [maxAge, setMaxAge] = useState<string>('');
  const [minScore, setMinScore] = useState<string>('');
  const [maxScore, setMaxScore] = useState<string>('');
  const [sortBy, setSortBy] = useState('highest_priority');

  const applyFilters = (overrides: Record<string, any> = {}) => {
    const f = {
      search: overrides.search !== undefined ? overrides.search : search,
      priority_level: overrides.priority_level !== undefined ? overrides.priority_level : priorityLevel,
      current_stage: overrides.current_stage !== undefined ? overrides.current_stage : currentStage,
      recommended_next_stage: overrides.recommended_next_stage !== undefined ? overrides.recommended_next_stage : recommendedNext,
      review_status: overrides.review_status !== undefined ? overrides.review_status : reviewStatus,
      min_age: overrides.min_age !== undefined ? overrides.min_age : (minAge ? Number(minAge) : undefined),
      max_age: overrides.max_age !== undefined ? overrides.max_age : (maxAge ? Number(maxAge) : undefined),
      min_score: overrides.min_score !== undefined ? overrides.min_score : (minScore ? Number(minScore) : undefined),
      max_score: overrides.max_score !== undefined ? overrides.max_score : (maxScore ? Number(maxScore) : undefined),
      sort_by: overrides.sort_by !== undefined ? overrides.sort_by : sortBy,
      page: 1
    };
    onFilterChange(f);
  };

  const handleResetFilters = () => {
    setSearch('');
    setPriorityLevel('ALL');
    setCurrentStage('ALL');
    setRecommendedNext('ALL');
    setReviewStatus('ALL');
    setMinAge('');
    setMaxAge('');
    setMinScore('');
    setMaxScore('');
    setSortBy('highest_priority');
    onFilterChange({ page: 1, page_size: pageSize });
  };

  const handleExportCsv = () => {
    const headers = ["patient_id", "age", "current_stage", "priority_score", "priority_level", "key_contributing_factor", "recommended_next_stage", "review_status"];
    const rows = patients.map(p => [
      p.patient_id,
      p.age,
      `"${p.current_stage}"`,
      p.prioritization_result?.priority_score.toFixed(1) || '0',
      p.prioritization_result?.priority_level || 'LOW',
      `"${p.prioritization_result?.key_contributing_factor || ''}"`,
      `"${p.prioritization_result?.recommended_next_stage || ''}"`,
      `"${p.review_status}"`
    ]);

    const csvStr = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neuropath_priority_queue_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h1 className="text-2xl font-extrabold text-[#101828] tracking-tight">Patient Priority Queue</h1>
          <p className="text-xs text-[#667085] mt-0.5">Patients ranked by decision-support priority score across the screening cohort</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#D0D5DD] text-xs text-[#101828] hover:border-[#0891B2] hover:text-[#0891B2] transition-all font-semibold cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#0891B2]" />
            <span>Export CSV</span>
          </button>
          <div className="text-xs font-mono text-[#087E8B] font-bold px-3 py-1.5 rounded-xl bg-[#ECFEFF] border border-[#A5F3FC]">
            {patients.length} of {total} patients
          </div>
        </div>
      </div>

      {/* Filter Control Panel */}
      <div className="surface-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#101828] font-bold text-xs uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-[#0891B2]" />
            <span>Cohort Filters</span>
          </div>
          <button
            onClick={handleResetFilters}
            className="text-[11px] text-[#667085] hover:text-[#0891B2] flex items-center gap-1 font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-[10px] text-[#667085] block font-bold mb-1">Priority Level</label>
            <select
              value={priorityLevel}
              onChange={(e) => {
                setPriorityLevel(e.target.value);
                applyFilters({ priority_level: e.target.value });
              }}
              className="w-full bg-[#FFFFFF] border border-[#D0D5DD] rounded-xl px-3 py-1.5 text-[#101828] focus:border-[#0891B2] focus:ring-2 focus:ring-[#0891B2]/10 transition-all outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority (Score &gt; 69)</option>
              <option value="MEDIUM">Medium Priority (40–69)</option>
              <option value="LOW">Low Priority (&lt;40)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-[#667085] block font-bold mb-1">Current Stage</label>
            <select
              value={currentStage}
              onChange={(e) => {
                setCurrentStage(e.target.value);
                applyFilters({ current_stage: e.target.value });
              }}
              className="w-full bg-[#FFFFFF] border border-[#D0D5DD] rounded-xl px-3 py-1.5 text-[#101828] focus:border-[#0891B2] focus:ring-2 focus:ring-[#0891B2]/10 transition-all outline-none"
            >
              <option value="ALL">All Current Stages</option>
              <option value="Cognitive Screening">Cognitive Screening</option>
              <option value="Blood-Based Biomarkers">Blood-Based Biomarkers</option>
              <option value="MRI Evaluation">MRI Evaluation</option>
              <option value="PET Scan Prioritization">PET Scan Prioritization</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-[#667085] block font-bold mb-1">Recommended Next Stage</label>
            <select
              value={recommendedNext}
              onChange={(e) => {
                setRecommendedNext(e.target.value);
                applyFilters({ recommended_next_stage: e.target.value });
              }}
              className="w-full bg-[#FFFFFF] border border-[#D0D5DD] rounded-xl px-3 py-1.5 text-[#101828] focus:border-[#0891B2] focus:ring-2 focus:ring-[#0891B2]/10 transition-all outline-none"
            >
              <option value="ALL">All Next Stages</option>
              <option value="Blood-Based Biomarkers">Blood-Based Biomarkers</option>
              <option value="MRI Evaluation">MRI Evaluation</option>
              <option value="PET Scan Prioritization">PET Scan Prioritization</option>
              <option value="Continue Screening Review">Continue Screening Review</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-[#667085] block font-bold mb-1">Review Status</label>
            <select
              value={reviewStatus}
              onChange={(e) => {
                setReviewStatus(e.target.value);
                applyFilters({ review_status: e.target.value });
              }}
              className="w-full bg-[#FFFFFF] border border-[#D0D5DD] rounded-xl px-3 py-1.5 text-[#101828] focus:border-[#0891B2] focus:ring-2 focus:ring-[#0891B2]/10 transition-all outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Under Review">Under Review</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Queue Data Table */}
      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[#667085] font-bold uppercase text-[10px] tracking-wider border-b border-[#EAECF0] bg-[#F8FAFC]">
              <tr>
                <th className="py-3.5 px-4">Patient</th>
                <th className="py-3.5 px-4">Age</th>
                <th className="py-3.5 px-4">Current Stage</th>
                <th className="py-3.5 px-4">Priority Score</th>
                <th className="py-3.5 px-4">Level</th>
                <th className="py-3.5 px-4">Key Contributing Factor</th>
                <th className="py-3.5 px-4">Recommended Next Stage</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAECF0]">
              {patients.map((p, idx) => {
                const res = p.prioritization_result;
                const isBenchmark = p.patient_id === 'P-1042';

                return (
                  <tr
                    key={p.patient_id}
                    className={`hover:bg-[#F8FAFC] transition-all duration-150 cursor-pointer ${
                      isBenchmark ? 'bg-[#ECFEFF]/50' : ''
                    }`}
                    style={{ animationDelay: `${idx * 35}ms` }}
                    onClick={() => onSelectPatient(p.patient_id)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[#087E8B]">
                      {p.patient_id}
                    </td>
                    <td className="py-3.5 px-4 text-[#101828] font-medium">{p.age}</td>
                    <td className="py-3.5 px-4 text-[#475467] font-medium">{p.current_stage}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#101828]">
                      {res?.priority_score.toFixed(0)} <span className="text-[10px] font-normal text-[#667085]">/100</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge level={res?.priority_level || 'LOW'} showScore={false} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-[#475467] max-w-xs truncate font-medium">
                      {res?.key_contributing_factor || 'Cognitive factor'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#0891B2]">
                      {res?.recommended_next_stage}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-[#F8FAFC] text-[#667085] text-[10px] font-semibold border border-[#EAECF0]">
                        {p.review_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPatient(p.patient_id);
                        }}
                        className="px-3 py-1 rounded-lg bg-[#FFFFFF] border border-[#D0D5DD] hover:border-[#0891B2] text-[#101828] hover:text-[#0891B2] font-semibold text-[11px] transition-all cursor-pointer shadow-xs"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-[#F8FAFC] border-t border-[#EAECF0] flex items-center justify-between text-xs text-[#667085]">
          <div>
            Page <span className="font-bold text-[#101828]">{page}</span> of <span className="font-bold text-[#101828]">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="p-1.5 rounded-lg bg-[#FFFFFF] border border-[#D0D5DD] text-[#101828] hover:bg-[#F1F7FA] disabled:opacity-40 cursor-pointer shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="p-1.5 rounded-lg bg-[#FFFFFF] border border-[#D0D5DD] text-[#101828] hover:bg-[#F1F7FA] disabled:opacity-40 cursor-pointer shadow-xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

