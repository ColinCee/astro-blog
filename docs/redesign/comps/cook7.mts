// Round 13: more figures in the flow style (clouds kept), pipeline dropped,
// and the one-liner given a place: ?quip=left|big|slide
import fs from 'node:fs';
let tpl = fs.readFileSync('console-v3.html', 'utf8');
const kin = tpl.match(/  <section class="kin"[\s\S]*?<\/section>\n/)[0];
const social = kin.match(/<div class="kin__social">[\s\S]*?<\/div>\n/)[0];
const quip = `<p class="kin__rot"><span data-quip><span class="q-ctr" data-flip="7,0">0</span> days since the last prod incident</span></p>`;
tpl = tpl.replace(kin, () => '{{HERO}}\n').replace(/<section class="guide">[\s\S]*?<\/section>\n/, '');
tpl = tpl.replace("const opts={hero:['name','quip','compact'],corners:['soft','mid','sharp','square'],depth:['shadow','line','flat']", "const opts={line:['left','big','slide'],corners:['mid','soft','sharp','square'],depth:['flat','shadow','line']");
tpl = tpl.replace('margin-top:clamp(1.5rem,3vw,2.5rem)}', 'margin-top:clamp(2.5rem,5vw,4rem)}');
tpl = tpl.replace(/<title>.*?<\/title>/, '<title>Figures · more of them</title>');

