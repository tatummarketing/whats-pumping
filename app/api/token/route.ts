import { NextRequest } from "next/server";
import { tatumGet } from "@/lib/tatum";

export async function GET(req: NextRequest) {
  const chain = req.nextUrl.searchParams.get("chain");
  const tokenAddress = req.nextUrl.searchParams.get("tokenAddress");

  if (!chain || !tokenAddress) {
    return Response.json(
      { message: "chain and tokenAddress are required" },
      { status: 400 }
    );
  }

  return tatumGet(
    `/v4/data/tokens?chain=${encodeURIComponent(chain)}&tokenAddress=${encodeURIComponent(tokenAddress)}`
  );
}
