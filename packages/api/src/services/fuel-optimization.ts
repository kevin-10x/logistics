import { FuelRecord, FuelConsumption, FuelType, Vehicle, VehicleType } from "@afrilogistics/shared";
import { generateId } from "@afrilogistics/shared";

interface FuelAnalytics {
  totalFuelUsed: number;
  totalFuelCost: number;
  averagePricePerUnit: number;
  costPerKm: number;
  fuelEfficiency: number;
  topConsumers: FuelConsumption[];
  savingsOpportunity: number;
  monthlyTrend: MonthlyFuelData[];
}

interface MonthlyFuelData {
  month: string;
  totalFuel: number;
  totalCost: number;
  totalDistance: number;
  efficiency: number;
}

interface RefuelingAlert {
  vehicleId: string;
  vehicleName: string;
  currentLevel: number;
  estimatedRange: number;
  urgency: "normal" | "warning" | "critical";
  nearestStation?: string;
}

const FUEL_PRICES: Record<FuelType, Record<string, number>> = {
  diesel: { NGN: 614, KES: 189, ZAR: 22.4, GHS: 12.8, TZS: 2800, default: 1.2 },
  petrol: { NGN: 568, KES: 179, ZAR: 21.2, GHS: 11.5, TZS: 2600, default: 1.1 },
  electric: { default: 0.15 },
  lpg: { NGN: 250, KES: 80, default: 0.5 },
};

const CONSUMPTION_RATES: Record<VehicleType, number> = {
  truck: 35,
  van: 18,
  motorbike: 3,
  bicycle: 0,
  trailer: 45,
  pickup: 22,
};

export class FuelOptimizationService {
  private records: FuelRecord[] = [];
  private vehicles: Map<string, Vehicle> = new Map();

