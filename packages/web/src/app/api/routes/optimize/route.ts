import { NextRequest, NextResponse } from "next/server";
import { routeService } from "@/lib/services";

export async function POST(request: NextRequest) {
  const { stops, vehicleType, startLocation, endLocation, weather } = await request.json();
  const optimized = routeService.optimizeRoute(stops, vehicleType, startLocation, endLocation, weather);
  return NextResponse.json(optimized);
}
