// Round 10: the fan LAYOUT (name + tagline left, one object right), with
// objects that are his: static at rest, animate on hover. ?obj=bench|lab|stack
import fs from 'node:fs';
let tpl = fs.readFileSync('console-v3.html', 'utf8');
const kin = tpl.match(/  <section class="kin"[\s\S]*?<\/section>\n/)[0];
const social = kin.match(/<div class="kin__social">[\s\S]*?<\/div>\n/)[0];
const quip = `<p class="kin__rot"><span data-quip><span class="q-ctr" data-flip="7,0">0</span> days since the last prod incident</span></p>`;
tpl = tpl.replace(kin, () => '{{HERO}}\n').replace(/<section class="guide">[\s\S]*?<\/section>\n/, '');
tpl = tpl.replace("const opts={hero:['name','quip','compact'],corners:['soft','mid','sharp','square'],depth:['shadow','line','flat']", "const opts={obj:['bench','lab','stack'],corners:['mid','soft','sharp','square'],depth:['flat','shadow','line']");
tpl = tpl.replace('margin-top:clamp(1.5rem,3vw,2.5rem)}', 'margin-top:clamp(2.5rem,5vw,4rem)}');
tpl = tpl.replace(/<title>.*?<\/title>/, '<title>Right · name left, one object right</title>');

