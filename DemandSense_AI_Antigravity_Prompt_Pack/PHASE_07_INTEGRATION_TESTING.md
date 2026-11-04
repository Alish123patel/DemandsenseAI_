# Phase 7 --- Integration, Quality Assurance & Hardening

## Objective

Verify that dataset upload, analytics, forecasting, inventory estimates,
exports, frontend and backend work together reliably.

## Prompt for Antigravity

Read the master brief and inspect the entire repository. Implement
**Phase 7 only**. Prioritize fixing defects over adding features.

### End-to-end flows to verify

1.  Start frontend and backend independently.
2.  Confirm frontend can reach backend health endpoint.
3.  Upload a valid CSV and receive a real validation report.
4.  Reject malformed or unsupported CSV files safely.
5.  View analytics derived from the active dataset.
6.  Request 7-, 14-, and 30-day forecasts for a valid series.
7.  Confirm unknown store/item and insufficient history return clear
    errors.
8.  Confirm charts display API results rather than local fabricated
    data.
9.  Calculate inventory recommendation from explicit user inputs.
10. Export forecast output and verify file contents.
11. Confirm model metadata and metrics match the saved evaluation
    report.

### Quality tasks

-   Add or improve unit, integration and end-to-end tests.
-   Check input validation and error handling.
-   Check file-size limits and temporary upload cleanup.
-   Check CORS configuration.
-   Check responsive layouts and browser console errors.
-   Check API timeouts and loading states.
-   Check date/time consistency and chronological sorting.
-   Check no leakage in prediction feature generation.
-   Check dependency and configuration consistency.
-   Remove unused code and dead UI controls.
-   Improve README based on actual setup steps.

### Constraints

-   Do not invent passing tests.
-   Do not weaken tests just to make them pass.
-   Do not silently change model behavior or metrics.
-   Do not introduce a database or authentication system unless
    specifically approved.
-   Do not add unrelated features.

### Workflow

Run the current test suite first and report failures. Propose a
prioritized fix plan and wait for approval before broad changes.

### Verification

Run all automated tests, frontend build/type checks, backend tests and
representative end-to-end scenarios. Provide exact commands and results.
Note any manual checks not performed.

### Completion report

Provide a test matrix with pass/fail/not-run, bugs fixed, remaining
risks and recommended release blockers. Stop after Phase 7.
