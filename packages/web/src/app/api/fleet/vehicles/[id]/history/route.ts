import { NextRequest, NextResponse } from "next/server";
import { fleetService } from "@/lib/services";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  return NextResponse.json(fleetService.getVehicleHistory(params.id, from, to));
}
