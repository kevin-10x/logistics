import { RouteOptimizationService } from "./route-optimization";
import { WarehouseManagementService } from "./warehouse-management";
import { FleetTrackingService } from "./fleet-tracking";
import { FuelOptimizationService } from "./fuel-optimization";
import { DeliveryPredictionService } from "./delivery-prediction";
import { SmsService } from "./sms-service";
import { OrderService } from "./order-service";

const g = globalThis as any;

export const routeService: RouteOptimizationService = g._routeService ??= new RouteOptimizationService();
export const warehouseService: WarehouseManagementService = g._warehouseService ??= new WarehouseManagementService();
export const fleetService: FleetTrackingService = g._fleetService ??= new FleetTrackingService();
export const fuelService: FuelOptimizationService = g._fuelService ??= new FuelOptimizationService();
export const predictionService: DeliveryPredictionService = g._predictionService ??= new DeliveryPredictionService();
export const smsService: SmsService = g._smsService ??= new SmsService({
  apiKey: process.env.SMS_API_KEY || "",
  baseUrl: process.env.SMS_BASE_URL || "https://api.afrisms.com",
  sendingEnabled: process.env.SMS_ENABLED === "true",
});
export const orderService: OrderService = g._orderService ??= new OrderService();
