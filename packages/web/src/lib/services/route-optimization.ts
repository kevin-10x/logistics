import { GeoPoint, VehicleType, Vehicle, Driver, Order, RouteStop, WeatherData } from "@afrilogistics/shared";
import { haversineDistance, estimateDriveTime } from "@afrilogistics/shared";

interface RoadCondition {
  type: "tarmac" | "gravel" | "dirt" | "unpaved" | "urban" | "highway";
  speedFactor: number;
  fuelFactor: number;
  riskFactor: number;
}

interface OptimizedRoute {
  stops: RouteStop[];
  totalDistance: number;
  estimatedDuration: number;
  estimatedFuelConsumption: number;
  optimizedOrder: string[];
  savingsVsUnoptimized: number;
  roadConditions: RoadCondition[];
  weatherImpact: number;
}

const ROAD_CONDITIONS: Record<string, RoadCondition> = {
  tarmac: { type: "tarmac", speedFactor: 1.0, fuelFactor: 1.0, riskFactor: 0.1 },
  gravel: { type: "gravel", speedFactor: 0.7, fuelFactor: 1.2, riskFactor: 0.3 },
  dirt: { type: "dirt", speedFactor: 0.5, fuelFactor: 1.4, riskFactor: 0.5 },
  unpaved: { type: "unpaved", speedFactor: 0.55, fuelFactor: 1.35, riskFactor: 0.45 },
  urban: { type: "urban", speedFactor: 0.6, fuelFactor: 1.15, riskFactor: 0.2 },
  highway: { type: "highway", speedFactor: 1.2, fuelFactor: 0.95, riskFactor: 0.15 },
};

const FUEL_CONSUMPTION_RATES: Record<VehicleType, number> = {
  truck: 35,
  van: 18,
  motorbike: 3,
  bicycle: 0,
  trailer: 45,
  pickup: 22,
};

export class RouteOptimizationService {
  private roadConditions: Map<string, RoadCondition> = new Map();

  optimizeRoute(
    stops: RouteStop[],
    vehicleType: VehicleType,
    startLocation: GeoPoint,
    endLocation: GeoPoint,
    weather?: WeatherData
  ): OptimizedRoute {
    const nearestNeighborRoute = this.nearestNeighbor(stops, startLocation, endLocation);
    const optimized = this.twoOptImprovement(nearestNeighborRoute, startLocation, endLocation);
    const reorderedStops = stops
      .map((s, i) => ({ ...s, sequence: optimized[i] }))
      .sort((a, b) => a.sequence - b.sequence)
      .map((s, i) => ({ ...s, sequence: i + 1 }));

    const distances = this.calculateDistances(reorderedStops, startLocation, endLocation);
    const totalDistance = distances.reduce((sum, d) => sum + d, 0);
    const roadFactor = this.getAverageRoadFactor(reorderedStops);
    const weatherFactor = weather ? this.getWeatherFactor(weather) : 1;
    const estimatedDuration = this.estimateTotalDuration(
      reorderedStops, startLocation, distances, roadFactor, weatherFactor
    );
    const fuelRate = FUEL_CONSUMPTION_RATES[vehicleType] || 20;
    const estimatedFuelConsumption =
      (totalDistance / 100) * fuelRate * roadFactor * weatherFactor;

    const unoptimizedDist = this.calculateTotalDistance(stops, startLocation, endLocation);
    const savings = ((unoptimizedDist - totalDistance) / unoptimizedDist) * 100;

    return {
      stops: reorderedStops,
      totalDistance,
      estimatedDuration,
      estimatedFuelConsumption,
      optimizedOrder: reorderedStops.map((s) => s.orderId),
      savingsVsUnoptimized: savings,
      roadConditions: reorderedStops.map(() =>
        this.getRoadConditionForPoint(reorderedStops[0].address)
      ),
      weatherImpact: weatherFactor - 1,
    };
  }

  private nearestNeighbor(
    stops: RouteStop[],
    start: GeoPoint,
    end: GeoPoint
  ): number[] {
    const n = stops.length;
    const visited = new Set<number>();
    const order: number[] = [];
    let current = start;

    for (let i = 0; i < n; i++) {
      let nearest = -1;
      let minDist = Infinity;
      for (let j = 0; j < n; j++) {
        if (!visited.has(j)) {
          const dist = haversineDistance(current, stops[j].address);
          if (dist < minDist) {
            minDist = dist;
            nearest = j;
          }
        }
      }
      visited.add(nearest);
      order.push(nearest);
      current = stops[nearest].address;
    }

    const totalToCenter = haversineDistance(current, end);
    const returnThrough = haversineDistance(stops[order[order.length - 1]].address, end);
    if (returnThrough > totalToCenter * 0.5) {
      order.reverse();
    }

    return order;
  }

