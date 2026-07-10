import { NextResponse } from "next/server";
import { predictionService } from "@/lib/services";

export async function GET() {
  return NextResponse.json(predictionService.getDelayPatterns());
}
