import { NextRequest, NextResponse } from "next/server";
import { guardApiRequest } from "@/lib/api-guard";
import {
  ALLOWED_CHART_CHAINS,
  isAllowedChain,
  publicError,
  shapeChartPayload,
} from "@/lib/proxy-shape";
import { tatumFetch } from "@/lib/tatum";

export async function GET(req: NextRequest) {
  const blocked = guardApiRequest(req, { limit: 30 });
  if (blocked) return blocked;

  const chain = req.nextUrl.searchParams.get("chain");
  const address = req.nextUrl.searchParams.get("address");

  if (!chain || !address) {
    return NextResponse.json(
      { message: "chain and address are required" },
      { status: 400 }
    );
  }

  if (!isAllowedChain(chain, ALLOWED_CHART_CHAINS)) {
    return NextResponse.json({
      supported: false,
      message: "Live 1m lookbacks unavailable for this chain",
    });
  }

  if (address.length < 32 || address.length > 64) {
    return NextResponse.json({ message: "Invalid address" }, { status: 400 });
  }

  // Max 30 Cryptoslam lookbacks: mix of last-30 1m + spaced samples across 24h
  const recent = Array.from({ length: 20 }, (_, i) => i + 1);
  const spaced = [60, 120, 240, 360, 480, 720, 960, 1200, 1440];
  const lookbacks = Array.from(new Set([...recent, ...spaced])).join(",");

  const path = `/v4/data/marketplace/cryptoslam/token/price/history?chain=${encodeURIComponent(chain)}&addresses=${encodeURIComponent(address)}&quoteSymbol=USD&lookbackMinutes=${lookbacks}`;

  try {
    const result = await tatumFetch(path);
    if (!result.ok) {
      return NextResponse.json(publicError(result.status), {
        status: result.status >= 400 && result.status < 600 ? result.status : 502,
      });
    }

    return NextResponse.json(shapeChartPayload(result.body));
  } catch {
    return NextResponse.json({ message: "Proxy error" }, { status: 500 });
  }
}