const css = `
.hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);gap:clamp(2rem,5vw,4rem);align-items:center;padding:clamp(2rem,5vw,4rem) 0 clamp(1rem,3vw,2rem);min-height:26rem}
.hero__copy .who__name{font-size:clamp(2.6rem,5.5vw,4.25rem);font-weight:600;letter-spacing:-.04em;line-height:1;margin:0}
.hero__copy .who__role{margin:.7rem 0 0;color:var(--muted);font-size:1.0625rem}
.hero__copy .kin__rot{margin:1.6rem 0 0;text-align:left}
.kin__rot [data-quip]{justify-content:flex-start}
.hero__copy .kin__social{margin:1.6rem 0 0;justify-content:flex-start}
/* the one-liner, three ways */
:root[data-line="big"] .hero__copy .kin__rot{font-size:1.25rem;color:var(--ink);max-width:28ch;line-height:1.4}
:root[data-line="big"] .hero__copy .kin__rot b{font-weight:600}
:root[data-line="slide"] .hero__copy .kin__rot{display:none}
.slide--quip{display:grid;place-items:center;text-align:center;min-height:14rem}
.slide--quip .kin__rot{margin:0;font-size:clamp(1.3rem,2.4vw,1.75rem);color:var(--ink);max-width:26ch;line-height:1.4;text-align:center}
.slide--quip .kin__rot [data-quip-copy]{display:inline-flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:.1em .55ch}
.slide--quip .kin__rot b{font-weight:600}
.slide--quip .q-svg{height:1.2em}
:root:not([data-line="slide"]) .slide--quip{display:none!important}

.figs{position:relative;background:var(--panel);border-radius:var(--r);padding:1.25rem 1.5rem 1.1rem;min-height:21rem;display:grid;grid-template-rows:auto 1fr auto}
.figs__cap{display:block;font-family:var(--mono);font-size:.75rem;color:var(--faint);margin:0 0 1.1rem;min-height:1.2em}
.figs__cap b{font-weight:400;color:var(--muted)}
.figs__stage{position:relative}
.slide{position:absolute;inset:0;opacity:0;transition:opacity .6s ease;pointer-events:none}
.slide.is-on{position:relative;opacity:1;pointer-events:auto}
.figs__foot{display:flex;justify-content:space-between;align-items:center;gap:1rem;margin-top:1.1rem;font-family:var(--mono);font-size:.72rem;color:var(--faint)}
.figs__foot b{font-weight:500;color:var(--ink)}
.dots{display:flex;gap:.45rem}
.dots button{width:.5rem;height:.5rem;border-radius:50%;border:0;padding:0;background:var(--n6);cursor:pointer}
.dots button.is-on{background:var(--ink);width:1.2rem;border-radius:3px}

.dg{position:relative;display:grid;gap:1rem 2.75rem;align-items:center}
.dg__edges{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:0}
.dg__edges .e{fill:none;stroke:var(--n6);stroke-width:1.5}
.dg__edges .p{fill:none;stroke:var(--accent-solid);stroke-width:2;stroke-dasharray:3 15;stroke-linecap:round;animation:flow 7s linear infinite}
.dg__edges .p.rev{animation-direction:reverse}
.figs:hover .dg__edges .p{animation-duration:1.8s}
@keyframes flow{to{stroke-dashoffset:-72}}
.node{position:relative;z-index:1;display:block;background:var(--panel);border:1px solid var(--line-strong);border-radius:var(--r-s);padding:.7rem .85rem .75rem;text-decoration:none;color:inherit;min-width:0;transition:border-color .2s,transform .2s}
.node:hover{border-color:var(--ink);transform:translateY(-1px)}
.node__k{display:block;font-family:var(--mono);font-size:.72rem;color:var(--faint);line-height:1.2;margin-bottom:.3rem}
.node__v{display:block;font-family:var(--mono);font-size:1.25rem;line-height:1.1;letter-spacing:-.02em;font-variant-numeric:tabular-nums;color:var(--ink)}
.node__v.hot{color:var(--accent)}
.node__s{display:block;font-family:var(--mono);font-size:.72rem;color:var(--faint);margin-top:.3rem;line-height:1.3}
.node--host{background:var(--well);border-color:transparent;padding:.85rem .9rem .9rem}
.node--host .node__k{margin-bottom:.6rem}
.node--host .node__k b{color:var(--ink);font-weight:500}
/* a cloud-shaped node: the internet, cloudflare, weather */
.node--cloud{background:transparent;border:0;padding:1.4rem 1.1rem 1.1rem;text-align:center}
.node--cloud::before{content:"";position:absolute;inset:0;z-index:-1;background:var(--n3);border:1px solid var(--line-strong);border-radius:999px;-webkit-mask:radial-gradient(circle at 30% 70%,#000 32%,transparent 33%),radial-gradient(circle at 55% 45%,#000 40%,transparent 41%),radial-gradient(circle at 78% 68%,#000 30%,transparent 31%),linear-gradient(#000,#000) bottom/100% 32% no-repeat;mask:radial-gradient(circle at 30% 70%,#000 32%,transparent 33%),radial-gradient(circle at 55% 45%,#000 40%,transparent 41%),radial-gradient(circle at 78% 68%,#000 30%,transparent 31%),linear-gradient(#000,#000) bottom/100% 32% no-repeat;transition:transform .2s}
.node--cloud:hover{transform:none}.node--cloud:hover::before{transform:translateY(-1px)}
.node--cloud .node__k{margin-bottom:.15rem}
.spark{display:flex;align-items:flex-end;gap:2px;height:1.25rem;margin-top:.5rem}
.spark i{flex:1;background:var(--n6);border-radius:1px}.spark i.hot{background:var(--accent-solid)}
.dot{display:inline-block;width:.45rem;height:.45rem;border-radius:50%;background:var(--status-ok);margin-right:.4rem;vertical-align:.05em;animation:pulse 3s ease-in-out infinite}
@keyframes pulse{50%{opacity:.3}}
.bars{display:grid;grid-template-columns:3.2rem 1fr 3.6rem;gap:.4rem .7rem;align-items:center;font-family:var(--mono);font-size:.72rem;color:var(--faint);margin-top:1.1rem}
.bars i{height:.5rem;background:var(--n4);border-radius:3px;overflow:hidden;display:block}.bars i b{display:block;height:100%;width:var(--w);background:var(--n8);border-radius:3px}.bars i.hot b{background:var(--accent-solid)}
.bars em{font-style:normal;text-align:right;color:var(--muted)}.bars em.hot{color:var(--accent);font-weight:500}

.dg--factory{grid-template-columns:1fr 1.25fr 1fr;grid-template-rows:1fr 1fr}
.dg--factory .node--host{grid-row:1/3;grid-column:2}
#ideas{grid-column:1;grid-row:1}#bugs{grid-column:1;grid-row:2}#prs{grid-column:3;grid-row:1}#deploys{grid-column:3;grid-row:2}
.dg--lab{grid-template-columns:1fr 2.2fr;gap:1rem 2.5rem}
.dg--lab .lab__grid{display:grid;grid-template-columns:1fr 1fr;gap:.6rem}
.dg--lab .lab__grid .node{padding:.55rem .7rem .6rem}
.dg--lab .lab__grid .node--wide{grid-column:1/3}
/* delivery: repo → build → edge cloud → you */
.dg--deliver{grid-template-columns:1fr 1fr 1.2fr 1fr;gap:1rem 2rem}
/* weather: one big cloud with rain */
.wx{display:grid;grid-template-columns:1fr 1fr;gap:1rem 2rem;align-items:center;min-height:13rem}
.wx__cloud{position:relative;height:9rem}
.wx__cloud svg{width:100%;height:100%;overflow:visible}
.wx__cloud .c{fill:var(--n3);stroke:var(--line-strong)}
.wx__cloud .r{stroke:var(--accent-solid);stroke-width:2;stroke-linecap:round;stroke-dasharray:6 14;animation:rain 1.1s linear infinite}
.wx__cloud .r:nth-child(2n){animation-delay:-.4s}.wx__cloud .r:nth-child(3n){animation-delay:-.7s}
@keyframes rain{to{stroke-dashoffset:-20}}
.wx__big{font-family:var(--mono);font-size:3rem;line-height:1;letter-spacing:-.03em;margin:0}
.wx__s{font-family:var(--mono);font-size:.78rem;color:var(--muted);margin:.5rem 0 0;line-height:1.6}
/* training: a curve drawing itself */
.tr{display:grid;grid-template-columns:1.4fr 1fr;gap:1rem 2rem;align-items:center}
.tr svg{width:100%;height:auto;overflow:visible}
.tr .ax{stroke:var(--line-strong);stroke-width:1}
.tr .grid{stroke:var(--line-2)}
.tr .old{fill:none;stroke:var(--n7);stroke-width:1.5;stroke-dasharray:3 4}
.tr .new{fill:none;stroke:var(--accent-solid);stroke-width:2;stroke-dasharray:600;stroke-dashoffset:600}
.slide.is-on .tr .new{animation:drawline 2.6s cubic-bezier(.2,.7,.2,1) .3s forwards}
@keyframes drawline{to{stroke-dashoffset:0}}
.tr text{font-family:var(--mono);font-size:10px;fill:var(--faint)}
/* radar */
.rd{display:grid;grid-template-columns:1fr 1fr;gap:1rem 2rem;align-items:center}
.rd canvas{width:100%;aspect-ratio:1;border-radius:50%;background:var(--n3);border:1px solid var(--line-strong);display:block}
@media(prefers-reduced-motion:reduce){.dg__edges .p,.dot,.wx__cloud .r{animation:none}.tr .new{stroke-dashoffset:0}}
@media(max-width:56rem){.hero{grid-template-columns:1fr;min-height:0}}
@media(max-width:40rem){.dg--factory{grid-template-columns:1fr 1fr;grid-template-rows:auto}.dg--factory .node--host{grid-row:2;grid-column:1/3}#ideas{grid-column:1;grid-row:1}#bugs{grid-column:2;grid-row:1}#prs{grid-column:1;grid-row:3}#deploys{grid-column:2;grid-row:3}.dg--lab,.dg--deliver,.wx,.tr,.rd{grid-template-columns:1fr}}
`;

