const API = "http://localhost:3001";
let passed = 0;
let failed = 0;
const failures = [];

async function test(name, method, path, body) {
  try {
    const opts = { method, headers: { "Content-Type": "application/json" } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API}${path}`, opts);
    const data = res.headers.get("content-type")?.includes("json") ? await res.json() : null;
    if (res.ok) {
      passed++;
      console.log(`  PASS  ${name}`);
      return data;
    } else {
      failed++;
      const msg = `FAIL  ${name} - Status ${res.status}`;
      console.log(`  ${msg}`);
      failures.push(msg);
      return data;
    }
  } catch (e) {
    failed++;
    const msg = `FAIL  ${name} - ${e.message}`;
    console.log(`  ${msg}`);
    failures.push(msg);
    return null;
  }
}

async function runTests() {
  console.log("\n=== AfriLogistics API Test Suite ===\n");

  // Health
  console.log("--- Health ---");
  await test("GET /api/health", "GET", "/api/health");

  // Orders
  console.log("\n--- Orders ---");
  const order1 = await test("POST /api/orders (create)", "POST", "/api/orders", {
    organizationId: "org-test",
    senderName: "Kemi Adekunle",
    senderPhone: "+2348012345678",
    senderAddress: { street: "12 Marina St", city: "Lagos", state: "Lagos", country: "NG", coordinates: { latitude: 6.4541, longitude: 3.3947 } },
    receiverName: "Fatima Hassan",
    receiverPhone: "+2348023456789",
    receiverAddress: { street: "45 Broad St", city: "Lagos", state: "Lagos", country: "NG", coordinates: { latitude: 6.4532, longitude: 3.3928 } },
    description: "Electronics", weight: 5, volume: 0.3, declaredValue: 50000, currency: "NGN", paymentMethod: "cod", priority: "high", vehicleType: "motorbike"
  });

  const order2 = await test("POST /api/orders (order 2)", "POST", "/api/orders", {
    organizationId: "org-test",
    senderName: "Emeka Nwosu",
    senderPhone: "+2348034567890",
    senderAddress: { street: "78 Balogun St", city: "Lagos", state: "Lagos", country: "NG", coordinates: { latitude: 6.4555, longitude: 3.3961 } },
    receiverName: "Aisha Bello",
    receiverPhone: "+2348045678901",
    receiverAddress: { street: "23 King St", city: "Lagos", state: "Lagos", country: "NG", coordinates: { latitude: 6.4520, longitude: 3.3910 } },
    description: "Clothing", weight: 3, volume: 0.2, declaredValue: 25000, currency: "NGN", paymentMethod: "momo", priority: "normal", vehicleType: "van"
  });

  await test("GET /api/orders (list)", "GET", `/api/orders?organizationId=org-test`);
  await test("GET /api/orders/:id", "GET", `/api/orders/${order1?.id}`);
  await test("PATCH /api/orders/:id/status", "PATCH", `/api/orders/${order1?.id}/status`, { status: "picked_up", notes: "Picked up from sender" });
  await test("GET /api/orders/:id/track", "GET", `/api/orders/${order1?.id}/track`);
  await test("GET /api/orders/stats/:orgId", "GET", `/api/orders/stats/org-test`);

  // Routes
  console.log("\n--- Route Optimization ---");
  await test("POST /api/routes/optimize", "POST", "/api/routes/optimize", {
    stops: [
      { id: "1", orderId: "ORD-1", sequence: 0, address: { latitude: 6.4541, longitude: 3.3947 }, addressLabel: "Marina", distanceFromPrevious: 0, timeFromPrevious: 0 },
      { id: "2", orderId: "ORD-2", sequence: 1, address: { latitude: 6.4532, longitude: 3.3928 }, addressLabel: "Broad St", distanceFromPrevious: 0, timeFromPrevious: 0 },
      { id: "3", orderId: "ORD-3", sequence: 2, address: { latitude: 6.4555, longitude: 3.3961 }, addressLabel: "Balogun", distanceFromPrevious: 0, timeFromPrevious: 0 },
      { id: "4", orderId: "ORD-4", sequence: 3, address: { latitude: 6.4520, longitude: 3.3910 }, addressLabel: "King St", distanceFromPrevious: 0, timeFromPrevious: 0 },
      { id: "5", orderId: "ORD-5", sequence: 4, address: { latitude: 6.4568, longitude: 3.3975 }, addressLabel: "Azikiwe St", distanceFromPrevious: 0, timeFromPrevious: 0 },
    ],
    vehicleType: "motorbike",
    startLocation: { latitude: 6.4541, longitude: 3.3947 },
    endLocation: { latitude: 6.4541, longitude: 3.3947 }
  });

  await test("POST /api/routes/split-batches", "POST", "/api/routes/split-batches", {
    stops: [
      { id: "1", address: { latitude: 6.4541, longitude: 3.3947 }, sequence: 0, orderId: "ORD-1", distanceFromPrevious: 0, timeFromPrevious: 0 },
      { id: "2", address: { latitude: 6.4532, longitude: 3.3928 }, sequence: 1, orderId: "ORD-2", distanceFromPrevious: 0, timeFromPrevious: 0 },
      { id: "3", address: { latitude: 6.4555, longitude: 3.3961 }, sequence: 2, orderId: "ORD-3", distanceFromPrevious: 0, timeFromPrevious: 0 },
    ],
    maxStops: 2, maxDistance: 5, vehicleType: "motorbike",
    startLocation: { latitude: 6.4541, longitude: 3.3947 }
  });

  await test("GET /api/routes/traffic-estimate", "GET", "/api/routes/traffic-estimate?distance=50&hour=8&isWeekend=false");

  // Warehouse
  console.log("\n--- Warehouse Management ---");
  const warehouse = await test("POST /api/warehouses (create)", "POST", "/api/warehouses", {
    organizationId: "org-test", name: "Lagos Hub", code: "LOS-01",
    address: { street: "Apapa Rd", city: "Lagos", state: "Lagos", country: "NG", coordinates: { latitude: 6.4498, longitude: 3.3983 } },
    capacity: 500, zones: ["receiving", "storage", "picking", "packing", "dispatch"],
    phone: "+2348001002000", operatingHours: { open: "08:00", close: "18:00" }, isActive: true
  });

  if (warehouse?.id) {
    await test("GET /api/warehouses/:id/stats", "GET", `/api/warehouses/${warehouse.id}/stats`);
    await test("POST /api/warehouses/:id/receive", "POST", `/api/warehouses/${warehouse.id}/receive`, {
      orderId: order1?.id,
      item: { sku: "ELEC-001", name: "Samsung Galaxy S24", description: "Smartphone", quantity: 5, unit: "unit", weight: 0.8, batchNumber: "BATCH-2026-001" },
      performedBy: "user-1"
    });
    await test("POST /api/warehouses/:id/receive (item 2)", "POST", `/api/warehouses/${warehouse.id}/receive`, {
      orderId: order2?.id,
      item: { sku: "CLTH-001", name: "Ankara Fabric", description: "Textile", quantity: 20, unit: "yards", weight: 2.5, batchNumber: "BATCH-2026-002" },
      performedBy: "user-1"
    });
    await test("GET /api/warehouses/:id/search", "GET", `/api/warehouses/${warehouse.id}/search?q=Samsung`);
    await test("GET /api/warehouses/:id/movements", "GET", `/api/warehouses/${warehouse.id}/movements`);
    await test("GET /api/warehouses/:id/low-stock", "GET", `/api/warehouses/${warehouse.id}/low-stock`);
    await test("GET /api/warehouses/:id/expiring", "GET", `/api/warehouses/${warehouse.id}/expiring`);
  }

  // Fleet
  console.log("\n--- Fleet Tracking ---");
  const vehicle = await test("POST /api/fleet/vehicles (register)", "POST", "/api/fleet/vehicles", {
    organizationId: "org-test", name: "Nairobi Runner", plateNumber: "NAI-456-CD",
    type: "van", status: "active", fuelType: "diesel", fuelCapacity: 80,
    currentFuelLevel: 58, mileage: 12000, maxLoadWeight: 2000, maxLoadVolume: 8,
    year: 2022, make: "Hyundai", model: "H1"
  });

  const driver = await test("POST /api/fleet/drivers (register)", "POST", "/api/fleet/drivers", {
    organizationId: "org-test", userId: "user-2", name: "James Mwangi",
    phone: "+254712345678", licenseNumber: "KE-2024-12345", licenseExpiry: "2028-12-31",
    vehicleId: vehicle?.id, isAvailable: true
  });

  await test("GET /api/fleet/locations", "GET", "/api/fleet/locations");
  await test("GET /api/fleet/stats/:orgId", "GET", "/api/fleet/stats/org-test");
  await test("POST /api/fleet/trips/start", "POST", "/api/fleet/trips/start", { vehicleId: vehicle?.id, driverId: driver?.id });
  await test("POST /api/fleet/trips/end", "POST", "/api/fleet/trips/end", { vehicleId: vehicle?.id });
  if (vehicle?.id) {
    await test("GET /api/fleet/vehicles/:id/health", "GET", `/api/fleet/vehicles/${vehicle.id}/health`);
  }

  // Fuel
  console.log("\n--- Fuel Optimization ---");
  await test("POST /api/fuel/records (fill up)", "POST", "/api/fuel/records", {
    vehicleId: vehicle?.id, organizationId: "org-test", fuelType: "diesel",
    quantity: 60, cost: 36000, currency: "NGN", pricePerUnit: 600,
    odometer: 12000, station: "Total Energies Victoria Island", paymentMethod: "momo",
    recordedBy: "user-1"
  });
  await test("GET /api/fuel/consumption/:vehicleId", "GET", `/api/fuel/consumption/${vehicle?.id}?period=monthly`);
  await test("GET /api/fuel/fleet-consumption", "GET", "/api/fuel/fleet-consumption?period=monthly");
  await test("GET /api/fuel/analytics/:orgId", "GET", "/api/fuel/analytics/org-test");
  await test("GET /api/fuel/refueling-alerts", "GET", "/api/fuel/refueling-alerts");
  await test("GET /api/fuel/savings/:orgId", "GET", "/api/fuel/savings/org-test");

  // Delivery Predictions
  console.log("\n--- Delivery Predictions ---");
  await test("POST /api/predictions/delivery", "POST", "/api/predictions/delivery", {
    order: { origin: { latitude: 6.4541, longitude: 3.3947 }, destination: { latitude: 7.3775, longitude: 3.947 }, vehicleType: "truck" },
    weather: { conditions: "rain", temperature: 27 },
    traffic: { level: "heavy", duration: 180 }
  });
  await test("GET /api/predictions/delay-patterns", "GET", "/api/predictions/delay-patterns");

  // SMS
  console.log("\n--- SMS Notifications ---");
  await test("GET /api/sms/stats", "GET", "/api/sms/stats");

  // Summary
  console.log(`\n=== Results: ${passed} passed, ${failed} failed, ${passed + failed} total ===`);
  if (failures.length > 0) {
    console.log("\nFailures:");
    failures.forEach(f => console.log(`  ${f}`));
  }
  console.log("");
}

runTests().catch(console.error);
