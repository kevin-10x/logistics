"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Truck, Package, Warehouse, Fuel, Route, BarChart3, Bell, MapPin, Clock,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Search, ChevronRight,
  Menu, X, Globe, Settings, Home, Navigation, Box, Activity, Zap, Plus, Send, Loader2
} from "lucide-react";

const ORG = "default-org";
const WH = "default-warehouse";

type AnyObj = Record<string, any>;

const MOCK_ORDERS: AnyObj[] = [
  { id:"ORD-001", orderNumber:"ORD-20260710-A1", senderName:"Chidi", senderPhone:"+234801", receiverName:"Fatima", receiverPhone:"+234801", receiverAddress:{city:"Lagos"}, description:"Electronics", weight:5, volume:0.3, declaredValue:150000, currency:"NGN", paymentMethod:"cash", status:"in_transit", priority:"high", vehicleType:"truck", createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() },
  { id:"ORD-002", orderNumber:"ORD-20260710-D4", senderName:"Peter", senderPhone:"+254712", receiverName:"Peter Ochieng", receiverPhone:"+254712", receiverAddress:{city:"Westlands"}, description:"Docs", weight:0.5, volume:0.01, declaredValue:5000, currency:"KES", paymentMethod:"momo", status:"out_for_delivery", priority:"urgent", vehicleType:"motorbike", createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() },
  { id:"ORD-003", orderNumber:"ORD-20260710-G7", senderName:"Yuki", senderPhone:"+233245", receiverName:"Yuki Tanaka", receiverPhone:"+233245", receiverAddress:{city:"Osu"}, description:"Clothing", weight:3, volume:0.2, declaredValue:50000, currency:"GHS", paymentMethod:"cash", status:"delivered", priority:"normal", vehicleType:"motorbike", createdAt:new Date(Date.now()-86400000).toISOString(), updatedAt:new Date().toISOString() },
  { id:"ORD-004", orderNumber:"ORD-20260710-J0", senderName:"Mandla", senderPhone:"+278234", receiverName:"Mandla Zulu", receiverPhone:"+278234", receiverAddress:{city:"Sandton"}, description:"Furniture", weight:50, volume:5, declaredValue:500000, currency:"ZAR", paymentMethod:"bank_transfer", status:"pending", priority:"normal", vehicleType:"truck", createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() },
];

const MOCK_VEHICLES: AnyObj[] = [
  { vehicle:{ id:"V001",name:"Lagos Express",plateNumber:"LAG-123",type:"truck",status:"active",currentFuelLevel:45,fuelCapacity:80 }, location:{ speed:65,location:{latitude:6.52,longitude:3.37} } },
  { vehicle:{ id:"V002",name:"Nairobi Runner",plateNumber:"NAI-456",type:"van",status:"active",currentFuelLevel:35,fuelCapacity:60 }, location:{ speed:45,location:{latitude:-1.29,longitude:36.82} } },
  { vehicle:{ id:"V003",name:"Cairo Cruiser",plateNumber:"CAI-789",type:"truck",status:"idle",currentFuelLevel:55,fuelCapacity:80 }, location:{ speed:0,location:{latitude:30.04,longitude:31.23} } },
  { vehicle:{ id:"V004",name:"Accra Swift",plateNumber:"ACC-012",type:"motorbike",status:"active",currentFuelLevel:20,fuelCapacity:15 }, location:{ speed:38,location:{latitude:5.60,longitude:-0.18} } },
  { vehicle:{ id:"V005",name:"Joburg Hauler",plateNumber:"JOB-345",type:"trailer",status:"maintenance",currentFuelLevel:12,fuelCapacity:100 }, location:{ speed:0,location:{latitude:-26.20,longitude:28.04} } },
  { vehicle:{ id:"V006",name:"Dar Express",plateNumber:"DAR-678",type:"pickup",status:"active",currentFuelLevel:38,fuelCapacity:60 }, location:{ speed:52,location:{latitude:-6.79,longitude:39.20} } },
];

function StatusBadge({ status }: { status: string }) {
  const s: AnyObj = { active:"badge-green", idle:"badge-yellow", maintenance:"badge-red", offline:"badge-red", delivered:"badge-green", in_transit:"badge-blue", pending:"badge-yellow", failed:"badge-red", out_for_delivery:"badge-blue", assigned:"badge-yellow", returned:"badge-red", picked_up:"badge-blue" };
  return <span className={`badge ${s[status]||"badge-blue"}`}>{status.replace(/_/g," ")}</span>;
}
function PriorityBadge({ priority }: { priority: string }) {
  const s: AnyObj = { urgent:"badge-red", high:"badge-yellow", normal:"badge-blue" };
  return <span className={`badge ${s[priority]||"badge-blue"}`}>{priority}</span>;
}
function StatCard({ icon: Icon, label, value, change, changeType, color }: { icon:any; label:string; value:string|number; change?:string; changeType?: "up"|"down"; color:string }) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${color}`}><Icon className="w-6 h-6 text-white" /></div>
        {change && <div className={`flex items-center text-sm ${changeType==="up"?"text-green-600":"text-red-600"}`}>{changeType==="up"?<TrendingUp className="w-4 h-4 mr-1"/>:<TrendingDown className="w-4 h-4 mr-1"/>}{change}</div>}
      </div>
      <div className="mt-4"><p className="text-2xl font-bold">{typeof value==="number"?value.toLocaleString():value}</p><p className="text-sm text-gray-500 mt-1">{label}</p></div>
    </div>
  );
}
function Loading() { return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>; }

function FleetMap({ vehicles, full }: { vehicles: AnyObj[]; full?: boolean }) {
  const [sel, setSel] = useState<AnyObj|null>(null);
  const list = vehicles.length > 0 ? vehicles : MOCK_VEHICLES;
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Fleet Tracking</h3>
        <div className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full bg-green-500"/> Active <span className="w-3 h-3 rounded-full bg-yellow-500 ml-2"/> Idle <span className="w-3 h-3 rounded-full bg-red-500 ml-2"/> Issue</div>
      </div>
      <div className={`relative bg-gradient-to-br from-emerald-50 to-blue-50 rounded-lg overflow-hidden border border-gray-200 ${full?"h-[500px]":"h-80"}`}>
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 800 400"><path d="M50,200 Q200,100 400,200 Q600,300 750,180" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="8,4"/><path d="M100,300 Q300,150 500,280 Q700,100 800,250" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="6,3"/></svg>
        {list.map((v,i) => {
          const x=10+i*14+(i%3)*4, y=15+(i%4)*18+(i*3)%10;
          const c=v.vehicle.status==="active"?"bg-green-500":v.vehicle.status==="idle"?"bg-yellow-500":"bg-red-500";
          return <div key={v.vehicle.id} className="absolute cursor-pointer group" style={{left:`${x}%`,top:`${y}%`}} onClick={()=>setSel(sel?.vehicle.id===v.vehicle.id?null:v)}>
            <div className={`w-4 h-4 rounded-full ${c} border-2 border-white shadow-lg animate-pulse`}/>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10"><div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">{v.vehicle.name}</div></div>
          </div>;
        })}
        {sel && <div className="absolute right-4 top-4 bg-white rounded-lg shadow-lg p-4 w-64 z-20">
          <div className="flex justify-between items-start mb-3"><h4 className="font-semibold">{sel.vehicle.name}</h4><button onClick={()=>setSel(null)}><X className="w-4 h-4"/></button></div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Plate</span><span>{sel.vehicle.plateNumber}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="capitalize">{sel.vehicle.type}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Speed</span><span>{sel.location?.speed??0} km/h</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Fuel</span>
              <div className="flex items-center gap-2"><div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full rounded-full ${sel.vehicle.currentFuelLevel/sel.vehicle.fuelCapacity*100>50?"bg-green-500":sel.vehicle.currentFuelLevel/sel.vehicle.fuelCapacity*100>25?"bg-yellow-500":"bg-red-500"}`} style={{width:`${sel.vehicle.currentFuelLevel/sel.vehicle.fuelCapacity*100}%`}}/></div><span>{Math.round(sel.vehicle.currentFuelLevel/sel.vehicle.fuelCapacity*100)}%</span></div>
            </div>
            <div className="flex justify-between"><span className="text-gray-500">Status</span><StatusBadge status={sel.vehicle.status}/></div>
          </div>
        </div>}
      </div>
    </div>
  );
}

