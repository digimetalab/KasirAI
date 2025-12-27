"""
Products API Endpoints
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from src.dto import ProductCreate, ProductResponse
from src.db import get_supabase

router = APIRouter()


@router.get("")
async def list_products(
    tenant_id: str,
    category: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(default=50, le=100),
    offset: int = 0,
):
    """List products with optional filtering"""
    supabase = get_supabase()
    
    query = supabase.table("products").select("*").eq("tenant_id", tenant_id)
    
    if category:
        query = query.eq("category", category)
    
    if search:
        query = query.ilike("name", f"%{search}%")
    
    result = query.range(offset, offset + limit - 1).execute()
    
    return {"data": result.data, "count": len(result.data)}


@router.get("/{product_id}")
async def get_product(product_id: str):
    """Get single product by ID"""
    supabase = get_supabase()
    result = supabase.table("products").select("*").eq("id", product_id).single().execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return result.data


@router.post("")
async def create_product(product: ProductCreate):
    """Create new product"""
    supabase = get_supabase()
    
    data = product.model_dump()
    data["price"] = float(data["price"])
    if data.get("cost"):
        data["cost"] = float(data["cost"])
    
    result = supabase.table("products").insert(data).execute()
    return result.data[0]


@router.put("/{product_id}")
async def update_product(product_id: str, product: ProductCreate):
    """Update product"""
    supabase = get_supabase()
    
    data = product.model_dump()
    data["price"] = float(data["price"])
    if data.get("cost"):
        data["cost"] = float(data["cost"])
    
    result = supabase.table("products").update(data).eq("id", product_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return result.data[0]


@router.delete("/{product_id}")
async def delete_product(product_id: str):
    """Delete product"""
    supabase = get_supabase()
    supabase.table("products").delete().eq("id", product_id).execute()
    return {"message": "Product deleted"}


@router.get("/categories/list")
async def list_categories(tenant_id: str):
    """List unique categories"""
    supabase = get_supabase()
    result = supabase.table("products").select("category").eq(
        "tenant_id", tenant_id
    ).not_.is_("category", "null").execute()
    
    categories = list(set(p["category"] for p in result.data if p.get("category")))
    return {"categories": categories}
