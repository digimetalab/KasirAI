"""
Transaction API Endpoints
"""
from fastapi import APIRouter, HTTPException
from decimal import Decimal
from datetime import datetime
from typing import Optional
import uuid

from src.dto import (
    CartItem,
    CartRequest,
    AddItemRequest,
    ApplyDiscountRequest,
    ApplyLoyaltyRequest,
    FinancialBreakdown,
    FinalizeTransactionRequest,
    TransactionResponse,
    PaymentType,
    PaymentStatus,
    DiscountType,
    MemberType,
)
from src.core import CalculationEngine, MarginProtectionError
from src.db import get_supabase

router = APIRouter()

# In-memory cart storage (replace with Redis in production)
_carts: dict[str, dict] = {}


def generate_invoice_number(tenant_id: str) -> str:
    """Generate sequential invoice number"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_suffix = uuid.uuid4().hex[:4].upper()
    return f"INV-{timestamp}-{random_suffix}"


@router.post("/cart")
async def create_cart(request: CartRequest):
    """Initialize a new cart/transaction"""
    cart_id = str(uuid.uuid4())
    _carts[cart_id] = {
        "id": cart_id,
        "tenant_id": request.tenant_id,
        "user_id": request.user_id,
        "items": [],
        "customer_id": None,
        "discount_code": None,
        "discount_type": None,
        "discount_value": None,
        "max_discount": None,
        "points_redeemed": 0,
        "member_type": MemberType.REGULAR,
        "created_at": datetime.now().isoformat(),
    }
    return {"cart_id": cart_id}


@router.post("/cart/{cart_id}/items")
async def add_item(cart_id: str, request: AddItemRequest):
    """Add item to cart"""
    if cart_id not in _carts:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    cart = _carts[cart_id]
    supabase = get_supabase()
    
    # Fetch product from database
    result = supabase.table("products").select("*").eq("id", request.product_id).single().execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = result.data
    
    # Check if item already in cart
    for item in cart["items"]:
        if item.product_id == request.product_id:
            item.quantity += request.quantity
            item.subtotal = Decimal(str(product["price"])) * item.quantity
            return {"message": "Item quantity updated", "cart_id": cart_id}
    
    # Add new item
    engine = CalculationEngine()
    subtotal = engine.calculate_item_subtotal(
        Decimal(str(product["price"])),
        request.quantity
    )
    
    cart["items"].append(CartItem(
        product_id=product["id"],
        product_name=product["name"],
        product_sku=product.get("sku", ""),
        quantity=request.quantity,
        unit_price=Decimal(str(product["price"])),
        unit_cost=Decimal(str(product.get("cost", 0))) if product.get("cost") else None,
        subtotal=subtotal,
    ))
    
    return {"message": "Item added", "cart_id": cart_id}


@router.delete("/cart/{cart_id}/items/{product_id}")
async def remove_item(cart_id: str, product_id: str):
    """Remove item from cart"""
    if cart_id not in _carts:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    cart = _carts[cart_id]
    cart["items"] = [item for item in cart["items"] if item.product_id != product_id]
    
    return {"message": "Item removed", "cart_id": cart_id}


@router.post("/cart/{cart_id}/discount")
async def apply_discount(cart_id: str, request: ApplyDiscountRequest):
    """Apply discount code to cart"""
    if cart_id not in _carts:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    cart = _carts[cart_id]
    supabase = get_supabase()
    
    # Validate discount code
    result = supabase.table("discounts").select("*").eq(
        "tenant_id", cart["tenant_id"]
    ).eq("code", request.discount_code).eq("is_active", True).single().execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Discount code not found or inactive")
    
    discount = result.data
    
    # Check usage limit
    if discount.get("usage_limit") and discount["usage_count"] >= discount["usage_limit"]:
        raise HTTPException(status_code=400, detail="Discount usage limit reached")
    
    # Check min purchase
    engine = CalculationEngine()
    subtotal = engine.calculate_subtotal(cart["items"])
    
    if subtotal < Decimal(str(discount.get("min_purchase", 0))):
        raise HTTPException(
            status_code=400,
            detail=f"Minimum purchase Rp {discount['min_purchase']} required"
        )
    
    cart["discount_code"] = discount["code"]
    cart["discount_type"] = DiscountType(discount["type"])
    cart["discount_value"] = Decimal(str(discount["value"]))
    cart["max_discount"] = Decimal(str(discount["max_discount"])) if discount.get("max_discount") else None
    
    return {"message": "Discount applied", "discount_code": discount["code"]}


@router.post("/cart/{cart_id}/loyalty")
async def apply_loyalty(cart_id: str, request: ApplyLoyaltyRequest):
    """Apply loyalty point redemption"""
    if cart_id not in _carts:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    cart = _carts[cart_id]
    supabase = get_supabase()
    
    # Fetch customer
    result = supabase.table("customers").select("*").eq("id", request.customer_id).single().execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    customer = result.data
    
    # Validate points
    if request.points_to_redeem > customer["points"]:
        raise HTTPException(status_code=400, detail="Insufficient points")
    
    cart["customer_id"] = customer["id"]
    cart["points_redeemed"] = request.points_to_redeem
    cart["member_type"] = MemberType(customer.get("member_type", "REGULAR"))
    
    return {
        "message": "Loyalty applied",
        "customer_name": customer["name"],
        "points_redeemed": request.points_to_redeem,
        "points_remaining": customer["points"] - request.points_to_redeem,
    }


@router.get("/cart/{cart_id}/breakdown")
async def get_breakdown(cart_id: str) -> FinancialBreakdown:
    """Calculate and return financial breakdown"""
    if cart_id not in _carts:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    cart = _carts[cart_id]
    
    if not cart["items"]:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    engine = CalculationEngine()
    
    try:
        breakdown = engine.calculate_breakdown(
            items=cart["items"],
            discount_type=cart.get("discount_type"),
            discount_value=cart.get("discount_value"),
            max_discount=cart.get("max_discount"),
            points_redeemed=cart.get("points_redeemed", 0),
            member_type=cart.get("member_type", MemberType.REGULAR),
        )
        return breakdown
    except MarginProtectionError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/cart/{cart_id}/finalize")
async def finalize_transaction(
    cart_id: str,
    request: FinalizeTransactionRequest
) -> TransactionResponse:
    """Finalize transaction and persist to database"""
    if cart_id not in _carts:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    cart = _carts[cart_id]
    
    if not cart["items"]:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    engine = CalculationEngine()
    
    try:
        breakdown = engine.calculate_breakdown(
            items=cart["items"],
            discount_type=cart.get("discount_type"),
            discount_value=cart.get("discount_value"),
            max_discount=cart.get("max_discount"),
            points_redeemed=cart.get("points_redeemed", 0),
            member_type=cart.get("member_type", MemberType.REGULAR),
        )
    except MarginProtectionError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Calculate change for cash payments
    change_amount = Decimal("0")
    if request.payment_type == PaymentType.CASH and request.amount_received:
        if request.amount_received < breakdown.grand_total:
            raise HTTPException(status_code=400, detail="Insufficient payment amount")
        change_amount = request.amount_received - breakdown.grand_total
    
    # Generate invoice number
    invoice_no = generate_invoice_number(cart["tenant_id"])
    transaction_id = str(uuid.uuid4())
    
    # Persist to database
    supabase = get_supabase()
    
    transaction_data = {
        "id": transaction_id,
        "tenant_id": cart["tenant_id"],
        "invoice_no": invoice_no,
        "user_id": cart["user_id"],
        "customer_id": cart.get("customer_id"),
        "gross_sales": float(breakdown.gross_sales),
        "discount_amount": float(breakdown.total_discount),
        "discount_code": cart.get("discount_code"),
        "points_redeemed": cart.get("points_redeemed", 0),
        "points_value": float(breakdown.loyalty_redemption),
        "dpp": float(breakdown.dpp),
        "tax_rate": float(breakdown.tax_rate),
        "tax_amount": float(breakdown.tax_amount),
        "net_sales": float(breakdown.grand_total),
        "points_earned": breakdown.points_earned,
        "payment_type": request.payment_type.value,
        "payment_status": PaymentStatus.PAID.value if request.payment_type == PaymentType.CASH else PaymentStatus.PENDING.value,
    }
    
    supabase.table("transactions").insert(transaction_data).execute()
    
    # Insert transaction items
    for item in cart["items"]:
        item_data = {
            "id": str(uuid.uuid4()),
            "transaction_id": transaction_id,
            "product_id": item.product_id,
            "product_name": item.product_name,
            "product_sku": item.product_sku,
            "quantity": item.quantity,
            "unit_price": float(item.unit_price),
            "unit_cost": float(item.unit_cost) if item.unit_cost else None,
            "subtotal": float(item.subtotal),
        }
        supabase.table("transaction_items").insert(item_data).execute()
    
    # Update customer points if applicable
    if cart.get("customer_id"):
        # Deduct redeemed points, add earned points
        supabase.rpc("update_customer_points", {
            "p_customer_id": cart["customer_id"],
            "p_points_redeemed": cart.get("points_redeemed", 0),
            "p_points_earned": breakdown.points_earned,
            "p_amount_spent": float(breakdown.grand_total),
        }).execute()
    
    # Clean up cart
    del _carts[cart_id]
    
    return TransactionResponse(
        id=transaction_id,
        invoice_no=invoice_no,
        breakdown=breakdown,
        payment_type=request.payment_type,
        payment_status=PaymentStatus.PAID if request.payment_type == PaymentType.CASH else PaymentStatus.PENDING,
        change_amount=change_amount,
        created_at=datetime.now(),
    )


@router.get("/export")
async def export_coretax(
    tenant_id: str,
    start_date: str,
    end_date: str,
):
    """Export transactions for Coretax (Indonesia tax reporting)"""
    supabase = get_supabase()
    
    result = supabase.table("transactions").select(
        "invoice_no, created_at, dpp, tax_rate, tax_amount, payment_status"
    ).eq("tenant_id", tenant_id).gte(
        "created_at", start_date
    ).lte("created_at", end_date).execute()
    
    # Format for Coretax
    export_data = []
    for tx in result.data:
        export_data.append({
            "tanggal_faktur": tx["created_at"][:10],
            "nomor_faktur": tx["invoice_no"],
            "dpp": tx["dpp"],
            "ppn": tx["tax_amount"],
            "tarif_ppn": tx["tax_rate"],
            "status_pembayaran": tx["payment_status"],
        })
    
    return {
        "count": len(export_data),
        "data": export_data,
    }
