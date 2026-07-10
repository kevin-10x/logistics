CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE TYPE user_role AS ENUM ('admin', 'dispatcher', 'driver', 'warehouse_manager', 'warehouse_staff', 'viewer');
CREATE TYPE vehicle_type AS ENUM ('truck', 'van', 'motorbike', 'bicycle', 'trailer', 'pickup');
CREATE TYPE vehicle_status AS ENUM ('active', 'idle', 'maintenance', 'offline', 'retired');
CREATE TYPE fuel_type AS ENUM ('diesel', 'petrol', 'electric', 'lpg');
CREATE TYPE order_status AS ENUM ('pending', 'assigned', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned');
CREATE TYPE payment_method AS ENUM ('cash', 'momo', 'airtel_money', 'mpesa', 'bank_transfer', 'card', 'cod');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded');
CREATE TYPE priority_level AS ENUM ('normal', 'high', 'urgent');
CREATE TYPE warehouse_zone AS ENUM ('receiving', 'storage', 'picking', 'packing', 'dispatch', 'returns');
CREATE TYPE route_status AS ENUM ('planned', 'active', 'completed', 'cancelled');
CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE language_code AS ENUM ('en', 'fr', 'sw', 'ha', 'yo', 'zu', 'am', 'ar', 'pt');

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    country VARCHAR(2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    subscription VARCHAR(20) DEFAULT 'free',
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role user_role DEFAULT 'driver',
    language language_code DEFAULT 'en',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    plate_number VARCHAR(50) NOT NULL,
    type vehicle_type NOT NULL,
    status vehicle_status DEFAULT 'idle',
    fuel_type fuel_type DEFAULT 'diesel',
    fuel_capacity DECIMAL(10,2) DEFAULT 0,
    current_fuel_level DECIMAL(10,2) DEFAULT 0,
    mileage DECIMAL(12,2) DEFAULT 0,
    max_load_weight DECIMAL(10,2) DEFAULT 0,
    max_load_volume DECIMAL(10,2) DEFAULT 0,
    year INTEGER,
    make VARCHAR(100),
    model VARCHAR(100),
    driver_id UUID,
    last_location GEOGRAPHY(POINT, 4326),
    last_location_update TIMESTAMPTZ,
    insurance_expiry DATE,
    registration_expiry DATE,
    next_maintenance_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    license_number VARCHAR(100),
    license_expiry DATE,
    rating DECIMAL(3,2) DEFAULT 5.00,
    total_deliveries INTEGER DEFAULT 0,
    successful_deliveries INTEGER DEFAULT 0,
    average_delivery_time DECIMAL(10,2) DEFAULT 0,
    vehicle_id UUID,
    is_available BOOLEAN DEFAULT true,
    current_location GEOGRAPHY(POINT, 4326),
    home_address JSONB,
    emergency_contact JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_phone VARCHAR(50) NOT NULL,
    sender_address JSONB NOT NULL,
    sender_location GEOGRAPHY(POINT, 4326),
    receiver_name VARCHAR(255) NOT NULL,
    receiver_phone VARCHAR(50) NOT NULL,
    receiver_address JSONB NOT NULL,
    receiver_location GEOGRAPHY(POINT, 4326),
    description TEXT,
    weight DECIMAL(10,2) DEFAULT 0,
    volume DECIMAL(10,2) DEFAULT 0,
    declared_value DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method payment_method DEFAULT 'cod',
    payment_status payment_status DEFAULT 'pending',
    status order_status DEFAULT 'pending',
    priority priority_level DEFAULT 'normal',
    vehicle_type vehicle_type DEFAULT 'van',
    route_id UUID,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    warehouse_id UUID,
    current_warehouse_id UUID,
    estimated_delivery TIMESTAMPTZ,
    actual_delivery TIMESTAMPTZ,
    delivery_notes TEXT,
    proof_of_delivery JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    address JSONB NOT NULL,
    location GEOGRAPHY(POINT, 4326),
    capacity INTEGER DEFAULT 0,
    current_occupancy INTEGER DEFAULT 0,
    zones warehouse_zone[] DEFAULT ARRAY['receiving', 'storage', 'picking', 'packing', 'dispatch'],
    manager_id UUID,
    phone VARCHAR(50),
    operating_hours JSONB DEFAULT '{"open": "08:00", "close": "18:00"}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE warehouse_bins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
    zone warehouse_zone NOT NULL,
    code VARCHAR(20) NOT NULL,
    aisle VARCHAR(10),
    rack VARCHAR(10),
    level VARCHAR(10),
    position VARCHAR(10),
    capacity INTEGER DEFAULT 50,
    current_occupancy INTEGER DEFAULT 0,
    max_weight DECIMAL(10,2) DEFAULT 250,
    current_weight DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(warehouse_id, code)
);

CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
    bin_id UUID REFERENCES warehouse_bins(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    sku VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity INTEGER DEFAULT 1,
    unit VARCHAR(20) DEFAULT 'unit',
    weight DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'received',
    received_at TIMESTAMPTZ DEFAULT NOW(),
    stored_at TIMESTAMPTZ,
    dispatched_at TIMESTAMPTZ,
    expiry_date DATE,
    batch_number VARCHAR(100),
    serial_numbers TEXT[]
);

CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    from_zone warehouse_zone,
    to_zone warehouse_zone NOT NULL,
    quantity INTEGER DEFAULT 1,
    performed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id),
    driver_id UUID REFERENCES drivers(id),
    status route_status DEFAULT 'planned',
    stops JSONB DEFAULT '[]',
    total_distance DECIMAL(10,2) DEFAULT 0,
    estimated_duration DECIMAL(10,2) DEFAULT 0,
    actual_duration DECIMAL(10,2),
    estimated_fuel_consumption DECIMAL(10,2) DEFAULT 0,
    actual_fuel_consumption DECIMAL(10,2),
    total_orders INTEGER DEFAULT 0,
    completed_orders INTEGER DEFAULT 0,
    optimized_order INTEGER[],
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE route_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id),
    sequence INTEGER NOT NULL,
    address GEOGRAPHY(POINT, 4326),
    address_label TEXT,
    arrival_time TIMESTAMPTZ,
    departure_time TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'pending',
    signature_url TEXT,
    photo_url TEXT,
    notes TEXT,
    distance_from_previous DECIMAL(10,2) DEFAULT 0,
    time_from_previous DECIMAL(10,2) DEFAULT 0
);

