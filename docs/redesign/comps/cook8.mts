// Round 8: the one-liner moves back to centre stage, on the right; the figures
// move down and each joins the project it belongs to. Built from
// hero-figures.html. node cook8.mts → hero-line.html
import { readFileSync, writeFileSync } from 'node:fs';
const here = (p: string) => new URL(p, import.meta.url);
const ankiCards = JSON.parse(readFileSync(here('../../../src/data/anki-cards.json'), 'utf8'));
let html = readFileSync(here('hero-figures.html'), 'utf8');
const cut = (from: string, to: string, put: string) => {
  const a = html.indexOf(from), b = html.indexOf(to, a);
  if (a < 0 || b < 0) throw new Error('marker not found: ' + from.slice(0, 40));
  html = html.slice(0, a) + put + html.slice(b);
};

const social = html.slice(html.indexOf('<div class="kin__social">'), html.indexOf('</div>', html.indexOf('<div class="kin__social">')) + 6);

const hero = `<section class="hero" aria-label="Colin Cheung">
    <div class="hero__copy">
      <h1 class="who__name">Colin Cheung</h1>
      <p class="who__role">Senior Software Engineer</p>
      ${social}
    </div>
    <div class="ql" data-ql title="click for the next one">
      <p class="ql__cap"><span>today's one-liner</span><span data-ql-n>01 / 18</span></p>
      <div class="ql__stage"><p class="ql__line" data-ql-line></p></div>
      <ol class="ql__reel" data-ql-reel aria-hidden="true"></ol>
      <div class="ql__bar" aria-hidden="true"><i data-ql-bar></i></div>
    </div>
  </section>

  `;
cut('<section class="hero"', '<section class="term"', hero);

const lab = `<div class="dg dg--lab" data-edges="internet>host"><svg class="dg__edges"></svg>
    <span class="node node--cloud" id="internet"><svg class="cl" viewBox="20 4 214 108" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="cl-soft" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--cl-top)"/><stop offset="1" style="stop-color:var(--cl-base)"/></linearGradient></defs><path class="cl__under" d="M50 104A24 24 0 1 1 58 57.4A30 30 0 0 1 100.5 30.7A36 36 0 0 1 168.5 33.7A28 28 0 0 1 205.7 56.1A24 24 0 0 1 204 104Z" transform="translate(0 5)"/><path class="cl__top" d="M50 104A24 24 0 1 1 58 57.4A30 30 0 0 1 100.5 30.7A36 36 0 0 1 168.5 33.7A28 28 0 0 1 205.7 56.1A24 24 0 0 1 204 104Z"/></svg><span class="node__k">internet</span><span class="node__s">cloudflare tunnel</span></span>
    <div class="node node--host" id="host"><span class="node__k"><b>mini-PC</b> · 5 compose stacks</span>
      <div class="lab__grid">
        <span class="node"><span class="node__k"><span class="dot"></span>observability</span><span class="node__s">grafana · loki</span></span>
        <span class="node"><span class="node__k"><span class="dot"></span>crowdsec</span><span class="node__s">blocked <b data-n="1284" data-tick="1" data-every="4000">1,284</b></span></span>
        <span class="node"><span class="node__k"><span class="dot"></span>flight-tracker</span><span class="node__s">seen today <b data-n="212" data-tick="1" data-every="7000">212</b></span></span>
        <span class="node"><span class="node__k"><span class="dot"></span>home-assistant</span><span class="node__s">19.5°C inside</span></span>
        <span class="node node--wide"><span class="node__k"><span class="dot"></span>backup</span><span class="node__s">restic, nightly at 03:00</span></span>
      </div></div>
  </div>`;
const train = `<div class="tr">
    <svg viewBox="0 0 320 150" aria-label="Reward over time, 2018 versus now">
      <line class="grid" x1="40" y1="30" x2="310" y2="30"/><line class="grid" x1="40" y1="60" x2="310" y2="60"/><line class="grid" x1="40" y1="90" x2="310" y2="90"/><line class="grid" x1="40" y1="120" x2="310" y2="120"/>
      <line class="ax" x1="40" y1="10" x2="40" y2="130"/><line class="ax" x1="40" y1="130" x2="310" y2="130"/>
      <path class="old" d="M40 128 C80 126 110 120 150 104 S230 70 310 62"/>
      <path class="new" d="M40 128 C55 120 62 90 80 70 S120 34 170 28 S260 22 310 20"/>
      <text x="44" y="146">0</text><text x="296" y="146">12 h</text><text x="4" y="24">reward</text>
      <text x="200" y="76">2018 · cpu</text><text x="190" y="18" style="fill:var(--accent)">2026 · gpu</text>
    </svg>
    <div class="bars" style="margin-top:0"><span>2018</span><i><b style="--w:100%"></b></i><em>12 h</em><span>2026</span><i class="hot"><b style="--w:1.5%"></b></i><em class="hot">11 min</em></div>
  </div>`;
const radar = `<div class="rd"><canvas data-radar width="560" height="560"></canvas>
    <div><span class="node"><span class="node__k">seen today</span><span class="node__v" data-n="212" data-tick="1" data-every="7000">212</span><span class="node__s">ads-b, one antenna</span></span>
      <div style="height:.6rem"></div><span class="node"><span class="node__k">tracking now</span><span class="node__v hot" data-n="7">7</span><span class="node__s">two with callsigns</span></span></div>
  </div>`;
const anki = `<div class="ak">
    <div class="ak__card" data-anki><span class="ak__hz" lang="zh">蒸</span><span class="ak__py">zhēng · zing1</span><span class="ak__mn">to evaporate, to steam</span></div>
    <button class="ak__next" type="button" data-anki-next>next card</button>
  </div>`;
