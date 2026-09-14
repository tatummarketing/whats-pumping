import type { TrendingToken } from "@/lib/types";

export type ChartPoint = {
  label: string;
  price: number;
  minuteAgo: number;
};

function parseChangePct(raw: string | number | undefined): number {
  if (typeof raw === "number") return raw;
  if (!raw) return 0;
  return Number(String(raw).replace("%", "").trim()) / 100;
}

function nearestChange(map: Map<number, number>, minutes: number): number {
  let best = 0;
  let bestDist = Infinity;
  for (const [m, c] of Array.from(map.entries())) {
    const d = Math.abs(m - minutes);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return best;
}

/**
 * Build a dense 24h series at 1-minute resolution (1440 points).
 * Uses Cryptoslam lookback % when available, otherwise trending anchors,
 * then interpolates every minute for a true 1m chart feel.
 */
export function build1mChart24h(
  token: TrendingToken,
  lookbacks?: Array<{ minutes: number; change: string | number }>
): ChartPoint[] {
  const now = token.usdPrice || 0;
  const ch = token.pricePercentChange || {
    "1h": 0,
    "4h": 0,
    "12h": 0,
    "24h": 0,
  };

  const back = (pct: number) => {
    const denom = 1 + pct;
    return denom === 0 ? now : now / denom;
  };

  // Anchor map: minuteAgo -> price
  const anchors = new Map<number, number>();
  anchors.set(0, now);
  anchors.set(60, back(ch["1h"] ?? 0));
  anchors.set(240, back(ch["4h"] ?? 0));
  anchors.set(720, back(ch["12h"] ?? 0));
  anchors.set(1440, back(ch["24h"] ?? 0));

  if (lookbacks?.length) {
    const byMin = new Map<number, number>();
    for (const p of lookbacks) byMin.set(p.minutes, parseChangePct(p.change));
    for (let m = 1; m <= 1440; m++) {
      if (byMin.has(m) || m % 48 === 0 || m <= 30) {
        const change = byMin.get(m) ?? nearestChange(byMin, m);
        anchors.set(m, back(change));
      }
    }
  }

  const keys = Array.from(anchors.keys()).sort((a, b) => a - b);

  const priceAt = (minuteAgo: number) => {
    if (anchors.has(minuteAgo)) return anchors.get(minuteAgo)!;
    let lo = keys[0];
    let hi = keys[keys.length - 1];
    for (let i = 0; i < keys.length - 1; i++) {
      if (keys[i] <= minuteAgo && keys[i + 1] >= minuteAgo) {
        lo = keys[i];
        hi = keys[i + 1];
        break;
      }
    }
    const a = anchors.get(lo)!;
    const b = anchors.get(hi)!;
    const span = hi - lo || 1;
    const t = (minuteAgo - lo) / span;
    return a + (b - a) * t;
  };

  // Slight deterministic jitter so 1m chart feels alive (not a straight line)
  const seed = (token.tokenAddress || token.symbol || "x")
    .split("")
    .reduce((n, c) => n + c.charCodeAt(0), 0);

  const points: ChartPoint[] = [];
  for (let m = 1439; m >= 0; m--) {
    const base = priceAt(m);
    const wobble =
      Math.sin((m + seed) * 0.37) * 0.0015 +
      Math.sin((m + seed) * 1.13) * 0.0007;
    const price = Math.max(base * (1 + wobble), 0);
    const hours = Math.floor(m / 60);
    const mins = m % 60;
    points.push({
      label:
        m === 0
          ? "now"
          : m % 60 === 0
            ? `${hours}h`
            : `${hours}:${String(mins).padStart(2, "0")}`,
      price,
      minuteAgo: m,
    });
  }
  return points;
}

/** @deprecated */
export function build24hChart(token: TrendingToken): ChartPoint[] {
  return build1mChart24h(token);
}

/** @deprecated */
export function buildSparkline(token: TrendingToken): ChartPoint[] {
  return build1mChart24h(token);
}

export function pointsFromLookbacks(
  currentPrice: number,
  prev: Array<{ minutes: number; change: string | number }>
): ChartPoint[] {
  return build1mChart24h(
    {
      usdPrice: currentPrice,
      pricePercentChange: { "1h": 0, "4h": 0, "12h": 0, "24h": 0 },
      symbol: "",
      name: "",
      chain: "",
      tokenAddress: "",
      decimals: 18,
      totalVolume: { "1h": 0, "4h": 0, "12h": 0, "24h": 0 },
    },
    prev
  );
}
