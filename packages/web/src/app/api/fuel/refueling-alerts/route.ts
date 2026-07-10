import { NextResponse } from "next/server";
import { fuelService } from "@/lib/services";

export async function GET() {
  return NextResponse.json(fuelService.getRefuelingAlerts());
}
