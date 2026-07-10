import { DeliveryPrediction, PredictionFactor, Order, GeoPoint, VehicleType } from "@afrilogistics/shared";
import { generateId, haversineDistance } from "@afrilogistics/shared";

interface HistoricalDelivery {
  orderId: string;
  origin: GeoPoint;
  destination: GeoPoint;
  vehicleType: VehicleType;
  distance: number;
  scheduledTime: string;
  actualTime: string;
  wasOnTime: boolean;
  weather: string;
  dayOfWeek: number;
  hourOfDay: number;
  trafficLevel: string;
}

interface PredictionModel {
  weights: Record<string, number>;
  bias: number;
  accuracy: number;
  trainedAt: string;
  sampleSize: number;
}

interface DelayPattern {
  route: string;
  averageDelay: number;
  frequency: number;
  commonCauses: string[];
}

export class DeliveryPredictionService {
  private history: HistoricalDelivery[] = [];
  private model: PredictionModel = {
    weights: {
      distance: 0.35,
      weather: 0.15,
      traffic: 0.2,
      timeOfDay: 0.1,
      dayOfWeek: 0.05,
      vehicleType: 0.1,
      routeFamiliarity: 0.05,
    },
    bias: 0,
    accuracy: 0.78,
    trainedAt: new Date().toISOString(),
    sampleSize: 0,
  };

  predictDeliveryTime(
    order: {
      origin: GeoPoint;
      destination: GeoPoint;
      vehicleType: VehicleType;
      scheduledDeparture?: string;
    },
    weather?: { conditions: string; temperature: number },
    traffic?: { level: string; duration: number }
  ): DeliveryPrediction {
    const distance = haversineDistance(order.origin, order.destination);
    const departure = order.scheduledDeparture || new Date().toISOString();
    const depDate = new Date(departure);

    const weatherScore = this.getWeatherScore(weather);
    const trafficScore = this.getTrafficScore(traffic);
    const timeOfDayScore = this.getTimeOfDayScore(depDate.getHours());
    const dayOfWeekScore = this.getDayOfWeekScore(depDate.getDay());
    const vehicleScore = this.getVehicleScore(order.vehicleType);
    const distanceScore = Math.min(distance / 500, 1);

    const baseTimeHours = distance / 45;
    const adjustedTime =
      baseTimeHours *
      (1 + (weatherScore + trafficScore + timeOfDayScore + dayOfWeekScore + vehicleScore) * 0.1);

    const confidence = this.calculateConfidence(distance, weather, traffic);
    const delayProbability = this.calculateDelayProbability(distance, weather, traffic, depDate);

    const estimatedArrival = new Date(
      depDate.getTime() + adjustedTime * 60 * 60 * 1000
    ).toISOString();

    const factors: PredictionFactor[] = [
      { name: "Distance", impact: distanceScore, description: `${Math.round(distance)} km route` },
      { name: "Weather", impact: weatherScore, description: weather?.conditions || "Clear" },
      { name: "Traffic", impact: trafficScore, description: traffic?.level || "Normal" },
      { name: "Time of Day", impact: timeOfDayScore, description: this.getTimeLabel(depDate.getHours()) },
      { name: "Vehicle Type", impact: vehicleScore, description: order.vehicleType },
    ];

    const alternativeTimeSlots = this.generateAlternativeSlots(depDate, adjustedTime);

    return {
      orderId: generateId(),
      estimatedArrival,
      confidence,
      factors,
      riskLevel: delayProbability > 0.4 ? "high" : delayProbability > 0.2 ? "medium" : "low",
      alternativeTimeSlots,
      delayProbability,
      weatherImpact: weatherScore,
      trafficImpact: trafficScore,
      historicalAccuracy: this.model.accuracy,
    };
  }

  addHistoricalData(delivery: HistoricalDelivery): void {
    this.history.push(delivery);
    if (this.history.length > 10000) {
      this.history.splice(0, this.history.length - 10000);
    }
  }

