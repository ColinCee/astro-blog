// OKLCH -> sRGB hex, with gamut clamp by reducing chroma
const lin=(c)=>c<=.0031308?12.92*c:1.055*Math.pow(c,1/2.4)-.055;
function oklch2rgb(L,C,h){const a=C*Math.cos(h*Math.PI/180),b=C*Math.sin(h*Math.PI/180);
 const l_=L+.3963377774*a+.2158037573*b,m_=L-.1055613458*a-.0638541728*b,s_=L-.0894841775*a-1.291485548*b;
 const l=l_**3,m=m_**3,s=s_**3;
 return [4.0767416621*l-3.3077115913*m+.2309699292*s,-1.2684380046*l+2.6097574011*m-.3413193965*s,-.0041960863*l-.7034186147*m+1.707614701*s];}
function hex(L,C,h){let c=C;for(let i=0;i<60;i++){const rgb=oklch2rgb(L,c,h);if(rgb.every(v=>v>=-0.0005&&v<=1.0005))return '#'+rgb.map(v=>Math.round(Math.min(1,Math.max(0,lin(v)))*255).toString(16).padStart(2,'0')).join('');c*=.95;}return '#000000';}
const lum=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]};
const cr=(a,b)=>{const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p);return (x+.05)/(y+.05)};

const NH=255, AH=262, OKH=150, WH=70;
// neutral: [L light, L dark, chroma]
const N=[[.993,.16,.003],[.982,.195,.003],[.962,.23,.004],[.94,.26,.005],[.915,.29,.006],[.885,.325,.007],[.84,.385,.008],[.76,.47,.010],[.62,.62,.012],[.52,.72,.012],[.45,.78,.012],[.22,.95,.015]];
const A=[[.985,.19,.015],[.97,.215,.03],[.945,.25,.05],[.91,.29,.08],[.87,.33,.11],[.82,.38,.14],[.75,.45,.17],[.66,.53,.20],[.55,.55,.21],[.50,.60,.21],[.47,.78,.17],[.28,.93,.09]];
const S={ok:[OKH,[[.955,.23,.05],[.62,.62,.17],[.47,.80,.13]]],warn:[WH,[[.96,.25,.06],[.76,.76,.16],[.50,.86,.13]]]};
const out={light:{},dark:{}};
N.forEach(([l,d,c],i)=>{out.light['n'+(i+1)]=hex(l,c,NH);out.dark['n'+(i+1)]=hex(d,c,NH)});
A.forEach(([l,d,c],i)=>{out.light['a'+(i+1)]=hex(l,c,AH);out.dark['a'+(i+1)]=hex(d,c,AH)});
for(const [k,[h,steps]] of Object.entries(S)){[3,9,11].forEach((s,i)=>{const [l,d,c]=steps[i];out.light[k+s]=hex(l,c,h);out.dark[k+s]=hex(d,c,h)})}
// checks
const chk=[];
for(const m of ['light','dark']){const t=out[m];
 chk.push([m,'n12 on n1',cr(t.n12,t.n1)],[m,'n11 on n2',cr(t.n11,t.n2)],[m,'n11 on n3',cr(t.n11,t.n3)],[m,'n10 on n1',cr(t.n10,t.n1)],[m,'n10 on n3',cr(t.n10,t.n3)],[m,'a11 on n1',cr(t.a11,t.n1)],[m,'a11 on n3',cr(t.a11,t.n3)],[m,'a11 on a3',cr(t.a11,t.a3)],[m,'ok11 on ok3',cr(t.ok11,t.ok3)],[m,'ok11 on n1',cr(t.ok11,t.n1)],[m,'warn11 on warn3',cr(t.warn11,t.warn3)],[m,'warn11 on n1',cr(t.warn11,t.n1)],[m,'white on a9',cr('#ffffff',t.a9)]);}
chk.forEach(([m,n,v])=>console.log((v>=4.5?'ok  ':'FAIL')+' '+m.padEnd(5)+n.padEnd(16)+v.toFixed(2)));
const vars=(t)=>Object.entries(t).map(([k,v])=>`--${k}:${v}`).join(';');
const css=`:root{${vars(out.light)};color-scheme:light}\n:root[data-theme="dark"]{${vars(out.dark)};color-scheme:dark}`;
import('node:fs').then(fs=>{fs.writeFileSync('scales.css',css);fs.writeFileSync('scales.json',JSON.stringify(out,null,1));console.log('written');});
