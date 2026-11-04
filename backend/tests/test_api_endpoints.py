import io
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_dataset_schema():
    response = client.get("/api/v1/datasets/schema")
    assert response.status_code == 200
    data = response.json()
    assert "date" in data["required_columns"]
    assert "sales" in data["required_columns"]
    assert data["max_upload_size_mb"] == 50


def test_get_analytics_summary():
    response = client.get("/api/v1/analytics/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is True
    assert data["total_rows"] == 913000
    assert data["unique_stores"] == 10
    assert data["unique_items"] == 50


def test_get_analytics_series():
    response = client.get("/api/v1/analytics/series")
    assert response.status_code == 200
    data = response.json()
    assert len(data["stores"]) == 10
    assert len(data["items"]) == 50


def test_get_analytics_history():
    response = client.get("/api/v1/analytics/history?store=1&item=1&limit=30")
    assert response.status_code == 200
    data = response.json()
    assert data["store"] == 1
    assert data["item"] == 1
    assert data["total_points"] == 30
    assert len(data["data"]) == 30


def test_get_analytics_history_unknown_series():
    response = client.get("/api/v1/analytics/history?store=999&item=999")
    assert response.status_code == 404


def test_post_forecast_7_days():
    response = client.post("/api/v1/forecast", json={"store": 1, "item": 1, "horizon_days": 7})
    assert response.status_code == 200
    data = response.json()
    assert data["horizon_days"] == 7
    assert len(data["predictions"]) == 7
    assert data["total_forecasted_demand"] > 0


def test_post_forecast_14_days():
    response = client.post("/api/v1/forecast", json={"store": 2, "item": 5, "horizon_days": 14})
    assert response.status_code == 200
    data = response.json()
    assert data["horizon_days"] == 14
    assert len(data["predictions"]) == 14


def test_post_forecast_30_days():
    response = client.post("/api/v1/forecast", json={"store": 3, "item": 10, "horizon_days": 30})
    assert response.status_code == 200
    data = response.json()
    assert data["horizon_days"] == 30
    assert len(data["predictions"]) == 30


def test_post_forecast_invalid_horizon():
    response = client.post("/api/v1/forecast", json={"store": 1, "item": 1, "horizon_days": 21})
    assert response.status_code == 400


def test_post_forecast_unknown_series():
    response = client.post("/api/v1/forecast", json={"store": 999, "item": 999, "horizon_days": 7})
    assert response.status_code in [400, 404]


def test_post_forecast_export_csv():
    response = client.post("/api/v1/forecast/export", json={"store": 1, "item": 1, "horizon_days": 7})
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    assert "attachment" in response.headers["content-disposition"]
    csv_text = response.text
    assert "date" in csv_text
    assert "predicted_sales" in csv_text


def test_post_inventory_recommendation():
    payload = {
        "store": 1,
        "item": 1,
        "current_stock": 50,
        "supplier_lead_time_days": 7,
        "incoming_stock": 20,
        "safety_stock_buffer_percent": 25,
    }
    response = client.post("/api/v1/inventory/recommendation", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reorder_point" in data
    assert "suggested_order_quantity" in data
    assert "reorder_recommended" in data
    assert len(data["assumptions"]) > 0


def test_get_model_info():
    response = client.get("/api/v1/model/info")
    assert response.status_code == 200
    data = response.json()
    assert data["model_name"] in ["XGBoost", "Random Forest"]
    assert "benchmark_comparison" in data
    assert "selected_metrics" in data


def test_post_datasets_validate_valid():
    csv_content = b"date,store,item,sales\n2023-01-01,1,1,10\n2023-01-02,1,1,15\n"
    files = {"file": ("test.csv", io.BytesIO(csv_content), "text/csv")}
    response = client.post("/api/v1/datasets/validate", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is True
    assert data["stats"]["total_rows"] == 2


def test_post_datasets_validate_invalid_file_type():
    txt_content = b"not a csv"
    files = {"file": ("test.txt", io.BytesIO(txt_content), "text/plain")}
    response = client.post("/api/v1/datasets/validate", files=files)
    assert response.status_code == 400
