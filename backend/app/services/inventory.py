"""Inventory replenishment recommendation service."""
from typing import Dict, Any, List
from app.services.forecasting import forecasting_service


def calculate_inventory_recommendation(
    store: int,
    item: int,
    current_stock: float,
    supplier_lead_time_days: int,
    incoming_stock: float = 0.0,
    safety_stock_buffer_percent: float = 20.0,
) -> Dict[str, Any]:
    """Computes transparent inventory replenishment parameters.
    
    Formula:
      reorder_point = expected_demand_during_lead_time + safety_stock
      suggested_order = max(0, reorder_point - current_stock - incoming_stock)
    """
    # Generate forecast up to lead time (or clamp to closest valid horizon: 7, 14, 30)
    horizon = 30 if supplier_lead_time_days > 14 else (14 if supplier_lead_time_days > 7 else 7)
    forecast_result = forecasting_service.generate_forecast(store=store, item=item, horizon_days=horizon)

    # Lead time demand: sum of predicted sales across supplier_lead_time_days
    lead_time_preds = forecast_result["predictions"][:supplier_lead_time_days]
    lead_time_demand = sum(p["predicted_sales"] for p in lead_time_preds)

    # If lead time exceeds horizon, extrapolate using mean daily forecast
    if supplier_lead_time_days > len(lead_time_preds):
        extra_days = supplier_lead_time_days - len(lead_time_preds)
        lead_time_demand += extra_days * forecast_result["mean_daily_forecast"]

    safety_stock = lead_time_demand * (safety_stock_buffer_percent / 100.0)
    reorder_point = lead_time_demand + safety_stock

    net_effective_inventory = current_stock + incoming_stock
    suggested_order = max(0.0, reorder_point - net_effective_inventory)
    reorder_recommended = net_effective_inventory <= reorder_point

    assumptions = [
        "Demand during supplier lead time is calculated directly from model forecast projections.",
        f"Safety stock buffer is transparently parameterized at {safety_stock_buffer_percent}% of lead-time demand.",
        "Supplier lead time and on-hand stock are user-supplied operational inputs, not historical dataset facts.",
        "Suggested order accounts for incoming on-order inventory before recommending new orders."
    ]

    return {
        "store": store,
        "item": item,
        "current_stock": float(current_stock),
        "supplier_lead_time_days": int(supplier_lead_time_days),
        "incoming_stock": float(incoming_stock),
        "safety_stock_buffer_percent": float(safety_stock_buffer_percent),
        "expected_demand_during_lead_time": round(lead_time_demand, 1),
        "safety_stock": round(safety_stock, 1),
        "reorder_point": round(reorder_point, 1),
        "suggested_order_quantity": round(suggested_order, 1),
        "reorder_recommended": bool(reorder_recommended),
        "assumptions": assumptions,
    }
