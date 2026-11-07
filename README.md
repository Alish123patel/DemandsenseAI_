# DemandSense AI

> AI-Powered Demand Forecasting & Inventory Intelligence Platform

DemandSense AI is an end-to-end retail forecasting application that utilizes historical daily sales observations to forecast future product demand and provide transparent, data-backed inventory planning estimates.

---

## Architecture & Project Structure

The project maintains clean boundaries between frontend, backend, machine learning, and documentation:

```text
DemandSenseAI/
├── frontend/                  # React + TypeScript + Vite + Tailwind CSS + Recharts
│   ├── src/
│   │   ├── api/               # Typed API client and contracts
│   │   ├── components/        # Shell layout, navbar, cards, status pills
│   │   ├── pages/             # 7 dashboard views (Overview, Datasets, Analytics, Forecast, Inventory, Performance, Settings)
│   │   ├── App.tsx            # Main application component
│   │   ├── index.css          # Tailwind CSS styles
│   │   └── main.tsx           # React DOM root
│   ├── tests/                 # Frontend unit and logic tests (Node test runner)
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env.example
├── backend/                   # FastAPI Backend
│   ├── app/
│   │   ├── core/              # Config & CORS middleware
│   │   ├── routes/            # REST API endpoints (datasets, analytics, forecast, inventory, model, health)
│   │   ├── schemas/           # Pydantic v2 schemas
│   │   ├── services/          # Multi-step recursive forecasting & inventory replenishment logic
│   │   └── main.py            # FastAPI entry point
│   ├── tests/                 # Backend unit & end-to-end integration tests (pytest)
│   ├── requirements.txt
│   └── .env.example
├── ml/                        # Machine Learning Pipeline
│   ├── data/                  # Raw & processed CSVs (canonical_sales.csv)
│   ├── reports/               # EDA figures & data_quality_summary.json
│   ├── preprocessing/         # Ingestion & strict schema validation
│   ├── features/              # Leakage-safe time-series & lag feature generation
│   ├── training/              # Chronological train/val/test training script
│   └── models/                # Serialized best model (XGBoost) & metadata
├── docs/                      # Architectural & ML Documentation
│   ├── ARCHITECTURE.md
│   ├── DATA_ACQUISITION.md
│   ├── EDA_FINDINGS.md
│   ├── FEATURE_ENGINEERING.md
│   ├── MODEL_EVALUATION.md
│   └── API_DOCUMENTATION.md
├── .gitignore
└── README.md
```

---

## Tech Stack

- **Backend:** Python 3.11+, FastAPI, Pydantic v2, Uvicorn, Pytest, HTTPX
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide React
- **Machine Learning & Analytics:** Pandas, NumPy, Scikit-learn, XGBoost, Joblib

---

## Quickstart Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 1. Backend Setup

```bash
# From repository root, create and activate virtual environment
python -m venv .venv

# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run backend unit & integration tests
pytest backend/tests

# Start backend server
uvicorn app.main:app --app-dir backend --reload --port 8000
```
Backend will be reachable at:
- Interactive API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- Alternative ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

### 2. Frontend Setup

```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run frontend tests
npm test

# Build production bundle
npm run build

# Start frontend development server
npm run dev
```
Frontend will be accessible at [http://localhost:5173](http://localhost:5173).

---

## REST API Overview (`/api/v1`)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/health` | `GET` | Health status and runtime service diagnostics |
| `/api/v1/datasets/schema` | `GET` | Required column names, data types, and upload size limits |
| `/api/v1/datasets/validate` | `POST` | Validates an uploaded CSV without saving |
| `/api/v1/datasets/upload` | `POST` | Ingests and validates a user CSV dataset |
| `/api/v1/analytics/summary` | `GET` | Summary statistics and seasonality metrics for active dataset |
| `/api/v1/analytics/series` | `GET` | Unique store and item IDs available |
| `/api/v1/analytics/history` | `GET` | Historical daily sales observations for store/item |
| `/api/v1/forecast` | `POST` | Multi-step recursive demand forecast (7, 14, 30 days) |
| `/api/v1/forecast/export` | `POST` | Directly downloads forecast predictions as a CSV file |
| `/api/v1/inventory/recommendation` | `POST` | Reorder point (ROP) & suggested order calculation |
| `/api/v1/model/info` | `GET` | Production model metadata, benchmark leaderboard, feature registry |

---

## Core Forecasting & Inventory Principles

- **Chronological Splits:** Time-series observations are never randomly shuffled. Train (2013–2016), Validation (2017-H1), and Test (2017-H2).
- **Zero Leakage:** Rolling statistics and lag features use only strictly past observations (shifted by 1).
- **Multi-Step Recursive Projections:** The model uses its own past forecasts dynamically to project into the future with 95% confidence bands.
- **Transparent Calculations:** 
  $$\text{Reorder Point (ROP)} = \text{Demand During Lead Time} + \text{Safety Stock}$$
  $$\text{Suggested Order} = \max(0, \text{ROP} - \text{Current Stock} - \text{Incoming Stock})$$
- **Educational Scope:** DemandSense AI is built as a portfolio and decision-support system. Forecasts are statistical projections, never commercial purchasing guarantees.

---

## License & Compliance
This repository is developed for portfolio and educational purposes. Raw datasets and compiled binary model weights are excluded from Git via `.gitignore`.
