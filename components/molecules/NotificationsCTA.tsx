"use client";

import * as React from "react";

export default function NotificationsCTA({
  defaultSymbol,
  defaultPrice,
}: {
  defaultSymbol?: string;
  defaultPrice?: number;
}) {
  const [symbol, setSymbol] = React.useState(defaultSymbol || "");
  const [target, setTarget] = React.useState(
    defaultPrice ? String(Number(defaultPrice.toPrecision(6))) : ""
  );
  const [webhook, setWebhook] = React.useState("");
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    if (defaultSymbol) setSymbol(defaultSymbol);
  }, [defaultSymbol]);

  React.useEffect(() => {
    if (defaultPrice) setTarget(String(Number(defaultPrice.toPrecision(6))));
  }, [defaultPrice]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
  };

  return (
    <section className="rounded-2xl border border-[#e6e8ef] bg-white p-5 md:p-6">
      <div className="max-w-3xl space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4f37fd]">
          Notifications
        </p>
        <h2 className="text-2xl font-bold text-[#111827]">
          Get alert when the target price hits
        </h2>
        <p className="text-sm text-[#6b7280]">
          Draft a price alert, then wire it to{" "}
          <a
            href="https://docs.tatum.io/docs/notifications"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#4f37fd] underline underline-offset-2 hover:text-[#3f2ae6]"
          >
            Tatum Notifications
          </a>{" "}
          webhooks for real-time chain events around your token.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3">
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Ticker or address"
          className="h-11 w-full rounded-xl border border-[#dfe3ee] px-3 text-sm outline-none ring-[#4f37fd] focus:ring-2"
          required
        />
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="Target price USD"
          type="number"
          step="any"
          className="h-11 w-full rounded-xl border border-[#dfe3ee] px-3 text-sm outline-none ring-[#4f37fd] focus:ring-2"
          required
        />
        <input
          value={webhook}
          onChange={(e) => setWebhook(e.target.value)}
          placeholder="Webhook URL (https://...)"
          className="h-11 w-full rounded-xl border border-[#dfe3ee] px-3 text-sm outline-none ring-[#4f37fd] focus:ring-2"
        />
        <button
          type="submit"
          className="h-11 w-full rounded-xl border border-[#111827] bg-[#111827] px-5 text-sm font-semibold text-white hover:bg-black"
        >
          Create Price Alert
        </button>
      </form>

      {saved && (
        <p className="mt-3 rounded-xl bg-[#f3f0ff] px-3 py-2 text-sm text-[#4f37fd]">
          Price alert created locally for {symbol || "token"} at ${target} USD.
          Connect your webhook via{" "}
          <a
            href="https://docs.tatum.io/docs/notifications"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline"
          >
            Tatum Notifications
          </a>
          .
        </p>
      )}
    </section>
  );
}
