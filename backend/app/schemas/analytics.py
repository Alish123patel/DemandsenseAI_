from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class DatasetSchemaInfo(BaseModel):
    required_columns: List[str]
    column_descriptions: Dict[str, str]
    max_upload_size_mb: int


class DatasetSummaryResponse(BaseModel):
    is_valid: bool
    total_rows: int
    unique_stores: int
    unique_items: int
    date_min: str
    date_max: str
    total_days: int
    total_sales: float
    mean_daily_sales: float
    seasonality: Optional[Dict[str, Any]] = None


class SeriesListResponse(BaseModel):
    stores: List[int]
    items: List[int]


class HistoryPoint(BaseModel):
    date: str
    sales: float


class HistoryResponse(BaseModel):
    store: int
    item: int
    total_points: int
    data: List[HistoryPoint]

