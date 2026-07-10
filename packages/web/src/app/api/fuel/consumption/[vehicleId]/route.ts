import { NextRequest, NextResponse } from "next/server";
import { fuelService } from "@/lib/services";

export async function GET(
  request: NextRequest,
  { params }: { params: { vehicleId: string } }
) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || undefined;
  return NextResponse.json(fuelService.getConsumption(params.vehicleId, period));
}
