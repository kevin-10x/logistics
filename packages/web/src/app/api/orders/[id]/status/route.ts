import { NextRequest, NextResponse } from "next/server";
import { orderService, smsService } from "@/lib/services";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { status, notes } = await request.json();
  const order = orderService.updateStatus(params.id, status, notes);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  smsService.sendNotification(order, "update", "en", { message: notes || "" }).catch(console.error);
  return NextResponse.json(order);
}
