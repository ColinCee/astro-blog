// The site is static assets; this script answers one path, /homelab.json
// (wrangler.json's run_worker_first), so nothing else ever runs it. The home
// server PUTs a few numbers there every five minutes and the home page's
// home-lab and flight-tracker figures GET them.
//
// The server signs each body with its private key (a homelab GitHub secret,
// the only copy); this checks it with the public half, in wrangler.json, so
// nothing here is secret. The shape is fixed, so even a stolen key could only
// change these numbers, never put text on the page, and only newer numbers
// are taken, so an old signed body can't be sent again.

export interface Env {
  STATS: {
    get(key: string, options?: { cacheTtl: number }): Promise<string | null>;
    put(key: string, value: string): Promise<void>;
  };
  // Ed25519, 32 bytes as hex
  HOMELAB_PUBLIC_KEY: string;
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

const hex = (s: string) =>
  /^([0-9a-f]{2})+$/i.test(s)
    ? Uint8Array.from(s.match(/../g)!, (b) => Number.parseInt(b, 16))
    : null;

// The body was signed by the server's private key.
const signed = async (body: ArrayBuffer, signature: string, key: string) => {
  const sig = hex(signature);
  const pub = hex(key);
  if (sig?.length !== 64 || pub?.length !== 32) return false;
  try {
    const k = await crypto.subtle.importKey("raw", pub, "Ed25519", false, [
      "verify",
    ]);
    return await crypto.subtle.verify("Ed25519", k, sig, body);
  } catch {
    return false;
  }
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
    // Refused before reading, so a big upload costs nothing.
    if (Number(request.headers.get("Content-Length") ?? Infinity) > 1024)
      return new Response("too big", { status: 413 });
    const body = await request.arrayBuffer();
    if (body.byteLength > 1024) return new Response("too big", { status: 413 });
    const signature = request.headers.get("Signature") ?? "";
    if (!(await signed(body, signature, env.HOMELAB_PUBLIC_KEY)))
      return new Response("bad signature", { status: 401 });
    const stats = parse(
      new TextDecoder().decode(body),
      Math.floor(Date.now() / 1000),
    );
    if (!stats) return new Response("bad body", { status: 400 });
    const last = await env.STATS.get(KEY);
    if (last && JSON.parse(last).at >= stats.at)
      return new Response("not newer", { status: 409 });
    await env.STATS.put(KEY, JSON.stringify(stats));
    return new Response(null, { status: 204 });
  },
};
