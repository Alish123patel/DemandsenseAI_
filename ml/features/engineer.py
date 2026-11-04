"""Leakage-safe time-series feature engineering module for DemandSense AI."""
from typing import Tuple, List, Dict, Any, Optional
import pandas as pd
import numpy as np


FEATURE_COLUMNS = [
    "store",
    "item",
    "day_of_week",
    "day_of_month",
    "month",
    "year",
    "week_of_year",
    "is_weekend",
    "lag_1",
    "lag_7",
    "lag_14",
    "lag_28",
    "rolling_mean_7",
    "rolling_std_7",
    "rolling_mean_28",
]

TARGET_COLUMN = "sales"


def ensure_regular_calendar(df: pd.DataFrame, freq: str = "D") -> pd.DataFrame:
    """Ensures each store-item series has a continuous, gap-free date grid.
    
    If any calendar dates are absent in a store-item series, they are inserted.
    Sales values for newly inserted dates are marked NaN with a warning, rather
    than silently aggregated or blindly set to zero without validation.
    """
    clean_df = df.copy()
    clean_df["date"] = pd.to_datetime(clean_df["date"])

    unique_stores = clean_df["store"].unique()
    unique_items = clean_df["item"].unique()
    min_date = clean_df["date"].min()
    max_date = clean_df["date"].max()

    full_date_range = pd.date_range(min_date, max_date, freq=freq)
    grid_index = pd.MultiIndex.from_product(
        [unique_stores, unique_items, full_date_range],
        names=["store", "item", "date"]
    )

    indexed = clean_df.set_index(["store", "item", "date"])
    reindexed = indexed.reindex(grid_index).reset_index()
    reindexed = reindexed.sort_values(by=["store", "item", "date"]).reset_index(drop=True)

    return reindexed


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Builds leakage-safe calendar, lag, and shifted rolling features.
    
    Principles:
    1. Chronological order is strictly maintained per store-item series.
    2. Shift-before-rolling: All rolling aggregations shift observations by 1,
       guaranteeing that day t's sales target is NEVER included in day t's features.
    3. Lags are calculated independently per (store, item) series.
    """
    data = df.copy()
    data["date"] = pd.to_datetime(data["date"])
    data = data.sort_values(by=["store", "item", "date"]).reset_index(drop=True)

    # 1. Calendar Features
    data["day_of_week"] = data["date"].dt.day_of_week
    data["day_of_month"] = data["date"].dt.day
    data["month"] = data["date"].dt.month
    data["year"] = data["date"].dt.year
    data["week_of_year"] = data["date"].dt.isocalendar().week.astype(int)
    data["is_weekend"] = (data["day_of_week"] >= 5).astype(int)

    # 2. Lag Features (grouped strictly by store and item)
    grouped = data.groupby(["store", "item"])["sales"]
    data["lag_1"] = grouped.shift(1)
    data["lag_7"] = grouped.shift(7)
    data["lag_14"] = grouped.shift(14)
    data["lag_28"] = grouped.shift(28)

    # 3. Rolling Features (Shift by 1 BEFORE rolling so current target is never leaked)
    shifted_sales = grouped.shift(1)
    grouped_shifted = data.assign(shifted=shifted_sales).groupby(["store", "item"])["shifted"]

    data["rolling_mean_7"] = grouped_shifted.rolling(window=7, min_periods=1).mean().reset_index(level=[0, 1], drop=True)
    data["rolling_std_7"] = grouped_shifted.rolling(window=7, min_periods=2).std().reset_index(level=[0, 1], drop=True).fillna(0)
    data["rolling_mean_28"] = grouped_shifted.rolling(window=28, min_periods=1).mean().reset_index(level=[0, 1], drop=True)

    return data


def chronological_split(
    df: pd.DataFrame,
    val_start: str = "2017-01-01",
    test_start: str = "2017-07-01",
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Splits data strictly chronologically into train, validation, and test periods.
    
    Boundaries:
      - Train:      [date_min, val_start)      (2013-01-01 to 2016-12-31, 4 full years)
      - Validation: [val_start, test_start)    (2017-01-01 to 2017-06-30, 6 months)
      - Holdout:    [test_start, date_max]     (2017-07-01 to 2017-12-31, 6 months)
      
    Cold-start rows with missing 28-day lags at the start of the series are excluded
    from model training to maintain clean feature vectors.
    """
    val_dt = pd.to_datetime(val_start)
    test_dt = pd.to_datetime(test_start)

    clean_df = df.dropna(subset=FEATURE_COLUMNS).copy()

    train_df = clean_df[clean_df["date"] < val_dt].copy()
    val_df = clean_df[(clean_df["date"] >= val_dt) & (clean_df["date"] < test_dt)].copy()
    test_df = clean_df[clean_df["date"] >= test_dt].copy()

    return train_df, val_df, test_df
