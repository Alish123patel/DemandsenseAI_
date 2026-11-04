# Phase 5 --- FastAPI Backend & Forecasting APIs

## Objective

Expose the trained forecasting pipeline through robust REST APIs. The
API must load saved artifacts and serve real predictions; it must not
retrain models on each request.

## Prompt for Antigravity

Read the master brief and inspect the trained artifacts from Phase 4.
Implement **Phase 5 only**.

### Required API capabilities

-   `GET /health`: service health.
-   `GET /api/v1/datasets/schema`: supported upload schema and
    requirements.
-   `POST /api/v1/datasets/validate`: validate an uploaded CSV.
-   `POST /api/v1/datasets/upload` (or a clearly documented equivalent):
    accept and validate a dataset within configured size limits.
-   `GET /api/v1/analytics/summary`: actual summary for the active
    dataset.
-   `POST /api/v1/forecast`: request a forecast for a valid store/item
    and horizon (7, 14, or 30 days).
-   `GET /api/v1/model/info`: model version, training metadata,
    features, and available evaluation metrics.
-   `POST /api/v1/inventory/recommendation`: calculate a transparent
    estimate from forecast, current stock, lead time, and safety-stock
    assumptions.
-   CSV export endpoint if appropriate.

Adjust route design if there is a strong reason, but document it.

### Tasks

1.  Use Pydantic request/response schemas.
2.  Validate identifiers, horizon, dates, numeric inputs, file type,
    file size, and malformed CSV.
3.  Load model artifacts at startup or through a safe cached service.
4.  Reuse the exact preprocessing/feature-generation logic used in
    training.
5.  Return clear errors for unknown store/item, insufficient history,
    unavailable model, and invalid input.
6.  Add configurable CORS origins.
7.  Add request logging without logging sensitive uploaded data.
8.  Add API documentation and example requests/responses.
9.  Add tests for valid and invalid requests, artifact loading, forecast
    response schema, and inventory calculations.
10. Ensure upload storage is temporary or otherwise documented; do not
    silently retain user files indefinitely.

### Constraints

-   No fake fallback predictions.
-   No retraining during prediction requests.
-   Never load untrusted model artifacts.
-   Do not expose filesystem paths or secrets in error messages.
-   Do not accept arbitrary file paths from users.
-   Keep API versioning consistent.
-   Do not claim the service is healthy if critical model dependencies
    are unavailable; distinguish service health from model readiness.

### Workflow

Inspect Phase 4 artifacts and report any missing dependencies or
incompatible interfaces. Propose API schemas and wait for approval.

### Verification

Run backend tests and manually exercise OpenAPI docs and representative
endpoints. Report actual status codes and response examples with
synthetic test inputs clearly labeled as tests.

### Completion report

List endpoints, schemas, artifact loading strategy, tests and known
issues. Stop after Phase 5.
