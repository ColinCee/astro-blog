// What the site's scripts share about motion: whether the reader asked for
// less of it, and running something once, the first time it is on screen.

export const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Calls fn for each element the first time it is on screen; `opts` says how
// much of it (threshold) or where the line is (rootMargin).
export function onceSeen<T extends Element>(
  els: Iterable<T>,
  fn: (el: T) => void,
  opts: IntersectionObserverInit = {},
) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries)
      if (e.isIntersecting) {
        io.unobserve(e.target);
        fn(e.target as T);
      }
  }, opts);
  for (const el of els) io.observe(el);
}
