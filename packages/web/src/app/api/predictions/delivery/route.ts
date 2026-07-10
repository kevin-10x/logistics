import { NextRequest, NextResponse } from "next/server";
import { predictionService } from "@/lib/services";

export async function POST(request: NextRequest) {
  const { order, weather, traffic } = await request.json();
  const prediction = predictionService.predictDeliveryTime(order, weather, traffic);
  return NextResponse.json(prediction);
}
