# DemandSense AI — Architecture Overview

## 1. System Vision
DemandSense AI is an end-to-end retail demand forecasting and inventory intelligence application.
It integrates:
- **FastAPI Backend**: Exposes validation, historical query, and prediction endpoints serving pre-trained machine learning model artifacts.
- **React + TypeScript + Vite Frontend**: Clean, responsive analytics dashboard for business users, merchandisers, and inventory planners.
- **Modular ML Pipeline**: Offline feature engineering, chronologically split model training (Baseline, Random Forest, XGBoost), and artifact export.

## 2. Directory Structure
```text
DemandSense-AI/
├── frontend/             # React 18/19 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── api/          # Typed API client and contracts
│   │   ├── components/   # Layout, navigation, UI cards, tables
│   │   └── pages/        # Dashboard views
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── core/         # Config, environment settings, CORS
│   │   ├── routes/       # API route controllers
│   │   ├── schemas/      # Pydantic request/response schemas
│   │   ├── services/     # Business logic & model inference services
│   │   └── main.py       # FastAPI application entrypoint
│   └── tests/            # Pytest test suite
├── ml/                   # Machine learning engineering workspace
│   ├── data/             # Local data files (git-ignored)
│   ├── notebooks/        # Exploratory Data Analysis & experiments
│   ├── preprocessing/    # Cleaning, schema validation, aggregation
│   ├── features/         # Calendar & lag feature generators
│   ├── training/         # Reproducible training scripts
│   ├── evaluation/       # Chronological holdout evaluation & metrics
│   └── models/           # Exported model artifacts (git-ignored)
├── docs/                 # System and API documentation
├── .gitignore            # Git exclusion rules
└── README.md             # Project quickstart and developer guide
```

## 3. Communication Contract
- The frontend interacts with the backend strictly via REST APIs (`/health`, `/api/v1/...`).
- API base URL is injected via `VITE_API_BASE_URL`.
- Backend accepts requests from origins configured in `CORS_ORIGINS`.

