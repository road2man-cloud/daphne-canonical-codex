const $=id=>document.getElementById(id);
const fmt=(x,d=0)=>Number(x||0).toLocaleString('ko-KR',{minimumFractionDigits:d,maximumFractionDigits:d});
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const num=id=>Number($(id).value)||0;

const PRISHE={str:96,dex:55,agi:51,luk:58,atkCorr:110,hitCorr:115,initCorr:95};
const WEAPON={name:'은 세스터스',base:40,rein:49,corr:1,attackCount:3};
const MARTIAL=[0,2,4,8,12,16,20,25];
const HUNDRED=[0,90,89,87,86,84,82,80];
const SEAMLESS=[null,{atk:5,hit:2},{atk:6,hit:3},{atk:8,hit:5},{atk:9,hit:6},{atk:11,hit:8},{atk:12,hit:9},{atk:15,hit:12}];
const EFFECTS=['atkP','atkF','hitP','hitF','spdP','spdF'];
const EFFECT_LABEL={atkP:'공격%',atkF:'공격+',hitP:'명중%',hitF:'명중+',spdP:'행속%',spdF:'행속+'};
// group 601 · 4성 마스터 중간값. 자연가호는 전변/+20 성장/정련을 모두 반영한다.
const AFFIX={
 atkP:{base:13,full:3.5,growth:3.5,refine:4,alter:4},hitP:{base:13,full:3.5,growth:3.5,refine:4,alter:4},spdP:{base:9,full:3.5,growth:3.5,refine:4,alter:4},
 atkF:{base:10.5,full:8,growth:8,refine:5,alter:5},hitF:{base:10.5,full:8,growth:8,refine:5,alter:5},spdF:{base:8.5,full:3,growth:3,refine:4,alter:4}
};
const OCC={
 weapon:{p13:[89.56,66.02,0],p4p:[30.27,22.19,0],p4f:[3.29,2.46,2.33]},
 head:{p13:[25.84,52.49,0],p4p:[7.75,17.25,0],p4f:[0.86,1.75,0]},
 body:{p13:[0,0,37.62],p4p:[0,0,12.36],p4f:[0,0,1.87]},
 gloves:{p13:[31.71,66.57,0],p4p:[9.51,19.82,0],p4f:[1.06,2.38,0]},
 boots:{p13:[0,47.64,53.20],p4p:[0,14.29,15.96],p4f:[0,1.59,1.77]},
 accessory:{p13:[34.77,34.77,34.77],p4p:[11.11,11.11,11.11],p4f:[1.23,1.23,1.23]}
};
function lineValue(e,altered=false){let x=AFFIX[e];return altered?(x.alter+x.refine+x.growth):(x.base+x.full+x.refine+x.growth)}
function zeroGear(){return {atkP:0,atkF:0,hitP:0,hitF:0,spdP:0,spdF:0}}
function addGear(a,b){let z=zeroGear();for(const e of EFFECTS)z[e]=(a[e]||0)+(b[e]||0);return z}
function naturalForSlot(o){let v=zeroGear(),splitP=11/30,splitF=19/30,names=[['atkP','atkF'],['hitP','hitF'],['spdP','spdF']];for(let i=0;i<3;i++){let n=(o.p13[i]||0)/100;v[names[i][0]]+=n*splitP*lineValue(names[i][0]);v[names[i][1]]+=n*splitF*lineValue(names[i][1]);v[names[i][0]]+=(o.p4p[i]||0)/100*lineValue(names[i][0]);v[names[i][1]]+=(o.p4f[i]||0)/100*lineValue(names[i][1])}return v}
const NATURAL=Object.values(OCC).reduce((a,o)=>addGear(a,naturalForSlot(o)),zeroGear());
const ALTER_VALUE=Object.fromEntries(EFFECTS.map(e=>[e,lineValue(e,true)]));
const GEAR_STATES=[];
(function enumerateGear(){let c={};function rec(i,left){if(i===EFFECTS.length){let g={...NATURAL},used=0,counts={};for(const e of EFFECTS){let n=c[e]||0;counts[e]=n;used+=n;g[e]+=n*ALTER_VALUE[e]}GEAR_STATES.push({g,counts,none:6-used});return}let e=EFFECTS[i];for(let n=0;n<=left;n++){c[e]=n;rec(i+1,left-n)}delete c[e]}rec(0,6)})();

