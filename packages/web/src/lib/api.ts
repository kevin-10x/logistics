const API_BASE = "";

async function request(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

export const api = {
  getOrders: (orgId: string, status?: string) =>
    request(`/api/orders?organizationId=${orgId}${status ? `&status=${status}` : ""}`),
  getOrder: (id: string) => request(`/api/orders/${id}`),
  createOrder: (data: any) => request("/api/orders", { method: "POST", body: JSON.stringify(data) }),
  updateOrderStatus: (id: string, status: string, notes?: string) =>
    request(`/api/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, notes }) }),
  trackOrder: (id: string) => request(`/api/orders/${id}/track`),
  getOrderStats: (orgId: string) => request(`/api/orders/stats/${orgId}`),

  optimizeRoute: (data: any) => request("/api/routes/optimize", { method: "POST", body: JSON.stringify(data) }),
  splitBatches: (data: any) => request("/api/routes/split-batches", { method: "POST", body: JSON.stringify(data) }),

  getWarehouseStats: (id: string) => request(`/api/warehouses/${id}/stats`),
  receiveItem: (warehouseId: string, data: any) =>
    request(`/api/warehouses/${warehouseId}/receive`, { method: "POST", body: JSON.stringify(data) }),
  moveItem: (warehouseId: string, data: any) =>
    request(`/api/warehouses/${warehouseId}/move`, { method: "POST", body: JSON.stringify(data) }),
  searchInventory: (warehouseId: string, q: string) =>
    request(`/api/warehouses/${warehouseId}/search?q=${encodeURIComponent(q)}`),

  getFleetLocations: () => request("/api/fleet/locations"),
  getFleetStats: (orgId: string) => request(`/api/fleet/stats/${orgId}`),
  getVehicleHealth: (id: string) => request(`/api/fleet/vehicles/${id}/health`),

  getFuelAnalytics: (orgId: string) => request(`/api/fuel/analytics/${orgId}`),
  getRefuelingAlerts: () => request("/api/fuel/refueling-alerts"),
  getSavingsReport: (orgId: string) => request(`/api/fuel/savings/${orgId}`),

  predictDelivery: (data: any) => request("/api/predictions/delivery", { method: "POST", body: JSON.stringify(data) }),
  getDelayPatterns: () => request("/api/predictions/delay-patterns"),
};
