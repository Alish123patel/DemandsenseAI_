"""Model training, evaluation, and artifact serialization for DemandSense AI."""
import json
from pathlib import Path
from datetime import datetime, timezone
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, HistGradientBoostingRegressor
import xgboost as xgb
import joblib

from ml.preprocessing.ingest import load_raw_dataset
from ml.preprocessing.validate import create_canonical_dataset
from ml.features.engineer import engineer_features, chronological_split, FEATURE_COLUMNS, TARGET_COLUMN


def calculate_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> dict:
    """Computes MAE, RMSE, WAPE, and sMAPE with explicit zero-handling."""
    mae = float(np.mean(np.abs(y_true - y_pred)))
    rmse = float(np.sqrt(np.mean((y_true - y_pred) ** 2)))
    
    # WAPE: sum(|y - y_hat|) / sum(y)
    sum_true = float(np.sum(y_true))
    wape = float(np.sum(np.abs(y_true - y_pred)) / sum_true) if sum_true > 0 else 0.0

    # sMAPE: 200 * mean(|y - y_hat| / (|y| + |y_hat| + 1e-6))
    denominator = np.abs(y_true) + np.abs(y_pred) + 1e-6
    smape = float(np.mean(200.0 * np.abs(y_true - y_pred) / denominator))

    return {
        "MAE": round(mae, 3),
        "RMSE": round(rmse, 3),
        "WAPE": round(wape, 4),
        "sMAPE": round(smape, 3),
    }


def train_and_evaluate(canonical_path: str = "ml/data/processed/canonical_sales.csv") -> dict:
    print(f"Loading canonical data from: {canonical_path}")
    df = pd.read_csv(canonical_path)

    print("Engineering features...")
    featured_df = engineer_features(df)

    print("Splitting chronologically...")
    train_df, val_df, test_df = chronological_split(
        featured_df, val_start="2017-01-01", test_start="2017-07-01"
    )

    X_train = train_df[FEATURE_COLUMNS]
    y_train = train_df[TARGET_COLUMN].values

    X_val = val_df[FEATURE_COLUMNS]
    y_val = val_df[TARGET_COLUMN].values

    X_test = test_df[FEATURE_COLUMNS]
    y_test = test_df[TARGET_COLUMN].values

    print(f"Training samples: {len(X_train):,}, Validation samples: {len(X_val):,}, Test samples: {len(X_test):,}")

    benchmark_results = {}

    # 1. Baseline: Naive (last value = lag_1)
    print("Evaluating Baseline 1: Naive (Lag 1)...")
    naive_pred_val = val_df["lag_1"].values
    naive_pred_test = test_df["lag_1"].values
    benchmark_results["Naive (Lag 1)"] = {
        "val": calculate_metrics(y_val, naive_pred_val),
        "test": calculate_metrics(y_test, naive_pred_test),
    }

    # 2. Baseline: Seasonal Naive (Lag 7)
    print("Evaluating Baseline 2: Seasonal Naive (Lag 7)...")
    s_naive_pred_val = val_df["lag_7"].values
    s_naive_pred_test = test_df["lag_7"].values
    benchmark_results["Seasonal Naive (Lag 7)"] = {
        "val": calculate_metrics(y_val, s_naive_pred_val),
        "test": calculate_metrics(y_test, s_naive_pred_test),
    }

    # 3. Baseline: 7-day Rolling Mean
    print("Evaluating Baseline 3: Rolling Mean (7d)...")
    roll_pred_val = val_df["rolling_mean_7"].values
    roll_pred_test = test_df["rolling_mean_7"].values
    benchmark_results["Rolling Mean (7d)"] = {
        "val": calculate_metrics(y_val, roll_pred_val),
        "test": calculate_metrics(y_test, roll_pred_test),
    }

    # 4. XGBoost Regressor
    print("Training XGBoost Regressor...")
    xgbr = xgb.XGBRegressor(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=6,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        n_jobs=-1,
        tree_method="hist",
    )
    xgbr.fit(X_train, y_train)
    xgb_pred_val = xgbr.predict(X_val)
    xgb_pred_test = xgbr.predict(X_test)
    benchmark_results["XGBoost"] = {
        "val": calculate_metrics(y_val, xgb_pred_val),
        "test": calculate_metrics(y_test, xgb_pred_test),
    }

    # 5. Random Forest Regressor (trained on recent representative train window for efficiency)
    print("Training Random Forest Regressor...")
    rf = RandomForestRegressor(
        n_estimators=50,
        max_depth=16,
        n_jobs=-1,
        random_state=42,
    )
    recent_train = train_df[train_df["year"] >= 2015]
    rf.fit(recent_train[FEATURE_COLUMNS], recent_train[TARGET_COLUMN].values)
    rf_pred_val = rf.predict(X_val)
    rf_pred_test = rf.predict(X_test)
    benchmark_results["Random Forest"] = {
        "val": calculate_metrics(y_val, rf_pred_val),
        "test": calculate_metrics(y_test, rf_pred_test),
    }

    # Model Selection strictly based on validation MAE
    xgb_val_mae = benchmark_results["XGBoost"]["val"]["MAE"]
    rf_val_mae = benchmark_results["Random Forest"]["val"]["MAE"]

    if xgb_val_mae <= rf_val_mae:
        best_model_name = "XGBoost"
        best_model = xgbr
        selected_metrics = benchmark_results["XGBoost"]
    else:
        best_model_name = "Random Forest"
        best_model = rf
        selected_metrics = benchmark_results["Random Forest"]

    print(f"\nModel selection complete! Best model: {best_model_name} (Validation MAE: {selected_metrics['val']['MAE']}, Test MAE: {selected_metrics['test']['MAE']})")

    # Serialize selected model artifact
    models_dir = Path("ml/models")
    models_dir.mkdir(parents=True, exist_ok=True)
    model_path = models_dir / "best_model.joblib"
    joblib.dump(best_model, model_path)
    print(f"Saved model artifact to: {model_path}")

    # Build model metadata & evaluation card
    metadata = {
        "model_name": best_model_name,
        "version": "1.0.0",
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "feature_columns": FEATURE_COLUMNS,
        "target_column": TARGET_COLUMN,
        "split_config": {
            "train_end": "2016-12-31",
            "val_start": "2017-01-01",
            "val_end": "2017-06-30",
            "test_start": "2017-07-01",
            "test_end": "2017-12-31",
        },
        "selected_metrics": selected_metrics,
        "benchmark_comparison": benchmark_results,
        "intended_use": (
            "Educational and portfolio demand forecasting assistant. Produces mathematical "
            "7, 14, and 30-day unit demand projections. Not for automated purchasing without human oversight."
        ),
        "limitations": [
            "Trained solely on store-item historical units sold.",
            "Does not account for external shocks, weather, or promotional events absent from source data.",
            "Direct and recursive forecasts accumulate uncertainty over extended horizons."
        ]
    }

    metadata_path = models_dir / "model_metadata.json"
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"Saved model metadata card to: {metadata_path}")

    return metadata


if __name__ == "__main__":
    train_and_evaluate()