const deliver = `<div class="dg dg--deliver" data-edges="repo>build,build>edge,edge>you"><svg class="dg__edges"></svg>
    <span class="node" id="repo"><span class="node__k">git push</span><span class="node__v">main</span><span class="node__s">github</span></span>
    <span class="node" id="build"><span class="node__k">astro build</span><span class="node__v" data-n="14">14 s</span><span class="node__s">cloudflare pages</span></span>
    <span class="node node--cloud" id="edge"><svg class="cl" viewBox="20 4 214 108" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="cl-soft" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--cl-top)"/><stop offset="1" style="stop-color:var(--cl-base)"/></linearGradient></defs><path class="cl__under" d="M50 104A24 24 0 1 1 58 57.4A30 30 0 0 1 100.5 30.7A36 36 0 0 1 168.5 33.7A28 28 0 0 1 205.7 56.1A24 24 0 0 1 204 104Z" transform="translate(0 5)"/><path class="cl__top" d="M50 104A24 24 0 1 1 58 57.4A30 30 0 0 1 100.5 30.7A36 36 0 0 1 168.5 33.7A28 28 0 0 1 205.7 56.1A24 24 0 0 1 204 104Z"/></svg><span class="node__k">cloudflare edge</span><span class="node__v" data-n="330">330</span><span class="node__s">cities</span></span>
    <span class="node" id="you"><span class="node__k">you</span><span class="node__v hot" data-n="24">24 ms</span><span class="node__s">first byte</span></span>
  </div>`;

const projects = [
  ['dissertation', 'game AI, 2018 and 2026', 'github.com/ColinCee/GVGAI-Dissertation', 'reward over time, same model', train],
  ['flight-tracker', 'London airspace, live', 'flight-tracker-at-home.pages.dev', 'london airspace · simulated here', radar],
  ['home-lab', 'one mini-PC, five stacks', 'github.com/ColinCee/homelab', 'what runs on it', lab],
  ['anki-chinese', 'my Mandarin deck', 'github.com/ColinCee/anki-chinese', 'a card from the deck', anki],
  ['colincheung.dev', 'this site', 'github.com/ColinCee/astro-blog', 'how this page reached you · sample', deliver],
] as const;
const items = projects.map(([name, desc, repo, cap, fig], k) => `<article class="pj__item${k === 0 ? ' is-on' : ''}" data-pj-item>
      <button class="pj__head" type="button" data-pj-pick><b>${name}</b><span>${desc}</span></button>
      <figure class="pj__fig"><p class="pj__cap">${cap}</p><div class="pj__body">${fig}</div><a class="pj__link" href="https://${repo}">${repo} ↗</a></figure>
    </article>`).join('\n    ');
cut('<section class="sec">\n    <div class="sec__head"><h2>Projects</h2>', '<section class="sec" id="post">', `<section class="sec" id="projects">
    <div class="sec__head"><h2>Projects</h2></div>
    <div class="pj" data-pj>
    ${items}
    </div>
  </section>

  `);

// the terminal, locked 30 Oct 2026 (rounds 11-17): whoami is the two names, top has
// one time column, weather is live; the right pane is shipped, and links to the CV.
// The Parquet export was at EDF and is also a post, so its title links there.
const shipped = html.slice(html.indexOf('<ul class="ship">'), html.indexOf('</ul>', html.indexOf('<ul class="ship">')) + 5)
  .replace('Data-lake export, as Parquet <small>Post · Sep 2025</small>', '<a href="/blog/jsonl-to-parquet-compression">Data-lake export, as Parquet</a> <small>EDF Energy · Sep 2025</small>');
if (!shipped.includes('EDF Energy · Sep 2025')) throw new Error('parquet line');
const posts = [
  ['jest-to-vitest', 'Oct 29 2026', "Migrating from Jest to Vitest made tests 18× quicker, but it's not what you think", '428 s → 23 s', '1,370 simulations'],
  ['dissertation-revival-jev', 'Oct 27 2026', 'Part 3: How Jev performs on Aliens', '82% vs 80%', 'win rate, holding shoot vs Jev'],
  ['dissertation-revival-beating-2018', 'Oct 25 2026', 'Part 2: Beating my 2018 dissertation AI', '73% → 99%', 'win rate, 2018 vs 2026'],
  ['dissertation-revival-speed', 'Oct 20 2026', 'Part 1: How Claude made my 2018 RL training 65x faster', '12 h → 11 min', 'per training run'],
  ['private-ci-in-firecracker-microvms', 'Oct 16 2026', "CI Faster Than GitHub's, for Free", '26 s → 20 s', 'vs GitHub'],
  ['i-sued-easyjet-and-won', 'Aug 24 2026', 'I Sued easyJet and Won', '£127 → £826.61', 'one hearing'],
  ['jsonl-to-parquet-compression', 'Sep 03 2025', 'JSONL is a waste of space', '4.5 GB → 221 MB', '95% smaller'],
  ['saving-time-in-ts-jest', 'Apr 03 2025', 'Slash Your ts-jest Test Times', '−10 min', 'off CI'],
];
// a stat that got better: old value struck in grey, new value blue; a plain comparison stays ink
const stat = (v: string) => v.includes('→') ? `<s>${v.split(' → ')[0]}</s><b>${v.split(' → ')[1]}</b>` : v.includes(' vs ') ? `<b class="flat">${v}</b>` : `<b>${v}</b>`;
const short = (d: string) => d.slice(0, 6);
const wrPane = `<div class="pane pane--wr">
        <p class="cmd">ls -t ~/writing</p>
        <ul class="wr">
          ${posts.slice(0, 5).map(([slug, d, t, v]) => `<li><a href="/blog/${slug}"><span class="wr__d">${short(d)}</span><span class="wr__t">${t}</span><span class="wr__s">${stat(v)}</span></a></li>`).join('\n          ')}
        </ul>
        <p class="out cv__more"><a href="/blog">all ${posts.length} posts →</a></p>
      </div>`;
