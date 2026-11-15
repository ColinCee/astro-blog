// Cloudflare's data centres, each by its airport code with the place it is
// in ("LHR": "London, United Kingdom"), read from Cloudflare's status page,
// where each is a component named "London, United Kingdom - (LHR)". The
// Worker bundles the list to say which city served a visit (worker/index.ts)
// and the colincheung.dev figure counts its cities (figures/Route.astro), so
// neither is a number typed by hand.
//
// The build fetches it afresh (an integration in astro.config.ts runs this),
// into worker/edge-cities.json, which git ignores. If the fetch fails, the
// build copies in worker/edge-cities.snapshot.json, which says when it was
// taken, and warns. Nothing the build runs writes a tracked file; the
// snapshot changes only when someone runs
//
//   node scripts/edge-cities.ts --snapshot
//
// and commits it.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const SOURCE = "https://www.cloudflarestatus.com/api/v2/components.json";
const OUT = new URL("../worker/edge-cities.json", import.meta.url);
const SNAPSHOT = new URL(
  "../worker/edge-cities.snapshot.json",
  import.meta.url,
);

export interface EdgeCities {
  /** The day the list was read, as YYYY-MM-DD. */
  taken: string;
  from: string;
  /** Each data centre's airport code and the place it is in. */
  places: Record<string, string>;
}

// "London, United Kingdom - (LHR)". The other components are products
// ("Data Loss Prevention (DLP)"), which have no " - " before the code.
const PLACE = /^([^<>]{1,60}) - \(([A-Z]{3})\)$/;

// The data centres in a components.json body, or null if it does not look
// like one: a page that lost most of its list is not taken as the edge.
export function placesIn(body: unknown): Record<string, string> | null {
  const components = (body as { components?: unknown } | null)?.components;
  if (!Array.isArray(components)) return null;
  const found: [string, string][] = [];
  for (const c of components) {
    const m = PLACE.exec(String(c?.name ?? ""));
    if (m) found.push([m[2], m[1].trim()]);
  }
  // By code, so a new snapshot's diff shows only what changed.
  found.sort(([a], [b]) => (a < b ? -1 : 1));
  return found.length >= 100 ? Object.fromEntries(found) : null;
}

const today = () => new Date().toISOString().slice(0, 10);

async function fetchList(): Promise<EdgeCities | null> {
  try {
    const r = await fetch(SOURCE, { signal: AbortSignal.timeout(10_000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const places = placesIn(await r.json());
    if (!places) throw new Error("no data centres in it");
    return { taken: today(), from: SOURCE, places };
  } catch (error) {
    console.warn(
      `[edge-cities] could not read ${SOURCE} (${(error as Error).message}).`,
    );
    return null;
  }
}

const json = (v: unknown) => `${JSON.stringify(v, null, 2)}\n`;

// Writes worker/edge-cities.json. The build always reads the list afresh;
// the dev server and `astro sync` keep a list already there.
export async function writeEdgeCities({ refetch }: { refetch: boolean }) {
  if (!refetch && existsSync(OUT)) return;
  const list = await fetchList();
  if (list) {
    writeFileSync(OUT, json(list));
    return;
  }
  const snapshot = JSON.parse(readFileSync(SNAPSHOT, "utf8")) as EdgeCities;
  console.warn(
    `[edge-cities] using worker/edge-cities.snapshot.json, taken ${snapshot.taken}.`,
  );
  writeFileSync(
    OUT,
    json({
      taken: snapshot.taken,
      from: snapshot.from,
      places: snapshot.places,
    }),
  );
}

// Run as a script (not imported by astro.config.ts) with --snapshot.
const run = resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url);
if (run && process.argv.includes("--snapshot")) {
  const list = await fetchList();
  if (!list) process.exit(1);
  writeFileSync(
    SNAPSHOT,
    json({
      note: `Cloudflare's data centres as ${SOURCE} listed them on ${list.taken}. The build uses this only when it cannot read that page (scripts/edge-cities.ts).`,
      ...list,
    }),
  );
  console.log(
    `worker/edge-cities.snapshot.json: ${Object.keys(list.places).length} data centres.`,
  );
}
