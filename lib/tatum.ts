const API = "https://api.tatum.io";

function apiKey() {
  const key = process.env.TATUM_API_KEY;
  if (!key) throw new Error("TATUM_API_KEY is not set");
  return key;
}

export type TatumResult =
  | { ok: true; status: number; body: unknown }
  | { ok: false; status: number; body: unknown };

export async function tatumFetch(path: string): Promise<TatumResult> {
  const res = await fetch(`${API}${path}`, {
    headers: {
      "x-api-key": apiKey(),
      accept: "application/json",
    },
    cache: "no-store",
  });

  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }

  if (!res.ok) {
    return { ok: false, status: res.status, body };
  }

  return { ok: true, status: res.status, body };
}
