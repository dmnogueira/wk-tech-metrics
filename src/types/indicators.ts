// Types for WK.metrics Indicators System

export interface Indicator {
  id: string;
  is_active: boolean;
  is_kr: boolean;
  priority: number;
  name: string;
  acronym: string;
  type: 'Upstream' | 'Downstream' | null;
  category: string;
  description?: string;
  objective?: string;
  calculation_formula?: string;
  action_when_bad?: string;
  result_when_good?: string;
  suggested_target?: string;
  default_granularity?: string;
  segmentation?: string;
  azure_devops_source?: string;
  base_query?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface IndicatorValue {
  id: string;
  indicator_id: string;
  value?: number;
  text_value?: string;
  period_type: 'sprint' | 'mensal' | 'trimestral' | 'anual';
  period_start: string;
  period_end: string;
  squad_id?: string;
  product_name?: string;
  comparison_value?: number;
  comparison_percentage?: number;
  status: 'critical' | 'warning' | 'excellent' | 'neutral';
  source: 'manual' | 'import' | 'api' | 'azure_devops';
  import_batch_id?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  
  // Relations
  indicator?: Indicator;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'azure_devops' | 'sonarqube' | 'jira' | 'custom_api';
  connection_config: Record<string, any>;
  is_active: boolean;
  last_sync_at?: string;
  last_sync_status?: 'success' | 'error' | 'partial';
  last_sync_message?: string;
  sync_frequency?: 'daily' | 'weekly' | 'manual';
  sync_schedule_cron?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface IndicatorDataMapping {
  id: string;
  indicator_id: string;
  data_source_id: string;
  query_config?: Record<string, any>;
  field_mapping?: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

export interface ImportBatch {
  id: string;
  filename?: string;
  record_count: number;
  success_count: number;
  error_count: number;
  status: 'processing' | 'completed' | 'failed';
  errors?: any[];
  created_at: string;
  created_by?: string;
}

// Form types for creating/editing
export type IndicatorFormData = Omit<Indicator, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>;

export type IndicatorValueFormData = Omit<IndicatorValue, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'indicator'>;
