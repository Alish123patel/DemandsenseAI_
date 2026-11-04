# Phase 6 --- React Frontend & Dashboard

## Objective

Build a polished, responsive frontend that consumes the real backend
APIs. No mock metrics may be presented as real application results.

## Prompt for Antigravity

Read the master brief and inspect the backend API documentation.
Implement **Phase 6 only**.

### Pages

1.  Overview
2.  Dataset Management
3.  Sales Analytics
4.  Forecast Studio
5.  Inventory Insights
6.  Model Performance
7.  Settings / About

### UI requirements

-   React + TypeScript + Vite.
-   Tailwind CSS.
-   Recharts for interactive visualizations.
-   Responsive navigation and layouts.
-   Consistent design system: spacing, typography, colors, buttons,
    forms, cards and chart styles.
-   Accessible labels, keyboard focus, and readable contrast.
-   Clear loading, empty, success and error states.
-   Useful form validation and error messages.
-   No dead buttons or decorative controls that imply functionality.
-   Do not hard-code API results or model scores.

### Functional requirements

**Overview:** display summary metrics only when returned by the backend;
otherwise show a clear empty state.

**Dataset Management:** upload CSV, display validation report, show
supported schema and upload errors.

**Sales Analytics:** date filters and store/item filters backed by
actual API data.

**Forecast Studio:** select store, item and horizon (7/14/30 days);
request forecast; show historical and predicted values with clear
separation.

**Inventory Insights:** collect current stock, incoming stock if
supported, lead time and safety-stock assumptions; display calculation
and caveats.

**Model Performance:** show actual saved evaluation metrics and model
metadata, including evaluation period.

**Settings/About:** API connection status, project description,
data/model limitations.

### Engineering requirements

-   Central typed API client.
-   API base URL from environment variable.
-   Avoid duplicating API logic in components.
-   Handle network failures and backend unavailable states.
-   Add component/page tests for critical interactions where feasible.
-   Do not put secrets in frontend environment variables.
-   Do not use frontend environment variables for private backend
    credentials.

### Workflow

Inspect backend contracts first. Return a page/component plan and
identify API gaps. Wait for approval before implementation.

### Verification

Run lint/type checks, tests, and production build. Test key flows
against the real backend. Clearly identify any screens that cannot yet
be fully functional because an API is missing.

### Completion report

List pages, working user flows, API integrations, test/build results and
known issues. Stop after Phase 6.