const skills = [['react', '9y'], ['typescript', '8y'], ['aws', '7y'], ['distributed-sys', '6y'], ['ai-development', '2y']];
cut('<section class="term"', '<section class="sec">', `<section class="term" aria-label="Colin at a glance, as a terminal session">
    <div class="term__bar"><span class="term__dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="term__name">~/ColinOS</span></div>
    <div class="term__panes">
      <div class="pane pane--who">
        <div class="blk blk--who"><p class="cmd">whoami</p>
        <p class="who__name">Colin Cheung <span class="cjk" lang="zh-Hant">張志權</span></p></div>
        <div class="blk blk--top"><p class="cmd">top -u colin</p>
        <div class="mon"><span class="h">COMMAND</span><span class="h">TIME+</span>
          ${skills.map(([k, t]) => `<span class="pname">${k}</span><span class="ptime">${t}</span>`).join('\n          ')}
        </div></div>
        <div class="blk blk--wx"><p class="cmd">weather</p>
        <p class="out" data-wx>Glasgow · 9°C, light rain</p>
        <p class="cmd rest"></p></div>
      </div>
      ${wrPane}
      <div class="pane pane--ship">
        <p class="pane__head"><span>shipped</span></p>
        ${shipped}
        <p class="out cv__more"><a href="/cv">the full cv →</a></p>
      </div>
    </div>
  </section>

  `);

{ const a = html.indexOf('<ol class="rows">'), b = html.indexOf('</ol>', a) + 5;
  html = html.slice(0, a) + '<ol class="rows">\n      ' + posts.map(([slug, d, t, v, l]) => `<li class="row"><span class="row__date">${d}</span><a href="/blog/${slug}"><span class="row__title">${t}</span></a><span class="row__stat">${stat(v)}<small>${l}</small></span></li>`).join('\n      ') + '\n    </ol>' + html.slice(b);
  html = html.replace('<span class="mono">7 posts · blue got better</span>', `<span class="mono">${posts.length} posts</span>`); }

// the strip (round 25): the name and the year he started, a slash between; no
// icons, no lengths (they read as job-hopping)
{
  const jobs = [
    ['PodFather', '2017'],
    ['Skyscanner', '2020'],
    ['Hometree', '2021'],
    ['Hopper', '2022'],
    ['BBC', '2022'],
    ['EDF Energy', '2023'],
  ] as const;
  const one = (hide: boolean) => jobs.map(([n, y]) => `<span class="strip__co"${hide ? ' aria-hidden="true"' : ''}><span class="co__n">${n}</span><small>${y}</small></span>`).join('');
  const a = html.indexOf('<div class="strip__track">'), b = html.indexOf('</div>', a);
  html = html.slice(0, a) + '<div class="strip__track">\n        ' + one(false) + '\n        ' + one(true) + '\n      ' + html.slice(b); }

// the old rotator drove [data-quip]; the new one lives in the round-8 script.
// The status-bar clock is gone with the bar.
html = html.replace('<section class="sec">\n    <div class="sec__head"><h2>Worked at</h2>', '<section class="sec sec--worked">\n    <div class="sec__head"><h2>Worked at</h2>');
cut('const q=document.querySelector', '</script>', '');

