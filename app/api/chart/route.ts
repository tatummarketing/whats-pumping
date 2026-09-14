import { NextRequest, NextResponse } from "next/server";
import { tatumGet } from "@/lib/tatum";

export async function GET(req: NextRequest) {
  const chain = req.nextUrl.searchParams.get("chain");
  const address = req.nextUrl.searchParams.get("address");

  if (!chain || !address) {
    return NextResponse.json(
      { message: "chain and address are required" },
      { status: 400 }
    );
  }

  if (chain !== "ethereum-mainnet" && chain !== "base-mainnet") {
    return NextResponse.json({
      supported: false,
      message: "Live 1m lookbacks unavailable for this chain",
    });
  }

  // Max 30 Cryptoslam lookbacks: mix of last-30 1m + spaced samples across 24h
  const recent = Array.from({ length: 20 }, (_, i) => i + 1); // 1..20 minutes
  const spaced = [60, 120, 240, 360, 480, 720, 960, 1200, 1440];
  const lookbacks = Array.from(new Set([...recent, ...spaced])).join(",");

  const path = `/v4/data/marketplace/cryptoslam/token/price/history?chain=${encodeURIComponent(chain)}&addresses=${encodeURIComponent(address)}&quoteSymbol=USD&lookbackMinutes=${lookbacks}`;

  const res = await tatumGet(path);
  const body = await res.json();
  if (!res.ok) {
    return NextResponse.json(body, { status: res.status });
  }

  return NextResponse.json({ supported: true, ...body });
}
