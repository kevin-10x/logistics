export type VehicleType = "truck" | "van" | "motorbike" | "bicycle" | "trailer" | "pickup";
export type VehicleStatus = "active" | "idle" | "maintenance" | "offline" | "retired";
export type OrderStatus = "pending" | "assigned" | "picked_up" | "in_transit" | "out_for_delivery" | "delivered" | "failed" | "returned";
export type WarehouseZone = "receiving" | "storage" | "picking" | "packing" | "dispatch" | "returns";
export type PaymentMethod = "cash" | "momo" | "airtel_money" | "mpesa" | "bank_transfer" | "card" | "cod";
export type FuelType = "diesel" | "petrol" | "electric" | "lpg";
export type AlertSeverity = "low" | "medium" | "high" | "critical";
export type UserRole = "admin" | "dispatcher" | "driver" | "warehouse_manager" | "warehouse_staff" | "viewer";

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  landmark?: string;
  coordinates: GeoPoint;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  organizationId: string;
  language: "en" | "fr" | "sw" | "ha" | "yo" | "zu" | "am" | "ar" | "pt";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  country: string;
  currency: string;
  timezone: string;
  phone: string;
  email: string;
  subscription: "free" | "starter" | "pro" | "enterprise";
  createdAt: string;
}

export interface Vehicle {
  id: string;
  organizationId: string;
  name: string;
  plateNumber: string;
  type: VehicleType;
  status: VehicleStatus;
  fuelType: FuelType;
  fuelCapacity: number;
  currentFuelLevel: number;
  mileage: number;
  maxLoadWeight: number;
  maxLoadVolume: number;
  year: number;
  make: string;
  model: string;
  driverId?: string;
  lastLocation?: GeoPoint;
  lastLocationUpdate?: string;
  insuranceExpiry?: string;
  registrationExpiry?: string;
  nextMaintenanceDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  id: string;
  organizationId: string;
  userId: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  rating: number;
  totalDeliveries: number;
  successfulDeliveries: number;
  averageDeliveryTime: number;
  vehicleId?: string;
  isAvailable: boolean;
  currentLocation?: GeoPoint;
  homeAddress?: Address;
  emergencyContact?: { name: string; phone: string };
  createdAt: string;
  updatedAt: string;
}

export interface Route {
  id: string;
  organizationId: string;
  name: string;
  vehicleId: string;
  driverId: string;
  status: "planned" | "active" | "completed" | "cancelled";
  stops: RouteStop[];
  totalDistance: number;
  estimatedDuration: number;
  actualDuration?: number;
  estimatedFuelConsumption: number;
  actualFuelConsumption?: number;
  totalOrders: number;
  completedOrders: number;
  startedAt?: string;
  completedAt?: string;
  optimizedOrder: number[];
  createdAt: string;
}

export interface RouteStop {
  id: string;
  orderId: string;
  sequence: number;
  address: GeoPoint;
  addressLabel: string;
  arrivalTime?: string;
  departureTime?: string;
  status: "pending" | "arrived" | "delivered" | "skipped" | "failed";
  signatureUrl?: string;
  photoUrl?: string;
  notes?: string;
  distanceFromPrevious: number;
  timeFromPrevious: number;
}

export interface Order {
  id: string;
  organizationId: string;
  orderNumber: string;
  senderName: string;
  senderPhone: string;
  senderAddress: Address;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: Address;
  description: string;
  weight: number;
  volume: number;
  declaredValue: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: "pending" | "paid" | "refunded";
  status: OrderStatus;
  priority: "normal" | "high" | "urgent";
  vehicleType: VehicleType;
  routeId?: string;
  driverId?: string;
  warehouseId?: string;
  currentWarehouseId?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  deliveryNotes?: string;
  proofOfDelivery?: { signatureUrl: string; photoUrl: string; notes: string };
  smsNotifications: SmsNotification[];
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  address: Address;
  capacity: number;
  currentOccupancy: number;
  zones: WarehouseZone[];
  managerId?: string;
  phone: string;
  operatingHours: { open: string; close: string };
  isActive: boolean;
  createdAt: string;
}

