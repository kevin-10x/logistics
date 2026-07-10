import { NextRequest, NextResponse } from "next/server";
import { predictionService } from "@/lib/services";

export async function POST(request: NextRequest) {
  const body = await request.json();
  predictionService.addHistoricalData(body);
  return NextResponse.json({ success: true });
}
