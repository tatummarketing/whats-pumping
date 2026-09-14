"use client";

import * as React from "react";
import type { Timeframe, TrendingToken } from "@/lib/types";
import { formatPercent, formatUsd } from "@/lib/utils";

type Bubble = {
  token: TrendingToken;
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  phase: number;
};

function makeBubbles(tokens: TrendingToken[], width: number, height: number): Bubble[] {
  const caps = tokens.map((t) => Math.max(t.marketCap || 0, 1));
  const max = Math.max(...caps, 1);
  const minR = 26;
  const maxR = Math.min(width, height) * 0.16;

  return tokens.map((token, i) => {
    const ratio = Math.sqrt((token.marketCap || 1) / max);
    const r = minR + ratio * (maxR - minR);
    const angle = (i / Math.max(tokens.length, 1)) * Math.PI * 2;
    const dist = 30 + (i % 6) * 22;
    return {
      token,
      r,
      x: width / 2 + Math.cos(angle) * dist,
      y: height / 2 + Math.sin(angle) * dist * 0.7,
      vx: (Math.random() * 0.6 + 0.15) * (i % 2 === 0 ? 1 : -1),
      vy: (Math.random() * 0.5 + 0.12) * (i % 3 === 0 ? 1 : -1),
      phase: Math.random() * Math.PI * 2,
    };
  });
}

export default function BubbleView({
  tokens,
  timeframe,
  onSelect,
}: {
  tokens: TrendingToken[];
  timeframe: Timeframe;
  onSelect?: (token: TrendingToken) => void;
}) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ w: 900, h: 420 });
  const [hover, setHover] = React.useState<string | null>(null);
  const bubblesRef = React.useRef<Bubble[]>([]);
  const [, setTick] = React.useState(0);

  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSize({
        w: el.clientWidth,
        h: Math.max(380, Math.min(520, el.clientWidth * 0.5)),
      });
    });
    ro.observe(el);
    setSize({
      w: el.clientWidth,
      h: Math.max(380, Math.min(520, el.clientWidth * 0.5)),
    });
    return () => ro.disconnect();
  }, []);

  React.useEffect(() => {
    bubblesRef.current = makeBubbles(tokens.slice(0, 16), size.w, size.h);
  }, [tokens, size.w, size.h]);

  React.useEffect(() => {
    let frame = 0;
    let raf = 0;
    const step = () => {
      frame += 1;
      const list = bubblesRef.current;
      const t = frame / 40;

      for (let i = 0; i < list.length; i++) {
        const b = list[i];
        b.x += b.vx + Math.sin(t + b.phase) * 0.35;
        b.y += b.vy + Math.cos(t * 0.9 + b.phase) * 0.3;

        if (b.x < b.r + 6 || b.x > size.w - b.r - 6) b.vx *= -1;
        if (b.y < b.r + 6 || b.y > size.h - b.r - 6) b.vy *= -1;
        b.x = Math.min(size.w - b.r - 6, Math.max(b.r + 6, b.x));
        b.y = Math.min(size.h - b.r - 6, Math.max(b.r + 6, b.y));
      }

      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const a = list[i];
          const b = list[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.01;
          const minDist = a.r + b.r + 4;
          if (dist < minDist) {
            const push = (minDist - dist) / 2;
            const ux = dx / dist;
            const uy = dy / dist;
            a.x -= ux * push;
            a.y -= uy * push;
            b.x += ux * push;
            b.y += uy * push;
            a.vx -= ux * 0.05;
            a.vy -= uy * 0.05;
            b.vx += ux * 0.05;
            b.vy += uy * 0.05;
          }
        }
      }

      if (frame % 2 === 0) setTick((n) => n + 1);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [size.w, size.h]);

  const bubbles = bubblesRef.current;

  if (!tokens.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[#d7dbe7] bg-white px-6 py-10 text-center text-sm text-[#6b7280]">
        No tokens to bubble yet.
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      className="relative overflow-hidden rounded-2xl border border-[#e6e8ef] bg-gradient-to-br from-[#0b1224] via-[#151b33] to-[#24105a]"
      style={{ height: size.h }}
    >
      <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/70">
        Floating mcap bubbles · click for chart
      </div>
      <svg width={size.w} height={size.h} className="absolute inset-0">
        {bubbles.map((b) => {
          const { token, x, y, r } = b;
          const change = token.pricePercentChange?.[timeframe] ?? 0;
          const up = change >= 0;
          const fill = up ? "rgba(34,197,94,0.55)" : "rgba(244,63,94,0.55)";
          const stroke = up ? "#4ade80" : "#fb7185";
          const id = `${token.chain}-${token.tokenAddress}`;
          return (
            <g
              key={id}
              onMouseEnter={() => setHover(id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onSelect?.(token)}
              className="cursor-pointer"
              style={{ transition: "filter 120ms ease" }}
            >
              <circle
                cx={x}
                cy={y}
                r={r}
                fill={fill}
                stroke={hover === id ? "#fff" : stroke}
                strokeWidth={hover === id ? 3 : 1.5}
                filter={hover === id ? "url(#glow)" : undefined}
              />
              <text
                x={x}
                y={y - 4}
                textAnchor="middle"
                fill="#fff"
                fontSize={Math.max(10, Math.min(16, r / 3.2))}
                fontWeight={700}
                className="pointer-events-none"
              >
                ${token.symbol.slice(0, 8)}
              </text>
              <text
                x={x}
                y={y + 14}
                textAnchor="middle"
                fill="#dbe4ff"
                fontSize={Math.max(9, Math.min(12, r / 4))}
                className="pointer-events-none"
              >
                {formatUsd(token.marketCap)}
              </text>
            </g>
          );
        })}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {hover && (
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-xl bg-black/70 px-3 py-2 text-xs text-white backdrop-blur">
          {(() => {
            const token = bubbles.find(
              (b) => `${b.token.chain}-${b.token.tokenAddress}` === hover
            )?.token;
            if (!token) return null;
            return (
              <span>
                <b>{token.name}</b> · {formatUsd(token.usdPrice)} ·{" "}
                {formatPercent(token.pricePercentChange?.[timeframe])} · mcap{" "}
                {formatUsd(token.marketCap)} · click for chart
              </span>
            );
          })()}
        </div>
      )}
    </div>
  );
}
