import React, { useState } from 'react';
import { FileSpreadsheet, Upload, CheckCircle2, AlertCircle, RefreshCw, Download, GitBranch } from 'lucide-react';
import { api } from '../../services/apiClient';

interface DataIngestionViewProps {
  onSuccessImport: () => void;
}

export const DataIngestionView: React.FC<DataIngestionViewProps> = ({ onSuccessImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatusMessage(null);
      setErrorMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const res = await api.uploadCsv(file);
      setStatusMessage(res.message || 'Dataset imported successfully!');
      onSuccessImport();
    } catch (err: any) {
      setErrorMessage(err.message || 'CSV upload and validation failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadSample = () => {
    const csvContent = `patient_id,age,sex,current_stage,mmse_score,moca_score,cognitive_decline_indicator,memory_decline_flag,executive_fn_score,comorbidities_count,hypertension,diabetes,smoking_history,family_history_alzheimers,abeta_42_44_ratio,ptau_181,ptau_217,nfl,apoe4_carrier,hippocampal_volume_mm3,entorhinal_cortical_thickness,ventricle_volume_ratio,mri_completed
P-3001,76,F,Cognitive Screening,20.5,17.5,True,True,18.0,2,True,True,False,True,0.071,34.2,0.55,38.0,True,2810.0,2.20,0.048,False
P-3002,67,M,Blood-Based Biomarkers,26.0,23.0,False,True,25.0,0,False,False,False,False,0.102,16.5,0.18,20.0,False,3550.0,3.00,0.025,False`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_neuropath_upload_schema.csv';
    a.click();
  };

  const schemaMappings = [
    { canonical: "patient_id", adni: "RID / Subject ID", oasis: "OASIS_ID", desc: "Unique patient identifier string" },
    { canonical: "age", adni: "AGE", oasis: "Age", desc: "Patient age in years (18–120)" },
    { canonical: "mmse_score", adni: "MMSCORE", oasis: "MMSE", desc: "Mini-Mental State Exam score (0–30)" },
    { canonical: "ptau_181", adni: "PTAU181P", oasis: "pTau181", desc: "Plasma p-tau181 measurement (pg/mL)" },
    { canonical: "abeta_42_44_ratio", adni: "ABETA42_40", oasis: "Abeta_ratio", desc: "Plasma Amyloid-beta 42/40 ratio" },
    { canonical: "hippocampal_volume_mm3", adni: "HIPPOCAMPUS_VOL", oasis: "Hippocampus_Vol", desc: "Structural hippocampal volume (mm³)" }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h1 className="text-2xl font-extrabold text-[#101828] tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#0891B2]" />
            Dataset Management & Public Adapter Architecture
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Ingest structured patient cohorts & inspect canonical public dataset schema mappings (ADNI / OASIS)
          </p>
        </div>
        <button
          onClick={handleDownloadSample}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#D0D5DD] text-xs text-[#087E8B] hover:text-[#0891B2] transition-all cursor-pointer font-semibold shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Sample Schema CSV</span>
        </button>
      </div>

      {/* Upload Drag & Drop Area */}
      <div className="surface-card p-8 text-center space-y-4 max-w-xl mx-auto border-2 border-dashed border-[#D0D5DD] hover:border-[#0891B2] hover:bg-[#F0FDFA] transition-all">
        <div className="w-12 h-12 rounded-full bg-[#ECFEFF] border border-[#A5F3FC] flex items-center justify-center text-[#0891B2] mx-auto">
          <Upload className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-sm font-bold text-[#101828]">Upload Public / Synthetic Patient Cohort CSV</h3>
          <p className="text-xs text-[#667085] mt-1">
            CSV must include required fields: <code className="text-[#0891B2] font-mono font-bold">patient_id</code>, <code className="text-[#0891B2] font-mono font-bold">age</code>
          </p>
        </div>

        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id="csv-file-input"
        />

        <label
          htmlFor="csv-file-input"
          className="inline-block px-4 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#D0D5DD] text-xs text-[#101828] font-semibold cursor-pointer transition-all shadow-xs"
        >
          {file ? file.name : 'Select CSV File'}
        </label>

        {file && (
          <div className="pt-2">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="btn-31 text-xs cursor-pointer"
            >
              <span className="text-container">
                <span className="text flex items-center gap-2">
                  {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>Import & Run Prioritization</span>
                </span>
              </span>
            </button>
          </div>
        )}

        {statusMessage && (
          <div className="p-3 rounded-xl bg-[#ECFDF3] border border-[#A7F3D0] text-xs text-[#059669] flex items-center justify-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#059669]" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-xs text-[#DC2626] flex items-center justify-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-[#DC2626]" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Public Dataset Adapter Schema Mapping Card */}
      <div className="surface-card p-6 space-y-3">
        <h3 className="text-sm font-bold text-[#101828] flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-[#0891B2]" />
          Public Dataset Schema Adapter (ADNI & OASIS Mappings)
        </h3>
        <p className="text-xs text-[#667085]">
          Canonical normalization mapping table converting public open research schemas into unified patient schema
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#F8FAFC] text-[#667085] border-b border-[#EAECF0] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3">Canonical Field</th>
                <th className="py-3 px-3">ADNI Schema Equivalent</th>
                <th className="py-3 px-3">OASIS Schema Equivalent</th>
                <th className="py-3 px-3">Description & Bounds</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAECF0] font-sans">
              {schemaMappings.map((m) => (
                <tr key={m.canonical} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-3 font-bold text-[#087E8B] font-mono">{m.canonical}</td>
                  <td className="py-3 px-3 text-[#D97706] font-mono font-semibold">{m.adni}</td>
                  <td className="py-3 px-3 text-[#7C3AED] font-mono font-semibold">{m.oasis}</td>
                  <td className="py-3 px-3 text-[#475467] text-xs font-medium">{m.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

