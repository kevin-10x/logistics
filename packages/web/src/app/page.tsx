"use client";

import { useState, useEffect } from "react";
import {
  Truck, Package, Warehouse, Fuel, Route, BarChart3, Bell, Users,
  MapPin, Clock, TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Search, ChevronRight, Menu, X, Globe, Settings, Home, Navigation,
  Box, Activity, Zap, Calendar
} from "lucide-react";

const MOCK_STATS = {
  totalOrders: 1247,
  deliveredOrders: 1108,
  pendingOrders: 89,
  inTransitOrders: 50,
  onTimeRate: 94.2,
  activeVehicles: 34,
  totalDrivers: 42,
  warehouseUtilization: 72.5,
  totalRevenue: 15680000,
  fuelCosts: 2340000,
  costPerDelivery: 1874,
  avgDeliveryTime: 4.2,
};

const MOCK_VEHICLES = [
  { id: "V001", name: "Lagos Express", plate: "LAG-123-AB", type: "truck", status: "active", driver: "Chidi Okafor", lat: 6.5244, lng: 3.3792, speed: 65, fuel: 72 },
  { id: "V002", name: "Nairobi Runner", plate: "NAI-456-CD", type: "van", status: "active", driver: "James Mwangi", lat: -1.2921, lng: 36.8219, speed: 45, fuel: 58 },
  { id: "V003", name: "Cairo Cruiser", plate: "CAI-789-EF", type: "truck", status: "idle", driver: "Ahmed Hassan", lat: 30.0444, lng: 31.2357, speed: 0, fuel: 91 },
  { id: "V004", name: "Accra Swift", plate: "ACC-012-GH", type: "motorbike", status: "active", driver: "Kwame Asante", lat: 5.6037, lng: -0.1870, speed: 38, fuel: 45 },
  { id: "V005", name: "Joburg Hauler", plate: "JOB-345-IJ", type: "trailer", status: "maintenance", driver: "Sipho Dlamini", lat: -26.2041, lng: 28.0473, speed: 0, fuel: 33 },
  { id: "V006", name: "Dar Express", plate: "DAR-678-KL", type: "pickup", status: "active", driver: "John Mwakasege", lat: -6.7924, lng: 39.2083, speed: 52, fuel: 61 },
  { id: "V007", name: "Lusaka Link", plate: "LUS-901-MN", type: "van", status: "active", driver: "Grace Phiri", lat: -15.3875, lng: 28.3228, speed: 40, fuel: 68 },
  { id: "V008", name: "Addis Runner", plate: "ADD-234-OP", type: "motorbike", status: "active", driver: "Dawit Tesfaye", lat: 9.0250, lng: 38.7469, speed: 30, fuel: 82 },
];

const MOCK_ORDERS = [
  { id: "ORD-20260710-A1B2C3", receiver: "Fatima Al-Hassan", phone: "+234 801 234 5678", destination: "Lagos Island, Lagos", status: "in_transit", vehicle: "V001", eta: "2h 15m", priority: "high" },
  { id: "ORD-20260710-D4E5F6", receiver: "Peter Ochieng", phone: "+254 712 345 678", destination: "Westlands, Nairobi", status: "out_for_delivery", vehicle: "V002", eta: "45m", priority: "urgent" },
  { id: "ORD-20260710-G7H8I9", receiver: "Yuki Tanaka", phone: "+233 24 567 8901", destination: "Osu, Accra", status: "delivered", vehicle: "V004", eta: "Delivered", priority: "normal" },
  { id: "ORD-20260710-J0K1L2", receiver: "Mandla Zulu", phone: "+27 82 345 6789", destination: "Sandton, Johannesburg", status: "pending", vehicle: null, eta: "Unassigned", priority: "normal" },
  { id: "ORD-20260710-M3N4O5", receiver: "Aisha Ibrahim", phone: "+255 754 321 098", destination: "Kinondoni, Dar es Salaam", status: "in_transit", vehicle: "V006", eta: "1h 30m", priority: "high" },
  { id: "ORD-20260710-P6Q7R8", receiver: "Samuel Adeyemi", phone: "+234 803 456 7890", destination: "Victoria Island, Lagos", status: "assigned", vehicle: "V003", eta: "4h 00m", priority: "normal" },
];

