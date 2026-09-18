import type { TimeframeStats, TrendingChain } from "@/lib/types";

export const ALLOWED_TRENDING_CHAINS = [
  "ethereum-mainnet",
  "bsc-mainnet",
  "polygon-mainnet",
  "avax-mainnet",
  "arb-one-mainnet",
  "optimism-mainnet",
  "base-mainnet",
  "monad-mainnet",
  "solana-mainnet",
] as const satisfies readonly TrendingChain[];

export const ALLOWED_TOKEN_CHAINS = [
  "ethereum-mainnet",
  "solana-mainnet",
  "bsc-mainnet",
  "base-mainnet",
] as const;

export const ALLOWED_CHART_CHAINS = [
  "ethereum-mainnet",
  "base-mainnet",
] as const;

export const MAX_TRENDING_LIMIT = 50;

function num(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function pickTimeframeStats(raw: unknown): TimeframeStats {
  const src = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    "1h": num(src["1h"]),
    "4h": num(src["4h"]),
    "12h": num(src["12h"]),
    "24h": num(src["24h"]),
  };
}

/** Fields the UI actually reads from trending tokens. */
export function shapeTrendingToken(raw: unknown) {
  const t = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    chain: str(t.chain),
    tokenAddress: str(t.tokenAddress),
    name: str(t.name, "Token"),
    symbol: str(t.symbol, "???"),
    decimals: num(t.decimals, 18),
    logo: typeof t.logo === "string" ? t.logo : null,
    usdPrice: num(t.usdPrice),
    marketCap: num(t.marketCap),
    pricePercentChange: pickTimeframeStats(t.pricePercentChange),
    totalVolume: pickTimeframeStats(t.totalVolume),
  };
}

export function shapeTrendingList(raw: unknown) {
  if (!Array.isArray(raw)) return [];
  return raw.map(shapeTrendingToken);
}

/** Fields used by address search. */
export function shapeTokenInfo(raw: unknown) {
  const t = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    name: str(t.name, "Token"),
    symbol: str(t.symbol, "???"),
    decimals: num(t.decimals, 18),
    logo: typeof t.logo === "string" ? t.logo : null,
  };
}

type Lookback = { minutes: number; change: string | number };

function shapeLookbacks(raw: unknown): Lookback[] {
  if (!Array.isArray(raw)) return [];
  const out: Lookback[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const minutes = num(row.minutes, NaN);
    if (!Number.isFinite(minutes) || minutes <= 0) continue;
    const change = row.change;
    if (typeof change !== "string" && typeof change !== "number") continue;
    out.push({ minutes, change });
  }
  return out;
}

/** Slim chart payload — only what TokenChartModal needs. */
export function shapeChartPayload(raw: unknown) {
  const body = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const tokens = Array.isArray(body.tokens) ? body.tokens : [];
  const first = tokens[0] && typeof tokens[0] === "object"
    ? (tokens[0] as Record<string, unknown>)
    : null;

  if (!first) {
    return { supported: true as const, price: 0, prev: [] as Lookback[] };
  }

  return {
    supported: true as const,
    price: num(first.price),
    prev: shapeLookbacks(first.prev),
  };
}

export function parseLimit(raw: string | null, fallback = 50): number {
  const n = Number(raw ?? fallback);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(Math.floor(n), MAX_TRENDING_LIMIT);
}

export function isAllowedChain(
  chain: string,
  allowlist: readonly string[]
): boolean {
  return allowlist.includes(chain);
}

/** Never bounce raw upstream error bodies to clients. */
export function publicError(status: number, fallback = "Upstream request failed") {
  const message =
    status === 401 || status === 403
      ? "Unauthorized"
      : status === 404
        ? "Not found"
        : status === 429
          ? "Upstream rate limited"
          : fallback;
  return { message };
}
