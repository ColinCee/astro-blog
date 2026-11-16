import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// The one walk the design-system checks share (colours.spec.ts, type.spec.ts):
// every source file's lines, each told whether it sets a style. A line that
// must break a rule says why on itself or the line before ("<kind>
// exception: ..."); a file that must, says so once ("<kind> exception
// (file): ...").
export type Line = { at: string; text: string; styled: boolean };

const SETS_STYLE = /\bstyle=|\.style\b|setProperty|fillStyle|strokeStyle/;

const files = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? files(join(dir, e.name))
      : /\.(astro|css|ts|mdx?)$/.test(e.name)
        ? [join(dir, e.name).replaceAll("\\", "/")]
        : [],
  );

export function styleLines(kind: string, skip: Set<string>): Line[] {
  const out: Line[] = [];
  for (const file of files("src")) {
    if (skip.has(file)) continue;
    const text = readFileSync(file, "utf8");
    if (text.includes(`${kind} exception (file):`)) continue;
    const lines = text.split("\n");
    // In an .astro file, only what is inside a <style> block or a style
    // attribute is a style.
    let inStyle = file.endsWith(".css");
    lines.forEach((line, i) => {
      if (file.endsWith(".astro")) {
        if (/<style\b/.test(line)) inStyle = true;
        if (/<\/style>/.test(line)) inStyle = false;
      }
      const mark = `${kind} exception:`;
      if (line.includes(mark) || (lines[i - 1] ?? "").includes(mark)) return;
      out.push({
        at: `${file}:${i + 1}`,
        text: line,
        styled: inStyle || SETS_STYLE.test(line),
      });
    });
  }
  return out;
}
