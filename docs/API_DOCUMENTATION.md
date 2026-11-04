# DemandSense AI — Phase 5 FastAPI REST API Documentation

## 1. Overview
The DemandSense AI backend is built with **FastAPI**, **Pydantic v2**, and **Uvicorn**. It exposes high-performance, typed REST endpoints for dataset management, exploratory analytics, machine learning demand forecasting, and inventory optimization.

- **Base URL:** `http://localhost:8000`
- **Interactive OpenAPI Documentation (Swagger UI):** `http://localhost:8000/docs`
- **ReDoc Documentation:** `http://localhost:8000/redoc`
- **OpenAPI JSON Schema:** `http://localhost:8000/openapi.json`

---

## 2. Endpoints Reference

### A. Health & Diagnostics
#### `GET /health` / `GET /api/v1/health`
Checks operational status, version, and runtime environment.
- **Response `200 OK`:**
  ```json
  {
    "status": "ok",
    "version": "0.1.0",
    "environment": "development",
    "service": "DemandSense AI Backend"
  }
  ```

---

### B. Datasets
#### `GET /api/v1/datasets/schema`
Returns the required CSV schema, column definitions, and upload limits.
- **Response `200 OK`:**
  ```json
  {
    "required_columns": ["date", "store", "item", "sales"],
    "column_descriptions": {
      "date": "Observation date in YYYY-MM-DD format (ISO 8601)",
      "store": "Store identifier (positive integer)",
      "item": "Item SKU identifier (positive integer)",
      "sales": "Units sold on that day (non-negative number)"
    },
    "max_upload_size_mb": 50
  }
  ```

#### `POST /api/v1/datasets/validate`
Validates an uploaded CSV multipart file against schema and data hygiene rules without persisting it as active dataset.
- **Request:** `multipart/form-data` with `file: <filename.csv>`
- **Response `200 OK`:**
  ```json
  {
    "is_valid": true,
    "errors": [],
    "warnings": [],
    "stats": {
      "total_rows": 913000,
      "unique_stores": 10,
      "unique_items": 50
    }
  }
  ```

#### `POST /api/v1/datasets/upload`
Accepts and stages a validated CSV dataset for analytics and forecasting.
- **Request:** `multipart/form-data` with `file: <filename.csv>`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "message": "Successfully ingested 'train.csv' (913,000 rows).",
    "report": { ... }
  }
  ```

---

### C. Analytics
#### `GET /api/v1/analytics/summary`
Returns high-level statistics and seasonality metrics for the active dataset.
- **Response `200 OK`:**
  ```json
  {
    "is_valid": true,
    "total_rows": 913000,
    "unique_stores": 10,
    "unique_items": 50,
    "date_min": "2013-01-01",
    "date_max": "2017-12-31",
    "total_days": 1826,
    "total_sales": 47717112.0,
    "mean_daily_sales": 52.26,
    "seasonality": { ... }
  }
  ```

#### `GET /api/v1/analytics/series`
Returns lists of available stores and product SKUs.
- **Response `200 OK`:**
  ```json
  {
    "stores": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    "items": [1, 2, ..., 50]
  }
  ```

#### `GET /api/v1/analytics/history?store={store}&item={item}&limit={limit}`
Queries historical daily unit sales for a specific series.
- **Parameters:**
  - `store` (int, required): Store ID.
  - `item` (int, required): Item SKU ID.
  - `limit` (int, default=180): Number of recent daily observations to return.
- **Response `200 OK`:**
  ```json
  {
    "store": 1,
    "item": 1,
    "total_points": 30,
    "data": [
      { "date": "2017-12-02", "sales": 23.0 },
      { "date": "2017-12-03", "sales": 21.0 }
    ]
  }
  ```

---

### D. Forecasting
#### `POST /api/v1/forecast`
Generates recursive multi-step daily demand projections using pre-trained model weights.
- **Request Body:**
  ```json
  {
    "store": 1,
    "item": 1,
    "horizon_days": 14
  }
  ```
  *Supported horizons: `7`, `14`, or `30` days.*
- **Response `200 OK`:**
  ```json
  {
    "store": 1,
    "item": 1,
    "horizon_days": 14,
    "model_name": "XGBoost",
    "model_version": "1.0.0",
    "total_forecasted_demand": 268.4,
    "mean_daily_forecast": 19.17,
    "predictions": [
      {
        "date": "2018-01-01",
        "predicted_sales": 13.5,
        "lower_bound": 0.0,
        "upper_bound": 29.8
      }
    ]
  }
  ```

#### `POST /api/v1/forecast/export`
Generates and downloads the forecast as a CSV file.
- **Content-Type:** `text/csv`
- **Header:** `Content-Disposition: attachment; filename="forecast_store1_item1_14d.csv"`

---

### E. Inventory Intelligence
#### `POST /api/v1/inventory/recommendation`
Calculates transparent reorder point and suggested replenishment quantity.
- **Formula:**
  $$\text{Reorder Point} = \text{Lead-Time Demand} + \text{Safety Stock}$$
  $$\text{Suggested Order} = \max(0, \text{Reorder Point} - \text{Current Stock} - \text{Incoming Stock})$$
- **Request Body:**
  ```json
  {
    "store": 1,
    "item": 1,
    "current_stock": 50,
    "supplier_lead_time_days": 7,
    "incoming_stock": 10,
    "safety_stock_buffer_percent": 20
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "store": 1,
    "item": 1,
    "current_stock": 50.0,
    "supplier_lead_time_days": 7,
    "incoming_stock": 10.0,
    "safety_stock_buffer_percent": 20.0,
    "expected_demand_during_lead_time": 118.2,
    "safety_stock": 23.6,
    "reorder_point": 141.8,
    "suggested_order_quantity": 81.8,
    "reorder_recommended": true,
    "assumptions": [ ... ]
  }
  ```

---

### F. Model Information
#### `GET /api/v1/model/info`
Returns active model version, training timestamp, feature list, and benchmark comparison scores.
- **Response `200 OK`:**
  ```json
  {
    "model_name": "XGBoost",
    "version": "1.0.0",
    "feature_columns": ["store", "item", ...],
    "selected_metrics": { ... },
    "benchmark_comparison": { ... }
  }
  ```

