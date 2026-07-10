import { NextRequest, NextResponse } from "next/server";
import { warehouseService } from "@/lib/services";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { itemId, performedBy } = await request.json();
  const item = warehouseService.dispatchItem(params.id, itemId, performedBy);
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
  return NextResponse.json(item);
}
