from fastapi import APIRouter, HTTPException, Query
from pathlib import Path
import json
from app.schemas.analytics import DatasetSummaryResponse, SeriesListResponse, HistoryResponse
from app.services.forecasting import forecasting_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary", response_model=DatasetSummaryResponse)
def get_analytics_summary():
    """Returns comprehensive summary and seasonality metrics for the active dataset."""
    summary_path = Path("ml/reports/data_quality_summary.json")
    if not summary_path.exists():
        raise HTTPException(status_code=404, detail="Data summary report not generated yet.")

    with open(summary_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    stats = data["validation"]["stats"]
    return DatasetSummaryResponse(
        is_valid=data["validation"]["is_valid"],
        total_rows=stats["total_rows"],
        unique_stores=stats["unique_stores"],
        unique_items=stats["unique_items"],
        date_min=stats["date_min"],
        date_max=stats["date_max"],
        total_days=stats["total_days"],
        total_sales=stats["total_sales"],
        mean_daily_sales=stats["mean_daily_sales"],
        seasonality=data.get("seasonality"),
    )


@router.get("/series", response_model=SeriesListResponse)
def get_series_list():
    """Returns the list of unique store IDs and item IDs available in the dataset."""
    try:
        series_info = forecasting_service.get_available_series()
        return SeriesListResponse(
            stores=series_info["stores"],
            items=series_info["items"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history", response_model=HistoryResponse)
def get_series_history(
    store: int = Query(..., ge=1),
    item: int = Query(..., ge=1),
    limit: int = Query(180, ge=7, le=1826),
):
    """Returns actual historical daily sales data points for a specific store and item."""
    try:
        history_points = forecasting_service.get_history(store=store, item=item, limit=limit)
        return HistoryResponse(
            store=store,
            item=item,
            total_points=len(history_points),
            data=history_points,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