function NewOrderModal({ open, onClose, onCreated }: { open:boolean; onClose:()=>void; onCreated:()=>void }) {
  const [f, setF] = useState({ senderName:"", senderPhone:"", senderCity:"", receiverName:"", receiverPhone:"", receiverCity:"", description:"", weight:"1", value:"10000", vehicleType:"motorbike", priority:"normal", paymentMethod:"cash", notes:"" });
  const [busy, setBusy] = useState(false);
  const upd = (k: string, v: string) => setF(prev => ({...prev, [k]: v}));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try {
      await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        organizationId:ORG, senderName:f.senderName, senderPhone:f.senderPhone,
        senderAddress:{street:"",city:f.senderCity,state:"",country:"Nigeria",coordinates:{latitude:6.52,longitude:3.38}},
        receiverName:f.receiverName, receiverPhone:f.receiverPhone,
        receiverAddress:{street:"",city:f.receiverCity,state:"",country:"Nigeria",coordinates:{latitude:6.52,longitude:3.38}},
        description:f.description, weight:+f.weight, volume:0.5, declaredValue:+f.value, currency:"NGN",
        paymentMethod:f.paymentMethod, priority:f.priority, vehicleType:f.vehicleType, deliveryNotes:f.notes
      })});
      onCreated(); onClose();
    } catch { alert("Failed to create order"); }
    setBusy(false);
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b"><h2 className="text-xl font-bold">New Order</h2><button onClick={onClose}><X className="w-5 h-5"/></button></div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Sender Name</label><input className="input w-full" required value={f.senderName} onChange={e=>upd("senderName",e.target.value)}/></div>
            <div><label className="block text-sm font-medium mb-1">Sender Phone</label><input className="input w-full" required value={f.senderPhone} onChange={e=>upd("senderPhone",e.target.value)}/></div>
            <div><label className="block text-sm font-medium mb-1">Sender City</label><input className="input w-full" value={f.senderCity} onChange={e=>upd("senderCity",e.target.value)}/></div>
            <div><label className="block text-sm font-medium mb-1">Receiver Name</label><input className="input w-full" required value={f.receiverName} onChange={e=>upd("receiverName",e.target.value)}/></div>
            <div><label className="block text-sm font-medium mb-1">Receiver Phone</label><input className="input w-full" required value={f.receiverPhone} onChange={e=>upd("receiverPhone",e.target.value)}/></div>
            <div><label className="block text-sm font-medium mb-1">Receiver City</label><input className="input w-full" value={f.receiverCity} onChange={e=>upd("receiverCity",e.target.value)}/></div>
            <div><label className="block text-sm font-medium mb-1">Description</label><input className="input w-full" required value={f.description} onChange={e=>upd("description",e.target.value)}/></div>
            <div><label className="block text-sm font-medium mb-1">Weight (kg)</label><input type="number" step="0.1" className="input w-full" required value={f.weight} onChange={e=>upd("weight",e.target.value)}/></div>
            <div><label className="block text-sm font-medium mb-1">Declared Value</label><input type="number" className="input w-full" required value={f.value} onChange={e=>upd("value",e.target.value)}/></div>
            <div><label className="block text-sm font-medium mb-1">Vehicle Type</label><select className="input w-full" value={f.vehicleType} onChange={e=>upd("vehicleType",e.target.value)}><option value="motorbike">Motorbike</option><option value="van">Van</option><option value="truck">Truck</option><option value="pickup">Pickup</option><option value="trailer">Trailer</option></select></div>
            <div><label className="block text-sm font-medium mb-1">Priority</label><select className="input w-full" value={f.priority} onChange={e=>upd("priority",e.target.value)}><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
            <div><label className="block text-sm font-medium mb-1">Payment</label><select className="input w-full" value={f.paymentMethod} onChange={e=>upd("paymentMethod",e.target.value)}><option value="cash">Cash</option><option value="momo">Mobile Money</option><option value="card">Card</option><option value="bank_transfer">Bank Transfer</option></select></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Notes</label><textarea className="input w-full" rows={2} value={f.notes} onChange={e=>upd("notes",e.target.value)}/></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={busy} className="btn-primary flex items-center gap-2">{busy?<Loader2 className="w-4 h-4 animate-spin"/>:<Send className="w-4 h-4"/>} Create Order</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OrderDetailModal({ order, onClose }: { order: AnyObj|null; onClose:()=>void }) {
  if (!order) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b"><div><h2 className="text-xl font-bold">{order.orderNumber||order.id}</h2><p className="text-sm text-gray-500">Order Details</p></div><button onClick={onClose}><X className="w-5 h-5"/></button></div>
        <div className="p-6 grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Status</span><div className="mt-1"><StatusBadge status={order.status}/></div></div>
          <div><span className="text-gray-500">Priority</span><div className="mt-1"><PriorityBadge priority={order.priority}/></div></div>
          <div><span className="text-gray-500">Sender</span><p className="font-medium">{order.senderName}</p><p className="text-xs text-gray-400">{order.senderPhone}</p></div>
          <div><span className="text-gray-500">Receiver</span><p className="font-medium">{order.receiverName}</p><p className="text-xs text-gray-400">{order.receiverPhone}</p></div>
          <div><span className="text-gray-500">Destination</span><p className="font-medium">{order.receiverAddress?.city||"N/A"}</p></div>
          <div><span className="text-gray-500">Description</span><p className="font-medium">{order.description}</p></div>
          <div><span className="text-gray-500">Weight</span><p className="font-medium">{order.weight} kg</p></div>
          <div><span className="text-gray-500">Value</span><p className="font-medium">{order.currency} {order.declaredValue?.toLocaleString()}</p></div>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ activeTab, setActiveTab }: { activeTab:string; setActiveTab:(t:string)=>void }) {
  const [mob, setMob] = useState(false);
  const items = [{id:"dashboard",icon:Home,label:"Dashboard"},{id:"orders",icon:Package,label:"Orders"},{id:"fleet",icon:Truck,label:"Fleet"},{id:"warehouse",icon:Warehouse,label:"Warehouse"},{id:"routes",icon:Navigation,label:"Routes"},{id:"fuel",icon:Fuel,label:"Fuel"},{id:"predictions",icon:Activity,label:"Predictions"},{id:"analytics",icon:BarChart3,label:"Analytics"}];
  return (<>
    <button onClick={()=>setMob(true)} className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-md"><Menu className="w-6 h-6"/></button>
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white transform transition-transform lg:translate-x-0 ${mob?"translate-x-0":"-translate-x-full"}`}>
      <div className="p-6"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center"><Truck className="w-6 h-6 text-white"/></div><div><h1 className="font-bold text-lg">AfriLogistics</h1><p className="text-xs text-gray-400">Logistics Platform</p></div></div></div>
      <nav className="px-4 space-y-1">{items.map(it=><button key={it.id} onClick={()=>{setActiveTab(it.id);setMob(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${activeTab===it.id?"bg-emerald-600 text-white":"text-gray-400 hover:bg-gray-800 hover:text-white"}`}><it.icon className="w-5 h-5"/>{it.label}</button>)}</nav>
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-emerald-700 rounded-full flex items-center justify-center text-sm font-bold">AK</div><div><p className="text-sm font-medium">Admin Kimani</p><p className="text-xs text-gray-400">Nairobi, Kenya</p></div></div></div>
    </aside>
    {mob&&<div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={()=>setMob(false)}/>}
  </>);
}