const node = (href, k, v, s, cls = '', id = '') => `<a class="node ${cls}" href="${href}"${id ? ` id="${id}"` : ''} data-node><span class="node__k">${k}</span>${v ? `<span class="node__v${v.hot ? ' hot' : ''}"${v.n != null ? ` data-n="${v.n}"${v.fmt ? ` data-fmt="${v.fmt}"` : ''}${v.tick ? ` data-tick="${v.tick}" data-every="${v.every || 1400}"` : ''}` : ''}>${v.text}</span>` : ''}${s ? `<span class="node__s">${s}</span>` : ''}</a>`;

const slides = [];
slides.push(`<div class="slide slide--quip" data-slide data-cap="fig. 0 · <b>today's one-liner</b>" data-foot="one of 18 · rotates every 4 s"><p class="kin__rot"><span data-quip-copy></span></p></div>`);

slides.push(`<div class="slide" data-slide data-cap="fig. 1 · <b>the software factory</b> · last 7 days · sample figures" data-foot="build + test <b>5 min</b> · review wait <b>41 min</b> · tokens per PR <b>45M</b> · <b>0</b> incidents">
  <div class="dg dg--factory" data-edges="ideas>claude,bugs>claude,claude>prs,claude>deploys"><svg class="dg__edges"></svg>
    ${node('#writing', 'ideas', { text: '14', n: 14 }, 'this week', '', 'ideas')}
    <a class="node node--host" href="#post" id="claude" data-node><span class="node__k"><span class="dot"></span><b>claude</b> · opus, sonnet</span>
      <span class="node__k">tokens in</span><span class="node__v" data-n="1214000000" data-fmt="b" data-tick="2600000" data-every="1400">1.21B</span>
      <span class="node__k" style="margin-top:.6rem">tokens out</span><span class="node__v" data-n="186000000" data-fmt="b" data-tick="410000" data-every="1400">0.19B</span>
      <span class="spark" aria-hidden="true">${[6,9,5,11,14,8,16].map((v,i)=>`<i style="height:${v*6}%"${i===6?' class="hot"':''}></i>`).join('')}</span></a>
    ${node('#writing', 'bugs found', { text: '9', n: 9 }, 'this week', '', 'bugs')}
    ${node('https://github.com/ColinCee', 'PRs merged', { text: '27', n: 27, hot: true }, 'github', '', 'prs')}
    ${node('https://github.com/ColinCee/astro-blog', 'deploys', { text: '31', n: 31 }, 'cloudflare pages', '', 'deploys')}
  </div></div>`);

