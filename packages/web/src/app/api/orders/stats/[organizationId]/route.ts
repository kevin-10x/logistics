import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/lib/services";

export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  return NextResponse.json(orderService.getOrderStats(params.organizationId));
}
