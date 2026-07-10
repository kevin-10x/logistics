import { NextRequest, NextResponse } from "next/server";
import { fleetService } from "@/lib/services";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(fleetService.getVehicleHealth(params.id));
}