// ── Fetch helper ──
async function api<T=any>(url: string): Promise<T|null> {
  try { const r = await fetch(url); if(!r.ok) throw 0; return await r.json(); } catch { return null; }
}

// ── Dashboard ──
function DashboardView({ refreshKey }: { refreshKey:number }) {
  const [os,setOs]=useState<AnyObj|null>(null);
  const [fs,setFs]=useState<AnyObj|null>(null);
  const [fa,setFa]=useState<AnyObj|null>(null);
  const [vl,setVl]=useState<AnyObj[]>([]);
  const [or,setOr]=useState<AnyObj[]>([]);
  const [dp,setDp]=useState<AnyObj[]>([]);
  const [load,setLoad]=useState(true);
  useEffect(()=>{
    let alive=true;
    (async()=>{
      const [a,b,c,d,e,f]=await Promise.allSettled([
        api(`/api/orders/stats/${ORG}`), api(`/api/fleet/stats/${ORG}`), api(`/api/fuel/analytics/${ORG}`),
        api("/api/fleet/locations"), api(`/api/orders?organizationId=${ORG}`), api("/api/predictions/delay-patterns")
      ]);
      if(!alive) return;
      if(a.status==="fulfilled") setOs(a.value); if(b.status==="fulfilled") setFs(b.value); if(c.status==="fulfilled") setFa(c.value);
      if(d.status==="fulfilled") setVl(Array.isArray(d.value)&&d.value.length?d.value:MOCK_VEHICLES);
      if(e.status==="fulfilled") setOr(Array.isArray(e.value)&&e.value.length?e.value:MOCK_ORDERS);
      if(f.status==="fulfilled") setDp(Array.isArray(f.value)?f.value:[]);
      setLoad(false);
    })();
    return ()=>{alive=false};
  },[refreshKey]);
  if(load) return <Loading/>;
  const active=fs?.activeVehicles??0, drivers=fs?.totalDrivers??0, fuel=fa?.totalFuelCost??0;
  const recent=or.length?or.slice(0,6):MOCK_ORDERS;
  const zoneData=[{n:"Receiving",i:45,c:100,cl:"bg-blue-500"},{n:"Storage",i:280,c:400,cl:"bg-emerald-500"},{n:"Picking",i:32,c:75,cl:"bg-yellow-500"},{n:"Packing",i:18,c:50,cl:"bg-purple-500"},{n:"Dispatch",i:67,c:100,cl:"bg-orange-500"}];
  return (<>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard icon={Package} label="Total Orders" value={os?.total??or.length} change="+12.5%" changeType="up" color="bg-emerald-500"/>
      <StatCard icon={CheckCircle} label="On-Time Delivery" value={os?.onTimeRate?`${(os.onTimeRate*100).toFixed(1)}%`:"N/A"} change="+2.1%" changeType="up" color="bg-blue-500"/>
      <StatCard icon={Truck} label="Active Vehicles" value={active} change="+3" changeType="up" color="bg-purple-500"/>
      <StatCard icon={Fuel} label="Fuel Cost (MTD)" value={fuel?`${Number(fuel).toLocaleString()}`:"No data"} color="bg-orange-500"/>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div className="lg:col-span-2"><FleetMap vehicles={vl}/></div>
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Warehouse Overview</h3>
        <div className="space-y-4">{zoneData.map(z=><div key={z.n}><div className="flex justify-between text-sm mb-1"><span>{z.n}</span><span className="text-gray-500">{z.i}/{z.c}</span></div><div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${z.cl}`} style={{width:`${z.i/z.c*100}%`}}/></div></div>)}</div>
        <div className="mt-4 pt-4 border-t flex justify-between items-center"><div><p className="text-sm text-gray-500">Utilization</p><p className="text-xl font-bold">72.5%</p></div><button className="btn-secondary text-sm">View Details</button></div>
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="card overflow-hidden">
        <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
        <div className="overflow-x-auto"><table className="w-full"><thead><tr className="text-left text-sm text-gray-500 border-b"><th className="pb-3 font-medium">Order ID</th><th className="pb-3 font-medium">Receiver</th><th className="pb-3 font-medium">Dest</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium">Priority</th></tr></thead><tbody className="divide-y">{recent.map((o:AnyObj)=><tr key={o.id} className="hover:bg-gray-50"><td className="py-3 text-sm font-mono">{o.orderNumber||o.id}</td><td className="py-3 text-sm">{o.receiverName}</td><td className="py-3 text-sm">{o.receiverAddress?.city||"N/A"}</td><td className="py-3"><StatusBadge status={o.status}/></td><td className="py-3"><PriorityBadge priority={o.priority}/></td></tr>)}{!recent.length&&<tr><td colSpan={5} className="py-8 text-center text-gray-400">No orders</td></tr>}</tbody></table></div>
      </div>
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Delivery Predictions</h3>
        <div className="space-y-3">{dp.length>0?dp.slice(0,4).map((p:AnyObj,i:number)=><div key={i} className="p-3 bg-gray-50 rounded-lg"><div className="flex justify-between items-start"><div><p className="font-medium text-sm">{p.route}</p><p className="text-xs text-gray-500">Avg delay: {p.averageDelay?.toFixed(1)}h</p></div><span className={`text-xs font-medium ${p.frequency>0.5?"text-red-600":p.frequency>0.3?"text-yellow-600":"text-green-600"}`}>{(p.frequency*100).toFixed(0)}% late</span></div></div>):[{r:"Lagos → Ibadan",risk:"low",c:87},{r:"Nairobi → Mombasa",risk:"medium",c:72},{r:"Accra → Kumasi",risk:"low",c:81}].map(p=><div key={p.r} className="p-3 bg-gray-50 rounded-lg flex justify-between items-start"><p className="font-medium text-sm">{p.r}</p><p className={`text-xs ${p.risk==="low"?"text-green-600":"text-yellow-600"}`}>{p.c}% confidence</p></div>)}</div>
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Fuel Analytics</h3>
        {fa?.monthlyTrend?.length?<div className="h-40 flex items-end gap-2">{fa.monthlyTrend.map((d:AnyObj)=><div key={d.month} className="flex-1 flex flex-col items-center"><div className="w-full bg-emerald-500 rounded-t" style={{height:`${Math.min(d.totalFuel/5000*100,100)}%`}}/><span className="text-xs text-gray-500 mt-1">{d.month}</span></div>)}</div>:<p className="text-gray-400 text-sm text-center py-8">No fuel data</p>}
      </div>
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Fleet Status & Alerts</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg text-center"><p className="text-3xl font-bold text-green-600">{fs?.activeVehicles??0}</p><p className="text-sm text-green-700">Active</p></div>
          <div className="p-4 bg-yellow-50 rounded-lg text-center"><p className="text-3xl font-bold text-yellow-600">{fs?.idleVehicles??0}</p><p className="text-sm text-yellow-700">Idle</p></div>
          <div className="p-4 bg-red-50 rounded-lg text-center"><p className="text-3xl font-bold text-red-600">{fs?.maintenanceVehicles??0}</p><p className="text-sm text-red-700">Maintenance</p></div>
          <div className="p-4 bg-blue-50 rounded-lg text-center"><p className="text-3xl font-bold text-blue-600">{drivers}</p><p className="text-sm text-blue-700">Drivers</p></div>
        </div>
        <div className="mt-4 pt-4 border-t"><h4 className="text-sm font-medium mb-3">Alerts</h4><div className="space-y-2">{fs?.recentAlerts?.length?fs.recentAlerts.slice(0,3).map((a:AnyObj)=><div key={a.id} className={`flex items-center gap-2 text-sm p-2 rounded ${a.severity==="critical"?"bg-red-50":a.severity==="high"?"bg-yellow-50":"bg-blue-50"}`}><AlertTriangle className={`w-4 h-4 ${a.severity==="critical"?"text-red-600":a.severity==="high"?"text-yellow-600":"text-blue-600"}`}/><span>{a.title}: {a.message}</span></div>):<><div className="flex items-center gap-2 text-sm p-2 bg-yellow-50 rounded"><AlertTriangle className="w-4 h-4 text-yellow-600"/><span>V005 needs brake service</span></div><div className="flex items-center gap-2 text-sm p-2 bg-red-50 rounded"><AlertTriangle className="w-4 h-4 text-red-600"/><span>V004 low fuel</span></div></>}</div></div>
      </div>
    </div>
  </>);
}

// ── Orders ──
function OrdersView({ onNew }: { onNew:()=>void }) {
  const [orders,setOrders]=useState<AnyObj[]>([]);
  const [search,setSearch]=useState("");
  const [sel,setSel]=useState<AnyObj|null>(null);
  const [load,setLoad]=useState(true);
  const loadOrders=useCallback(async(q?:string)=>{
    setLoad(true);
    const url=q?`/api/orders?organizationId=${ORG}&search=${encodeURIComponent(q)}`:`/api/orders?organizationId=${ORG}`;
    const d=await api<AnyObj[]>(url);
    setOrders(Array.isArray(d)&&d.length?d:MOCK_ORDERS);
    setLoad(false);
  },[]);
  useEffect(()=>{loadOrders()},[loadOrders]);
  useEffect(()=>{const t=setTimeout(()=>loadOrders(search||undefined),300);return()=>clearTimeout(t)},[search,loadOrders]);
  return (<>
    <div className="flex items-center justify-between mb-6">
      <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/><input placeholder="Search orders..." value={search} onChange={e=>setSearch(e.target.value)} className="input pl-10 w-full"/></div>
      <button onClick={onNew} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4"/> New Order</button>
    </div>
    {load?<Loading/>:<div className="card overflow-hidden"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="text-left text-sm text-gray-500 border-b"><th className="pb-3 font-medium">Order ID</th><th className="pb-3 font-medium">Receiver</th><th className="pb-3 font-medium">Destination</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium">Priority</th><th className="pb-3 font-medium">Vehicle</th><th className="pb-3 font-medium"></th></tr></thead><tbody className="divide-y">{orders.map((o:AnyObj)=><tr key={o.id} className="hover:bg-gray-50 cursor-pointer" onClick={()=>setSel(o)}><td className="py-3 text-sm font-mono">{o.orderNumber||o.id}</td><td className="py-3"><div className="text-sm font-medium">{o.receiverName}</div><div className="text-xs text-gray-500">{o.receiverPhone}</div></td><td className="py-3 text-sm">{o.receiverAddress?.city||"N/A"}</td><td className="py-3"><StatusBadge status={o.status}/></td><td className="py-3"><PriorityBadge priority={o.priority}/></td><td className="py-3 text-sm capitalize">{o.vehicleType}</td><td className="py-3"><ChevronRight className="w-4 h-4 text-gray-400"/></td></tr>)}{!orders.length&&<tr><td colSpan={7} className="py-12 text-center text-gray-400">No orders found</td></tr>}</tbody></table></div></div>}
    <OrderDetailModal order={sel} onClose={()=>setSel(null)}/>
  </>);
}

// ── Fleet ──
function FleetView() {
  const [vl,setVl]=useState<AnyObj[]>([]);
  const [load,setLoad]=useState(true);
  useEffect(()=>{api("/api/fleet/locations").then(d=>{setVl(Array.isArray(d)&&d.length?d:MOCK_VEHICLES);setLoad(false)})},[]);
  if(load) return <Loading/>;
  const list=vl.length?vl:MOCK_VEHICLES;
  return (<>
    <FleetMap vehicles={list} full/>
    <div className="card mt-6">
      <h3 className="text-lg font-semibold mb-4">Vehicle List</h3>
      <div className="overflow-x-auto"><table className="w-full"><thead><tr className="text-left text-sm text-gray-500 border-b"><th className="pb-3 font-medium">Vehicle</th><th className="pb-3 font-medium">Plate</th><th className="pb-3 font-medium">Type</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium">Speed</th><th className="pb-3 font-medium">Fuel</th></tr></thead><tbody className="divide-y">{list.map((v:AnyObj)=><tr key={v.vehicle.id} className="hover:bg-gray-50"><td className="py-3 text-sm font-medium">{v.vehicle.name}</td><td className="py-3 text-sm">{v.vehicle.plateNumber}</td><td className="py-3 text-sm capitalize">{v.vehicle.type}</td><td className="py-3"><StatusBadge status={v.vehicle.status}/></td><td className="py-3 text-sm">{v.location?.speed??0} km/h</td><td className="py-3"><div className="flex items-center gap-2"><div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full rounded-full ${v.vehicle.currentFuelLevel/v.vehicle.fuelCapacity*100>50?"bg-green-500":v.vehicle.currentFuelLevel/v.vehicle.fuelCapacity*100>25?"bg-yellow-500":"bg-red-500"}`} style={{width:`${v.vehicle.currentFuelLevel/v.vehicle.fuelCapacity*100}%`}}/></div><span className="text-sm">{Math.round(v.vehicle.currentFuelLevel/v.vehicle.fuelCapacity*100)}%</span></div></td></tr>)}</tbody></table></div>
    </div>
  </>);
}

