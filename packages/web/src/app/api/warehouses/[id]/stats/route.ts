import { NextRequest, NextResponse } from "next/server";
import { warehouseService } from "@/lib/services";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(warehouseService.getWarehouseStats(params.id));
}
