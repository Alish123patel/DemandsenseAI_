from typing import Dict, Any, List
from pydantic import BaseModel, Field


class InventoryRequest(BaseModel):
    store: int = Field(..., ge=1)
    item: int = Field(..., ge=1)
    current_stock: float = Field(..., ge=0, description="Current units on hand")
    supplier_lead_time_days: int = Field(..., ge=1, le=90, description="Lead time in days")
    incoming_stock: float = Field(default=0.0, ge=0, description="Units already in transit")
    safety_stock_buffer_percent: float = Field(
        default=20.0, ge=0.0, le=100.0, description="Safety buffer as percentage of lead time demand"
    )


class InventoryResponse(BaseModel):
    store: int
    item: int
    current_stock: float
    supplier_lead_time_days: int
    incoming_stock: float
    safety_stock_buffer_percent: float
    expected_demand_during_lead_time: float
    safety_stock: float
    reorder_point: float
    suggested_order_quantity: float
    reorder_recommended: bool
    assumptions: List[str]

