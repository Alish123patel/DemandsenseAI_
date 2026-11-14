"""Forecasting service: loads pre-trained model and generates multi-step projections."""
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
import json
import joblib
import pandas as pd
import numpy as np

from ml.features.engineer import FEATURE_COLUMNS


class ForecastingService:
    def __init__(
        self,
        model_path: str = "ml/models/best_model.joblib",
        metadata_path: str = "ml/models/model_metadata.json",
        canonical_data_path: str = "ml/data/processed/canonical_sales.csv",
    ):
        self.model_path = Path(model_path)
        self.metadata_path = Path(metadata_path)
        self.canonical_data_path = Path(canonical_data_path)
        self._model = None
        self._metadata = None
        self._canonical_df = None

    def get_model(self):
        if self._model is None:
            if not self.model_path.exists():
                raise FileNotFoundError(f"Model artifact not found at: {self.model_path}")
            self._model = joblib.load(self.model_path)
        return self._model

    def get_metadata(self) -> Dict[str, Any]:
        if self._metadata is None:
            if not self.metadata_path.exists():
                raise FileNotFoundError(f"Metadata file not found at: {self.metadata_path}")
            with open(self.metadata_path, "r", encoding="utf-8") as f:
                self._metadata = json.load(f)
        return self._metadata

    def get_canonical_data(self) -> pd.DataFrame:
        if self._canonical_df is None:
            if self.canonical_data_path.exists():
                data_path = self.canonical_data_path
            elif Path("ml/data/seed_sales.csv").exists():
                data_path = Path("ml/data/seed_sales.csv")
            else:
                raise FileNotFoundError(f"Canonical dataset not found at: {self.canonical_data_path}")
            df = pd.read_csv(data_path)
            df["date"] = pd.to_datetime(df["date"])
            self._canonical_df = df
        return self._canonical_df

    def get_available_series(self) -> Dict[str, List[int]]:
        df = self.get_canonical_data()
        return {
            "stores": sorted([int(s) for s in df["store"].unique()]),
            "items": sorted([int(i) for i in df["item"].unique()]),
        }

    def get_history(self, store: int, item: int, limit: int = 180) -> List[Dict[str, Any]]:
        df = self.get_canonical_data()
        series_df = df[(df["store"] == store) & (df["item"] == item)].sort_values("date")
        if series_df.empty:
            raise ValueError(f"No history found for store {store} and item {item}")
        
        tail_df = series_df.tail(limit)
        return [
            {"date": row["date"].strftime("%Y-%m-%d"), "sales": float(row["sales"])}
            for _, row in tail_df.iterrows()
        ]

    def generate_forecast(self, store: int, item: int, horizon_days: int = 14) -> Dict[str, Any]:
        if horizon_days not in [7, 14, 30]:
            raise ValueError(f"Unsupported horizon: {horizon_days}. Expected 7, 14, or 30 days.")

        model = self.get_model()
        metadata = self.get_metadata()
        df = self.get_canonical_data()

        series = df[(df["store"] == store) & (df["item"] == item)].sort_values("date").reset_index(drop=True)
        if len(series) < 35:
            raise ValueError(f"Insufficient history for store {store}, item {item} (need at least 35 days).")

        # Take the most recent 60 observations to build rolling/lag buffers
        recent = series.tail(60).copy()
        history_dates = recent["date"].tolist()
        history_sales = recent["sales"].astype(float).tolist()

        last_date = history_dates[-1]
        model_rmse = metadata.get("selected_metrics", {}).get("test", {}).get("RMSE", 8.0)

        predictions: List[Dict[str, Any]] = []

        # Recursive multi-step forecasting
        for step in range(1, horizon_days + 1):
            next_date = last_date + timedelta(days=step)
            dow = next_date.day_of_week
            dom = next_date.day
            month = next_date.month
            year = next_date.year
            week_of_year = int(next_date.isocalendar().week)
            is_weekend = 1 if dow >= 5 else 0

            # Lags relative to current step
            lag_1 = history_sales[-1]
            lag_7 = history_sales[-7] if len(history_sales) >= 7 else history_sales[-1]
            lag_14 = history_sales[-14] if len(history_sales) >= 14 else history_sales[-1]
            lag_28 = history_sales[-28] if len(history_sales) >= 28 else history_sales[-1]

            # Rolling stats over prior shifted window
            rolling_7 = history_sales[-7:]
            rolling_mean_7 = float(np.mean(rolling_7))
            rolling_std_7 = float(np.std(rolling_7))

            rolling_28 = history_sales[-28:] if len(history_sales) >= 28 else history_sales
            rolling_mean_28 = float(np.mean(rolling_28))

            row_features = pd.DataFrame([{
                "store": store,
                "item": item,
                "day_of_week": dow,
                "day_of_month": dom,
                "month": month,
                "year": year,
                "week_of_year": week_of_year,
                "is_weekend": is_weekend,
                "lag_1": lag_1,
                "lag_7": lag_7,
                "lag_14": lag_14,
                "lag_28": lag_28,
                "rolling_mean_7": rolling_mean_7,
                "rolling_std_7": rolling_std_7,
                "rolling_mean_28": rolling_mean_28,
            }])[FEATURE_COLUMNS]

            pred_val = float(model.predict(row_features)[0])
            pred_val = max(0.0, round(pred_val, 1))

            # Uncertainty bounds with gentle expansion over horizon
            horizon_spread = model_rmse * (1.0 + (0.015 * step))
            lower_bound = max(0.0, round(pred_val - (1.96 * horizon_spread), 1))
            upper_bound = round(pred_val + (1.96 * horizon_spread), 1)

            predictions.append({
                "date": next_date.strftime("%Y-%m-%d"),
                "predicted_sales": pred_val,
                "lower_bound": lower_bound,
                "upper_bound": upper_bound,
            })

            # Append prediction to running history sequence for subsequent recursive steps
            history_dates.append(next_date)
            history_sales.append(pred_val)

        total_demand = sum(p["predicted_sales"] for p in predictions)
        mean_daily = total_demand / horizon_days

        return {
            "store": store,
            "item": item,
            "horizon_days": horizon_days,
            "model_name": metadata.get("model_name", "HistGradientBoosting"),
            "model_version": metadata.get("version", "1.0.0"),
            "forecast_generated_at": datetime.now(timezone.utc).isoformat(),
            "total_forecasted_demand": round(total_demand, 1),
            "mean_daily_forecast": round(mean_daily, 2),
            "predictions": predictions,
        }


forecasting_service = ForecastingService()

