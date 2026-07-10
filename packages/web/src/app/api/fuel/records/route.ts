import { NextRequest, NextResponse } from "next/server";
import { fuelService } from "@/lib/services";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const record = fuelService.addRecord(body);
  return NextResponse.json(record, { status: 201 });
}
