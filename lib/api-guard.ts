import { NextRequest, NextResponse } from "next/server";

const DEFAULT_ALLOWED_HOSTS = [
  "apps.tatum.io",
  "whats-pumping.webflow.io",
  "localhost",
  "127.0.0.1",
];

function allowedHosts(): Set<string> {
  const fromEnv = process.env.API_ALLOWED_HOSTS?.split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
  return new Set(fromEnv?.length ? fromEnv : DEFAULT_ALLOWED_HOSTS);
}

function hostnameFromUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function hostnameFromHostHeader(value: string | null): string | null {
  if (!value) return null;
  // "apps.tatum.io:443" or first of a forwarded list
  const first = value.split(",")[0]?.trim().toLowerCase();
  if (!first) return null;
  return first.split(":")[0] || null;
}

function isLocalHost(host: string) {
  return host === "localhost" || host === "127.0.0.1" || host.endsWith(".localhost");
}

function requestHostCandidates(req: NextRequest): string[] {
  const out: string[] = [];
  for (const raw of [
    req.headers.get("x-forwarded-host"),
    req.headers.get("host"),
  ]) {
    const host = hostnameFromHostHeader(raw);
    if (host && !out.includes(host)) out.push(host);
  }
  return out;
}

/** Reject requests that aren't from an allowed browser origin/host. */
export function assertAllowedHost(req: NextRequest): NextResponse | null {
  const hosts = allowedHosts();
  const candidates = requestHostCandidates(req);

  // Local/dev tooling (curl, Playwright) hitting localhost directly.
  if (
    candidates.some(isLocalHost) &&
    process.env.NODE_ENV !== "production"
  ) {
    return null;
  }

  const originHost = hostnameFromUrl(req.headers.get("origin"));
  const refererHost = hostnameFromUrl(req.headers.get("referer"));
  const secFetchSite = (req.headers.get("sec-fetch-site") || "").toLowerCase();

  // Prefer Origin / Referer — reliable on reverse proxies where Host is internal.
  if (originHost && hosts.has(originHost)) return null;
  if (refererHost && hosts.has(refererHost)) return null;

  if (
    secFetchSite === "same-origin" &&
    candidates.some((h) => hosts.has(h))
  ) {
    return null;
  }

  // Same-site navigations sometimes omit Origin on GET; accept allowlisted Host.
  if (!originHost && !refererHost && candidates.some((h) => hosts.has(h))) {
    // Still block anonymous server-to-server scrapes in production unless
    // they somehow spoof Host — Origin/Referer remain the primary gate.
    // Require at least a browser fetch metadata hint when present.
    if (!secFetchSite || secFetchSite === "none") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.json({ message: "Forbidden" }, { status: 403 });
}

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function clientKey(req: NextRequest): string {
  const forwarded = req.headers.get("cf-connecting-ip")
    || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip");
  return forwarded || "unknown";
}

/**
 * Best-effort in-memory rate limit (per Worker isolate).
 * Default: 60 requests / 60s per client IP.
 */
export function assertRateLimit(
  req: NextRequest,
  opts?: { limit?: number; windowMs?: number }
): NextResponse | null {
  const limit = opts?.limit ?? Number(process.env.API_RATE_LIMIT || 60);
  const windowMs = opts?.windowMs ?? Number(process.env.API_RATE_WINDOW_MS || 60_000);
  const now = Date.now();
  const key = `${clientKey(req)}:${req.nextUrl.pathname}`;

  let bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }

  bucket.count += 1;

  if (buckets.size > 5_000) {
    for (const [k, b] of buckets) {
      if (now >= b.resetAt) buckets.delete(k);
    }
  }

  if (bucket.count > limit) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return NextResponse.json(
      { message: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(bucket.resetAt / 1000)),
        },
      }
    );
  }

  return null;
}

/** Host allowlist + rate limit. Returns a Response to short-circuit, or null. */
export function guardApiRequest(
  req: NextRequest,
  rate?: { limit?: number; windowMs?: number }
): NextResponse | null {
  return assertAllowedHost(req) || assertRateLimit(req, rate);
}
