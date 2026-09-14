"use client";

import type { Timeframe } from "@/lib/types";
import { TIMEFRAMES, clsxm } from "@/lib/utils";

export default function TimeframeToggle({
  value,
  onChange,
}: {
  value: Timeframe;
  onChange: (tf: Timeframe) => void;
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-full border border-[#e1e4ee] bg-white p-1 text-xs font-semibold">
      {TIMEFRAMES.map((tf) => (
        <button
          key={tf}
          type="button"
          onClick={() => onChange(tf)}
          className={clsxm(
            "rounded-full px-3 py-1.5 transition-colors",
            value === tf
              ? "bg-[#4f37fd] text-white"
              : "text-[#6b7280] hover:bg-[#f3f4f8]"
          )}
        >
          {tf}
        </button>
      ))}
    </div>
  );
}
