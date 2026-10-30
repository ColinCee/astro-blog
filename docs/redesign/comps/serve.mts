// Serves the comps with live reload: save a page, or a generator (cook8.mts,
// tokens.mts) which is rerun first, and every open page reloads.
import { createServer, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { watch } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const reload = '<script>new EventSource("/__reload").onmessage=()=>location.reload()</script>';
const clients = new Set<ServerResponse>();

createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p === "/__reload") {
    res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-store" });
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }
  if (p.endsWith("/")) p += "index.html";
  try {
    let body: Buffer | string = await readFile(p.startsWith("/shots/") ? join(root, "..", p) : join(root, p));
    if (extname(p) === ".html") body = body.toString().replace("</body>", reload + "</body>");
    res.writeHead(200, { "content-type": types[extname(p)] ?? "application/octet-stream", "cache-control": "no-store" });
    res.end(body);
  } catch {
    res.writeHead(404); res.end("not found");
  }
}).listen(+(process.env.PORT ?? 4390), () => console.log("serving on " + (process.env.PORT ?? 4390)));

// a saved generator reruns, which writes the page it makes; that write triggers the reload
const generators = new Set(["cook8.mts", "tokens.mts"]);
let timer: NodeJS.Timeout | undefined;
watch(root, (_e, file) => {
  if (!file || !/\.(html|css|mts)$/.test(file) || /^(serve|shoot|hang)/.test(file)) return;
  if (generators.has(file)) {
    try { execFileSync(process.execPath, [file], { cwd: root, stdio: "inherit" }); } catch { console.log(file + " failed"); }
    return;
  }
  clearTimeout(timer);
  timer = setTimeout(() => clients.forEach((c) => c.write("data: reload\n\n")), 150);
});