// Locked 30 Oct 2026: one-liners in Sora 200 (punchline 400), name and headings in
// Sora 600, body in Geist, mono in DM Mono. Rounds 9-10 compared the others.
const faceCss = ':root{--q-font:"Sora",var(--sans);--q-w:200;--q-b:400;--q-track:-.03em;--q-size:1}';
html = html.replace(/<link href="https:\/\/fonts.googleapis.com\/css2[^"]*"/, '<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Sora:wght@200..600&family=DM+Mono:wght@300;400;500&display=swap"');
const css = `
/* ---------- round 8 ---------- */
.hero{grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);min-height:24rem}
/* the one-liner, on the right */
.ql{position:relative;cursor:pointer;display:grid;grid-template-rows:auto 1fr auto;min-width:0}
.ql__cap{display:flex;justify-content:space-between;gap:1rem;margin:0;font-family:var(--mono);font-size:.75rem;color:var(--faint)}
.ql__stage{display:flex;align-items:center;min-height:7.5rem}
.ql__line,.ql__reel li{margin:0;font-family:var(--q-font);font-weight:var(--q-w);font-size:calc(clamp(1.3rem,2.1vw,1.8rem) * var(--q-size,1));line-height:1.35;letter-spacing:var(--q-track);color:var(--ink);text-wrap:balance}
.ql__line{transition:opacity .25s ease}
.ql__line b,.ql__reel b{font-weight:var(--q-b)}
.ql .q-svg{display:inline-block;height:1.1em;vertical-align:-.2em}
.ql .q-meter,.ql .q-dots,.ql .q-split{vertical-align:.1em}
.ql .q-ctr{display:inline-block;min-width:1.6ch;padding:0 .4ch;border-radius:3px;background:var(--accent-solid);color:#fff;font-weight:500;text-align:center;font-variant-numeric:tabular-nums;line-height:1.3}
.ql__bar{height:2px;background:var(--n4);border-radius:2px;overflow:hidden}
.ql__bar i{display:block;height:100%;width:0;background:var(--n9)}
.ql__bar i.run{animation:ql-run var(--every,5s) linear forwards}
.ql:hover .ql__bar i.run{animation-play-state:paused}
@keyframes ql-run{to{width:100%}}
.ql__reel{display:none}
${faceCss}

/* panel: the old fig. 0 on its own */
:root[data-hero="panel"] .ql{background:var(--panel);border-radius:var(--r);padding:1.25rem 1.5rem 1.4rem;min-height:19rem}
:root[data-hero="panel"] .ql__stage{justify-content:center;text-align:center}
:root[data-hero="panel"] .ql__line{text-align:center;max-width:24ch}
/* bare: type on the page, no box */
:root[data-hero="bare"] .ql{grid-template-rows:auto auto auto;align-self:center;gap:1rem;padding-left:clamp(0rem,3vw,2.5rem);border-left:1px solid var(--line-strong)}
:root[data-hero="bare"] .ql__stage{min-height:8.5rem}
:root[data-hero="bare"] .ql__line{max-width:26ch;font-size:clamp(1.4rem,2.4vw,2rem)}
:root[data-hero="bare"] .ql__bar{max-width:12rem}
/* reel: the current one, and the next one faint underneath */
:root[data-hero="reel"] .ql__stage{display:none}
:root[data-hero="reel"] .ql{gap:.8rem;align-self:center}
:root[data-hero="reel"] .ql__reel{display:block;position:relative;list-style:none;margin:0;padding:0;height:9rem;overflow:hidden;-webkit-mask:linear-gradient(#000 60%,transparent);mask:linear-gradient(#000 60%,transparent)}
.ql__reel ol,.ql__reel{counter-reset:none}
.ql__reel .track{position:absolute;inset:0 0 auto;will-change:transform}
.ql__reel .track.go{transition:transform .7s cubic-bezier(.3,.7,.2,1)}
.ql__reel li{max-width:28ch;padding:0 0 1.1rem;color:var(--ink);opacity:.18;transition:opacity .7s}
.ql__reel li.cur{opacity:1}
.ql__reel li.gone{opacity:0;transition-duration:.35s}
:root[data-hero="reel"] .ql__bar{max-width:12rem}

/* type: Sora for the name and headings, DM Mono for everything mono */
:root{--mono:"DM Mono",ui-monospace,monospace;--head:"Sora",var(--sans)}
.hero__copy .who__name,.who__name,.sec h2,.row__title,.post h1,.post h2,.pj__head b,.strip__co{font-family:var(--head)}
.hero__copy .who__name{letter-spacing:-.05em;font-weight:600}
.who__name,.row__title,.sec h2{letter-spacing:-.03em}

/* writing (round 18). term: the latest five in the terminal instead of shipped,
   and no writing section. compact: shipped stays; the section is two columns
   of title and stat, no panel, no dates */
.pane--wr{grid-area:right}
.wr{list-style:none;margin:0;padding:0;display:grid;gap:.15rem}
.wr a{display:grid;grid-template-columns:3.4rem 1fr auto;gap:1rem;align-items:baseline;padding:.4rem 0;color:var(--t-ink)}
.wr__d{color:var(--t-faint);font-size:.75rem;white-space:nowrap}
.wr__t{font-family:var(--sans);font-size:.9375rem;font-weight:400;letter-spacing:-.01em;line-height:1.3}
.wr a:hover .wr__t{text-decoration:underline;text-underline-offset:.2em}
.wr__s{white-space:nowrap;text-align:right}
.wr__s s,.row__stat s{color:var(--t-faint);text-decoration-thickness:1px;margin-right:.4rem}
.wr__s b{font-weight:500;color:var(--t-ok)}
.wr__s b.flat{color:var(--t-ink)}
:root[data-writing="term"] .pane--ship,:root[data-writing="term"] #writing,:root[data-writing="compact"] .pane--wr{display:none}
:root[data-writing="compact"] #writing .rows{background:transparent;padding:0;display:grid;grid-template-columns:1fr 1fr;column-gap:3rem}
:root[data-writing="compact"] #writing .row{grid-template-columns:1fr auto;gap:1rem;padding:.7rem 0;border-top:1px solid var(--line-2)}
:root[data-writing="compact"] #writing .row:nth-child(2){border-top:1px solid var(--line-2)}
:root[data-writing="compact"] #writing .row__date,:root[data-writing="compact"] #writing .row__stat small{display:none}
:root[data-writing="compact"] #writing .row__title{font-size:1rem}
@media(max-width:40rem){.wr a{grid-template-columns:1fr auto}.wr__d{display:none}:root[data-writing="compact"] #writing .rows{grid-template-columns:1fr}}

/* worked at (round 19). Both: names in thin Sora like the one-liners, years in
   DM Mono, no grey band. thin: the marquee, slower, with an even gap at the seam
   (each name carries its own right margin, so -50% lands exactly). still: no
   motion; the six names spread along one hairline, oldest to now, a dot each,
   the current one in blue */
:root[data-worked] .strip{background:transparent;border-radius:0;padding:.4rem 0}
:root[data-worked] .strip__co{font-weight:200;font-size:clamp(1.6rem,2.6vw,2.1rem);letter-spacing:-.03em;color:var(--ink)}
:root[data-worked] .strip__co small{font-size:.75rem;letter-spacing:0;color:var(--faint)}
:root[data-worked="thin"] .strip__track{gap:0;padding:0;animation-duration:70s}
:root[data-worked="thin"] .strip__co{margin-right:4.5rem}
:root[data-worked="still"] .strip{overflow:visible;mask:none;-webkit-mask:none;padding:0;margin-top:1.4rem}
:root[data-worked="still"] .strip__track{animation:none;width:auto;padding:1.4rem 0 0;gap:1rem;justify-content:space-between;position:relative}
:root[data-worked="still"] .strip__track::before{content:"";position:absolute;left:0;right:0;top:0;height:1px;background:var(--line-strong)}
:root[data-worked="still"] .strip__co[aria-hidden]{display:none}
:root[data-worked="still"] .strip__co{flex-direction:column;gap:.2rem;position:relative;font-size:clamp(1.25rem,2vw,1.6rem)}
:root[data-worked="still"] .strip__co::before{content:"";position:absolute;left:0;top:calc(-1.4rem - 3px);width:7px;height:7px;border-radius:50%;background:var(--n7)}
:root[data-worked="still"] .strip__co:nth-child(6)::before{background:var(--accent-solid)}
@media(max-width:40rem){:root[data-worked="still"] .strip__track{display:grid;grid-template-columns:1fr 1fr;row-gap:1.6rem}:root[data-worked="still"] .strip__track::before,:root[data-worked="still"] .strip__co::before{display:none}}

.vc:empty{display:none}
/* light mode, softer (round 31): bright white panels on a pale page read as a flashbang. soft: a mid-grey
   page, off-white panels, no pure white anywhere */
:root[data-depth][data-light="soft"]:not([data-theme="dark"]){--bg:var(--n5);--panel:var(--n2);--well:var(--n4)}
/* controls (theme toggle, icon links) at 6px; panels stay 8px (round 29) */
:root[data-corners]{--r-pill:6px}
/* worked at, between names: a thin slash in Sora, centred in the 4.5rem gap and
   on the name's line (round 23) */
.strip__co{position:relative}
.strip__co::after{content:"/";position:absolute;top:var(--sep-y,1.45rem);right:-2.25rem;transform:translate(50%,-50%);font-family:var(--head);font-weight:200;font-size:2rem;line-height:1;color:var(--n7)}
/* the year sits beside the name, on its baseline (round 24) */
.strip__co{flex-direction:row;align-items:baseline;gap:.7rem}
.strip__co small{font-size:.75rem;color:var(--faint)}
.strip__co::after{top:50%}
/* the slashes carry the blue (round 25) */
.strip__co::after{color:var(--accent-solid)}

/* terminal: two panes, whoami / top / weather and shipped */
.term__panes{grid-template-areas:"who right"}
.pane--ship,.pane--now{grid-area:right}

.mon{grid-template-columns:1fr 4rem}
.blk + .blk{margin-top:1rem}
.ship__head a:hover{text-decoration:underline;text-underline-offset:.2em}
.cv__more{margin-top:1rem}
.cv__more a{color:var(--t-muted);text-decoration:underline;text-decoration-color:var(--line-strong);text-underline-offset:.2em}
.cv__more a:hover{color:var(--t-ink)}

.mon .ptime{color:var(--t-ink)}
/* shipped bars: no labels, grey above is before, blue below is after */
.ship__bar{grid-template-columns:1fr 5.5rem}
.ship__bar > span:first-child{display:none}
.ship__bar--after{margin-top:.2rem}
@media(max-width:56rem){.term__panes{grid-template-areas:"who" "right"}}

/* the cloud node (round 27): five bumps on a flat base, drawn bigger than the
   text box so the words sit in its body. tone: a lighter cloud on a darker copy
   of itself 5 units lower, depth by tone and no shadow. line: an outline in the
   diagram's line weight. soft: a fill fading from light at the top to the base */
.node--cloud{padding:1.1rem 1.5rem .7rem}
.node--cloud::before{display:none}
.node--cloud .cl{position:absolute;left:-.9rem;right:-.9rem;top:-1.7rem;bottom:-.5rem;width:calc(100% + 1.8rem);height:calc(100% + 2.2rem);z-index:-1;overflow:visible}
:root{--cl-top:var(--n3);--cl-base:var(--n5)}
:root[data-theme="dark"]{--cl-top:var(--n6);--cl-base:var(--n4)}
.cl__top{fill:var(--cl-top)}
.cl__under{fill:var(--cl-base)}
.cl__under{display:none}
.cl__top{fill:var(--panel);stroke:var(--n8);stroke-width:1.5;vector-effect:non-scaling-stroke}
:root[data-cloud="soft"] .cl__under{display:none}
:root[data-cloud="soft"] .cl__top{fill:var(--cl-grad)}

/* projects: each figure joins its project */
.pj{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.75rem}
.pj__item{background:var(--panel);border-radius:var(--r);padding:1.25rem 1.5rem 1.2rem;display:grid;grid-template-rows:auto 1fr;gap:1.1rem;min-width:0}
.pj__item:last-child{grid-column:1/-1}
.pj__head{all:unset;display:grid;gap:.15rem;pointer-events:none}
.pj__head b{font-weight:600;letter-spacing:-.01em;font-size:1.0625rem}
.pj__head span{color:var(--muted);font-size:.9375rem}
.pj__fig{margin:0;display:grid;grid-template-rows:auto 1fr auto;gap:.9rem;min-width:0}
.pj__cap{margin:0;font-family:var(--mono);font-size:.72rem;color:var(--faint)}
.pj__body{display:grid;align-items:center;min-width:0}
.pj__link{font-family:var(--mono);font-size:.75rem;color:var(--faint);justify-self:start}
.pj__link:hover{color:var(--ink);text-decoration:underline;text-underline-offset:.2em}
.pj .tr .new{animation:none}
.pj__fig.seen .tr .new{animation:drawline 2.6s cubic-bezier(.2,.7,.2,1) .2s forwards}
.pj .rd canvas{max-width:14rem;justify-self:center}
.pj .dg--lab .lab__grid .node{padding:.5rem .65rem .55rem}
/* anki: one card */
.ak{display:grid;justify-items:center;gap:.8rem}
.ak__card{display:grid;justify-items:center;gap:.25rem;background:var(--well);border-radius:var(--r-s);padding:1.4rem 2.2rem 1.2rem;min-width:13rem}
.ak__hz{font-size:4rem;line-height:1;font-weight:400}
.ak__py{font-family:var(--mono);font-size:.8125rem;color:var(--muted);margin-top:.4rem}
.ak__mn{font-size:.9375rem}
.ak__next{appearance:none;border:0;background:none;font-family:var(--mono);font-size:.75rem;color:var(--faint);cursor:pointer;padding:.2rem .4rem}
.ak__next:hover{color:var(--ink)}

/* picker: the list on the left, one figure on the right */
:root[data-proj="picker"] .pj{grid-template-columns:minmax(15rem,.8fr) minmax(0,2fr);grid-auto-rows:min-content;gap:.25rem 1.5rem}
:root[data-proj="picker"] .pj__item{display:contents}
:root[data-proj="picker"] .pj__head{pointer-events:auto;cursor:pointer;grid-column:1;padding:.85rem 1.1rem;border-radius:var(--r-s);transition:background .15s}
:root[data-proj="picker"] .pj__head:hover{background:color-mix(in oklab,var(--panel) 55%,transparent)}
:root[data-proj="picker"] .pj__head:focus-visible{outline:2px solid var(--ink);outline-offset:-2px}
:root[data-proj="picker"] .is-on .pj__head{background:var(--panel)}
:root[data-proj="picker"] .pj__head span{font-size:.875rem}
:root[data-proj="picker"] .pj{gap:.1rem 2.5rem}
:root[data-proj="picker"] .pj__head,:root[data-proj="picker"] .pj__head:hover,:root[data-proj="picker"] .is-on .pj__head{background:none;padding:.55rem 0;border-radius:0}
:root[data-proj="picker"] .pj__head b{position:relative;color:var(--muted);font-weight:500;transition:color .15s}
:root[data-proj="picker"] .pj__head:hover b,:root[data-proj="picker"] .is-on .pj__head b{color:var(--ink)}
/* the open project: a blue slash hanging in the margin, like the worked-at slashes */
:root[data-proj="picker"] .is-on .pj__head b::before{content:"/";position:absolute;right:calc(100% + .45rem);color:var(--accent-solid);font-weight:300}
:root[data-proj="picker"] .pj__head span{color:var(--faint)}
/* the list keeps its own spacing; the figure's extra height goes to a last, empty row */
:root[data-proj="picker"] .pj{grid-template-rows:repeat(5,min-content) 1fr}
:root[data-proj="picker"] .pj__fig{grid-column:2;grid-row:1/7;display:none;background:var(--panel);border-radius:var(--r);padding:1.25rem 1.5rem 1.2rem;min-height:22rem}
:root[data-proj="picker"] .is-on .pj__fig{display:grid}
:root[data-proj="picker"] .pj .rd canvas{max-width:20rem}
:root[data-proj="picker"] .pj .tr svg{max-width:30rem}

@media(max-width:56rem){
  :root[data-hero="reel"] .ql__reel{height:9.5rem}
  .hero{grid-template-columns:1fr}
  :root[data-proj="picker"] .is-on .pj__head{border-radius:var(--r) var(--r) 0 0}
  :root[data-proj="picker"] .pj__fig{border-radius:0 0 var(--r) var(--r);margin-top:-.25rem}
  :root[data-hero="bare"] .ql{border-left:0;padding-left:0;border-top:1px solid var(--line-strong);padding-top:1.2rem}
  .pj{grid-template-columns:1fr}
  :root[data-proj="picker"] .pj{grid-template-columns:1fr}
  :root[data-proj="picker"] .pj{grid-template-rows:none}
  :root[data-proj="picker"] .pj__fig{grid-column:1;grid-row:auto;min-height:0}
}
@media(prefers-reduced-motion:reduce){.ql__reel .track.go,.ql__reel li{transition:none}.ql__bar{display:none}}
`;
html = html.replace('</style>', css + '</style>');

