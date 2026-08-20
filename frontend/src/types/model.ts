export interface FeatureImportance {
  feature_key: string;
  feature_name: string;
  importance: number;
  importance_pct: number;
}

export interface ModelMetrics {
  algorithm?: string;
  model_type: string;
  dataset_name: string;
  feature_count: number;
  training_records: number;
  validation_records: number;
  roc_auc: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  status: string;
}

export interface TransparencyCard {
  model_type: string;
  dataset: string;
  purpose: string;
  output: string;
  clinical_status: string;
  disclaimer: string;
}

export interface ModelMetricsResponse {
  metrics: ModelMetrics;
  feature_importances: FeatureImportance[];
  transparency_card: TransparencyCard;
  fairness_audit?: any[];
}
