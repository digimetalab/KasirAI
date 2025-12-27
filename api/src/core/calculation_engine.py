"""
CalculationEngine - Core Financial Logic

STRICT CALCULATION ORDER:
1. Subtotal (sum of item price × quantity)
2. Discount (item & transaction level)
3. Loyalty point redemption
4. Tax calculation (DPP + PPN)
5. Grand total

All monetary calculations use Decimal for precision.
All calculations happen SERVER-SIDE ONLY.
"""
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional
from src.dto.schemas import (
    CartItem,
    FinancialBreakdown,
    DiscountType,
    MemberType,
)


class MarginProtectionError(Exception):
    """Raised when discount would cause negative margin"""
    pass


class CalculationEngine:
    """
    Central service for all financial calculations.
    Follows strict calculation order to ensure consistency.
    """
    
    def __init__(
        self,
        tax_rate: Decimal = Decimal("11"),
        tax_inclusive: bool = False,
        points_per_amount: int = 10000,
        point_value: int = 100,
        max_discount_pct: Decimal = Decimal("30"),
    ):
        self.tax_rate = tax_rate
        self.tax_inclusive = tax_inclusive
        self.points_per_amount = points_per_amount
        self.point_value = point_value
        self.max_discount_pct = max_discount_pct
    
    def calculate_subtotal(self, items: list[CartItem]) -> Decimal:
        """Step 1: Calculate gross sales (sum of item subtotals)"""
        return sum(item.subtotal for item in items)
    
    def calculate_item_subtotal(self, price: Decimal, quantity: int) -> Decimal:
        """Calculate single item subtotal"""
        return (price * Decimal(quantity)).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
    
    def apply_discount(
        self,
        subtotal: Decimal,
        discount_type: Optional[DiscountType],
        discount_value: Optional[Decimal],
        max_discount: Optional[Decimal] = None,
    ) -> tuple[Decimal, Decimal]:
        """
        Step 2: Apply discount
        Returns: (discount_amount, subtotal_after_discount)
        """
        if discount_type is None or discount_value is None:
            return Decimal("0"), subtotal
        
        if discount_type == DiscountType.PERCENTAGE:
            discount_amount = (subtotal * discount_value / Decimal("100")).quantize(
                Decimal("1"), rounding=ROUND_HALF_UP
            )
            # Apply max discount cap if set
            if max_discount is not None:
                discount_amount = min(discount_amount, max_discount)
        else:  # FIXED
            discount_amount = min(discount_value, subtotal)
        
        # Enforce maximum discount percentage
        max_allowed = (subtotal * self.max_discount_pct / Decimal("100")).quantize(
            Decimal("1"), rounding=ROUND_HALF_UP
        )
        discount_amount = min(discount_amount, max_allowed)
        
        subtotal_after_discount = subtotal - discount_amount
        return discount_amount, subtotal_after_discount
    
    def calculate_loyalty_redemption(
        self,
        points: int,
        max_redemption_value: Optional[Decimal] = None,
    ) -> Decimal:
        """
        Step 3: Calculate monetary value of redeemed points
        """
        value = Decimal(points * self.point_value)
        
        if max_redemption_value is not None:
            value = min(value, max_redemption_value)
        
        return value.quantize(Decimal("1"), rounding=ROUND_HALF_UP)
    
    def calculate_tax(
        self,
        amount: Decimal,
    ) -> tuple[Decimal, Decimal, Decimal]:
        """
        Step 4: Calculate tax
        Returns: (dpp, tax_rate, tax_amount)
        
        For exclusive tax: DPP = amount, tax = DPP * rate
        For inclusive tax: DPP = amount / (1 + rate), tax = amount - DPP
        """
        if self.tax_inclusive:
            # Extract tax from gross amount
            divisor = Decimal("1") + (self.tax_rate / Decimal("100"))
            dpp = (amount / divisor).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
            tax_amount = amount - dpp
        else:
            # Add tax to net amount
            dpp = amount
            tax_amount = (dpp * self.tax_rate / Decimal("100")).quantize(
                Decimal("1"), rounding=ROUND_HALF_UP
            )
        
        return dpp, self.tax_rate, tax_amount
    
    def calculate_points_earned(
        self,
        amount: Decimal,
        member_type: MemberType = MemberType.REGULAR,
    ) -> int:
        """
        Calculate points earned from transaction.
        Points are calculated on amount BEFORE tax.
        """
        base_points = int(amount / self.points_per_amount)
        
        multipliers = {
            MemberType.REGULAR: 1.0,
            MemberType.SILVER: 1.2,
            MemberType.GOLD: 1.5,
            MemberType.PLATINUM: 2.0,
        }
        
        multiplier = multipliers.get(member_type, 1.0)
        return int(base_points * multiplier)
    
    def validate_margin_protection(
        self,
        items: list[CartItem],
        total_discount: Decimal,
        loyalty_redemption: Decimal,
        min_margin_pct: Decimal = Decimal("5"),
    ) -> bool:
        """
        Validate that transaction maintains minimum margin.
        Returns True if margin is acceptable, raises MarginProtectionError otherwise.
        """
        total_cost = sum(
            (item.unit_cost or Decimal("0")) * item.quantity
            for item in items
        )
        total_revenue = sum(item.subtotal for item in items)
        
        if total_cost == 0:
            return True  # No cost data, skip validation
        
        effective_revenue = total_revenue - total_discount - loyalty_redemption
        margin = ((effective_revenue - total_cost) / total_revenue * Decimal("100"))
        
        if margin < min_margin_pct:
            raise MarginProtectionError(
                f"Margin {margin:.2f}% below minimum {min_margin_pct}%"
            )
        
        return True
    
    def calculate_breakdown(
        self,
        items: list[CartItem],
        discount_type: Optional[DiscountType] = None,
        discount_value: Optional[Decimal] = None,
        max_discount: Optional[Decimal] = None,
        points_redeemed: int = 0,
        member_type: MemberType = MemberType.REGULAR,
        validate_margin: bool = True,
    ) -> FinancialBreakdown:
        """
        Complete financial breakdown following strict calculation order.
        
        Order:
        1. Subtotal
        2. Discount
        3. Loyalty redemption
        4. Tax
        5. Grand total
        """
        # Step 1: Subtotal
        gross_sales = self.calculate_subtotal(items)
        
        # Step 2: Discount
        total_discount, subtotal_after_discount = self.apply_discount(
            gross_sales, discount_type, discount_value, max_discount
        )
        
        # Step 3: Loyalty redemption
        # Cannot redeem more than subtotal after discount
        max_redemption = subtotal_after_discount
        loyalty_value = self.calculate_loyalty_redemption(points_redeemed, max_redemption)
        
        amount_before_tax = subtotal_after_discount - loyalty_value
        
        # Ensure not negative
        if amount_before_tax < 0:
            amount_before_tax = Decimal("0")
            loyalty_value = subtotal_after_discount
        
        # Margin protection
        if validate_margin:
            self.validate_margin_protection(items, total_discount, loyalty_value)
        
        # Step 4: Tax calculation
        dpp, tax_rate, tax_amount = self.calculate_tax(amount_before_tax)
        
        # Step 5: Grand total
        if self.tax_inclusive:
            grand_total = amount_before_tax
        else:
            grand_total = amount_before_tax + tax_amount
        
        # Calculate points earned (on amount before tax)
        points_earned = self.calculate_points_earned(amount_before_tax, member_type)
        
        return FinancialBreakdown(
            gross_sales=gross_sales,
            item_discounts=Decimal("0"),  # Item-level discounts not implemented yet
            transaction_discount=total_discount,
            total_discount=total_discount,
            subtotal_after_discount=subtotal_after_discount,
            loyalty_redemption=loyalty_value,
            dpp=dpp,
            tax_rate=tax_rate,
            tax_amount=tax_amount,
            grand_total=grand_total,
            points_earned=points_earned,
        )
