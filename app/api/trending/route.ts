import { NextRequest } from "next/server";
import { tatumGet } from "@/lib/tatum";

export async function GET(req: NextRequest) {
  const chain = req.nextUrl.searchParams.get("chain");
  const limit = req.nextUrl.searchParams.get("limit") ?? "50";

  if (!chain) {
    return Response.json({ message: "chain is required" }, { status: 400 });
  }

  return tatumGet(
    `/v4/data/tokens/trending?chain=${encodeURIComponent(chain)}&limit=${encodeURIComponent(limit)}`
  );
}
