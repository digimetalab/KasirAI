"""
Discounts API Endpoints
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime
import uuid
from src.dto import DiscountCreate, DiscountResponse
from src.db import get_supabase

router = APIRouter()


@router.get("")
async def list_discounts(
    tenant_id: str,
    active_only: bool = True,
    limit: int = Query(default=50, le=100),
):
    """List discounts"""
    supabase = get_supabase()
    
    query = supabase.table("discounts").select("*").eq("tenant_id", tenant_id)
    
    if active_only:
        query = query.eq("is_active", True)
    
    result = query.order("created_at", desc=True).limit(limit).execute()
    
    return {"data": result.data}


@router.get("/{discount_id}")
async def get_discount(discount_id: str):
    """Get single discount"""
    supabase = get_supabase()
    result = supabase.table("discounts").select("*").eq("id", discount_id).single().execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Discount not found")
    
    return result.data


@router.get("/validate/{code}")
async def validate_discount(code: str, tenant_id: str, subtotal: float):
    """Validate discount code and return applicable value"""
    supabase = get_supabase()
    
    result = supabase.table("discounts").select("*").eq(
        "tenant_id", tenant_id
    ).eq("code", code).eq("is_active", True).single().execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Discount code not found")
    
    discount = result.data
    
    # Check validity period
    now = datetime.now().isoformat()
    if discount.get("valid_from") and discount["valid_from"] > now:
        raise HTTPException(status_code=400, detail="Discount not yet valid")
    if discount.get("valid_until") and discount["valid_until"] < now:
        raise HTTPException(status_code=400, detail="Discount expired")
    
    # Check usage limit
    if discount.get("usage_limit") and discount["usage_count"] >= discount["usage_limit"]:
        raise HTTPException(status_code=400, detail="Discount usage limit reached")
    
    # Check minimum purchase
    if subtotal < discount.get("min_purchase", 0):
        raise HTTPException(
            status_code=400,
            detail=f"Minimum purchase Rp {discount['min_purchase']} required"
        )
    
    # Calculate discount value
    if discount["type"] == "PERCENTAGE":
        value = subtotal * discount["value"] / 100
        if discount.get("max_discount"):
            value = min(value, discount["max_discount"])
    else:
        value = min(discount["value"], subtotal)
    
    return {
        "valid": True,
        "code": code,
        "name": discount["name"],
        "type": discount["type"],
        "discount_value": value,
    }


@router.post("")
async def create_discount(discount: DiscountCreate):
    """Create new discount code"""
    supabase = get_supabase()
    
    # Check if code already exists
    existing = supabase.table("discounts").select("id").eq(
        "tenant_id", discount.tenant_id
    ).eq("code", discount.code).execute()
    
    if existing.data:
        raise HTTPException(status_code=400, detail="Discount code already exists")
    
    data = discount.model_dump()
    data["id"] = str(uuid.uuid4())
    data["value"] = float(data["value"])
    data["min_purchase"] = float(data["min_purchase"])
    if data.get("max_discount"):
        data["max_discount"] = float(data["max_discount"])
    data["usage_count"] = 0
    data["is_active"] = True
    
    result = supabase.table("discounts").insert(data).execute()
    return result.data[0]


@router.put("/{discount_id}")
async def update_discount(discount_id: str, discount: DiscountCreate):
    """Update discount"""
    supabase = get_supabase()
    
    data = discount.model_dump()
    del data["tenant_id"]
    data["value"] = float(data["value"])
    data["min_purchase"] = float(data["min_purchase"])
    if data.get("max_discount"):
        data["max_discount"] = float(data["max_discount"])
    
    result = supabase.table("discounts").update(data).eq("id", discount_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Discount not found")
    
    return result.data[0]


@router.delete("/{discount_id}")
async def deactivate_discount(discount_id: str):
    """Deactivate discount (soft delete)"""
    supabase = get_supabase()
    
    result = supabase.table("discounts").update(
        {"is_active": False}
    ).eq("id", discount_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Discount not found")
    
    return {"message": "Discount deactivated"}
