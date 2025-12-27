"""
Pydantic Models - Financial Data Types
"""
from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import datetime
from enum import Enum
from typing import Optional


class PaymentType(str, Enum):
    CASH = "CASH"
    QRIS = "QRIS"
    CARD = "CARD"
    EWALLET = "EWALLET"


class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"


class DiscountType(str, Enum):
    PERCENTAGE = "PERCENTAGE"
    FIXED = "FIXED"


class MemberType(str, Enum):
    REGULAR = "REGULAR"
    SILVER = "SILVER"
    GOLD = "GOLD"
    PLATINUM = "PLATINUM"


class UserRole(str, Enum):
    CASHIER = "CASHIER"
    OWNER = "OWNER"
    ADMIN = "ADMIN"


# ============ Cart & Transaction Models ============

class CartItem(BaseModel):
    product_id: str
    product_name: str
    product_sku: str
    quantity: int = Field(ge=1)
    unit_price: Decimal
    unit_cost: Optional[Decimal] = None
    subtotal: Decimal


class CartRequest(BaseModel):
    tenant_id: str
    user_id: str


class AddItemRequest(BaseModel):
    product_id: str
    quantity: int = Field(ge=1, default=1)


class ApplyDiscountRequest(BaseModel):
    discount_code: str


class ApplyLoyaltyRequest(BaseModel):
    customer_id: str
    points_to_redeem: int = Field(ge=0)


class FinancialBreakdown(BaseModel):
    """Immutable financial breakdown - all values stored explicitly"""
    gross_sales: Decimal = Field(description="Subtotal sebelum diskon")
    item_discounts: Decimal = Field(default=Decimal("0"), description="Diskon per item")
    transaction_discount: Decimal = Field(default=Decimal("0"), description="Diskon transaksi")
    total_discount: Decimal = Field(default=Decimal("0"), description="Total diskon")
    subtotal_after_discount: Decimal = Field(description="Subtotal setelah diskon")
    loyalty_redemption: Decimal = Field(default=Decimal("0"), description="Nilai poin yang diredeem")
    dpp: Decimal = Field(description="Dasar Pengenaan Pajak")
    tax_rate: Decimal = Field(description="Rate pajak (%)")
    tax_amount: Decimal = Field(description="Jumlah pajak")
    grand_total: Decimal = Field(description="Total akhir yang harus dibayar")
    points_earned: int = Field(default=0, description="Poin yang didapat dari transaksi ini")


class FinalizeTransactionRequest(BaseModel):
    payment_type: PaymentType
    amount_received: Optional[Decimal] = None  # For cash payments


class TransactionResponse(BaseModel):
    id: str
    invoice_no: str
    breakdown: FinancialBreakdown
    payment_type: PaymentType
    payment_status: PaymentStatus
    change_amount: Decimal = Decimal("0")
    created_at: datetime


# ============ Product Models ============

class ProductBase(BaseModel):
    name: str
    sku: Optional[str] = None
    description: Optional[str] = None
    price: Decimal
    cost: Optional[Decimal] = None
    stock: int = 0
    category: Optional[str] = None


class ProductCreate(ProductBase):
    tenant_id: str


class ProductResponse(ProductBase):
    id: str
    tenant_id: str
    created_at: datetime
    updated_at: datetime


# ============ Customer Models ============

class CustomerBase(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None


class CustomerCreate(CustomerBase):
    tenant_id: str


class CustomerResponse(CustomerBase):
    id: str
    tenant_id: str
    member_code: str
    member_type: MemberType
    points: int
    lifetime_spent: Decimal
    lifetime_points: int
    joined_at: datetime


# ============ Discount Models ============

class DiscountBase(BaseModel):
    code: str
    name: str
    type: DiscountType
    value: Decimal
    min_purchase: Decimal = Decimal("0")
    max_discount: Optional[Decimal] = None
    usage_limit: Optional[int] = None
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None


class DiscountCreate(DiscountBase):
    tenant_id: str


class DiscountResponse(DiscountBase):
    id: str
    tenant_id: str
    usage_count: int
    is_active: bool
