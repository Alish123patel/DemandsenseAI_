# DemandSense AI --- Master Project Brief

## 1. Product vision

**Product name:** DemandSense AI\
**Full title:** AI-Powered Demand Forecasting & Inventory Intelligence
Platform

Build an end-to-end retail demand forecasting application that uses
historical daily sales to forecast future product demand and provide
transparent, data-backed inventory planning estimates.

This is an educational and portfolio project. It must not present
forecasts as guaranteed outcomes or purchasing advice.

## 2. Primary user journey

1.  User opens the dashboard.
2.  User uploads a supported CSV dataset or loads the documented sample
    dataset.
3.  Application validates the schema and reports data-quality issues.
4.  User explores historical sales and selects a store/product
    combination.
5.  User chooses a forecast horizon: 7, 14, or 30 days.
6.  Backend returns forecast values and relevant metadata.
7.  User reviews historical-versus-forecast charts and model
    performance.
8.  User optionally enters current stock and supplier lead time to see
    an estimated reorder point and suggested replenishment quantity.
9.  User exports forecast results as CSV.

## 3. Initial dataset

Start with the Kaggle Store Item Demand Forecasting Challenge dataset:
https://www.kaggle.com/competitions/demand-forecasting-kernels-only

Expected core fields in the commonly used dataset: - `date`: daily
observation date - `store`: store identifier - `item`: item identifier -
`sales`: units sold

Do not assume the downloaded file matches this schema without inspecting
it. Build a documented schema-mapping/validation layer. The initial
modeling scope is univariate demand per store-item series, with calendar
and lag features. Do not invent price, promotion, inventory, or weather
fields if they are not present.

## 4. Scope

### In scope

-   CSV upload and validation
-   Data profiling and quality summary
-   Exploratory sales analytics
-   Time-series feature engineering
-   Baseline forecasting
-   Random Forest and XGBoost regression experiments
-   Chronological validation and holdout testing
-   Forecast API
-   React dashboard
-   Inventory estimates based on user-provided stock and lead-time
    inputs
-   CSV export
-   Automated tests, documentation, GitHub and public deployment

### Out of scope for version one

-   Live connection to retailers or point-of-sale systems
-   Real-time streaming
-   User accounts, billing, multi-tenant access control
-   Guaranteed stock optimization
-   Autonomous purchase orders
-   LLM chatbot or agent features
-   Causal claims about promotions or external factors absent from the
    dataset

## 5. Proposed technology stack

-   Python 3.11+
-   Pandas, NumPy
-   Scikit-learn
-   XGBoost (only if installation and runtime are stable in the chosen
    environment)
-   FastAPI, Pydantic, Uvicorn
-   React, TypeScript, Vite
-   Tailwind CSS
-   Recharts
-   Pytest; frontend test tooling selected by the implementation
-   Git and GitHub

Keep the frontend, backend, and ML training code separated. The backend
loads saved model artifacts for inference; it must not retrain models on
every request.

## 6. Forecasting principles

-   Preserve chronological order.
-   Never randomly shuffle time-series observations for train/test
    splitting.
-   Fit preprocessing only on training data where applicable.
-   Build lag and rolling features using past observations only.
-   Avoid target leakage, including rolling windows that accidentally
    include the target day.
-   Compare against simple baselines before claiming a complex model is
    better.
-   Evaluate on a held-out future period.
-   Report MAE and RMSE. Also report WAPE and/or sMAPE with clearly
    documented handling of zero denominators.
-   Do not use MAPE blindly when actual values can be zero.
-   Explain that forecast quality can vary by product/store and forecast
    horizon.
-   Forecast recursively only if that is the explicitly implemented and
    tested strategy; document error accumulation. Otherwise implement a
    clearly defined direct/multi-output approach.

## 7. Inventory calculation principles

Inventory suggestions are estimates, not optimized supply-chain
decisions.

A basic reorder point may be calculated as:

`reorder_point = expected_demand_during_lead_time + safety_stock`

A simple safety-stock method must be documented, including assumptions.
If no demand variability or service-level inputs are available, let the
user choose a transparent safety-stock buffer or show the calculation as
a simplified estimate.

Suggested order quantity should account for current stock and, if
collected, incoming stock:
`suggested_order = max(0, reorder_point - current_stock - incoming_stock)`

Do not imply that the source dataset contains actual stock levels; stock
and lead time are user inputs.

## 8. UI direction

Build a clean, modern, responsive analytics product. Prioritize
legibility and useful charts over decoration. Use consistent spacing,
accessible contrast, clear empty/loading/error states, and responsive
layouts.

Pages: 1. Overview 2. Dataset Management 3. Sales Analytics 4. Forecast
Studio 5. Inventory Insights 6. Model Performance 7. Settings / About

All displayed metrics must come from actual data or be clearly labeled
as examples/placeholders during development.

## 9. Engineering requirements

-   Modular, readable, typed code.
-   Input validation and useful error messages.
-   Configurable CORS and environment variables.
-   `.env.example` files without secrets.
-   `.gitignore` excludes secrets, environments, dependencies, datasets
    and model artifacts where appropriate.
-   API routes documented through OpenAPI.
-   Automated tests for critical data and API behavior.
-   README includes setup, run, test, data acquisition, model training,
    inference, deployment and limitations.
-   No hard-coded machine-specific paths.
-   No fabricated test results or model metrics.
-   Never overwrite user changes without explaining the impact and
    getting approval.

## 10. Definition of done

The project is complete only when: - a clean clone can be set up using
README instructions; - a valid dataset can be uploaded and validated; -
model training is reproducible; - evaluation uses chronological
splits; - the backend serves real forecasts from saved artifacts; - the
frontend consumes real API responses; - inventory estimates explain
their assumptions; - automated tests pass; - deployment is publicly
reachable and configured safely; - GitHub contains source code and
documentation but no secrets or prohibited large data files.