const RE=[
 {lv:1,sp:3,rate:130,both:156,fixed:0,cap:70,capBoth:210,start:0,hit:55,pen:0},
 {lv:2,sp:4,rate:139,both:167,fixed:0,cap:85,capBoth:255,start:0,hit:55,pen:0},
 {lv:3,sp:7,rate:152,both:183,fixed:0,cap:140,capBoth:420,start:25,hit:55,pen:0},
 {lv:4,sp:9,rate:161,both:194,fixed:0,cap:160,capBoth:480,start:25,hit:55,pen:0},
 {lv:5,sp:16,rate:174,both:209,fixed:0,cap:210,capBoth:630,start:50,hit:55,pen:0},
 {lv:6,sp:18,rate:182,both:219,fixed:0,cap:245,capBoth:735,start:50,hit:55,pen:0},
 {lv:7,sp:24,rate:195,both:234,fixed:0,cap:420,capBoth:1260,start:125,hit:55,pen:0}
];
const CH=[
 {lv:1,sp:7,rate:150,both:180,fixed:0,cap:80,capBoth:240,start:0,hit:45,pen:40},
 {lv:2,sp:10,rate:160,both:192,fixed:0,cap:96,capBoth:288,start:0,hit:45,pen:43},
 {lv:3,sp:14,rate:175,both:210,fixed:0,cap:160,capBoth:480,start:40,hit:45,pen:47},
 {lv:4,sp:20,rate:185,both:222,fixed:0,cap:200,capBoth:600,start:40,hit:45,pen:49},
 {lv:5,sp:32,rate:200,both:240,fixed:0,cap:320,capBoth:960,start:80,hit:45,pen:53},
 {lv:6,sp:40,rate:210,both:252,fixed:0,cap:400,capBoth:1200,start:80,hit:45,pen:56},
 {lv:7,sp:52,rate:225,both:270,fixed:0,cap:640,capBoth:1920,start:200,hit:45,pen:60}
];
const MO=[
 {lv:1,sp:14,rate:165,both:198,fixed:25,cap:80,capBoth:240,start:0,hit:35,pen:0},
 {lv:2,sp:19,rate:180,both:216,fixed:40,cap:96,capBoth:288,start:0,hit:35,pen:0},
 {lv:3,sp:26,rate:200,both:240,fixed:65,cap:160,capBoth:480,start:40,hit:35,pen:0},
 {lv:4,sp:35,rate:215,both:258,fixed:80,cap:200,capBoth:600,start:40,hit:35,pen:0},
 {lv:5,sp:50,rate:235,both:282,fixed:105,cap:320,capBoth:960,start:80,hit:35,pen:0},
 {lv:6,sp:66,rate:250,both:300,fixed:120,cap:400,capBoth:1200,start:80,hit:35,pen:0}, {lv:7,sp:94,rate:270,both:324,fixed:140,cap:640,capBoth:1920,start:200,hit:35,pen:0}
];

function populate(id,def=1){let s=$(id);s.innerHTML=Array.from({length:7},(_,i)=>`<option value="${i+1}" ${i+1===def?'selected':''}>Lv${i+1}</option>`).join('')}
populate('reLv',6);populate('chLv',4);populate('moLv',2);populate('martialLv',1);populate('hundredLv',1);populate('seamlessLv',1);populate('impetusLv',1);populate('counterLv',1);populate('mdefLv',1);

function wtBaseWait(initiative){let s=Math.max(0,Math.round(+initiative||0));if(s<=250)return Math.max(1,500-s);if(s<=300)return 250-Math.ceil((s-250)/2);if(s<=360)return 225-Math.ceil((s-300)/4);return 210}
function wtDelay(initiative,rate=100){let base=wtBaseWait(initiative);return Math.max(1,Math.ceil(base*clamp(+rate||100,40,160)/100-.001))}
function raw(P,r){let f=r.both/100,c=r.capBoth,st=r.start,x;if(st>0&&P<st)x=P*f*.75;else if(c<=0||P<=c)x=P*f;else x=f*(c+(P-c)*.5);return x+r.fixed}
function expectedDamage(st,r,hits,mult=1){let x=raw(st.atk,r),ed=Math.max(0,num('enemyDef'))*(1-clamp(r.pen||0,0,100)/100);x=Math.max(1,x-ed*.5);let chance=clamp(Math.ceil(st.hit+r.hit-Math.max(0,num('enemyEvade'))-.001),5,99)/100;return x*hits*chance*mult}
function normalDamage(st){let x=Math.max(1,st.atk-Math.max(0,num('enemyDef'))*.5),chance=clamp(Math.ceil(st.hit+50-Math.max(0,num('enemyEvade'))-.001),5,99)/100;return x*WEAPON.attackCount*chance}

