import { NextRequest, NextResponse } from "next/server";
import { fleetService } from "@/lib/services";

export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  return NextResponse.json(fleetService.getFleetStats(params.organizationId));
}
