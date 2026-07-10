import { Vehicle, Driver, GeoPoint, VehicleStatus, Alert } from "@afrilogistics/shared";
import { generateId, haversineDistance } from "@afrilogistics/shared";

interface LocationUpdate {
  vehicleId: string;
  location: GeoPoint;
  speed: number;
  heading: number;
  accuracy: number;
  timestamp: string;
  battery?: number;
  ignition?: boolean;
}

interface GeofenceAlert {
  id: string;
  vehicleId: string;
  driverId?: string;
  type: "entry" | "exit";
  zoneName: string;
  timestamp: string;
  location: GeoPoint;
}

interface TripSummary {
  vehicleId: string;
  driverId: string;
  startTime: string;
  endTime: string;
  startLocation: GeoPoint;
  endLocation: GeoPoint;
  distance: number;
  duration: number;
  avgSpeed: number;
  maxSpeed: number;
  idleTime: number;
  fuelUsed: number;
  stops: number;
  overspeedEvents: number;
}

interface VehicleHealth {
  vehicleId: string;
  score: number;
  issues: VehicleIssue[];
  nextService: string;
  tirePressure: "low" | "normal" | "high";
  batteryHealth: number;
  engineHealth: number;
  brakeHealth: number;
}

interface VehicleIssue {
  severity: "low" | "medium" | "high" | "critical";
  category: string;
  description: string;
  detectedAt: string;
}

const SPEED_LIMITS: Record<string, number> = {
  urban: 50,
  highway: 100,
  residential: 30,
  industrial: 60,
};

const OVERSPEED_THRESHOLD = 1.2;

export class FleetTrackingService {
  private vehicles: Map<string, Vehicle> = new Map();
  private drivers: Map<string, Driver> = new Map();
  private locationHistory: Map<string, LocationUpdate[]> = new Map();
  private activeTrips: Map<string, TripSummary> = new Map();
  private geofences: Map<string, any[]> = new Map();
  private geofenceAlerts: GeofenceAlert[] = [];
  private alerts: Alert[] = [];

  registerVehicle(vehicle: Omit<Vehicle, "id" | "createdAt" | "updatedAt">): Vehicle {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.vehicles.set(newVehicle.id, newVehicle);
    this.locationHistory.set(newVehicle.id, []);
    return newVehicle;
  }

