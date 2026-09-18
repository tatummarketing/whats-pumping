import { NextRequest, NextResponse } from "next/server";
import { guardApiRequest } from "@/lib/api-guard";
import {
  ALLOWED_TOKEN_CHAINS,
  isAllowedChain,
  publicError,
  shapeTokenInfo,
} from "@/lib/proxy-shape";
import { tatumFetch } from "@/lib/tatum";

export async function GET(req: NextRequest) {
  const blocked = guardApiRequest(req, { limit: 30 });
  if (blocked) return blocked;

  const chain = req.nextUrl.searchParams.get("chain");
  const tokenAddress = req.nextUrl.searchParams.get("tokenAddress");

  if (!chain || !tokenAddress) {
    return NextResponse.json(
      { message: "chain and tokenAddress are required" },
      { status: 400 }
    );
  }

  if (!isAllowedChain(chain, ALLOWED_TOKEN_CHAINS)) {
    return NextResponse.json({ message: "Invalid chain" }, { status: 400 });
  }

  // Basic address shape check — reject obvious junk before spending credits.
  if (tokenAddress.length < 32 || tokenAddress.length > 64) {
    return NextResponse.json({ message: "Invalid tokenAddress" }, { status: 400 });
  }

  try {
    const result = await tatumFetch(
      `/v4/data/tokens?chain=${encodeURIComponent(chain)}&tokenAddress=${encodeURIComponent(tokenAddress)}`
    );

    if (!result.ok) {
      return NextResponse.json(publicError(result.status), {
        status: result.status >= 400 && result.status < 600 ? result.status : 502,
      });
    }

    return NextResponse.json(shapeTokenInfo(result.body));
  } catch {
    return NextResponse.json({ message: "Proxy error" }, { status: 500 });
  }
}
