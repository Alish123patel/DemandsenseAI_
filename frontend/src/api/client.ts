import {
  HealthResponse,
  DatasetSummary,
  DatasetSchemaInfo,
  ValidationReport,
  SeriesList,
  HistoryResponse,
  ForecastRequest,
  ForecastResponse,
  InventoryRequest,
  InventoryResponse,
  ModelInfoResponse,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorDetail = response.statusText;
    try {
      const errorJson = await response.json();
      if (errorJson.detail) {
        errorDetail = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(`API error (${response.status}): ${errorDetail}`);
  }

  return response.json();
}

export async function fetchHealth(): Promise<HealthResponse> {
  return request<HealthResponse>('/health');
}

export async function fetchDatasetSchema(): Promise<DatasetSchemaInfo> {
  return request<DatasetSchemaInfo>('/api/v1/datasets/schema');
}

export async function fetchAnalyticsSummary(): Promise<DatasetSummary> {
  return request<DatasetSummary>('/api/v1/analytics/summary');
}

export async function fetchSeriesList(): Promise<SeriesList> {
  return request<SeriesList>('/api/v1/analytics/series');
}

export async function fetchSeriesHistory(store: number, item: number, limit: number = 90): Promise<HistoryResponse> {
  return request<HistoryResponse>(`/api/v1/analytics/history?store=${store}&item=${item}&limit=${limit}`);
}

export async function fetchForecast(req: ForecastRequest): Promise<ForecastResponse> {
  return request<ForecastResponse>('/api/v1/forecast', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function fetchInventoryRecommendation(req: InventoryRequest): Promise<InventoryResponse> {
  return request<InventoryResponse>('/api/v1/inventory/recommendation', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function fetchModelInfo(): Promise<ModelInfoResponse> {
  return request<ModelInfoResponse>('/api/v1/model/info');
}

export async function uploadDataset(file: File): Promise<{ success: boolean; message: string; report: ValidationReport }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/v1/datasets/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorDetail = response.statusText;
    try {
      const errJson = await response.json();
      if (errJson.detail) errorDetail = errJson.detail;
    } catch {
      // ignore
    }
    throw new Error(`Upload failed (${response.status}): ${errorDetail}`);
  }

  return response.json();
}

export function getExportUrl(): string {
  return `${API_BASE_URL}/api/v1/forecast/export`;
}

export { API_BASE_URL };