// ── Warehouse ──
function WarehouseView() {
  const [stats,setStats]=useState<AnyObj|null>(null);
  const [movements,setMovements]=useState<AnyObj[]>([]);
  const [sq,setSq]=useState("");
  const [sr,setSr]=useState<AnyObj[]>([]);
  const [load,setLoad]=useState(true);
  useEffect(()=>{Promise.allSettled([api(`/api/warehouses/${WH}/stats`),api(`/api/warehouses/${WH}/movements`)]).then(([s,m])=>{if(s.status==="fulfilled")setStats(s.value);if(m.status==="fulfilled")setMovements(Array.isArray(m.value)?m.value:[]);setLoad(false)})},[]);
  useEffect(()=>{if(!sq){setSr([]);return}const t=setTimeout(()=>api(`/api/warehouses/${WH}/search?q=${encodeURIComponent(sq)}`).then(d=>setSr(Array.isArray(d)?d:[])),300);return()=>clearTimeout(t)},[sq]);
  if(load) return <Loading/>;
  const zones=[{n:"Receiving",i:stats?.itemsByZone?.receiving??45,c:100,cl:"bg-blue-500"},{n:"Storage",i:stats?.itemsByZone?.storage??280,c:400,cl:"bg-emerald-500"},{n:"Picking",i:stats?.itemsByZone?.picking??32,c:75,cl:"bg-yellow-500"},{n:"Packing",i:stats?.itemsByZone?.packing??18,c:50,cl:"bg-purple-500"},{n:"Dispatch",i:stats?.itemsByZone?.dispatch??67,c:100,cl:"bg-orange-500"}];
  return (<>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="card"><h3 className="text-lg font-semibold mb-4">Warehouse Zones</h3><div className="space-y-4">{zones.map(z=><div key={z.n}><div className="flex justify-between text-sm mb-1"><span>{z.n}</span><span className="text-gray-500">{z.i}/{z.c}</span></div><div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${z.cl}`} style={{width:`${z.i/z.c*100}%`}}/></div></div>)}</div><div className="mt-4 pt-4 border-t flex justify-between"><div><p className="text-sm text-gray-500">Total Bins</p><p className="text-xl font-bold">{stats?.totalBins??0}</p></div><div><p className="text-sm text-gray-500">Utilization</p><p className="text-xl font-bold">{stats?.utilizationRate?`${(stats.utilizationRate*100).toFixed(1)}%`:"N/A"}</p></div></div></div>
      <div className="card"><h3 className="text-lg font-semibold mb-4">Inventory Search</h3><div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/><input placeholder="Search by name, SKU..." value={sq} onChange={e=>setSq(e.target.value)} className="input pl-10 w-full"/></div>{sr.length?sr.map((it:AnyObj)=><div key={it.id} className="p-3 bg-gray-50 rounded-lg text-sm mb-2"><div className="flex justify-between"><span className="font-medium">{it.name}</span><StatusBadge status={it.status}/></div><p className="text-gray-500">SKU: {it.sku} | Qty: {it.quantity}</p></div>):sq?<p className="text-gray-400 text-sm text-center py-4">No results</p>:<div className="text-center py-8 text-gray-400 text-sm"><Box className="w-12 h-12 mx-auto mb-2 opacity-50"/><p>Type to search inventory</p></div>}</div>
    </div>
    <div className="card"><h3 className="text-lg font-semibold mb-4">Recent Movements</h3>{movements.length?<div className="overflow-x-auto"><table className="w-full"><thead><tr className="text-left text-sm text-gray-500 border-b"><th className="pb-3 font-medium">Time</th><th className="pb-3 font-medium">From</th><th className="pb-3 font-medium">To</th><th className="pb-3 font-medium">Qty</th><th className="pb-3 font-medium">By</th></tr></thead><tbody className="divide-y">{movements.map((m:AnyObj)=><tr key={m.id} className="hover:bg-gray-50"><td className="py-3 text-sm">{new Date(m.timestamp).toLocaleString()}</td><td className="py-3 text-sm capitalize">{m.fromZone??"—"}</td><td className="py-3 text-sm capitalize">{m.toZone}</td><td className="py-3 text-sm">{m.quantity}</td><td className="py-3 text-sm">{m.performedBy}</td></tr>)}</tbody></table></div>:<p className="text-gray-400 text-sm text-center py-8">No movement data</p>}</div>
  </>);
}

// ── Routes ──
function RoutesView() {
  const [stops,setStops]=useState("6.5244,3.3792\n-1.2921,36.8219\n5.6037,-0.187");
  const [vt,setVt]=useState("truck");
  const [res,setRes]=useState<AnyObj|null>(null);
  const [busy,setBusy]=useState(false);
  const optimize=async()=>{
    setBusy(true);
    try{
      const sLines=stops.trim().split("\n").filter(Boolean).map((l,i)=>{const[a,b]=l.split(",").map(Number);return{id:`s${i}`,orderId:`o${i}`,sequence:i+1,address:{latitude:a,longitude:b},addressLabel:`Stop ${i+1}`,status:"pending",distanceFromPrevious:0,timeFromPrevious:0}});
      const r=await fetch("/api/routes/optimize",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({stops:sLines,vehicleType:vt,startLocation:{latitude:6.5244,longitude:3.3792},endLocation:{latitude:6.5244,longitude:3.3792}})});
      setRes(await r.json());
    }catch{alert("Optimization failed")}
    setBusy(false);
  };
  return (<>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="card"><h3 className="text-lg font-semibold mb-4">Route Optimizer</h3><div className="space-y-4">
        <div><label className="block text-sm font-medium mb-1">Stops (lat,lng per line)</label><textarea className="input w-full font-mono text-sm" rows={5} value={stops} onChange={e=>setStops(e.target.value)}/></div>
        <div><label className="block text-sm font-medium mb-1">Vehicle Type</label><select className="input w-full" value={vt} onChange={e=>setVt(e.target.value)}><option value="motorbike">Motorbike</option><option value="van">Van</option><option value="truck">Truck</option><option value="pickup">Pickup</option><option value="trailer">Trailer</option></select></div>
        <button onClick={optimize} disabled={busy} className="btn-primary w-full flex items-center justify-center gap-2">{busy?<Loader2 className="w-4 h-4 animate-spin"/>:<Route className="w-4 h-4"/>} Optimize Route</button>
      </div></div>
      <div className="lg:col-span-2 card"><h3 className="text-lg font-semibold mb-4">Optimized Route</h3>{res?(
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg text-center"><p className="text-xl font-bold">{res.totalDistance?.toFixed(1)} km</p><p className="text-xs text-gray-500">Distance</p></div>
            <div className="p-3 bg-gray-50 rounded-lg text-center"><p className="text-xl font-bold">{res.estimatedDuration?.toFixed(0)} min</p><p className="text-xs text-gray-500">Duration</p></div>
            <div className="p-3 bg-gray-50 rounded-lg text-center"><p className="text-xl font-bold">{res.estimatedFuelConsumption?.toFixed(1)} L</p><p className="text-xs text-gray-500">Fuel</p></div>
            <div className="p-3 bg-emerald-50 rounded-lg text-center"><p className="text-xl font-bold text-emerald-600">{res.savingsVsUnoptimized?.toFixed(1)}%</p><p className="text-xs text-gray-500">Savings</p></div>
          </div>
          <div className="overflow-x-auto"><table className="w-full"><thead><tr className="text-left text-sm text-gray-500 border-b"><th className="pb-3 font-medium">#</th><th className="pb-3 font-medium">Stop</th><th className="pb-3 font-medium">Lat</th><th className="pb-3 font-medium">Lng</th></tr></thead><tbody className="divide-y">{res.stops?.map((s:AnyObj,i:number)=><tr key={i} className="hover:bg-gray-50"><td className="py-2 text-sm">{s.sequence}</td><td className="py-2 text-sm">{s.addressLabel}</td><td className="py-2 text-sm font-mono">{s.address?.latitude?.toFixed(4)}</td><td className="py-2 text-sm font-mono">{s.address?.longitude?.toFixed(4)}</td></tr>)}</tbody></table></div>
        </div>
      ):<div className="text-center py-16 text-gray-400"><Navigation className="w-12 h-12 mx-auto mb-2 opacity-50"/><p>Add stops and click Optimize Route</p></div>}</div>
    </div>
  </>);
}

// ── Fuel ──
function FuelView() {
  const [fa,setFa]=useState<AnyObj|null>(null);
  const [cons,setCons]=useState<AnyObj[]>([]);
  const [alerts,setAlerts]=useState<AnyObj[]>([]);
  const [load,setLoad]=useState(true);
  useEffect(()=>{Promise.allSettled([api(`/api/fuel/analytics/${ORG}`),api("/api/fuel/fleet-consumption"),api("/api/fuel/refueling-alerts")]).then(([a,c,al])=>{if(a.status==="fulfilled")setFa(a.value);if(c.status==="fulfilled")setCons(Array.isArray(c.value)?c.value:[]);if(al.status==="fulfilled")setAlerts(Array.isArray(al.value)?al.value:[]);setLoad(false)})},[]);
  if(load) return <Loading/>;
  return (<>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="stat-card"><p className="text-2xl font-bold">{fa?.totalFuelUsed?.toLocaleString()??0} L</p><p className="text-sm text-gray-500">Total Fuel Used</p></div>
      <div className="stat-card"><p className="text-2xl font-bold">{fa?.totalFuelCost?.toLocaleString()??0}</p><p className="text-sm text-gray-500">Total Cost</p></div>
      <div className="stat-card"><p className="text-2xl font-bold">{fa?.costPerKm?.toFixed(0)??0}</p><p className="text-sm text-gray-500">Cost per KM</p></div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="card"><h3 className="text-lg font-semibold mb-4">Monthly Fuel Trend</h3>{fa?.monthlyTrend?.length?<div className="h-48 flex items-end gap-2">{fa.monthlyTrend.map((d:AnyObj)=>{const mx=Math.max(...fa.monthlyTrend.map((m:AnyObj)=>m.totalFuel),1);return<div key={d.month} className="flex-1 flex flex-col items-center"><div className="w-full bg-emerald-500 rounded-t" style={{height:`${d.totalFuel/mx*100}%`}}/><span className="text-xs text-gray-500 mt-1">{d.month?.slice(5)||d.month}</span></div>})}</div>:<p className="text-gray-400 text-sm text-center py-8">No trend data</p>}</div>
      <div className="card"><h3 className="text-lg font-semibold mb-4">Refueling Alerts</h3>{alerts.length?alerts.map((a:AnyObj)=><div key={a.vehicleId} className={`flex items-center justify-between p-3 rounded-lg text-sm mb-2 ${a.urgency==="critical"?"bg-red-50":a.urgency==="warning"?"bg-yellow-50":"bg-gray-50"}`}><div><p className="font-medium">{a.vehicleName}</p><p className="text-xs text-gray-500">Range: {a.estimatedRange?.toFixed(0)} km</p></div><div className="text-right"><p className={`font-bold ${a.urgency==="critical"?"text-red-600":a.urgency==="warning"?"text-yellow-600":"text-gray-600"}`}>{a.currentLevel?.toFixed(0)}%</p><StatusBadge status={a.urgency}/></div></div>):<p className="text-gray-400 text-sm text-center py-8">No alerts</p>}</div>
    </div>
    <div className="card"><h3 className="text-lg font-semibold mb-4">Per-Vehicle Consumption</h3>{cons.length?<div className="overflow-x-auto"><table className="w-full"><thead><tr className="text-left text-sm text-gray-500 border-b"><th className="pb-3 font-medium">Vehicle</th><th className="pb-3 font-medium">Period</th><th className="pb-3 font-medium">Fuel Used</th><th className="pb-3 font-medium">Cost</th><th className="pb-3 font-medium">Distance</th><th className="pb-3 font-medium">Efficiency</th><th className="pb-3 font-medium">Trend</th></tr></thead><tbody className="divide-y">{cons.map((c:AnyObj)=><tr key={c.vehicleId} className="hover:bg-gray-50"><td className="py-3 text-sm font-medium">{c.vehicleId}</td><td className="py-3 text-sm capitalize">{c.period}</td><td className="py-3 text-sm">{c.totalFuel?.toFixed(1)} L</td><td className="py-3 text-sm">{c.totalCost?.toLocaleString()}</td><td className="py-3 text-sm">{c.totalDistance?.toFixed(0)} km</td><td className="py-3 text-sm">{c.efficiency?.toFixed(1)}%</td><td className="py-3"><span className={`badge ${c.trend==="improving"?"badge-green":c.trend==="declining"?"badge-red":"badge-blue"}`}>{c.trend}</span></td></tr>)}</tbody></table></div>:<p className="text-gray-400 text-sm text-center py-8">No consumption data</p>}</div>
  </>);
}

// ── Predictions ──
function PredictionsView() {
  const [patterns,setPatterns]=useState<AnyObj[]>([]);
  const [sms,setSms]=useState<AnyObj|null>(null);
  const [load,setLoad]=useState(true);
  useEffect(()=>{Promise.allSettled([api("/api/predictions/delay-patterns"),api("/api/sms/stats")]).then(([p,s])=>{if(p.status==="fulfilled")setPatterns(Array.isArray(p.value)?p.value:[]);if(s.status==="fulfilled")setSms(s.value);setLoad(false)})},[]);
  if(load) return <Loading/>;
  const predictions=[{route:"Lagos → Ibadan",distance:"135 km",eta:"3h 20m",confidence:87,risk:"low",weather:"Clear"},{route:"Nairobi → Mombasa",distance:"485 km",eta:"9h 45m",confidence:72,risk:"medium",weather:"Rain"},{route:"Accra → Kumasi",distance:"250 km",eta:"5h 30m",confidence:81,risk:"low",weather:"Cloudy"},{route:"Joburg → Durban",distance:"570 km",eta:"7h 15m",confidence:65,risk:"high",weather:"Heavy Rain"}];
  return (<>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="stat-card"><p className="text-2xl font-bold">{patterns.length}</p><p className="text-sm text-gray-500">Delay Patterns</p></div>
      <div className="stat-card"><p className="text-2xl font-bold">{sms?.totalSent??0}</p><p className="text-sm text-gray-500">SMS Sent</p></div>
      <div className="stat-card"><p className="text-2xl font-bold">{sms?.deliveryRate?`${(sms.deliveryRate*100).toFixed(1)}%`:"N/A"}</p><p className="text-sm text-gray-500">SMS Delivery Rate</p></div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card"><h3 className="text-lg font-semibold mb-4">Delay Patterns</h3>{patterns.length?patterns.map((p:AnyObj,i:number)=><div key={i} className="p-4 bg-gray-50 rounded-lg mb-3"><div className="flex justify-between items-start mb-2"><p className="font-medium text-sm">Route {p.route}</p><span className={`text-xs font-medium ${p.frequency>0.5?"text-red-600":p.frequency>0.3?"text-yellow-600":"text-green-600"}`}>{(p.frequency*100).toFixed(0)}% delay</span></div><span className="text-xs text-gray-500">Avg delay: {p.averageDelay?.toFixed(1)}h</span>{p.commonCauses?.length>0&&<div className="mt-2 flex gap-1 flex-wrap">{p.commonCauses.map((c:string,j:number)=><span key={j} className="badge badge-yellow">{c}</span>)}</div>}</div>):<p className="text-gray-400 text-sm text-center py-8">No patterns found</p>}</div>
      <div className="card"><h3 className="text-lg font-semibold mb-4">Delivery Predictions</h3><div className="space-y-3">{predictions.map(p=><div key={p.route} className="p-3 bg-gray-50 rounded-lg"><div className="flex justify-between items-start"><div><p className="font-medium text-sm">{p.route}</p><p className="text-xs text-gray-500">{p.distance} · {p.weather}</p></div><div className="text-right"><p className="font-semibold text-sm">{p.eta}</p><p className={`text-xs ${p.risk==="low"?"text-green-600":p.risk==="medium"?"text-yellow-600":"text-red-600"}`}>{p.confidence}% confidence</p></div></div><div className="mt-2 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full rounded-full ${p.risk==="low"?"bg-green-500":p.risk==="medium"?"bg-yellow-500":"bg-red-500"}`} style={{width:`${p.confidence}%`}}/></div></div>)}</div></div>
    </div>
  </>);
}

