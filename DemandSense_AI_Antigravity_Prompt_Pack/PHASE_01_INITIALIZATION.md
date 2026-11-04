# Phase 1 --- Project Initialization & Architecture

## Objective

Create a clean repository structure and working frontend/backend
skeleton. Do not implement data science or forecasting yet.

## Prompt for Antigravity

You are the senior full-stack engineer for DemandSense AI. Read
`01_MASTER_PROJECT_BRIEF.md` first and inspect the current repository
before making changes.

Implement **Phase 1 only**.

### Tasks

1.  Propose and then create a maintainable structure with separate
    `frontend/`, `backend/`, `ml/`, `tests/` (if appropriate), and
    `docs/` directories.
2.  Scaffold React + TypeScript + Vite in `frontend/`.
3.  Set up Tailwind CSS using a version-compatible, documented
    configuration.
4.  Create a responsive dashboard shell with navigation for Overview,
    Dataset Management, Sales Analytics, Forecast Studio, Inventory
    Insights, Model Performance, and Settings.
5.  Use clearly labeled empty states or development placeholders. Do not
    invent sales figures, forecasts, accuracy scores, or charts
    presented as real data.
6.  Set up Python backend dependencies and a FastAPI application.
7.  Add `GET /health` returning a simple status response and a small
    backend test.
8.  Add frontend API base URL configuration using an environment
    variable, plus a typed API client and basic loading/error handling
    for the health check.
9.  Add `.env.example` files, `.gitignore`, and an initial README with
    setup and run instructions.
10. Add basic formatting/lint/test configuration only where useful and
    compatible.

### Suggested structure

``` text
DemandSense-AI/
├── frontend/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── tests/
│   └── requirements.txt
├── ml/
│   ├── data/
│   ├── notebooks/
│   ├── preprocessing/
│   ├── features/
│   ├── training/
│   ├── evaluation/
│   └── models/
├── docs/
├── .gitignore
└── README.md
```

You may adjust this structure if there is a clear technical reason.
Explain the reason.

### Constraints

-   Use Python 3.11+.
-   Keep frontend and backend independently runnable.
-   Configure CORS from environment variables.
-   Do not add authentication, database infrastructure, or ML
    functionality in this phase.
-   Do not install unnecessary packages.
-   Do not commit secrets, virtual environments, `node_modules`, raw
    data, or generated model artifacts.
-   Do not run destructive commands.
-   Do not overwrite existing files without showing the proposed change.

### Workflow

First return: 1. current workspace findings; 2. proposed folder tree; 3.
dependency choices; 4. files to create/change; 5. exact commands you
plan to run.

Wait for approval before implementation. After approval, implement Phase
1 only.

### Verification

Run and report: - frontend dependency installation; - frontend
production build; - backend dependency installation instructions; -
backend health endpoint test; - backend app startup check if feasible.

Do not claim a check passed unless you actually ran it. Include exact
commands and results.

### Completion report

List files created, architecture decisions, commands to run both
services, tests executed, and known issues. Stop after Phase 1.
