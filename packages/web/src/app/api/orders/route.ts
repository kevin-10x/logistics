import { NextRequest, NextResponse } from "next/server";
import { orderService, smsService } from "@/lib/services";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId") || "";
  const status = searchParams.get("status") || undefined;
  const search = searchParams.get("search") || undefined;

  if (search && organizationId) {
    return NextResponse.json(orderService.searchOrders(organizationId, search));
  }
  return NextResponse.json(orderService.getOrdersByOrganization(organizationId, status as any));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const order = orderService.createOrder(body);
  smsService.sendNotification(order, "confirmation", "en").catch(console.error);
  return NextResponse.json(order, { status: 201 });
}