slides.push(`<div class="slide" data-slide data-cap="fig. 2 · <b>how this page reached you</b> · sample figures" data-foot="static html · <b>0</b> servers · built <b>15 hours ago</b> · <b>38 kB</b> on the wire">
  <div class="dg dg--deliver" data-edges="repo>build,build>edge,edge>you"><svg class="dg__edges"></svg>
    ${node('https://github.com/ColinCee/astro-blog', 'git push', { text: 'main' }, 'github', '', 'repo')}
    ${node('https://github.com/ColinCee/astro-blog', 'astro build', { text: '14 s', n: 14 }, 'cloudflare pages', '', 'build')}
    ${node('#', 'cloudflare edge', { text: '330', n: 330 }, 'cities, one near you', 'node--cloud', 'edge')}
    ${node('#', 'you', { text: '24 ms', n: 24, hot: true }, 'time to first byte', '', 'you')}
  </div></div>`);

slides.push(`<div class="slide" data-slide data-cap="fig. 3 · <b>the homelab</b>" data-foot="one mini-PC · up <b data-n='41'>41</b> days · load <b data-n='0.42' data-fmt='f'>0.42</b> · last backup <b>03:00 ok</b>">
  <div class="dg dg--lab" data-edges="internet>host"><svg class="dg__edges"></svg>
    ${node('https://flight-tracker-at-home.pages.dev', 'internet', null, 'via a cloudflare tunnel', 'node--cloud', 'internet')}
    <div class="node node--host" id="host" data-node style="display:block"><span class="node__k"><b>mini-PC</b> · 5 compose stacks</span>
      <div class="lab__grid">
        ${node('https://github.com/ColinCee/homelab', '<span class="dot"></span>observability', null, 'grafana · loki')}
        ${node('https://github.com/ColinCee/homelab', '<span class="dot"></span>crowdsec', null, 'blocked <b data-n="1284" data-tick="1" data-every="4000">1,284</b>')}
        ${node('https://flight-tracker-at-home.pages.dev', '<span class="dot"></span>flight-tracker', null, 'seen today <b data-n="212" data-tick="1" data-every="7000">212</b>')}
        ${node('https://github.com/ColinCee/homelab', '<span class="dot"></span>home-assistant', null, '19.5°C inside')}
        ${node('https://github.com/ColinCee/homelab', '<span class="dot"></span>backup', null, 'restic, nightly at 03:00', 'node--wide')}
      </div></div>
  </div></div>`);

slides.push(`<div class="slide" data-slide data-cap="fig. 4 · <b>Glasgow, right now</b> · sample" data-foot="sunrise <b>07:52</b> · sunset <b>16:41</b> · it is always like this">
  <div class="wx">
    <div class="wx__cloud"><svg viewBox="0 0 200 130" aria-hidden="true">
      <path class="c" d="M44 78 a26 26 0 0 1 48 -18 a22 22 0 0 1 42 12 a18 18 0 0 1 -4 36 H56 a20 20 0 0 1 -12 -30z"/>
      ${[62,80,98,116,134].map(x=>`<line class="r" x1="${x}" y1="98" x2="${x-6}" y2="126"/>`).join('')}
    </svg></div>
    <div><p class="wx__big"><span data-n="9">9</span>°C</p><p class="wx__s">light rain · wind 14 mph SW<br>feels like 6°C · humidity 91%<br>open-meteo, every 10 min</p></div>
  </div></div>`);

