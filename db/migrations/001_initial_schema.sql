-- KasirAI Database Schema
-- Migration: 001_initial_schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============ TENANTS ============
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    npwp VARCHAR(30),
    
    -- Tax Config
    tax_type VARCHAR(20) DEFAULT 'PERCENTAGE',
    tax_rate DECIMAL(5,2) DEFAULT 11.00,
    tax_inclusive BOOLEAN DEFAULT FALSE,
    
    -- Loyalty Config
    points_per_amount DECIMAL(10,2) DEFAULT 10000,
    point_value DECIMAL(10,2) DEFAULT 100,
    min_redeem_points INTEGER DEFAULT 10,
    
    -- Margin Protection
    max_discount_pct DECIMAL(5,2) DEFAULT 30.00,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ USERS ============
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'CASHIER' CHECK (role IN ('CASHIER', 'OWNER', 'ADMIN')),
    name VARCHAR(255),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);

-- ============ PRODUCTS ============
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    sku VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(15,2) NOT NULL,
    cost DECIMAL(15,2),
    stock INTEGER DEFAULT 0,
    category VARCHAR(100),
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(tenant_id, sku)
);

CREATE INDEX idx_products_tenant ON products(tenant_id);
CREATE INDEX idx_products_category ON products(tenant_id, category);
CREATE INDEX idx_products_name ON products(tenant_id, name);

-- ============ CUSTOMERS ============
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    member_code VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    member_type VARCHAR(20) DEFAULT 'REGULAR' CHECK (member_type IN ('REGULAR', 'SILVER', 'GOLD', 'PLATINUM')),
    points INTEGER DEFAULT 0,
    lifetime_spent DECIMAL(15,2) DEFAULT 0,
    lifetime_points INTEGER DEFAULT 0,
    birth_date DATE,
    
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(tenant_id, phone),
    UNIQUE(tenant_id, member_code)
);

CREATE INDEX idx_customers_tenant ON customers(tenant_id);
CREATE INDEX idx_customers_phone ON customers(tenant_id, phone);
CREATE INDEX idx_customers_code ON customers(tenant_id, member_code);

-- ============ TRANSACTIONS ============
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_no VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    customer_id UUID REFERENCES customers(id),
    
    -- Financial Breakdown (STRICT ORDER)
    gross_sales DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    discount_code VARCHAR(50),
    
    points_redeemed INTEGER DEFAULT 0,
    points_value DECIMAL(15,2) DEFAULT 0,
    
    dpp DECIMAL(15,2) NOT NULL,
    tax_rate DECIMAL(5,2) NOT NULL,
    tax_amount DECIMAL(15,2) NOT NULL,
    
    net_sales DECIMAL(15,2) NOT NULL,
    
    points_earned INTEGER DEFAULT 0,
    
    -- Payment
    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('CASH', 'QRIS', 'CARD', 'EWALLET')),
    payment_status VARCHAR(20) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
    paid_at TIMESTAMPTZ,
    qris_ref VARCHAR(100),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_tenant ON transactions(tenant_id);
CREATE INDEX idx_transactions_date ON transactions(tenant_id, created_at);
CREATE INDEX idx_transactions_customer ON transactions(customer_id);
CREATE INDEX idx_transactions_invoice ON transactions(invoice_no);

-- ============ TRANSACTION ITEMS ============
CREATE TABLE IF NOT EXISTS transaction_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(50),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    unit_cost DECIMAL(15,2),
    subtotal DECIMAL(15,2) NOT NULL
);

CREATE INDEX idx_transaction_items_tx ON transaction_items(transaction_id);

-- ============ DISCOUNTS ============
CREATE TABLE IF NOT EXISTS discounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('PERCENTAGE', 'FIXED')),
    value DECIMAL(15,2) NOT NULL,
    min_purchase DECIMAL(15,2) DEFAULT 0,
    max_discount DECIMAL(15,2),
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(tenant_id, code)
);

CREATE INDEX idx_discounts_tenant ON discounts(tenant_id);
CREATE INDEX idx_discounts_code ON discounts(tenant_id, code);

-- ============ POINT LEDGER ============
CREATE TABLE IF NOT EXISTS point_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('EARNED', 'REDEEMED', 'ADJUSTED', 'EXPIRED')),
    points INTEGER NOT NULL,
    balance INTEGER NOT NULL,
    description TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_point_ledger_customer ON point_ledger(customer_id);

-- ============ FUNCTIONS ============

-- Function to update customer points after transaction
CREATE OR REPLACE FUNCTION update_customer_points(
    p_customer_id UUID,
    p_points_redeemed INTEGER,
    p_points_earned INTEGER,
    p_amount_spent DECIMAL
)
RETURNS VOID AS $$
DECLARE
    v_current_points INTEGER;
    v_new_balance INTEGER;
BEGIN
    -- Get current points
    SELECT points INTO v_current_points FROM customers WHERE id = p_customer_id;
    
    -- Deduct redeemed points
    IF p_points_redeemed > 0 THEN
        v_new_balance := v_current_points - p_points_redeemed;
        INSERT INTO point_ledger (customer_id, type, points, balance, description)
        VALUES (p_customer_id, 'REDEEMED', -p_points_redeemed, v_new_balance, 'Point redemption');
    ELSE
        v_new_balance := v_current_points;
    END IF;
    
    -- Add earned points
    IF p_points_earned > 0 THEN
        v_new_balance := v_new_balance + p_points_earned;
        INSERT INTO point_ledger (customer_id, type, points, balance, description)
        VALUES (p_customer_id, 'EARNED', p_points_earned, v_new_balance, 'Points from transaction');
    END IF;
    
    -- Update customer
    UPDATE customers SET 
        points = v_new_balance,
        lifetime_spent = lifetime_spent + p_amount_spent,
        lifetime_points = lifetime_points + p_points_earned,
        updated_at = NOW()
    WHERE id = p_customer_id;
END;
$$ LANGUAGE plpgsql;

-- ============ ROW LEVEL SECURITY ============

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_ledger ENABLE ROW LEVEL SECURITY;

-- Policies will be added based on auth implementation
-- For now, allow all for service role
CREATE POLICY "Allow all for service role" ON tenants FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON users FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON products FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON transactions FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON transaction_items FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON discounts FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON point_ledger FOR ALL USING (true);