const COUNTRIES = ["Nigeria", "Kenya", "South Africa", "Ghana", "Tanzania", "Uganda", "Ethiopia", "Senegal", "Morocco", "Cameroon", "Zambia", "Rwanda", "Cote d'Ivoire"];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "badge-green", idle: "badge-yellow", maintenance: "badge-red", offline: "badge-red",
    delivered: "badge-green", in_transit: "badge-blue", pending: "badge-yellow", failed: "badge-red",
    out_for_delivery: "badge-blue", assigned: "badge-yellow", returned: "badge-red",
  };
  return <span className={`badge ${styles[status] || "badge-blue"}`}>{status.replace(/_/g, " ")}</span>;
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = { urgent: "badge-red", high: "badge-yellow", normal: "badge-blue" };
  return <span className={`badge ${styles[priority] || "badge-blue"}`}>{priority}</span>;
}

function StatCard({ icon: Icon, label, value, change, changeType, color }: {
  icon: any; label: string; value: string | number; change?: string; changeType?: "up" | "down"; color: string;
}) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <div className={`flex items-center text-sm ${changeType === "up" ? "text-green-600" : "text-red-600"}`}>
            {changeType === "up" ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {change}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold">{typeof value === "number" ? value.toLocaleString() : value}</p>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
      </div>
    </div>
  );
}

