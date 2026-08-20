import React, { useState, useEffect } from 'react';
import { Search, X, Users, ArrowRight } from 'lucide-react';
import { api } from '../../services/apiClient';
import { Patient } from '../../types/patient';
import { PriorityBadge } from './PriorityBadge';

interface SearchCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPatient: (patientId: string) => void;
}

export const SearchCommandModal: React.FC<SearchCommandModalProps> = ({
  isOpen,
  onClose,
  onSelectPatient
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : setSearchTerm('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && searchTerm.trim()) {
      setIsLoading(true);
      api.getPatients({ search: searchTerm, page: 1, page_size: 6 })
        .then((res) => setResults(res.patients))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else if (!searchTerm.trim()) {
      setResults([]);
    }
  }, [searchTerm, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-xl bg-[#FFFFFF] border border-[#EAECF0] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#EAECF0] flex items-center gap-3">
          <Search className="w-4 h-4 text-[#0891B2] shrink-0" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patient ID (e.g. P-1042)..."
            className="w-full bg-transparent text-sm font-medium text-[#101828] placeholder-[#98A2B3] focus:outline-none"
          />
          <kbd className="px-2 py-0.5 rounded bg-[#F8FAFC] border border-[#EAECF0] text-[10px] text-[#667085] font-mono">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-80 overflow-y-auto p-2">
          {isLoading && (
            <div className="p-4 text-center text-xs text-[#667085]">Searching patient cohort...</div>
          )}

          {!isLoading && results.length === 0 && searchTerm.trim() && (
            <div className="p-4 text-center text-xs text-[#667085]">No patient matching "{searchTerm}" found.</div>
          )}

          {!searchTerm.trim() && (
            <div className="p-4 text-center text-xs text-[#667085]">
              Type a patient ID to search across the decision support queue.
            </div>
          )}

          {results.map((p) => {
            const res = p.prioritization_result;
            return (
              <div
                key={p.patient_id}
                onClick={() => {
                  onSelectPatient(p.patient_id);
                  onClose();
                }}
                className="p-3 rounded-xl hover:bg-[#F8FAFC] transition-colors cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#ECFEFF] border border-[#A5F3FC] flex items-center justify-center text-[#0891B2]">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono font-bold text-sm text-[#101828] group-hover:text-[#0891B2]">{p.patient_id}</span>
                    <span className="text-xs text-[#667085] ml-2">Age {p.age} yrs • {p.current_stage}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <PriorityBadge level={res?.priority_level || 'LOW'} score={res?.priority_score} size="sm" />
                  <ArrowRight className="w-3.5 h-3.5 text-[#98A2B3] group-hover:text-[#0891B2] transition-colors" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-[#F8FAFC] border-t border-[#EAECF0] text-right text-[10px] text-[#667085] font-mono">
          Press <b>ESC</b> or click outside to close
        </div>
      </div>
    </div>
  );
};