function statFor(bp,gear){let seamless=SEAMLESS[+num('seamlessLv')]||SEAMLESS[1];let str=PRISHE.str+bp.str+num('bondStr'),dex=PRISHE.dex+bp.dex+num('bondDex'),agi=PRISHE.agi+bp.agi+num('bondAgi'),luk=PRISHE.luk+bp.luk+num('bondLuk');
 let baseAtk=Math.ceil(str*PRISHE.atkCorr/100-.001),baseHit=Math.ceil((.7*dex+.3*luk)*PRISHE.hitCorr/100-.001),baseInit=Math.ceil(agi*PRISHE.initCorr/100-.001),equipAtk=WEAPON.base+WEAPON.rein;
 let atkRate=Math.ceil(baseAtk*gear.atkP/100-.001),atkAdd=Math.trunc(gear.atkF),atk=Math.ceil(baseAtk*WEAPON.corr-.001)+equipAtk+Math.ceil((atkRate+atkAdd)*WEAPON.corr-.001)+seamless.atk+num('bondAtk');
 let hit=baseHit+Math.ceil(baseHit*gear.hitP/100-.001)+Math.trunc(gear.hitF)+seamless.hit+num('bondHit');
 let initiative=baseInit+Math.ceil(baseInit*gear.spdP/100-.001)+Math.trunc(gear.spdF)+MARTIAL[+num('martialLv')]+num('bondSpd');
 return {str,dex,agi,luk,baseAtk,baseHit,baseInit,atk,hit,initiative};
}

function selectedSkills(){return {re:RE[num('reLv')-1],ch:CH[num('chLv')-1],mo:MO[num('moLv')-1]}}
function stageBonus(stage){return stage===1?1.10:stage===2?1.15:stage>=3?1.20:1}
function nextStage(stage,prev,key){let z=stage;if(key==='mo')z=Math.max(0,z-2);if(prev&&prev!==key)z=Math.min(3,z+1);return z}
function actionDefs(){let {re,ch,mo}=selectedSkills();return [
 {key:'ch',label:'촌경',d:(st,b)=>expectedDamage(st,ch,WEAPON.attackCount,b)},
 {key:'re',label:'연격',d:(st,b)=>expectedDamage(st,re,WEAPON.attackCount,b)},
 {key:'mo',label:'몽상',d:(st,b)=>expectedDamage(st,mo,8,b)},
 {key:'normal',label:'평타',d:(st,b)=>normalDamage(st)*b}
]}
const ROT_CACHE=new Map();
function rotationKey(st){return [st.atk,st.hit,st.initiative,num('budget'),num('enemyDef'),num('enemyEvade'),num('reLv'),num('chLv'),num('moLv'),num('hundredLv')].join('|')}
function betterRotation(a,b){return !b||a.total>b.total+1e-9||(Math.abs(a.total-b.total)<1e-9&&((a.firstDamage||0)>(b.firstDamage||0)+1e-9||(Math.abs((a.firstDamage||0)-(b.firstDamage||0))<1e-9&&(a.normals<b.normals||(a.normals===b.normals&&a.spent<b.spent)))))}
function bestRotation(st,detailed=false){
 let ck=rotationKey(st);if(!detailed&&ROT_CACHE.has(ck))return ROT_CACHE.get(ck);let B=Math.max(100,num('budget')||2000),hf=HUNDRED[num('hundredLv')]||90,defs=actionDefs(),memo=new Map();
 function rec(spent,h,stage,prev){let mk=[spent,h,stage,prev].join('|');if(memo.has(mk))return memo.get(mk);let delay=wtDelay(st.initiative,h>0?hf:100);if(spent+delay>B){let z={total:0,path:[],spent,normals:0};memo.set(mk,z);return z}let best=null;
  for(const a of defs){if(a.key==='mo'&&stage<2)continue;let nh=h>0?h-1:0;if(a.key==='normal')nh=2;let ns=nextStage(stage,prev,a.key),dmg=a.d(st,stageBonus(stage)),q=rec(spent+delay,nh,ns,a.key),z={total:dmg+q.total,firstDamage:dmg,path:[a.label,...q.path],spent:q.spent,normals:(a.key==='normal'?1:0)+q.normals};if(betterRotation(z,best))best=z}memo.set(mk,best);return best}
 let rawBest=rec(0,0,0,''),best={...rawBest,actions:rawBest.path.length,score:rawBest.total/B*100,avgWt:rawBest.path.length?rawBest.spent/rawBest.path.length:0};let all=null;
 if(detailed){let dmemo=new Map();function byNormals(spent,h,stage,prev){let mk=[spent,h,stage,prev].join('|');if(dmemo.has(mk))return dmemo.get(mk);let delay=wtDelay(st.initiative,h>0?hf:100),out=new Map();if(spent+delay>B){out.set(0,{total:0,path:[],spent,normals:0});dmemo.set(mk,out);return out}for(const a of defs){if(a.key==='mo'&&stage<2)continue;let nh=h>0?h-1:0;if(a.key==='normal')nh=2;let qs=byNormals(spent+delay,nh,nextStage(stage,prev,a.key),a.key);for(const [n,q] of qs){let nn=n+(a.key==='normal'?1:0),z={total:a.d(st,stageBonus(stage))+q.total,path:[a.label,...q.path],spent:q.spent,normals:nn},old=out.get(nn);if(betterRotation(z,old))out.set(nn,z)}}dmemo.set(mk,out);return out}all=[...byNormals(0,0,0,'').values()].map(x=>({...x,actions:x.path.length,score:x.total/B*100,avgWt:x.path.length?x.spent/x.path.length:0})).sort((a,b)=>a.normals-b.normals||b.total-a.total)}
 let out={best,all};if(!detailed)ROT_CACHE.set(ck,out);return out}
