// The site is static assets; this script answers one path, /homelab.json
// (wrangler.json's run_worker_first), so nothing else ever runs it. The home
// server PUTs a few numbers there every five minutes and the home page's
// home-lab and flight-tracker figures GET them. The shape is fixed here, so a
// leaked token can only change these numbers, never put text on the page.

interface Env {
  STATS: {
    get(key: string, options: { cacheTtl: number }): Promise<string | null>;
    put(key: string, value: string): Promise<void>;
  };
  HOMELAB_TOKEN: string;
}

type HomelabStats = {
  at: number;
  allUp: boolean;
  blocked: number | null;
  tracking: number | null;
  londonHour: number | null;
  haDays: number | null;
  backupOk: boolean;
};

const counts = ["blocked", "tracking", "londonHour", "haDays"] as const;
const flags = ["allUp", "backupOk"] as const;
const keys = ["at", ...counts, ...flags].sort().join();

const count = (v: unknown) =>
  v === null ||
  (Number.isInteger(v) && (v as number) >= 0 && (v as number) < 1e7);

// The whole body, or null if anything about it is off.
export const parse = (text: string, now: number): HomelabStats | null => {
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof body !== "object" || body === null || Array.isArray(body))
    return null;
  if (Object.keys(body).sort().join() !== keys) return null;
  const at = body.at;
  // Gathered in the last ten minutes; a minute ahead allows for clock skew.
  if (
    !Number.isInteger(at) ||
    (at as number) > now + 60 ||
    (at as number) < now - 600
  )
    return null;
  if (!counts.every((k) => count(body[k]))) return null;
  if (!flags.every((k) => typeof body[k] === "boolean")) return null;
  return body as HomelabStats;
};

// Constant time, so the token cannot be guessed a byte at a time.
const same = async (a: string, b: string) => {
  const hash = async (s: string) =>
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)),
    );
  const [x, y] = await Promise.all([hash(a), hash(b)]);
  return x.reduce((d, v, i) => d | (v ^ y[i]), 0) === 0;
};

const KEY = "latest";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "GET" || request.method === "HEAD") {
      const stats = await env.STATS.get(KEY, { cacheTtl: 60 });
      if (!stats) return new Response("none yet", { status: 404 });
      return new Response(request.method === "HEAD" ? null : stats, {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60",
        },
      });
    }
    if (request.method !== "PUT")
      return new Response(null, {
        status: 405,
        headers: { Allow: "GET, PUT" },
      });
    const auth = request.headers.get("Authorization") ?? "";
    if (
      !env.HOMELAB_TOKEN ||
      !(await same(auth, `Bearer ${env.HOMELAB_TOKEN}`))
    )
      return new Response("unauthorised", { status: 401 });
    const text = await request.text();
    if (text.length > 1024) return new Response("too big", { status: 413 });
    const stats = parse(text, Math.floor(Date.now() / 1000));
    if (!stats) return new Response("bad body", { status: 400 });
    await env.STATS.put(KEY, JSON.stringify(stats));
    return new Response(null, { status: 204 });
  },
};