const css = `
.hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(2rem,5vw,4rem);align-items:center;padding:clamp(2rem,5vw,4rem) 0 clamp(1rem,3vw,2rem);min-height:26rem}
.hero__copy .who__name{font-size:clamp(2.6rem,5.5vw,4.25rem);font-weight:600;letter-spacing:-.04em;line-height:1;margin:0}
.hero__copy .who__role{margin:.7rem 0 0;color:var(--muted);font-size:1.0625rem}
.hero__copy .kin__rot{margin:1.6rem 0 0;text-align:left}
.kin__rot [data-quip]{justify-content:flex-start}
.hero__copy .kin__social{margin:1.6rem 0 0;justify-content:flex-start}
.obj{display:none;min-width:0}
:root[data-obj="bench"] .obj--bench,:root[data-obj="lab"] .obj--lab,:root[data-obj="stack"] .obj--stack{display:block}

/* 1 · bench: a framed figure, bars replay on hover */
.fig2{position:relative;background:var(--panel);border-radius:var(--r);padding:1.2rem 1.4rem 1.3rem}
.fig2__cap{display:flex;justify-content:space-between;font-family:var(--mono);font-size:.75rem;color:var(--faint);margin:0 0 1rem}
.fig2__cap b{font-weight:400;color:var(--muted)}
.bench{display:grid;gap:.9rem}
.bench__row{display:grid;grid-template-columns:1fr auto;gap:.2rem .8rem;align-items:baseline}
.bench__what{font-size:.9375rem;font-weight:500;letter-spacing:-.01em}
.bench__what small{font-family:var(--mono);font-weight:400;color:var(--faint);margin-left:.5rem;font-size:.72rem}
.bench__v{font-family:var(--mono);font-size:.875rem;font-variant-numeric:tabular-nums;color:var(--faint);white-space:nowrap}
.bench__v b{color:var(--accent);font-weight:500}
.bench__v s{text-decoration-thickness:1px;margin-right:.35rem}
.bench__bars{grid-column:1/3;display:grid;gap:.25rem}
.bench__bars i{display:block;height:.5rem;border-radius:3px;background:var(--n4)}
.bench__bars i b{display:block;height:100%;border-radius:3px;width:var(--w);background:var(--n8)}
.bench__bars i.hot b{background:var(--accent-solid)}
.fig2:hover .bench__bars i b{animation:grow 1.1s cubic-bezier(.2,.7,.2,1) both}
.fig2:hover .bench__row:nth-child(2) i b{animation-delay:.1s}.fig2:hover .bench__row:nth-child(3) i b{animation-delay:.2s}.fig2:hover .bench__row:nth-child(4) i b{animation-delay:.3s}
@keyframes grow{from{width:0}}
.fig2__hint{position:absolute;right:1.4rem;bottom:.9rem;font-family:var(--mono);font-size:.7rem;color:var(--faint)}
.fig2:hover .fig2__hint{opacity:0}

/* 2 · lab: the homelab as a diagram, packets move on hover */
.lab2{background:var(--panel);border-radius:var(--r);padding:1.2rem 1.4rem 1.1rem}
.lab2 svg{width:100%;height:auto;display:block;font-family:var(--mono);font-size:11px}
.lab2 .box{fill:none;stroke:var(--line-strong);stroke-width:1}
.lab2 .host{fill:var(--well);stroke:none}
.lab2 .edge{fill:none;stroke:var(--n7);stroke-width:1.5}
.lab2 .pkt{fill:none;stroke:var(--accent-solid);stroke-width:2;stroke-dasharray:4 14;stroke-dashoffset:0;opacity:0}
.lab2:hover .pkt{opacity:1;animation:flow 1.2s linear infinite}
@keyframes flow{to{stroke-dashoffset:-36}}
.lab2 .t{fill:var(--ink);font-weight:500}.lab2 .s{fill:var(--faint);font-size:10px}
.lab2 .dot2{fill:var(--status-ok)}
.lab2:hover .dot2{animation:pulse 1.6s ease-in-out infinite}
@keyframes pulse{50%{opacity:.3}}
.lab2 .cloud{fill:var(--n3);stroke:var(--line-strong)}

/* 3 · stack: three cards, neat; spread on hover */
.stack{position:relative;height:22rem}
.card2{position:absolute;left:50%;top:50%;width:min(19rem,88%);transform:translate(-50%,-50%) translate(var(--dx),var(--dy)) rotate(var(--rot,0deg));background:var(--panel);border-radius:var(--r);padding:1.1rem 1.25rem 1.2rem;box-shadow:0 1px 2px rgba(22,27,34,.05),0 16px 32px -20px rgba(22,27,34,.3);transition:transform .7s cubic-bezier(.2,.7,.2,1);z-index:var(--z)}
:root[data-theme="dark"] .card2{box-shadow:0 0 0 1px rgba(255,255,255,.07),0 16px 32px -20px rgba(0,0,0,.9)}
.card2--a{--dx:-1.2rem;--dy:1.4rem;--z:1}.card2--b{--dx:0;--dy:0;--z:2}.card2--c{--dx:1.2rem;--dy:-1.4rem;--z:3}
.stack:hover .card2--a{--dx:-9rem;--dy:2rem;--rot:-6deg}.stack:hover .card2--b{--dx:0;--dy:-2.5rem}.stack:hover .card2--c{--dx:9rem;--dy:2rem;--rot:6deg}
.card2__k{margin:0 0 .5rem;font-family:var(--mono);font-size:.7rem;color:var(--faint)}
.card2 h3{margin:0 0 .7rem;font-size:1.05rem;font-weight:600;letter-spacing:-.02em;line-height:1.25}
.card2 .bench__bars{display:grid;gap:.25rem}
.card2__stat{margin:0;font-family:var(--mono);font-size:1.2rem}.card2__stat s{color:var(--faint);text-decoration-thickness:1px;margin-right:.4rem}.card2__stat b{color:var(--accent);font-weight:500}.card2__stat small{display:block;font-family:var(--sans);font-size:.75rem;color:var(--faint)}
.card2--anki{text-align:center;perspective:900px}
.card2__flip{position:relative;transform-style:preserve-3d;transition:transform .8s cubic-bezier(.2,.7,.2,1);min-height:6.5rem}
.stack:hover .card2__flip{transform:rotateY(180deg)}
.card2__face{position:absolute;inset:0;backface-visibility:hidden;display:grid;place-items:center}
.card2__face--back{transform:rotateY(180deg);align-content:center;gap:.1rem}
.card2__hanzi{font-size:3.4rem;line-height:1;margin:0}
.card2__py{margin:0;font-weight:500}.card2__mean{margin:0;color:var(--muted);font-size:.9rem}
@media(max-width:56rem){.hero{grid-template-columns:1fr;min-height:0}.stack{height:20rem}.stack:hover .card2--a{--dx:-3rem}.stack:hover .card2--c{--dx:3rem}}
`;