slides.push(`<div class="slide" data-slide data-cap="fig. 5 · <b>a 2018 training run, on 2026 hardware</b>" data-foot="same model, same reward · <a href='#post'>the post</a>">
  <div class="tr">
    <svg viewBox="0 0 320 150" aria-label="Reward over time, 2018 versus now">
      ${[30,60,90,120].map(y=>`<line class="grid" x1="40" y1="${y}" x2="310" y2="${y}"/>`).join('')}
      <line class="ax" x1="40" y1="10" x2="40" y2="130"/><line class="ax" x1="40" y1="130" x2="310" y2="130"/>
      <path class="old" d="M40 128 C80 126 110 120 150 104 S230 70 310 62"/>
      <path class="new" d="M40 128 C55 120 62 90 80 70 S120 34 170 28 S260 22 310 20"/>
      <text x="44" y="146">0</text><text x="296" y="146">12 h</text><text x="4" y="24">reward</text>
      <text x="200" y="76">2018 · cpu</text><text x="190" y="18" style="fill:var(--accent)">2026 · gpu + claude</text>
    </svg>
    <div class="bars" style="margin-top:0"><span>2018</span><i><b style="--w:100%"></b></i><em>12 h</em><span>2026</span><i class="hot"><b style="--w:1.5%"></b></i><em class="hot">11 min</em></div>
  </div></div>`);

slides.push(`<div class="slide" data-slide data-cap="fig. 6 · <b>london airspace</b> · simulated" data-foot="the real one runs in the homelab · <a href='https://flight-tracker-at-home.pages.dev'>open it</a>">
  <div class="rd"><canvas data-radar width="400" height="400"></canvas>
    <div>${node('https://flight-tracker-at-home.pages.dev', 'seen today', { text: '212', n: 212, tick: 1, every: 7000 }, 'ads-b, one antenna', '')}
      <div style="height:.6rem"></div>${node('https://flight-tracker-at-home.pages.dev', 'tracking now', { text: '7', n: 7, hot: true }, 'two with callsigns', '')}</div>
  </div></div>`);

const hero = `
  <section class="hero" aria-label="Colin Cheung">
    <div class="hero__copy">
      <h1 class="who__name">Colin Cheung</h1>
      <p class="who__role">Senior Software Engineer · Glasgow · open to remote</p>
      ${quip}
      ${social}
    </div>
    <figure class="figs" data-figs style="margin:0">
      <p class="figs__cap" data-cap-out></p>
      <div class="figs__stage">${slides.join('')}</div>
      <div class="figs__foot"><span data-foot-out></span><span class="dots" data-dots></span></div>
    </figure>
  </section>
`;

