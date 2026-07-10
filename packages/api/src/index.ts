import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";

import { RouteOptimizationService } from "./services/route-optimization";
import { WarehouseManagementService } from "./services/warehouse-management";
import { FleetTrackingService } from "./services/fleet-tracking";
import { FuelOptimizationService } from "./services/fuel-optimization";
import { DeliveryPredictionService } from "./services/delivery-prediction";
import { SmsService } from "./services/sms-service";
import { OrderService } from "./services/order-service";

const app = express();
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan("combined"));
app.use(express.json());

const routeService = new RouteOptimizationService();
const warehouseService = new WarehouseManagementService();
const fleetService = new FleetTrackingService();
const fuelService = new FuelOptimizationService();
const predictionService = new DeliveryPredictionService();
const smsService = new SmsService({
  apiKey: process.env.SMS_API_KEY || "",
  baseUrl: process.env.SMS_BASE_URL || "https://api.afrisms.com",
  sendingEnabled: process.env.SMS_ENABLED === "true",
});
const orderService = new OrderService();

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("subscribe:vehicle", (vehicleId: string) => {
    socket.join(`vehicle:${vehicleId}`);
  });

  socket.on("subscribe:organization", (orgId: string) => {
    socket.join(`org:${orgId}`);
  });

  socket.on("location:update", (data: { vehicleId: string; lat: number; lng: number; speed: number; heading: number }) => {
    const update = fleetService.updateLocation(data.vehicleId, {
      location: { latitude: data.lat, longitude: data.lng },
      speed: data.speed,
      heading: data.heading,
      accuracy: 10,
      timestamp: new Date().toISOString(),
    });
    io.to(`vehicle:${data.vehicleId}`).emit("location:changed", update);
    io.to(`org:default`).emit("fleet:update", { vehicleId: data.vehicleId, location: update.location });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// --- ORDER ROUTES ---
app.post("/api/orders", (req, res) => {
  const order = orderService.createOrder(req.body);
  smsService.sendNotification(order, "confirmation", "en").catch(console.error);
  io.to(`org:${order.organizationId}`).emit("order:created", order);
  res.status(201).json(order);
});

app.get("/api/orders/:id", (req, res) => {
  const order = orderService.getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

app.get("/api/orders", (req, res) => {
  const { organizationId, status, search } = req.query;
  if (search && organizationId) {
    return res.json(orderService.searchOrders(organizationId as string, search as string));
  }
  res.json(orderService.getOrdersByOrganization(organizationId as string, status as any));
});

app.patch("/api/orders/:id/status", (req, res) => {
  const { status, notes } = req.body;
  const order = orderService.updateStatus(req.params.id, status, notes);
  if (!order) return res.status(404).json({ error: "Order not found" });
  smsService.sendNotification(order, "update", "en", { message: notes || "" }).catch(console.error);
  io.to(`org:${order.organizationId}`).emit("order:updated", order);
  res.json(order);
});

app.get("/api/orders/:id/track", (req, res) => {
  const order = orderService.getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  const prediction = predictionService.predictDeliveryTime({
    origin: order.senderAddress.coordinates,
    destination: order.receiverAddress.coordinates,
    vehicleType: order.vehicleType,
  });
  res.json({ order, prediction });
});

app.get("/api/orders/stats/:organizationId", (req, res) => {
  res.json(orderService.getOrderStats(req.params.organizationId));
});

// --- ROUTE OPTIMIZATION ROUTES ---
app.post("/api/routes/optimize", (req, res) => {
  const { stops, vehicleType, startLocation, endLocation, weather } = req.body;
  const optimized = routeService.optimizeRoute(stops, vehicleType, startLocation, endLocation, weather);
  res.json(optimized);
});

app.post("/api/routes/split-batches", (req, res) => {
  const { stops, maxStops, maxDistance, vehicleType, startLocation } = req.body;
  const batches = routeService.splitIntoBatches(stops, maxStops, maxDistance, vehicleType, startLocation);
  res.json({ batches, count: batches.length });
});

app.get("/api/routes/traffic-estimate", (req, res) => {
  const { distance, hour, isWeekend } = req.query;
  const estimate = routeService.getTrafficAdjustedTime(
    Number(distance), Number(hour), isWeekend === "true"
  );
  res.json({ estimatedMinutes: estimate });
});

// --- WAREHOUSE ROUTES ---
app.post("/api/warehouses", (req, res) => {
  const warehouse = warehouseService.createWarehouse(req.body);
  res.status(201).json(warehouse);
});

app.get("/api/warehouses/:id/stats", (req, res) => {
  res.json(warehouseService.getWarehouseStats(req.params.id));
});

app.post("/api/warehouses/:id/receive", (req, res) => {
  const item = warehouseService.receiveItem(req.params.id, req.body.orderId, req.body.item, req.body.performedBy);
  res.status(201).json(item);
});

app.post("/api/warehouses/:id/move", (req, res) => {
  const item = warehouseService.moveItem(req.params.id, req.body.itemId, req.body.toZone, req.body.performedBy);
  if (!item) return res.status(404).json({ error: "Item not found" });
  res.json(item);
});

app.post("/api/warehouses/:id/dispatch", (req, res) => {
  const item = warehouseService.dispatchItem(req.params.id, req.body.itemId, req.body.performedBy);
  if (!item) return res.status(404).json({ error: "Item not found" });
  res.json(item);
});

app.get("/api/warehouses/:id/search", (req, res) => {
  const results = warehouseService.searchInventory(req.params.id, req.query.q as string);
  res.json(results);
});

app.get("/api/warehouses/:id/movements", (req, res) => {
  res.json(warehouseService.getMovements(req.params.id, Number(req.query.limit) || 50));
});

app.get("/api/warehouses/:id/low-stock", (req, res) => {
  res.json(warehouseService.getLowStockBins(req.params.id));
});

app.get("/api/warehouses/:id/expiring", (req, res) => {
  res.json(warehouseService.getExpiringItems(req.params.id, Number(req.query.days) || 30));
});

// --- FLEET ROUTES ---
app.post("/api/fleet/vehicles", (req, res) => {
  const vehicle = fleetService.registerVehicle(req.body);
  fuelService.registerVehicle(vehicle);
  res.status(201).json(vehicle);
});

app.post("/api/fleet/drivers", (req, res) => {
  const driver = fleetService.registerDriver(req.body);
  res.status(201).json(driver);
});

app.get("/api/fleet/locations", (req, res) => {
  res.json(fleetService.getAllVehicleLocations());
});

app.get("/api/fleet/vehicles/:id/location", (req, res) => {
  const location = fleetService.getVehicleLocation(req.params.id);
  if (!location) return res.status(404).json({ error: "No location data" });
  res.json(location);
});

app.get("/api/fleet/vehicles/:id/history", (req, res) => {
  const { from, to } = req.query;
  res.json(fleetService.getVehicleHistory(req.params.id, from as string, to as string));
});

app.post("/api/fleet/trips/start", (req, res) => {
  const trip = fleetService.startTrip(req.body.vehicleId, req.body.driverId);
  res.status(201).json(trip);
});

app.post("/api/fleet/trips/end", (req, res) => {
  const trip = fleetService.endTrip(req.body.vehicleId);
  if (!trip) return res.status(404).json({ error: "No active trip" });
  res.json(trip);
});

app.get("/api/fleet/vehicles/:id/health", (req, res) => {
  res.json(fleetService.getVehicleHealth(req.params.id));
});

app.get("/api/fleet/stats/:organizationId", (req, res) => {
  res.json(fleetService.getFleetStats(req.params.organizationId));
});

// --- FUEL ROUTES ---
app.post("/api/fuel/records", (req, res) => {
  const record = fuelService.addRecord(req.body);
  res.status(201).json(record);
});

app.get("/api/fuel/consumption/:vehicleId", (req, res) => {
  res.json(fuelService.getConsumption(req.params.vehicleId, req.query.period as string));
});

app.get("/api/fuel/fleet-consumption", (req, res) => {
  res.json(fuelService.getFleetConsumption(req.query.period as string));
});

app.get("/api/fuel/analytics/:organizationId", (req, res) => {
  res.json(fuelService.getFuelAnalytics(req.params.organizationId));
});

app.get("/api/fuel/refueling-alerts", (req, res) => {
  res.json(fuelService.getRefuelingAlerts());
});

app.get("/api/fuel/savings/:organizationId", (req, res) => {
  res.json(fuelService.getCostSavingsReport(req.params.organizationId));
});

// --- DELIVERY PREDICTION ROUTES ---
app.post("/api/predictions/delivery", (req, res) => {
  const prediction = predictionService.predictDeliveryTime(req.body.order, req.body.weather, req.body.traffic);
  res.json(prediction);
});

app.post("/api/predictions/history", (req, res) => {
  predictionService.addHistoricalData(req.body);
  res.json({ success: true });
});

app.post("/api/predictions/retrain", (req, res) => {
  const model = predictionService.retrainModel();
  res.json(model);
});

app.get("/api/predictions/delay-patterns", (req, res) => {
  res.json(predictionService.getDelayPatterns());
});

// --- SMS ROUTES ---
app.post("/api/sms/send", async (req, res) => {
  const { order, type, language } = req.body;
  const notification = await smsService.sendNotification(order, type, language);
  res.json(notification);
});

app.get("/api/sms/stats", (req, res) => {
  res.json(smsService.getDeliveryStats());
});

// --- HEALTH CHECK ---
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    version: "1.0.0",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`AfriLogistics API running on port ${PORT}`);
  console.log(`WebSocket server ready`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;
