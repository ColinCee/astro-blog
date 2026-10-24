// Minutes to read a post's Markdown at 200 words a minute, counting prose
// only: inline figures carry SVG paths and JSON that would otherwise double it.
export function readMinutes(body = ""): number {
  const prose = body
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<svg[\s\S]*?<\/svg>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .trim();
  const words = prose ? prose.split(/\s+/).length : 0;
  return Math.max(1, Math.round(words / 200));
}