  retrainModel(): PredictionModel {
    if (this.history.length < 10) return this.model;

    let totalError = 0;
    const correctPredictions = this.history.filter((d) => d.wasOnTime).length;
    this.model.accuracy = correctPredictions / this.history.length;
    this.model.sampleSize = this.history.length;
    this.model.trainedAt = new Date().toISOString();

    const weights = { ...this.model.weights };
    for (const key of Object.keys(weights)) {
      const correlation = this.calculateCorrelation(key);
      weights[key] = correlation;
    }

    const totalWeight = Object.values(weights).reduce((s, w) => s + Math.abs(w), 0);
    if (totalWeight > 0) {
      for (const key of Object.keys(weights)) {
        weights[key] = Math.abs(weights[key]) / totalWeight;
      }
    }

    this.model.weights = weights;
    return this.model;
  }

  private calculateCorrelation(factor: string): number {
    if (this.history.length < 5) return this.model.weights[factor] || 0;
    const values = this.history.map((h) => {
      switch (factor) {
        case "distance": return h.distance / 500;
        case "weather": return h.weather === "rain" ? 0.8 : h.weather === "heavy_rain" ? 1 : 0.2;
        case "traffic": return h.trafficLevel === "heavy" ? 0.9 : h.trafficLevel === "moderate" ? 0.5 : 0.2;
        case "timeOfDay": return h.hourOfDay >= 7 && h.hourOfDay <= 9 ? 0.8 : h.hourOfDay >= 17 && h.hourOfDay <= 19 ? 0.9 : 0.3;
        case "dayOfWeek": return h.dayOfWeek === 0 || h.dayOfWeek === 6 ? 0.3 : 0.6;
        default: return 0.5;
      }
    });
    const onTime = this.history.map((h) => (h.wasOnTime ? 1 : 0));
    return this.pearsonCorrelation(values, onTime);
  }

