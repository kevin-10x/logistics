import { NextRequest, NextResponse } from "next/server";
import { warehouseService } from "@/lib/services";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const results = warehouseService.searchInventory(params.id, q);
  return NextResponse.json(results);
}
