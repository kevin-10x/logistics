import { NextRequest, NextResponse } from "next/server";
import { fleetService } from "@/lib/services";

export async function POST(request: NextRequest) {
  const { vehicleId } = await request.json();
  const trip = fleetService.endTrip(vehicleId);
  if (!trip) return NextResponse.json({ error: "No active trip" }, { status: 404 });
  return NextResponse.json(trip);
}
