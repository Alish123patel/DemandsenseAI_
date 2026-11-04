"""Data validation and canonical transformation layer."""
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np


@dataclass
class ValidationResult:
    is_valid: bool
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    stats: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "is_valid": self.is_valid,
            "errors": self.errors,
            "warnings": self.warnings,
            "stats": self.stats,
        }


REQUIRED_COLUMNS = ["date", "store", "item", "sales"]


def validate_dataset(df: pd.DataFrame) -> ValidationResult:
    """Validates that a DataFrame strictly conforms to the DemandSense AI sales schema."""
    errors: List[str] = []
    warnings: List[str] = []
    stats: Dict[str, Any] = {}

    if df is None or df.empty:
        return ValidationResult(is_valid=False, errors=["Dataset is empty or contains zero rows."])

    # 1. Column presence check
    missing_cols = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing_cols:
        errors.append(f"Missing required columns: {missing_cols}. Expected {REQUIRED_COLUMNS}.")
        return ValidationResult(is_valid=False, errors=errors)

    stats["total_rows"] = int(len(df))

    # 2. Null values check
    null_counts = df[REQUIRED_COLUMNS].isnull().sum().to_dict()
    stats["null_counts"] = {k: int(v) for k, v in null_counts.items()}
    has_nulls = any(v > 0 for v in null_counts.values())
    if has_nulls:
        errors.append(f"Dataset contains null values in required columns: {null_counts}")

    # 3. Date parsing validation
    try:
        parsed_dates = pd.to_datetime(df["date"], errors="coerce")
        invalid_dates = parsed_dates.isnull().sum()
        if invalid_dates > 0:
            errors.append(f"Found {int(invalid_dates)} row(s) with unparseable date values.")
        else:
            stats["date_min"] = parsed_dates.min().strftime("%Y-%m-%d")
            stats["date_max"] = parsed_dates.max().strftime("%Y-%m-%d")
            stats["total_days"] = int((parsed_dates.max() - parsed_dates.min()).days + 1)
    except Exception as e:
        errors.append(f"Failed to parse dates: {e}")

    # 4. Store and Item identifiers validation
    for col in ["store", "item"]:
        if not pd.api.types.is_numeric_dtype(df[col]):
            try:
                converted = pd.to_numeric(df[col], errors="coerce")
                if converted.isnull().any():
                    errors.append(f"Column '{col}' contains non-numeric identifiers.")
            except Exception:
                errors.append(f"Column '{col}' must contain integer identifiers.")
        else:
            if (df[col] < 1).any():
                warnings.append(f"Column '{col}' contains values less than 1.")

    # 5. Sales target validation
    if not pd.api.types.is_numeric_dtype(df["sales"]):
        try:
            converted_sales = pd.to_numeric(df["sales"], errors="coerce")
            if converted_sales.isnull().any():
                errors.append("Column 'sales' contains non-numeric values.")
        except Exception:
            errors.append("Column 'sales' must be numeric.")
    else:
        negative_sales = int((df["sales"] < 0).sum())
        if negative_sales > 0:
            errors.append(f"Found {negative_sales} row(s) with negative sales values. Sales cannot be negative.")

    # 6. Duplicates check on (date, store, item)
    duplicate_count = int(df.duplicated(subset=["date", "store", "item"]).sum())
    stats["duplicate_rows"] = duplicate_count
    if duplicate_count > 0:
        errors.append(
            f"Found {duplicate_count} duplicate records for (date, store, item). "
            "Each store-item-date observation must be unique."
        )

    # 7. Descriptive statistics
    if not errors:
        stats["unique_stores"] = int(df["store"].nunique())
        stats["unique_items"] = int(df["item"].nunique())
        stats["store_list"] = sorted([int(s) for s in df["store"].unique()])
        stats["item_list"] = sorted([int(i) for i in df["item"].unique()])
        stats["total_sales"] = float(df["sales"].sum())
        stats["mean_daily_sales"] = float(round(df["sales"].mean(), 2))
        stats["median_daily_sales"] = float(round(df["sales"].median(), 2))
        stats["std_daily_sales"] = float(round(df["sales"].std(), 2))
        stats["min_daily_sales"] = float(df["sales"].min())
        stats["max_daily_sales"] = float(df["sales"].max())

        # Outlier calculation via IQR (for profiling, non-destructive)
        q25 = df["sales"].quantile(0.25)
        q75 = df["sales"].quantile(0.75)
        iqr = q75 - q25
        upper_bound = q75 + (1.5 * iqr)
        outlier_count = int((df["sales"] > upper_bound).sum())
        stats["iqr_outliers_count"] = outlier_count
        if outlier_count > 0:
            warnings.append(
                f"Identified {outlier_count} observations above the 1.5x IQR upper threshold ({round(upper_bound, 1)}). "
                "These are preserved as natural retail peak signals."
            )

    is_valid = len(errors) == 0
    return ValidationResult(is_valid=is_valid, errors=errors, warnings=warnings, stats=stats)


def create_canonical_dataset(df: pd.DataFrame) -> pd.DataFrame:
    """Produces a clean canonical DataFrame sorted chronologically per store-item series."""
    canonical = df.copy()
    canonical["date"] = pd.to_datetime(canonical["date"])
    canonical["store"] = canonical["store"].astype(int)
    canonical["item"] = canonical["item"].astype(int)
    canonical["sales"] = canonical["sales"].astype(float)
    canonical = canonical.sort_values(by=["store", "item", "date"]).reset_index(drop=True)
    return canonical

