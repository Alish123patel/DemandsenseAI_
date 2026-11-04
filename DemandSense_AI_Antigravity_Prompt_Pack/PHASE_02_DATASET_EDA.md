# Phase 2 --- Dataset Acquisition, Validation & EDA

## Objective

Acquire the Store Item Demand Forecasting dataset, inspect its real
schema, build a reproducible data ingestion/validation pipeline, and
produce meaningful exploratory analysis. Do not train final forecasting
models yet.

## Prompt for Antigravity

Read `01_MASTER_PROJECT_BRIEF.md` and inspect the current repository.
Implement **Phase 2 only**.

### Dataset

Use the Kaggle Store Item Demand Forecasting Challenge:
https://www.kaggle.com/competitions/demand-forecasting-kernels-only

The user will download/provide the CSV. Do not bypass Kaggle access
restrictions or assume credentials. Do not fabricate or silently
synthesize the dataset.

Expected core columns are `date`, `store`, `item`, and `sales`; inspect
the actual file and report any differences.

### Tasks

1.  Add clear data acquisition instructions to documentation.
2.  Create a data ingestion module that reads CSV safely.
3.  Validate required columns, data types, date parsing, nonnegative
    sales, identifiers, duplicates, missing values, and date coverage.
4.  Provide actionable validation errors and warnings.
5.  Create a clean canonical representation without changing the raw
    source file.
6.  Handle duplicate store-item-date records only through an explicit,
    documented policy. Do not silently aggregate.
7.  Generate a data-quality report.
8.  Build EDA notebooks or scripts covering:
    -   overall date coverage and sales distribution;
    -   total sales over time;
    -   sales by store;
    -   sales by item;
    -   weekday and monthly patterns;
    -   store-item series coverage;
    -   missing dates and missing values;
    -   outliers or unusual observations, without automatically deleting
        them.
9.  Save figures/reports to an appropriate ignored output directory or
    documented report location.
10. Add unit tests using small, clearly synthetic test fixtures only.
    Synthetic fixtures must never be presented as actual project
    results.

### Important constraints

-   Keep raw data out of Git.
-   Add `data/raw/`, large generated outputs, and local-only data paths
    to `.gitignore` as appropriate.
-   Do not make claims about seasonality or trends until calculated from
    the actual dataset.
-   Do not impute missing sales as zero without explaining and
    validating that assumption.
-   Preserve chronological order.
-   Do not train forecasting models in this phase.

### Workflow

Inspect repository and dataset availability first. If the dataset is not
present, implement the ingestion pipeline and provide precise
instructions for the user to place the file; do not pretend to have
inspected it.

Before changes, report the plan and files to change. Wait for approval.

### Verification

Test valid data, missing columns, invalid dates, negative sales,
duplicate keys, empty files, and malformed inputs using test fixtures.
Report actual test results.

### Completion report

Summarize the dataset schema observed, quality findings (only if actual
data was available), EDA outputs, tests, and remaining issues. Stop
after Phase 2.
