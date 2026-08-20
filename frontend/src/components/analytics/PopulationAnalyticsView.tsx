import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  SlidersHorizontal, 
  HelpCircle, 
  TrendingUp, 
  Activity,
  AlertCircle,
  TrendingDown,
  Clock
} from 'lucide-react';
import { AnalyticsData, ResourceCapacityResponse } from '../../types/analytics';
import { api } from '../../services/apiClient';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';

interface PopulationAnalyticsViewProps {
  analytics: AnalyticsData | null;
}

export const PopulationAnalyticsView: React.FC<PopulationAnalyticsViewProps> = ({ analytics }) => {
  const [mriCap, setMriCap] = useState(15);
  const [petCap, setPetCap] = useState(5);
  const [bioCap, setBioCap] = useState(40);
  const [capacityData, setCapacityData] = useState<ResourceCapacityResponse | null>(null);
  const [impactData, setImpactData] = useState<any>(null);

  useEffect(() => {
    api.getResourceCapacity(mriCap, petCap, bioCap)
      .then(setCapacityData)
      .catch(console.error);

    api.getImpactSavings()
      .then(setImpactData)
      .catch(console.error);
  }, [mriCap, petCap, bioCap]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#EAECF0] flex items-center justify-between shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#101828] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#0891B2]" />
            Population Analytics & Resource Optimization
          </h2>
          <p className="text-xs text-[#667085] mt-0.5">
            Cohort risk distribution, missing data breakdown, and diagnostic capacity planning
          </p>
        </div>
      </div>

      {/* Impact & Efficiency Savings Calculator Card */}
      <div className="p-5 rounded-xl bg-[#FFFFFF] border border-[#EAECF0] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#059669] uppercase tracking-wider">
            <TrendingDown className="w-4 h-4" />
            <span>AI Diagnostic Triage Impact & Efficiency Calculator</span>
          </div>
          <span className="text-[10px] font-mono text-[#667085]">Vs. Un-prioritized Standard Care</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs pt-1">
          <div className="p-3 rounded-xl bg-[#ECFDF3] border border-[#A7F3D0]">
            <span className="text-[#059669] block font-semibold">PET Scans Avoided:</span>
            <div className="text-xl font-extrabold font-mono text-[#059669] mt-1">
              {impactData?.pet_scans_avoided || 0} <span className="text-xs font-normal text-[#667085]">(-{impactData?.pet_reduction_pct || 0}%)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#ECFEFF] border border-[#A5F3FC]">
            <span className="text-[#087E8B] block font-semibold">MRI Scans Triaged:</span>
            <div className="text-xl font-extrabold font-mono text-[#087E8B] mt-1">
              {impactData?.mri_scans_avoided || 0} <span className="text-xs font-normal text-[#667085]">(-{impactData?.mri_reduction_pct || 0}%)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
            <span className="text-[#D97706] block font-semibold">Estimated Healthcare Savings:</span>
            <div className="text-xl font-extrabold font-mono text-[#D97706] mt-1">
              ${(impactData?.estimated_cost_saved_usd || 0).toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE]">
            <span className="text-[#7C3AED] block font-semibold">MRI Backlog Reduced:</span>
            <div className="text-xl font-extrabold font-mono text-[#7C3AED] mt-1">
              {impactData?.mri_wait_days_saved || 0} days
            </div>
          </div>
        </div>
      </div>

      {/* Resource Optimization View & Interactive Capacity Planner */}
      <div className="surface-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#101828] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#0891B2]" />
              Diagnostic Resource Capacity Overview & Planner
            </h3>
            <p className="text-[11px] text-[#667085] mt-0.5">
              Adjust operational capacities to simulate demand vs capacity
            </p>
          </div>
          <div className="p-2 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-[10px] text-[#D97706] font-medium max-w-xs">
            <AlertCircle className="w-3 h-3 text-[#D97706] inline mr-1" />
            Prototype planning capacity — does not represent real hospital operational data.
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Biomarker Capacity Slider */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#EAECF0] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#101828]">Biomarker Lab Daily Capacity</span>
              <span className="font-mono font-bold text-[#D97706]">{bioCap} tests/day</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={bioCap}
              onChange={(e) => setBioCap(Number(e.target.value))}
              className="w-full accent-[#D97706] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#667085] pt-1">
              <span>Demand: <b className="text-[#101828]">{capacityData?.biomarker_demand || 0}</b></span>
              <span>Utilization: <b className="text-[#D97706]">{capacityData?.biomarker_utilization_pct || 0}%</b></span>
            </div>
          </div>

          {/* MRI Capacity Slider */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#EAECF0] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#101828]">MRI Scanner Daily Capacity</span>
              <span className="font-mono font-bold text-[#0891B2]">{mriCap} scans/day</span>
            </div>
            <input
              type="range"
              min={5}
              max={50}
              value={mriCap}
              onChange={(e) => setMriCap(Number(e.target.value))}
              className="w-full accent-[#0891B2] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#667085] pt-1">
              <span>Demand: <b className="text-[#101828]">{capacityData?.mri_demand || 0}</b></span>
              <span>Est. Backlog: <b className="text-[#087E8B]">{capacityData?.mri_wait_days || 0} days</b></span>
            </div>
          </div>

          {/* PET Capacity Slider */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#EAECF0] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#101828]">PET Scanner Daily Capacity</span>
              <span className="font-mono font-bold text-[#7C3AED]">{petCap} scans/day</span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              value={petCap}
              onChange={(e) => setPetCap(Number(e.target.value))}
              className="w-full accent-[#7C3AED] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#667085] pt-1">
              <span>Demand: <b className="text-[#101828]">{capacityData?.pet_demand || 0}</b></span>
              <span>Est. Backlog: <b className="text-[#7C3AED]">{capacityData?.pet_wait_days || 0} days</b></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Population Conversion Funnel Chart */}
        <div className="surface-card p-5 space-y-3">
          <h3 className="text-sm font-bold text-[#101828]">Population Diagnostic Pathway Funnel</h3>
          <p className="text-[11px] text-[#667085]">Progression conversion counts across diagnostic stages</p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.funnel || []} layout="vertical">
                <XAxis type="number" stroke="#98A2B3" fontSize={10} />
                <YAxis dataKey="stage" type="category" stroke="#475467" fontSize={10} width={130} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAECF0', borderRadius: '8px', fontSize: '12px', color: '#101828' }} />
                <Bar dataKey="count" fill="#0891B2" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Score Distribution Histogram */}
        <div className="surface-card p-5 space-y-3">
          <h3 className="text-sm font-bold text-[#101828]">Diagnostic Score Distribution</h3>
          <p className="text-[11px] text-[#667085]">Score frequency across 10-point priority bins</p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.score_histogram || []}>
                <XAxis dataKey="range" stroke="#98A2B3" fontSize={10} />
                <YAxis stroke="#98A2B3" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAECF0', borderRadius: '8px', fontSize: '12px', color: '#101828' }} />
                <Bar dataKey="count" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age Distribution */}
        <div className="surface-card p-5 space-y-3">
          <h3 className="text-sm font-bold text-[#101828]">Age Stratification</h3>
          <p className="text-[11px] text-[#667085]">Demographic cohort age groupings</p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.age_distribution || []}>
                <XAxis dataKey="group" stroke="#98A2B3" fontSize={10} />
                <YAxis stroke="#98A2B3" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EAECF0', borderRadius: '8px', fontSize: '12px', color: '#101828' }} />
                <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Missing Data Distribution */}
        <div className="surface-card p-5 space-y-3">
          <h3 className="text-sm font-bold text-[#101828]">Missing Data Audit Summary</h3>
          <p className="text-[11px] text-[#667085]">Audit of incomplete measurements per clinical domain</p>

          <div className="space-y-3 pt-2">
            {analytics?.missing_data_summary?.map((m) => (
              <div key={m.domain} className="p-3 rounded-lg bg-[#F8FAFC] border border-[#EAECF0] space-y-1.5 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-[#101828] font-bold">{m.domain}</span>
                  <span className="text-[#D97706] font-mono font-bold">{m.missing_count} missing ({m.missing_pct}%)</span>
                </div>
                <div className="w-full bg-[#EAECF0] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#D97706] h-full rounded-full" style={{ width: `${Math.min(100, m.missing_pct)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

