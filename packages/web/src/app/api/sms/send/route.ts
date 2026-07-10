import { NextRequest, NextResponse } from "next/server";
import { smsService } from "@/lib/services";

export async function POST(request: NextRequest) {
  const { order, type, language } = await request.json();
  const notification = await smsService.sendNotification(order, type, language);
  return NextResponse.json(notification);
}
