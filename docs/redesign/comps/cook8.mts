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
    <span class="node node--cloud" id="internet"><span class="node__k">internet</span><span class="node__s">cloudflare tunnel</span></span>
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
const radar = `<div class="rd"><canvas data-radar width="400" height="400"></canvas>
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
    <span class="node node--cloud" id="edge"><span class="node__k">cloudflare edge</span><span class="node__v" data-n="330">330</span><span class="node__s">cities</span></span>
    <span class="node" id="you"><span class="node__k">you</span><span class="node__v hot" data-n="24">24 ms</span><span class="node__s">first byte</span></span>
  </div>`;

const projects = [
  ['dissertation', 'game-playing agents, trained in 2018 and again in 2026', 'github.com/ColinCee/GVGAI-Dissertation', 'reward over time, same model', train],
  ['flight-tracker', 'the London airspace; the real one is live', 'flight-tracker-at-home.pages.dev', 'london airspace · simulated here', radar],
  ['home-lab', 'one mini-PC, five Compose stacks', 'github.com/ColinCee/homelab', 'what runs on it', lab],
  ['anki-chinese', "the Mandarin deck I'm learning from", 'github.com/ColinCee/anki-chinese', 'a card from the deck', anki],
  ['colincheung.dev', 'this site, deployed from every commit', 'github.com/ColinCee/astro-blog', 'how this page reached you · sample', deliver],
] as const;
const items = projects.map(([name, desc, repo, cap, fig], k) => `<article class="pj__item${k === 0 ? ' is-on' : ''}" data-pj-item>
      <button class="pj__head" type="button" data-pj-pick><b>${name}</b><span>${desc}</span></button>
      <figure class="pj__fig"><p class="pj__cap">${cap}</p><div class="pj__body">${fig}</div><a class="pj__link" href="https://${repo}">${repo} ↗</a></figure>
    </article>`).join('\n    ');
cut('<section class="sec">\n    <div class="sec__head"><h2>Projects</h2>', '<section class="sec" id="post">', `<section class="sec" id="projects">
    <div class="sec__head"><h2>Projects</h2><span class="mono">5 repos</span></div>
    <div class="pj" data-pj>
    ${items}
    </div>
  </section>

  `);

// the terminal (round 13): whoami with the Chinese name and a live weather line
// come back; no login line, contact, tmux bar or writing pane. The right side
// is the open question: shipped, a now list, or both.
const shipped = html.slice(html.indexOf('<ul class="ship">'), html.indexOf('</ul>', html.indexOf('<ul class="ship">')) + 5);
const skills = [['react', '9y'], ['typescript', '8y'], ['aws', '7y'], ['distributed-sys', '6y'], ['ai-development', '2y']];
cut('<section class="term"', '<section class="sec">', `<section class="term" aria-label="Colin at a glance, as a terminal session">
    <div class="term__bar"><span class="term__dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="term__name">~/ColinOS</span></div>
    <div class="term__panes">
      <div class="pane pane--who">
        <p class="cmd">whoami</p>
        <p class="who__name">Colin Cheung <span class="cjk" lang="zh-Hant">張志權</span></p>
        <p class="out who__sub">Glasgow, UK · open to remote</p>
        <p class="cmd">top -u colin</p>
        <div class="mon"><span class="h">COMMAND</span><span class="h">TIME+</span>
          ${skills.map(([k, t]) => `<span class="pname">${k}</span><span class="ptime">${t}</span>`).join('\n          ')}
        </div>
        <div class="v-rich"><p class="cmd">cat now.md</p><p class="out">Tech lead @ EDF Energy, leading AI adoption across the team.</p></div>
        <p class="cmd">weather</p>
        <p class="out" data-wx>Glasgow · 9°C, light rain</p>
        <p class="cmd rest"></p>
      </div>
      <div class="pane pane--ship v-ship">
        <p class="pane__head"><span>shipped</span></p>
        ${shipped}
      </div>
      <div class="pane pane--now v-now">
        <p class="cmd">cat now.md</p>
        <dl class="now">
          <dt>work</dt><dd>Tech lead at EDF Energy, leading AI adoption across the team</dd>
          <dt>learning</dt><dd>Mandarin, one Anki card a day · today <span class="now__hz" lang="zh">${ankiCards[0].hanzi}</span> ${ankiCards[0].pinyin}</dd>
          <dt>running</dt><dd>a homelab: one mini-PC, five Compose stacks</dd>
          <dt>writing</dt><dd><a href="#post">Part 3: How Jev performs on Aliens</a></dd>
        </dl>
      </div>
    </div>
  </section>

  `);

