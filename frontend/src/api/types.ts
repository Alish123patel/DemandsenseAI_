export interface HealthResponse {
  status: string;
  version: string;
  environment: string;
  service: string;
}

export interface DatasetSummary {
  is_valid: boolean;
  total_rows: number;
  unique_stores: number;
  unique_items: number;
  date_min: string;
  date_max: string;
  total_days: number;
  total_sales: number;
  mean_daily_sales: number;
  seasonality?: {
    day_of_week_mean_sales: Record<string, number>;
    monthly_mean_sales: Record<string, number>;
  };
}

export interface SeriesList {
  stores: number[];
  items: number[];
}

export interface HistoryPoint {
  date: string;
  sales: number;
}

export interface HistoryResponse {
  store: number;
  item: number;
  total_points: number;
  data: HistoryPoint[];
}

export interface ForecastRequest {
  store: number;
  item: number;
  horizon_days: number;
}

export interface ForecastPoint {
  date: string;
  predicted_sales: number;
  lower_bound: number;
  upper_bound: number;
}

export interface ForecastResponse {
  store: number;
  item: number;
  horizon_days: number;
  model_name: string;
  model_version: string;
  forecast_generated_at: string;
  total_forecasted_demand: number;
  mean_daily_forecast: number;
  predictions: ForecastPoint[];
}

export interface InventoryRequest {
  store: number;
  item: number;
  current_stock: number;
  supplier_lead_time_days: number;
  incoming_stock?: number;
  safety_stock_buffer_percent?: number;
}

export interface InventoryResponse {
  store: number;
  item: number;
  current_stock: number;
  supplier_lead_time_days: number;
  incoming_stock: number;
  safety_stock_buffer_percent: number;
  expected_demand_during_lead_time: number;
  safety_stock: number;
  reorder_point: number;
  suggested_order_quantity: number;
  reorder_recommended: boolean;
  assumptions: string[];
}

export interface DatasetSchemaInfo {
  required_columns: string[];
  column_descriptions: Record<string, string>;
  max_upload_size_mb: number;
}

export interface ValidationReport {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    total_rows?: number;
    null_counts?: Record<string, number>;
    date_min?: string;
    date_max?: string;
    total_days?: number;
    duplicate_rows?: number;
    unique_stores?: number;
    unique_items?: number;
    total_sales?: number;
    mean_daily_sales?: number;
    std_daily_sales?: number;
  };
}

export interface MetricSet {
  MAE: number;
  RMSE: number;
  WAPE: number;
  sMAPE: number;
}

export interface ModelInfoResponse {
  model_name: string;
  version: string;
  trained_at: string;
  feature_columns: string[];
  target_column: string;
  split_config: {
    train_end: string;
    val_start: string;
    val_end: string;
    test_start: string;
    test_end: string;
  };
  selected_metrics: {
    val: MetricSet;
    test: MetricSet;
  };
  benchmark_comparison: Record<string, { val: MetricSet; test: MetricSet }>;
  intended_use: string;
  limitations: string[];
}
