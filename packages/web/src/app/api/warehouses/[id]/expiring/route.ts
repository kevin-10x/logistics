import { NextRequest, NextResponse } from "next/server";
import { warehouseService } from "@/lib/services";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const days = Number(searchParams.get("days")) || 30;
  return NextResponse.json(warehouseService.getExpiringItems(params.id, days));
}
