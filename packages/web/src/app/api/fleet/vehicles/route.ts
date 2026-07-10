import { NextRequest, NextResponse } from "next/server";
import { fleetService, fuelService } from "@/lib/services";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const vehicle = fleetService.registerVehicle(body);
  fuelService.registerVehicle(vehicle);
  return NextResponse.json(vehicle, { status: 201 });
}
