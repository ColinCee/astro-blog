// What the home server says is deployed on it: its Compose stacks in order,
// each with its services' names. The rules are strict so that even a stolen
// signing key can only list names, never put words of its own on the page.
// Read by the Worker (index.ts), the build (the home lab's rows when the
// server cannot be reached, src/components/home/window/data.ts) and the page
// (window/stats.ts), so all three take the same lists.

export type Stack = { id: string; services: string[] };

// The most bytes a PUT may carry, as it was before the stacks. The server
// sends compact JSON: today's body with its stacks is 557 bytes, 567 with
// every number at its widest, so this leaves about 450 for stacks and
// services to come. The homelab repo's public-stats tests check its largest
// body against this number: change both together.
export const MAX_BYTES = 1024;

// A Compose project or service name, as the homelab repo writes them.
const NAME = /^[a-z0-9][a-z0-9-]{0,39}$/;
export const MAX_STACKS = 16;
export const MAX_SERVICES = 32;

const name = (v: unknown): v is string => typeof v === "string" && NAME.test(v);
// Every one a name, and none twice.
const names = (v: unknown, max: number): v is string[] =>
  Array.isArray(v) &&
  v.length <= max &&
  v.every(name) &&
  new Set(v).size === v.length;

export const isStacks = (v: unknown): v is Stack[] =>
  Array.isArray(v) &&
  v.length >= 1 &&
  v.length <= MAX_STACKS &&
  v.every(
    (s) =>
      typeof s === "object" &&
      s !== null &&
      !Array.isArray(s) &&
      Object.keys(s).sort().join() === "id,services" &&
      name(s.id) &&
      names(s.services, MAX_SERVICES),
  ) &&
  names(
    v.map((s) => s.id),
    MAX_STACKS,
  );
