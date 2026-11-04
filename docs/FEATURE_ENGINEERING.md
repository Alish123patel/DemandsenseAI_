# DemandSense AI — Phase 3 Feature Engineering & Time-Series Preparation

## 1. Time-Series Grain
The dataset is structured at the canonical time-series grain:
$$\text{Grain} = (\text{date}, \text{store}, \text{item})$$
Each observation represents the daily sales units sold for a specific product SKU (`item`) at a specific retail location (`store`) on a calendar day (`date`).

---

## 2. Leakage-Safe Feature Specifications

All features are engineered strictly from past observations. No future sales or target values from the current observation date are accessible.

### A. Calendar Features
Derived directly from the chronological timestamp $\text{date}_t$:
- `day_of_week`: Integer $0$ (Monday) through $6$ (Sunday). Captures weekly shopping cycles.
- `day_of_month`: Integer $1$ through $31$. Captures monthly salary and replenishment cycles.
- `month`: Integer $1$ (January) through $12$ (December). Captures broad annual seasonality.
- `year`: Integer calendar year ($2013$–$2017$). Captures macro-economic trend growth.
- `week_of_year`: ISO calendar week ($1$–$53$). Captures weekly seasonality across the year.
- `is_weekend`: Binary indicator ($1$ if Saturday or Sunday, else $0$).

### B. Lag Features
Grouped strictly per `(store, item)` series:
- `lag_1`: $y_{t-1}$ (Sales from the previous calendar day).
- `lag_7`: $y_{t-7}$ (Sales from the same day in the previous week).
- `lag_14`: $y_{t-14}$ (Sales from two weeks prior).
- `lag_28`: $y_{t-28}$ (Sales from four weeks prior).

### C. Shifted Rolling Window Statistics
To mathematically guarantee **zero target leakage**, the sales series is shifted by $1$ before applying rolling windows:
$$y'_{t} = y_{t-1}$$
- `rolling_mean_7`: Mean of $\{y_{t-1}, y_{t-2}, \dots, y_{t-7}\}$ (prior 7-day short-term moving average).
- `rolling_std_7`: Standard deviation of $\{y_{t-1}, y_{t-2}, \dots, y_{t-7}\}$ (prior 7-day volatility).
- `rolling_mean_28`: Mean of $\{y_{t-1}, y_{t-2}, \dots, y_{t-28}\}$ (prior 28-day baseline moving average).

---

## 3. Cold Start & Missing Dates Handling

### A. Cold Start Handling
Because 28-day lags and rolling statistics require 28 prior days of historical sales observations, the initial 28 days for each series (from 2013-01-01 to 2013-01-28) generate NaN feature values. 
- During training, these initial 28 rows per series ($28 \times 500 = 14,000$ rows) are dropped from the training set to prevent training on unpopulated features.
- At inference time, the system requires a minimum of 35 days of historical observations to compute all lag and rolling inputs reliably.

### B. Missing Dates Handling
The Kaggle Store Item Demand dataset contains unbroken 1,826 consecutive days across all 500 series. If an external dataset contains missing calendar dates, `ensure_regular_calendar()` re-indexes the series to a complete daily grid and logs missing observations rather than silently imputing zeros.

---

## 4. Chronological Splitting Protocol

Random shuffling is strictly prohibited for time-series evaluation to avoid future data leaking into the training set.

| Split Period | Date Range | Duration | Observations | Purpose |
|:---|:---|:---|:---|:---|
| **Training Set** | 2013-01-29 to 2016-12-31 | ~4 full years | 716,500 rows | Model training |
| **Validation Set** | 2017-01-01 to 2017-06-30 | 6 months | 90,500 rows | Hyperparameter tuning & model selection |
| **Test (Holdout) Set** | 2017-07-01 to 2017-12-31 | 6 months | 92,000 rows | Final unseen holdout benchmark |

