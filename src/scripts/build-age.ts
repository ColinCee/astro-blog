// "built 2h ago": every [data-build] element holds the commit date baked in
// at build; its [data-build-rel] child shows how long ago that was, kept
// current once a minute.
const fmt = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
document.querySelectorAll<HTMLElement>("[data-build]").forEach((el) => {
  const rel = el.querySelector<HTMLElement>("[data-build-rel]");
  const then = new Date(el.dataset.build ?? "").valueOf();
  if (!rel || Number.isNaN(then)) return;
  const tick = () => {
    const s = Math.round((then - Date.now()) / 1000);
    const a = Math.abs(s);
    rel.textContent =
      a < 3600
        ? fmt.format(Math.round(s / 60), "minute")
        : a < 86400
          ? fmt.format(Math.round(s / 3600), "hour")
          : fmt.format(Math.round(s / 86400), "day");
  };
  tick();
  setInterval(tick, 60_000);
});
