import React, { useEffect, useState } from 'react';
import { Cpu, ShieldCheck, BarChart2, AlertTriangle, Users, Sliders, RotateCw } from 'lucide-react';
import { ModelMetricsResponse } from '../../types/model';
import { api } from '../../services/apiClient';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export const ModelExplainabilityView: React.FC = () => {
  const [modelData, setModelData] = useState<ModelMetricsResponse | null>(null);
  const [activeAlgorithm, setActiveAlgorithm] = useState('random_forest');
  const [isSwitching, setIsSwitching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadMetrics = () => {
    setIsLoading(true);
    api.getModelMetrics().then((res) => {
      setModelData(res);
      if (res.metrics?.algorithm) {
        setActiveAlgorithm(res.metrics.algorithm);
      }
    }).catch(console.error)
    .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const handleAlgorithmChange = async (algo: string) => {
    setIsSwitching(true);
    try {
      await api.changeAlgorithm(algo);
      setActiveAlgorithm(algo);
      loadMetrics();
    } catch (err) {
      console.error('Algorithm switch error:', err);
    } finally {
      setIsSwitching(false);
    }
  };

  if (isLoading && !modelData) {
    return (
      <div className="p-12 text-center text-xs text-[#667085] flex flex-col items-center justify-center space-y-3">
        <RotateCw className="w-6 h-6 animate-spin text-[#7C3AED]" />
        <span>Loading model transparency metrics & subgroup fairness audit...</span>
      </div>
    );
  }

  const metrics = modelData?.metrics;
  const card = modelData?.transparency_card;
  const features = Array.isArray(modelData?.feature_importances) ? modelData.feature_importances : [];
  const fairness = Array.isArray(modelData?.fairness_audit) ? modelData.fairness_audit : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl font-extrabold text-[#101828] tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#7C3AED]" />
            Model Transparency & Global Explainability
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Transparent machine learning pipeline metrics, algorithm selection, and fairness audit
          </p>
        </div>

        {/* Algorithm Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <Sliders className="w-3.5 h-3.5 text-[#667085]" />
          <select
            value={activeAlgorithm}
            onChange={(e) => handleAlgorithmChange(e.target.value)}
            disabled={isSwitching}
            className="bg-[#FFFFFF] border border-[#DDD6FE] rounded-xl px-3 py-1.5 text-xs text-[#7C3AED] font-mono font-bold focus:outline-none cursor-pointer shadow-xs"
          >
            <option value="random_forest">Random Forest Classifier</option>
            <option value="gradient_boosting">Gradient Boosting Classifier</option>
            <option value="logistic_regression">Logistic Regression</option>
          </select>
        </div>
      </div>

      {/* Model Transparency Card */}
      <div className="surface-card p-6 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#7C3AED] uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-[#7C3AED]" />
          <span>Model Transparency Card</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#EAECF0]">
            <span className="text-[#667085] block font-medium">Model Architecture:</span>
            <span className="text-[#101828] font-bold mt-1 block">{card?.model_type || 'Interpretable Classifier'}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#EAECF0]">
            <span className="text-[#667085] block font-medium">Dataset Source:</span>
            <span className="text-[#101828] font-bold mt-1 block">{card?.dataset || 'Synthetic Demonstration Cohort (ADNI-Compatible Schema)'}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE]">
            <span className="text-[#667085] block font-medium">Intended Purpose:</span>
            <span className="text-[#7C3AED] font-bold mt-1 block">{card?.purpose || 'Patient Prioritization'}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#EAECF0]">
            <span className="text-[#667085] block font-medium">Output Definition:</span>
            <span className="text-[#101828] font-bold mt-1 block">{card?.output || 'Priority Score (0-100)'}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
            <span className="text-[#667085] block font-medium">Clinical Validation Status:</span>
            <span className="text-[#D97706] font-bold mt-1 block">{card?.clinical_status || 'Not Validated'}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#ECFDF3] border border-[#A7F3D0]">
            <span className="text-[#667085] block font-medium">Validation Split:</span>
            <span className="text-[#059669] font-bold mt-1 block">80/20 Train/Test Split</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#D97706] flex items-center gap-2 font-medium">
          <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0" />
          <span>{card?.disclaimer || 'Decision support score output only — not a clinical diagnosis.'}</span>
        </div>
      </div>

      {/* Model Performance Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
        <div className="surface-card p-4">
          <span className="text-[10px] text-[#667085] uppercase font-bold block">ROC-AUC</span>
          <span className="text-xl font-mono font-extrabold text-[#0891B2] mt-1 block">{metrics?.roc_auc !== undefined ? metrics.roc_auc : 'N/A'}</span>
        </div>
        <div className="surface-card p-4">
          <span className="text-[10px] text-[#667085] uppercase font-bold block">Accuracy</span>
          <span className="text-xl font-mono font-extrabold text-[#059669] mt-1 block">{metrics?.accuracy !== undefined ? metrics.accuracy : 'N/A'}</span>
        </div>
        <div className="surface-card p-4">
          <span className="text-[10px] text-[#667085] uppercase font-bold block">Precision</span>
          <span className="text-xl font-mono font-extrabold text-[#D97706] mt-1 block">{metrics?.precision !== undefined ? metrics.precision : 'N/A'}</span>
        </div>
        <div className="surface-card p-4">
          <span className="text-[10px] text-[#667085] uppercase font-bold block">Recall</span>
          <span className="text-xl font-mono font-extrabold text-[#7C3AED] mt-1 block">{metrics?.recall !== undefined ? metrics.recall : 'N/A'}</span>
        </div>
        <div className="surface-card p-4">
          <span className="text-[10px] text-[#667085] uppercase font-bold block">F1 Score</span>
          <span className="text-xl font-mono font-extrabold text-[#7C3AED] mt-1 block">{metrics?.f1_score !== undefined ? metrics.f1_score : 'N/A'}</span>
        </div>
      </div>

      {/* Demographic Subgroup Fairness Audit Card */}
      <div className="surface-card p-6 space-y-3">
        <h3 className="text-sm font-bold text-[#101828] flex items-center gap-2">
          <Users className="w-4 h-4 text-[#059669]" />
          Demographic Subgroup Fairness & Parity Audit
        </h3>
        <p className="text-xs text-[#667085]">
          Evaluates model classification accuracy parity across demographic subgroups to monitor potential bias
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-1">
          {fairness.map((sub: any) => (
            <div key={sub.group} className="p-3 rounded-xl bg-[#F8FAFC] border border-[#EAECF0] space-y-1">
              <span className="text-[#101828] font-bold block">{sub.group}</span>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#667085]">Sample:</span>
                <span className="font-mono font-semibold text-[#101828]">{sub.sample_size}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#667085]">Accuracy:</span>
                <span className="font-mono font-bold text-[#059669]">
                  {sub.accuracy !== undefined ? `${(sub.accuracy * 100).toFixed(1)}%` : 'N/A'}
                </span>
              </div>
            </div>
          ))}

          {fairness.length === 0 && (
            <div className="sm:col-span-4 p-3 text-center text-xs text-[#667085]">
              Subgroup fairness audit data will be displayed once the cohort model evaluation completes.
            </div>
          )}
        </div>
      </div>

      {/* Global Feature Importance Chart */}
      <div className="surface-card p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[#101828] flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#7C3AED]" />
            Global Feature Importance Breakdown
          </h3>
          <p className="text-xs text-[#667085] mt-0.5">
            Ranked influence of structured variables across the ensemble model
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={features.slice(0, 10)} layout="vertical">
              <XAxis type="number" stroke="#98A2B3" fontSize={10} />
              <YAxis dataKey="feature_name" type="category" stroke="#475467" fontSize={11} width={160} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAECF0', borderRadius: '8px', fontSize: '12px', color: '#101828' }}
                formatter={(val: any) => [`${val}%`, 'Global Importance']}
              />
              <Bar dataKey="importance_pct" fill="#7C3AED" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

