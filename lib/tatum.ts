import { NextResponse } from "next/server";

const API = "https://api.tatum.io";

function apiKey() {
  const key = process.env.TATUM_API_KEY;
  if (!key) throw new Error("TATUM_API_KEY is not set");
  return key;
}

export async function tatumGet(path: string) {
  const res = await fetch(`${API}${path}`, {
    headers: {
      "x-api-key": apiKey(),
      accept: "application/json",
    },
    next: { revalidate: 60 },
  });

  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { message: text };
  }

  if (!res.ok) {
    return NextResponse.json(
      typeof body === "object" && body
        ? body
        : { message: "Tatum request failed" },
      { status: res.status }
    );
  }

  return NextResponse.json(body);
}
