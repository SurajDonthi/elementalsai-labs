/* "Press Run. Watch the agents work." The workflow player from the earlier ElementalsAI Labs site (git 99e6aca),
   on the AI agents and automation funnel page (?s=automate-work). Suraj, 24 Nov 2026: "put those same here".
   Same words and data as before. The long automation list is removed and the look follows the funnel page (Suraj, 24 Nov 2026: "Remove this part" and "align fully and properly with the theme of the funnel page").
   Changes: classes start with wf- so they do not touch the funnel page; it is plain JS with no library
   (the old page loaded GSAP and Three.js only for its hero and scroll reveals, which this section does not need); it is built only when it comes
   near the screen and plays the first workflow by itself when it is in view. */
import { WF } from './wf-data.mjs';

const WFI = '<svg class="wfi" viewBox="0 0 22 14" aria-hidden="true"><circle cx="3" cy="7" r="2.3"/><circle cx="19" cy="3" r="2.3"/><circle cx="19" cy="11" r="2.3"/><path d="M5.3 7 C11 7 11 3 16.7 3 M5.3 7 C11 7 11 11 16.7 11"/></svg>';
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export const wfSection = (heading) => `<section class="sec" id="types" aria-labelledby="ty-t"><div class="wrap">
 <div class="sec-h reveal"><h2 class="h2" id="ty-t">${esc(heading)}</h2></div>
 <div class="wf" data-wf>
  <div class="wf-tabs" role="tablist"></div>
  <div class="wf-howto">${WFI}<span>Pick a workflow. Press <b>Run</b>. Each box is one step. Amber steps follow your rules: the agent acts, or asks you.</span></div>
  <div class="wf-list"></div>
  <div class="wf-shell">
   <div class="wf-bar"><div class="lights"><i></i><i></i><i></i></div><span class="wf-title">—</span><span class="wf-when"></span><span class="wf-badge"></span><span class="spacer"></span><button class="wf-run" type="button">▶ Run workflow</button></div>
   <div class="wf-sw"><div class="wf-stg"><svg class="wf-eds"></svg></div></div>
   <aside class="wf-log" aria-live="polite"><div class="wf-lh"><span>Execution</span><span class="wf-ls">idle</span></div><div class="wf-lb"></div></aside>
   <div class="wf-foot"><span><i style="background:var(--c-trigger)"></i>trigger</span><span><i style="background:var(--c-data)"></i>data</span><span><i style="background:var(--c-agent)"></i>agent</span><span><i style="background:var(--c-check)"></i>guardrail</span><span><i style="background:var(--c-approve)"></i>your policy</span><span><i style="background:var(--c-action)"></i>action</span><span><i style="background:var(--c-report)"></i>report</span></div>
  </div>
  <script type="application/json" class="wf-data">${JSON.stringify({ W: WF.W, P: WF.P }).replace(/</g, '\\u003c')}</script>
 </div>
</div></section>`;