// the old rotator drove [data-quip]; the new one lives in the round-8 script.
// The status-bar clock is gone with the bar.
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

/* terminal (round 13): two panes; the right one is the open question */
.term__panes{grid-template-areas:"who right"}
.pane--ship,.pane--now{grid-area:right}
:root:not([data-term="shipped"]) .v-ship,:root:not([data-term="now"]) .v-now{display:none}
:root:not([data-term="shipped"]) .v-rich{display:none}
:root[data-term="both"] .v-ship,:root[data-term="both"] .v-now{display:block}
:root[data-term="both"] .term__panes{grid-template-areas:"who ship" "who now"}
:root[data-term="both"] .pane--ship{grid-area:ship}:root[data-term="both"] .pane--now{grid-area:now}
.mon{grid-template-columns:1fr 4rem}
.v-rich .cmd{margin-top:1rem}
.mon .ptime{color:var(--t-ink)}
/* shipped bars: no labels, grey above is before, blue below is after */
.ship__bar{grid-template-columns:1fr 5.5rem}
.ship__bar > span:first-child{display:none}
.ship__bar--after{margin-top:.2rem}
/* now: a short list, the label in faint mono */
.now{display:grid;grid-template-columns:5.5rem 1fr;gap:.55rem 1rem;margin:0}
.now dt{color:var(--t-faint)}
.now dd{margin:0;color:var(--t-ink)}
.now a{text-decoration:underline;text-decoration-color:var(--line-strong);text-underline-offset:.2em}
.now a:hover{text-decoration-color:var(--t-ink)}
.now__hz{font-family:var(--sans);font-size:1.05em;margin:0 .15em}
@media(max-width:56rem){.term__panes,:root[data-term="both"] .term__panes{grid-template-areas:"who" "right"}:root[data-term="both"] .term__panes{grid-template-areas:"who" "ship" "now"}}

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
:root[data-proj="picker"] .pj__fig{grid-column:2;grid-row:1/span 5;display:none;background:var(--panel);border-radius:var(--r);padding:1.25rem 1.5rem 1.2rem;min-height:22rem}
:root[data-proj="picker"] .is-on .pj__fig{display:grid}
:root[data-proj="picker"] .pj .rd canvas{max-width:16rem}
:root[data-proj="picker"] .pj .tr svg{max-width:30rem}

@media(max-width:56rem){
  :root[data-hero="reel"] .ql__reel{height:9.5rem}
  .hero{grid-template-columns:1fr}
  :root[data-proj="picker"] .is-on .pj__head{border-radius:var(--r) var(--r) 0 0}
  :root[data-proj="picker"] .pj__fig{border-radius:0 0 var(--r) var(--r);margin-top:-.25rem}
  :root[data-hero="bare"] .ql{border-left:0;padding-left:0;border-top:1px solid var(--line-strong);padding-top:1.2rem}
  .pj{grid-template-columns:1fr}
  :root[data-proj="picker"] .pj{grid-template-columns:1fr}
  :root[data-proj="picker"] .pj__fig{grid-column:1;grid-row:auto;min-height:0}
}
@media(prefers-reduced-motion:reduce){.ql__reel .track.go,.ql__reel li{transition:none}.ql__bar{display:none}}
`;
html = html.replace('</style>', css + '</style>');

// switches: only this round's choices; his earlier picks are fixed
html = html.replace('<html lang="en">', '<html lang="en" data-corners="mid" data-depth="flat" data-density="airy" data-name="medium" data-list="panel" data-hero="reel">');
html = html.replace(/const opts=\{[^}]*\};/, "const opts={term:['shipped','now','both'],proj:['picker','cards']};");
html = html.replaceAll("'v3-'", "'v8-'");
html = html.replace('<title>Figures · more of them</title>', '<title>One-liner right</title>');

// the figures script, rewritten for one-liner + projects
const s = html.lastIndexOf('<script>\n(()=>{const reduce');
const e = html.indexOf('</script>', s) + 9;
const radarStart = html.indexOf('// radar', s), radarEnd = html.indexOf('})();</script>', radarStart);
const radarCode = html.slice(radarStart, radarEnd);
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
${radarCode}})();</script>` + html.slice(e);

writeFileSync(here('hero-line.html'), html);
console.log('hero-line.html', html.length);
