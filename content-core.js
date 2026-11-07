// Shared normalization for the browser and the snapshot publishing command.
export const CARD_SOURCES={heroes:'https://game.gtimg.cn/images/amside/ide_timer/589094_oscard_new_1.js',equipment:'https://game.gtimg.cn/images/amside/ide_timer/589094_oscard_new_4.js',talents:'https://game.gtimg.cn/images/amside/ide_timer/589094_oscard_new_8.js',effects:'https://game.gtimg.cn/images/amside/ide_timer/589094_oscard_new_2.js',lords:'https://game.gtimg.cn/images/amside/ide_timer/589094_oscard_new_16.js'};
export const FEED_SOURCES=Array.from({length:8},(_,i)=>`https://game.gtimg.cn/images/amside/ide_timer/598252_oslineupbyrecommend_pro_${i+1}.js`);
const fields={heroes:'heroCards',equipment:'equipCards',talents:'talentCards',effects:'effectCards',lords:'lords'};
const dateInChina=value=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value));
const plain=v=>String(v||'').replace(/<br\s*\/?>/gi,'\n').replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').trim();
const colors={'河洛':'#eee3e0','大河流域':'#e6eadc','日落海':'#e8e5d9','三分之地':'#e5e3ed','逐鹿':'#e1e8e4','无阵营':'#e5e5ed'};
const systems={'河洛':'河洛古币牺牲','大河流域':'大河图腾开团','日落海':'日落海整备','三分之地':'三分登场倒转','逐鹿':'逐鹿战术牌','无阵营':'无阵营等级转化'};
const normalized=v=>typeof v==='string'?plain(v).replace(/\s+/g,''):Array.isArray(v)?v.map(normalized):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().filter(k=>!/image|icon|thumb|url|^bg$|video|levelIcon/i.test(k)).map(k=>[k,normalized(v[k])])):v;
const relevant=c=>JSON.stringify(normalized({desc:c.desc,heroCard:c.heroCard?{skillList:(c.heroCard.skillList||[]).map(s=>({name:s.name,desc:s.desc,enhance:s.enhanceSkill?.params||[]})),properties:c.heroCard.properties,awakeing:c.heroCard.awakeingCard?.desc||''}:null,equipCard:c.equipCard,talentStageDesc:c.talentStageDesc}));
export function contentDiff(before,after){
 const changes=[];
 for(const type of ['heroes','equipment','talents','effects']){
  const old=new Map((before?.[type]||[]).map(c=>[c.id,c]));
  for(const c of after[type]){const previous=old.get(c.id);if(!previous||relevant(previous)!==relevant(c))changes.push({id:c.id,name:c.name,type,kind:previous?'changed':'added',before:plain(previous?.desc),after:plain(c.desc)});old.delete(c.id);}
  for(const c of old.values())changes.push({id:c.id,name:c.name,type,kind:'removed',before:plain(c.desc),after:''});
 }
 return changes;
}
function placement(heroes){const positions=heroes.map(h=>(3-Number(h.positionZ))*7+Number(h.positionX));const valid=heroes.every(h=>Number.isInteger(h.positionX)&&h.positionX>=0&&h.positionX<7&&Number.isInteger(h.positionZ)&&h.positionZ>=0&&h.positionZ<4)&&new Set(positions).size===positions.length;return{positions:valid?positions:heroes.map((_,i)=>[3,24,17,25,23,5,26,10,12][i]??i),sourceBoard:valid};}
export function normalizeContent(raw,previousData,previousLibrary,checkedAt=new Date().toISOString()){
 const cards={meta:{...previousData.meta,checkedAt,fetchedAt:dateInChina(checkedAt),sourceUrls:CARD_SOURCES,versionNote:'官方卡牌端点未提供游戏版本号；公告版本与卡牌核验时间分别展示。'}};
 for(const type of ['heroes','equipment','talents','effects']){
  const list=raw[type]?.[fields[type]];
  if(!Array.isArray(list)||list.length<Math.max(1,(previousData[type]?.length||1)*.7))throw Error('官方'+type+'资料不完整，保留已有资料');
  const ids=new Set();const old=new Map((previousData[type]||[]).map(c=>[c.id,c]));
  cards[type]=list.map(c=>{if(!c.id||!c.name||ids.has(c.id))throw Error('官方卡牌标识异常');ids.add(c.id);const out={};for(const key of ['id','name','type','quality','thumb','image','desc','relationID','relationName','cardImage','cardGetDesc','equipCard','talentStageDesc','talentStageType','effectTypeDesc'])if(c[key]!==undefined)out[key]=c[key];if(c.heroCard)out.heroCard={skillList:c.heroCard.skillList,properties:c.heroCard.properties,keywordDescription:c.heroCard.keywordDescription,awakeingCard:c.heroCard.awakeingCard?{desc:c.heroCard.awakeingCard.desc}:null};if(c.previewCards?.length)out.previewCards=c.previewCards.map(p=>({id:p.id,name:p.name,desc:p.desc,thumb:p.thumb,image:p.image,cardImage:p.cardImage}));const p=old.get(c.id);if(p?.thumb===c.thumb&&p?.localThumb)out.localThumb=p.localThumb;if(p?.image===c.image&&p?.localImage)out.localImage=p.localImage;return out;});
 }
 const rawLords=raw.lords?.lords;
 if(!Array.isArray(rawLords)||rawLords.length<15)throw Error('官方棋手资料不完整');
 const rows=[...new Map(raw.feeds.flatMap((feed,i)=>{if(!Array.isArray(feed)||!feed.length)throw Error('官方阵容列表不完整');return feed.map(x=>({...x,sourceFeed:FEED_SOURCES[i]}));}).map(x=>[x.key,x])).values()];
 if(rows.length<60)throw Error('本次阵容覆盖不足，保留旧资料');
 const heroById=new Map(cards.heroes.map(h=>[h.id,h]));
 const previousRows=new Map((previousLibrary?.lineups||[]).map(x=>[x.key,x]));
 const changes=contentDiff(previousData,cards),changedNames=new Set(changes.map(x=>x.name));
 const oldLords=new Map((previousLibrary?.lords||[]).map(l=>[l.id,l]));
 const lords=rawLords.map(l=>({id:l.lordId,name:l.name,image:oldLords.get(l.lordId)?.image?.startsWith('./assets/')?oldLords.get(l.lordId).image:(l.avatar||l.icon),skills:(l.talent||[]).map(s=>({type:s.name,level:s.level,cards:(s.cards||[]).map(c=>({id:c.id,name:c.name,desc:c.desc}))})),source:`https://wxq.qq.com/cp/a20260707sfgw/roledetail.html?roleId=${l.lordId}`,recommendedKeys:rows.filter(r=>r.lordList?.some(x=>x.name===l.name)).slice(0,3).map(r=>r.key)}));
 const lordChanges=lords.filter(l=>!oldLords.has(l.id)||JSON.stringify(normalized(oldLords.get(l.id).skills))!==JSON.stringify(normalized(l.skills))).map(l=>({id:l.id,name:l.name,type:'lords',kind:oldLords.has(l.id)?'changed':'added',before:'',after:l.skills.map(s=>s.cards.map(c=>plain(c.desc)).join('；')).join('\n')}));
 const changedLords=new Set(lordChanges.map(l=>l.name));
 const lineups=rows.map((item,i)=>{
  if(!item.heroList?.length||!item.key||!item.name)throw Error('官方阵容字段不完整');
  const heroes=item.heroList.map(h=>h.name),core=item.heroList.find(h=>h.type===1)||[...item.heroList].sort((a,b)=>(b.equipList?.length||0)-(a.equipList?.length||0))[0];
  const factions={};for(const h of item.heroList){const f=heroById.get(h.id)?.relationName||'无阵营';factions[f]=(factions[f]||0)+1;}const faction=Object.entries(factions).sort((a,b)=>b[1]-a[1])[0]?.[0]||'无阵营';
  let system=systems[faction];if(/炸盾|自爆|爆盾/.test(item.name))system='护盾爆破';else if(/召唤/.test(item.name))system='召唤军团';else if(/五阶|5阶|全五/.test(item.name))system='五阶拼多多';
  const brief=plain(item.brief),category=/倒转|战术牌/.test(system)?['combo']:['growth'];if(/新手|简单|轮椅|挂机|无脑/.test(brief+item.name))category.push('easy');
  const operations=item.operationDetails||[],labels=operations.length===1?['全程']:operations.length===2?['过渡','成形']:['前期','中期','后期'];
  const phases=operations.map((p,j)=>({label:(labels[j]||'阶段'+(j+1))+(p.beginRound>0&&p.endRound>0?' · '+(p.beginRound===p.endRound?p.beginRound:p.beginRound+'–'+p.endRound):''),heroes:p.mainHeroList.map(h=>h.name),alternatives:(p.subHeroList||[]).map(h=>h.name),text:plain(p.desc)||'原作者未填写本阶段运营，请结合来牌调整。',...placement(p.mainHeroList),awakened:p.mainHeroList.filter(h=>h.isEvo).map(h=>h.name)}));if(!phases.length)phases.push({label:'成形阵容',heroes,text:'原作者未填写分阶段运营。',...placement(item.heroList)});
  const players=(item.lordList||[]).map(l=>l.name),equipment=item.heroList.filter(h=>h.equipList?.length).map(h=>[h.name,h.equipList.map(e=>e.name).join('、')]);if(item.equipDesc)equipment.push(['原作者配装补充',plain(item.equipDesc)]);
  const previous=previousRows.get(item.key),affected=heroes.filter(h=>changedNames.has(h)).concat(players.filter(p=>changedLords.has(p)));
  return{id:'camp-'+item.key,key:item.key,name:item.name,artTitle:item.name,subtitle:system,en:'COMMUNITY STRATEGY',faction,system,category,difficulty:category.includes('easy')?'入门参考':category.includes('combo')?'连锁运营':'体系研习',core:core.name,art:colors[faction],tagline:brief,summary:brief.length>64?brief.slice(0,64)+'…':brief||'查看原作者运营与配装。',rating:Number(item.interactiveData?.score)>0?Number(item.interactiveData.score):null,scoreCount:item.interactiveData?.scoreNum||0,uses:item.useNum/10000,useNum:item.useNum,status:'官网攻略中心收录',players,lordNotes:(item.lordList||[]).map(l=>({name:l.name,text:plain(l.desc)})),preferredFor:lords.filter(l=>l.recommendedKeys.includes(item.key)).map(l=>l.name),source:item.jumpUrl,sourceFeed:item.sourceFeed,sourceKind:'official-community',sourceOrder:i+1,author:item.author?.name||'营地作者',heroes,phases,mechanism:brief,equipment,position:plain(item.positionDesc)||'原作者未填写独立站位说明。',talent:[(item.talentCardList||[]).map(c=>c.name).join('、'),plain(item.talentCardDesc)].filter(Boolean).join('\n'),effectTip:[(item.effectCardList||[]).map(c=>c.name).join('、'),plain(item.effectCardDesc)].filter(Boolean).join('\n'),searchExtras:[...item.talentCardList||[],...item.effectCardList||[]].map(c=>c.name),hot:!!item.tags?.length,feedTags:item.tags||[],awakened:item.heroList.filter(h=>h.isEvo).map(h=>h.name),...placement(item.heroList),checkedAt,needsReview:affected.length>0||previous?.needsReview||false,affected:affected.length?affected:previous?.affected||[],usageDelta:previous?Math.max(0,item.useNum-(previous.useNum||0)):null,newlySeen:!previous};
 });
 cards.meta.counts=Object.fromEntries(['heroes','equipment','talents','effects'].map(t=>[t,cards[t].length]));cards.meta.counts.lords=lords.length;
 return{cards,library:{meta:{...previousLibrary.meta,checkedAt,fetchedAt:dateInChina(checkedAt),coverage:'官网综合推荐前8页，非全部投稿总库。'},lineups,lords},changes:[...changes,...lordChanges],checkedAt};
}
export async function readOfficialSources(fetcher=fetch){
 const get=async url=>{const response=await fetcher(url,{cache:'no-cache',signal:AbortSignal.timeout(18000)});if(!response.ok)throw Error('官方源暂不可用：'+response.status);const data=await response.json();return data;};
 const entries=await Promise.all(Object.entries(CARD_SOURCES).map(async([type,url])=>[type,await get(url)]));
 const feeds=await Promise.all(FEED_SOURCES.map(get));return{...Object.fromEntries(entries),feeds};
}

