from fastapi import APIRouter, HTTPException
from app.schemas.inventory import InventoryRequest, InventoryResponse
from app.services.inventory import calculate_inventory_recommendation

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.post("/recommendation", response_model=InventoryResponse)
def get_inventory_recommendation(payload: InventoryRequest):
    """Calculates transparent inventory replenishment parameters (ROP, safety stock, suggested order quantity)."""
    try:
        recommendation = calculate_inventory_recommendation(
            store=payload.store,
            item=payload.item,
            current_stock=payload.current_stock,
            supplier_lead_time_days=payload.supplier_lead_time_days,
            incoming_stock=payload.incoming_stock,
            safety_stock_buffer_percent=payload.safety_stock_buffer_percent,
        )
        return recommendation
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

