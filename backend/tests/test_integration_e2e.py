"""End-to-End Integration & Quality Assurance Test Suite for DemandSense AI."""
import io
import json
from pathlib import Path
import pandas as pd
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_e2e_01_backend_health_reachability():
    """Verify backend health probe endpoints return 200 with service metadata."""
    res_root_health = client.get("/health")
    assert res_root_health.status_code == 200
    data_root = res_root_health.json()
    assert data_root["status"] == "ok"
    assert data_root["service"] == "DemandSense AI Backend"

    res_v1_health = client.get("/api/v1/health")
    assert res_v1_health.status_code == 200
    data_v1 = res_v1_health.json()
    assert data_v1["status"] == "ok"


def test_e2e_02_dataset_schema_retrieval():
    """Verify official schema specifications are served accurately."""
    res = client.get("/api/v1/datasets/schema")
    assert res.status_code == 200
    schema = res.json()
    assert set(schema["required_columns"]) == {"date", "store", "item", "sales"}
    assert schema["max_upload_size_mb"] == 50


def test_e2e_03_valid_csv_upload_and_validation():
    """Verify that uploading a valid canonical CSV returns success and a rich report."""
    valid_csv = (
        "date,store,item,sales\n"
        "2023-01-01,1,1,25\n"
        "2023-01-02,1,1,30\n"
        "2023-01-03,1,1,28\n"
    ).encode("utf-8")

    # 1. Test validate endpoint
    files = {"file": ("batch_sales.csv", io.BytesIO(valid_csv), "text/csv")}
    res_val = client.post("/api/v1/datasets/validate", files=files)
    assert res_val.status_code == 200
    report_val = res_val.json()
    assert report_val["is_valid"] is True
    assert report_val["stats"]["total_rows"] == 3
    assert len(report_val["errors"]) == 0

    # 2. Test upload endpoint
    files_upload = {"file": ("BATCH_SALES.CSV", io.BytesIO(valid_csv), "text/csv")}
    res_upload = client.post("/api/v1/datasets/upload", files=files_upload)
    assert res_upload.status_code == 200
    report_upload = res_upload.json()
    assert report_upload["success"] is True
    assert "Successfully ingested" in report_upload["message"]
    assert report_upload["report"]["is_valid"] is True