export interface WarehouseBin {
  id: string;
  warehouseId: string;
  zone: WarehouseZone;
  code: string;
  aisle: string;
  rack: string;
  level: string;
  position: string;
  capacity: number;
  currentOccupancy: number;
  maxWeight: number;
  currentWeight: number;
  isActive: boolean;
}

export interface InventoryItem {
  id: string;
  warehouseId: string;
  binId?: string;
  orderId: string;
  sku: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  weight: number;
  status: "received" | "stored" | "picking" | "packed" | "dispatched" | "returned";
  receivedAt: string;
  storedAt?: string;
  dispatchedAt?: string;
  expiryDate?: string;
  batchNumber?: string;
  serialNumbers?: string[];
}

export interface FuelRecord {
  id: string;
  vehicleId: string;
  organizationId: string;
  fuelType: FuelType;
  quantity: number;
  cost: number;
  currency: string;
  pricePerUnit: number;
  odometer: number;
  station?: string;
  paymentMethod: PaymentMethod;
  recordedBy: string;
  receiptUrl?: string;
  createdAt: string;
}

export interface FuelConsumption {
  vehicleId: string;
  period: string;
  totalFuel: number;
  totalCost: number;
  totalDistance: number;
  averageConsumption: number;
  costPerKm: number;
  efficiency: number;
  trend: "improving" | "stable" | "declining";
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: "scheduled" | "repair" | "emergency" | "inspection";
  description: string;
  cost: number;
  currency: string;
  odometer: number;
  startDate: string;
  endDate?: string;
  vendor?: string;
  parts: { name: string; cost: number }[];
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
}

export interface DeliveryPrediction {
  orderId: string;
  estimatedArrival: string;
  confidence: number;
  factors: PredictionFactor[];
  riskLevel: "low" | "medium" | "high";
  alternativeTimeSlots?: string[];
  delayProbability: number;
  weatherImpact: number;
  trafficImpact: number;
  historicalAccuracy: number;
}

export interface PredictionFactor {
  name: string;
  impact: number;
  description: string;
}

export interface Geofence {
  id: string;
  name: string;
  type: "warehouse" | "delivery_zone" | "restricted" | "depot";
  center: GeoPoint;
  radius: number;
  polygon?: GeoPoint[];
  organizationId: string;
  alertOnEntry: boolean;
  alertOnExit: boolean;
  isActive: boolean;
}

export interface Alert {
  id: string;
  organizationId: string;
  type: "geofence" | "fuel" | "maintenance" | "delivery" | "theft" | "speed" | "temperature";
  severity: AlertSeverity;
  title: string;
  message: string;
  vehicleId?: string;
  driverId?: string;
  orderId?: string;
  isRead: boolean;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface SmsNotification {
  id: string;
  orderId: string;
  phone: string;
  message: string;
  type: "confirmation" | "update" | "delivery" | "payment" | "otp";
  status: "pending" | "sent" | "delivered" | "failed";
  sentAt?: string;
  createdAt: string;
}

export interface Analytics {
  totalOrders: number;
  deliveredOrders: number;
  failedOrders: number;
  onTimeDeliveryRate: number;
  averageDeliveryTime: number;
  totalRevenue: number;
  totalFuelCost: number;
  costPerDelivery: number;
  activeVehicles: number;
  activeDrivers: number;
  warehouseUtilization: number;
  customerSatisfaction: number;
}

export interface MapCluster {
  latitude: number;
  longitude: number;
  count: number;
  points: GeoPoint[];
}

export interface WeatherData {
  location: GeoPoint;
  temperature: number;
  humidity: number;
  conditions: string;
  windSpeed: number;
  visibility: number;
  forecast: WeatherForecast[];
}

export interface WeatherForecast {
  date: string;
  temperature: { min: number; max: number };
  conditions: string;
  rainProbability: number;
}

export interface TrafficData {
  from: GeoPoint;
  to: GeoPoint;
  duration: number;
  distance: number;
  trafficLevel: "free_flow" | "light" | "moderate" | "heavy" | "severe";
  incidents: string[];
}