  registerDriver(driver: Omit<Driver, "id" | "createdAt" | "updatedAt" | "totalDeliveries" | "successfulDeliveries" | "averageDeliveryTime" | "rating">): Driver {
    const newDriver: Driver = {
      ...driver,
      id: generateId(),
      totalDeliveries: 0,
      successfulDeliveries: 0,
      averageDeliveryTime: 0,
      rating: 5.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.drivers.set(newDriver.id, newDriver);
    return newDriver;
  }

  updateLocation(vehicleId: string, update: Omit<LocationUpdate, "vehicleId">): LocationUpdate {
    const fullUpdate: LocationUpdate = { ...update, vehicleId };
    const history = this.locationHistory.get(vehicleId) || [];
    history.push(fullUpdate);
    if (history.length > 10000) history.splice(0, history.length - 10000);
    this.locationHistory.set(vehicleId, history);

    const vehicle = this.vehicles.get(vehicleId);
    if (vehicle) {
      vehicle.lastLocation = update.location;
      vehicle.lastLocationUpdate = update.timestamp;
    }

    this.checkSpeedLimit(vehicleId, update);
    this.checkGeofences(vehicleId, update);

    return fullUpdate;
  }

  startTrip(vehicleId: string, driverId: string): TripSummary {
    const vehicle = this.vehicles.get(vehicleId);
    const startLocation = vehicle?.lastLocation || { latitude: 0, longitude: 0 };
    const trip: TripSummary = {
      vehicleId,
      driverId,
      startTime: new Date().toISOString(),
      endTime: "",
      startLocation,
      endLocation: startLocation,
      distance: 0,
      duration: 0,
      avgSpeed: 0,
      maxSpeed: 0,
      idleTime: 0,
      fuelUsed: 0,
      stops: 0,
      overspeedEvents: 0,
    };
    this.activeTrips.set(vehicleId, trip);
    return trip;
  }

  endTrip(vehicleId: string): TripSummary | null {
    const trip = this.activeTrips.get(vehicleId);
    if (!trip) return null;

    const vehicle = this.vehicles.get(vehicleId);
    trip.endLocation = vehicle?.lastLocation || trip.startLocation;
    trip.endTime = new Date().toISOString();
    trip.duration =
      (new Date(trip.endTime).getTime() - new Date(trip.startTime).getTime()) / 1000 / 60;

    const history = this.locationHistory.get(vehicleId) || [];
    if (history.length > 1) {
      let totalDist = 0;
      let totalSpeed = 0;
      let maxSpd = 0;
      let idleTime = 0;
      let speedCount = 0;

      for (let i = 1; i < history.length; i++) {
        totalDist += haversineDistance(history[i - 1].location, history[i].location);
        totalSpeed += history[i].speed;
        speedCount++;
        if (history[i].speed > maxSpd) maxSpd = history[i].speed;
        if (history[i].speed < 2) {
          const gap =
            (new Date(history[i].timestamp).getTime() -
              new Date(history[i - 1].timestamp).getTime()) /
            1000 /
            60;
          idleTime += gap;
        }
      }

      trip.distance = totalDist;
      trip.avgSpeed = speedCount > 0 ? totalSpeed / speedCount : 0;
      trip.maxSpeed = maxSpd;
      trip.idleTime = idleTime;
    }

    this.activeTrips.delete(vehicleId);
    return trip;
  }

  getVehicleLocation(vehicleId: string): LocationUpdate | null {
    const history = this.locationHistory.get(vehicleId) || [];
    return history.length > 0 ? history[history.length - 1] : null;
  }

  getAllVehicleLocations(): { vehicle: Vehicle; location: LocationUpdate | null }[] {
    const result: { vehicle: Vehicle; location: LocationUpdate | null }[] = [];
    for (const vehicle of this.vehicles.values()) {
      const location = this.getVehicleLocation(vehicle.id);
      result.push({ vehicle, location });
    }
    return result;
  }

  getVehicleHistory(vehicleId: string, from: string, to: string): LocationUpdate[] {
    const history = this.locationHistory.get(vehicleId) || [];
    const fromTime = new Date(from).getTime();
    const toTime = new Date(to).getTime();
    return history.filter((h) => {
      const t = new Date(h.timestamp).getTime();
      return t >= fromTime && t <= toTime;
    });
  }

  private checkSpeedLimit(vehicleId: string, update: LocationUpdate): void {
    const limit = SPEED_LIMITS.urban * OVERSPEED_THRESHOLD;
    if (update.speed > limit) {
      const trip = this.activeTrips.get(vehicleId);
      if (trip) trip.overspeedEvents++;

      this.alerts.push({
        id: generateId(),
        organizationId: "",
        type: "speed",
        severity: update.speed > limit * 1.5 ? "critical" : "high",
        title: "Overspeed Alert",
        message: `Vehicle exceeded speed limit: ${Math.round(update.speed)} km/h`,
        vehicleId,
        isRead: false,
        isResolved: false,
        createdAt: update.timestamp,
      });
    }
  }

  private checkGeofences(vehicleId: string, update: LocationUpdate): void {
    const vehicle = this.vehicles.get(vehicleId);
    if (!vehicle) return;

    const fences = this.geofences.get(vehicle.organizationId) || [];
    for (const fence of fences) {
      const dist = haversineDistance(update.location, fence.center);
      const wasInside = fence._wasInside?.[vehicleId] || false;
      const isInside = dist <= fence.radius;

      if (isInside && !wasInside && fence.alertOnEntry) {
        this.geofenceAlerts.push({
          id: generateId(),
          vehicleId,
          type: "entry",
          zoneName: fence.name,
          timestamp: update.timestamp,
          location: update.location,
        });
      } else if (!isInside && wasInside && fence.alertOnExit) {
        this.geofenceAlerts.push({
          id: generateId(),
          vehicleId,
          type: "exit",
          zoneName: fence.name,
          timestamp: update.timestamp,
          location: update.location,
        });
      }

      if (!fence._wasInside) fence._wasInside = {};
      fence._wasInside[vehicleId] = isInside;
    }
  }

  getVehicleHealth(vehicleId: string): VehicleHealth {
    const history = this.locationHistory.get(vehicleId) || [];
    const issues: VehicleIssue[] = [];
    let score = 100;

    const recentHistory = history.slice(-100);
    const avgSpeed = recentHistory.reduce((s, h) => s + h.speed, 0) / (recentHistory.length || 1);
    if (avgSpeed > 80) {
      issues.push({ severity: "medium", category: "driving", description: "High average speed detected", detectedAt: new Date().toISOString() });
      score -= 10;
    }

    const overspeedRatio = recentHistory.filter((h) => h.speed > 80).length / (recentHistory.length || 1);
    if (overspeedRatio > 0.2) {
      issues.push({ severity: "high", category: "driving", description: "Frequent overspeeding", detectedAt: new Date().toISOString() });
      score -= 20;
    }

    return {
      vehicleId,
      score: Math.max(0, score),
      issues,
      nextService: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      tirePressure: "normal",
      batteryHealth: 85,
      engineHealth: 90,
      brakeHealth: 95,
    };
  }

  getFleetStats(organizationId: string) {
    const orgVehicles = Array.from(this.vehicles.values()).filter(
      (v) => v.organizationId === organizationId
    );
    const activeVehicles = orgVehicles.filter((v) => v.status === "active");
    const idleVehicles = orgVehicles.filter((v) => v.status === "idle");
    const maintenanceVehicles = orgVehicles.filter((v) => v.status === "maintenance");

    return {
      totalVehicles: orgVehicles.length,
      activeVehicles: activeVehicles.length,
      idleVehicles: idleVehicles.length,
      maintenanceVehicles: maintenanceVehicles.length,
      offlineVehicles: orgVehicles.filter((v) => v.status === "offline").length,
      totalDrivers: Array.from(this.drivers.values()).filter(
        (d) => d.organizationId === organizationId
      ).length,
      availableDrivers: Array.from(this.drivers.values()).filter(
        (d) => d.organizationId === organizationId && d.isAvailable
      ).length,
      activeTrips: this.activeTrips.size,
      recentAlerts: this.alerts
        .filter((a) => a.organizationId === organizationId)
        .slice(-10)
        .reverse(),
    };
  }
}
