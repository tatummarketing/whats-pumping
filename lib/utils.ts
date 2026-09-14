import type {
  ChainTheme,
  RankMode,
  Timeframe,
  TrendingToken,
} from "./types";

export function clsxm(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const TIMEFRAMES: Timeframe[] = ["1h", "4h", "12h", "24h"];

export const CHAIN_THEMES: ChainTheme[] = [
  {
    id: "solana",
    label: "Solana",
    apiChain: "solana-mainnet",
    accent: "#9945FF",
    soft: "rgba(153, 69, 255, 0.12)",
    badge: "bg-[#9945FF] text-white",
    logo: "/chains/solana.svg",
  },
  {
    id: "base",
    label: "Base",
    apiChain: "base-mainnet",
    accent: "#0052FF",
    soft: "rgba(0, 82, 255, 0.12)",
    badge: "bg-[#0052FF] text-white",
    logo: "/chains/base.svg",
  },
  {
    id: "bsc",
    label: "BNB Smart Chain",
    apiChain: "bsc-mainnet",
    accent: "#F0B90B",
    soft: "rgba(240, 185, 11, 0.18)",
    badge: "bg-[#F0B90B] text-black",
    logo: "/chains/bnb.svg",
  },
];

export const SEARCH_CHAINS = [
  { value: "solana-mainnet", label: "Solana" },
  { value: "base-mainnet", label: "Base" },
  { value: "bsc-mainnet", label: "BSC" },
  { value: "ethereum-mainnet", label: "Ethereum" },
] as const;

export function chainLabel(chain: string) {
  const map: Record<string, string> = {
    "solana-mainnet": "Solana",
    "bsc-mainnet": "BSC",
    "ethereum-mainnet": "Ethereum",
    "base-mainnet": "Base",
    "polygon-mainnet": "Polygon",
    "avax-mainnet": "Avalanche",
    "arb-one-mainnet": "Arbitrum",
    "optimism-mainnet": "Optimism",
    "monad-mainnet": "Monad",
  };
  return map[chain] ?? chain;
}

export function formatUsd(value?: number | null) {
  if (value == null || Number.isNaN(value)) return "n/a";
  if (value === 0) return "$0.00 USD";
  if (value >= 1_000_000_000)
    return `$${(value / 1_000_000_000).toFixed(2)}B USD`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M USD`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K USD`;
  if (value >= 1) return `$${value.toFixed(4)} USD`;
  if (value >= 0.0001) return `$${value.toFixed(6)} USD`;
  return `$${value.toExponential(2)} USD`;
}

export function formatPercent(value?: number | null) {
  if (value == null || Number.isNaN(value)) return "n/a";
  const pct = value * 100;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

export function isAddressLike(query: string) {
  const q = query.trim();
  return /^0x[a-fA-F0-9]{40}$/.test(q) || /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(q);
}

export function rankTokens(
  tokens: TrendingToken[],
  mode: RankMode,
  timeframe: Timeframe,
  limit = 10
) {
  const scored = [...tokens].sort((a, b) => {
    if (mode === "marketCap") {
      return (b.marketCap ?? 0) - (a.marketCap ?? 0);
    }
    return (
      (b.pricePercentChange?.[timeframe] ?? -Infinity) -
      (a.pricePercentChange?.[timeframe] ?? -Infinity)
    );
  });
  return scored.slice(0, limit);
}

export function worstTokens(
  tokens: TrendingToken[],
  timeframe: Timeframe,
  limit = 1
) {
  return [...tokens]
    .sort(
      (a, b) =>
        (a.pricePercentChange?.[timeframe] ?? Infinity) -
        (b.pricePercentChange?.[timeframe] ?? Infinity)
    )
    .slice(0, limit);
}

export function filterTokens(tokens: TrendingToken[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return tokens.filter((token) => {
    return (
      token.name?.toLowerCase().includes(q) ||
      token.symbol?.toLowerCase().includes(q) ||
      token.tokenAddress?.toLowerCase().includes(q)
    );
  });
}
