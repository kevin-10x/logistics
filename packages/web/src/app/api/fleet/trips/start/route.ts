import { NextRequest, NextResponse } from "next/server";
import { fleetService } from "@/lib/services";

export async function POST(request: NextRequest) {
  const { vehicleId, driverId } = await request.json();
  const trip = fleetService.startTrip(vehicleId, driverId);
  return NextResponse.json(trip, { status: 201 });
}
