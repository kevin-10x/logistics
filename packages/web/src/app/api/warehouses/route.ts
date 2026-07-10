import { NextRequest, NextResponse } from "next/server";
import { warehouseService } from "@/lib/services";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const warehouse = warehouseService.createWarehouse(body);
  return NextResponse.json(warehouse, { status: 201 });
}