const js = `
(()=>{const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt=(v,f)=>f==='b'?(v/1e9).toFixed(2)+'B':f==='f'?v.toFixed(2):Math.round(v).toLocaleString('en-GB');
document.querySelectorAll('[data-n]').forEach(el=>{const target=+el.dataset.n,f=el.dataset.fmt;
 if(!reduce){const t0=performance.now(),D=1400;const step=(t)=>{const k=Math.min(1,(t-t0)/D),e=1-Math.pow(1-k,3);el.textContent=fmt(target*e,f);if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step)}
 const tick=+el.dataset.tick||0;if(tick&&!reduce){let v=target;setInterval(()=>{v+=tick*(0.6+Math.random()*0.8);el.textContent=fmt(v,f)},+el.dataset.every||1400)}
 if(f==='f'&&!reduce){let v=target;setInterval(()=>{v=Math.max(.1,Math.min(1.5,v+(Math.random()-.5)*.08));el.textContent=fmt(v,f)},2200)}});
const draw=(dg)=>{if(!dg)return;const svg=dg.querySelector('.dg__edges'),R=dg.getBoundingClientRect();svg.setAttribute('viewBox','0 0 '+R.width+' '+R.height);
 let d='';for(const [a,b] of dg.dataset.edges.split(',').map(s=>s.split('>'))){const A=dg.querySelector('#'+a).getBoundingClientRect(),B=dg.querySelector('#'+b).getBoundingClientRect();
  const x1=A.right-R.left,y1=A.top+A.height/2-R.top,x2=B.left-R.left,y2=B.top+B.height/2-R.top,c=(x2-x1)/2;d+='M'+x1+' '+y1+' C'+(x1+c)+' '+y1+' '+(x2-c)+' '+y2+' '+x2+' '+y2+' '}
 svg.innerHTML='<path class="e" d="'+d+'"/><path class="p" d="'+d+'"/>'};
// the one-liner slide mirrors the hero's one-liner
const src=document.querySelector('[data-quip]'),copy=document.querySelector('[data-quip-copy]');
const mirror=()=>{copy.innerHTML=src.innerHTML};mirror();new MutationObserver(mirror).observe(src,{childList:true,subtree:true,characterData:true});
// slides
const all=[...document.querySelectorAll('[data-slide]')],cap=document.querySelector('[data-cap-out]'),foot=document.querySelector('[data-foot-out]'),dots=document.querySelector('[data-dots]'),figs=document.querySelector('[data-figs]');
const slides=()=>all.filter(s=>!(s.classList.contains('slide--quip')&&document.documentElement.dataset.line!=='slide'));
let i=0,timer;
const show=(n)=>{const S=slides();i=(n+S.length)%S.length;all.forEach(s=>s.classList.remove('is-on'));S[i].classList.add('is-on');cap.innerHTML=S[i].dataset.cap;foot.innerHTML=S[i].dataset.foot;
 dots.innerHTML='';S.forEach((s,k)=>{const b=document.createElement('button');b.setAttribute('aria-label','figure '+(k+1));b.classList.toggle('is-on',k===i);b.addEventListener('click',()=>{show(k);restart()});dots.appendChild(b)});
 requestAnimationFrame(()=>draw(S[i].querySelector('.dg')))};
const restart=()=>{clearInterval(timer);if(!reduce)timer=setInterval(()=>{if(!figs.matches(':hover'))show(i+1)},9000)};
show(0);restart();
new ResizeObserver(()=>draw(slides()[i].querySelector('.dg'))).observe(figs);
document.fonts.ready.then(()=>draw(slides()[i].querySelector('.dg')));
document.addEventListener('change',e=>{if(e.target.dataset.k==='line')setTimeout(()=>show(0),0)});
// radar
const cv=document.querySelector('[data-radar]');if(cv){const ctx=cv.getContext('2d');const css=(n)=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
 const planes=Array.from({length:7},(_,k)=>({x:Math.random(),y:Math.random(),vx:(Math.random()-.5)*.0014,vy:(Math.random()-.5)*.0014,hot:k<2}));let a=0;
 const frame=()=>{const W=cv.width,H=cv.height,cx=W/2,cy=H/2,R=W/2-2;ctx.clearRect(0,0,W,H);ctx.strokeStyle=css('--n6');ctx.lineWidth=1;[.33,.66,1].forEach(k=>{ctx.beginPath();ctx.arc(cx,cy,R*k,0,7);ctx.stroke()});ctx.beginPath();ctx.moveTo(cx-R,cy);ctx.lineTo(cx+R,cy);ctx.moveTo(cx,cy-R);ctx.lineTo(cx,cy+R);ctx.stroke();
  a+=reduce?0:.02;const g=ctx.createConicGradient(a,cx,cy);g.addColorStop(0,css('--n7'));g.addColorStop(.1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,R,a-.8,a);ctx.closePath();ctx.globalAlpha=.5;ctx.fill();ctx.globalAlpha=1;
  planes.forEach(p=>{if(!reduce){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>1)p.vx*=-1;if(p.y<0||p.y>1)p.vy*=-1}const px=cx+(p.x-.5)*2*R*.92,py=cy+(p.y-.5)*2*R*.92;if(Math.hypot(px-cx,py-cy)>R)return;ctx.fillStyle=p.hot?css('--accent-solid'):css('--n10');ctx.beginPath();ctx.arc(px,py,p.hot?5:3.5,0,7);ctx.fill();if(p.hot){ctx.font='14px '+css('--mono');ctx.fillStyle=css('--n10');ctx.fillText('BAW'+(p.vx>0?'12':'7'),px+9,py-8)}});
  requestAnimationFrame(frame)};frame()}
})();`;

let h = tpl.replace('{{HERO}}', () => hero).replace('</style>', () => css + '</style>');
h = h.replace('</body>', () => `<script>${js}</script>\n</body>`);
fs.writeFileSync('hero-figures.html', h);
console.log('figures', h.length);
