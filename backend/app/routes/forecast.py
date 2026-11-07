from fastapi import APIRouter, HTTPException, Response
import io
import pandas as pd
from app.schemas.forecast import ForecastRequest, ForecastResponse
from app.services.forecasting import forecasting_service

router = APIRouter(prefix="/forecast", tags=["Forecasting"])


@router.post("", response_model=ForecastResponse)
def request_forecast(payload: ForecastRequest):
    """Generates multi-step demand forecast for the requested store and item series."""
    try:
        result = forecasting_service.generate_forecast(
            store=payload.store,
            item=payload.item,
            horizon_days=payload.horizon_days,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=f"Model artifact unavailable: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecast generation failed: {e}")


@router.post("/export")
def export_forecast_csv(payload: ForecastRequest):
    """Generates and exports the forecast predictions directly as a CSV file download."""
    try:
        result = forecasting_service.generate_forecast(
            store=payload.store,
            item=payload.item,
            horizon_days=payload.horizon_days,
        )
        preds = result["predictions"]
        export_df = pd.DataFrame(preds)
        export_df.insert(0, "item", payload.item)
        export_df.insert(0, "store", payload.store)

        output = io.StringIO()
        export_df.to_csv(output, index=False)
        csv_data = output.getvalue()

        filename = f"forecast_store{payload.store}_item{payload.item}_{payload.horizon_days}d.csv"
        return Response(
            content=csv_data,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=f"Model artifact unavailable: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