def test_e2e_04_malformed_csv_safely_rejected():
    """Verify various malformed CSV payloads are rejected safely without crashes."""
    # A. Missing required columns
    bad_cols_csv = b"date,store,units\n2023-01-01,1,10\n"
    files = {"file": ("missing_cols.csv", io.BytesIO(bad_cols_csv), "text/csv")}
    res = client.post("/api/v1/datasets/validate", files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["is_valid"] is False
    assert any("Missing required columns" in err for err in data["errors"])

    # B. Non-parseable dates
    bad_dates_csv = b"date,store,item,sales\nnot-a-date,1,1,10\n"
    files = {"file": ("bad_date.csv", io.BytesIO(bad_dates_csv), "text/csv")}
    res = client.post("/api/v1/datasets/validate", files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["is_valid"] is False
    assert any("unparseable date" in err for err in data["errors"])

    # C. Negative sales values
    negative_sales_csv = b"date,store,item,sales\n2023-01-01,1,1,-5\n"
    files = {"file": ("negative.csv", io.BytesIO(negative_sales_csv), "text/csv")}
    res = client.post("/api/v1/datasets/validate", files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["is_valid"] is False
    assert any("negative sales" in err for err in data["errors"])

    # D. Duplicates on (date, store, item)
    dup_csv = (
        "date,store,item,sales\n"
        "2023-01-01,1,1,10\n"
        "2023-01-01,1,1,12\n"
    ).encode("utf-8")
    files = {"file": ("dups.csv", io.BytesIO(dup_csv), "text/csv")}
    res = client.post("/api/v1/datasets/validate", files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["is_valid"] is False
    assert any("duplicate records" in err for err in data["errors"])

    # E. Non-csv extension
    files_txt = {"file": ("data.json", io.BytesIO(b'{"key": "value"}'), "application/json")}
    res_txt = client.post("/api/v1/datasets/validate", files=files_txt)
    assert res_txt.status_code == 400
    assert "Only CSV files are supported" in res_txt.json()["detail"]


def test_e2e_05_analytics_data_integrity():
    """Verify analytics endpoints derive genuine aggregate statistics from the canonical dataset."""
    res_sum = client.get("/api/v1/analytics/summary")
    assert res_sum.status_code == 200
    summary = res_sum.json()
    assert summary["is_valid"] is True
    assert summary["total_rows"] == 913000
    assert summary["unique_stores"] == 10
    assert summary["unique_items"] == 50
    assert summary["total_days"] == 1826
    assert summary["date_min"] == "2013-01-01"
    assert summary["date_max"] == "2017-12-31"
    assert summary["seasonality"] is not None
    assert len(summary["seasonality"]["day_of_week_mean_sales"]) == 7

    res_series = client.get("/api/v1/analytics/series")
    assert res_series.status_code == 200
    series = res_series.json()
    assert series["stores"] == list(range(1, 11))
    assert series["items"] == list(range(1, 51))

    res_history = client.get("/api/v1/analytics/history?store=1&item=1&limit=90")
    assert res_history.status_code == 200
    hist = res_history.json()
    assert hist["store"] == 1
    assert hist["item"] == 1
    assert len(hist["data"]) == 90
    assert hist["data"][-1]["date"] == "2017-12-31"


def test_e2e_06_forecast_horizons_7_14_30():
    """Verify recursive multi-step forecasting across 7, 14, and 30-day horizons."""
    for h in [7, 14, 30]:
        res = client.post("/api/v1/forecast", json={"store": 1, "item": 1, "horizon_days": h})
        assert res.status_code == 200
        data = res.json()
        assert data["store"] == 1
        assert data["item"] == 1
        assert data["horizon_days"] == h
        assert len(data["predictions"]) == h
        assert data["total_forecasted_demand"] > 0
        assert data["mean_daily_forecast"] > 0

        # Check chronology and non-negative confidence intervals
        for idx, pt in enumerate(data["predictions"]):
            assert pt["predicted_sales"] >= 0
            assert pt["lower_bound"] >= 0
            assert pt["upper_bound"] >= pt["predicted_sales"]
            assert pt["predicted_sales"] >= pt["lower_bound"]


def test_e2e_07_unknown_series_and_invalid_inputs_rejected():
    """Verify that unknown series and invalid parameters return clear HTTP 400/404 errors."""
    # Unknown series for forecast
    res_unknown = client.post("/api/v1/forecast", json={"store": 999, "item": 999, "horizon_days": 7})
    assert res_unknown.status_code in [400, 404]

    # Unsupported horizon
    res_bad_h = client.post("/api/v1/forecast", json={"store": 1, "item": 1, "horizon_days": 21})
    assert res_bad_h.status_code == 400

    # Negative store or item in query
    res_bad_hist = client.get("/api/v1/analytics/history?store=-1&item=1")
    assert res_bad_hist.status_code == 422


def test_e2e_08_forecast_export_csv_verification():
    """Verify CSV export endpoint produces valid tabular CSV downloads with proper headers."""
    res = client.post("/api/v1/forecast/export", json={"store": 2, "item": 3, "horizon_days": 14})
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    assert "forecast_store2_item3_14d.csv" in res.headers["content-disposition"]

    # Parse and verify CSV structure
    df_export = pd.read_csv(io.StringIO(res.text))
    assert len(df_export) == 14
    expected_cols = ["store", "item", "date", "predicted_sales", "lower_bound", "upper_bound"]
    assert list(df_export.columns) == expected_cols
    assert (df_export["store"] == 2).all()
    assert (df_export["item"] == 3).all()


def test_e2e_09_inventory_recommendation_and_formulas():
    """Verify inventory ROP & suggested order calculation against mathematical definition."""
    payload = {
        "store": 1,
        "item": 1,
        "current_stock": 100.0,
        "supplier_lead_time_days": 7,
        "incoming_stock": 20.0,
        "safety_stock_buffer_percent": 20.0,
    }
    res = client.post("/api/v1/inventory/recommendation", json=payload)
    assert res.status_code == 200
    inv = res.json()

    assert inv["store"] == 1
    assert inv["item"] == 1
    assert inv["current_stock"] == 100.0
    assert inv["supplier_lead_time_days"] == 7
    assert inv["incoming_stock"] == 20.0

    # Verify formula integrity
    lead_demand = inv["expected_demand_during_lead_time"]
    expected_safety = round(lead_demand * 0.20, 1)
    assert inv["safety_stock"] == expected_safety

    expected_rop = round(lead_demand + expected_safety, 1)
    assert inv["reorder_point"] == expected_rop

    effective_stock = 100.0 + 20.0
    expected_order = round(max(0.0, expected_rop - effective_stock), 1)
    assert inv["suggested_order_quantity"] == expected_order
    assert inv["reorder_recommended"] == (effective_stock <= expected_rop)


def test_e2e_10_model_metadata_verification():
    """Verify served model metadata strictly reflects actual trained holdout metrics."""
    res = client.get("/api/v1/model/info")
    assert res.status_code == 200
    info = res.json()

    assert info["model_name"] == "XGBoost"
    assert "version" in info
    assert len(info["feature_columns"]) == 15
    assert info["split_config"]["train_end"] == "2016-12-31"
    assert info["split_config"]["val_start"] == "2017-01-01"
    assert info["split_config"]["test_start"] == "2017-07-01"

    # Match saved disk metadata
    with open("ml/models/model_metadata.json", "r", encoding="utf-8") as f:
        disk_meta = json.load(f)

    assert info["selected_metrics"]["test"]["MAE"] == disk_meta["selected_metrics"]["test"]["MAE"]
    assert info["selected_metrics"]["test"]["RMSE"] == disk_meta["selected_metrics"]["test"]["RMSE"]
    assert info["selected_metrics"]["test"]["WAPE"] == disk_meta["selected_metrics"]["test"]["WAPE"]
    assert len(info["benchmark_comparison"]) >= 4

