"use client";

import Image from "next/image";
import type { Timeframe, TrendingToken } from "@/lib/types";
import {
  chainLabel,
  clsxm,
  formatPercent,
  formatUsd,
} from "@/lib/utils";

export default function TokenTable({
  tokens,
  timeframe,
  empty = "No pumps in this board yet.",
  onSelect,
  flameTop = false,
  tint,
}: {
  tokens: TrendingToken[];
  timeframe: Timeframe;
  empty?: string;
  onSelect?: (token: TrendingToken) => void;
  flameTop?: boolean;
  tint?: string;
}) {
  if (!tokens.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[#d7dbe7] bg-white px-6 py-10 text-center text-sm text-[#6b7280]">
        {empty}
      </div>
    );
  }

  return (
    <div
      className="w-full overflow-x-auto rounded-2xl border border-[#e6e8ef]"
      style={{ background: tint || "#fff" }}
    >
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-black/5 text-[11px] uppercase tracking-wide text-[#6b7280]">
            <th className="px-4 py-3 font-medium">#</th>
            <th className="px-4 py-3 font-medium">Token</th>
            <th className="px-4 py-3 font-medium">Chain</th>
            <th className="px-4 py-3 font-medium">Price (USD)</th>
            <th className="px-4 py-3 font-medium">Market cap (USD)</th>
            <th className="px-4 py-3 font-medium">Vol {timeframe} (USD)</th>
            <th className="px-4 py-3 font-medium">Δ {timeframe}</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token, i) => {
            const change = token.pricePercentChange?.[timeframe];
            const up = (change ?? 0) >= 0;
            const isTop = flameTop && i === 0;
            return (
              <tr
                key={`${token.chain}-${token.tokenAddress}`}
                onClick={() => onSelect?.(token)}
                className={clsxm(
                  "border-b border-black/5 last:border-b-0 transition-colors",
                  onSelect && "cursor-pointer hover:bg-white/50",
                  isTop && "bg-white/40"
                )}
              >
                <td className="px-4 py-3">
                  {isTop ? (
                    <span className="flame-rank" aria-label="Rank 1">
                      <span className="flame-rank-core">1</span>
                    </span>
                  ) : (
                    <span className="font-mono text-xs text-[#9aa3b5]">
                      {i + 1}
                    </span>
                  )}
                </td>
                <td className={clsxm("px-4 py-3", isTop && "py-5")}>
                  <div className="flex min-w-[200px] items-center gap-3">
                    <div
                      className={clsxm(
                        "relative shrink-0 overflow-hidden rounded-full bg-white/70",
                        isTop ? "h-14 w-14 ring-2 ring-[#fb923c]" : "h-9 w-9"
                      )}
                    >
                      {token.logo ? (
                        <Image
                          src={token.logo}
                          alt={token.symbol}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-[#4f37fd]">
                          {token.symbol?.slice(0, 3) || "???"}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div
                        className={clsxm(
                          "font-semibold text-[#111827]",
                          isTop && "text-xl font-black"
                        )}
                      >
                        {token.name || "Unknown"}
                      </div>
                      <div
                        className={clsxm(
                          "font-mono text-xs text-[#6b7280]",
                          isTop && "text-sm font-bold text-[#ea580c]"
                        )}
                      >
                        ${token.symbol}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs font-medium text-[#4b5563]">
                  {chainLabel(token.chain)}
                </td>
                <td
                  className={clsxm(
                    "px-4 py-3 font-mono text-xs text-[#111827]",
                    isTop && "text-sm font-bold"
                  )}
                >
                  {formatUsd(token.usdPrice)}
                </td>
                <td
                  className={clsxm(
                    "px-4 py-3 font-mono text-xs text-[#111827]",
                    isTop && "text-sm font-bold"
                  )}
                >
                  {formatUsd(token.marketCap)}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-[#111827]">
                  {formatUsd(token.totalVolume?.[timeframe])}
                </td>
                <td
                  className={clsxm(
                    "px-4 py-3 font-mono text-xs font-bold",
                    up ? "text-[#16a34a]" : "text-[#e11d48]",
                    isTop && "text-base"
                  )}
                >
                  {formatPercent(change)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