export const WF_CSS = String.raw`.wf{--ink:#0A0A0B;--ink-2:#111113;--ink-3:#18181B;--line:#232327;--line-2:#34343A;--fg:#FFFFFF;--fg-2:#D4D2CC;--fg-3:#8A8780;
--acc:#FFBD59;--grn:#2FD574;--red:#F85149;--mono:'IBM Plex Mono',ui-monospace,SFMono-Regular,Menlo,monospace;
--c-trigger:#FFFFFF;--c-data:#9AA4B2;--c-agent:#FF9A00;--c-check:#5A5A63;--c-approve:#FFBD59;--c-action:#2FD574;--c-report:#D4D2CC;
margin-top:24px;color:var(--fg);font-family:'IBM Plex Sans',system-ui,-apple-system,'Segoe UI',sans-serif;font-size:16px;line-height:1.55}
.wf button{font-family:inherit}
.wfi{width:20px;height:13px;fill:none;stroke:currentColor;stroke-width:1.6;flex:none}.wfi circle{fill:currentColor;stroke:none}
.wf-tabs{display:flex;gap:2px;flex-wrap:wrap;margin-bottom:14px}
.wf-tab{font-size:15px;font-weight:600;padding:11px 18px;border:1px solid var(--line);background:var(--ink-3);color:var(--fg-2);cursor:pointer;display:flex;align-items:center;gap:10px;transition:background .16s,color .16s}
.wf-tab:hover{color:var(--fg)}
.wf-tab[aria-selected="true"]{background:var(--acc);color:#0A0A0B;border-color:var(--acc)}
.wf-tab .c{font-family:var(--mono);font-size:11px;opacity:.65}
.wf-howto{display:flex;align-items:center;gap:10px;font-size:14px;color:var(--fg-3);margin:4px 0 14px}.wf-howto b{color:var(--acc)}.wf-howto .wfi{color:var(--acc)}
.wf-list{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:22px}
.wf-chip{display:inline-flex;align-items:center;gap:8px;font-size:14px;padding:8px 14px;border:1px solid var(--line);background:var(--ink-3);color:var(--fg-2);cursor:pointer}
.wf-chip:hover{color:var(--fg)}
.wf-chip .no{font-family:var(--mono);font-size:11px;color:var(--fg-3)}
.wf-chip[aria-pressed="true"]{border-color:var(--acc);color:var(--acc);background:rgba(255,189,89,.08)}.wf-chip[aria-pressed="true"] .no{color:var(--acc)}
.wf-shell{display:grid;grid-template-columns:minmax(0,1fr) 340px;border:2px solid var(--fg);background:var(--ink-2);box-shadow:11px 11px 0 var(--acc);margin-right:11px}
@media (max-width:1180px){.wf-shell{grid-template-columns:1fr}}
.wf-bar{grid-column:1/-1;display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--line);background:var(--ink-3);flex-wrap:wrap}
.wf-bar .lights{display:flex;gap:6px}.wf-bar .lights i{width:10px;height:10px;background:var(--line-2)}
.wf-title{display:flex;align-items:center;gap:10px;font-weight:600;font-size:15px}
.wf-no{display:inline-flex;align-items:center;gap:6px;font-family:var(--mono);font-size:11.5px;font-weight:400;color:var(--fg-3)}
.wf-when{font-family:var(--mono);font-size:12px;color:var(--fg-3)}
.wf-bg{font-family:var(--mono);font-size:11px;padding:4px 8px;letter-spacing:.08em;text-transform:uppercase}
.wf-bg.real{background:rgba(47,213,116,.1);color:var(--grn);border:1px solid rgba(47,213,116,.35)}
.wf-bg.ex{background:transparent;color:var(--fg-3);border:1px solid var(--line-2)}
.wf-bar .spacer{flex:1}
.wf-run{font-weight:600;font-size:14px;padding:9px 16px;border:0;background:var(--acc);color:#0A0A0B;cursor:pointer;display:flex;gap:8px;align-items:center;transition:transform .16s,box-shadow .16s}
.wf-run:hover{transform:translate(-2px,-2px);box-shadow:2px 2px 0 var(--fg)}
.wf-run[disabled]{opacity:.5;cursor:default;transform:none;box-shadow:none}
.wf-sw{position:relative;overflow:hidden;padding:8px;background-color:var(--ink);background-image:radial-gradient(rgba(255,255,255,.07) 1px,transparent 1.2px);background-size:22px 22px;scrollbar-width:thin}
.wf-stg{position:relative;width:1150px;height:410px}
.wf-stg svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.wf-eg{fill:none;stroke:#2A2A30;stroke-width:2}
.wf-eg.hot{stroke:var(--acc);stroke-dasharray:6 6;animation:wf-march .6s linear infinite}
.wf-eg.done{stroke:#5A5A63}
@keyframes wf-march{to{stroke-dashoffset:-12}}
.wf-pd{fill:#fff;filter:drop-shadow(0 0 6px var(--acc))}
.wf-nd{position:absolute;width:152px;height:62px;box-sizing:border-box;background:var(--ink-3);border:1px solid var(--line-2);display:flex;align-items:center;gap:10px;padding:0 12px 0 10px;transition:border-color .25s,box-shadow .25s,transform .25s;user-select:none;color:var(--fg)}
.wf-nd .tile{width:36px;height:36px;display:grid;place-items:center;font-family:var(--mono);font-size:12px;font-weight:600;flex:none;color:#0A0A0B}
.wf-nd .tx{min-width:0}
.wf-nd .tt{font-size:13px;font-weight:600;line-height:1.18;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.wf-nd .ts{font-size:11.5px;color:var(--fg-3);line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wf-nd::before,.wf-nd::after{content:"";position:absolute;top:50%;width:8px;height:8px;background:var(--ink);border:2px solid var(--line-2);transform:translateY(-50%)}
.wf-nd::before{left:-6px}.wf-nd::after{right:-6px}
.wf-nd.t-trigger .tile{background:var(--c-trigger)}.wf-nd.t-data .tile{background:var(--c-data)}.wf-nd.t-agent .tile{background:var(--c-agent)}
.wf-nd.t-check .tile{background:var(--c-check);color:#fff}.wf-nd.t-approve .tile{background:var(--c-approve)}.wf-nd.t-action .tile{background:var(--c-action)}.wf-nd.t-report .tile{background:var(--c-report)}
.wf-nd.run{border-color:var(--fg);box-shadow:4px 4px 0 var(--acc);transform:translate(-2px,-2px)}
.wf-nd.wait{border-color:var(--acc);box-shadow:0 0 0 4px rgba(255,189,89,.16),0 0 36px -6px rgba(255,189,89,.55);animation:wf-breathe 1.6s ease-in-out infinite}
@keyframes wf-breathe{50%{box-shadow:0 0 0 8px rgba(255,189,89,.08),0 0 46px -6px rgba(255,189,89,.65)}}
.wf-nd.ok{border-color:#4A4A52}
.wf-nd .st{position:absolute;right:-8px;top:-8px;width:20px;height:20px;display:grid;place-items:center;font-size:11px;font-weight:700;opacity:0;transform:scale(.4);transition:all .25s}
.wf-nd.ok .st{opacity:1;transform:scale(1);background:var(--grn);color:#0A0A0B}.wf-nd.ok .st::before{content:"✓"}
.wf-nd.wait .st{opacity:1;transform:scale(1);background:var(--acc);color:#0A0A0B}.wf-nd.wait .st::before{content:"!"}
.wf-nd.t-approve .ts::before{content:"👤 "}
.wf-log{border-left:1px solid var(--line);background:var(--ink-2);display:flex;flex-direction:column;height:452px}
@media (max-width:1180px){.wf-log{border-left:0;border-top:1px solid var(--line);height:300px}}
.wf-lh{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--line);font-family:var(--mono);font-size:11px;color:var(--fg-3);letter-spacing:.2em;text-transform:uppercase}
.wf-lb{padding:12px 14px 16px;overflow:auto;display:flex;flex-direction:column;gap:8px;scrollbar-width:thin;flex:1}
.wf-ll{display:grid;grid-template-columns:52px 1fr;gap:8px;font-size:13.5px;line-height:1.45;color:var(--fg-2);animation:wf-in .35s ease both}
.wf-ll time{font-family:var(--mono);font-size:11.5px;color:var(--fg-3);padding-top:2px}
.wf-ll.ok span::before{content:"✓ ";color:var(--grn)}
@keyframes wf-in{from{opacity:0;transform:translateY(6px)}}
.wf-fd{margin-left:60px;padding:10px 12px;font-size:13.5px;line-height:1.4;animation:wf-in .35s ease both;border:1px solid;border-left-width:3px}
.wf-fd small{display:block;font-family:var(--mono);font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;margin-bottom:3px;opacity:.85}
.wf-fd.waste{background:rgba(248,81,73,.07);border-color:rgba(248,81,73,.4);color:#FFD7D3}
.wf-fd.opp{background:rgba(47,213,116,.07);border-color:rgba(47,213,116,.35);color:#D2F7E1}
.wf-fd.signal{background:var(--ink-3);border-color:var(--line-2);color:var(--fg-2)}
.wf-ap{margin-left:60px;border:1px solid var(--acc);background:rgba(255,189,89,.08);padding:12px;animation:wf-in .35s ease both}
.wf-ap small{display:block;font-family:var(--mono);font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--acc);margin-bottom:6px}
.wf-ap p{margin:0 0 10px;font-size:14px;color:var(--fg);line-height:1.4}
.wf-ap .row{display:flex;gap:8px}
.wf-ap button{font-size:13px;font-weight:600;padding:7px 14px;cursor:pointer;border:1px solid var(--acc);background:transparent;color:var(--acc)}
.wf-ap button.yes{background:var(--acc);color:#0A0A0B}
.wf-ap.done{opacity:.75}.wf-ap.done .row{display:none}
.wf-ap .res{font-size:13px;color:var(--acc)}
.wf-foot{grid-column:1/-1;display:flex;gap:18px;flex-wrap:wrap;padding:12px 16px;border-top:1px solid var(--line);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--fg-3);font-family:var(--mono)}
.wf-foot span{display:flex;align-items:center;gap:7px}.wf-foot i{width:10px;height:10px;display:inline-block}
@media (prefers-reduced-motion:reduce){.wf-eg.hot,.wf-nd.wait{animation:none}.wf-nd.run{transform:none}}`;

