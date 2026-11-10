// Wraps the prose in posts at 80 columns, so a post reads in an editor
// without side-scrolling. Biome does not format MDX, so this does the one
// thing wanted from a formatter there.
//
//   node scripts/wrap.ts            rewrap every post in place
//   node scripts/wrap.ts --check    exit 1 and list posts that need it
//
// Only plain paragraphs, list items and footnotes are touched: a paragraph's
// line breaks are spaces to Markdown, so the page comes out the same. Left
// exactly as written: frontmatter, headings, code blocks, tables, and any
// block with a line that starts with a tag, a brace or indentation (a figure
// and its props), since a long caption or data row cannot be split safely.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const WIDTH = 80;
const DIR = "src/content/blog";

// A word that must not start a line, because Markdown or MDX would read the
// line as a list item, heading, quote, table, rule, tag or expression.
const unsafeStart = /^([-+*>#|<{]|\d+[.)]$|=+$|import\b|export\b)/;

function fill(words: string[], first: string, rest: string): string[] {
  const lines: string[] = [];
  let line = first;
  let empty = true;
  for (const word of words) {
    const fits = line.length + (empty ? 0 : 1) + word.length <= WIDTH;
    if (empty || fits || unsafeStart.test(word)) {
      line += (empty ? "" : " ") + word;
    } else {
      lines.push(line);
      line = rest + word;
    }
    empty = false;
  }
  lines.push(line);
  return lines;
}

function wrapBlock(block: string[]): string[] {
  // A hard line break (two trailing spaces or a backslash) is deliberate.
  if (block.some((l) => /( {2}|\\)$/.test(l))) return block;
  const out: string[] = [];
  let item: { first: string; rest: string; words: string[] } | undefined;
  const flush = () => {
    if (item) out.push(...fill(item.words, item.first, item.rest));
    item = undefined;
  };
  for (const l of block) {
    const list = l.match(/^([-*+] |\d+[.)] )(.*)$/);
    const note = l.match(/^(\[\^[^\]]+\]: )(.*)$/);
    if (list || note) {
      flush();
      const [, marker, text] = (list ?? note) as RegExpMatchArray;
      item = {
        first: marker,
        rest: " ".repeat(list ? marker.length : 4),
        words: text.split(/\s+/).filter(Boolean),
      };
    } else {
      item ??= { first: "", rest: "", words: [] };
      item.words.push(...l.trim().split(/\s+/).filter(Boolean));
    }
  }
  flush();
  return out;
}

// A block is prose when every line is text: its first line is not a heading,
// table, quote, tag, expression or import, and no line is indented (unless it
// continues a list item or footnote) or starts a tag.
function isProse(block: string[]): boolean {
  if (/^(#|\||>|<|\{|\}|import\b|export\b|---|===|```|~~~)/.test(block[0]))
    return false;
  let inItem = /^([-*+] |\d+[.)] |\[\^[^\]]+\]: )/.test(block[0]);
  for (const l of block) {
    // A nested list, a link definition or a heading underline: leave it.
    if (/^(\s+([-*+]|\d+[.)]) |\[[^\]^][^\]]*\]: |-{3,}\s*$|={3,}\s*$)/.test(l))
      return false;
  }
  for (const l of block.slice(1)) {
    if (/^([-*+] |\d+[.)] |\[\^[^\]]+\]: )/.test(l)) inItem = true;
    else if (/^\s/.test(l) ? !inItem : /^[<{}|#>]/.test(l)) return false;
  }
  return true;
}

export function wrap(source: string): string {
  const lines = source.split("\n");
  const out: string[] = [];
  let i = 0;
  if (lines[0] === "---") {
    const end = lines.indexOf("---", 1);
    out.push(...lines.slice(0, end + 1));
    i = end + 1;
  }
  let fence: string | undefined;
  let block: string[] = [];
  const flush = () => {
    if (block.length) out.push(...(isProse(block) ? wrapBlock(block) : block));
    block = [];
  };
  for (; i < lines.length; i++) {
    const l = lines[i];
    const mark = l.match(/^\s*(```+|~~~+)/)?.[1];
    if (fence) {
      out.push(l);
      if (mark?.startsWith(fence)) fence = undefined;
    } else if (mark) {
      flush();
      fence = mark;
      out.push(l);
    } else if (l.trim() === "") {
      flush();
      out.push(l);
    } else {
      block.push(l);
    }
  }
  flush();
  return out.join("\n");
}

const check = process.argv.includes("--check");
const stale: string[] = [];
for (const name of readdirSync(DIR).filter((f) => f.endsWith(".mdx"))) {
  const path = join(DIR, name);
  const before = readFileSync(path, "utf8").replace(/\r\n/g, "\n");
  const after = wrap(before);
  if (after === before) continue;
  stale.push(path);
  if (!check) writeFileSync(path, after);
}
if (check && stale.length) {
  console.error(
    `Prose not wrapped at ${WIDTH} columns (run pnpm format):\n  ${stale.join("\n  ")}`,
  );
  process.exit(1);
}
console.log(
  stale.length
    ? `${check ? "Would wrap" : "Wrapped"} ${stale.length} post(s)`
    : "Posts already wrapped",
);
