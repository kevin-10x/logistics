import { NextRequest, NextResponse } from "next/server";
import { routeService } from "@/lib/services";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const distance = Number(searchParams.get("distance"));
  const hour = Number(searchParams.get("hour"));
  const isWeekend = searchParams.get("isWeekend") === "true";
  const estimate = routeService.getTrafficAdjustedTime(distance, hour, isWeekend);
  return NextResponse.json({ estimatedMinutes: estimate });
}