CREATE TABLE fuel_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id),
    fuel_type fuel_type NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    cost DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    price_per_unit DECIMAL(10,4),
    odometer DECIMAL(12,2),
    station VARCHAR(255),
    payment_method payment_method DEFAULT 'cash',
    recorded_by UUID REFERENCES users(id),
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE maintenance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    type VARCHAR(20) DEFAULT 'scheduled',
    description TEXT,
    cost DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    odometer DECIMAL(12,2),
    start_date DATE,
    end_date DATE,
    vendor VARCHAR(255),
    parts JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vehicle_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    speed DECIMAL(6,2) DEFAULT 0,
    heading DECIMAL(6,2) DEFAULT 0,
    accuracy DECIMAL(6,2) DEFAULT 0,
    battery_level INTEGER,
    ignition_on BOOLEAN,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE geofences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) DEFAULT 'delivery_zone',
    center GEOGRAPHY(POINT, 4326),
    radius DECIMAL(10,2),
    polygon GEOGRAPHY(POLYGON, 4326),
    alert_on_entry BOOLEAN DEFAULT true,
    alert_on_exit BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    severity alert_severity DEFAULT 'low',
    title VARCHAR(255) NOT NULL,
    message TEXT,
    vehicle_id UUID,
    driver_id UUID,
    order_id UUID,
    is_read BOOLEAN DEFAULT false,
    is_resolved BOOLEAN DEFAULT false,
    resolved_by UUID,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sms_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    phone VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE delivery_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    estimated_arrival TIMESTAMPTZ,
    confidence DECIMAL(5,3),
    factors JSONB DEFAULT '[]',
    risk_level VARCHAR(10) DEFAULT 'low',
    delay_probability DECIMAL(5,3),
    weather_impact DECIMAL(5,3),
    traffic_impact DECIMAL(5,3),
    historical_accuracy DECIMAL(5,3),
    alternative_time_slots TIMESTAMPTZ[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mobile_money_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    order_id UUID REFERENCES orders(id),
    provider VARCHAR(20) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    reference VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_orders_org ON orders(organization_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_driver ON orders(driver_id);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_sender_location ON orders USING GIST(sender_location);
CREATE INDEX idx_orders_receiver_location ON orders USING GIST(receiver_location);

CREATE INDEX idx_vehicles_org ON vehicles(organization_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_location ON vehicles USING GIST(last_location);
CREATE INDEX idx_vehicles_driver ON vehicles(driver_id);

CREATE INDEX idx_drivers_org ON drivers(organization_id);
CREATE INDEX idx_drivers_location ON drivers USING GIST(current_location);

CREATE INDEX idx_warehouses_org ON warehouses(organization_id);
CREATE INDEX idx_warehouse_bins_warehouse ON warehouse_bins(warehouse_id);
CREATE INDEX idx_warehouse_bins_zone ON warehouse_bins(zone);

CREATE INDEX idx_inventory_warehouse ON inventory_items(warehouse_id);
CREATE INDEX idx_inventory_order ON inventory_items(order_id);
CREATE INDEX idx_inventory_status ON inventory_items(status);

CREATE INDEX idx_routes_org ON routes(organization_id);
CREATE INDEX idx_routes_status ON routes(status);
CREATE INDEX idx_routes_vehicle ON routes(vehicle_id);

CREATE INDEX idx_fuel_records_vehicle ON fuel_records(vehicle_id);
CREATE INDEX idx_fuel_records_created ON fuel_records(created_at DESC);

CREATE INDEX idx_vehicle_locations_vehicle ON vehicle_locations(vehicle_id);
CREATE INDEX idx_vehicle_locations_recorded ON vehicle_locations(recorded_at DESC);

CREATE INDEX idx_alerts_org ON alerts(organization_id);
CREATE INDEX idx_alerts_unread ON alerts(is_read, created_at DESC);

CREATE INDEX idx_geofences_org ON geofences(organization_id);

CREATE INDEX idx_sms_order ON sms_notifications(order_id);
CREATE INDEX idx_sms_status ON sms_notifications(status);

CREATE INDEX idx_momo_org ON mobile_money_transactions(organization_id);
CREATE INDEX idx_momo_status ON mobile_money_transactions(status);
CREATE INDEX idx_momo_reference ON mobile_money_transactions(reference);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_organizations_updated BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_vehicles_updated BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_drivers_updated BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_orders_updated BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE VIEW v_fleet_overview AS
SELECT
    v.id, v.name, v.plate_number, v.type, v.status, v.fuel_capacity,
    v.current_fuel_level, v.mileage,
    d.name AS driver_name, d.phone AS driver_phone, d.rating AS driver_rating,
    ST_Y(v.last_location::geometry) AS latitude,
    ST_X(v.last_location::geometry) AS longitude,
    v.last_location_update
FROM vehicles v
LEFT JOIN drivers d ON v.driver_id = d.id;

CREATE OR REPLACE VIEW v_delivery_performance AS
SELECT
    o.organization_id,
    DATE(o.created_at) AS date,
    COUNT(*) AS total_orders,
    COUNT(*) FILTER (WHERE o.status = 'delivered') AS delivered,
    COUNT(*) FILTER (WHERE o.status = 'failed') AS failed,
    COUNT(*) FILTER (WHERE o.actual_delivery <= o.estimated_delivery) AS on_time,
    ROUND(AVG(EXTRACT(EPOCH FROM (o.actual_delivery - o.created_at)) / 3600), 2) AS avg_delivery_hours
FROM orders o
WHERE o.status IN ('delivered', 'failed')
GROUP BY o.organization_id, DATE(o.created_at);

CREATE OR REPLACE VIEW v_warehouse_utilization AS
SELECT
    w.id AS warehouse_id,
    w.name AS warehouse_name,
    w.capacity AS total_bins,
    COUNT(wb.id) FILTER (WHERE wb.current_occupancy > 0) AS occupied_bins,
    ROUND(COUNT(wb.id) FILTER (WHERE wb.current_occupancy > 0)::DECIMAL / NULLIF(COUNT(wb.id), 0) * 100, 1) AS utilization_pct,
    SUM(wb.current_weight) AS total_weight,
    SUM(wb.max_weight) AS max_weight
FROM warehouses w
JOIN warehouse_bins wb ON w.id = wb.warehouse_id
GROUP BY w.id, w.name, w.capacity;

CREATE OR REPLACE VIEW v_fuel_efficiency AS
SELECT
    fr.vehicle_id,
    v.name AS vehicle_name,
    v.plate_number,
    v.type AS vehicle_type,
    SUM(fr.quantity) AS total_fuel,
    SUM(fr.cost) AS total_cost,
    AVG(fr.price_per_unit) AS avg_price,
    v.mileage,
    ROUND(v.mileage / NULLIF(SUM(fr.quantity), 0) * 100, 2) AS km_per_100l,
    ROUND(SUM(fr.cost) / NULLIF(v.mileage, 0), 2) AS cost_per_km
FROM fuel_records fr
JOIN vehicles v ON fr.vehicle_id = v.id
GROUP BY fr.vehicle_id, v.name, v.plate_number, v.type, v.mileage;