/* the old player (app.js, 99e6aca) with its logic unchanged, scoped to the section */
export const WF_JS = String.raw`(function(){var R=document.querySelector('[data-wf]');if(!R)return;
var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var $=function(s,r){return(r||R).querySelector(s)},$$=function(s,r){return[].slice.call((r||R).querySelectorAll(s))};
var h=function(tag,attrs,html){var e=document.createElement(tag);for(var k in attrs||{})e.setAttribute(k,attrs[k]);if(html)e.innerHTML=html;return e};
var s=function(tag,attrs){var e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(var k in attrs||{})e.setAttribute(k,attrs[k]);return e};
var D,WORKFLOWS,PILLARS,AUTOMATIONS,NW=152,NH=62,COL=158,ROW=138,X0=20,Y0=34,SW=1150,SH=410;
var stage=$('.wf-stg'),edgesSvg=$('.wf-eds'),logBody=$('.wf-lb'),logState=$('.wf-ls'),runBtn=$('.wf-run'),wrap=$('.wf-sw');
var current=null,runToken=0,autoRan=false,built=false,clock=7*3600;
var WFI='<svg class="wfi" viewBox="0 0 22 14" aria-hidden="true"><circle cx="3" cy="7" r="2.3"/><circle cx="19" cy="3" r="2.3"/><circle cx="19" cy="11" r="2.3"/><path d="M5.3 7 C11 7 11 3 16.7 3 M5.3 7 C11 7 11 11 16.7 11"/></svg>';
var pos=function(n){return{x:X0+n[1]*COL,y:Y0+n[2]*ROW}};
function buildTabs(){var tabs=$('.wf-tabs');PILLARS.forEach(function(p){var count=WORKFLOWS.filter(function(w){return w.pillar===p.id}).length;
var b=h('button',{class:'wf-tab',role:'tab','aria-selected':'false','data-p':p.id,type:'button'},p.name+' <span class="c">'+count+' workflows</span>');b.addEventListener('click',function(){selectPillar(p.id)});tabs.appendChild(b)})}
function selectPillar(pid){$$('.wf-tab').forEach(function(b){b.setAttribute('aria-selected',String(b.dataset.p===pid))});var list=$('.wf-list');list.innerHTML='';
WORKFLOWS.filter(function(w){return w.pillar===pid}).forEach(function(w){var c=h('button',{class:'wf-chip',type:'button','aria-pressed':'false','data-w':w.id},WFI+'<span class="no">'+w.no+'</span>'+w.name);c.addEventListener('click',function(){loadWorkflow(w.id,true)});list.appendChild(c)});
loadWorkflow(WORKFLOWS.find(function(w){return w.pillar===pid}).id,false)}
function loadWorkflow(id,autoplay){runToken++;var w=WORKFLOWS.find(function(x){return x.id===id});current=w;
$$('.wf-chip').forEach(function(c){c.setAttribute('aria-pressed',String(c.dataset.w===id))});
$('.wf-title').innerHTML='<span class="wf-no">'+WFI+'Workflow '+w.no+'</span>'+w.name;$('.wf-when').textContent=w.when;
$('.wf-badge').innerHTML=w.real?'<span class="wf-bg real">REAL DATA · from an audit</span>':'<span class="wf-bg ex">EXAMPLE RUN</span>';
$$('.wf-nd',stage).forEach(function(n){n.remove()});edgesSvg.innerHTML='';var nodeEls={};
w.nodes.forEach(function(n){var p=pos(n);var el=h('div',{class:'wf-nd t-'+n[3],style:'left:'+p.x+'px;top:'+p.y+'px','data-id':n[0]},'<span class="tile">'+n[6]+'</span><span class="tx"><div class="tt">'+n[4]+'</div><div class="ts">'+n[5]+'</div></span><span class="st"></span>');stage.appendChild(el);nodeEls[n[0]]=el});
var byId={};w.nodes.forEach(function(n){byId[n[0]]=n});
w._edges=w.edges.map(function(e){var a=e[0],b=e[1],A=pos(byId[a]),B=pos(byId[b]),d;
if(Math.abs(B.x-A.x)<60){var x1=A.x+NW/2,y1=B.y>A.y?A.y+NH:A.y,x2=B.x+NW/2,y2=B.y>A.y?B.y:B.y+NH;d='M'+x1+','+y1+' C'+x1+','+(y1+y2)/2+' '+x2+','+(y1+y2)/2+' '+x2+','+y2}
else{var x1=A.x+NW,y1=A.y+NH/2,x2=B.x,y2=B.y+NH/2,dx=Math.max(36,(x2-x1)/2);d='M'+x1+','+y1+' C'+(x1+dx)+','+y1+' '+(x2-dx)+','+y2+' '+x2+','+y2}
var p=s('path',{d:d,class:'wf-eg'});edgesSvg.appendChild(p);return{a:a,b:b,p:p}});
w._nodes=nodeEls;logBody.innerHTML='';logState.textContent='idle';appendLog('Ready. Press ▶ Run workflow.',false,'—');
runBtn.disabled=false;runBtn.textContent='▶ Run workflow';fitStage();if(autoplay)runWorkflow()}
function fitStage(){var avail=wrap.clientWidth-16,sc=Math.max(.62,Math.min(1.08,avail/SW));stage.style.width=SW+'px';stage.style.height=SH+'px';stage.style.zoom=sc;
wrap.style.overflowX=SW*sc>avail+4?'auto':'hidden';wrap.style.overflowY='hidden'}
var pad=function(x){return(x<10?'0':'')+x};
var stamp=function(){clock+=1+Math.floor(Math.random()*3);return pad(Math.floor(clock/3600)%24)+':'+pad(Math.floor(clock/60)%60)+':'+pad(clock%60)};
function appendLog(text,ok,time){if(ok===undefined)ok=true;var l=h('div',{class:'wf-ll'+(ok?' ok':'')},'<time>'+(time||stamp())+'</time><span>'+text+'</span>');logBody.appendChild(l);logBody.scrollTop=logBody.scrollHeight;return l}
function appendFind(f){var kind=f[0],lab=kind==='waste'?'Waste found':kind==='opp'?'Opportunity':'Signal';logBody.appendChild(h('div',{class:'wf-fd '+kind},'<small>'+lab+'</small>'+f[1]));logBody.scrollTop=logBody.scrollHeight}
var sleep=function(ms){return new Promise(function(r){setTimeout(r,reduced?Math.min(ms,60):ms)})};
function travel(path){var dur=480;return new Promise(function(resolve){if(reduced)return resolve();var len=path.getTotalLength(),dot=s('circle',{r:5,class:'wf-pd'});edgesSvg.appendChild(dot);
var t0=performance.now(),live=true;var draw=function(){if(!live)return;var k=Math.min(1,(performance.now()-t0)/dur),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,pt=path.getPointAtLength(len*e);dot.setAttribute('cx',pt.x);dot.setAttribute('cy',pt.y);if(k<1)requestAnimationFrame(draw)};
requestAnimationFrame(draw);setTimeout(function(){live=false;dot.remove();resolve()},dur)})}
function follow(node){if(wrap.scrollWidth<=wrap.clientWidth+4)return;var z=parseFloat(stage.style.zoom)||1,x=(parseFloat(node.style.left)+NW/2)*z-wrap.clientWidth/2;wrap.scrollTo({left:Math.max(0,x),behavior:reduced?'auto':'smooth'})}
async function runWorkflow(){var w=current;if(!w)return;var token=++runToken;var m=w.when.match(/(\d\d):(\d\d)/);clock=m?(+m[1]*3600+ +m[2]*60):9*3600;
Object.values(w._nodes).forEach(function(n){n.classList.remove('run','ok','wait')});w._edges.forEach(function(e){e.p.classList.remove('hot','done')});
logBody.innerHTML='';logState.textContent='running';runBtn.disabled=true;runBtn.textContent='Running…';var done=new Set();
for(var i=0;i<w.run.length;i++){var st=w.run[i];if(token!==runToken)return;var node=w._nodes[st.at];
if(!done.has(st.at)){var incoming=w._edges.filter(function(e){return e.b===st.at&&done.has(e.a)});incoming.forEach(function(e){e.p.classList.add('hot')});
await Promise.all(incoming.map(function(e){return travel(e.p)}));incoming.forEach(function(e){e.p.classList.remove('hot');e.p.classList.add('done')});
if(token!==runToken)return;node.classList.add('run');follow(node)}
if(st.approve){node.classList.remove('run');node.classList.add('wait');logState.textContent='waiting for you';var ok=await askApproval(st.approve,token);
if(token!==runToken)return;node.classList.remove('wait');node.classList.add('ok');done.add(st.at);logState.textContent='running';
if(!ok){appendLog('Skipped by you · nothing changed',false);break}continue}
await sleep(380);if(token!==runToken)return;appendLog(st.log);if(st.find){await sleep(260);appendFind(st.find)}
await sleep(520);node.classList.remove('run');node.classList.add('ok');done.add(st.at)}
if(token!==runToken)return;logState.textContent='done';runBtn.disabled=false;runBtn.textContent='↻ Run again'}
function askApproval(text,token){return new Promise(function(resolve){var card=h('div',{class:'wf-ap'},'<small>Your policy · needs your OK</small><p>'+text+'</p><div class="row"><button class="yes" type="button">Approve</button><button type="button">Skip</button></div><div class="res"></div>');
logBody.appendChild(card);logBody.scrollTop=logBody.scrollHeight;var bs=$$('button',card);
var finish=function(v){card.classList.add('done');$('.res',card).textContent=v?'✓ Approved by you · '+stamp():'Skipped';resolve(v)};
bs[0].addEventListener('click',function(){finish(true)},{once:true});bs[1].addEventListener('click',function(){finish(false)},{once:true});
var watch=setInterval(function(){if(token!==runToken){clearInterval(watch);resolve(false)}},300)})}
function build(){if(built)return;built=true;D=JSON.parse($('.wf-data').textContent);WORKFLOWS=D.W;PILLARS=D.P;
runBtn.addEventListener('click',runWorkflow);window.addEventListener('resize',fitStage);buildTabs();selectPillar(PILLARS[0].id)}
if(!window.IntersectionObserver){build();return}
new IntersectionObserver(function(e,o){if(e[0].isIntersecting){build();o.disconnect()}},{rootMargin:'400px 0px'}).observe(R);
new IntersectionObserver(function(e,o){if(e[0].isIntersecting){build();if(!autoRan){autoRan=true;runWorkflow()}o.disconnect()}},{rootMargin:'0px 0px -45% 0px'}).observe($('.wf-shell'))})();`;
