import { Order, OrderStatus, PaymentMethod, GeoPoint, VehicleType } from "@afrilogistics/shared";
import { generateId, generateOrderNumber } from "@afrilogistics/shared";

interface CreateOrderInput {
  organizationId: string;
  senderName: string;
  senderPhone: string;
  senderAddress: { street: string; city: string; state: string; country: string; coordinates: GeoPoint };
  receiverName: string;
  receiverPhone: string;
  receiverAddress: { street: string; city: string; state: string; country: string; coordinates: GeoPoint };
  description: string;
  weight: number;
  volume: number;
  declaredValue: number;
  currency: string;
  paymentMethod: PaymentMethod;
  priority?: "normal" | "high" | "urgent";
  vehicleType?: VehicleType;
  estimatedDelivery?: string;
  deliveryNotes?: string;
}

export class OrderService {
  private orders: Map<string, Order> = new Map();

  createOrder(input: CreateOrderInput): Order {
    const order: Order = {
      id: generateId(),
      organizationId: input.organizationId,
      orderNumber: generateOrderNumber(),
      senderName: input.senderName,
      senderPhone: input.senderPhone,
      senderAddress: { ...input.senderAddress, landmark: "" },
      receiverName: input.receiverName,
      receiverPhone: input.receiverPhone,
      receiverAddress: { ...input.receiverAddress, landmark: "" },
      description: input.description,
      weight: input.weight,
      volume: input.volume,
      declaredValue: input.declaredValue,
      currency: input.currency,
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentMethod === "cod" ? "pending" : "paid",
      status: "pending",
      priority: input.priority || "normal",
      vehicleType: input.vehicleType || this.suggestVehicleType(input.weight, input.volume),
      estimatedDelivery: input.estimatedDelivery,
      deliveryNotes: input.deliveryNotes,
      smsNotifications: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.orders.set(order.id, order);
    return order;
  }

  updateStatus(orderId: string, status: OrderStatus, notes?: string): Order | null {
    const order = this.orders.get(orderId);
    if (!order) return null;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    if (status === "delivered") {
      order.actualDelivery = new Date().toISOString();
    }
    if (notes) {
      order.deliveryNotes = notes;
    }
    return order;
  }

  assignToRoute(orderId: string, routeId: string, driverId: string): Order | null {
    const order = this.orders.get(orderId);
    if (!order) return null;
    order.routeId = routeId;
    order.driverId = driverId;
    order.status = "assigned";
    order.updatedAt = new Date().toISOString();
    return order;
  }

  getOrder(orderId: string): Order | undefined {
    return this.orders.get(orderId);
  }

  getOrdersByOrganization(organizationId: string, status?: OrderStatus): Order[] {
    return Array.from(this.orders.values()).filter(
      (o) => o.organizationId === organizationId && (!status || o.status === status)
    );
  }

  getOrdersByDriver(driverId: string): Order[] {
    return Array.from(this.orders.values()).filter((o) => o.driverId === driverId);
  }

  searchOrders(organizationId: string, query: string): Order[] {
    const q = query.toLowerCase();
    return this.getOrdersByOrganization(organizationId).filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.senderName.toLowerCase().includes(q) ||
        o.receiverName.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q)
    );
  }

  getOrderStats(organizationId: string) {
    const orders = this.getOrdersByOrganization(organizationId);
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const todayOrders = orders.filter((o) => o.createdAt.startsWith(today));

    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      assigned: orders.filter((o) => o.status === "assigned").length,
      inTransit: orders.filter((o) => o.status === "in_transit" || o.status === "picked_up").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      failed: orders.filter((o) => o.status === "failed").length,
      returned: orders.filter((o) => o.status === "returned").length,
      todayOrders: todayOrders.length,
      todayDelivered: todayOrders.filter((o) => o.status === "delivered").length,
      totalRevenue: orders.reduce((sum, o) => sum + o.declaredValue, 0),
      onTimeRate: this.calculateOnTimeRate(orders),
      averageDeliveryTime: this.calculateAvgDeliveryTime(orders),
    };
  }

  private suggestVehicleType(weight: number, volume: number): VehicleType {
    if (weight <= 5 && volume <= 0.5) return "motorbike";
    if (weight <= 15 && volume <= 2) return "pickup";
    if (weight <= 50 && volume <= 8) return "van";
    if (weight <= 200 && volume <= 30) return "truck";
    return "trailer";
  }

  private calculateOnTimeRate(orders: Order[]): number {
    const delivered = orders.filter((o) => o.status === "delivered" && o.actualDelivery && o.estimatedDelivery);
    if (delivered.length === 0) return 1;
    const onTime = delivered.filter(
      (o) => new Date(o.actualDelivery!).getTime() <= new Date(o.estimatedDelivery!).getTime()
    );
    return onTime.length / delivered.length;
  }

  private calculateAvgDeliveryTime(orders: Order[]): number {
    const delivered = orders.filter((o) => o.status === "delivered" && o.actualDelivery && o.createdAt);
    if (delivered.length === 0) return 0;
    const totalHours = delivered.reduce((sum, o) => {
      const hours = (new Date(o.actualDelivery!).getTime() - new Date(o.createdAt).getTime()) / 3600000;
      return sum + hours;
    }, 0);
    return totalHours / delivered.length;
  }
}
