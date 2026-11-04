# DemandSense AI

> AI-Powered Demand Forecasting & Inventory Intelligence Platform

DemandSense AI is an end-to-end retail forecasting application that utilizes historical daily sales observations to forecast future product demand and provide transparent, data-backed inventory planning estimates.

---

## Architecture & Project Structure

The project maintains clean boundaries between frontend, backend, machine learning, and documentation:

```text
DemandSenseAI/
├── frontend/                  # React + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── api/               # Typed API client and contracts
│   │   ├── components/        # Shell layout, navbar, cards, status pills
│   │   ├── pages/             # 7 dashboard views
│   │   ├── App.tsx            # Main application component
│   │   ├── index.css          # Tailwind CSS styles
│   │   └── main.tsx           # React DOM root
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env.example
├── backend/                   # FastAPI Backend
│   ├── app/
│   │   ├── core/              # Config & CORS middleware
│   │   ├── routes/            # REST API endpoints (e.g. /health)
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Model inference & business logic
│   │   └── main.py            # FastAPI entry point
│   ├── tests/                 # Backend automated tests (pytest)
│   ├── requirements.txt
│   └── .env.example
├── ml/                        # Machine Learning Pipeline
│   ├── data/                  # Raw & processed CSVs (excluded from git)
│   ├── notebooks/             # EDA & experimental notebooks
│   ├── preprocessing/         # Data cleaning & validation
│   ├── features/              # Time-series & lag feature generation
│   ├── training/              # Reproducible training scripts
│   ├── evaluation/            # Chronological holdout evaluation
│   └── models/                # Saved serialized artifacts (excluded from git)
├── docs/                      # Documentation
│   └── ARCHITECTURE.md
├── .gitignore
└── README.md
```

---

## Tech Stack

- **Backend:** Python 3.11+, FastAPI, Pydantic v2, Uvicorn, Pytest, HTTPX
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React
- **ML / Data (Future phases):** Pandas, NumPy, Scikit-learn, XGBoost

---

## Quickstart Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment configuration
copy .env.example .env

# Run unit tests
pytest tests

# Start backend development server
uvicorn app.main:app --reload --port 8000
```
Backend will be reachable at:
- API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

### 2. Frontend Setup

```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment configuration
copy .env.example .env

# Run development server
npm run dev
```
Frontend will be accessible at [http://localhost:5173](http://localhost:5173).

---

## Core Forecasting & Inventory Principles

- **Chronological Splits:** Time-series observations are never randomly shuffled during train/test splits.
- **Leakage Prevention:** Rolling statistics and lag features use only strictly past observations.
- **Transparent Calculations:** 
  $$\text{Reorder Point} = \text{Demand During Lead Time} + \text{Safety Stock}$$
  $$\text{Suggested Order} = \max(0, \text{Reorder Point} - \text{Current Stock} - \text{Incoming Stock})$$
- **Educational Disclaimer:** DemandSense AI forecasts are data-backed statistical projections, not guaranteed commercial outcomes.

---

## License & Compliance
This repository is developed for portfolio and educational purposes. Raw datasets and compiled binary model weights are excluded via `.gitignore`.

