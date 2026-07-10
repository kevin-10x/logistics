import { NextResponse } from "next/server";
import { predictionService } from "@/lib/services";

export async function POST() {
  const model = predictionService.retrainModel();
  return NextResponse.json(model);
}
