import { NextResponse } from "next/server";
import { smsService } from "@/lib/services";

export async function GET() {
  return NextResponse.json(smsService.getDeliveryStats());
}
