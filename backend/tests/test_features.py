import pytest
import pandas as pd
import numpy as np
from ml.features.engineer import (
    engineer_features,
    chronological_split,
    ensure_regular_calendar,
    FEATURE_COLUMNS,
)


def test_leakage_prevention_on_hand_calculated_example():
    """Explicitly verifies that the target day's sales value is NOT in rolling or lag features."""
    dates = pd.date_range("2023-01-01", periods=10, freq="D")
    sales_values = [10.0, 20.0, 30.0, 40.0, 50.0, 60.0, 70.0, 80.0, 90.0, 100.0]

    df = pd.DataFrame({
        "date": dates,
        "store": [1] * 10,
        "item": [1] * 10,
        "sales": sales_values,
    })

    featured = engineer_features(df)

    # For day index 2 (2023-01-03, actual sales = 30.0):
    # lag_1 MUST be 20.0 (previous day's sales)
    assert featured.loc[2, "lag_1"] == 20.0
    # Current target (30.0) MUST NOT affect lag_1

    # For day index 1 (2023-01-02, actual sales = 20.0):
    # rolling_mean_7 should only average prior days: here only day 0 (10.0)
    assert featured.loc[1, "rolling_mean_7"] == 10.0

    # For day index 7 (2023-01-08, actual sales = 80.0):
    # Prior 7 days are [10, 20, 30, 40, 50, 60, 70] -> mean = 40.0
    # If the target day (80.0) were leaked, the mean would be 50.0.
    assert featured.loc[7, "rolling_mean_7"] == 40.0


def test_chronological_split_boundaries():
    dates = pd.date_range("2016-11-01", "2017-08-01", freq="D")
    df = pd.DataFrame({
        "date": dates,
        "store": [1] * len(dates),
        "item": [1] * len(dates),
        "sales": [25.0] * len(dates),
    })

    featured = engineer_features(df)
    train, val, test = chronological_split(
        featured, val_start="2017-02-01", test_start="2017-05-01"
    )

    # Check that split subsets are non-empty
    assert len(train) > 0
    assert len(val) > 0
    assert len(test) > 0

    # Max date in train < min date in val (strict chronological separation)
    assert train["date"].max() < val["date"].min()
    # Max date in val < min date in test
    assert val["date"].max() < test["date"].min()


def test_calendar_features_accuracy():
    df = pd.DataFrame({
        "date": ["2023-01-07", "2023-01-08", "2023-01-09"],  # Sat, Sun, Mon
        "store": [1, 1, 1],
        "item": [1, 1, 1],
        "sales": [10.0, 15.0, 20.0],
    })
    featured = engineer_features(df)

    assert featured.loc[0, "is_weekend"] == 1  # Saturday
    assert featured.loc[1, "is_weekend"] == 1  # Sunday
    assert featured.loc[2, "is_weekend"] == 0  # Monday
    assert featured.loc[2, "day_of_week"] == 0  # Monday is 0


def test_ensure_regular_calendar_inserts_missing_dates():
    # Provide day 1 and day 3 (missing day 2)
    df = pd.DataFrame({
        "date": ["2023-01-01", "2023-01-03"],
        "store": [1, 1],
        "item": [1, 1],
        "sales": [10.0, 30.0],
    })
    regular = ensure_regular_calendar(df)
    assert len(regular) == 3
    dates_list = regular["date"].dt.strftime("%Y-%m-%d").tolist()
    assert dates_list == ["2023-01-01", "2023-01-02", "2023-01-03"]
    # The missing day has NaN sales (not silently imputed as zero)
    assert pd.isna(regular.loc[1, "sales"])