function FleetMap({ vehicles }: { vehicles: typeof MOCK_VEHICLES }) {
  const [selected, setSelected] = useState<typeof MOCK_VEHICLES[0] | null>(null);
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Fleet Tracking</h3>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500" /> Active
          <span className="w-3 h-3 rounded-full bg-yellow-500 ml-2" /> Idle
          <span className="w-3 h-3 rounded-full bg-red-500 ml-2" /> Issue
        </div>
      </div>
      <div className="relative bg-gradient-to-br from-emerald-50 to-blue-50 rounded-lg h-80 overflow-hidden border border-gray-200">
        <div className="absolute inset-0 opacity-20">
          <svg viewBox="0 0 800 400" className="w-full h-full">
            <path d="M50,200 Q200,100 400,200 Q600,300 750,180" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="8,4" />
            <path d="M100,300 Q300,150 500,280 Q700,100 800,250" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="6,3" />
          </svg>
        </div>
        {vehicles.map((v, i) => {
          const x = 10 + (i * 12) + (i % 3) * 5;
          const y = 15 + (i % 4) * 20 + (i * 3) % 10;
          const statusColor = v.status === "active" ? "bg-green-500" : v.status === "idle" ? "bg-yellow-500" : "bg-red-500";
          return (
            <div key={v.id} className="absolute cursor-pointer group" style={{ left: `${x}%`, top: `${y}%` }}
              onClick={() => setSelected(selected?.id === v.id ? null : v)}>
              <div className={`w-4 h-4 rounded-full ${statusColor} border-2 border-white shadow-lg animate-pulse`} />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">{v.name}</div>
              </div>
            </div>
          );
        })}
        {selected && (
          <div className="absolute right-4 top-4 bg-white rounded-lg shadow-lg p-4 w-64 z-20">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-semibold">{selected.name}</h4>
              <button onClick={() => setSelected(null)}><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Plate</span><span>{selected.plate}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Driver</span><span>{selected.driver}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Speed</span><span>{selected.speed} km/h</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Fuel</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${selected.fuel > 50 ? "bg-green-500" : selected.fuel > 25 ? "bg-yellow-500" : "bg-red-500"}`}
                      style={{ width: `${selected.fuel}%` }} />
                  </div>
                  <span>{selected.fuel}%</span>
                </div>
              </div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><StatusBadge status={selected.status} /></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OrderTable({ orders }: { orders: typeof MOCK_ORDERS }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Orders</h3>
        <button className="btn-primary text-sm flex items-center gap-2"><Package className="w-4 h-4" /> New Order</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 border-b">
              <th className="pb-3 font-medium">Order ID</th>
              <th className="pb-3 font-medium">Receiver</th>
              <th className="pb-3 font-medium">Destination</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Priority</th>
              <th className="pb-3 font-medium">ETA</th>
              <th className="pb-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="py-3 text-sm font-mono">{order.id}</td>
                <td className="py-3">
                  <div className="text-sm font-medium">{order.receiver}</div>
                  <div className="text-xs text-gray-500">{order.phone}</div>
                </td>
                <td className="py-3 text-sm">{order.destination}</td>
                <td className="py-3"><StatusBadge status={order.status} /></td>
                <td className="py-3"><PriorityBadge priority={order.priority} /></td>
                <td className="py-3 text-sm">{order.eta}</td>
                <td className="py-3"><ChevronRight className="w-4 h-4 text-gray-400" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WarehouseOverview() {
  const zones = [
    { name: "Receiving", items: 45, capacity: 100, color: "bg-blue-500" },
    { name: "Storage", items: 280, capacity: 400, color: "bg-emerald-500" },
    { name: "Picking", items: 32, capacity: 75, color: "bg-yellow-500" },
    { name: "Packing", items: 18, capacity: 50, color: "bg-purple-500" },
    { name: "Dispatch", items: 67, capacity: 100, color: "bg-orange-500" },
  ];
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Warehouse Overview</h3>
      <div className="space-y-4">
        {zones.map((z) => (
          <div key={z.name}>
            <div className="flex justify-between text-sm mb-1">
              <span>{z.name}</span>
              <span className="text-gray-500">{z.items}/{z.capacity}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${z.color}`} style={{ width: `${(z.items / z.capacity) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">Total Utilization</p>
          <p className="text-xl font-bold">72.5%</p>
        </div>
        <button className="btn-secondary text-sm">View Details</button>
      </div>
    </div>
  );
}

function FuelDashboard() {
  const monthlyData = [
    { month: "Jan", fuel: 4200, cost: 2100000 },
    { month: "Feb", fuel: 3800, cost: 1900000 },
    { month: "Mar", fuel: 4500, cost: 2250000 },
    { month: "Apr", fuel: 3900, cost: 1950000 },
    { month: "May", fuel: 4100, cost: 2050000 },
    { month: "Jun", fuel: 3600, cost: 1800000 },
  ];
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Fuel Analytics</h3>
        <span className="text-sm text-green-600 font-medium">-12% vs last month</span>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xl font-bold">3,600L</p>
          <p className="text-xs text-gray-500">This Month</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xl font-bold">NGN 1.8M</p>
          <p className="text-xs text-gray-500">Total Cost</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xl font-bold">NGN 500</p>
          <p className="text-xs text-gray-500">Per KM</p>
        </div>
      </div>
      <div className="h-40 flex items-end gap-2">
        {monthlyData.map((d) => (
          <div key={d.month} className="flex-1 flex flex-col items-center">
            <div className="w-full bg-emerald-500 rounded-t" style={{ height: `${(d.fuel / 5000) * 100}%` }} />
            <span className="text-xs text-gray-500 mt-1">{d.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeliveryPredictions() {
  const predictions = [
    { route: "Lagos → Ibadan", distance: "135 km", eta: "3h 20m", confidence: 87, risk: "low", weather: "Clear" },
    { route: "Nairobi → Mombasa", distance: "485 km", eta: "9h 45m", confidence: 72, risk: "medium", weather: "Rain" },
    { route: "Accra → Kumasi", distance: "250 km", eta: "5h 30m", confidence: 81, risk: "low", weather: "Cloudy" },
    { route: "Joburg → Durban", distance: "570 km", eta: "7h 15m", confidence: 65, risk: "high", weather: "Heavy Rain" },
  ];
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Delivery Predictions</h3>
      <div className="space-y-3">
        {predictions.map((p) => (
          <div key={p.route} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-sm">{p.route}</p>
                <p className="text-xs text-gray-500">{p.distance} • {p.weather}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm">{p.eta}</p>
                <p className={`text-xs ${p.risk === "low" ? "text-green-600" : p.risk === "medium" ? "text-yellow-600" : "text-red-600"}`}>
                  {p.confidence}% confidence
                </p>
              </div>
            </div>
            <div className="mt-2 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${p.risk === "low" ? "bg-green-500" : p.risk === "medium" ? "bg-yellow-500" : "bg-red-500"}`}
                style={{ width: `${p.confidence}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Sidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "orders", icon: Package, label: "Orders" },
    { id: "fleet", icon: Truck, label: "Fleet" },
    { id: "warehouse", icon: Warehouse, label: "Warehouse" },
    { id: "routes", icon: Navigation, label: "Routes" },
    { id: "fuel", icon: Fuel, label: "Fuel" },
    { id: "predictions", icon: Activity, label: "Predictions" },
    { id: "analytics", icon: BarChart3, label: "Analytics" },
  ];

  return (
    <>
      <button onClick={() => setMobileOpen(true)} className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-md">
        <Menu className="w-6 h-6" />
      </button>
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white transform transition-transform lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">AfriLogistics</h1>
              <p className="text-xs text-gray-400">Logistics Platform</p>
            </div>
          </div>
        </div>
        <nav className="px-4 space-y-1">
          {items.map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${activeTab === item.id ? "bg-emerald-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}>
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-700 rounded-full flex items-center justify-center text-sm font-bold">AK</div>
            <div>
              <p className="text-sm font-medium">Admin Kimani</p>
              <p className="text-xs text-gray-400">Nairobi, Kenya</p>
            </div>
          </div>
        </div>
      </aside>
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />}
    </>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 lg:ml-64">
        <header className="bg-white border-b sticky top-0 z-20">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="ml-12 lg:ml-0">
              <h2 className="text-xl font-bold capitalize">{activeTab}</h2>
              <p className="text-sm text-gray-500">Overview and management</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search orders, vehicles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 w-64" />
              </div>
              <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg"><Globe className="w-5 h-5" /></button>
              <button className="p-2 hover:bg-gray-100 rounded-lg"><Settings className="w-5 h-5" /></button>
            </div>
          </div>
        </header>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon={Package} label="Total Orders" value={MOCK_STATS.totalOrders} change="+12.5%" changeType="up" color="bg-emerald-500" />
            <StatCard icon={CheckCircle} label="On-Time Delivery" value={`${MOCK_STATS.onTimeRate}%`} change="+2.1%" changeType="up" color="bg-blue-500" />
            <StatCard icon={Truck} label="Active Vehicles" value={MOCK_STATS.activeVehicles} change="+3" changeType="up" color="bg-purple-500" />
            <StatCard icon={Fuel} label="Fuel Cost (MTD)" value={`NGN ${(MOCK_STATS.fuelCosts / 1000000).toFixed(1)}M`} change="-12%" changeType="down" color="bg-orange-500" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <FleetMap vehicles={MOCK_VEHICLES} />
            </div>
            <WarehouseOverview />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <OrderTable orders={MOCK_ORDERS} />
            <DeliveryPredictions />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FuelDashboard />
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Fleet Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-green-600">{MOCK_STATS.activeVehicles}</p>
                  <p className="text-sm text-green-700">Active</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-yellow-600">6</p>
                  <p className="text-sm text-yellow-700">Idle</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-red-600">2</p>
                  <p className="text-sm text-red-700">Maintenance</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-blue-600">{MOCK_STATS.totalDrivers}</p>
                  <p className="text-sm text-blue-700">Drivers</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Alerts</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm p-2 bg-yellow-50 rounded">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span>V005 needs brake service</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm p-2 bg-red-50 rounded">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>V001 low fuel (15%)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm p-2 bg-blue-50 rounded">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>3 deliveries delayed on Route R-042</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