// ── Analytics ──
function AnalyticsView() {
  const [os,setOs]=useState<AnyObj|null>(null);
  const [fs,setFs]=useState<AnyObj|null>(null);
  const [fa,setFa]=useState<AnyObj|null>(null);
  const [load,setLoad]=useState(true);
  useEffect(()=>{Promise.allSettled([api(`/api/orders/stats/${ORG}`),api(`/api/fleet/stats/${ORG}`),api(`/api/fuel/analytics/${ORG}`)]).then(([o,f,fe])=>{if(o.status==="fulfilled")setOs(o.value);if(f.status==="fulfilled")setFs(f.value);if(fe.status==="fulfilled")setFa(fe.value);setLoad(false)})},[]);
  if(load) return <Loading/>;
  const total=os?.total??0;
  return (<>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard icon={Package} label="Total Orders" value={total} color="bg-emerald-500"/>
      <StatCard icon={CheckCircle} label="Delivered" value={os?.delivered??0} color="bg-blue-500"/>
      <StatCard icon={Truck} label="Active Vehicles" value={fs?.activeVehicles??0} color="bg-purple-500"/>
      <StatCard icon={Fuel} label="Fuel Cost" value={fa?.totalFuelCost?.toLocaleString()??"0"} color="bg-orange-500"/>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card"><h3 className="text-lg font-semibold mb-4">Order Breakdown</h3><div className="space-y-3">{[{l:"Pending",v:os?.pending??0,c:"bg-yellow-400"},{l:"Assigned",v:os?.assigned??0,c:"bg-blue-400"},{l:"In Transit",v:os?.inTransit??0,c:"bg-emerald-400"},{l:"Delivered",v:os?.delivered??0,c:"bg-green-500"},{l:"Failed",v:os?.failed??0,c:"bg-red-400"}].map(s=><div key={s.l}><div className="flex justify-between text-sm mb-1"><span>{s.l}</span><span className="font-medium">{s.v}</span></div><div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${s.c}`} style={{width:`${total?(s.v/total)*100:0}%`}}/></div></div>)}</div></div>
      <div className="card"><h3 className="text-lg font-semibold mb-4">Fleet Performance</h3><div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-green-50 rounded-lg text-center"><p className="text-3xl font-bold text-green-600">{fs?.activeVehicles??0}</p><p className="text-sm text-green-700">Active</p></div>
        <div className="p-4 bg-yellow-50 rounded-lg text-center"><p className="text-3xl font-bold text-yellow-600">{fs?.idleVehicles??0}</p><p className="text-sm text-yellow-700">Idle</p></div>
        <div className="p-4 bg-red-50 rounded-lg text-center"><p className="text-3xl font-bold text-red-600">{fs?.maintenanceVehicles??0}</p><p className="text-sm text-red-700">Maintenance</p></div>
        <div className="p-4 bg-blue-50 rounded-lg text-center"><p className="text-3xl font-bold text-blue-600">{fs?.totalDrivers??0}</p><p className="text-sm text-blue-700">Drivers</p></div>
      </div>{fa && fa.savingsOpportunity>0&&<div className="mt-4 p-4 bg-emerald-50 rounded-lg"><p className="text-sm font-medium text-emerald-700">Potential Fuel Savings</p><p className="text-xl font-bold text-emerald-600">{fa.savingsOpportunity.toLocaleString()}</p></div>}</div>
    </div>
  </>);
}

