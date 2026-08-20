import React from 'react';
import { Scale, ShieldAlert, CheckCircle2, XCircle, AlertTriangle, UserCheck } from 'lucide-react';

export const EthicsLimitationsView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#EAECF0] flex items-center justify-between shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#101828] flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#0891B2]" />
            Ethics, Safety Boundaries & System Limitations
          </h2>
          <p className="text-xs text-[#667085] mt-0.5">
            Transparent disclosure of scope, boundaries, dataset assumptions, and human oversight mandates
          </p>
        </div>
      </div>

      {/* Intended vs Not Intended Use Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Intended Use */}
        <div className="surface-card p-5 space-y-3 border-t-4 border-t-[#059669]">
          <h3 className="text-sm font-bold text-[#059669] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Intended Use (Clinical Decision Support)
          </h3>
          <ul className="space-y-2 text-xs text-[#475467] list-disc list-inside leading-relaxed font-medium">
            <li>Ranking screened patient populations for progressive diagnostic evaluation.</li>
            <li>Assisting clinical teams in prioritizing limited MRI, PET, and specialist bandwidth.</li>
            <li>Transparently explaining factors contributing to diagnostic prioritization scores.</li>
            <li>Guiding patient progression across 4 explicit screening stages.</li>
          </ul>
        </div>

        {/* Not Intended Use */}
        <div className="surface-card p-5 space-y-3 border-t-4 border-t-[#DC2626]">
          <h3 className="text-sm font-bold text-[#DC2626] flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Strictly Prohibited & Out-of-Scope
          </h3>
          <ul className="space-y-2 text-xs text-[#475467] list-disc list-inside leading-relaxed font-medium">
            <li>Diagnosing Alzheimer's disease or mild cognitive impairment (MCI).</li>
            <li>Recommending medication, pharmaceutical therapy, or clinical treatment.</li>
            <li>Claiming medical accuracy or regulatory FDA/CE clearance.</li>
            <li>Replacing professional clinical judgment or direct patient examination.</li>
          </ul>
        </div>
      </div>

      {/* Detailed Limitations Card */}
      <div className="surface-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#101828] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#D97706]" />
          Technical & Clinical Limitations Disclosure
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#EAECF0] space-y-1">
            <span className="font-bold text-[#087E8B] block">1. Prototype System</span>
            <p className="text-[#667085]">
              This application is an early-stage hackathon prototype designed for workflow demonstration and research evaluation only.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] space-y-1">
            <span className="font-bold text-[#D97706] block">2. Not Clinically Validated</span>
            <p className="text-[#667085]">
              Prioritization models and threshold parameters have not undergone prospective clinical trials or regulatory review.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#EAECF0] space-y-1">
            <span className="font-bold text-[#087E8B] block">3. Dataset Assumptions</span>
            <p className="text-[#667085]">
              Models are trained on synthetic cohorts structured after public benchmarks (ADNI / OASIS). Generalization to diverse populations is unverified.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE] space-y-1">
            <span className="font-bold text-[#7C3AED] block">4. Potential Demographic Bias</span>
            <p className="text-[#667085]">
              Baseline datasets may reflect sampling biases across age, sex, and socioeconomic factors. Scores must be evaluated within clinical context.
            </p>
          </div>
        </div>
      </div>

      {/* Human Oversight Mandate Banner */}
      <div className="p-5 rounded-xl bg-[#ECFEFF] border border-[#A5F3FC] text-xs text-[#101828] flex items-start gap-3 shadow-xs">
        <UserCheck className="w-5 h-5 text-[#0891B2] shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-[#087E8B] text-sm">Human-in-the-Loop Clinical Oversight</h4>
          <p className="mt-1 leading-relaxed text-[#475467] font-medium">
            NeuroPath AI operates under a mandatory human-in-the-loop paradigm. Final decisions regarding patient scheduling, imaging referrals, and clinical workups remain strictly with qualified neurologists and healthcare providers.
          </p>
        </div>
      </div>
    </div>
  );
};