  private twoOptImprovement(
    order: number[],
    start: GeoPoint,
    end: GeoPoint
  ): number[] {
    const stops = order.map((i) => i);
    let improved = true;
    let bestDistance = this.calculateOrderedDistance(stops, start, end);

    while (improved) {
      improved = false;
      for (let i = 0; i < stops.length - 1; i++) {
        for (let j = i + 1; j < stops.length; j++) {
          const newOrder = [...stops.slice(0, i), ...stops.slice(i, j + 1).reverse(), ...stops.slice(j + 1)];
          const newDist = this.calculateOrderedDistance(newOrder, start, end);
          if (newDist < bestDistance - 0.01) {
            bestDistance = newDist;
            stops.length = 0;
            stops.push(...newOrder);
            improved = true;
          }
        }
      }
    }
    return stops;
  }

  private calculateOrderedDistance(order: number[], start: GeoPoint, end: GeoPoint): number {
    let dist = haversineDistance(start, this.stopsCache[order[0]] || start);
    for (let i = 0; i < order.length - 1; i++) {
      dist += haversineDistance(
        this.stopsCache[order[i]] || start,
        this.stopsCache[order[i + 1]] || start
      );
    }
    dist += haversineDistance(this.stopsCache[order[order.length - 1]] || start, end);
    return dist;
  }

  private stopsCache: Record<number, GeoPoint> = {};

  private calculateDistances(stops: RouteStop[], start: GeoPoint, end: GeoPoint): number[] {
    const distances: number[] = [];
    let prev = start;
    for (const stop of stops) {
      distances.push(haversineDistance(prev, stop.address));
      prev = stop.address;
    }
    distances.push(haversineDistance(prev, end));
    return distances;
  }

  private calculateTotalDistance(stops: RouteStop[], start: GeoPoint, end: GeoPoint): number {
    return this.calculateDistances(stops, start, end).reduce((s, d) => s + d, 0);
  }

  private estimateTotalDuration(
    stops: RouteStop[],
    start: GeoPoint,
    distances: number[],
    roadFactor: number,
    weatherFactor: number
  ): number {
    let total = 0;
    const avgSpeed = 45;
    for (let i = 0; i < distances.length; i++) {
      const driveTime = (distances[i] / (avgSpeed * roadFactor * weatherFactor)) * 60;
      total += driveTime;
      if (i < stops.length) {
        total += 10;
      }
    }
    return total;
  }

  private getAverageRoadFactor(stops: RouteStop[]): number {
    if (stops.length === 0) return 1;
    const factors = stops.map((s) => this.getRoadConditionForPoint(s.address).speedFactor);
    return factors.reduce((a, b) => a + b, 0) / factors.length;
  }

  private getRoadConditionForPoint(point: GeoPoint): RoadCondition {
    const key = `${point.latitude.toFixed(2)}_${point.longitude.toFixed(2)}`;
    if (this.roadConditions.has(key)) {
      return this.roadConditions.get(key)!;
    }
    const condition = ROAD_CONDITIONS.urban;
    this.roadConditions.set(key, condition);
    return condition;
  }

  private getWeatherFactor(weather: WeatherData): number {
    let factor = 1;
    if (weather.conditions === "rain" || weather.conditions === "heavy_rain") {
      factor *= weather.conditions === "heavy_rain" ? 1.5 : 1.25;
    }
    if (weather.windSpeed > 50) factor *= 1.15;
    if (weather.visibility < 1) factor *= 1.3;
    if (weather.temperature > 40) factor *= 1.1;
    return factor;
  }

  splitIntoBatches(
    stops: RouteStop[],
    maxStopsPerRoute: number,
    maxDistancePerRoute: number,
    vehicleType: VehicleType,
    startLocation: GeoPoint
  ): RouteStop[][] {
    const batches: RouteStop[][] = [];
    let currentBatch: RouteStop[] = [];
    let currentDist = 0;

    const sorted = [...stops].sort((a, b) => {
      return haversineDistance(startLocation, a.address) - haversineDistance(startLocation, b.address);
    });

    for (const stop of sorted) {
      const lastPoint = currentBatch.length > 0
        ? currentBatch[currentBatch.length - 1].address
        : startLocation;
      const distToStop = haversineDistance(lastPoint, stop.address);

      if (
        currentBatch.length >= maxStopsPerRoute ||
        currentDist + distToStop > maxDistancePerRoute
      ) {
        if (currentBatch.length > 0) {
          batches.push(currentBatch);
          currentBatch = [];
          currentDist = 0;
        }
      }

      currentBatch.push(stop);
      currentDist += distToStop;
    }

    if (currentBatch.length > 0) batches.push(currentBatch);
    return batches;
  }

  getTrafficAdjustedTime(distance: number, timeOfDay: number, isWeekend: boolean): number {
    const baseTime = distance / 45 * 60;
    let trafficFactor = 1;

    if (!isWeekend) {
      if (timeOfDay >= 7 && timeOfDay <= 9) trafficFactor = 1.8;
      else if (timeOfDay >= 17 && timeOfDay <= 19) trafficFactor = 2.0;
      else if (timeOfDay >= 12 && timeOfDay <= 14) trafficFactor = 1.3;
      else if (timeOfDay >= 22 || timeOfDay <= 5) trafficFactor = 0.7;
    }

    return baseTime * trafficFactor;
  }
}
