from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import io
import pandas as pd
from app.schemas.analytics import DatasetSchemaInfo
from ml.preprocessing.validate import validate_dataset, REQUIRED_COLUMNS

router = APIRouter(prefix="/datasets", tags=["Datasets"])


@router.get("/schema", response_model=DatasetSchemaInfo)
def get_dataset_schema():
    """Returns required columns, data types, and upload size constraints."""
    return DatasetSchemaInfo(
        required_columns=REQUIRED_COLUMNS,
        column_descriptions={
            "date": "Observation date in YYYY-MM-DD format (ISO 8601)",
            "store": "Store identifier (positive integer)",
            "item": "Item SKU identifier (positive integer)",
            "sales": "Units sold on that day (non-negative number)",
        },
        max_upload_size_mb=50,
    )


@router.post("/validate")
async def validate_uploaded_dataset(file: UploadFile = File(...)):
    """Validates an uploaded CSV without committing it as active dataset."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only CSV files are supported.")

    content = await file.read()
    if len(content) > 50 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File exceeds 50MB upload size limit.")

    try:
        df = pd.read_csv(io.BytesIO(content), low_memory=False)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {e}")

    result = validate_dataset(df)
    return result.to_dict()


@router.post("/upload")
async def upload_active_dataset(file: UploadFile = File(...)):
    """Validates and stages a user CSV dataset."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only CSV files are supported.")

    content = await file.read()
    if len(content) > 50 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File exceeds 50MB upload size limit.")

    try:
        df = pd.read_csv(io.BytesIO(content), low_memory=False)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {e}")

    result = validate_dataset(df)
    if not result.is_valid:
        return {
            "success": False,
            "message": "Dataset validation failed.",
            "report": result.to_dict(),
        }

    return {
        "success": True,
        "message": f"Successfully ingested '{file.filename}' ({result.stats['total_rows']:,} rows).",
        "report": result.to_dict(),
    }

