import { NextResponse } from "next/server";
import { fleetService } from "@/lib/services";

export async function GET() {
  return NextResponse.json(fleetService.getAllVehicleLocations());
}