// ── Main ──
export default function Dashboard() {
  const [tab,setTab]=useState("dashboard");
  const [showNew,setShowNew]=useState(false);
  const [rk,setRk]=useState(0);
  const titles: AnyObj={dashboard:"Dashboard",orders:"Orders",fleet:"Fleet Management",warehouse:"Warehouse",routes:"Route Optimizer",fuel:"Fuel Analytics",predictions:"Predictions",analytics:"Analytics"};
  return (
    <div className="flex">
      <Sidebar activeTab={tab} setActiveTab={setTab}/>
      <main className="flex-1 lg:ml-64">
        <header className="bg-white border-b sticky top-0 z-20">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="ml-12 lg:ml-0"><h2 className="text-xl font-bold">{titles[tab]||tab}</h2><p className="text-sm text-gray-500">Overview and management</p></div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg"><Bell className="w-5 h-5"/><span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"/></button>
              <button className="p-2 hover:bg-gray-100 rounded-lg"><Globe className="w-5 h-5"/></button>
              <button className="p-2 hover:bg-gray-100 rounded-lg"><Settings className="w-5 h-5"/></button>
            </div>
          </div>
        </header>
        <div className="p-6" key={rk}>
          {tab==="dashboard"&&<DashboardView refreshKey={rk}/>}
          {tab==="orders"&&<OrdersView onNew={()=>setShowNew(true)}/>}
          {tab==="fleet"&&<FleetView/>}
          {tab==="warehouse"&&<WarehouseView/>}
          {tab==="routes"&&<RoutesView/>}
          {tab==="fuel"&&<FuelView/>}
          {tab==="predictions"&&<PredictionsView/>}
          {tab==="analytics"&&<AnalyticsView/>}
        </div>
      </main>
      <NewOrderModal open={showNew} onClose={()=>setShowNew(false)} onCreated={()=>setRk(k=>k+1)}/>
    </div>
  );
}
