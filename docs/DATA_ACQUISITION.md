# DemandSense AI — Data Acquisition & Schema Specification

## 1. Source Dataset
The default dataset is sourced from the **Kaggle Store Item Demand Forecasting Challenge**:
- URL: [https://www.kaggle.com/competitions/demand-forecasting-kernels-only](https://www.kaggle.com/competitions/demand-forecasting-kernels-only)
- Description: 5 years of daily store-item sales data (2013-01-01 to 2017-12-31) across 10 stores and 50 unique items (913,000 total observations).

## 2. Expected Core Schema
Every uploaded or processed sales dataset must adhere strictly to the following 4 fields:

| Field Name | Type | Constraints | Description |
|:---|:---|:---|:---|
| `date` | String / ISO Date | Format: `YYYY-MM-DD`, valid chronological timestamp | The calendar day of observed sales. |
| `store` | Integer | Positive integer ($\ge 1$) | Identifier for the retail store location. |
| `item` | Integer | Positive integer ($\ge 1$) | Identifier for the product SKU / merchandise item. |
| `sales` | Integer / Float | Non-negative numeric ($\ge 0$) | Units sold on that calendar date at that store. |

## 3. Data Integrity & Validation Policy
- **No Target Leakage:** Only past sales observations are utilized for lag and rolling calculations.
- **Duplicate Records Policy:** The combination of `(date, store, item)` must be unique. Duplicate keys are flagged as validation errors and are never silently overwritten or aggregated.
- **Zero Sales vs Missing Dates:** When an explicit date is missing from a store-item series, it must not be silently imputed as zero without logging. The validation pipeline checks for time-series continuity.
- **Outliers:** Unusually high sales spikes (e.g. holiday peaks) are profiled via IQR metrics and documented rather than silently discarded.

