import { NextRequest, NextResponse } from "next/server";
import { routeService } from "@/lib/services";

export async function POST(request: NextRequest) {
  const { stops, maxStops, maxDistance, vehicleType, startLocation } = await request.json();
  const batches = routeService.splitIntoBatches(stops, maxStops, maxDistance, vehicleType, startLocation);
  return NextResponse.json({ batches, count: batches.length });
}
