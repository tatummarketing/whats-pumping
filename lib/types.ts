export type Timeframe = "1h" | "4h" | "12h" | "24h";
export type RankMode = "percent" | "marketCap";
export type ViewMode = "table" | "bubbles";

export type TrendingChain =
  | "ethereum-mainnet"
  | "bsc-mainnet"
  | "polygon-mainnet"
  | "avax-mainnet"
  | "arb-one-mainnet"
  | "optimism-mainnet"
  | "base-mainnet"
  | "monad-mainnet"
  | "solana-mainnet";

export type TimeframeStats = Record<Timeframe, number>;

export type TrendingToken = {
  chain: TrendingChain | string;
  tokenAddress: string;
  name: string;
  uniqueName?: string | null;
  symbol: string;
  decimals: number;
  logo?: string | null;
  usdPrice: number;
  createdAt?: number;
  marketCap?: number;
  liquidityUsd?: number;
  holders?: number;
  pricePercentChange: TimeframeStats;
  totalVolume: TimeframeStats;
  transactions?: TimeframeStats;
  buyTransactions?: TimeframeStats;
  sellTransactions?: TimeframeStats;
  buyers?: TimeframeStats;
  sellers?: TimeframeStats;
};

export type ChainTheme = {
  id: string;
  label: string;
  apiChain: TrendingChain;
  accent: string;
  soft: string;
  badge: string;
  logo: string;
};