  private pearsonCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    if (n < 2) return 0;
    const meanX = x.reduce((s, v) => s + v, 0) / n;
    const meanY = y.reduce((s, v) => s + v, 0) / n;
    let num = 0, denX = 0, denY = 0;
    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }
    const den = Math.sqrt(denX * denY);
    return den > 0 ? num / den : 0;
  }

  private getWeatherScore(weather?: { conditions: string; temperature: number }): number {
    if (!weather) return 0.3;
    let score = 0.2;
    if (weather.conditions === "rain") score = 0.5;
    else if (weather.conditions === "heavy_rain") score = 0.8;
    else if (weather.conditions === "storm") score = 0.9;
    else if (weather.conditions === "fog") score = 0.6;
    if (weather.temperature > 38) score += 0.1;
    return Math.min(score, 1);
  }

  private getTrafficScore(traffic?: { level: string; duration: number }): number {
    if (!traffic) return 0.4;
    const levels: Record<string, number> = {
      free_flow: 0.1, light: 0.2, moderate: 0.5, heavy: 0.8, severe: 1.0,
    };
    return levels[traffic.level] || 0.4;
  }

  private getTimeOfDayScore(hour: number): number {
    if (hour >= 7 && hour <= 9) return 0.7;
    if (hour >= 17 && hour <= 19) return 0.8;
    if (hour >= 12 && hour <= 14) return 0.4;
    if (hour >= 22 || hour <= 5) return 0.1;
    return 0.3;
  }

  private getDayOfWeekScore(day: number): number {
    if (day === 0 || day === 6) return 0.2;
    if (day === 5) return 0.6;
    return 0.4;
  }

  private getVehicleScore(type: VehicleType): number {
    const scores: Record<VehicleType, number> = {
      motorbike: 0.2, bicycle: 0.5, pickup: 0.3, van: 0.35, truck: 0.5, trailer: 0.6,
    };
    return scores[type] || 0.4;
  }

  private calculateConfidence(distance: number, weather?: any, traffic?: any): number {
    let confidence = 0.85;
    if (this.history.length > 100) confidence += 0.05;
    if (distance < 50) confidence += 0.05;
    else if (distance > 200) confidence -= 0.1;
    if (weather?.conditions === "heavy_rain" || weather?.conditions === "storm") confidence -= 0.15;
    if (traffic?.level === "severe") confidence -= 0.1;
    return Math.max(0.3, Math.min(0.98, confidence));
  }

  private calculateDelayProbability(
    distance: number,
    weather?: any,
    traffic?: any,
    date?: Date
  ): number {
    let prob = 0.15;
    if (distance > 100) prob += 0.1;
    if (distance > 300) prob += 0.1;
    if (weather?.conditions === "rain") prob += 0.15;
    if (weather?.conditions === "heavy_rain") prob += 0.25;
    if (traffic?.level === "heavy") prob += 0.2;
    if (traffic?.level === "severe") prob += 0.3;
    if (date) {
      const hour = date.getHours();
      if (hour >= 7 && hour <= 9) prob += 0.1;
      if (hour >= 17 && hour <= 19) prob += 0.15;
      if (date.getDay() === 5) prob += 0.05;
    }
    return Math.min(prob, 0.95);
  }

  private generateAlternativeSlots(departure: Date, travelHours: number): string[] {
    const slots: string[] = [];
    const alternatives = [
      { hourOffset: -2, label: "2 hours earlier" },
      { hourOffset: 2, label: "2 hours later" },
      { hourOffset: -4, label: "Early morning (5 AM)" },
      { hourOffset: 0, label: "Late evening (8 PM)" },
    ];
    for (const alt of alternatives) {
      const slot = new Date(departure.getTime() + alt.hourOffset * 60 * 60 * 1000);
      if (slot.getTime() > Date.now()) {
        slots.push(slot.toISOString());
      }
    }
    return slots;
  }

  private getTimeLabel(hour: number): string {
    if (hour >= 5 && hour < 12) return "Morning";
    if (hour >= 12 && hour < 17) return "Afternoon";
    if (hour >= 17 && hour < 21) return "Evening";
    return "Night";
  }

  getDelayPatterns(): DelayPattern[] {
    const patterns: DelayPattern[] = [];
    const routeMap = new Map<string, HistoricalDelivery[]>();
    for (const h of this.history) {
      const key = `${h.origin.latitude.toFixed(1)}_${h.destination.latitude.toFixed(1)}`;
      const arr = routeMap.get(key) || [];
      arr.push(h);
      routeMap.set(key, arr);
    }
    for (const [route, deliveries] of routeMap) {
      if (deliveries.length < 3) continue;
      const lateDeliveries = deliveries.filter((d) => !d.wasOnTime);
      if (lateDeliveries.length > 0) {
        const avgDelay = lateDeliveries.reduce((s, d) => {
          return s + (new Date(d.actualTime).getTime() - new Date(d.scheduledTime).getTime()) / 3600000;
        }, 0) / lateDeliveries.length;
        patterns.push({
          route,
          averageDelay: avgDelay,
          frequency: lateDeliveries.length / deliveries.length,
          commonCauses: this.identifyCauses(lateDeliveries),
        });
      }
    }
    return patterns.sort((a, b) => b.frequency - a.frequency);
  }

  private identifyCauses(deliveries: HistoricalDelivery[]): string[] {
    const causes: string[] = [];
    const weatherDelays = deliveries.filter((d) => d.weather === "rain" || d.weather === "heavy_rain");
    if (weatherDelays.length > deliveries.length * 0.3) causes.push("Weather conditions");
    const peakHourDelays = deliveries.filter((d) => d.hourOfDay >= 7 && d.hourOfDay <= 9 || d.hourOfDay >= 17 && d.hourOfDay <= 19);
    if (peakHourDelays.length > deliveries.length * 0.4) causes.push("Peak hour traffic");
    const longDistanceDelays = deliveries.filter((d) => d.distance > 200);
    if (longDistanceDelays.length > deliveries.length * 0.3) causes.push("Long distance");
    return causes.length > 0 ? causes : ["Unknown factors"];
  }
}
