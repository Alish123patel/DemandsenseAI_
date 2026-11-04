import pytest
import pandas as pd
from ml.preprocessing.validate import validate_dataset, create_canonical_dataset


def test_validate_valid_dataset():
    synthetic_data = pd.DataFrame({
        "date": ["2023-01-01", "2023-01-02", "2023-01-01", "2023-01-02"],
        "store": [1, 1, 2, 2],
        "item": [10, 10, 10, 10],
        "sales": [15, 20, 30, 25],
    })
    result = validate_dataset(synthetic_data)
    assert result.is_valid is True
    assert len(result.errors) == 0
    assert result.stats["total_rows"] == 4
    assert result.stats["unique_stores"] == 2
    assert result.stats["unique_items"] == 1


def test_validate_missing_columns():
    synthetic_data = pd.DataFrame({
        "date": ["2023-01-01"],
        "store": [1],
        # Missing 'item' and 'sales'
    })
    result = validate_dataset(synthetic_data)
    assert result.is_valid is False
    assert any("Missing required columns" in err for err in result.errors)


def test_validate_negative_sales():
    synthetic_data = pd.DataFrame({
        "date": ["2023-01-01", "2023-01-02"],
        "store": [1, 1],
        "item": [1, 1],
        "sales": [10, -5],
    })
    result = validate_dataset(synthetic_data)
    assert result.is_valid is False
    assert any("negative sales" in err.lower() for err in result.errors)


def test_validate_invalid_dates():
    synthetic_data = pd.DataFrame({
        "date": ["2023-01-01", "not-a-date"],
        "store": [1, 1],
        "item": [1, 1],
        "sales": [10, 12],
    })
    result = validate_dataset(synthetic_data)
    assert result.is_valid is False
    assert any("unparseable date" in err.lower() for err in result.errors)


def test_validate_duplicate_records():
    synthetic_data = pd.DataFrame({
        "date": ["2023-01-01", "2023-01-01"],
        "store": [1, 1],
        "item": [1, 1],
        "sales": [10, 12],
    })
    result = validate_dataset(synthetic_data)
    assert result.is_valid is False
    assert any("duplicate" in err.lower() for err in result.errors)


def test_create_canonical_dataset_ordering():
    unsorted = pd.DataFrame({
        "date": ["2023-01-02", "2023-01-01"],
        "store": [2, 1],
        "item": [5, 5],
        "sales": [10, 20],
    })
    canonical = create_canonical_dataset(unsorted)
    assert canonical.iloc[0]["store"] == 1
    assert canonical.iloc[0]["date"] == pd.Timestamp("2023-01-01")
    assert canonical.iloc[1]["store"] == 2