const bars = (w) => `<div class="bench__bars"><i><b style="--w:100%"></b></i><i class="hot"><b style="--w:${w}"></b></i></div>`;
const hero = `
  <section class="hero" aria-label="Colin Cheung">
    <div class="hero__copy">
      <h1 class="who__name">Colin Cheung</h1>
      <p class="who__role">Senior Software Engineer · Glasgow · open to remote</p>
      ${quip}
      ${social}
    </div>
    <div class="hero__obj">
      <div class="obj obj--bench"><figure class="fig2" style="margin:0">
        <p class="fig2__cap"><span>fig. 1 · <b>four things made faster</b></span><span>before → after</span></p>
        <div class="bench">
          <div class="bench__row"><span class="bench__what">HRMS → Active Directory sync<small>Skyscanner · 2020</small></span><span class="bench__v"><s>8 h</s><b>2 min</b></span>${bars('1%')}</div>
          <div class="bench__row"><span class="bench__what">Build + test cycle<small>EDF Energy · 2024</small></span><span class="bench__v"><s>30 min</s><b>5 min</b></span>${bars('17%')}</div>
          <div class="bench__row"><span class="bench__what">CI-log debugging time<small>BBC · 2022</small></span><span class="bench__v"><s>baseline</s><b>−90%</b></span>${bars('10%')}</div>
          <div class="bench__row"><span class="bench__what">Data-lake export, as Parquet<small>home · 2025</small></span><span class="bench__v"><s>4.5 GB</s><b>221 MB</b></span>${bars('5%')}</div>
        </div>
        <span class="fig2__hint">hover to replay</span>
      </figure></div>
      <div class="obj obj--lab"><figure class="lab2" style="margin:0">
        <p class="fig2__cap"><span>fig. 2 · <b>the homelab</b></span><span>one mini-PC · 5 stacks</span></p>
        <svg viewBox="0 0 520 250" aria-label="Homelab diagram">
          <path class="cloud" d="M28 118 a22 22 0 0 1 40 -14 a18 18 0 0 1 34 10 a14 14 0 0 1 -2 28 H40 a16 16 0 0 1 -12 -24z"/>
          <text class="t" x="62" y="128" text-anchor="middle">internet</text>
          <path class="edge" d="M110 124 H190 C210 124 210 150 230 150 H250"/>
          <path class="pkt" d="M110 124 H190 C210 124 210 150 230 150 H250"/>
          <rect class="box" x="118" y="92" width="92" height="22" rx="4"/><text class="s" x="164" y="107" text-anchor="middle">cloudflared tunnel</text>
          <rect class="host" x="250" y="20" width="250" height="210" rx="10"/>
          <text class="s" x="262" y="40">mini-PC · 32 GB · Compose</text>
          <g><rect class="box" x="262" y="52" width="110" height="38" rx="4" style="fill:var(--panel)"/><circle class="dot2" cx="276" cy="71" r="3.5"/><text class="t" x="286" y="68">observability</text><text class="s" x="286" y="82">grafana · loki</text></g>
          <g><rect class="box" x="382" y="52" width="106" height="38" rx="4" style="fill:var(--panel)"/><circle class="dot2" cx="396" cy="71" r="3.5"/><text class="t" x="406" y="68">crowdsec</text><text class="s" x="406" y="82">bouncer</text></g>
          <g><rect class="box" x="262" y="131" width="110" height="38" rx="4" style="fill:var(--panel)"/><circle class="dot2" cx="276" cy="150" r="3.5"/><text class="t" x="286" y="147">flight-tracker</text><text class="s" x="286" y="161">backend</text></g>
          <g><rect class="box" x="382" y="131" width="106" height="38" rx="4" style="fill:var(--panel)"/><circle class="dot2" cx="396" cy="150" r="3.5"/><text class="t" x="406" y="147">home-assistant</text><text class="s" x="406" y="161">lights, heating</text></g>
          <g><rect class="box" x="262" y="180" width="226" height="38" rx="4" style="fill:var(--panel)"/><circle class="dot2" cx="276" cy="199" r="3.5"/><text class="t" x="286" y="196">backup</text><text class="s" x="286" y="210">restic, nightly at 03:00</text></g>
          <path class="edge" d="M372 150 H382"/><path class="pkt" d="M372 150 H382"/>
          <path class="edge" d="M317 90 V131"/><path class="pkt" d="M317 90 V131"/>
          <path class="edge" d="M317 169 V180"/><path class="pkt" d="M317 169 V180"/>
          <text class="s" x="30" y="236">hover: traffic</text>
        </svg>
      </figure></div>
      <div class="obj obj--stack"><div class="stack">
        <article class="card2 card2--a"><p class="card2__k">shipped · Skyscanner · 2020</p><h3>HRMS → Active Directory sync</h3>${bars('1%')}<p class="card2__stat" style="margin-top:.6rem"><s>8 h</s><b>2 min</b></p></article>
        <article class="card2 card2--b"><p class="card2__k">post · Oct 20 2026</p><h3>How Claude made my 2018 RL training 65x faster</h3><p class="card2__stat"><s>12 h</s><b>11 min</b><small>per training run</small></p></article>
        <article class="card2 card2--c card2--anki"><p class="card2__k">anki · today's card</p><div class="card2__flip"><div class="card2__face"><p class="card2__hanzi">蒸</p></div><div class="card2__face card2__face--back"><p class="card2__py">zhēng · zing1</p><p class="card2__mean">to evaporate, to steam</p></div></div></article>
      </div></div>
    </div>
  </section>
`;
let h = tpl.replace('{{HERO}}', () => hero).replace('</style>', () => css + '</style>');
fs.writeFileSync('hero-right.html', h);
console.log('right', h.length);
