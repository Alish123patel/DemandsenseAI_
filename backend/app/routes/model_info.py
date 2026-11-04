from fastapi import APIRouter, HTTPException
from app.services.forecasting import forecasting_service

router = APIRouter(prefix="/model", tags=["Model"])


@router.get("/info")
def get_model_info():
    """Returns training metadata, feature definitions, holdout performance, and baseline comparison."""
    try:
        metadata = forecasting_service.get_metadata()
        return metadata
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