  addRecord(record: Omit<FuelRecord, "id" | "createdAt">): FuelRecord {
    const fuelRecord: FuelRecord = {
      ...record,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    this.records.push(fuelRecord);

    const vehicle = this.vehicles.get(record.vehicleId);
    if (vehicle) {
      vehicle.currentFuelLevel = Math.min(vehicle.fuelCapacity, vehicle.currentFuelLevel + record.quantity);
    }

    return fuelRecord;
  }

  getConsumption(vehicleId: string, period: string = "monthly"): FuelConsumption {
    const vehicleRecords = this.records.filter((r) => r.vehicleId === vehicleId);
    const vehicle = this.vehicles.get(vehicleId);

    const periodStart = this.getPeriodStart(period);
    const periodRecords = vehicleRecords.filter(
      (r) => new Date(r.createdAt).getTime() >= periodStart
    );

    const totalFuel = periodRecords.reduce((sum, r) => sum + r.quantity, 0);
    const totalCost = periodRecords.reduce((sum, r) => sum + r.cost, 0);
    const totalDistance = vehicle?.mileage || 0;

    const avgConsumption = totalDistance > 0 ? (totalFuel / totalDistance) * 100 : 0;
    const costPerKm = totalDistance > 0 ? totalCost / totalDistance : 0;

    const expectedRate = vehicle ? CONSUMPTION_RATES[vehicle.type] || 20 : 20;
    const efficiency = avgConsumption > 0 ? (expectedRate / avgConsumption) * 100 : 100;

    const previousPeriodStart = this.getPeriodStart(period, periodStart);
    const previousRecords = vehicleRecords.filter((r) => {
      const t = new Date(r.createdAt).getTime();
      return t >= previousPeriodStart && t < periodStart;
    });
    const prevFuel = previousRecords.reduce((sum, r) => sum + r.quantity, 0);
    const trend =
      totalFuel < prevFuel * 0.95
        ? "improving"
        : totalFuel > prevFuel * 1.05
        ? "declining"
        : "stable";

    return {
      vehicleId,
      period,
      totalFuel,
      totalCost,
      totalDistance,
      averageConsumption: avgConsumption,
      costPerKm,
      efficiency,
      trend,
    };
  }

  getFleetConsumption(period: string = "monthly"): FuelConsumption[] {
    const vehicleIds = new Set(this.records.map((r) => r.vehicleId));
    return Array.from(vehicleIds).map((id) => this.getConsumption(id, period));
  }

  getFuelAnalytics(organizationId: string): FuelAnalytics {
    const orgRecords = this.records.filter((r) => {
      const vehicle = this.vehicles.get(r.vehicleId);
      return vehicle?.organizationId === organizationId;
    });

    const totalFuelUsed = orgRecords.reduce((sum, r) => sum + r.quantity, 0);
    const totalFuelCost = orgRecords.reduce((sum, r) => sum + r.cost, 0);
    const averagePricePerUnit = totalFuelUsed > 0 ? totalFuelCost / totalFuelUsed : 0;

    const topConsumers = this.getFleetConsumption("monthly")
      .sort((a, b) => b.averageConsumption - a.averageConsumption)
      .slice(0, 10);

    const bestEfficiency = Math.min(...topConsumers.map((c) => c.averageConsumption).filter((e) => e > 0));
    const savingsOpportunity = topConsumers.reduce((sum, c) => {
      if (c.averageConsumption > bestEfficiency && bestEfficiency > 0) {
        return sum + (c.averageConsumption - bestEfficiency) * c.totalDistance / 100 * averagePricePerUnit;
      }
      return sum;
    }, 0);

    const monthlyTrend = this.getMonthlyTrend(orgRecords);

    return {
      totalFuelUsed,
      totalFuelCost,
      averagePricePerUnit,
      costPerKm: totalFuelUsed > 0 ? totalFuelCost / (orgRecords.length * 100 || 1) : 0,
      fuelEfficiency: topConsumers.reduce((s, c) => s + c.efficiency, 0) / (topConsumers.length || 1),
      topConsumers,
      savingsOpportunity,
      monthlyTrend,
    };
  }

  getRefuelingAlerts(): RefuelingAlert[] {
    const alerts: RefuelingAlert[] = [];
    for (const vehicle of this.vehicles.values()) {
      if (vehicle.fuelCapacity <= 0) continue;
      const fuelPercent = vehicle.currentFuelLevel / vehicle.fuelCapacity;
      const avgConsumption = CONSUMPTION_RATES[vehicle.type] || 20;
      const estimatedRange = (vehicle.currentFuelLevel / avgConsumption) * 100;

      if (fuelPercent <= 0.15) {
        alerts.push({
          vehicleId: vehicle.id,
          vehicleName: vehicle.name,
          currentLevel: fuelPercent * 100,
          estimatedRange,
          urgency: fuelPercent <= 0.05 ? "critical" : "warning",
        });
      } else if (fuelPercent <= 0.25) {
        alerts.push({
          vehicleId: vehicle.id,
          vehicleName: vehicle.name,
          currentLevel: fuelPercent * 100,
          estimatedRange,
          urgency: "normal",
        });
      }
    }
    return alerts.sort((a, b) => a.currentLevel - b.currentLevel);
  }

  getCostSavingsReport(organizationId: string): {
    currentCost: number;
    optimizedCost: number;
    savings: number;
    recommendations: string[];
  } {
    const analytics = this.getFuelAnalytics(organizationId);
    const recommendations: string[] = [];

    if (analytics.fuelEfficiency < 80) {
      recommendations.push("Driver training could improve fuel efficiency by up to 15%");
    }
    if (analytics.savingsOpportunity > 0) {
      recommendations.push(`Route optimization could save ${Math.round(analytics.savingsOpportunity)} in fuel costs`);
    }

    const highConsumers = analytics.topConsumers.filter((c) => c.efficiency < 70);
    if (highConsumers.length > 0) {
      recommendations.push(`${highConsumers.length} vehicles need maintenance review for fuel efficiency`);
    }

    recommendations.push("Implement speed governors to limit max speed to 90km/h");
    recommendations.push("Schedule refueling during off-peak hours for better prices");

    const optimizedCost = analytics.totalFuelCost * 0.82;

    return {
      currentCost: analytics.totalFuelCost,
      optimizedCost,
      savings: analytics.totalFuelCost - optimizedCost,
      recommendations,
    };
  }

  private getPeriodStart(period: string, before?: number): number {
    const now = before || Date.now();
    const d = new Date(now);
    switch (period) {
      case "daily":
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      case "weekly":
        d.setDate(d.getDate() - d.getDay());
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      case "monthly":
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      case "yearly":
        d.setMonth(0, 1);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      default:
        return 0;
    }
  }

  private getMonthlyTrend(records: FuelRecord[]): MonthlyFuelData[] {
    const monthly = new Map<string, MonthlyFuelData>();
    for (const record of records) {
      const month = record.createdAt.substring(0, 7);
      const existing = monthly.get(month) || {
        month,
        totalFuel: 0,
        totalCost: 0,
        totalDistance: 0,
        efficiency: 0,
      };
      existing.totalFuel += record.quantity;
      existing.totalCost += record.cost;
      existing.totalDistance += record.odometer;
      monthly.set(month, existing);
    }

    return Array.from(monthly.values())
      .map((m) => ({
        ...m,
        efficiency: m.totalDistance > 0 ? (m.totalFuel / m.totalDistance) * 100 : 0,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  registerVehicle(vehicle: Vehicle): void {
    this.vehicles.set(vehicle.id, vehicle);
  }
}
