// What the home window's panels show, read at build time from the same
// collections the rest of the site reads. Nothing is listed here by hand: a
// new post, skill, company or project shows in the window with no other file
// changed.
import { getCollection } from "astro:content";
import { isStacks, type Stack } from "../../../../worker/stacks";
import snapshot from "../../../data/homelab-stacks.snapshot.json";
import { readMinutes } from "../../../scripts/read-minutes";

export const thisYear = new Date().getFullYear();

export interface HomePost {
  /** The post's id, which is also its file name and the end of its URL. */
  slug: string;
  href: string;
  title: string;
  /** "10 Nov": the year is said once, on the rule where it changes. */
  date: string;
  year: number;
  minutes: number;
  /** The old value of a result that changed ("428 s" of "428 s → 23 s"). */
  before?: string;
  /** The result itself; empty when the post has none. */
  after: string;
  label: string;
}

let posts: Promise<HomePost[]> | undefined;

// Every post, newest first. Asked for by several panels, read once.
export function homePosts(): Promise<HomePost[]> {
  posts ??= getCollection("blog").then((all) =>
    all
      .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
      .map((post) => {
        const at = post.data.pubDate;
        // A result that got better ("428 s → 23 s") is split so the old
        // value can go grey; "82% vs 80%" and "−10 min" stay whole.
        const [before, after] = (post.data.stat ?? "")
          .split("→")
          .map((s) => s.trim());
        return {
          slug: post.id,
          href: `/blog/${post.id}/`,
          title: post.data.title,
          // The month from en-US: en-GB shortens September to "Sept", which
          // would be the one four-letter month in the column.
          date: `${at.getDate()} ${at.toLocaleDateString("en-US", { month: "short" })}`,
          year: at.getFullYear(),
          minutes: readMinutes(post.body),
          before: after ? before : undefined,
          after: after ?? before,
          label: post.data.statLabel ?? "",
        };
      }),
  );
  return posts;
}

// Each skill with its years of use, the longest first.
export async function homeSkills() {
  return (await getCollection("skills"))
    .map((s) => ({
      id: s.id,
      since: s.data.since,
      years: thisYear - s.data.since,
    }))
    .sort((a, b) => b.years - a.years);
}

// The year of the first job.
export async function workSince(): Promise<number> {
  const years = (await getCollection("companies")).map((c) =>
    Number(c.data.year),
  );
  return Math.min(...years);
}

export interface HomeProject {
  /** The project's name, as the picker lists it. */
  id: string;
  repo: string;
  href: string;
  desc: string;
  caption: string;
  /** A second line under a figure, where the data has one. */
  note?: string;
  /** The tie to its posts as the data has it: a slug prefix, "*" or nothing. */
  posts?: string;
  /** The id of the project it runs on, where the data names one. */
  runsOn?: string;
  /** The posts that tie picks out, newest first. */
  tied: HomePost[];
  /** The other projects this one runs on, or that run on it. */
  related: string[];
}

// The side projects in the picker's order, each with what else in the window
// belongs to it. Every tie is read from src/data/projects.json (`posts`,
// `runsOn`): none is written into a component. A tie that leads nowhere
// stops the build: the page would print it as written ("runs on hom-lab")
// or leave a readout cell empty, with nothing to say why.
export async function homeProjects(): Promise<HomeProject[]> {
  const all = (await getCollection("projects")).sort(
    (a, b) => a.data.order - b.data.order,
  );
  const written = await homePosts();
  for (const { id, data } of all) {
    const { posts: tie, runsOn } = data;
    // "{stacks}" is the one count a line can say (Desc.astro); any other
    // brace would be printed as written.
    if (/[{}]/.test(data.desc.replace("{stacks}", "")))
      throw new Error(
        `src/data/projects.json: "${id}" has desc "${data.desc}". The only count it can say is "{stacks}", the home lab's stacks in words.`,
      );
    if (
      runsOn !== undefined &&
      (runsOn === id || !all.some((o) => o.id === runsOn))
    )
      throw new Error(
        `src/data/projects.json: "${id}" has runsOn "${runsOn}", which is not another project's id (the ids are ${all.map((o) => o.id).join(", ")}).`,
      );
    if (
      tie !== undefined &&
      tie !== "*" &&
      !(tie && written.some((p) => p.slug.startsWith(tie)))
    )
      throw new Error(
        `src/data/projects.json: "${id}" has posts "${tie}", which picks out no post. Use what the file names of its posts in src/content/blog start with, "*" for every post, or leave posts out.`,
      );
  }
  return all.map(({ id, data }) => {
    const { posts: tie, runsOn } = data;
    return {
      id,
      repo: data.repo,
      href: data.href,
      desc: data.desc,
      caption: data.caption,
      note: data.note,
      posts: tie,
      runsOn,
      tied: tie
        ? written.filter((p) => tie === "*" || p.slug.startsWith(tie))
        : [],
      // Read both ways: what it runs on, and what runs on it.
      related: [
        ...(runsOn ? [runsOn] : []),
        ...all.filter((o) => o.data.runsOn === id).map((o) => o.id),
      ],
    };
  });
}

const LIVE = "https://colincheung.dev/homelab.json";
let stacks: Promise<Stack[]> | undefined;

// The home lab's Compose stacks in order, each with its services, as the home
// server last said it has them deployed (/homelab.json, worker/index.ts). The
// page asks for that list again and redraws the rows if it has changed
// (window/stats.ts); this is what it shows until then, and without the
// script. A build reads the live list; the dev server, and a build that
// cannot reach it or finds no list there, use the snapshot in
// src/data/homelab-stacks.snapshot.json, so tests see the same rows each run.
export function homeStacks(): Promise<Stack[]> {
  if (!isStacks(snapshot.stacks))
    throw new Error(
      "src/data/homelab-stacks.snapshot.json: its stacks break the rules in worker/stacks.ts.",
    );
  const fallback = (why: string) => {
    console.warn(
      `[home lab] ${why}: using src/data/homelab-stacks.snapshot.json, taken ${snapshot.taken}.`,
    );
    return snapshot.stacks;
  };
  stacks ??= import.meta.env.PROD
    ? fetch(LIVE, { signal: AbortSignal.timeout(5000) })
        .then((r) => (r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`)))
        .then((body: { stacks?: unknown }) =>
          isStacks(body?.stacks)
            ? body.stacks
            : fallback(`${LIVE} has no list of stacks`),
        )
        .catch((error) => fallback(`could not read ${LIVE} (${error})`))
    : Promise.resolve(snapshot.stacks);
  return stacks;
}

// The two numbers the home server reports for flight-tracker (the keys are
// /homelab.json's, worker/index.ts), with the words that go with each. Said
// in the picker's readout and under the stacked radar, so kept in one place.
export const flightCounts = [
  {
    stat: "tracking",
    label: "tracking now",
    where: "within 30 nm of heathrow",
  },
  {
    stat: "londonHour",
    label: "bound for london",
    where: "seen in the past hour",
  },
];
