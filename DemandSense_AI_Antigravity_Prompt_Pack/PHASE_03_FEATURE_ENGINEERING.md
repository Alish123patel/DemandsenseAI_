# Phase 3 --- Time-Series Feature Engineering & Data Splitting

## Objective

Build leakage-safe features and reproducible chronological
train/validation/test datasets for store-item daily demand forecasting.
Do not select or tune final models yet.

## Prompt for Antigravity

Read the master brief and inspect completed phases. Implement **Phase 3
only**.

### Tasks

1.  Define one canonical time-series grain: one row per `date`, `store`,
    `item`.
2.  Sort every store-item series chronologically.
3.  Define and document how missing calendar dates are handled. Do not
    automatically interpret absent records as zero sales without a
    justified policy.
4.  Create calendar features such as day of week, day of month, month,
    week of year, and weekend indicator where appropriate.
5.  Create lag features such as lag 1, lag 7, lag 14, and lag 28 where
    sufficient history exists.
6.  Create rolling statistics such as 7-day and 28-day means/standard
    deviations using only prior observations. Shift the series before
    rolling so the current target is excluded.
7.  Add a documented cold-start/short-history policy for series without
    enough lag history.
8.  Split chronologically into training, validation, and final test
    periods. Use dates shared across series where appropriate so
    evaluation is temporally consistent.
9.  Ensure feature generation for validation/test uses only information
    that would have been available at prediction time.
10. Add tests that explicitly detect leakage and verify feature values
    on a tiny hand-calculated example.
11. Document feature definitions, split boundaries, and limitations.

### Constraints

-   No random train/test split.
-   No fitting transformations on validation/test data.
-   Do not use future sales to construct historical features.
-   Do not use unavailable external features such as price, promotion,
    stock, or weather unless the dataset actually contains them and they
    are validated.
-   Do not train or tune models in this phase.

### Workflow

Inspect the existing preprocessing and EDA implementation. Propose the
changes and wait for approval before editing.

### Verification

Include tests for chronological ordering, lag correctness,
rolling-window shifting, missing dates, short series, and split
boundaries. Show a small example proving the target day's sales are not
included in its rolling features.

### Completion report

List engineered features, missing-date policy, split dates, tests and
unresolved decisions. Stop after Phase 3.
