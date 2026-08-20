export interface DashboardSummary {
  total_screened: number;
  high_priority: number;
  medium_priority: number;
  low_priority: number;
  mri_candidates: number;
  pet_candidates: number;
  biomarker_candidates: number;
  pending_review: number;
  completed_review: number;
}

export interface PriorityDistribution {
  level: string;
  count: number;
  percentage: number;
}

export interface StageCount {
  stage: string;
  count: number;
  percentage: number;
  candidates_awaiting_review: number;
}

export interface FunnelStep {
  stage: string;
  count: number;
  conversion_rate: number;
}

export interface AnalyticsData {
  summary: DashboardSummary;
  priority_distribution: PriorityDistribution[];
  stage_breakdown: StageCount[];
  funnel: FunnelStep[];
  recommended_next_stages: { stage: string; count: number; percentage: number }[];
  score_histogram: { range: string; count: number }[];
  age_distribution: { group: string; count: number; percentage: number }[];
  missing_data_summary: { domain: string; missing_count: number; missing_pct: number }[];
}

export interface ResourceCapacityResponse {
  config: {
    mri_daily_capacity: number;
    pet_daily_capacity: number;
    biomarker_daily_capacity: number;
  };
  mri_demand: number;
  pet_demand: number;
  biomarker_demand: number;
  mri_utilization_pct: number;
  pet_utilization_pct: number;
  biomarker_utilization_pct: number;
  mri_wait_days: number;
  pet_wait_days: number;
  disclaimer: string;
}
