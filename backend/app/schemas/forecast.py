from typing import List, Optional
from pydantic import BaseModel, Field


class ForecastRequest(BaseModel):
    store: int = Field(..., ge=1, description="Store identifier integer")
    item: int = Field(..., ge=1, description="Item identifier integer")
    horizon_days: int = Field(14, description="Forecast horizon in days: 7, 14, or 30")


class ForecastPoint(BaseModel):
    date: str
    predicted_sales: float
    lower_bound: float
    upper_bound: float


class ForecastResponse(BaseModel):
    store: int
    item: int
    horizon_days: int
    model_name: str
    model_version: str
    forecast_generated_at: str
    total_forecasted_demand: float
    mean_daily_forecast: float
    predictions: List[ForecastPoint]