// switches: only this round's choices; his earlier picks are fixed
html = html.replace('</head>', '<!-- colour scales from tokens.mts (node tokens.mts) -->\n<link rel="stylesheet" href="scales.css">\n</head>');
html = html.replace('<html lang="en">', '<html lang="en" data-corners="mid" data-depth="flat" data-density="airy" data-name="medium" data-list="panel" data-hero="reel" data-proj="picker" data-writing="term" data-worked="thin">');
html = html.replace(/const opts=\{[^}]*\};/, "const opts={light:['soft','bright']};");
html = html.replaceAll("'v3-'", "'v8-'");
html = html.replace('<title>Figures · more of them</title>', '<title>One-liner right</title>');

// the figures script, rewritten for one-liner + projects
const s = html.lastIndexOf('<script>\n(()=>{const reduce');
const e = html.indexOf('</script>', s) + 9;
const radarStart = html.indexOf('// radar', s), radarEnd = html.indexOf('})();</script>', radarStart);
const radarCode = html.slice(radarStart, radarEnd); // the old bouncing dots; replaced below
// The radar (round 26): Heathrow at the centre, runway 27 east-west, the four
// holding stacks (BNN, LAM, BIG, OCK). Each plane is an arrow that steers toward
// its next waypoint at a limited turn rate, so its track curves like a real one:
// arrivals come in from the edge, may fly one lap of a stack, then turn onto a
// long final from the east and land; departures roll west and turn out; the rest
// cross at cruise. A short fading trail shows where each one has been.
const radarJs = String.raw`const cv=document.querySelector('[data-radar]');if(cv){const ctx=cv.getContext('2d'),css=(n)=>getComputedStyle(root).getPropertyValue(n).trim();
 const S=cv.width,k=S/260,cx=S/2,cy=S/2,R=S/2-4*k,px=(x)=>cx+x*R,py=(y)=>cy+y*R,rnd=(a,b)=>a+Math.random()*(b-a),pick=(a)=>a[Math.floor(Math.random()*a.length)];
 const stacks={BNN:[-.55,-.5],LAM:[.55,-.5],BIG:[.55,.5],OCK:[-.55,.5]},airlines=['BAW','EZY','VIR','RYR','DLH','AFR','KLM','UAE','SHT','IBE'];
 const onEdge=(a)=>[Math.cos(a)*1.12,Math.sin(a)*1.12];
 const lap=([x,y])=>[[x+.09,y],[x+.09,y+.07],[x,y+.07],[x,y]];
 const route=()=>{const r=Math.random();
  if(r<.45){const s=pick(Object.values(stacks)),start=onEdge(Math.atan2(s[1],s[0])+rnd(-.35,.35)),side=Math.sign(s[1]);
   // runway 27 lands westbound: from a west stack fly an eastbound downwind on that
   // side, then base and final; from an east stack go straight to base and final
   const dy=side*rnd(.26,.36),pattern=s[0]<0?[[-.25,dy],[.55,dy],[.85,side*.14]]:[[.85,side*rnd(.18,.26)]];
   return {kind:'arr',p:start,v:.0022,wps:[s,...(Math.random()<.6?lap(s):[]),...pattern,[.92,0],[.45,0],[0,0]]}}
  if(r<.7)return {kind:'dep',p:[.02,0],h:Math.PI,v:.0016,wps:[[-.38,0],onEdge(Math.PI+rnd(-1.1,1.1))]};
  const a=rnd(0,7);return {kind:'ovf',p:onEdge(a),v:.0032,wps:[[rnd(-.4,.4),rnd(-.4,.4)],onEdge(a+Math.PI+rnd(-.5,.5))]}};
 const spawn=()=>{const r=route(),[x,y]=r.p,w=r.wps[0];return {...r,x,y,h:r.h??Math.atan2(w[1]-y,w[0]-x),i:0,trail:[],cs:pick(airlines)+Math.floor(rnd(10,990))}};
 const step=(p)=>{const w=p.wps[p.i];if(!w)return;const t=Math.atan2(w[1]-p.y,w[0]-p.x);let d=t-p.h;d=Math.atan2(Math.sin(d),Math.cos(d));
  p.h+=Math.max(-.03,Math.min(.03,d));if(p.kind==='dep')p.v=Math.min(.0034,p.v*1.004);
  p.x+=Math.cos(p.h)*p.v;p.y+=Math.sin(p.h)*p.v;if(Math.hypot(w[0]-p.x,w[1]-p.y)<.05)p.i++;
  p.t=(p.t||0)+1;if(p.t%4===0)p.trail.push([p.x,p.y]);if(p.trail.length>45)p.trail.shift()};
 const done=(p)=>(p.kind==='arr'&&p.i>=p.wps.length)||Math.hypot(p.x,p.y)>1.2&&p.i>0;
 // seven planes, spread along their routes so the screen is busy from the start; two get labels
 const planes=Array.from({length:7},(_,j)=>{const p=spawn();for(let n=rnd(0,500);n>0&&!done(p);n--)step(p);if(done(p))Object.assign(p,spawn());p.hot=j<2;return p});
 let a=0;const frame=()=>{ctx.clearRect(0,0,S,S);const line=css('--n6'),faint=css('--n9'),hot=css('--accent-solid'),mono=css('--mono');
  ctx.strokeStyle=line;ctx.lineWidth=k;[.33,.66,1].forEach((r)=>{ctx.beginPath();ctx.arc(cx,cy,R*r,0,7);ctx.stroke()});
  ctx.lineWidth=3*k;ctx.strokeStyle=css('--n8');ctx.beginPath();ctx.moveTo(px(-.06),cy);ctx.lineTo(px(.06),cy);ctx.stroke();
  ctx.font=9*k+'px '+mono;ctx.fillStyle=faint;for(const [n,[x,y]] of Object.entries(stacks)){ctx.beginPath();ctx.arc(px(x),py(y),2*k,0,7);ctx.fill();ctx.fillText(n,px(x)+5*k,py(y)-5*k)}
  a+=reduce?0:.012;const g=ctx.createConicGradient(a,cx,cy);g.addColorStop(0,css('--n7'));g.addColorStop(.12,'transparent');ctx.fillStyle=g;ctx.globalAlpha=.35;ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,R,a-.75,a);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
  ctx.save();ctx.beginPath();ctx.arc(cx,cy,R,0,7);ctx.clip();
  for(const p of planes){if(!reduce)step(p);
   ctx.lineWidth=1.3*k;for(let t=1;t<p.trail.length;t++){ctx.globalAlpha=t/p.trail.length*.5;ctx.strokeStyle=p.hot?hot:faint;ctx.beginPath();ctx.moveTo(px(p.trail[t-1][0]),py(p.trail[t-1][1]));ctx.lineTo(px(p.trail[t][0]),py(p.trail[t][1]));ctx.stroke()}ctx.globalAlpha=1;
   ctx.save();ctx.translate(px(p.x),py(p.y));ctx.rotate(p.h);ctx.scale(k,k);ctx.fillStyle=p.hot?hot:css('--n10');ctx.beginPath();ctx.moveTo(8,0);ctx.lineTo(-6,-5);ctx.lineTo(-2.5,0);ctx.lineTo(-6,5);ctx.closePath();ctx.fill();ctx.restore();
   if(p.hot){ctx.font=10*k+'px '+mono;ctx.fillStyle=css('--n11');ctx.fillText(p.cs,px(p.x)+9*k,py(p.y)-8*k)}
   if(done(p)){const hot=p.hot;Object.assign(p,spawn(),{hot})}}
  ctx.restore();if(!reduce)requestAnimationFrame(frame)};frame()}`;