function rotationText(r){return (r.path||[]).join('→')}
function bpAllocations(){let t=clamp(Math.round(num('bpTotal')),0,30),out=[];for(let str=0;str<=t;str++)for(let dex=0;dex<=t-str;dex++)for(let agi=0;agi<=t-str-dex;agi++){let luk=t-str-dex-agi;out.push({str,dex,agi,luk})}return out}
function gearText(gs){let a=EFFECTS.filter(e=>gs.counts[e]).map(e=>`${EFFECT_LABEL[e]}×${gs.counts[e]}`);return a.length?a.join(', '):'변경 없음'}
function evalConfig(bp,gs){let st=statFor(bp,gs.g),rot=bestRotation(st);return {bp,gs,st,rot:rot.best}}
function betterDps(a,b){return !b||a.rot.total>b.rot.total+1e-9||(Math.abs(a.rot.total-b.rot.total)<1e-9&&a.rot.spent<b.rot.spent)}

function paretoConfigs(rows){let uniq=new Map();for(const z of rows){let k=[z.st.atk,z.st.hit,z.st.initiative].join('|');if(!uniq.has(k))uniq.set(k,z)}let arr=[...uniq.values()].sort((a,b)=>b.st.atk-a.st.atk||b.st.hit-a.st.hit||b.st.initiative-a.st.initiative),front=[];outer:for(const z of arr){for(const q of front)if(q.st.hit>=z.st.hit&&q.st.initiative>=z.st.initiative)continue outer;front.push(z)}return front}
function attachRot(z){if(!z.rot)z.rot=bestRotation(z.st).best;return z}
function bestFromRows(rows){let best=null;for(const z of paretoConfigs(rows)){attachRot(z);if(betterDps(z,best))best=z}return best}
function searchAll(){ROT_CACHE.clear();let bps=bpAllocations(),rows=[],maxSpeed=null,maxAttack=null;for(const bp of bps)for(const gs of GEAR_STATES){let z={bp,gs,st:statFor(bp,gs.g),rot:null};rows.push(z);if(!maxSpeed||z.st.initiative>maxSpeed.st.initiative)maxSpeed=z;if(!maxAttack||z.st.atk>maxAttack.st.atk)maxAttack=z}
 let front=paretoConfigs(rows),best=null,best250=null;for(const z of front){attachRot(z);if(betterDps(z,best))best=z;if(z.st.initiative>=250&&betterDps(z,best250))best250=z}
 let t=clamp(Math.round(num('bpTotal')),0,30),bpStr={str:t,dex:0,agi:0,luk:0},bpAgi={str:0,dex:0,agi:t,luk:0},strRows=[],agiRows=[];for(const gs of GEAR_STATES){strRows.push({bp:bpStr,gs,st:statFor(bpStr,gs.g),rot:null});agiRows.push({bp:bpAgi,gs,st:statFor(bpAgi,gs.g),rot:null})}
 let sf=paretoConfigs(strRows),af=paretoConfigs(agiRows),bestStr=null,bestAgi=null,extremeSpeed=null,extremeAttack=null;for(const z of sf){attachRot(z);if(betterDps(z,bestStr))bestStr=z;if(!extremeAttack||z.st.atk>extremeAttack.st.atk||(z.st.atk===extremeAttack.st.atk&&betterDps(z,extremeAttack)))extremeAttack=z}for(const z of af){attachRot(z);if(betterDps(z,bestAgi))bestAgi=z;if(!extremeSpeed||z.st.initiative>extremeSpeed.st.initiative||(z.st.initiative===extremeSpeed.st.initiative&&betterDps(z,extremeSpeed)))extremeSpeed=z}
 return {best,best250,maxSpeed,maxAttack,bestStr,bestAgi,extremeSpeed,extremeAttack,frontierCount:front.length}}

