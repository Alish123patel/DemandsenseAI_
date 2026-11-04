# Phase 4 --- Baselines, Model Training & Evaluation

## Objective

Train and compare forecasting approaches using leakage-safe features and
chronological validation. Save a reproducible model artifact and
evaluation metadata.

## Prompt for Antigravity

Read the master brief and completed ML phases. Implement **Phase 4
only**.

### Models to evaluate

1.  Naive baseline (last observed value).
2.  Seasonal naive baseline (for example, value from 7 days earlier,
    where valid).
3.  Moving-average baseline.
4.  Random Forest regressor.
5.  XGBoost regressor, if compatible with the environment.

Do not assume a complex model wins. The selected model must be justified
against baselines.

### Tasks

1.  Create reproducible training scripts/configuration.
2.  Define the prediction strategy for 7-, 14-, and 30-day horizons.
    Choose direct horizon-specific models or a recursive strategy and
    document the trade-offs.
3.  Ensure recursive forecasts use prior predictions where required and
    explain error accumulation.
4.  Tune only on the validation period. Keep the final test period
    untouched until model selection is complete.
5.  Evaluate MAE, RMSE, WAPE and/or sMAPE. Handle zero denominators
    explicitly.
6.  Report metrics overall and, where meaningful, by horizon and
    selected store/item groups.
7.  Compare models against baselines.
8.  Save the selected model, feature list, preprocessing metadata, model
    version, training timestamp, split dates and evaluation metrics.
9.  Use safe, version-compatible serialization. Document that
    pickle/joblib artifacts must only be loaded from trusted sources.
10. Add a reproducibility command and a model card/report explaining
    intended use and limitations.

### Constraints

-   No leakage from future target values.
-   No random time-series splitting.
-   Do not tune against the final test set.
-   Do not fabricate performance values.
-   Do not claim production-grade accuracy based on one dataset split.
-   Do not overwrite a previously selected model artifact without
    versioning or approval.

### Workflow

First inspect features and split logic. Report the proposed modeling
strategy and artifact format. Wait for approval before training or
changing files.

### Verification

Run tests for feature order, prediction output shape, reproducibility
where feasible, and artifact load/save. Report actual validation and
test metrics separately. Include baseline comparison.

### Completion report

Explain selected model, why it was selected, metrics, horizon strategy,
artifact locations, reproduction commands, and known limitations. Stop
after Phase 4.
