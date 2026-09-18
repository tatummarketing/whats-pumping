"use client";

import Image from "next/image";
import * as React from "react";
import type { Timeframe, TrendingToken } from "@/lib/types";
import { build1mChart24h, type ChartPoint } from "@/lib/chart";
import { apiUrl } from "@/lib/base-path";
import {
  chainLabel,
  clsxm,
  formatPercent,
  formatUsd,
} from "@/lib/utils";

const DISPLAY_POINTS = 240; // render density for SVG (sampled from 1440 1m bars)

function samplePoints(points: ChartPoint[], count: number): ChartPoint[] {
  if (points.length <= count) return points;
  const out: ChartPoint[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.round((i / (count - 1)) * (points.length - 1));
    out.push(points[idx]);
  }
  return out;
}

export default function TokenChartModal({
  token,
  timeframe,
  onClose,
}: {
  token: TrendingToken;
  timeframe: Timeframe;
  onClose: () => void;
}) {
  const [points, setPoints] = React.useState<ChartPoint[]>(() =>
    build1mChart24h(token)
  );
  const [source, setSource] = React.useState("1m · 24h reconstructed");
  const [loading, setLoading] = React.useState(true);
  const [hover, setHover] = React.useState<number | null>(null);
  const [drawn, setDrawn] = React.useState(0);
  const [copied, setCopied] = React.useState(false);

  const shortAddress = React.useMemo(() => {
    const addr = token.tokenAddress || "";
    if (addr.length <= 14) return addr;
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  }, [token.tokenAddress]);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(token.tokenAddress);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const change = token.pricePercentChange?.[timeframe] ?? 0;
  const up = change >= 0;
  const display = React.useMemo(
    () => samplePoints(points, DISPLAY_POINTS),
    [points]
  );

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setDrawn(0);
    setPoints(build1mChart24h(token));
    setSource("1m · 24h reconstructed");

    (async () => {
      try {
        const res = await fetch(
          apiUrl(
            `/api/chart?chain=${encodeURIComponent(token.chain)}&address=${encodeURIComponent(token.tokenAddress)}`
          )
        );
        const data = await res.json();
        if (cancelled) return;
        if (data?.supported && data?.price && Array.isArray(data.prev)) {
          setPoints(
            build1mChart24h(
              { ...token, usdPrice: data.price },
              data.prev
            )
          );
          setSource("1m · 24h · Cryptoslam + live USD");
        }
      } catch {
        // keep fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // Animate chart draw-in
  React.useEffect(() => {
    setDrawn(0);
    let frame = 0;
    let raf = 0;
    const tick = () => {
      frame += 1;
      setDrawn(Math.min(1, frame / 45));
      if (frame < 45) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [points]);

  const w = 720;
  const h = 300;
  const padX = 24;
  const padY = 32;
  const prices = display.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = max - min || 1;

  const coords = display.map((p, i) => {
    const x = padX + (i / Math.max(display.length - 1, 1)) * (w - padX * 2);
    const y = padY + (1 - (p.price - min) / span) * (h - padY * 2);
    return { x, y, ...p };
  });

  const visibleCount = Math.max(2, Math.floor(coords.length * drawn));
  const visible = coords.slice(0, visibleCount);
  const line = visible
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x},${c.y}`)
    .join(" ");
  const last = visible[visible.length - 1];
  const area = last
    ? `${line} L${last.x},${h - padY} L${visible[0].x},${h - padY} Z`
    : "";

  const active = hover != null ? coords[hover] : last;
  const tickEvery = Math.max(1, Math.floor(display.length / 6));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={clsxm(
          "relative w-full max-w-3xl overflow-hidden rounded-3xl border text-white shadow-2xl",
          up ? "border-emerald-400/40 bg-[#0c1a14]" : "border-rose-400/40 bg-[#1a0c14]"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={clsxm(
            "pointer-events-none absolute -right-8 -top-8 text-[120px] leading-none opacity-20",
            up ? "animate-bounce" : ""
          )}
        >
          {up ? "🚀" : "💀"}
        </div>

        <div className="relative z-10 p-5 md:p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 overflow-hidden rounded-2xl border-2 border-white/25 bg-white/10 shadow-lg">
                {token.logo ? (
                  <Image
                    src={token.logo}
                    alt={token.symbol}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-sm font-bold">
                    {token.symbol.slice(0, 3)}
                  </span>
                )}
              </div>
              <div>
                <div
                  className={clsxm(
                    "text-xs font-black uppercase tracking-[0.18em]",
                    up ? "text-emerald-300" : "text-rose-300"
                  )}
                >
                  {up ? "STONKS MODE" : "REKT MODE"} · 24h · 1m chart ·{" "}
                  {chainLabel(token.chain)}
                </div>
                <h3 className="text-2xl font-black">
                  {token.name}{" "}
                  <span className="text-white/55">${token.symbol}</span>
                </h3>
                <div className="mt-1 flex flex-wrap gap-3 font-mono text-sm">
                  <span>{formatUsd(active?.price ?? token.usdPrice)}</span>
                  <span className={up ? "text-emerald-300" : "text-rose-300"}>
                    {formatPercent(change)} ({timeframe})
                  </span>
                  <span className="text-white/45">
                    mcap {formatUsd(token.marketCap)}
                  </span>
                </div>
                {token.tokenAddress && (
                  <button
                    type="button"
                    onClick={copyAddress}
                    title={token.tokenAddress}
                    className="mt-1.5 inline-flex max-w-full items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1 font-mono text-[11px] text-white/60 transition hover:border-white/25 hover:bg-white/10 hover:text-white/90"
                  >
                    <span className="text-white/35">CA</span>
                    <span className="truncate">{shortAddress}</span>
                    <span className="text-white/35">
                      {copied ? "copied" : "copy"}
                    </span>
                  </button>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold hover:bg-white/10"
            >
              Close
            </button>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/35">
            <svg
              viewBox={`0 0 ${w} ${h}`}
              className="h-auto w-full"
              onMouseLeave={() => setHover(null)}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * w;
                let best = 0;
                let bestDist = Infinity;
                coords.forEach((c, i) => {
                  const d = Math.abs(c.x - x);
                  if (d < bestDist) {
                    bestDist = d;
                    best = i;
                  }
                });
                setHover(best);
              }}
            >
              <defs>
                <linearGradient id="funFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={up ? "#22c55e" : "#f43f5e"}
                    stopOpacity="0.5"
                  />
                  <stop
                    offset="100%"
                    stopColor={up ? "#22c55e" : "#f43f5e"}
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>

              {/* grid */}
              {[0.25, 0.5, 0.75].map((t) => (
                <line
                  key={t}
                  x1={padX}
                  x2={w - padX}
                  y1={padY + t * (h - padY * 2)}
                  y2={padY + t * (h - padY * 2)}
                  stroke="rgba(255,255,255,0.06)"
                />
              ))}

              {area && <path d={area} fill="url(#funFill)" />}
              {line && (
                <path
                  d={line}
                  fill="none"
                  stroke={up ? "#4ade80" : "#fb7185"}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="drop-shadow(0 0 6px rgba(255,255,255,0.25))"
                />
              )}

              {coords.map((c, i) =>
                i % tickEvery === 0 || i === coords.length - 1 ? (
                  <text
                    key={`t-${i}`}
                    x={c.x}
                    y={h - 10}
                    textAnchor="middle"
                    fill="#9aa3b5"
                    fontSize="11"
                  >
                    {c.label}
                  </text>
                ) : null
              )}

              {active && (
                <g>
                  <line
                    x1={active.x}
                    x2={active.x}
                    y1={padY}
                    y2={h - padY}
                    stroke="rgba(255,255,255,0.25)"
                    strokeDasharray="4 4"
                  />
                  <circle
                    cx={active.x}
                    cy={active.y}
                    r="7"
                    fill="#fff"
                    stroke={up ? "#22c55e" : "#e11d48"}
                    strokeWidth="3"
                  />
                </g>
              )}
            </svg>

            {active && (
              <div className="pointer-events-none absolute left-3 top-3 rounded-xl bg-black/70 px-3 py-2 text-xs backdrop-blur">
                <span className="font-bold">{active.label}</span>
                <span className="mx-2 text-white/40">·</span>
                <span className="font-mono">{formatUsd(active.price)}</span>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-white/45">
            <p>
              {loading
                ? "Loading 1m series..."
                : `${points.length.toLocaleString()} × 1m bars · ${source}`}
            </p>
            <p>Hover scrub · Esc to close</p>
          </div>
        </div>
      </div>
    </div>
  );
}
