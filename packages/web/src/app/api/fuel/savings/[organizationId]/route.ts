import { NextRequest, NextResponse } from "next/server";
import { fuelService } from "@/lib/services";

export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  return NextResponse.json(fuelService.getCostSavingsReport(params.organizationId));
}
