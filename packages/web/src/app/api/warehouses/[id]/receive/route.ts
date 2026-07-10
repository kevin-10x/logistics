import { NextRequest, NextResponse } from "next/server";
import { warehouseService } from "@/lib/services";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { orderId, item, performedBy } = await request.json();
  const result = warehouseService.receiveItem(params.id, orderId, item, performedBy);
  return NextResponse.json(result, { status: 201 });
}
