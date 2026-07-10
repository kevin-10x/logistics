import { NextRequest, NextResponse } from "next/server";
import { fleetService } from "@/lib/services";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const location = fleetService.getVehicleLocation(params.id);
  if (!location) return NextResponse.json({ error: "No location data" }, { status: 404 });
  return NextResponse.json(location);
}
