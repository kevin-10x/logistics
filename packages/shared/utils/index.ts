import { GeoPoint } from "../types";

export function haversineDistance(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function estimateDriveTime(distanceKm: number, vehicleType: string): number {
  const speeds: Record<string, number> = {
    truck: 45,
    van: 55,
    motorbike: 35,
    bicycle: 15,
    trailer: 40,
    pickup: 50,
  };
  const avgSpeed = speeds[vehicleType] || 45;
  const africaRoadFactor = 0.75;
  return (distanceKm / (avgSpeed * africaRoadFactor)) * 60;
}

export function formatCurrency(amount: number, currency: string): string {
  const formatters: Record<string, Intl.NumberFormat> = {
    NGN: new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }),
    KES: new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }),
    ZAR: new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }),
    GHS: new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }),
    TZS: new Intl.NumberFormat("en-TZ", { style: "currency", currency: "TZS" }),
    UGX: new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX" }),
    EGP: new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP" }),
    XOF: new Intl.NumberFormat("fr-SN", { style: "currency", currency: "XOF" }),
    XAF: new Intl.NumberFormat("fr-CM", { style: "currency", currency: "XAF" }),
    ETB: new Intl.NumberFormat("en-ET", { style: "currency", currency: "ETB" }),
    MAD: new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD" }),
    USD: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
  };
  return (formatters[currency] || formatters.USD).format(amount);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function generateOrderNumber(prefix: string = "AL"): string {
  const date = new Date();
  const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${datePart}-${randomPart}`;
}

export function isPointInCircle(point: GeoPoint, center: GeoPoint, radiusKm: number): boolean {
  return haversineDistance(point, center) <= radiusKm;
}

export function isPointInPolygon(point: GeoPoint, polygon: GeoPoint[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].latitude, yi = polygon[i].longitude;
    const xj = polygon[j].latitude, yj = polygon[j].longitude;
    const intersect =
      yi > point.longitude !== yj > point.longitude &&
      point.latitude < ((xj - xi) * (point.longitude - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function getBearing(a: GeoPoint, b: GeoPoint): number {
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return ((toRad(360) + Math.atan2(y, x)) % toRad(360)) * (180 / Math.PI);
}

export function interpolatePoint(a: GeoPoint, b: GeoPoint, fraction: number): GeoPoint {
  return {
    latitude: a.latitude + (b.latitude - a.latitude) * fraction,
    longitude: a.longitude + (b.longitude - a.longitude) * fraction,
  };
}

export function calculateBoundingBox(points: GeoPoint[]): {
  north: number; south: number; east: number; west: number;
} {
  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  return {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    west: Math.min(...lngs),
  };
}

export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}

export function throttle<T extends (...args: any[]) => any>(fn: T, limit: number): T {
  let inThrottle: boolean;
  return ((...args: any[]) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
}
