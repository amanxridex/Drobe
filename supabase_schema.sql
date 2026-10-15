-- ==============================================================================
-- DROBE MASTER SUPABASE POSTGRESQL DATABASE SCHEMA
-- The Complete, Production-Ready Database Schema for Drobe
-- Covering: Darkstore Ops, Inventory, 30-Min Fitting Trials, Fleet Telemetry,
-- Customer Sizing Profiles, Real-time Activity Telemetry, AI 2-Min Pulse Reports,
-- Drop-Off & Hesitation Tracking, Wholesale Settlements, Margin Ledger,
-- Instant UPI Refunds, Recovery CRM Interventions, and Darkstore SLA Metrics.
-- Location: Shivam Bungalows 1, Koteshwar Road, Ahmedabad (AMD-DARKSTORE-01)
-- ==============================================================================

-- Enable UUID & Cryptographic Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- SECTION 1: DARKSTORE PHYSICAL WAREHOUSE & SHELF MATRIX
-- ==============================================================================

-- 1.1. Warehouses (Darkstore Hubs)
CREATE TABLE IF NOT EXISTS drobe_warehouses (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(64) NOT NULL UNIQUE,
    area VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(64) NOT NULL,
    express_radius TEXT NOT NULL DEFAULT '6.5 km',
    total_shelves INT DEFAULT 96,
    occupied_shelves INT DEFAULT 34,
    active_riders INT DEFAULT 18,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2. Warehouse Physical Shelves & Bins Matrix
CREATE TABLE IF NOT EXISTS drobe_warehouse_shelves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(64) NOT NULL UNIQUE, -- e.g. "AMD-RA02-S3-B04"
    warehouse_id VARCHAR(64) REFERENCES drobe_warehouses(id) ON DELETE CASCADE,
    zone VARCHAR(128) NOT NULL,       -- e.g. "Zone A - Outerwear & Heavy Silhouettes"
    rack VARCHAR(64) NOT NULL,        -- e.g. "Rack A-02"
    shelf VARCHAR(64) NOT NULL,       -- e.g. "Shelf 3"
    bin VARCHAR(64) NOT NULL,         -- e.g. "Bin 04"
    is_occupied BOOLEAN DEFAULT FALSE,
    current_product_sku VARCHAR(64),
    current_product_name VARCHAR(255),
    max_capacity_units INT DEFAULT 25,
    current_units INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- SECTION 2: BRAND PARTNERS, CATALOG, CATEGORIES & SKU INVENTORY
-- ==============================================================================

-- 2.1. Brand Partners Directory & Onboarding Dossier
CREATE TABLE IF NOT EXISTS drobe_brands (
    id VARCHAR(128) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tagline TEXT,
    category VARCHAR(64) DEFAULT 'Male & Female',
    founder_name VARCHAR(255) NOT NULL,
    founder_role VARCHAR(128) DEFAULT 'Founder & Creative Director',
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(64),
    based_out_of VARCHAR(255) NOT NULL,
    status VARCHAR(64) NOT NULL DEFAULT 'Waiting for Approval', 
    -- Statuses: 'Draft', 'Waiting for Approval', 'Approved', 'Rejected'
    profile_image TEXT,
    cover_image TEXT,
    applied_date TIMESTAMPTZ DEFAULT NOW(),
    approved_date TIMESTAMPTZ,
    bank_account_holder VARCHAR(255),
    bank_account_number VARCHAR(64),
    bank_ifsc VARCHAR(32),
    bank_name VARCHAR(128),
    total_products_count INT DEFAULT 0,
    inwarded_units_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2. Dynamic Fashion Categories Taxonomy
CREATE TABLE IF NOT EXISTS drobe_categories (
    id VARCHAR(128) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    gender VARCHAR(32) NOT NULL DEFAULT 'all', -- 'men', 'women', 'all'
    icon TEXT,
    image TEXT,
    route VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3. Products & SKUs (DR1, DR2...)
CREATE TABLE IF NOT EXISTS drobe_products (
    id VARCHAR(128) PRIMARY KEY,
    sku VARCHAR(64) UNIQUE,           -- e.g. "DR1", "DR2"
    sku_serial INT UNIQUE,            -- e.g. 1, 2, 3
    name VARCHAR(255) NOT NULL,
    brand_id VARCHAR(128) REFERENCES drobe_brands(id) ON DELETE CASCADE,
    brand_name VARCHAR(255) NOT NULL,
    category VARCHAR(128) DEFAULT 'Outerwear',
    price VARCHAR(64) NOT NULL,       -- e.g. "₹1,499"
    price_cents INT DEFAULT 149900,
    base_wholesale_price_inr INT DEFAULT 850, -- Base wholesale cost (B)
    drobe_markup_inr INT DEFAULT 649,         -- Drobe markup retained
    volume VARCHAR(64) DEFAULT 'M',   -- size
    declared_inventory INT DEFAULT 20,
    inward_units INT DEFAULT 0,       -- physically verified on shelf
    units_in_trial INT DEFAULT 0,     -- out with 30-min runner
    units_sold INT DEFAULT 0,         -- kept & purchased
    tagline TEXT,
    description TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    inward_status VARCHAR(64) DEFAULT 'Pending Stock Dispatch',
    -- 'Pending Stock Dispatch', 'Stock In Transit to Ahmedabad', 'Received & Verifying at Hub', 'Inwarded & Live', 'Rejected'
    shelf_code VARCHAR(64) REFERENCES drobe_warehouse_shelves(code) ON DELETE SET NULL,
    shelf_details JSONB,              -- { zone, rack, shelf, bin }
    inward_date TIMESTAMPTZ,
    verified_by VARCHAR(255),
    is_live BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4. Granular Size/Color Product Variants
CREATE TABLE IF NOT EXISTS drobe_product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id VARCHAR(128) REFERENCES drobe_products(id) ON DELETE CASCADE,
    sku VARCHAR(64) NOT NULL,
    size VARCHAR(32) NOT NULL,        -- 'S', 'M', 'L', 'XL', 'UK 8', etc.
    color VARCHAR(64) DEFAULT 'Standard',
    stock_available INT DEFAULT 0,
    shelf_code VARCHAR(64) REFERENCES drobe_warehouse_shelves(code) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5. Inbound Consignment Shipments (Brand Factory -> Ahmedabad Darkstore)
CREATE TABLE IF NOT EXISTS drobe_inbound_shipments (
    id VARCHAR(128) PRIMARY KEY,      -- e.g. "INW-AMD-204"
    warehouse_id VARCHAR(64) REFERENCES drobe_warehouses(id) ON DELETE RESTRICT DEFAULT 'AMD-DARKSTORE-01',
    brand_id VARCHAR(128) REFERENCES drobe_brands(id) ON DELETE CASCADE,
    brand_name VARCHAR(255) NOT NULL,
    product_id VARCHAR(128) REFERENCES drobe_products(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    units INT NOT NULL DEFAULT 20,
    courier_partner VARCHAR(128) NOT NULL, -- "BlueDart", "Delhivery", "Hub Self-Drop"
    tracking_number VARCHAR(128) NOT NULL,
    dispatch_date TIMESTAMPTZ DEFAULT NOW(),
    received_date TIMESTAMPTZ,
    status VARCHAR(64) NOT NULL DEFAULT 'In Transit',
    -- 'In Transit', 'Arrived at Hub', 'Verified & Shelved', 'Rejected'
    assigned_sku VARCHAR(64),
    assigned_shelf VARCHAR(64),
    verified_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.6. Historical Stock Adjustments & Inwarding Audit Trail
CREATE TABLE IF NOT EXISTS drobe_stock_adjustments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id VARCHAR(128) REFERENCES drobe_products(id) ON DELETE CASCADE,
    sku VARCHAR(64) NOT NULL,
    change_type VARCHAR(64) NOT NULL, -- 'INWARD_VERIFIED', 'TRIAL_DISPATCH', 'RETURN_RESTOCK', 'DAMAGE_WRITE_OFF', 'MANUAL_OVERRIDE'
    quantity_delta INT NOT NULL,
    new_inward_units INT NOT NULL,
    shelf_code VARCHAR(64),
    performed_by VARCHAR(255) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- SECTION 3: EXPRESS RUNNER FLEET & GPS TELEMETRY
-- ==============================================================================

-- 3.1. Delivery Partner Fleet
CREATE TABLE IF NOT EXISTS drobe_runners (
    id VARCHAR(64) PRIMARY KEY,       -- e.g. "run-01"
    name VARCHAR(255) NOT NULL,       -- "Meet Dave"
    phone VARCHAR(64) NOT NULL,       -- "+91 98250 88123"
    vehicle VARCHAR(128) NOT NULL,    -- "Ather 450X EV (GJ-01-MW-9021)"
    current_status VARCHAR(64) DEFAULT 'Available at Hub',
    -- 'Available at Hub', 'Out on 30-Min Delivery', 'Waiting at Doorstep', 'Riding Back to Hub', 'Off Duty'
    deliveries_today INT DEFAULT 8,
    rating NUMERIC(3, 2) DEFAULT 4.95,
    battery_or_fuel VARCHAR(64) DEFAULT '82%',
    hub_base VARCHAR(255) DEFAULT 'Shivam Bungalows 1, Koteshwar Road',
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    last_ping_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2. Realtime Runner GPS Tracking Breadcrumbs
CREATE TABLE IF NOT EXISTS drobe_runner_telemetry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    runner_id VARCHAR(64) REFERENCES drobe_runners(id) ON DELETE CASCADE,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    speed_kmh NUMERIC(5, 2) DEFAULT 0,
    battery_level VARCHAR(32),
    active_order_id VARCHAR(128),
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- SECTION 4: 30-MINUTE DOORSTEP TRIAL & RETURN ORDERS
-- ==============================================================================

-- 4.1. Doorstep Fitting Orders
CREATE TABLE IF NOT EXISTS drobe_trial_orders (
    id VARCHAR(128) PRIMARY KEY,      -- e.g. "ord-30m-105"
    order_number VARCHAR(64) NOT NULL UNIQUE, -- e.g. "#DRB-9850"
    warehouse_id VARCHAR(64) REFERENCES drobe_warehouses(id) ON DELETE RESTRICT DEFAULT 'AMD-DARKSTORE-01',
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(64) NOT NULL,
    customer_address TEXT NOT NULL,
    landmark VARCHAR(255),
    distance_km VARCHAR(64) DEFAULT '2.1 km',
    product_id VARCHAR(128) REFERENCES drobe_products(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(64) NOT NULL, -- e.g. "DR1"
    brand_id VARCHAR(128) REFERENCES drobe_brands(id) ON DELETE RESTRICT,
    brand_name VARCHAR(255) NOT NULL,
    price VARCHAR(64) NOT NULL,
    size VARCHAR(64) NOT NULL DEFAULT 'M',
    shelf_location VARCHAR(64) NOT NULL, -- e.g. "AMD-RA02-S3-B04"
    runner_id VARCHAR(64) REFERENCES drobe_runners(id) ON DELETE SET NULL,
    rider_name VARCHAR(255),
    rider_phone VARCHAR(64),
    rider_vehicle VARCHAR(128),
    received_at TIMESTAMPTZ DEFAULT NOW(),
    picked_at TIMESTAMPTZ,
    handed_over_at TIMESTAMPTZ,
    dispatched_at TIMESTAMPTZ,
    status VARCHAR(64) NOT NULL DEFAULT 'Order Received (Awaiting Picker)',
    -- 'Order Received (Awaiting Picker)',
    -- 'Picked & Packed in Trial Bag',
    -- 'Runner Assigned (Ready for Handover)',
    -- 'Out for 30-Min Delivery',
    -- 'Doorstep Fitting (Runner Waiting Outside)',
    -- 'Kept on Spot (Purchased)',
    -- 'Returned on Spot (Runner Heading to Hub)',
    -- 'Restocked to Warehouse Shelf'
    doorstep_timer_minutes_left INT DEFAULT 15,
    runner_wait_elapsed_minutes INT DEFAULT 0,
    return_reason TEXT,
    instant_refund_status VARCHAR(128),
    advance_deposit_inr INT DEFAULT 0,
    kept_amount_inr INT DEFAULT 0,
    refunded_amount_inr INT DEFAULT 0,
    overtime_fee_inr INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.2. Order Line Items (Multiple items in a single Doorstep Fitting bag)
CREATE TABLE IF NOT EXISTS drobe_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(128) REFERENCES drobe_trial_orders(id) ON DELETE CASCADE,
    product_id VARCHAR(128) REFERENCES drobe_products(id) ON DELETE RESTRICT,
    sku VARCHAR(64) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    brand_id VARCHAR(128) REFERENCES drobe_brands(id) ON DELETE RESTRICT,
    brand_name VARCHAR(255) NOT NULL,
    size VARCHAR(32) NOT NULL,
    unit_price_inr INT NOT NULL,
    base_wholesale_price_inr INT NOT NULL,
    drobe_markup_inr INT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'in_trial', -- 'in_trial', 'kept', 'returned'
    restocked_shelf VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.3. Immutable Order Audit & Dispatch Event Timeline
CREATE TABLE IF NOT EXISTS drobe_order_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(128) REFERENCES drobe_trial_orders(id) ON DELETE CASCADE,
    order_number VARCHAR(64) NOT NULL,
    from_status VARCHAR(64),
    to_status VARCHAR(64) NOT NULL,
    performed_by VARCHAR(255) NOT NULL,
    notes TEXT,
    event_timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- SECTION 5: CUSTOMER SIZING PROFILES & REAL-TIME CLICKSTREAM TELEMETRY
-- ==============================================================================

-- 5.1. Customer Profiles & Sizing Preferences
CREATE TABLE IF NOT EXISTS drobe_user_profiles (
    id VARCHAR(128) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(64) NOT NULL,
    avatar TEXT,
    city VARCHAR(128) DEFAULT 'Ahmedabad',
    hub_zone VARCHAR(255) DEFAULT 'Ahmedabad Darkstore Hub #01 (SG Highway)',
    -- Fashion Sizing & Silhouette Preferences Matrix
    top_size VARCHAR(32) DEFAULT 'L',
    bottom_size VARCHAR(32) DEFAULT '32',
    footwear_size VARCHAR(32) DEFAULT 'UK 9',
    preferred_fit VARCHAR(64) DEFAULT 'Relaxed / Boxy',
    preferred_styles JSONB DEFAULT '["Streetwear", "Minimal"]'::jsonb,
    favourite_brands JSONB DEFAULT '["SNITCH", "The Souled Store", "Tilt"]'::jsonb,
    upi_id VARCHAR(128) DEFAULT 'shopper@okhdfcbank',
    -- Behavioral Conversion & Spend Telemetry
    total_orders_count INT DEFAULT 0,
    total_spent_inr INT DEFAULT 0,
    doorstep_trials_count INT DEFAULT 0,
    kept_ratio_percentage INT DEFAULT 100,
    -- Live Telemetry & Device Presence
    current_status VARCHAR(64) DEFAULT 'Active Browsing', -- 'Active Browsing', 'In Doorstep Trial', 'Offline'
    current_screen VARCHAR(255) DEFAULT 'Catalog Feed',
    device_info VARCHAR(255) DEFAULT 'iPhone 16 Pro · iOS 18.2',
    ip_address VARCHAR(64) DEFAULT '103.24.112.5',
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    -- Advanced Drop-off & Back-out Telemetry
    dropoff_risk VARCHAR(32) DEFAULT 'Low', -- 'Low', 'Medium', 'High', 'Immediate Dropoff'
    funnel_dropoff_stage VARCHAR(64) DEFAULT 'Product View', -- 'Product View', 'Cart Review', 'Payment Gateway', 'Doorstep Window'
    last_hesitation_reason TEXT,
    cart_item_count INT DEFAULT 0,
    cart_total_inr INT DEFAULT 0,
    dwell_seconds INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5.2. Real-Time User Activity Stream (Live Telemetry Radar)
CREATE TABLE IF NOT EXISTS drobe_user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(128) REFERENCES drobe_user_profiles(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    activity_type VARCHAR(64) NOT NULL,
    -- 'PAGE_VIEW', 'PRODUCT_CLICK', 'WISHLIST_ADD', 'TRIAL_ORDER_PLACED', 
    -- 'DOORSTEP_TRIAL_START', 'ITEM_KEPT', 'ITEM_RETURNED', 'PROFILE_EDIT',
    -- 'CART_ABANDON', 'CHECKOUT_BACKOUT', 'PRICE_HESITATION', 'SIZE_UNAVAILABLE',
    -- 'DOORSTEP_TIMER_ANXIETY', 'DWELL_TIME_EXCEEDED'
    title VARCHAR(255) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    screen VARCHAR(128),
    ip_address VARCHAR(64),
    device VARCHAR(128),
    is_dropoff_signal BOOLEAN DEFAULT FALSE,
    hesitation_reason TEXT,
    dropoff_stage VARCHAR(64),
    dwell_seconds INT DEFAULT 0,
    ai_risk_score INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5.3. Dedicated Drop-Off & Hesitation Logs Table (Root-Cause Telemetry)
CREATE TABLE IF NOT EXISTS drobe_user_hesitation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(128) REFERENCES drobe_user_profiles(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    friction_type VARCHAR(64) NOT NULL, -- 'CHECKOUT_BACKOUT', 'CART_ABANDON', 'SIZE_UNAVAILABLE', 'PRICE_HESITATION', 'DOORSTEP_TIMER_ANXIETY'
    funnel_stage VARCHAR(64) NOT NULL,  -- 'Product Detail', 'Price Drawer', 'Cart', 'Doorstep Terms', 'Payment Gateway (UPI)'
    hesitation_narrative TEXT NOT NULL,
    cart_total_inr INT DEFAULT 0,
    cart_items_count INT DEFAULT 0,
    dwell_seconds INT DEFAULT 0,
    ai_risk_score INT DEFAULT 50,       -- 0 to 100
    is_recovered BOOLEAN DEFAULT FALSE,
    recovery_channel VARCHAR(64),       -- 'WhatsApp', 'SMS', 'Push'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5.4. Customer Session Fingerprints
CREATE TABLE IF NOT EXISTS drobe_user_sessions (
    id VARCHAR(128) PRIMARY KEY,
    user_id VARCHAR(128) REFERENCES drobe_user_profiles(id) ON DELETE CASCADE,
    device_type VARCHAR(64) DEFAULT 'Mobile',
    os VARCHAR(64),
    browser VARCHAR(64),
    ip_address VARCHAR(64),
    entry_screen VARCHAR(128),
    exit_screen VARCHAR(128),
    total_dwell_seconds INT DEFAULT 0,
    screens_visited_count INT DEFAULT 1,
    had_hesitation_event BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

-- ==============================================================================
-- SECTION 6: AI SHOPPER INTELLIGENCE & TELEMETRY REPORTS (2-MIN CYCLE)
-- ==============================================================================

-- 6.1. Periodic AI Shopper Telemetry Reports
CREATE TABLE IF NOT EXISTS drobe_ai_telemetry_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    executive_summary TEXT NOT NULL,
    dropoff_root_causes JSONB DEFAULT '[]'::jsonb,
    recommended_actions JSONB DEFAULT '[]'::jsonb,
    shopper_intent_breakdown JSONB DEFAULT '{}'::jsonb,
    live_traffic_count INT DEFAULT 0,
    active_doorstep_trials INT DEFAULT 0,
    model_used VARCHAR(64) DEFAULT 'Gemini 1.5 Flash',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6.2. Hourly Pre-Aggregated Funnel Conversion & Drop-off Reports
CREATE TABLE IF NOT EXISTS drobe_dropoff_analytics_hourly (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hour_bucket TIMESTAMPTZ NOT NULL UNIQUE,
    total_active_shoppers INT DEFAULT 0,
    product_view_count INT DEFAULT 0,
    cart_addition_count INT DEFAULT 0,
    checkout_started_count INT DEFAULT 0,
    checkout_backouts_count INT DEFAULT 0,
    doorstep_trials_started_count INT DEFAULT 0,
    doorstep_kept_count INT DEFAULT 0,
    revenue_at_risk_inr INT DEFAULT 0,
    revenue_recovered_inr INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6.3. Out-of-Stock Size Friction & Demand Bottleneck Reports
CREATE TABLE IF NOT EXISTS drobe_stock_friction_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(64) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    requested_size VARCHAR(32) NOT NULL,
    rack_location VARCHAR(64),
    bounce_count INT DEFAULT 1,
    estimated_lost_gmv_inr INT DEFAULT 0,
    restock_priority VARCHAR(32) DEFAULT 'High', -- 'Critical', 'High', 'Medium'
    last_requested_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6.4. Doorstep Fitting Session Duration & Overtime Telemetry
CREATE TABLE IF NOT EXISTS drobe_doorstep_fitting_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(128) REFERENCES drobe_trial_orders(id) ON DELETE CASCADE,
    runner_id VARCHAR(64) REFERENCES drobe_runners(id) ON DELETE SET NULL,
    fitting_duration_seconds INT NOT NULL,
    was_overtime BOOLEAN DEFAULT FALSE,
    overtime_minutes INT DEFAULT 0,
    overtime_fee_inr INT DEFAULT 0,
    items_tried_count INT DEFAULT 1,
    items_kept_count INT DEFAULT 1,
    kept_percentage INT DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- SECTION 7: WHOLESALE SETTLEMENT, MARGIN LEDGER & INSTANT REFUNDS
-- ==============================================================================

-- 7.1. Brand Wholesale Payout Disbursements
CREATE TABLE IF NOT EXISTS drobe_wholesale_settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    settlement_reference VARCHAR(64) NOT NULL UNIQUE, -- e.g. "SETTL-DRB-2026-0042"
    brand_id VARCHAR(128) REFERENCES drobe_brands(id) ON DELETE RESTRICT,
    brand_name VARCHAR(255) NOT NULL,
    category VARCHAR(64),
    kept_units_count INT NOT NULL,
    base_wholesale_payout_due INT NOT NULL,  -- Kept Units × Base Wholesale B
    drobe_retained_markup_inr INT NOT NULL,   -- Drobe +4.83% markup
    gross_gmv_inr INT NOT NULL,
    bank_utr_ref VARCHAR(128) NOT NULL,       -- e.g. "NEFT-HDFC-9847120392"
    status VARCHAR(32) NOT NULL DEFAULT 'Disbursed', -- 'Pending', 'Disbursed', 'Reconciled'
    notes TEXT,
    disbursed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7.2. Transaction Margin & Profit Ledger (Unit Economics Breakdown)
CREATE TABLE IF NOT EXISTS drobe_margin_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(128) REFERENCES drobe_trial_orders(id) ON DELETE CASCADE,
    product_id VARCHAR(128) REFERENCES drobe_products(id) ON DELETE RESTRICT,
    sku VARCHAR(64) NOT NULL,
    brand_id VARCHAR(128) REFERENCES drobe_brands(id) ON DELETE RESTRICT,
    customer_paid_mrp INT NOT NULL,          -- e.g. ₹1,499
    base_wholesale_cost_b INT NOT NULL,      -- e.g. ₹850
    drobe_markup_earned INT NOT NULL,        -- e.g. ₹649
    runner_delivery_fee INT DEFAULT 45,      -- 30-min express runner compensation
    payment_gateway_fee INT DEFAULT 22,      -- UPI processing fee
    net_profit_inr INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7.3. Instant Doorstep Return UPI Refunds
CREATE TABLE IF NOT EXISTS drobe_refund_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(128) REFERENCES drobe_trial_orders(id) ON DELETE CASCADE,
    customer_phone VARCHAR(64) NOT NULL,
    upi_id VARCHAR(128) NOT NULL,
    refund_amount_inr INT NOT NULL,
    refund_utr VARCHAR(128) NOT NULL,
    gateway_provider VARCHAR(64) DEFAULT 'Razorpay UPI Instant',
    processing_time_seconds INT DEFAULT 4,
    status VARCHAR(32) DEFAULT 'Success',
    processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- SECTION 8: AUTOMATED CUSTOMER RECOVERY & CRM INTERVENTIONS
-- ==============================================================================

-- 8.1. Recovery Nudges & WhatsApp Interventions
CREATE TABLE IF NOT EXISTS drobe_recovery_interventions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(128) REFERENCES drobe_user_profiles(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(64) NOT NULL,
    trigger_reason TEXT NOT NULL,
    channel VARCHAR(32) DEFAULT 'WhatsApp',   -- 'WhatsApp', 'SMS', 'Push'
    trial_credit_inr INT DEFAULT 150,
    coupon_code VARCHAR(64) DEFAULT 'DROBE150',
    status VARCHAR(32) DEFAULT 'Sent',        -- 'Sent', 'Delivered', 'Clicked', 'Converted', 'Expired'
    revenue_recovered_inr INT DEFAULT 0,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    converted_at TIMESTAMPTZ
);

-- ==============================================================================
-- SECTION 9: DARKSTORE SLA PERFORMANCE & SYSTEM AUDIT LOGS
-- ==============================================================================

-- 9.1. Darkstore Operational SLA Metrics
CREATE TABLE IF NOT EXISTS drobe_darkstore_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id VARCHAR(64) REFERENCES drobe_warehouses(id) ON DELETE RESTRICT DEFAULT 'AMD-DARKSTORE-01',
    date_bucket DATE NOT NULL DEFAULT CURRENT_DATE,
    total_orders_received INT DEFAULT 0,
    sla_compliance_percentage INT DEFAULT 98,  -- % delivered in <= 30 mins
    avg_picker_seconds INT DEFAULT 180,
    avg_delivery_minutes INT DEFAULT 24,
    total_units_inwarded INT DEFAULT 0,
    total_units_kept INT DEFAULT 0,
    total_units_returned INT DEFAULT 0,
    kept_ratio_percentage INT DEFAULT 87,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9.2. Administrative Action Audit Logs
CREATE TABLE IF NOT EXISTS drobe_system_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id VARCHAR(128) DEFAULT 'adm_aman_01',
    action_type VARCHAR(64) NOT NULL, -- 'BRAND_APPROVE', 'BRAND_REJECT', 'INWARD_VERIFY', 'PAYOUT_DISBURSE', 'RESTOCK_OVERRIDE'
    target_entity VARCHAR(64) NOT NULL, -- 'drobe_brands', 'drobe_products', 'drobe_wholesale_settlements'
    target_id VARCHAR(128) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(64) DEFAULT '103.24.112.5',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- SECTION 10: AUTOMATIC TIMESTAMP TRIGGERS
-- ==============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_drobe_warehouses_updated ON drobe_warehouses;
CREATE TRIGGER trigger_drobe_warehouses_updated BEFORE UPDATE ON drobe_warehouses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_drobe_shelves_updated ON drobe_warehouse_shelves;
CREATE TRIGGER trigger_drobe_shelves_updated BEFORE UPDATE ON drobe_warehouse_shelves FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_drobe_brands_updated ON drobe_brands;
CREATE TRIGGER trigger_drobe_brands_updated BEFORE UPDATE ON drobe_brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_drobe_categories_updated ON drobe_categories;
CREATE TRIGGER trigger_drobe_categories_updated BEFORE UPDATE ON drobe_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_drobe_products_updated ON drobe_products;
CREATE TRIGGER trigger_drobe_products_updated BEFORE UPDATE ON drobe_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_drobe_variants_updated ON drobe_product_variants;
CREATE TRIGGER trigger_drobe_variants_updated BEFORE UPDATE ON drobe_product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_drobe_shipments_updated ON drobe_inbound_shipments;
CREATE TRIGGER trigger_drobe_shipments_updated BEFORE UPDATE ON drobe_inbound_shipments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_drobe_runners_updated ON drobe_runners;
CREATE TRIGGER trigger_drobe_runners_updated BEFORE UPDATE ON drobe_runners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_drobe_orders_updated ON drobe_trial_orders;
CREATE TRIGGER trigger_drobe_orders_updated BEFORE UPDATE ON drobe_trial_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_drobe_order_items_updated ON drobe_order_items;
CREATE TRIGGER trigger_drobe_order_items_updated BEFORE UPDATE ON drobe_order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_drobe_users_updated ON drobe_user_profiles;
CREATE TRIGGER trigger_drobe_users_updated BEFORE UPDATE ON drobe_user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- SECTION 11: INDEXES & QUERY PERFORMANCE (Per Postgres Best Practices)
-- ==============================================================================

-- A. Foreign Key Indexes (Eliminates table scans on JOINs and Cascades)
CREATE INDEX IF NOT EXISTS idx_shelves_warehouse_id ON drobe_warehouse_shelves(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON drobe_products(brand_id);
CREATE INDEX IF NOT EXISTS idx_variants_product_id ON drobe_product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_shipments_brand_id ON drobe_inbound_shipments(brand_id);
CREATE INDEX IF NOT EXISTS idx_shipments_product_id ON drobe_inbound_shipments(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_warehouse_id ON drobe_trial_orders(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_orders_brand_id ON drobe_trial_orders(brand_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON drobe_trial_orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_runner_id ON drobe_trial_orders(runner_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON drobe_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON drobe_order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON drobe_order_events(order_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON drobe_user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_hesitations_user_id ON drobe_user_hesitation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON drobe_user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_settlements_brand_id ON drobe_wholesale_settlements(brand_id);
CREATE INDEX IF NOT EXISTS idx_ledger_order_id ON drobe_margin_ledger(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_order_id ON drobe_refund_records(order_id);
CREATE INDEX IF NOT EXISTS idx_recoveries_user_id ON drobe_recovery_interventions(user_id);

-- B. Composite, Status & Sorting Indexes for High-Velocity Queries
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON drobe_trial_orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_phone_created ON drobe_trial_orders(customer_phone, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category_live ON drobe_products(category, is_live);
CREATE INDEX IF NOT EXISTS idx_products_sku ON drobe_products(sku);
CREATE INDEX IF NOT EXISTS idx_brands_status ON drobe_brands(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_runners_status ON drobe_runners(current_status);
CREATE INDEX IF NOT EXISTS idx_users_dropoff_risk ON drobe_user_profiles(dropoff_risk, last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_status ON drobe_user_profiles(current_status);
CREATE INDEX IF NOT EXISTS idx_activities_dropoff ON drobe_user_activities(is_dropoff_signal, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hesitations_stage ON drobe_user_hesitation_logs(funnel_stage, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_reports_created ON drobe_ai_telemetry_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_settlements_created ON drobe_wholesale_settlements(created_at DESC);

-- C. Partial Indexes for High-Impact Filters
CREATE INDEX IF NOT EXISTS idx_active_doorstep_orders 
ON drobe_trial_orders(id, runner_id, status) 
WHERE status NOT IN ('Kept on Spot (Purchased)', 'Restocked to Warehouse Shelf');

CREATE INDEX IF NOT EXISTS idx_active_high_risk_users 
ON drobe_user_profiles(id, name, cart_total_inr, dropoff_risk) 
WHERE dropoff_risk IN ('High', 'Immediate Dropoff');

-- ==============================================================================
-- SECTION 12: REALTIME BROADCASTING PUBLICATIONS (Idempotent Safe)
-- ==============================================================================

DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE drobe_trial_orders; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE drobe_products; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE drobe_brands; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE drobe_runners; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE drobe_warehouse_shelves; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE drobe_order_events; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE drobe_user_profiles; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE drobe_user_activities; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE drobe_user_hesitation_logs; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE drobe_ai_telemetry_reports; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE drobe_wholesale_settlements; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE drobe_recovery_interventions; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- ==============================================================================
-- SECTION 13: ROW-LEVEL SECURITY (RLS) POLICIES (Idempotent Safe)
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE drobe_warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE drobe_warehouse_shelves ENABLE ROW LEVEL SECURITY;
ALTER TABLE drobe_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE drobe_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE drobe_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE drobe_product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE drobe_inbound_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE drobe_stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE drobe_runners ENABLE ROW LEVEL SECURITY;
ALTER TABLE drobe_runner_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE drobe_trial_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE drobe_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE drobe_order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE drobe_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drobe_user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE drobe_user_hesitation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE drobe_user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE drobe_ai_telemetry_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE drobe_dropoff_analytics_hourly ENABLE ROW LEVEL SECURITY;
ALTER TABLE drobe_stock_friction_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE drobe_doorstep_fitting_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE drobe_wholesale_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE drobe_margin_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE drobe_refund_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE drobe_recovery_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE drobe_darkstore_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE drobe_system_audit_logs ENABLE ROW LEVEL SECURITY;

-- Permissive public policies for client access and synchronization (Safe recreate)
DROP POLICY IF EXISTS "Public full access on warehouses" ON drobe_warehouses;
CREATE POLICY "Public full access on warehouses" ON drobe_warehouses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on shelves" ON drobe_warehouse_shelves;
CREATE POLICY "Public full access on shelves" ON drobe_warehouse_shelves FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on brands" ON drobe_brands;
CREATE POLICY "Public full access on brands" ON drobe_brands FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on categories" ON drobe_categories;
CREATE POLICY "Public full access on categories" ON drobe_categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on products" ON drobe_products;
CREATE POLICY "Public full access on products" ON drobe_products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on variants" ON drobe_product_variants;
CREATE POLICY "Public full access on variants" ON drobe_product_variants FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on shipments" ON drobe_inbound_shipments;
CREATE POLICY "Public full access on shipments" ON drobe_inbound_shipments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on stock adjustments" ON drobe_stock_adjustments;
CREATE POLICY "Public full access on stock adjustments" ON drobe_stock_adjustments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on runners" ON drobe_runners;
CREATE POLICY "Public full access on runners" ON drobe_runners FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on runner telemetry" ON drobe_runner_telemetry;
CREATE POLICY "Public full access on runner telemetry" ON drobe_runner_telemetry FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on trial orders" ON drobe_trial_orders;
CREATE POLICY "Public full access on trial orders" ON drobe_trial_orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on order items" ON drobe_order_items;
CREATE POLICY "Public full access on order items" ON drobe_order_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on order events" ON drobe_order_events;
CREATE POLICY "Public full access on order events" ON drobe_order_events FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on user profiles" ON drobe_user_profiles;
CREATE POLICY "Public full access on user profiles" ON drobe_user_profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on user activities" ON drobe_user_activities;
CREATE POLICY "Public full access on user activities" ON drobe_user_activities FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on hesitation logs" ON drobe_user_hesitation_logs;
CREATE POLICY "Public full access on hesitation logs" ON drobe_user_hesitation_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on user sessions" ON drobe_user_sessions;
CREATE POLICY "Public full access on user sessions" ON drobe_user_sessions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on ai reports" ON drobe_ai_telemetry_reports;
CREATE POLICY "Public full access on ai reports" ON drobe_ai_telemetry_reports FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on hourly dropoffs" ON drobe_dropoff_analytics_hourly;
CREATE POLICY "Public full access on hourly dropoffs" ON drobe_dropoff_analytics_hourly FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on stock friction" ON drobe_stock_friction_reports;
CREATE POLICY "Public full access on stock friction" ON drobe_stock_friction_reports FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on fitting analytics" ON drobe_doorstep_fitting_analytics;
CREATE POLICY "Public full access on fitting analytics" ON drobe_doorstep_fitting_analytics FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on wholesale settlements" ON drobe_wholesale_settlements;
CREATE POLICY "Public full access on wholesale settlements" ON drobe_wholesale_settlements FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on margin ledger" ON drobe_margin_ledger;
CREATE POLICY "Public full access on margin ledger" ON drobe_margin_ledger FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on refund records" ON drobe_refund_records;
CREATE POLICY "Public full access on refund records" ON drobe_refund_records FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on recovery interventions" ON drobe_recovery_interventions;
CREATE POLICY "Public full access on recovery interventions" ON drobe_recovery_interventions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on darkstore metrics" ON drobe_darkstore_metrics;
CREATE POLICY "Public full access on darkstore metrics" ON drobe_darkstore_metrics FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on audit logs" ON drobe_system_audit_logs;
CREATE POLICY "Public full access on audit logs" ON drobe_system_audit_logs FOR ALL USING (true) WITH CHECK (true);


-- ==============================================================================
-- SECTION 14: SEED DATA (PRODUCTION GROUNDING FOR ALL TABLES)
-- ==============================================================================

-- 14.1. Darkstore Hub
INSERT INTO drobe_warehouses (id, name, code, area, address, contact_person, contact_phone, express_radius, total_shelves, occupied_shelves, active_riders)
VALUES ('AMD-DARKSTORE-01', 'DROBE Ahmedabad Central Darkstore', 'AMD-HUB-01', 'Motera / Koteshwar', 'Shivam Bungalows 1, Koteshwar Road, Ahmedabad - 380005', 'Hub Manager Harshil', '+91 98250 11223', '6.5 km Express Zone', 96, 34, 18)
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- 14.2. Physical Shelves
INSERT INTO drobe_warehouse_shelves (code, warehouse_id, zone, rack, shelf, bin, is_occupied, current_product_sku, current_product_name, max_capacity_units, current_units)
VALUES 
    ('AMD-RA01-S1-B01', 'AMD-DARKSTORE-01', 'Zone A - Outerwear & Jackets', 'Rack A-01', 'Shelf 1', 'Bin 01', TRUE, 'DR1', 'Mark Leute Heavy Oversized Hoodie', 25, 18),
    ('AMD-RA02-S3-B04', 'AMD-DARKSTORE-01', 'Zone A - Outerwear & Jackets', 'Rack A-02', 'Shelf 3', 'Bin 04', TRUE, 'DR2', 'Acid Washed Boxy Tee', 25, 14),
    ('AMD-RB01-S2-B02', 'AMD-DARKSTORE-01', 'Zone B - Tops & Linen Shirts', 'Rack B-01', 'Shelf 2', 'Bin 02', TRUE, 'DR3', 'Minimal Linen Overshirt', 25, 20),
    ('AMD-RC01-S1-B01', 'AMD-DARKSTORE-01', 'Zone C - Footwear & Sneakers', 'Rack C-01', 'Shelf 1', 'Bin 01', TRUE, 'DR4', 'Retro Chunky Streetwear Sneaker', 25, 0)
ON CONFLICT (code) DO NOTHING;

-- 14.3. Verified Brands
INSERT INTO drobe_brands (id, name, tagline, category, founder_name, founder_role, email, phone, based_out_of, status, bank_account_holder, bank_account_number, bank_ifsc, bank_name)
VALUES 
    ('br_mark_leute', 'Mark Leute', 'Architectural tailoring for modern subcultures', 'Male & Female', 'Kabir Varma', 'Creative Director', 'kabir@markleute.com', '+91 98201 22334', 'Mumbai', 'Approved', 'Mark Leute Apparel LLP', '50200049281723', 'HDFC0000240', 'HDFC Bank'),
    ('br_underrated_club', 'Underrated Club', 'Subversive luxury streetwear', 'Male & Female', 'Rohan Sen', 'Founder', 'rohan@underrated.club', '+91 98330 44556', 'Bangalore', 'Approved', 'Underrated Club Retail Pvt Ltd', '91802003849102', 'UTIB0000042', 'Axis Bank'),
    ('br_nova_studios', 'Nova Studios', 'Refined resort wear & pure linens', 'Female', 'Ananya Roy', 'Founder', 'ananya@novastudios.in', '+91 97110 55667', 'New Delhi', 'Approved', 'Nova Studios Design', '002105009842', 'ICIC0000021', 'ICICI Bank')
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- 14.4. Live Products
INSERT INTO drobe_products (id, sku, sku_serial, name, brand_id, brand_name, category, price, price_cents, base_wholesale_price_inr, drobe_markup_inr, volume, declared_inventory, inward_units, shelf_code, is_live)
VALUES
    ('prod_ml_hoodie_01', 'DR1', 1, 'Mark Leute Heavy Oversized Hoodie', 'br_mark_leute', 'Mark Leute', 'Outerwear', '₹2,899', 289900, 1850, 1049, 'L', 20, 18, 'AMD-RA01-S1-B01', TRUE),
    ('prod_uc_tee_02', 'DR2', 2, 'Acid Washed Boxy Tee', 'br_underrated_club', 'Underrated Club', 'Tops', '₹1,499', 149900, 850, 649, 'M', 25, 14, 'AMD-RA02-S3-B04', TRUE),
    ('prod_ns_linen_03', 'DR3', 3, 'Minimal Linen Overshirt', 'br_nova_studios', 'Nova Studios', 'Shirts', '₹2,199', 219900, 1350, 849, 'M', 20, 20, 'AMD-RB01-S2-B02', TRUE),
    ('prod_uc_snk_04', 'DR4', 4, 'Retro Chunky Streetwear Sneaker', 'br_underrated_club', 'Underrated Club', 'Footwear', '₹4,499', 449900, 2900, 1599, 'UK 8', 15, 0, 'AMD-RC01-S1-B01', TRUE)
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- 14.5. Runners Fleet
INSERT INTO drobe_runners (id, name, phone, vehicle, current_status, deliveries_today, rating, battery_or_fuel)
VALUES
    ('run-01', 'Meet Dave', '+91 98250 88123', 'Ather 450X EV (GJ-01-MW-9021)', 'Available at Hub', 8, 4.95, '82%'),
    ('run-02', 'Jay Suthar', '+91 97230 44901', 'Ola S1 Pro (GJ-01-EQ-4412)', 'Waiting at Doorstep', 11, 4.98, '67%'),
    ('run-03', 'Harsh Trivedi', '+91 99040 12890', 'TVS iQube (GJ-01-KA-8819)', 'Out on 30-Min Delivery', 6, 4.91, '91%')
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- 14.6. Trial Orders
INSERT INTO drobe_trial_orders (id, order_number, customer_name, customer_phone, customer_address, product_id, product_name, product_sku, brand_id, brand_name, price, size, shelf_location, runner_id, rider_name, rider_phone, status, doorstep_timer_minutes_left, advance_deposit_inr, kept_amount_inr)
VALUES
    ('ord-30m-101', '#DRB-9843', 'Pooja Shah', '+91 98792 33410', 'B-402, Gala Haven, South Bopal, Ahmedabad', 'prod_ml_hoodie_01', 'Mark Leute Heavy Oversized Hoodie', 'DR1', 'br_mark_leute', 'Mark Leute', '₹2,899', 'M', 'AMD-RA01-S1-B01', 'run-02', 'Jay Suthar', '+91 97230 44901', 'Doorstep Fitting (Runner Waiting Outside)', 4, 2899, 2899),
    ('ord-30m-102', '#DRB-9844', 'Aman Mishra', '+91 98250 88123', 'Flat 801, Iscon Platinum, Bopal Ambli Rd, Ahmedabad', 'prod_uc_tee_02', 'Acid Washed Boxy Tee', 'DR2', 'br_underrated_club', 'Underrated Club', '₹1,499', 'L', 'AMD-RA02-S3-B04', 'run-01', 'Meet Dave', '+91 98250 88123', 'Kept on Spot (Purchased)', 0, 1499, 1499)
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- 14.7. Customer Profiles & Behavioral Sizing Matrix
INSERT INTO drobe_user_profiles (
    id, name, email, phone, city, hub_zone,
    top_size, bottom_size, footwear_size, preferred_fit,
    preferred_styles, favourite_brands, upi_id,
    total_orders_count, total_spent_inr, doorstep_trials_count, kept_ratio_percentage,
    current_status, current_screen, device_info, last_active_at,
    dropoff_risk, funnel_dropoff_stage, last_hesitation_reason, cart_item_count, cart_total_inr, dwell_seconds
) VALUES 
    (
        'usr_aman_01', 'Aman Mishra', 'aman@example.com', '+91 98250 88123', 'Ahmedabad', 'Ahmedabad Darkstore Hub #01 (SG Highway)',
        'L', '32', 'UK 9', 'Relaxed',
        '["Streetwear", "Casual", "Minimal", "Oversized"]'::jsonb,
        '["SNITCH", "The Souled Store", "Tilt", "Mark Leute"]'::jsonb,
        'aman@okhdfcbank', 4, 12890, 4, 100,
        'Active Browsing', 'Viewing Mark Leute Hoodie', 'iPhone 16 Pro · iOS 18.2', NOW(),
        'Low', 'Product View', 'Zero friction. Active browsing with high conversion history.', 0, 0, 25
    ),
    (
        'usr_harshil_02', 'Harshil Patel', 'harshil.p@outlook.com', '+91 97120 44912', 'Ahmedabad', 'Motera & Koteshwar Express Hub',
        'XL', '34', 'UK 10', 'Oversized',
        '["Streetwear", "Oversized", "Drop Shoulder"]'::jsonb,
        '["SNITCH", "Underrated Club"]'::jsonb,
        'harshil@okaxis', 5, 15200, 6, 83,
        'Active Browsing', 'UPI Payment Intent Screen', 'Samsung Galaxy S24 Ultra', NOW() - INTERVAL '3 minutes',
        'Immediate Dropoff', 'Payment Gateway', 'Abandoned ₹3,498 cart after 180s dwell time on UPI intent screen without submitting PIN.', 2, 3498, 180
    ),
    (
        'usr_pooja_03', 'Pooja Shah', 'pooja.shah@gmail.com', '+91 98792 33410', 'Ahmedabad', 'Bopal Darkstore Express Zone',
        'M', '28', 'UK 6', 'Regular',
        '["Minimal", "Casual", "Athleisure"]'::jsonb,
        '["Nova Studios", "Mark Leute"]'::jsonb,
        'pooja@axisbank', 3, 8400, 3, 100,
        'In Doorstep Trial', '6-Minute Doorstep Fitting Window', 'OnePlus 12 · Android 14', NOW() - INTERVAL '4 minutes',
        'Low', 'Doorstep Window', 'Currently trying on Mark Leute overcoat with runner outside.', 1, 2899, 45
    ),
    (
        'usr_dhruv_04', 'Dhruv Mehta', 'dhruv99@yahoo.com', '+91 98980 77144', 'Ahmedabad', 'Prahlad Nagar Express Zone',
        'M', '30', 'UK 8', 'Relaxed',
        '["Casual", "Streetwear"]'::jsonb,
        '["Mark Leute", "Underrated Club"]'::jsonb,
        'dhruv@icici', 1, 4200, 2, 50,
        'Offline', 'Product Detail: Retro Chunky Sneaker', 'Google Pixel 9 Pro', NOW() - INTERVAL '45 minutes',
        'High', 'Product View', 'Zero inward units available for Footwear Size UK 8 in darkstore rack AMD-RC01. User immediately bounced.', 1, 4499, 15
    ),
    (
        'usr_tanya_05', 'Tanya Joshi', 'tanya.j@icloud.com', '+91 99041 55201', 'Ahmedabad', 'Satellite & Vastrapur Hub #02',
        'S', '26', 'UK 5', 'Slim',
        '["Minimal", "Contemporary", "Streetwear"]'::jsonb,
        '["The Souled Store", "Nova Studios"]'::jsonb,
        'tanyaj@paytm', 2, 6500, 2, 100,
        'Offline', 'Doorstep Terms Window', 'iPhone 15 · iOS 18.1', NOW() - INTERVAL '2 hours',
        'Medium', 'Cart Review', 'Dwell time exceeded 95s reviewing 6-minute fitting rules and ₹2/min overtime surcharge.', 1, 2199, 95
    )
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- 14.8. Initial Drop-off & Hesitation Telemetry Signals
INSERT INTO drobe_user_hesitation_logs (user_id, user_name, friction_type, funnel_stage, hesitation_narrative, cart_total_inr, cart_items_count, dwell_seconds, ai_risk_score)
VALUES
    ('usr_harshil_02', 'Harshil Patel', 'CHECKOUT_BACKOUT', 'Payment Gateway (UPI)', 'Abandoned ₹3,498 cart after 180s dwell time on UPI intent screen without submitting PIN.', 3498, 2, 180, 92),
    ('usr_dhruv_04', 'Dhruv Mehta', 'SIZE_UNAVAILABLE', 'Product Detail', 'Zero inward units available for Footwear Size UK 8 in darkstore rack AMD-RC01. User immediately bounced.', 4499, 1, 15, 84),
    ('usr_tanya_05', 'Tanya Joshi', 'DOORSTEP_TIMER_ANXIETY', 'Cart & Doorstep Terms', 'Dwell time exceeded 95s reviewing 6-minute fitting rules and ₹2/min overtime surcharge.', 2199, 1, 95, 68);

-- 14.9. Initial Real-time User Activity Stream
INSERT INTO drobe_user_activities (user_id, user_name, activity_type, title, details, screen, device, is_dropoff_signal, hesitation_reason, dropoff_stage, dwell_seconds, ai_risk_score)
VALUES
    ('usr_harshil_02', 'Harshil Patel', 'CHECKOUT_BACKOUT', 'Hesitated on UPI PIN Entry & Backed Out of Cart (₹3,498)', '{"cartTotal": "₹3,498", "gateway": "Google Pay UPI", "dwell": "180s"}'::jsonb, 'UPI Payment Intent', 'Samsung Galaxy S24 Ultra', TRUE, 'Abandoned ₹3,498 cart after 180s dwell time on UPI intent screen without submitting PIN.', 'Checkout / UPI', 180, 92),
    ('usr_dhruv_04', 'Dhruv Mehta', 'SIZE_UNAVAILABLE', 'Out of Stock Bounce: Footwear Size UK 8 (0 units on shelf)', '{"sku": "DR4", "size": "UK 8", "rack": "AMD-RC01"}'::jsonb, 'Product Detail', 'Google Pixel 9 Pro', TRUE, 'Zero inward units available for Footwear Size UK 8 in darkstore rack AMD-RC01. User immediately bounced.', 'Product Detail', 15, 84),
    ('usr_pooja_03', 'Pooja Shah', 'DOORSTEP_TRIAL_START', '6-Minute Doorstep Fitting Window Started in Bopal', '{"order": "#DRB-9843", "runner": "Jay Suthar", "item": "Mark Leute Hoodie"}'::jsonb, 'Doorstep Trial Window', 'OnePlus 12', FALSE, NULL, NULL, 45, 10),
    ('usr_aman_01', 'Aman Mishra', 'PRODUCT_CLICK', 'Viewing Acid Washed Boxy Tee (Size L)', '{"brand": "Underrated Club", "sku": "DR2", "price": "₹1,499"}'::jsonb, 'Product Detail', 'iPhone 16 Pro', FALSE, NULL, NULL, 25, 12);

-- 14.10. Initial AI Shopper Telemetry Report (2-Minute Pulse Baseline)
INSERT INTO drobe_ai_telemetry_reports (executive_summary, dropoff_root_causes, recommended_actions, shopper_intent_breakdown, live_traffic_count, active_doorstep_trials, model_used)
VALUES (
    'Live analysis of Ahmedabad Darkstore traffic shows strong purchase interest, but distinct drop-off friction at the final payment gateway and specific out-of-stock shoe sizes. Harshil Patel represents an immediate drop-off risk at the UPI gateway (₹3,498 cart abandoned), while Dhruv Mehta exited after encountering an out-of-stock UK 8 sneaker size. Doorstep trial fitting retention in Bopal & SG Highway remains stellar at 87% with zero friction.',
    '[{"user": "Harshil Patel", "stage": "Payment Gateway (UPI)", "trigger": "Abandoned ₹3,498 cart after 180s dwell time on UPI intent screen without submitting PIN.", "riskLevel": "Critical"}, {"user": "Dhruv Mehta", "stage": "Product Detail", "trigger": "Zero inward units available for Footwear Size UK 8 in darkstore rack AMD-RC01. User immediately bounced.", "riskLevel": "High"}, {"user": "Tanya Joshi", "stage": "Cart & Doorstep Terms", "trigger": "Dwell time exceeded 95s reviewing 6-minute fitting rules and ₹2/min overtime surcharge.", "riskLevel": "Medium"}]'::jsonb,
    '[{"target": "Harshil Patel", "action": "Send instant WhatsApp nudge with 1-click ₹150 trial credit to clear UPI hesitation and dispatch order.", "impact": "Immediate recovery of ₹3,498 high-intent outerwear cart."}, {"target": "Darkstore Inwarding Ops (Koteshwar Hub)", "action": "Fast-track consignment inwarding for Size UK 8 / EU 42 on Rack C-01 to capture repeat sneaker demand.", "impact": "Prevents estimated ₹8,400 weekly revenue loss from out-of-stock bounces."}, {"target": "Doorstep Fitting Agreement UI", "action": "Highlight reassurance: Runner waits comfortably outside. Return unchosen items instantly with zero return fee.", "impact": "Reduces doorstep timer anxiety by ~35%."}]'::jsonb,
    '{"highIntentCount": 2, "atRiskDropoffCount": 2, "windowShoppersCount": 1, "highIntentPct": 40, "atRiskPct": 40}'::jsonb,
    5,
    1,
    'Gemini 1.5 Flash (Ahmedabad Shopper Behavioral Engine)'
);

-- 14.11. Wholesale Settlements (Brand Commercial Disbursals)
INSERT INTO drobe_wholesale_settlements (settlement_reference, brand_id, brand_name, category, kept_units_count, base_wholesale_payout_due, drobe_retained_markup_inr, gross_gmv_inr, bank_utr_ref, status, notes)
VALUES
    ('SETTL-DRB-2026-0041', 'br_mark_leute', 'Mark Leute', 'Outerwear', 12, 22200, 10788, 32988, 'NEFT-HDFC-9912038412', 'Disbursed', 'Weekly batch settlement #41 · Consignment kept units'),
    ('SETTL-DRB-2026-0042', 'br_underrated_club', 'Underrated Club', 'Tops & Tees', 18, 15300, 8982, 24282, 'IMPS-AXIS-8812903120', 'Disbursed', 'Weekly batch settlement #42 · High kept ratio (91%)');

-- 14.12. Margin Ledger (Transaction Economics)
INSERT INTO drobe_margin_ledger (order_id, product_id, sku, brand_id, customer_paid_mrp, base_wholesale_cost_b, drobe_markup_earned, runner_delivery_fee, payment_gateway_fee, net_profit_inr)
VALUES
    ('ord-30m-102', 'prod_uc_tee_02', 'DR2', 'br_underrated_club', 1499, 850, 649, 45, 22, 582),
    ('ord-30m-101', 'prod_ml_hoodie_01', 'DR1', 'br_mark_leute', 2899, 1850, 1049, 45, 43, 961);

-- 14.13. Instant UPI Refunds Record
INSERT INTO drobe_refund_records (order_id, customer_phone, upi_id, refund_amount_inr, refund_utr, gateway_provider, processing_time_seconds, status)
VALUES
    ('ord-30m-101', '+91 98792 33410', 'pooja@axisbank', 0, 'REF-UPI-0091823', 'Razorpay UPI Instant', 3, 'Success');

-- 14.14. Recovery Interventions (CRM WhatsApp Recovery)
INSERT INTO drobe_recovery_interventions (user_id, customer_name, customer_phone, trigger_reason, channel, trial_credit_inr, coupon_code, status, revenue_recovered_inr)
VALUES
    ('usr_harshil_02', 'Harshil Patel', '+91 97120 44912', 'UPI PIN Prompt Abandonment (₹3,498 cart)', 'WhatsApp', 150, 'DROBE150', 'Sent', 0);

-- 14.15. Darkstore SLA Metrics Baseline
INSERT INTO drobe_darkstore_metrics (warehouse_id, date_bucket, total_orders_received, sla_compliance_percentage, avg_picker_seconds, avg_delivery_minutes, total_units_inwarded, total_units_kept, total_units_returned, kept_ratio_percentage)
VALUES
    ('AMD-DARKSTORE-01', CURRENT_DATE, 48, 98, 165, 22, 120, 42, 6, 87);
