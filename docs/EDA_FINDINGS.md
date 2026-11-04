# DemandSense AI — Phase 2 Exploratory Data Analysis & Quality Report

## 1. Dataset Verification & Sourcing
- **Source:** Kaggle Store Item Demand Forecasting Challenge (`train.csv`).
- **Raw Location:** `ml/data/raw/train.csv` (excluded from git tracking).
- **Canonical Location:** `ml/data/processed/canonical_sales.csv` (sorted chronologically by store, item, and date).
- **Total Records:** 913,000 daily observations.
- **Date Span:** 2013-01-01 to 2017-12-31 (1,826 consecutive calendar days).
- **Stores:** 10 unique stores (IDs 1 through 10).
- **Items:** 50 unique SKUs (IDs 1 through 50).
- **Time-Series Coverage:** Exactly $10 \times 50 \times 1,826 = 913,000$ rows. There are **zero missing dates** across all 500 store-item combinations.

---

## 2. Data Hygiene & Validation Audit

| Check | Expected | Observed | Status |
|:---|:---|:---|:---|
| Required Columns | `date, store, item, sales` | `date, store, item, sales` | **Passed** |
| Missing / Null Values | 0 across all fields | 0 nulls across 913,000 rows | **Passed** |
| Data Types | ISO Date, int, int, numeric | Timestamp, int64, int64, float64 | **Passed** |
| Sales Lower Bound | $\ge 0$ | Min sales: 0.0, Max sales: 231.0 | **Passed** |
| Duplicate Keys | 0 duplicate `(date, store, item)` | 0 duplicates | **Passed** |
| Continuity | Unbroken sequence | Complete 5-year coverage | **Passed** |

---

## 3. Statistical Distribution & Seasonality Insights

### Sales Metrics
- **Mean Daily Sales:** 52.26 units
- **Median Daily Sales:** 47.00 units
- **Standard Deviation:** 28.80 units
- **Total Volume Sold:** 47,717,112 units

### Day-of-Week Seasonality
Sales show a pronounced weekend lift:
- **Monday:** 40.54 units (Weekly trough)
- **Tuesday:** 47.78 units
- **Wednesday:** 48.06 units
- **Thursday:** 51.58 units
- **Friday:** 58.75 units
- **Saturday:** 64.92 units
- **Sunday:** 69.19 units (Weekly peak)

### Annual Seasonality
Sales demonstrate strong summer peaking and mid-winter troughs:
- **Lowest Month:** January (30.43 units/day average)
- **Highest Month:** July (68.61 units/day average)

---

## 4. Outlier Analysis & Preservation Policy
- **IQR Threshold:** 25th percentile = 30.0, 75th percentile = 70.0 ($IQR = 40.0$).
- Upper Bound ($Q3 + 1.5 \times IQR$) = 130.0 units.
- Observations above 130 units: **11,967 rows** (~1.31% of dataset).
- **Policy:** These observations are natural, expected peaks during summer weekends and holiday seasons. They represent authentic retail demand volatility and are **preserved** rather than artificially clipped or deleted.

---

## 5. Visual Artifacts Produced
The automated EDA pipeline generated the following figures in `ml/reports/figures/`:
1. `sales_distribution.png`: Histogram and distribution curve with mean/median markers.
2. `total_sales_over_time.png`: 5-year daily aggregate sales demand curve.
3. `sales_by_store.png`: Mean daily sales comparison across all 10 store locations.
4. `sales_by_item.png`: SKU performance comparison (highest vs lowest selling items).
5. `weekday_seasonality.png`: Day-of-week average sales progression.
6. `monthly_seasonality.png`: Monthly seasonality curve.

