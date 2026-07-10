import { NextRequest, NextResponse } from "next/server";
import { fleetService } from "@/lib/services";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const driver = fleetService.registerDriver(body);
  return NextResponse.json(driver, { status: 201 });
}
