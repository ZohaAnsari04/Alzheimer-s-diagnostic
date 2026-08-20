import React from 'react';
import { Database, Upload, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
  onUpload?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No patient records available",
  description = "Upload a public/synthetic dataset or trigger Demo Mode to seed the decision-support queue.",
  onReset,
  onUpload
}) => {
  return (
    <div className="p-12 text-center border border-dashed border-[#D0D5DD] rounded-xl bg-[#FFFFFF] my-6 flex flex-col items-center justify-center max-w-lg mx-auto shadow-xs">
      <div className="w-12 h-12 rounded-full bg-[#ECFEFF] border border-[#A5F3FC] flex items-center justify-center text-[#0891B2] mb-4">
        <Database className="w-6 h-6 text-[#0891B2]" />
      </div>
      <h3 className="text-base font-bold text-[#101828]">{title}</h3>
      <p className="text-xs text-[#667085] mt-2 max-w-sm leading-relaxed">{description}</p>
      <div className="flex items-center gap-3 mt-6">
        {onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0891B2] hover:bg-[#0E7490] text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate Demo Cohort</span>
          </button>
        )}
        {onUpload && (
          <button
            onClick={onUpload}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#101828] font-semibold text-xs border border-[#D0D5DD] transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[#667085]" />
            <span>Upload CSV Dataset</span>
          </button>
        )}
      </div>
    </div>
  );
};

