import { NextRequest, NextResponse } from "next/server";
import { warehouseService } from "@/lib/services";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit")) || 50;
  return NextResponse.json(warehouseService.getMovements(params.id, limit));
}
