"""
Customers API Endpoints
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import uuid
from src.dto import CustomerCreate, CustomerResponse, MemberType
from src.db import get_supabase

router = APIRouter()


def generate_member_code() -> str:
    """Generate unique member code"""
    return f"M{uuid.uuid4().hex[:8].upper()}"


@router.get("")
async def list_customers(
    tenant_id: str,
    search: Optional[str] = None,
    limit: int = Query(default=20, le=100),
    offset: int = 0,
):
    """List customers with search"""
    supabase = get_supabase()
    
    query = supabase.table("customers").select("*").eq("tenant_id", tenant_id)
    
    if search:
        # Search by name or phone
        query = query.or_(f"name.ilike.%{search}%,phone.ilike.%{search}%")
    
    result = query.order("name").range(offset, offset + limit - 1).execute()
    
    return {"data": result.data, "count": len(result.data)}


@router.get("/{customer_id}")
async def get_customer(customer_id: str):
    """Get single customer by ID"""
    supabase = get_supabase()
    result = supabase.table("customers").select("*").eq("id", customer_id).single().execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return result.data


@router.get("/by-phone/{phone}")
async def get_customer_by_phone(phone: str, tenant_id: str):
    """Get customer by phone number"""
    supabase = get_supabase()
    result = supabase.table("customers").select("*").eq(
        "tenant_id", tenant_id
    ).eq("phone", phone).single().execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return result.data


@router.get("/by-code/{member_code}")
async def get_customer_by_code(member_code: str, tenant_id: str):
    """Get customer by member code"""
    supabase = get_supabase()
    result = supabase.table("customers").select("*").eq(
        "tenant_id", tenant_id
    ).eq("member_code", member_code).single().execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return result.data


@router.post("")
async def create_customer(customer: CustomerCreate):
    """Create new customer/member"""
    supabase = get_supabase()
    
    # Check if phone already exists
    existing = supabase.table("customers").select("id").eq(
        "tenant_id", customer.tenant_id
    ).eq("phone", customer.phone).execute()
    
    if existing.data:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    data = customer.model_dump()
    data["id"] = str(uuid.uuid4())
    data["member_code"] = generate_member_code()
    data["member_type"] = MemberType.REGULAR.value
    data["points"] = 0
    data["lifetime_spent"] = 0
    data["lifetime_points"] = 0
    
    result = supabase.table("customers").insert(data).execute()
    return result.data[0]


@router.put("/{customer_id}")
async def update_customer(customer_id: str, customer: CustomerCreate):
    """Update customer details"""
    supabase = get_supabase()
    
    data = customer.model_dump()
    del data["tenant_id"]  # Don't update tenant
    
    result = supabase.table("customers").update(data).eq("id", customer_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return result.data[0]


@router.get("/{customer_id}/points-history")
async def get_points_history(
    customer_id: str,
    limit: int = Query(default=20, le=100),
):
    """Get customer point transaction history"""
    supabase = get_supabase()
    
    result = supabase.table("point_ledger").select("*").eq(
        "customer_id", customer_id
    ).order("created_at", desc=True).limit(limit).execute()
    
    return {"data": result.data}
