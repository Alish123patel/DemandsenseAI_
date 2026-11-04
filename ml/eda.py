"""Exploratory Data Analysis and data quality profiling script."""
import json
from pathlib import Path
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend
import matplotlib.pyplot as plt

from ml.preprocessing.ingest import load_raw_dataset
from ml.preprocessing.validate import validate_dataset, create_canonical_dataset


def run_eda(raw_path: str = "ml/data/raw/train.csv") -> dict:
    """Executes dataset profiling, creates canonical representation, generates plots, and writes reports."""
    print(f"Loading raw data from: {raw_path}")
    raw_df = load_raw_dataset(raw_path)

    print("Validating dataset schema and integrity...")
    val_result = validate_dataset(raw_df)
    if not val_result.is_valid:
        raise ValueError(f"Dataset validation failed: {val_result.errors}")

    print("Creating canonical dataset...")
    canonical_df = create_canonical_dataset(raw_df)

    processed_dir = Path("ml/data/processed")
    processed_dir.mkdir(parents=True, exist_ok=True)
    canonical_path = processed_dir / "canonical_sales.csv"
    canonical_df.to_csv(canonical_path, index=False)
    print(f"Saved canonical dataset to: {canonical_path}")

    # Derived temporal fields for analysis
    canonical_df["day_of_week"] = canonical_df["date"].dt.day_name()
    canonical_df["day_of_week_num"] = canonical_df["date"].dt.day_of_week
    canonical_df["month"] = canonical_df["date"].dt.month_name()
    canonical_df["month_num"] = canonical_df["date"].dt.month
    canonical_df["year"] = canonical_df["date"].dt.year

    dow_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    month_order = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]

    dow_sales = canonical_df.groupby("day_of_week")["sales"].mean().reindex(dow_order).to_dict()
    monthly_sales = canonical_df.groupby("month")["sales"].mean().reindex(month_order).to_dict()
    store_sales = canonical_df.groupby("store")["sales"].agg(["sum", "mean"]).to_dict(orient="index")
    item_sales = canonical_df.groupby("item")["sales"].agg(["sum", "mean"]).to_dict(orient="index")

    figures_dir = Path("ml/reports/figures")
    figures_dir.mkdir(parents=True, exist_ok=True)

    print("Generating EDA visualizations...")

    # Figure 1: Sales Distribution
    plt.figure(figsize=(9, 4.5))
    plt.hist(canonical_df["sales"], bins=60, color="#4f46e5", edgecolor="#312e81", alpha=0.85)
    plt.axvline(canonical_df["sales"].mean(), color="#ef4444", linestyle="--", label=f"Mean: {canonical_df['sales'].mean():.1f}")
    plt.axvline(canonical_df["sales"].median(), color="#10b981", linestyle="-", label=f"Median: {canonical_df['sales'].median():.1f}")
    plt.title("Overall Daily Sales Unit Distribution", fontsize=12, fontweight="bold")
    plt.xlabel("Sales (Units)")
    plt.ylabel("Frequency")
    plt.legend()
    plt.tight_layout()
    plt.savefig(figures_dir / "sales_distribution.png", dpi=150)
    plt.close()

    # Figure 2: Total Daily Sales Over Time
    plt.figure(figsize=(12, 4.5))
    daily_total = canonical_df.groupby("date")["sales"].sum()
    plt.plot(daily_total.index, daily_total.values, color="#6366f1", linewidth=0.8)
    plt.title("Total Daily Retail Demand Over Time (2013 - 2017)", fontsize=12, fontweight="bold")
    plt.xlabel("Date")
    plt.ylabel("Total Units Sold Across All Stores")
    plt.tight_layout()
    plt.savefig(figures_dir / "total_sales_over_time.png", dpi=150)
    plt.close()

    # Figure 3: Mean Sales by Store
    plt.figure(figsize=(9, 4))
    stores_mean = [store_sales[s]["mean"] for s in sorted(store_sales.keys())]
    store_labels = [f"Store {s}" for s in sorted(store_sales.keys())]
    plt.bar(store_labels, stores_mean, color="#0ea5e9", edgecolor="#0369a1")
    plt.title("Mean Daily Sales by Store Location", fontsize=12, fontweight="bold")
    plt.xlabel("Store Identifier")
    plt.ylabel("Mean Daily Units")
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(figures_dir / "sales_by_store.png", dpi=150)
    plt.close()

    # Figure 4: Top & Bottom 10 Items by Average Daily Sales
    plt.figure(figsize=(10, 4.5))
    sorted_items = sorted(item_sales.items(), key=lambda x: x[1]["mean"], reverse=True)
    top_5 = sorted_items[:5]
    bottom_5 = sorted_items[-5:]
    sample_items = top_5 + bottom_5
    x_labels = [f"Item {i[0]}" for i in sample_items]
    y_vals = [i[1]["mean"] for i in sample_items]
    colors = ["#10b981"] * 5 + ["#f59e0b"] * 5
    plt.bar(x_labels, y_vals, color=colors)
    plt.title("Highest vs Lowest Selling SKUs (Mean Daily Units)", fontsize=12, fontweight="bold")
    plt.xlabel("Item SKU (Top 5 in Green, Bottom 5 in Amber)")
    plt.ylabel("Mean Units / Day")
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(figures_dir / "sales_by_item.png", dpi=150)
    plt.close()

    # Figure 5: Day of Week Seasonality
    plt.figure(figsize=(8, 4))
    plt.bar(dow_order, [dow_sales[d] for d in dow_order], color="#8b5cf6", edgecolor="#6d28d9")
    plt.title("Weekly Seasonality (Average Sales by Day of Week)", fontsize=12, fontweight="bold")
    plt.ylabel("Mean Units / Day")
    plt.tight_layout()
    plt.savefig(figures_dir / "weekday_seasonality.png", dpi=150)
    plt.close()

    # Figure 6: Monthly Seasonality
    plt.figure(figsize=(10, 4))
    plt.plot(month_order, [monthly_sales[m] for m in month_order], marker="o", color="#ec4899", linewidth=2)
    plt.title("Annual Seasonality (Average Sales by Month)", fontsize=12, fontweight="bold")
    plt.ylabel("Mean Units / Day")
    plt.xticks(rotation=45)
    plt.grid(True, linestyle="--", alpha=0.5)
    plt.tight_layout()
    plt.savefig(figures_dir / "monthly_seasonality.png", dpi=150)
    plt.close()

    print(f"Saved 6 EDA visual figures to: {figures_dir}")

    # Build report dictionary
    report = {
        "validation": val_result.to_dict(),
        "seasonality": {
            "day_of_week_mean_sales": {k: round(v, 2) for k, v in dow_sales.items()},
            "monthly_mean_sales": {k: round(v, 2) for k, v in monthly_sales.items()},
        },
        "store_aggregations": {
            str(k): {"total_sales": round(v["sum"], 1), "mean_daily_sales": round(v["mean"], 2)}
            for k, v in store_sales.items()
        },
        "item_aggregations": {
            str(k): {"total_sales": round(v["sum"], 1), "mean_daily_sales": round(v["mean"], 2)}
            for k, v in item_sales.items()
        },
        "figure_paths": [
            "ml/reports/figures/sales_distribution.png",
            "ml/reports/figures/total_sales_over_time.png",
            "ml/reports/figures/sales_by_store.png",
            "ml/reports/figures/sales_by_item.png",
            "ml/reports/figures/weekday_seasonality.png",
            "ml/reports/figures/monthly_seasonality.png",
        ]
    }

    reports_dir = Path("ml/reports")
    report_file = reports_dir / "data_quality_summary.json"
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print(f"Data quality summary written to: {report_file}")
    return report


if __name__ == "__main__":
    run_eda()
