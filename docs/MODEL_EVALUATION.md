# DemandSense AI — Phase 4 Model Training, Evaluation & Benchmarking

## 1. Candidate Architectures & Evaluation Protocol

All models were trained strictly using chronological training observations ($N = 716,500$) and evaluated across an untouched 6-month validation period ($N = 90,500$) for model selection, followed by a final held-out test evaluation ($N = 92,000$).

### Evaluated Model Families
1. **Naive Baseline (Lag 1):** Projects yesterday's sales observation as today's forecast ($\hat{y}_t = y_{t-1}$).
2. **Seasonal Naive Baseline (Lag 7):** Projects sales from the same day in the previous week ($\hat{y}_t = y_{t-7}$).
3. **Rolling Moving Average Baseline (7d):** Projects the mean of the prior 7 shifted daily observations.
4. **Random Forest Regressor:** Non-linear decision tree ensemble ($50$ estimators, max depth $16$).
5. **XGBoost Regressor:** Gradient-boosted decision trees ($100$ estimators, learning rate $0.1$, max depth $6$, subsample $0.8$, column sample $0.8$, histogram tree method).

---

## 2. Benchmark Leaderboard & Evaluation Metrics

Zero-division handling is strictly enforced in WAPE and sMAPE ($10^{-6}$ epsilon).

| Model Family | Val MAE | Val RMSE | Val WAPE | Val sMAPE | Test MAE | Test RMSE | Test WAPE | Test sMAPE | Outcome |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **Naive (Lag 1)** | 10.894 | 14.892 | 19.39% | 21.55% | 11.590 | 15.863 | 18.88% | 20.70% | Baseline |
| **Seasonal Naive (Lag 7)** | 8.463 | 11.046 | 15.06% | 17.64% | 9.214 | 12.114 | 15.01% | 17.04% | Baseline |
| **Rolling Mean (7d)** | 8.626 | 11.407 | 15.35% | 16.87% | 9.328 | 12.289 | 15.19% | 16.47% | Baseline |
| **Random Forest** | 6.133 | 7.996 | 10.91% | 12.68% | 6.531 | 8.499 | 10.64% | 12.22% | Candidate |
| **XGBoost** | **6.016** | **7.824** | **10.71%** | **12.48%** | **6.340** | **8.240** | **10.33%** | **11.90%** | **Selected Best** |

---

## 3. Model Selection Rationale
- **Validation Winner:** XGBoost achieved the lowest validation MAE of **6.016 units/day**, outperforming the Random Forest candidate (6.133) and substantially beating the best baseline (Seasonal Naive at 8.463).
- **Holdout Test Generalization:** On the untouched 6-month holdout test set (2017-07-01 to 2017-12-31), XGBoost maintained an MAE of **6.340 units/day**, an RMSE of **8.240**, and a WAPE of **10.33%** (~88% overall demand volume capture).

---

## 4. Model Artifacts & Reproduction
- **Serialized Artifact:** `ml/models/best_model.joblib`
- **Metadata Card:** `ml/models/model_metadata.json`
- **Reproducibility Command:**
  ```powershell
  $env:PYTHONPATH="."
  .venv\Scripts\python ml/training/train.py
  ```

---

## 5. Intended Use & Limitations
- **Intended Use:** Educational and portfolio demand intelligence platform. Produces mathematical demand trajectories for store-item combinations across 7, 14, and 30-day horizons.
- **Operational Limitations:**
  - Evaluated solely on historical units sold; does not incorporate price elasticities, promotion schedules, supply-chain interruptions, or weather anomalies.
  - Multi-step recursive forecasting accumulates uncertainty across extended horizons.

