// The site is static assets; this script answers one path, /homelab.json
// (wrangler.json's run_worker_first), so nothing else ever runs it. The home
// server PUTs a few numbers there every five minutes, with the list of
// Compose stacks it has deployed, and the home page's home-lab and
// flight-tracker figures GET them.
//
// The server signs each body with its private key (a homelab GitHub secret,
// the only copy); this checks it with the public half, in wrangler.json, so
// nothing here is secret. The shape is fixed, so even a stolen key could only
// change these numbers and list names that look like a Compose stack's or
// service's (stacks.ts), never put text on the page, and only newer numbers
// are taken, so an old signed body can't be sent again.
//
// A GET also says which of Cloudflare's cities served it (`edge`), from the
// data centre's airport code and the list the build fetched
// (scripts/edge-cities.ts). The list ships here, not in the page.
//
// Deploy order: this Worker before the home server. A Worker refuses a key
// it does not know, so a server that sent `stacks` to an older one would
// have every PUT refused; this one takes bodies with or without them.
//
// Only the handler and functions may be exported from this file: the Workers
// runtime takes every export as an entry point, and refuses to start on any
// other kind (a number did). Constants live in stacks.ts.

// Node, which runs the tests, needs the attribute; the bundlers take it too.
import edgeCities from "./edge-cities.json" with { type: "json" };
import { isStacks, MAX_BYTES, type Stack } from "./stacks";

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
  tracking: number | null;
  londonHour: number | null;
  /** Left out by a server from before Nov 2026. */
  stacks?: Stack[];
};

const counts = ["tracking", "londonHour"] as const;
const flags = ["allUp"] as const;
const required = ["at", ...counts, ...flags];
// Either shape: the numbers alone, or with the stacks.
const shapes = [required, [...required, "stacks"]].map((k) => k.sort().join());

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
  if (!shapes.includes(Object.keys(body).sort().join())) return null;
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
  if ("stacks" in body && !isStacks(body.stacks)) return null;
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

// The city of the data centre that served a request: "London" for LHR. A
// code the build's list did not have is said as it is; no code (a request
// that did not come through Cloudflare) is null.
const places: Record<string, string> = edgeCities.places;
export const edgeCity = (colo: unknown): string | null =>
  typeof colo === "string" && colo
    ? (places[colo]?.split(", ")[0] ?? colo)
    : null;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "GET" || request.method === "HEAD") {
      const stats = await env.STATS.get(KEY, { cacheTtl: 60 });
      if (!stats) return new Response("none yet", { status: 404 });
      const { cf } = request as Request & { cf?: { colo?: unknown } };
      const body = JSON.stringify({
        ...JSON.parse(stats),
        edge: edgeCity(cf?.colo),
      });
      return new Response(request.method === "HEAD" ? null : body, {
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
    // A missing or malformed length is NaN, which fails this too.
    if (
      !(
        Number(request.headers.get("Content-Length") ?? Number.NaN) <= MAX_BYTES
      )
    )
      return new Response("too big", { status: 413 });
    const body = await request.arrayBuffer();
    if (body.byteLength > MAX_BYTES)
      return new Response("too big", { status: 413 });
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