function bpText(bp){return `${bp.str}/${bp.dex}/${bp.agi}/${bp.luk}`}
function renderRow(label,z,cls=''){if(!z)return `<tr><td>${label}</td><td colspan="12" class="muted">조건을 만족하는 세팅 없음</td></tr>`;let r=z.rot;return `<tr><td class="${cls}"><b>${label}</b></td><td>${bpText(z.bp)}</td><td>${fmt(z.st.atk)}</td><td>${fmt(z.st.hit)}</td><td class="${z.st.initiative>=250?'ok':''}">${fmt(z.st.initiative)}</td><td>${fmt(wtBaseWait(z.st.initiative))}</td><td>${r.actions}</td><td>${fmt(r.spent)}</td><td class="hi">${fmt(r.total)}</td><td class="hi">${fmt(r.score,1)}</td><td>${r.normals}회</td><td class="wrap wide">${rotationText(r)}</td><td class="wrap">${gearText(z.gs)}</td></tr>`}

function render(){let t0=performance.now();let res=searchAll(),z=res.best,r=z.rot;let cards=[['최고 100 WT당',fmt(r.score,1)],['기대 총딜',fmt(r.total)],['행동 / 평타',`${r.actions} / ${r.normals}`],['표시 행속',fmt(z.st.initiative)]];$('summaryCards').innerHTML=cards.map(([a,b])=>`<div class="card"><span>${a}</span><b>${b}</b></div>`).join('');
 let rows=[];rows.push(renderRow('최고 DPS 자동',res.best,'hi'));rows.push(renderRow('극행속 장비 + BP속도',res.extremeSpeed));if(res.best250)rows.push(renderRow('행속 ≥250 중 최고 DPS',res.best250));else rows.push(renderRow('행속 250 컷',null));rows.push(renderRow('극공격 장비 + BP힘',res.extremeAttack));rows.push(renderRow('BP 전부 힘 + DPS장비',res.bestStr));rows.push(renderRow('BP 전부 속도 + DPS장비',res.bestAgi));$('compareBody').innerHTML=rows.join('');
 $('speed250Note').innerHTML=res.best250?`행속 250 이상 도달 가능. 그 영역에서 최고 DPS 세팅의 행속은 <b>${fmt(res.best250.st.initiative)}</b>입니다.`:`현재 입력한 BP·인연 범위와 4성 기대 장비 모델에서는 행속 250에 도달하지 못합니다. 가능한 최대 행속은 <b>${fmt(res.maxSpeed.st.initiative)}</b>입니다. 극행속 결과는 그래도 별도 비교했습니다.`;
 let detail=bestRotation(z.st,true).all;$('hfBody').innerHTML=detail.slice(0,14).map((x,i)=>`<tr><td>${i+1}</td><td>${x.actions-x.normals}</td><td>${x.normals}</td><td>${x.actions}</td><td>${fmt(x.spent)}</td><td class="hi">${fmt(x.total)}</td><td>${fmt(x.score,1)}</td><td class="wrap wide">${rotationText(x)}</td></tr>`).join('');
 $('naturalGear').innerHTML=EFFECTS.map(e=>`<span class="pill">4성 자연 ${EFFECT_LABEL[e]} ${fmt(NATURAL[e],1)}</span>`).join('')+`<span class="pill">장비 조합 ${GEAR_STATES.length}개</span>`;
 let ms=performance.now()-t0;$('calcNote').textContent=`전 행동열 + 4성 장비 정확 탐색 · BP 조합 ${bpAllocations().length.toLocaleString()}개 × 장비 조합 ${GEAR_STATES.length.toLocaleString()}개 · 계산 ${fmt(ms,0)} ms · 임피터스/카운터는 위 설명대로 고정 WT 자가행동 DPS에서 제외.`;
}
let timer=null;document.querySelectorAll('input,select').forEach(el=>el.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(render,80)}));
render();