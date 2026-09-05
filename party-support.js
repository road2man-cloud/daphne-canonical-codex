// Linaria extreme-speed support engine for party-dps.html
const SUP_MAKA={dur:[3,3,3,3,4,4,5],hit:[10,11,13,14,17,19,23],crit:[12,13,15,17,20,22,26]};
const SUP_MAHA={dur:[3,3,3,3,4,4,5],atk:[10,15,25,30,40,50,60],raw2:[15,15,15,16,16,16,16]};
const SUP_MAPO={dur:[3,3,3,3,4,4,5],remain:[80,79,77,76,73,72,68]};
const SUP_META={}; let SUP_META_READY=false;
const supClamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const supLv=id=>supClamp(+(document.getElementById(id)?.value||1),1,7)-1;
const supOn=id=>!!document.getElementById(id)?.checked;
const supRows=row=>row==='front'?[0,1,2]:[3,4,5];
const supEncoreExpected=n=>{let z=0;for(let i=0;i<n;i++)z+=ENCORE[i]??ENCORE_MODEL.min;return z};
function supLevelOptions(){return [1,2,3,4,5,6,7].map(x=>`<option value="${x}">${x}</option>`).join('')}
function supRefreshMeta(){
 if(SUP_META_READY||!engineWin||typeof engineWin.wtPartyProfileResults!=='function')return;
 try{const out=engineWin.wtPartyProfileResults(),nm={prishe:'프리슈',abenius:'아베니우스',heinrich:'하인리크',arboris:'아르보리스',linaria:'리나리아'};
  for(const [k,n] of Object.entries(nm)){const x=out.find(z=>z.build?.char?.name===n);if(!x)continue;SUP_META[k]={critical:+x.st?.critical||0,hit:+x.st?.hit||0,critDmg:typeof engineWin.wtCritDamageRate==='function'?engineWin.wtCritDamageRate(x.build):1.75}}
  SUP_META_READY=true;
 }catch(_){ }
}
function supProfile(k){const p=getProfile(k),fallbackCrit=+(document.getElementById('supFallbackCrit')?.value||15),fallbackCd=+(document.getElementById('supFallbackCd')?.value||1.75),m=SUP_META[k]||{};return {...p,critical:Number.isFinite(m.critical)?m.critical:fallbackCrit,critDmg:Number.isFinite(m.critDmg)?m.critDmg:fallbackCd}}
function supScenarioRow(arr,row,init){
 const lin=arr.indexOf('linaria');if(lin<0)return null;
 const ri=riotCfg(),mi=supLv('supMakaLv'),hi=supLv('supMahaLv'),pi=supLv('supMapoLv'),maka={dur:SUP_MAKA.dur[mi],hit:SUP_MAKA.hit[mi],crit:SUP_MAKA.crit[mi]},maha={dur:SUP_MAHA.dur[hi],atk:SUP_MAHA.atk[hi],raw2:SUP_MAHA.raw2[hi]},mapo={dur:SUP_MAPO.dur[pi],remain:SUP_MAPO.remain[pi]/100};
 const rowPos=supRows(row),riotPos=arr.map((_,i)=>i).filter(i=>i!==lin&&adj(i,lin)),elastic=Math.max(0,+(document.getElementById('supAtkElastic')?.value||.75));
 let u=1,main=0,enc=0,cap=0,demand=0,effDelay=waitAt(init);
 for(let it=0;it<24;it++){
  const selfMap=supOn('supMapo')&&rowPos.includes(lin),selfRate=selfMap?1-(1-mapo.remain)*u:1;effDelay=waitAt(init)*selfRate;main=Math.max(1,Math.floor(2000/effDelay+1e-9));enc=supEncoreExpected(main);cap=main+enc;
  const acts=arr.map((k,i)=>{if(i===lin)return cap;const p=supProfile(k),mul=supOn('supMapo')&&rowPos.includes(i)?1+(1/mapo.remain-1)*u:1;return Math.max(.01,p.actions*mul)});
  const need=(pos,dur,includeLin=false)=>{const a=pos.filter(i=>(includeLin&&i===lin)||(i!==lin&&supProfile(arr[i]).total>0)).map(i=>acts[i]);return a.length?Math.max(...a)/dur:0};
  demand=0;if(supOn('supRiot'))demand+=need(riotPos,ri.turn);if(supOn('supMaka'))demand+=need(rowPos,maka.dur);if(supOn('supMaha'))demand+=need(rowPos,maha.dur);if(supOn('supMapo'))demand+=need(rowPos,mapo.dur,true);
  const nu=demand?Math.min(1,cap/demand):0;if(Math.abs(nu-u)<1e-5){u=nu;break}u=(u+nu)/2;
 }
 const details=[];let total=0;
 for(let i=0;i<arr.length;i++){const k=arr[i],p=supProfile(k);if(i===lin){details.push({k,name:NAMES[k],pos:i,base:p.total,after:0,buffs:['지원 전담']});continue}
  let d=p.total,actions=p.actions,b=[];if(supOn('supMapo')&&rowPos.includes(i)){const f=1+(1/mapo.remain-1)*u;d*=f;actions*=f;b.push(`마폴트 WT ${Math.round(mapo.remain*100)}%`)}
  if(supOn('supMaha')&&rowPos.includes(i)){d*=1+(maha.atk/100)*elastic*u;b.push(`마하이토스 raw ${maha.atk}`)}
  if(supOn('supMaka')&&rowPos.includes(i)){const q0=supClamp(p.critical/100,0,1),q1=supClamp(q0+maka.crit/100*u,0,1),cf=(1+q1*(p.critDmg-1))/(1+q0*(p.critDmg-1));d*=cf;b.push(`마칼디아 치명 +${maka.crit}`)}
  if(supOn('supRiot')&&riotPos.includes(i)){d=d*(1+ri.pct/100*u)+actions*ri.flat*p.hits*u;b.push(`발라드 +${ri.pct}%/+${ri.flat}×타수`)}total+=d;details.push({k,name:NAMES[k],pos:i,base:p.total,after:d,buffs:b})
 }
 return {arr,row,init,total,u,main,enc,cap,demand,spare:Math.max(0,cap-demand),effDelay,details,riot:ri,maka,maha,mapo};
}
function supChoose(arr,init){const mode=document.getElementById('supRow')?.value||'auto';if(mode!=='auto')return supScenarioRow(arr,mode,init);const a=supScenarioRow(arr,'front',init),b=supScenarioRow(arr,'back',init);return a.total>=b.total?a:b}
function supBestOf(arr,init){let best=null;for(const p of permutations(arr)){const z=supChoose(p,init);if(!best||z.total>best.total)best=z}return best}
function supPct(a,b){return b?((a/b-1)*100):0}
function supCard(label,value,sub=''){return `<div class="card">${label}<b>${value}</b><span class="muted">${sub}</span></div>`}
function supRender(){
 supRefreshMeta();const same=formation.map(k=>k==='heinrich'?'linaria':k),base=simulate(formation),regular=replacement('linaria').z,baseInit=Math.max(0,+document.getElementById('supBaseInit').value||150),fastInit=Math.max(0,+document.getElementById('supFastInit').value||300);
 const normal=supChoose(same,baseInit),fast=supChoose(same,fastInit),best=supBestOf(same,fastInit),rawBaseMain=Math.max(1,Math.floor(2000/waitAt(baseInit))),pureRatio=fast.cap/rawBaseMain,fairRatio=fast.cap/Math.max(.001,normal.cap);
 document.getElementById('supCards').innerHTML=supCard('현재 6인',resultLabel(base),'하인리크 포함')+supCard('리나리아 일반지원',fmt(normal.total),`${supPct(normal.total,base.total)>=0?'+':''}${supPct(normal.total,base.total).toFixed(1)}%`)+supCard('극행속 지원 · 동일자리',fmt(fast.total),`${supPct(fast.total,base.total)>=0?'+':''}${supPct(fast.total,base.total).toFixed(1)}%`)+supCard('극행속 지원 · 최적배치',fmt(best.total),`${supPct(best.total,base.total)>=0?'+':''}${supPct(best.total,base.total).toFixed(1)}%`)+supCard('지원 행동권',fast.cap.toFixed(2),`${fast.main} 본행동 + 앵콜 ${fast.enc.toFixed(2)}`)+supCard('순수 기준 대비',`×${pureRatio.toFixed(2)}`,`${rawBaseMain}회 → ${fast.cap.toFixed(2)}회`)+supCard('양쪽 앵콜 공정비교',`×${fairRatio.toFixed(2)}`,`일반지원 ${normal.cap.toFixed(2)}회 &middot; &#50976;&#51648;&#50984; ${(normal.u*100).toFixed(0)}% &middot; &#50668;&#50976; ${normal.spare.toFixed(2)}`)+supCard('버프 유지율',`${(fast.u*100).toFixed(1)}%`,`여유 ${fast.spare.toFixed(2)}행동`);
 document.getElementById('supSummary').innerHTML=`동일자리에서 개인딜+발라드 운영 ${fmt(regular.total)} → <b class="up">극행속 버프전담 ${fmt(fast.total)}</b> (${supPct(fast.total,regular.total)>=0?'+':''}${supPct(fast.total,regular.total).toFixed(1)}%). 가로 버프는 <b>${fast.row==='front'?'전열':'후열'}</b>이 선택됨. 필요 ${fast.demand.toFixed(2)}행동 / 기대 행동권 ${fast.cap.toFixed(2)}. 최적배치: ${arrangementText(best.arr)} · 가로버프 ${best.row==='front'?'전열':'후열'}.`;
 document.getElementById('supDetail').innerHTML=fast.details.map(x=>`<tr><td><b>${x.name}</b><br><span class="muted">${slots[x.pos]}</span></td><td>${fmt(x.base)}</td><td class="up">${fmt(x.after)}</td><td>${x.base?`${supPct(x.after,x.base)>=0?'+':''}${supPct(x.after,x.base).toFixed(1)}%`:'-'}</td><td>${x.buffs.length?x.buffs.map(v=>`<span class="buff">${v}</span>`).join(''):'-'}</td></tr>`).join('');
 document.getElementById('supCanon').innerHTML=`앵콜: <b>max(25%, 60%-8%p×성공횟수)</b> · 현재 ${fast.main}회 비공격 본행동에서 기대 +${fast.enc.toFixed(2)}회. 라이엇 발라드 Lv${document.getElementById('riotLevel').value}: +${fast.riot.pct}% / 기본피해 +${fast.riot.flat}×타수 / ${fast.riot.turn}턴. 마칼디아: 명중 +${fast.maka.hit}, 치명 +${fast.maka.crit}, ${fast.maka.dur}턴. 마하이토스: 공격력 raw ${fast.maha.atk}, ${fast.maha.dur}턴. 마폴트: WT remaining ${Math.round(fast.mapo.remain*100)}%, ${fast.mapo.dur}턴.`;
}
const supPanel=document.createElement('section');supPanel.className='panel';supPanel.id='linariaSupport';
supPanel.innerHTML=`<h2>리나리아 극행속 · 앵콜 버프전담 WT2000</h2><p class="muted">리나리아 개인 공격을 포기하고 비공격 버프만 순환합니다. 앵콜 기대 추가행동까지 버프 유지에 재투자하고, 가로 버프열과 6인 배치를 자동 탐색합니다.</p>
<div class="manual"><strong>행동권</strong><label>일반 행속<input id="supBaseInit" type="number" min="0" value="150"></label><label>극행속<input id="supFastInit" type="number" min="0" value="300"></label><label>가로 버프열<select id="supRow"><option value="auto">자동 최적</option><option value="front">전열</option><option value="back">후열</option></select></label><label>공격→최종딜 환산<input id="supAtkElastic" type="number" min="0" max="2" step="0.05" value="0.75"></label></div>
<div class="supportChecks"><label><input id="supRiot" type="checkbox" checked> 라이엇 발라드</label><label><input id="supMaka" type="checkbox" checked> 마칼디아</label><label><input id="supMaha" type="checkbox" checked> 마하이토스</label><label><input id="supMapo" type="checkbox" checked> 마폴트</label></div>
<div class="manual"><strong>버프 레벨</strong><label>마칼디아 Lv<select id="supMakaLv">${supLevelOptions()}</select></label><label>마하이토스 Lv<select id="supMahaLv">${supLevelOptions()}</select></label><label>마폴트 Lv<select id="supMapoLv">${supLevelOptions()}</select></label><label>수동캐릭 치명 기본<input id="supFallbackCrit" type="number" min="0" max="100" value="15"></label><label>수동캐릭 치명배율<input id="supFallbackCd" type="number" min="1" step="0.05" value="1.75"></label></div>
<div id="supCards" class="cards supportCards"></div><p id="supSummary" class="best"></p>
<table><thead><tr><th>캐릭터</th><th>기본 WT2000</th><th>지원 후</th><th>증가</th><th>적용</th></tr></thead><tbody id="supDetail"></tbody></table>
<p id="supCanon" class="best"></p><p class="muted">마칼디아의 <b>치명</b>은 개인 WT 엔진의 실제 치명값으로 기대피해에 환산합니다. 명중 상승은 선택 스킬별 명중보정까지 재생성할 수 없어 추가딜을 <b>0으로 보수 처리</b>합니다. 마하이토스 raw 공격력은 최종피해와 1:1로 단정하지 않고 위 환산계수를 사용합니다. 방어·회피 등 생존 버프는 파티 DPS에는 넣지 않습니다.</p>`;
const supStyle=document.createElement('style');supStyle.textContent='.supportChecks{display:flex;gap:14px;flex-wrap:wrap;margin:9px 0}.supportChecks label{color:#c5d2df}.supportChecks input{width:auto}.supportCards{grid-template-columns:repeat(4,minmax(0,1fr))}@media(max-width:850px){.supportCards{grid-template-columns:1fr 1fr}}';document.head.appendChild(supStyle);
const allPanels=[...document.querySelectorAll('section.panel')];allPanels[allPanels.length-1].before(supPanel);
for(const el of supPanel.querySelectorAll('input,select'))el.addEventListener(el.tagName==='SELECT'?'change':'input',supRender);
document.getElementById('riotLevel').addEventListener('change',supRender);
formationEl.addEventListener('change',()=>setTimeout(supRender,0));manualRows.addEventListener('input',()=>setTimeout(supRender,0));manualRows.addEventListener('change',()=>setTimeout(supRender,0));
const SUP_CORE_RENDER=renderAll;renderAll=function(){SUP_CORE_RENDER();setTimeout(supRender,0)};
iframe.addEventListener('load',()=>{SUP_META_READY=false;setTimeout(supRender,500)});
supRender();
