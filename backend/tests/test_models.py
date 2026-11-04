from pathlib import Path
import json
import joblib
import numpy as np
import pandas as pd
from ml.features.engineer import FEATURE_COLUMNS


def test_model_artifact_exists_and_loads():
    model_path = Path("ml/models/best_model.joblib")
    assert model_path.exists(), "Model artifact must exist on disk"
    
    model = joblib.load(model_path)
    assert hasattr(model, "predict"), "Loaded artifact must implement predict"


def test_model_prediction_shape():
    model_path = Path("ml/models/best_model.joblib")
    model = joblib.load(model_path)

    dummy_features = pd.DataFrame(np.zeros((1, len(FEATURE_COLUMNS))), columns=FEATURE_COLUMNS)
    preds = model.predict(dummy_features)
    assert len(preds) == 1
    assert isinstance(preds[0], (float, np.floating, int, np.integer))


def test_metadata_card_integrity():
    meta_path = Path("ml/models/model_metadata.json")
    assert meta_path.exists(), "Model metadata card must exist"

    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    assert meta["model_name"] in ["XGBoost", "Random Forest"]
    assert "benchmark_comparison" in meta
    assert "selected_metrics" in meta
    assert len(meta["feature_columns"]) == len(FEATURE_COLUMNS)
    assert meta["split_config"]["train_end"] == "2016-12-31"
    assert meta["split_config"]["val_start"] == "2017-01-01"
    assert meta["split_config"]["test_start"] == "2017-07-01"


def test_selected_model_beats_baselines():
    meta_path = Path("ml/models/model_metadata.json")
    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    best_name = meta["model_name"]
    best_test_mae = meta["benchmark_comparison"][best_name]["test"]["MAE"]
    naive_test_mae = meta["benchmark_comparison"]["Naive (Lag 1)"]["test"]["MAE"]
    seasonal_test_mae = meta["benchmark_comparison"]["Seasonal Naive (Lag 7)"]["test"]["MAE"]
    rolling_test_mae = meta["benchmark_comparison"]["Rolling Mean (7d)"]["test"]["MAE"]

    # Assert that the complex trained model beats all 3 baselines
    assert best_test_mae < naive_test_mae, "Selected model must outperform Naive baseline"
    assert best_test_mae < seasonal_test_mae, "Selected model must outperform Seasonal Naive baseline"
    assert best_test_mae < rolling_test_mae, "Selected model must outperform Rolling Mean baseline"
