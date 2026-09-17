"use client";

import Image from "next/image";
import * as React from "react";
import BubbleView from "@/components/molecules/BubbleView";
import NotificationsCTA from "@/components/molecules/NotificationsCTA";
import TimeframeToggle from "@/components/molecules/TimeframeToggle";
import TokenChartModal from "@/components/molecules/TokenChartModal";
import TokenTable from "@/components/molecules/TokenTable";
import type { RankMode, Timeframe, TrendingToken, ViewMode } from "@/lib/types";
import {
  CHAIN_THEMES,
  SEARCH_CHAINS,
  clsxm,
  filterTokens,
  formatPercent,
  formatUsd,
  isAddressLike,
  rankTokens,
  worstTokens,
} from "@/lib/utils";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }
  return data as T;
}

export default function PumpingBoard() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [timeframe, setTimeframe] = React.useState<Timeframe>("24h");
  const [rankMode, setRankMode] = React.useState<RankMode>("percent");
  const [viewMode, setViewMode] = React.useState<ViewMode>("table");
  const [allTokens, setAllTokens] = React.useState<TrendingToken[]>([]);
  const [byChain, setByChain] = React.useState<Record<string, TrendingToken[]>>(
    {}
  );
  const [query, setQuery] = React.useState("");
  const [searchChain, setSearchChain] = React.useState("solana-mainnet");
  const [searchHits, setSearchHits] = React.useState<TrendingToken[]>([]);
  const [searchNote, setSearchNote] = React.useState<string | null>(null);
  const [searching, setSearching] = React.useState(false);
  const [selected, setSelected] = React.useState<TrendingToken | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const chains = [
        "ethereum-mainnet",
        "solana-mainnet",
        "bsc-mainnet",
        "base-mainnet",
      ];
      const lists = await Promise.all(
        chains.map((chain) =>
          fetchJson<TrendingToken[]>(`/api/trending?chain=${chain}&limit=50`)
        )
      );

      const merged: TrendingToken[] = [];
      const map: Record<string, TrendingToken[]> = {};
      lists.forEach((list, i) => {
        const chain = chains[i];
        const arr = Array.isArray(list) ? list : [];
        map[chain] = arr;
        merged.push(...arr);
      });

      setByChain(map);
      setAllTokens(merged);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pumps");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const leaderboard = React.useMemo(
    () => rankTokens(allTokens, rankMode, timeframe, 10),
    [allTokens, rankMode, timeframe]
  );

  const bubbleTokens = React.useMemo(
    () => rankTokens(allTokens, "marketCap", timeframe, 16),
    [allTokens, timeframe]
  );

  const best = React.useMemo(
    () => rankTokens(allTokens, "percent", timeframe, 1)[0],
    [allTokens, timeframe]
  );
  const rug = React.useMemo(
    () => worstTokens(allTokens, timeframe, 1)[0],
    [allTokens, timeframe]
  );

  const runSearch = async () => {
    const q = query.trim();
    if (!q) {
      setSearchHits([]);
      setSearchNote(null);
      return;
    }

    setSearching(true);
    setSearchNote(null);

    try {
      const local = filterTokens(allTokens, q).slice(0, 20);
      if (local.length) {
        setSearchHits(local);
        setSearchNote(`Matched ${local.length} token(s) in today’s pumps.`);
        return;
      }

      if (isAddressLike(q)) {
        const info = await fetchJson<{
          name?: string;
          symbol?: string;
          logo?: string;
          decimals?: number;
        }>(
          `/api/token?chain=${encodeURIComponent(searchChain)}&tokenAddress=${encodeURIComponent(q)}`
        );

        setSearchHits([
          {
            chain: searchChain,
            tokenAddress: q,
            name: info.name || "Token",
            symbol: info.symbol || "???",
            decimals: info.decimals ?? 18,
            logo: info.logo ?? null,
            usdPrice: 0,
            marketCap: 0,
            pricePercentChange: { "1h": 0, "4h": 0, "12h": 0, "24h": 0 },
            totalVolume: { "1h": 0, "4h": 0, "12h": 0, "24h": 0 },
          },
        ]);
        setSearchNote(
          "Found via token lookup. Price and volume stats come from the trending boards when available."
        );
        return;
      }

      setSearchHits([]);
      setSearchNote(
        "No matches. Try a ticker from the boards or paste a contract address."
      );
    } catch (err) {
      setSearchHits([]);
      setSearchNote(err instanceof Error ? err.message : "Search failed");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-[#10182e] px-6 py-8 text-white md:px-8 md:py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(79,55,253,0.35),transparent_45%),radial-gradient(circle_at_10%_90%,rgba(44,205,154,0.2),transparent_40%)]" />
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-[#c7ffdf]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#22c55e]" />
                Live meme radar
              </span>
            </div>
            <h1 className="meme-title text-5xl font-black tracking-tight md:text-7xl">
              What&apos;s Pumping?
            </h1>
            <p className="max-w-xl text-sm text-[#c7cede] md:text-base">
              Stonks, rugs, and floating market-cap bubbles across Solana, Base,
              and BSC. Powered by Tatum Data API.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
              <Stat label="Tracked" value={`${allTokens.length}`} />
              <Stat
                label={`Best ${timeframe}`}
                value={best ? `$${best.symbol}` : "loading"}
              />
              <Stat
                label="Best Δ"
                value={
                  best
                    ? formatPercent(best.pricePercentChange?.[timeframe])
                    : "loading"
                }
              />
              <Stat
                label="Rug Δ"
                value={
                  rug
                    ? formatPercent(rug.pricePercentChange?.[timeframe])
                    : "loading"
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <MoodCard
              tone="pump"
              subtitle="Best perf"
              token={best}
              timeframe={timeframe}
              wojak="/wojak-pump.png"
              onOpen={() => best && setSelected(best)}
            />
            <MoodCard
              tone="rekt"
              subtitle="Rug of the day"
              token={rug}
              timeframe={timeframe}
              wojak="/wojak-rekt.png"
              onOpen={() => rug && setSelected(rug)}
            />
          </div>
        </div>
      </section>

      {/* Controls + search */}
      <section className="rounded-2xl border border-[#e6e8ef] bg-white p-4 md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <TimeframeToggle value={timeframe} onChange={setTimeframe} />
            <Segmented
              value={rankMode}
              onChange={setRankMode}
              options={[
                { value: "percent", label: `Rank by % (${timeframe})` },
                { value: "marketCap", label: "Rank by market cap" },
              ]}
            />
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-[#dfe3ee] bg-white px-4 text-sm font-semibold text-[#111827] hover:bg-[#f7f8fc] disabled:opacity-60"
          >
            {loading ? "Refreshing..." : "Refresh pumps"}
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3 md:flex-row">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
            placeholder="Search ticker, name, or paste contract address"
            className="h-11 w-full rounded-xl border border-[#dfe3ee] px-4 text-sm outline-none ring-[#4f37fd] focus:ring-2"
          />
          <select
            value={searchChain}
            onChange={(e) => setSearchChain(e.target.value)}
            className="h-11 rounded-xl border border-[#dfe3ee] bg-white px-3 text-sm"
          >
            {SEARCH_CHAINS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={runSearch}
            disabled={searching}
            className="h-11 rounded-xl bg-[#4f37fd] px-5 text-sm font-semibold text-white hover:bg-[#3f2ae6] disabled:opacity-60"
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </div>
        {searchNote && (
          <p className="mt-2 text-xs text-[#6b7280]">{searchNote}</p>
        )}
      </section>

      {searchHits.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#111827]">Search results</h2>
          <TokenTable
            tokens={searchHits}
            timeframe={timeframe}
            onSelect={setSelected}
          />
        </section>
      )}

      {/* Leaderboard */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-[#111827]">
              {rankMode === "percent"
                ? `Leaderboard · best ${timeframe} pumps`
                : "Leaderboard · biggest market caps"}
            </h2>
            <p className="text-sm text-[#6b7280]">
              Tap a row for the chart. Timeframe changes re-rank when sorting by %.
            </p>
          </div>
          <Segmented
            value={viewMode}
            onChange={setViewMode}
            options={[
              { value: "table", label: "Table" },
              { value: "bubbles", label: "Bubble view" },
            ]}
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        ) : loading ? (
          <div className="rounded-2xl border border-[#e6e8ef] bg-white p-10 text-center text-sm text-[#6b7280]">
            Loading the pumps...
          </div>
        ) : viewMode === "bubbles" ? (
          <BubbleView
            tokens={bubbleTokens}
            timeframe={timeframe}
            onSelect={setSelected}
          />
        ) : (
          <TokenTable
            tokens={leaderboard}
            timeframe={timeframe}
            onSelect={setSelected}
            flameTop
          />
        )}
      </section>

      <NotificationsCTA
        defaultSymbol={best?.symbol}
        defaultPrice={best?.usdPrice}
      />

      {/* Chain boards */}
      <section className="space-y-5">
        <h2 className="text-2xl font-bold text-[#111827]">
          Chain boards · Top 10
        </h2>
        {CHAIN_THEMES.map((theme) => {
          const tokens = rankTokens(
            byChain[theme.apiChain] || [],
            rankMode,
            timeframe,
            10
          );
          return (
            <div
              key={theme.id}
              className="space-y-4 rounded-2xl border border-[#e6e8ef] p-4 md:p-6"
              style={{ background: theme.soft }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Image
                    src={theme.logo}
                    alt={`${theme.label} logo`}
                    width={44}
                    height={44}
                    className="rounded-full bg-white p-1 shadow-sm"
                  />
                  <h3
                    className="text-3xl font-black tracking-tight md:text-5xl"
                    style={{ color: theme.accent }}
                  >
                    {theme.label}
                  </h3>
                </div>
                <span
                  className={clsxm(
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold",
                    theme.badge
                  )}
                >
                  Top 10 pumping
                </span>
              </div>
              <TokenTable
                tokens={tokens}
                timeframe={timeframe}
                onSelect={setSelected}
                flameTop
                tint={theme.soft}
              />
            </div>
          );
        })}
      </section>

      {selected && (
        <TokenChartModal
          token={selected}
          timeframe={timeframe}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 transition hover:bg-white/10">
      <div className="text-[11px] uppercase tracking-wide text-[#9aa6c2]">
        {label}
      </div>
      <div className="mt-1 truncate text-lg font-bold text-white">{value}</div>
    </div>
  );
}

function MoodCard({
  tone,
  subtitle,
  token,
  timeframe,
  wojak,
  onOpen,
}: {
  tone: "pump" | "rekt";
  subtitle: string;
  token?: TrendingToken;
  timeframe: Timeframe;
  wojak: string;
  onOpen: () => void;
}) {
  const up = tone === "pump";
  return (
    <button
      type="button"
      onClick={onOpen}
      className={clsxm(
        "group relative min-h-[168px] overflow-hidden rounded-2xl border p-4 text-left transition hover:-translate-y-1 hover:shadow-xl md:p-5",
        up
          ? "border-emerald-400/40 bg-emerald-500/10 hover:border-emerald-300"
          : "border-rose-400/40 bg-rose-500/10 hover:border-rose-300"
      )}
    >
      <Image
        src={`${wojak}?v=9`}
        alt=""
        width={168}
        height={168}
        className="pointer-events-none absolute -bottom-5 -right-3 h-[168px] w-[168px] object-contain opacity-35 transition duration-300 group-hover:scale-105 group-hover:opacity-50"
        style={{ backgroundColor: "transparent" }}
        unoptimized
      />
      <div className="relative z-10 max-w-[calc(100%-7.5rem)]">
        <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
          {subtitle}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-white/30 bg-white/10 shadow-lg">
            {token?.logo ? (
              <Image
                src={token.logo}
                alt={token.symbol}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xs font-bold">
                {token?.symbol?.slice(0, 3) || "???"}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate text-xl font-black">
              {token ? `$${token.symbol}` : "Waiting..."}
            </div>
            <div className="truncate text-xs text-white/70">
              {token ? token.name : "Fetching boards"}
            </div>
            <div
              className={clsxm(
                "mt-1 font-mono text-sm font-bold",
                up ? "text-emerald-300" : "text-rose-300"
              )}
            >
              {token
                ? formatPercent(token.pricePercentChange?.[timeframe])
                : "n/a"}
            </div>
            {token && (
              <div className="font-mono text-[11px] text-white/60">
                {formatUsd(token.usdPrice)} · mcap {formatUsd(token.marketCap)}
              </div>
            )}
          </div>
        </div>
        <div className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-white/45 group-hover:text-white/75">
          Open 24h chart
        </div>
      </div>
    </button>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-full border border-[#e1e4ee] bg-white p-1 text-xs font-semibold">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={clsxm(
            "rounded-full px-3 py-1.5 transition-colors",
            value === opt.value
              ? "bg-[#111827] text-white"
              : "text-[#6b7280] hover:bg-[#f3f4f8]"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
