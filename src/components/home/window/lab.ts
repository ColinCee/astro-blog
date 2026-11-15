// How the home lab's stacks are said, the same at build (figures/Lab.astro,
// the projects' lines) and in the browser when the server's list arrives
// (window/stats.ts).
import type { Stack } from "../../../../worker/stacks";

// A row shows this many of its stack's services, then how many more.
const CHIPS = 4;

export const chips = (services: string[]) =>
  services.length > CHIPS
    ? { shown: services.slice(0, CHIPS), more: services.length - CHIPS }
    : { shown: services, more: 0 };

// At most 16 stacks (worker/stacks.ts), so every count has its word.
const words =
  "no one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen".split(
    " ",
  );
// "seven stacks", as projects.json's "{stacks}" says it.
export const stackWords = (n: number) =>
  `${words[n] ?? n} ${n === 1 ? "stack" : "stacks"}`;

// Draws the server's list into the home lab's box, from the row and chip
// the page keeps in a template (Lab.astro), and says the new count wherever
// the page says it. Only when the list has changed: the same list again
// changes nothing.
let drawn = "";
export function drawStacks(root: HTMLElement, stacks: Stack[]) {
  const key = JSON.stringify(stacks);
  const kv = root.querySelector<HTMLElement>(".lab__host__kv");
  const row = root.querySelector<HTMLTemplateElement>("[data-lab-row]");
  if (key === drawn || !kv || !row) return;
  drawn = key;
  // The live count keeps its element, and with it the number in it.
  const now = kv.querySelector(".lab__now");
  kv.replaceChildren(
    ...stacks.map((s, i) => {
      const el = row.content.firstElementChild!.cloneNode(true) as HTMLElement;
      el.style.setProperty("--i", String(i));
      el.querySelector("dt")!.textContent = s.id;
      const dd = el.querySelector("dd")!;
      const chip = dd.firstElementChild!;
      const { shown, more } = chips(s.services);
      dd.replaceChildren(
        ...shown.map((name) => {
          const c = chip.cloneNode() as HTMLElement;
          c.textContent = name;
          return c;
        }),
      );
      if (more) {
        const c = chip.cloneNode() as HTMLElement;
        c.classList.add("lab__more");
        c.textContent = `+${more}`;
        dd.append(c);
      }
      if (s.id === "flight-tracker" && now) dd.append(now);
      return el;
    }),
  );
  for (const el of root.querySelectorAll("[data-stacks-words]"))
    el.textContent = stackWords(stacks.length);
  for (const el of root.querySelectorAll("[data-stacks-n]"))
    el.textContent = String(stacks.length);
  for (const el of root.querySelectorAll("[data-stacks-unit]"))
    el.textContent = stacks.length === 1 ? "stack" : "stacks";
}