html = html.slice(0, s) + `<script>
(()=>{const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,root=document.documentElement;
const fmt=(v,f)=>f==='b'?(v/1e9).toFixed(2)+'B':f==='f'?v.toFixed(2):Math.round(v).toLocaleString('en-GB');
document.querySelectorAll('[data-n]').forEach(el=>{const target=+el.dataset.n,f=el.dataset.fmt,unit=el.textContent.replace(/^[\\d.,B]+/,'');
 const out=(v)=>el.textContent=fmt(v,f)+unit;
 if(!reduce){const t0=performance.now(),D=1400;const step=(t)=>{const k=Math.min(1,(t-t0)/D),e=1-Math.pow(1-k,3);out(target*e);if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step)}
 const tick=+el.dataset.tick||0;if(tick&&!reduce){let v=target;setInterval(()=>{v+=tick*(0.6+Math.random()*0.8);out(v)},+el.dataset.every||1400)}});
const draw=(dg)=>{if(!dg||!dg.offsetParent)return;const svg=dg.querySelector('.dg__edges'),R=dg.getBoundingClientRect();svg.setAttribute('viewBox','0 0 '+R.width+' '+R.height);
 let d='';for(const [a,b] of dg.dataset.edges.split(',').map(s=>s.split('>'))){const A=dg.querySelector('#'+a).getBoundingClientRect(),B=dg.querySelector('#'+b).getBoundingClientRect();
  const x1=A.right-R.left,y1=A.top+A.height/2-R.top,x2=B.left-R.left,y2=B.top+B.height/2-R.top,c=(x2-x1)/2;d+='M'+x1+' '+y1+' C'+(x1+c)+' '+y1+' '+(x2-c)+' '+y2+' '+x2+' '+y2+' '}
 svg.innerHTML='<path class="e" d="'+d+'"/><path class="p" d="'+d+'"/>'};
const drawAll=()=>document.querySelectorAll('.dg').forEach(draw);

// the one-liner: one rhythm, 5 s, hover pauses, click skips
const box=document.querySelector('[data-ql]'),line=box.querySelector('[data-ql-line]'),reel=box.querySelector('[data-ql-reel]'),num=box.querySelector('[data-ql-n]'),bar=box.querySelector('[data-ql-bar]');
const N=quips.length,EVERY=5000;let i=0,timers=[],left=EVERY,t0=0,timer;
const at=(k)=>quips[((k%N)+N)%N];
const animate=(el)=>{timers.forEach(clearTimeout);timers=[];if(reduce)return;
  const flip=el.querySelector('[data-flip]');if(flip){const [from,to]=flip.dataset.flip.split(',');flip.textContent=from;timers.push(setTimeout(()=>{flip.classList.add('is-flipping');timers.push(setTimeout(()=>flip.textContent=to,160))},1300))}
  const odo=el.querySelector('[data-odo]');if(odo){let n=Number(odo.dataset.odo);const tick=()=>{n+=10000+Math.floor(Math.random()*90000);odo.textContent=n.toLocaleString('en-GB');timers.push(setTimeout(tick,120))};tick()}};
const runBar=()=>{bar.classList.remove('run');void bar.offsetWidth;box.style.setProperty('--every',EVERY+'ms');bar.classList.add('run')};
const paint=(dir)=>{num.textContent=String(i+1).padStart(2,'0')+' / '+N;
  if(root.dataset.hero==='reel'){
    // the current line on top and the next one under it; on a change the old
    // line rises and fades out while the next one glides up into its place
    reel.innerHTML='<div class="track">'+(dir?[-1,0,1]:[0,1]).map(d=>'<li data-d="'+d+'"'+(d===-dir?' class="cur"':'')+'>'+at(i+d)+'</li>').join('')+'</div>';
    const track=reel.firstChild,top=(d)=>-track.querySelector('[data-d="'+d+'"]').offsetTop;
    track.style.transform='translateY('+top(dir?-1:0)+'px)';
    if(dir){void track.offsetWidth;track.classList.add('go');const old=track.querySelector('.cur');old.classList.remove('cur');old.classList.add('gone')}
    track.querySelector('[data-d="0"]').classList.add('cur');track.style.transform='translateY('+top(0)+'px)';
    animate(track.querySelector('[data-d="0"]'));
  }else{
    const put=()=>{line.innerHTML=at(i);line.style.opacity='1';animate(line)};
    if(dir&&!reduce){line.style.opacity='0';setTimeout(put,250)}else put();
  }
  runBar()};
const next=()=>{i=(i+1)%N;paint(1);schedule(EVERY)};
const schedule=(ms)=>{clearTimeout(timer);left=ms;t0=performance.now();if(!reduce)timer=setTimeout(next,ms)};
box.addEventListener('mouseenter',()=>{clearTimeout(timer);left-=performance.now()-t0});
box.addEventListener('mouseleave',()=>schedule(Math.max(600,left)));
box.addEventListener('click',next);
paint(0);schedule(EVERY);
document.addEventListener('change',e=>{if(e.target.dataset.k==='hero')setTimeout(()=>{paint(0);schedule(EVERY)},0);if(e.target.dataset.k==='proj')setTimeout(drawAll,0)});

// projects: picker selects on hover, focus or click; figures start when seen
const items=[...document.querySelectorAll('[data-pj-item]')];
const seen=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('seen');seen.unobserve(x.target)}}),{threshold:.4});
items.forEach(it=>seen.observe(it.querySelector('.pj__fig')));
const pick=(it)=>{if(it.classList.contains('is-on'))return;items.forEach(o=>o.classList.toggle('is-on',o===it));const f=it.querySelector('.pj__fig');f.classList.remove('seen');void f.offsetWidth;f.classList.add('seen');requestAnimationFrame(drawAll)};
items.forEach(it=>{const h=it.querySelector('[data-pj-pick]');['click','focus','pointerenter'].forEach(ev=>h.addEventListener(ev,()=>pick(it)))});
new ResizeObserver(drawAll).observe(document.querySelector('[data-pj]'));
document.fonts.ready.then(drawAll);
// weather: Glasgow now, from open-meteo (no key)
const wx=document.querySelector('[data-wx]');if(wx)fetch('https://api.open-meteo.com/v1/forecast?latitude=55.86&longitude=-4.25&current=temperature_2m,weather_code').then(r=>r.json()).then(d=>{const c=d.current.weather_code,t=Math.round(d.current.temperature_2m);
 const w=c===0?'clear':c<=2?'some cloud':c===3?'overcast':c<=48?'fog':c<=57?'drizzle':c<=67?'rain':c<=77?'snow':c<=82?'showers':c<=86?'snow showers':'thunder';wx.textContent='Glasgow · '+t+'°C, '+w}).catch(()=>{});
// anki: a card at a time, only when asked
const cards=${JSON.stringify(ankiCards.map((c: any)=>[c.hanzi,c.pinyin+' · '+c.jyutping,c.meaning]))};
let ck=0;const card=document.querySelector('[data-anki]');document.querySelector('[data-anki-next]').addEventListener('click',()=>{ck=(ck+1)%cards.length;const [h,p,m]=cards[ck];card.innerHTML='<span class="ak__hz" lang="zh">'+h+'</span><span class="ak__py">'+p+'</span><span class="ak__mn">'+m+'</span>'});
${radarJs}})();</script>` + html.slice(e);

// each cloud gets its own gradient id: a gradient inside a hidden figure does not paint
{ let n = 0; html = html.replace(/<svg class="cl" ([^>]*)><defs><linearGradient id="cl-soft"/g, (_m, a) => { n++; return `<svg class="cl" ${a} style="--cl-grad:url(#cl-soft-${n})"><defs><linearGradient id="cl-soft-${n}"`; }); }
writeFileSync(here('hero-line.html'), html);
console.log('hero-line.html', html.length);
