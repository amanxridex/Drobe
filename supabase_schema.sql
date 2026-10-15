-- ==============================================================================
-- DROBE AHMEDABAD DARKSTORE & 30-MINUTE CONSIGNMENT ECOSYSTEM
-- Master Supabase PostgreSQL Database Schema
-- Location: Shivam Bungalows 1, Koteshwar Road, Ahmedabad
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. DROBE DARKSTORE WAREHOUSES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS drobe_warehouses (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(64) NOT NULL UNIQUE,
    area VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(64) NOT NULL,
    express_radius TEXT NOT NULL,
    total_shelves INT DEFAULT 96,
    occupied_shelves INT DEFAULT 34,
    active_riders INT DEFAULT 18,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. WAREHOUSE PHYSICAL SHELVES MATRIX
-- ==============================================================================
CREATE TABLE IF NOT EXISTS drobe_warehouse_shelves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(64) NOT NULL UNIQUE, -- e.g. "AMD-RA02-S3-B04"
    warehouse_id VARCHAR(64) REFERENCES drobe_warehouses(id) ON DELETE CASCADE,
    zone VARCHAR(128) NOT NULL,       -- e.g. "Zone A - Outerwear & Jackets"
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
-- 3. BRANDS (Brand Dashboard & Onboarding)
-- ==============================================================================
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

-- ==============================================================================
-- 4. PRODUCTS & SKU INVENTORY (DR1, DR2, DR3...)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS drobe_products (
    id VARCHAR(128) PRIMARY KEY,
    sku VARCHAR(64) UNIQUE,           -- e.g. "DR1", "DR2"
    sku_serial INT UNIQUE,            -- e.g. 1, 2, 3
    name VARCHAR(255) NOT NULL,
    brand_id VARCHAR(128) REFERENCES drobe_brands(id) ON DELETE CASCADE,
    brand_name VARCHAR(255) NOT NULL,
    category VARCHAR(128) DEFAULT 'Outerwear',
    price VARCHAR(64) NOT NULL,       -- e.g. "₹1200"
    price_cents INT DEFAULT 120000,
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

-- ==============================================================================
-- 5. INBOUND CONSIGNMENT SHIPMENTS (Brand -> Ahmedabad Hub)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS drobe_inbound_shipments (
    id VARCHAR(128) PRIMARY KEY,      -- e.g. "INW-AMD-204"
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

-- ==============================================================================
-- 6. EXPRESS RUNNER FLEET (Delivery Partner App)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS drobe_runners (
    id VARCHAR(64) PRIMARY KEY,       -- e.g. "run-01"
    name VARCHAR(255) NOT NULL,       -- "Meet Dave"
    phone VARCHAR(64) NOT NULL,       -- "+91 98250 88123"
    vehicle VARCHAR(128) NOT NULL,    -- "Ather 450X EV (GJ-01-MW-9021)"
    current_status VARCHAR(64) DEFAULT 'Available at Hub',
    -- 'Available at Hub', 'Out on 30-Min Delivery', 'Waiting at Doorstep', 'Riding Back to Hub'
    deliveries_today INT DEFAULT 8,
    rating NUMERIC(3, 2) DEFAULT 4.95,
    battery_or_fuel VARCHAR(64) DEFAULT '82%',
    hub_base VARCHAR(255) DEFAULT 'Shivam Bungalows 1, Koteshwar Road',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. 30-MINUTE DOORSTEP TRIAL & RETURN ORDERS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS drobe_trial_orders (
    id VARCHAR(128) PRIMARY KEY,      -- e.g. "ord-30m-105"
    order_number VARCHAR(64) NOT NULL UNIQUE, -- e.g. "#DRB-9850"
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
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. ORDER AUDIT & DISPATCH EVENT LOG
-- ==============================================================================
CREATE TABLE IF NOT EXISTS drobe_order_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(128) REFERENCES drobe_trial_orders(id) ON DELETE CASCADE,
    order_number VARCHAR(64) NOT NULL,
    from_status VARCHAR(64),
    to_status VARCHAR(64) NOT NULL,
    performed_by VARCHAR(255) NOT NULL, -- e.g. "Hub Shift Executive", "Rider Meet Dave", "Customer"
    notes TEXT,
    event_timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 9. AUTO-UPDATE UPDATED_AT TIMESTAMP FUNCTION
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS trigger_drobe_warehouses_updated ON drobe_warehouses;
CREATE TRIGGER trigger_drobe_warehouses_updated BEFORE UPDATE ON drobe_warehouses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_drobe_shelves_updated ON drobe_warehouse_shelves;
CREATE TRIGGER trigger_drobe_shelves_updated BEFORE UPDATE ON drobe_warehouse_shelves FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_drobe_brands_updated ON drobe_brands;
CREATE TRIGGER trigger_drobe_brands_updated BEFORE UPDATE ON drobe_brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_drobe_products_updated ON drobe_products;
CREATE TRIGGER trigger_drobe_products_updated BEFORE UPDATE ON drobe_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_drobe_shipments_updated ON drobe_inbound_shipments;
CREATE TRIGGER trigger_drobe_shipments_updated BEFORE UPDATE ON drobe_inbound_shipments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_drobe_runners_updated ON drobe_runners;
CREATE TRIGGER trigger_drobe_runners_updated BEFORE UPDATE ON drobe_runners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_drobe_orders_updated ON drobe_trial_orders;
CREATE TRIGGER trigger_drobe_orders_updated BEFORE UPDATE ON drobe_trial_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 10. INDEXES & QUERY PERFORMANCE (Per Supabase Postgres Best Practices)
-- ==============================================================================

-- A. Primary & Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_orders_number ON drobe_trial_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON drobe_trial_orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON drobe_trial_orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_products_sku ON drobe_products(sku);
CREATE INDEX IF NOT EXISTS idx_products_brand ON drobe_products(brand_id);
CREATE INDEX IF NOT EXISTS idx_shelves_code ON drobe_warehouse_shelves(code);
CREATE INDEX IF NOT EXISTS idx_runners_id ON drobe_runners(id);

-- B. Foreign Key Indexes (Rule: schema-foreign-key-indexes.md - 10-100x faster JOINs & cascades)
CREATE INDEX IF NOT EXISTS idx_shelves_warehouse_id ON drobe_warehouse_shelves(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_shipments_brand_id ON drobe_inbound_shipments(brand_id);
CREATE INDEX IF NOT EXISTS idx_shipments_warehouse_id ON drobe_inbound_shipments(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_orders_warehouse_id ON drobe_trial_orders(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_orders_runner_id ON drobe_trial_orders(runner_id);
CREATE INDEX IF NOT EXISTS idx_orders_brand_id ON drobe_trial_orders(brand_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON drobe_trial_orders(product_id);
CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON drobe_order_events(order_id);

-- C. Composite & Sorting Indexes (Rule: query-composite-indexes.md)
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON drobe_trial_orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_created_at ON drobe_trial_orders(customer_phone, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_brand_status ON drobe_products(brand_id, inward_status);
CREATE INDEX IF NOT EXISTS idx_products_category_live ON drobe_products(category, is_live);
CREATE INDEX IF NOT EXISTS idx_brands_status_created_at ON drobe_brands(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_runners_status ON drobe_runners(current_status);

-- D. Partial Indexes for High-Velocity Subsets (Rule: query-partial-indexes.md - 95% smaller index)
CREATE INDEX IF NOT EXISTS idx_orders_active_trials 
ON drobe_trial_orders(id, runner_id, status) 
WHERE status NOT IN ('Completed & Kept', 'Cancelled', 'Returned & Refunded');

CREATE INDEX IF NOT EXISTS idx_products_live_catalog 
ON drobe_products(id, brand_id, category, price) 
WHERE is_live = TRUE;

-- ==============================================================================
-- 10.1. ATOMIC STOCK CONCURRENCY RPC FUNCTIONS (Row-Level Locking FOR UPDATE)
-- ==============================================================================

-- 1. Atomic Stock Deduction when trial order is placed or runner dispatched
CREATE OR REPLACE FUNCTION drobe_deduct_product_stock(
    p_product_id VARCHAR,
    p_qty INT DEFAULT 1
)
RETURNS TABLE (
    new_inward_units INT,
    new_units_in_trial INT,
    new_units_sold INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id VARCHAR;
BEGIN
    -- Acquire exclusive row lock to prevent race conditions during flash drops
    SELECT id INTO v_id 
    FROM drobe_products 
    WHERE (id = p_product_id OR sku = p_product_id)
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    UPDATE drobe_products
    SET 
        inward_units = GREATEST(0, COALESCE(inward_units, 0) - p_qty),
        units_in_trial = COALESCE(units_in_trial, 0) + p_qty,
        updated_at = NOW()
    WHERE id = v_id
    RETURNING inward_units, units_in_trial, units_sold
    INTO new_inward_units, new_units_in_trial, new_units_sold;

    RETURN NEXT;
END;
$$;

-- 2. Atomic Restock when trial item is returned to darkstore shelf
CREATE OR REPLACE FUNCTION drobe_restock_product_stock(
    p_product_id VARCHAR,
    p_qty INT DEFAULT 1,
    p_from_sold BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
    new_inward_units INT,
    new_units_in_trial INT,
    new_units_sold INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id VARCHAR;
BEGIN
    SELECT id INTO v_id 
    FROM drobe_products 
    WHERE (id = p_product_id OR sku = p_product_id)
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    IF p_from_sold THEN
        UPDATE drobe_products
        SET 
            inward_units = COALESCE(inward_units, 0) + p_qty,
            units_sold = GREATEST(0, COALESCE(units_sold, 0) - p_qty),
            updated_at = NOW()
        WHERE id = v_id
        RETURNING inward_units, units_in_trial, units_sold
        INTO new_inward_units, new_units_in_trial, new_units_sold;
    ELSE
        UPDATE drobe_products
        SET 
            inward_units = COALESCE(inward_units, 0) + p_qty,
            units_in_trial = GREATEST(0, COALESCE(units_in_trial, 0) - p_qty),
            updated_at = NOW()
        WHERE id = v_id
        RETURNING inward_units, units_in_trial, units_sold
        INTO new_inward_units, new_units_in_trial, new_units_sold;
    END IF;

    RETURN NEXT;
END;
$$;

-- 3. Atomic Confirmation when customer decides to keep and purchase item
CREATE OR REPLACE FUNCTION drobe_confirm_sold_stock(
    p_product_id VARCHAR,
    p_qty INT DEFAULT 1
)
RETURNS TABLE (
    new_inward_units INT,
    new_units_in_trial INT,
    new_units_sold INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id VARCHAR;
BEGIN
    SELECT id INTO v_id 
    FROM drobe_products 
    WHERE (id = p_product_id OR sku = p_product_id)
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    UPDATE drobe_products
    SET 
        units_in_trial = GREATEST(0, COALESCE(units_in_trial, 0) - p_qty),
        units_sold = COALESCE(units_sold, 0) + p_qty,
        updated_at = NOW()
    WHERE id = v_id
    RETURNING inward_units, units_in_trial, units_sold
    INTO new_inward_units, new_units_in_trial, new_units_sold;

    RETURN NEXT;
END;
$$;

-- ==============================================================================
-- 11. ENABLE REALTIME BROADCASTING ON SUPABASE
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE drobe_trial_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE drobe_products;
ALTER PUBLICATION supabase_realtime ADD TABLE drobe_brands;
ALTER PUBLICATION supabase_realtime ADD TABLE drobe_inbound_shipments;
ALTER PUBLICATION supabase_realtime ADD TABLE drobe_runners;

-- ==============================================================================
-- 12. INITIAL SEED DATA (Ready to Run & Explore Immediately!)
-- ==============================================================================

-- 1. Insert Ahmedabad Central Hub
INSERT INTO drobe_warehouses (id, name, code, area, address, contact_person, contact_phone, express_radius, total_shelves, occupied_shelves, active_riders)
VALUES (
    'AMD-DARKSTORE-01',
    'Drobe Central Darkstore Hub #01',
    'AMD-HUB-01',
    'Koteshwar Road · Ahmedabad',
    'Shivam Bungalows 1, Koteshwar Road, Ahmedabad',
    'Harshil Mehta (Darkstore Inward Manager)',
    '+91 79 4892 1001',
    '30-Minute Express Trial Zone (Koteshwar, Motera, Sabarmati, Chandkheda, SG Highway)',
    96,
    34,
    18
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert Core Warehouse Shelves Matrix
INSERT INTO drobe_warehouse_shelves (code, warehouse_id, zone, rack, shelf, bin, is_occupied, current_product_sku, current_product_name, current_units)
VALUES 
    ('AMD-RA02-S3-B04', 'AMD-DARKSTORE-01', 'Zone A - Outerwear & Jackets', 'Rack A-02', 'Shelf 3', 'Bin 04', TRUE, 'DR1', 'Bomber Drop shoulder', 20),
    ('AMD-RA03-S2-B08', 'AMD-DARKSTORE-01', 'Zone A - Outerwear & Jackets', 'Rack A-03', 'Shelf 2', 'Bin 08', TRUE, 'DR2', 'Sculpted Wool Overcoat', 14),
    ('AMD-RB01-S1-B02', 'AMD-DARKSTORE-01', 'Zone B - Streetwear Tops & Hoodies', 'Rack B-01', 'Shelf 1', 'Bin 02', TRUE, 'DR3', 'Acid Washed Boxy Tee', 18),
    ('AMD-RB02-S4-B01', 'AMD-DARKSTORE-01', 'Zone B - Streetwear Tops & Hoodies', 'Rack B-02', 'Shelf 4', 'Bin 01', TRUE, 'DR4', 'Minimal Linen Overshirt', 12),
    ('AMD-RC01-S2-B03', 'AMD-DARKSTORE-01', 'Zone C - Artisanal Cottons & Shirts', 'Rack C-01', 'Shelf 2', 'Bin 03', FALSE, NULL, NULL, 0),
    ('AMD-RD01-S1-B01', 'AMD-DARKSTORE-01', 'Zone D - Tailored Bottoms & Trousers', 'Rack D-01', 'Shelf 1', 'Bin 01', FALSE, NULL, NULL, 0)
ON CONFLICT (code) DO NOTHING;

-- 3. Insert Core Brands
INSERT INTO drobe_brands (id, name, tagline, category, founder_name, founder_role, email, based_out_of, status, profile_image, cover_image, total_products_count, inwarded_units_count)
VALUES 
    (
        'brand-chanel-01',
        'CHANEL',
        'Timeless Haute Couture & Modern Luxury',
        'Male & Female',
        'Gabrielle Chanel',
        'Creative Director',
        'contact@chanel.com',
        'Paris / Ahmedabad Consignment',
        'Approved',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
        3,
        42
    ),
    (
        'brand-underrated-02',
        'Underrated Club',
        'High-octane Indian streetwear engineered for darkstore velocity',
        'Male',
        'Kabir Varma',
        'Founder',
        'ops@underratedclub.com',
        'Mumbai / Ahmedabad Darkstore',
        'Approved',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=1200&q=80',
        2,
        30
    ),
    (
        'brand-nova-studios-03',
        'Nova Studios Ahmedabad',
        'Handloom artisanal linen and structured minimal jackets',
        'Female',
        'Rhea Patel',
        'Founder & Designer',
        'rhea@novastudios.in',
        'Ahmedabad (Ellisbridge)',
        'Waiting for Approval',
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=80',
        1,
        0
    )
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Verified Live Darkstore Products with SKUs
INSERT INTO drobe_products (id, sku, sku_serial, name, brand_id, brand_name, category, price, volume, declared_inventory, inward_units, units_in_trial, units_sold, inward_status, shelf_code, is_live, images)
VALUES 
    (
        'prod-dr-01',
        'DR1',
        1,
        'Bomber Drop shoulder',
        'brand-chanel-01',
        'CHANEL',
        'Outerwear',
        '₹1200',
        'M',
        24,
        20,
        1,
        8,
        'Inwarded & Live',
        'AMD-RA02-S3-B04',
        TRUE,
        '["https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80"]'::jsonb
    ),
    (
        'prod-dr-02',
        'DR2',
        2,
        'Sculpted Wool Overcoat',
        'brand-chanel-01',
        'CHANEL',
        'Outerwear',
        '₹4200',
        'L',
        16,
        14,
        2,
        3,
        'Inwarded & Live',
        'AMD-RA03-S2-B08',
        TRUE,
        '["https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80"]'::jsonb
    ),
    (
        'prod-dr-03',
        'DR3',
        3,
        'Acid Washed Boxy Tee',
        'brand-underrated-02',
        'Underrated Club',
        'Streetwear',
        '₹1499',
        'Oversized L',
        30,
        18,
        1,
        11,
        'Inwarded & Live',
        'AMD-RB01-S1-B02',
        TRUE,
        '["https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80"]'::jsonb
    ),
    (
        'prod-dr-04',
        'DR4',
        4,
        'Minimal Linen Overshirt',
        'brand-nova-studios-03',
        'Nova Studios Ahmedabad',
        'Artisanal',
        '₹2199',
        'M',
        15,
        12,
        0,
        0,
        'Inwarded & Live',
        'AMD-RB02-S4-B01',
        TRUE,
        '["https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80"]'::jsonb
    )
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Ahmedabad Express Runners Pool
INSERT INTO drobe_runners (id, name, phone, vehicle, current_status, deliveries_today, rating, battery_or_fuel)
VALUES 
    ('run-01', 'Meet Dave', '+91 98250 88123', 'Ather 450X EV (GJ-01-MW-9021)', 'Waiting at Doorstep', 9, 4.95, '82%'),
    ('run-02', 'Jay Suthar', '+91 97120 44912', 'Ola S1 Pro (GJ-01-ET-3304)', 'Out on 30-Min Delivery', 7, 4.90, '74%'),
    ('run-03', 'Karan Shah', '+91 98790 12049', 'TVS iQube EV (GJ-01-KB-1122)', 'Available at Hub', 11, 4.88, '95%'),
    ('run-04', 'Aarav Patel', '+91 98240 55102', 'Honda Activa 6G (GJ-01-PQ-5581)', 'Available at Hub', 6, 4.92, 'Full Tank'),
    ('run-05', 'Hardik Vaghela', '+91 99040 22319', 'Bajaj Chetak EV (GJ-01-RZ-8742)', 'Available at Hub', 8, 4.85, '90%')
ON CONFLICT (id) DO NOTHING;

-- 6. Insert Active Trial Orders
INSERT INTO drobe_trial_orders (
    id, order_number, customer_name, customer_phone, customer_address, landmark, distance_km,
    product_id, product_name, product_sku, brand_id, brand_name, price, size, shelf_location,
    runner_id, rider_name, rider_phone, rider_vehicle, status, doorstep_timer_minutes_left, notes
)
VALUES 
    (
        'ord-30m-105',
        '#DRB-9850',
        'Rohan Mehta',
        '+91 98251 44021',
        'B-304, Goyal Park, Judges Bungalow Road, Bodakdev, Ahmedabad',
        'Near Pakwan Cross Road',
        '1.8 km',
        'prod-dr-01',
        'Bomber Drop shoulder',
        'DR1',
        'brand-chanel-01',
        'CHANEL',
        '₹1200',
        'M',
        'AMD-RA02-S3-B04',
        NULL,
        NULL,
        NULL,
        NULL,
        'Order Received (Awaiting Picker)',
        15,
        'New 30-minute trial order placed from app! Ready for picker at Shivam Bungalows 1, Koteshwar Road.'
    ),
    (
        'ord-30m-106',
        '#DRB-9849',
        'Ananya Desai',
        '+91 97122 88319',
        'Penthouse 12, Westgate, SG Highway, Ahmedabad',
        'Opp. YMCA Club',
        '3.1 km',
        'prod-dr-02',
        'Sculpted Wool Overcoat',
        'DR2',
        'brand-chanel-01',
        'CHANEL',
        '₹4200',
        'L',
        'AMD-RA03-S2-B08',
        NULL,
        NULL,
        NULL,
        NULL,
        'Picked & Packed in Trial Bag',
        15,
        'Item picked from Rack A-03, Shelf 2, Bin 08. Packed in trial bag. Ready for delivery partner assignment!'
    ),
    (
        'ord-30m-101',
        '#DRB-9842',
        'Aarav Parekh',
        '+91 98250 88123',
        'B-702, Shaligram Plus, Opp. Iskcon Temple, SG Highway, Ahmedabad',
        'Opp. Iskcon Temple',
        '2.1 km',
        'prod-dr-01',
        'Bomber Drop shoulder',
        'DR1',
        'brand-chanel-01',
        'CHANEL',
        '₹1200',
        'M',
        'AMD-RA02-S3-B04',
        'run-01',
        'Meet Dave',
        '+91 98250 88123',
        'Ather 450X EV (GJ-01-MW-9021)',
        'Doorstep Fitting (Runner Waiting Outside)',
        7,
        'Runner waiting outside apartment with trial bag while client tries size M. Decision pending.'
    ),
    (
        'ord-30m-102',
        '#DRB-9843',
        'Pooja Shah',
        '+91 98792 33410',
        'Villa 14, Sun City, Bopal, Ahmedabad',
        'Near Bopal Cross Road',
        '4.2 km',
        'prod-dr-02',
        'Sculpted Wool Overcoat',
        'DR2',
        'brand-chanel-01',
        'CHANEL',
        '₹4200',
        'L',
        'AMD-RA03-S2-B08',
        'run-02',
        'Jay Suthar',
        '+91 97120 44912',
        'Ola S1 Pro (GJ-01-ET-3304)',
        'Out for 30-Min Delivery',
        12,
        'Runner en route to Bopal. Will wait outside doorstep for instant 10-min fitting.'
    )
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE drobe_warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE drobe_warehouse_shelves ENABLE ROW LEVEL SECURITY;
ALTER TABLE drobe_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE drobe_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE drobe_inbound_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE drobe_runners ENABLE ROW LEVEL SECURITY;
ALTER TABLE drobe_trial_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE drobe_order_events ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access for darkstore fulfillment terminals & runners
CREATE POLICY "Public read/write on warehouses" ON drobe_warehouses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write on shelves" ON drobe_warehouse_shelves FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write on brands" ON drobe_brands FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write on products" ON drobe_products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write on shipments" ON drobe_inbound_shipments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write on runners" ON drobe_runners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write on orders" ON drobe_trial_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write on events" ON drobe_order_events FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 14. CUSTOMER USER PROFILES & TELEMETRY
-- ==============================================================================
CREATE TABLE IF NOT EXISTS drobe_user_profiles (
    id VARCHAR(128) PRIMARY KEY,          -- e.g. "usr_aman_01"
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(64) NOT NULL UNIQUE,
    avatar TEXT,
    city VARCHAR(128) DEFAULT 'Ahmedabad',
    hub_zone VARCHAR(255) DEFAULT 'Ahmedabad Darkstore Hub #01 (SG Highway)',
    top_size VARCHAR(32) DEFAULT 'L',
    bottom_size VARCHAR(32) DEFAULT '32',
    footwear_size VARCHAR(32) DEFAULT 'UK 9',
    preferred_fit VARCHAR(64) DEFAULT 'Relaxed',
    preferred_styles JSONB DEFAULT '["Streetwear", "Casual", "Minimal", "Oversized"]'::jsonb,
    favourite_brands JSONB DEFAULT '["SNITCH", "The Souled Store", "Tilt", "Mark Leute"]'::jsonb,
    saved_addresses JSONB DEFAULT '[]'::jsonb,
    upi_id VARCHAR(128) DEFAULT 'aman@okhdfcbank',
    total_orders_count INT DEFAULT 0,
    total_spent_inr INT DEFAULT 0,
    doorstep_trials_count INT DEFAULT 0,
    kept_ratio_percentage INT DEFAULT 100,
    current_status VARCHAR(64) DEFAULT 'Active Browsing',
    -- Statuses: 'Active Browsing', 'In Doorstep Trial', 'Trial Bag Out', 'Offline'
    current_screen VARCHAR(255) DEFAULT 'Home Feed',
    device_info VARCHAR(255) DEFAULT 'iPhone 16 Pro · iOS 18.2',
    ip_address VARCHAR(64) DEFAULT '103.24.112.5',
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 15. REAL-TIME USER ACTIVITY STREAM (Audit & Telemetry Log)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS drobe_user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(128) REFERENCES drobe_user_profiles(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    activity_type VARCHAR(64) NOT NULL,
    -- Types: 'PAGE_VIEW', 'PRODUCT_CLICK', 'WISHLIST_ADD', 'TRIAL_ORDER_PLACED', 
    --        'DOORSTEP_TRIAL_START', 'ITEM_KEPT', 'ITEM_RETURNED', 'PROFILE_EDIT'
    title VARCHAR(255) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    screen VARCHAR(128),
    ip_address VARCHAR(64),
    device VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for User Telemetry & Fast Filtering
CREATE INDEX IF NOT EXISTS idx_users_email ON drobe_user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON drobe_user_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON drobe_user_profiles(last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_status ON drobe_user_profiles(current_status);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON drobe_user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON drobe_user_activities(created_at DESC);

-- Enable Realtime Broadcasting on Supabase for Users & Activities
ALTER PUBLICATION supabase_realtime ADD TABLE drobe_user_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE drobe_user_activities;

-- Row Level Security
ALTER TABLE drobe_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drobe_user_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read/write on user profiles" ON drobe_user_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write on user activities" ON drobe_user_activities FOR ALL USING (true) WITH CHECK (true);

-- Auto-update trigger
DROP TRIGGER IF EXISTS trigger_drobe_users_updated ON drobe_user_profiles;
CREATE TRIGGER trigger_drobe_users_updated BEFORE UPDATE ON drobe_user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 16. SEED DATA: ACTIVE AHMEDABAD CUSTOMERS & LIVE ACTIVITY LOG
-- ==============================================================================
INSERT INTO drobe_user_profiles (
    id, name, email, phone, avatar, city, hub_zone,
    top_size, bottom_size, footwear_size, preferred_fit,
    preferred_styles, favourite_brands, upi_id,
    total_orders_count, total_spent_inr, doorstep_trials_count, kept_ratio_percentage,
    current_status, current_screen, device_info, last_active_at
) VALUES 
    (
        'usr_aman_01',
        'Aman Mishra',
        'aman@example.com',
        '+91 98250 88123',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        'Ahmedabad',
        'Ahmedabad Darkstore Hub #01 (SG Highway)',
        'L', '32', 'UK 9', 'Relaxed',
        '["Streetwear", "Casual", "Minimal", "Oversized"]'::jsonb,
        '["SNITCH", "The Souled Store", "Tilt", "Mark Leute"]'::jsonb,
        'aman@okhdfcbank',
        4, 12890, 4, 100,
        'Active Browsing', 'Viewing Mark Leute Hoodie', 'iPhone 16 Pro · iOS 18.2', NOW()
    ),
    (
        'usr_pooja_02',
        'Pooja Shah',
        'pooja.shah@gmail.com',
        '+91 98792 33410',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        'Ahmedabad',
        'Bopal Darkstore Express Zone',
        'M', '28', 'UK 6', 'Regular',
        '["Minimal", "Casual", "Athleisure"]'::jsonb,
        '["Tilt", "Mark Leute", "Bluorng"]'::jsonb,
        'pooja@axisbank',
        3, 8400, 3, 100,
        'In Doorstep Trial', '6-Minute Doorstep Fitting Window', 'OnePlus 12 · Android 14', NOW() - INTERVAL '4 minutes'
    ),
    (
        'usr_harshil_03',
        'Harshil Patel',
        'harshil.p@outlook.com',
        '+91 97120 44912',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        'Ahmedabad',
        'Motera & Koteshwar Express Hub',
        'XL', '34', 'UK 10', 'Oversized',
        '["Streetwear", "Oversized", "Drop Shoulder"]'::jsonb,
        '["SNITCH", "Huemn", "VegNonVeg"]'::jsonb,
        'harshil@okaxis',
        5, 15200, 6, 83,
        'Active Browsing', 'Catalog Category Filter: Outerwear', 'Samsung Galaxy S24 Ultra', NOW() - INTERVAL '12 minutes'
    ),
    (
        'usr_tanya_04',
        'Tanya Joshi',
        'tanya.j@icloud.com',
        '+91 99041 55201',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
        'Ahmedabad',
        'Satellite & Vastrapur Hub #02',
        'S', '26', 'UK 5', 'Slim',
        '["Minimal", "Contemporary", "Streetwear"]'::jsonb,
        '["The Souled Store", "Tilt"]'::jsonb,
        'tanyaj@paytm',
        2, 6500, 2, 100,
        'Offline', 'Home Feed', 'iPhone 15 · iOS 18.1', NOW() - INTERVAL '2 hours'
    ),
    (
        'usr_dhruv_05',
        'Dhruv Mehta',
        'dhruv99@yahoo.com',
        '+91 98980 77144',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        'Ahmedabad',
        'Prahlad Nagar Express Zone',
        'M', '30', 'UK 8', 'Relaxed',
        '["Casual", "Streetwear"]'::jsonb,
        '["Mark Leute", "SNITCH"]'::jsonb,
        'dhruv@icici',
        1, 4200, 2, 50,
        'Offline', 'Past Orders Screen', 'Google Pixel 9 Pro', NOW() - INTERVAL '5 hours'
    )
ON CONFLICT (id) DO NOTHING;

-- Initial Real-Time Activities Feed Seed
INSERT INTO drobe_user_activities (
    user_id, user_name, activity_type, title, details, screen, device
) VALUES 
    (
        'usr_aman_01',
        'Aman Mishra',
        'PRODUCT_CLICK',
        'Viewing Mark Leute Heavy Oversized Hoodie (Size L)',
        '{"brand": "Mark Leute", "sku": "DR1", "price": "₹2,899", "size": "L"}'::jsonb,
        'Product Detail',
        'iPhone 16 Pro'
    ),
    (
        'usr_pooja_02',
        'Pooja Shah',
        'DOORSTEP_TRIAL_START',
        '6-Minute Doorstep Fitting Window Started in Bopal',
        '{"order_number": "#DRB-9843", "runner": "Jay Suthar", "item": "Sculpted Wool Overcoat"}'::jsonb,
        'Live Doorstep Trial',
        'OnePlus 12'
    ),
    (
        'usr_harshil_03',
        'Harshil Patel',
        'WISHLIST_ADD',
        'Saved Tilt Utility Cargo to Wishlist',
        '{"brand": "Tilt", "category": "Bottoms", "price": "₹1,999"}'::jsonb,
        'Collection Lookbook',
        'Samsung Galaxy S24 Ultra'
    ),
    (
        'usr_aman_01',
        'Aman Mishra',
        'PROFILE_EDIT',
        'Updated Fashion Preferences: Top Size L, Streetwear & Minimal',
        '{"styles": ["Streetwear", "Minimal"], "topSize": "L", "bottomSize": "32"}'::jsonb,
        'Fashion Preferences Modal',
        'iPhone 16 Pro'
    ),
    (
        'usr_tanya_04',
        'Tanya Joshi',
        'PAGE_VIEW',
        'Browsed New Independent Brand Drops at Ahmedabad Hub',
        '{"hub": "AMD-HUB-01", "total_brands": 8}'::jsonb,
        'Discover Brands',
        'iPhone 15'
    )
ON CONFLICT (id) DO NOTHING;

