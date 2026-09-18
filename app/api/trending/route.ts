import { NextRequest, NextResponse } from "next/server";
import { guardApiRequest } from "@/lib/api-guard";
import {
  ALLOWED_TRENDING_CHAINS,
  isAllowedChain,
  parseLimit,
  publicError,
  shapeTrendingList,
} from "@/lib/proxy-shape";
import { tatumFetch } from "@/lib/tatum";

export async function GET(req: NextRequest) {
  const blocked = guardApiRequest(req, { limit: 90 });
  if (blocked) return blocked;

  const chain = req.nextUrl.searchParams.get("chain");
  const limit = parseLimit(req.nextUrl.searchParams.get("limit"), 50);

  if (!chain || !isAllowedChain(chain, ALLOWED_TRENDING_CHAINS)) {
    return NextResponse.json({ message: "Invalid chain" }, { status: 400 });
  }

  try {
    const result = await tatumFetch(
      `/v4/data/tokens/trending?chain=${encodeURIComponent(chain)}&limit=${limit}`
    );

    if (!result.ok) {
      return NextResponse.json(publicError(result.status), {
        status: result.status >= 400 && result.status < 600 ? result.status : 502,
      });
    }

    return NextResponse.json(shapeTrendingList(result.body));
  } catch {
    return NextResponse.json({ message: "Proxy error" }, { status: 500 });
  }
}
