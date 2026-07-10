import { NextRequest, NextResponse } from "next/server";
import { orderService, predictionService } from "@/lib/services";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const order = orderService.getOrder(params.id);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  const prediction = predictionService.predictDeliveryTime({
    origin: order.senderAddress.coordinates,
    destination: order.receiverAddress.coordinates,
    vehicleType: order.vehicleType,
  });
  return NextResponse.json({ order, prediction });
}
