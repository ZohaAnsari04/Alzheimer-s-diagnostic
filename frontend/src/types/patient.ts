export interface CognitiveAssessment {
  mmse_score?: number | null;
  moca_score?: number | null;
  cognitive_decline_indicator?: boolean;
  memory_decline_flag?: boolean;
  executive_fn_score?: number | null;
}

export interface ClinicalIndicators {
  comorbidities_count?: number;
  hypertension?: boolean;
  diabetes?: boolean;
  smoking_history?: boolean;
  family_history_alzheimers?: boolean;
}

export interface BloodMarkers {
  abeta_42_44_ratio?: number | null;
  ptau_181?: number | null;
  ptau_217?: number | null;
  nfl?: number | null;
  apoe4_carrier?: boolean;
}

export interface ImagingFeatures {
  hippocampal_volume_mm3?: number | null;
  entorhinal_cortical_thickness?: number | null;
  ventricle_volume_ratio?: number | null;
  mri_completed?: boolean;
}

export interface FactorContribution {
  factor_name: string;
  points: number;
  percentage: number;
  description: string;
}

export interface PrioritizationResult {
  priority_score: number;
  priority_level: 'HIGH' | 'MEDIUM' | 'LOW';
  key_contributing_factor: string;
  recommended_next_stage: string;
  model_version: string;
  generated_at?: string;
  factor_contributions?: FactorContribution[];
}

export interface Patient {
  id: number;
  patient_id: string;
  age: number;
  sex?: string;
  current_stage: string;
  review_status: string;
  created_at: string;
  updated_at: string;
  cognitive_assessment?: CognitiveAssessment;
  clinical_indicators?: ClinicalIndicators;
  blood_markers?: BloodMarkers;
  imaging_features?: ImagingFeatures;
  prioritization_result?: PrioritizationResult;
}

export interface PatientListResponse {
  total: number;
  page: number;
  page_size: number;
  patients: Patient[];
}
