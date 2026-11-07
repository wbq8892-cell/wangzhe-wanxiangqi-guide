'use strict';

let lineupPage=0;
let libraryMeta={},lords=[],libraryScope='all',lineupLimit=12,globalSearchType='all';
const lordAliases={'常小娥':'嫦娥 常小鹅','孙小宾':'孙膑 孙小兵','庄小鱼':'庄周 庄庄小鱼','阿离':'公孙离','小妲己':'妲己','玉环':'杨玉环','马可':'马可波罗','香香':'孙尚香','昭君':'王昭君','姜导':'姜子牙','明先生':'明世隐','嬴律':'嬴政'};
const factionSystemNames={'河洛':'河洛古币牺牲','大河流域':'大河图腾开团','日落海':'日落海整备','三分之地':'三分登场倒转','逐鹿':'逐鹿战术牌','无阵营':'无阵营等级转化'};
const lordByName=name=>lords.find(l=>l.name===name);
const selectedLord=()=>$('#lineup-lord').value;
const queryTerms=value=>String(value||'').normalize('NFKC').toLowerCase().trim().split(/\s+/).filter(Boolean);
const termsMatch=(value,terms)=>terms.every(t=>String(value).normalize('NFKC').toLowerCase().includes(t));
function lineupSearchText(l,scope='all'){
 const players=l.players.map(name=>name+' '+(lordAliases[name]||'')).join(' ');
 const build=[...(l.equipment||[]).flat(),l.talent,l.effectTip,...l.searchExtras||[]].join(' ');
 return scope==='name'?l.name+' '+l.artTitle:scope==='players'?players:scope==='heroes'?l.heroes.join(' '):scope==='build'?build:[l.name,l.artTitle,l.system,l.faction,l.summary,l.mechanism,players,l.heroes.join(' '),build].join(' ');
}
function initializeExpandedLibrary(library){
 libraryMeta=library.meta;lords=library.lords;lineups.splice(0,lineups.length,...structuredClone(initialLineups));
 const codeMap=new Map();
 lineups.forEach((l,i)=>{l.curated=true;l.system=factionSystemNames[l.faction];l.sourceKind='legacy';l.hot=false;l.sourceOrder=i;l.preferredFor=[];l.lordNotes=[];codeMap.set(l.code,i);});
 for(const item of library.lineups){const existing=codeMap.get(item.key);if(existing!==undefined){lineups[existing]={...item,id:lineups[existing].id,curated:true};}else lineups.push(item);}
 $('#lineup-total').textContent=lineups.length;$('#lord-count').textContent=lords.length;$('#all-lineup-count').textContent=lineups.length;$('[data-library-scope="lords"] span').textContent=lords.length;
 const curated=lineups.filter(l=>l.curated).length;
 $('[data-library-scope="curated"] span').textContent=String(curated).padStart(2,'0');
 $('#lineup-lord').innerHTML='<option value="all">全部棋手 · '+lords.length+' 位</option>'+lords.map(l=>`<option value="${esc(l.name)}">${esc(l.name)}</option>`).join('');
 $('#lineup-system').innerHTML='<option value="all">全部体系 · 9 类</option>'+[...new Set(lineups.map(l=>l.system))].map(s=>`<option>${esc(s)}</option>`).join('');
 $('#lineup-hero').innerHTML='<option value="all">全部英雄</option>'+data.heroes.map(h=>`<option>${esc(h.name)}</option>`).join('');
 renderLordDirectory();
}
function filteredLineups(){
 const lord=selectedLord(),system=$('#lineup-system').value,member=$('#lineup-hero').value,terms=queryTerms($('#lineup-query').value),scope=$('#lineup-search-scope').value;
 let list=lineups.filter(l=>(libraryScope!=='hot'||l.hot)&&(libraryScope!=='curated'||l.curated)&&(lineupFilter==='all'||l.category.includes(lineupFilter))&&(!favoritesOnly||saved.has(l.id))&&(lord==='all'||l.players.includes(lord))&&(system==='all'||l.system===system)&&(member==='all'||l.heroes.includes(member))&&(inlineGuideAnswer&&scope==='all'?(inlineGuideAnswer.lineupIds||[]).includes(l.id):termsMatch(lineupSearchText(l,scope),terms)));
 const sort=$('#lineup-sort').value;
 if(sort==='popular')list.sort((a,b)=>(b.useNum??b.uses*10000)-(a.useNum??a.uses*10000));
 else if(sort==='rating')list.sort((a,b)=>(b.rating??-1)-(a.rating??-1)||(b.scoreCount||0)-(a.scoreCount||0));
 else if(lord!=='all')list.sort((a,b)=>Number((b.preferredFor||[]).includes(lord))-Number((a.preferredFor||[]).includes(lord))||(a.sourceOrder??999)-(b.sourceOrder??999));
 else if(libraryScope!=='curated')list.sort((a,b)=>Number(b.sourceKind==='official-community')-Number(a.sourceKind==='official-community')||(a.sourceOrder??999)-(b.sourceOrder??999));
 return list;
}
function renderExpandedLineups(){
 renderInlineGuidance();
 const list=filteredLineups(),pageSize=matchMedia('(max-width:600px)').matches?3:6;lineupPage=Math.min(lineupPage,Math.max(0,Math.ceil(list.length/pageSize)-1));const shown=list.slice(lineupPage*pageSize,(lineupPage+1)*pageSize),lord=selectedLord();
 $$('.library-scopes button').forEach(b=>{b.classList.toggle('active',b.dataset.libraryScope===libraryScope);b.setAttribute('aria-pressed',String(b.dataset.libraryScope===libraryScope));});
 $$('[data-filter]').forEach(b=>{b.classList.toggle('active',b.dataset.filter===lineupFilter);b.setAttribute('aria-pressed',String(b.dataset.filter===lineupFilter));});
 $('#lord-directory-wrap').hidden=libraryScope!=='lords';
 $$('[data-lord-pick]').forEach(b=>{b.classList.toggle('active',b.dataset.lordPick===lord);b.setAttribute('aria-pressed',String(b.dataset.lordPick===lord));});
 $('#lineup-result-count').textContent=inlineGuideAnswer?`已回答你的问题 · ${list.length} 套相关构筑`:`找到 ${list.length} 套阵容 · 已展示 ${shown.length} 套`;
 const active=[lord==='all'?'':lord,$('#lineup-system').value==='all'?'':$('#lineup-system').value,$('#lineup-hero').value==='all'?'':$('#lineup-hero').value].filter(Boolean);
 $('#active-lineup-filters').textContent=active.length?active.join(' / '):libraryScope==='hot'?'保留官网“赛季热门 / 近期飙升”标签':libraryScope==='lords'?'点击棋手，查看专属技能与推荐适配':'可组合搜索与筛选';
 $('#lineup-grid').innerHTML=shown.length?shown.map(l=>{
  const recommended=lord!=='all'&&(l.preferredFor||[]).includes(lord),useText=l.useNum!==undefined?(l.useNum>=10000?(l.useNum/10000).toFixed(1)+'万':String(l.useNum)):l.uses+'万';
  const label=recommended?'棋手首推':l.hot?'网络热门':l.sourceKind==='legacy'?'历史精选':'官网收录';
  return `<article class="lineup-card expanded-lineup" style="--art-bg:${l.art}"><button class="lineup-art" data-lineup="${l.id}" aria-label="查看${esc(l.name)}攻略">${img(hero(l.core),'card-character','portrait')}<span class="lineup-art-label"><small>${l.en}</small><strong>${esc(l.artTitle)}</strong><span>${esc(l.system||l.subtitle)}</span></span></button><button class="save-lineup ${saved.has(l.id)?'saved':''}" data-save="${l.id}" aria-label="${saved.has(l.id)?'取消收藏':'收藏'}${esc(l.name)}" aria-pressed="${saved.has(l.id)}">${icon('bookmark')}</button><div class="lineup-body"><div class="lineup-card-heading"><button class="lineup-title" data-lineup="${l.id}">${esc(l.name)}</button><span class="difficulty-tag ${l.hot?'hot-tag':''}">${label}</span></div><p class="lineup-summary">${esc(l.summary)}</p>${l.needsReview?`<span class="review-tag">${esc((l.affected||[]).join('、'))}相关改动 · 待复核</span>`:''}<div class="lineup-lord-tags">${l.players.map(n=>`<button data-lord-pick="${esc(n)}" title="查看${esc(n)}的适配阵容">${esc(n)}</button>`).join('')}</div><div class="avatar-row" aria-label="阵容英雄">${l.heroes.slice(0,6).map(n=>img(hero(n),'','thumb',`title="${esc(n)}"`)).join('')}${l.heroes.length>6?`<span class="avatar-more">+${l.heroes.length-6}</span>`:''}</div><div class="lineup-card-footer"><div class="lineup-stat"><span>${l.rating?'评分 <b>'+l.rating.toFixed(1)+'</b>':'暂无评分'}</span><span>· 使用 <b>${useText}</b></span></div><button data-lineup="${l.id}">研习阵容 ${icon('arrow')}</button></div></div></article>`;
 }).join(''):`<div class="empty-state">${favoritesOnly?'收藏中没有符合当前条件的阵容。':'没有找到符合组合条件的阵容。'}<br><button class="text-link" data-reset-library>清除筛选，重新看看 ↺</button></div>`;
 $('#load-more-lineups').hidden=(lineupPage+1)*pageSize>=list.length;$('#previous-lineups').hidden=lineupPage===0;$('#lineup-page-meta').textContent=`${lineupPage+1} / ${Math.max(1,Math.ceil(list.length/pageSize))}`;
 $('#load-more-lineups').innerHTML='下一页 '+icon('arrow');
 renderLordProfile();
}
function renderLordDirectory(){
 $('#lord-directory').innerHTML=lords.map(l=>{const count=lineups.filter(x=>x.players.includes(l.name)).length;return `<button class="lord-pick" data-lord-pick="${esc(l.name)}" aria-pressed="false"><img src="${esc(l.image)}" alt="" loading="lazy"><span><b>${esc(l.name)}</b><small>${count} 套适配</small></span></button>`;}).join('');
}
function renderLordProfile(){
 const lord=lordByName(selectedLord()),el=$('#lord-profile');el.hidden=!lord;if(!lord){el.innerHTML='';return;}
 const recommended=lineups.filter(l=>(l.preferredFor||[]).includes(lord.name)).sort((a,b)=>a.sourceOrder-b.sourceOrder);
 el.innerHTML=`<div class="lord-profile-heading"><img src="${esc(lord.image)}" alt="${esc(lord.name)}"><div><span class="eyebrow">CHESS PLAYER / 棋手专属研习</span><h3>${esc(lord.name)}<small>${lineups.filter(l=>l.players.includes(lord.name)).length} 套适配构筑</small></h3></div><a href="${esc(lord.source)}" target="_blank" rel="noopener">官方棋手档案 ↗</a></div><div class="lord-skill-grid">${lord.skills.map(s=>`<div><span>${esc(s.type)}${s.level>=6?' · 6级':''}</span>${s.cards.map(c=>`<h4>${esc(c.name)}</h4><p>${esc(clean(c.desc))}</p>`).join('')}</div>`).join('')}</div><div class="lord-recommendations"><span>先研习这 3 套</span>${recommended.map(l=>`<button data-lineup="${l.id}">${esc(l.name)} ↗</button>`).join('')}</div><p class="lord-profile-note">按官网棋手详情页的综合推荐顺序收录。这里的“专属”指围绕棋手能力研习，兼容多棋手的阵容会保留全部适配棋手。</p>`;
}
function chooseLord(name){
 if(!lordByName(name))return;
 $('#lineup-lord').value=name;libraryScope='lords';lineupLimit=12;lineupPage=0;renderExpandedLineups();window.navigateTo?.('lineups');$('#lineups').scrollIntoView({behavior:'smooth'});
}
function resetLineupLibrary(){
 libraryScope='all';lineupFilter='all';favoritesOnly=false;lineupLimit=12;lineupPage=0;
 $('#lineup-query').value='';['lineup-lord','lineup-system','lineup-hero','lineup-search-scope'].forEach(id=>$('#'+id).value='all');$('#lineup-sort').value='curated';updateSaved();
}
function showExpandedLineup(id){
 const l=lineups.find(x=>x.id===id);if(!l)return;currentLineup=l;currentPhase=l.phases.length-1;selectedCell=null;
 const isOfficial=l.sourceKind==='official-community',notes=l.lordNotes||[],metric=l.rating?`玩家评分 ${l.rating}${l.scoreCount?' · '+l.scoreCount+' 人评价':''}`:'暂无玩家评分';
 openDetail(`<div class="detail-inner"><div class="detail-header">${img(hero(l.core),'detail-avatar')}<div><div class="detail-eyebrow">LINEUP STUDY / ${esc(l.status)}</div><h2 class="detail-title">${esc(l.name)}</h2><div class="detail-subtitle"><span>${esc(l.system||l.faction)}</span><span>${esc(metric)}</span></div></div></div><p class="detail-intro"><b>${isOfficial?'原作者构筑思路':'构筑思路'} · ${esc(l.author)}</b><br>${esc(l.mechanism||l.tagline)}</p>${notes.length?`<div class="lineup-lord-reasons"><h3>为什么适配这些棋手</h3>${notes.map(n=>`<div><button data-lord-pick="${esc(n.name)}">${esc(n.name)} ↗</button><p>${esc(n.text||'作者将该棋手列为适配选择，未单独填写操作说明。')}</p></div>`).join('')}</div>`:`<div class="detail-block"><h3>适配棋手</h3><div class="equip-list">${l.players.map(n=>`<button class="detail-chip" data-lord-pick="${esc(n)}">${esc(n)} ↗</button>`).join('')}</div></div>`}<div class="detail-content-grid"><div><div class="detail-block"><h3>从过渡到成形</h3><div class="phase-tabs">${l.phases.map((p,i)=>`<button data-phase="${i}" class="${i===currentPhase?'active':''}">${esc(p.label)}</button>`).join('')}</div><div class="phase-desc" id="phase-desc"></div><div class="board-front">对手方向 ↑ · 己方 4 × 7 棋盘</div><div class="chessboard" id="lineup-board" role="group" aria-label="可调整的阵容站位棋盘"></div><p class="board-note" id="board-source-note"></p><div class="board-control"><button id="reset-board">恢复站位</button></div></div><div class="detail-block"><h3>本阶段英雄</h3><div id="phase-heroes"></div></div><div class="detail-block" id="phase-alternatives"></div></div><div><div class="detail-block"><h3>装备怎么给</h3>${l.equipment.length?l.equipment.map(([name,tip])=>`<h4>${esc(name)}</h4><p>${esc(tip)}</p>`).join(''):'<p>原作者未填写具体装备方案。</p>'}</div><div class="detail-block"><h3>站位思路</h3><p>${esc(l.position)}</p></div><div class="detail-block"><h3>天赋选择</h3><p>${esc(l.talent||'原作者未单独填写天赋选择。')}</p></div>${l.effectTip?`<div class="detail-block"><h3>效果牌选择</h3><p>${esc(l.effectTip)}</p></div>`:''}</div></div><div class="detail-actions">${l.key?`<button class="button primary" id="copy-lineup-code">${icon('copy')} 复制阵容码</button>`:''}<button class="button ${l.key?'outline':'primary'}" id="copy-lineup">${icon('copy')} 复制阵容清单</button><button class="button outline" data-save="${l.id}">${icon('bookmark')} ${saved.has(l.id)?'已收藏 · 点击取消':'收藏这套阵容'}</button><a href="${esc(l.source)}" target="_blank" rel="noopener">${isOfficial?'查看营地原作者攻略':'查看社区收录原文'} ↗</a></div><p class="board-note">${isOfficial?'官网攻略中心收录的社区作者构筑，非官方强度结论。':'初版资料站历史收录。'}数据核验 ${esc(snapshotLabel())}；评分和累计使用量不等同于胜率。运营回合仅作节奏参考，原作者经验需结合当前局内环境判断。</p></div>`);
 setExpandedPhase(currentPhase);
}
function setExpandedPhase(i){
 const l=currentLineup,p=l?.phases[i];if(!p)return;currentPhase=i;board=Array(28).fill(null);selectedCell=null;
 p.heroes.forEach((name,j)=>{const pos=p.positions?.[j]??(i===l.phases.length-1?l.positions[j]:[3,24,17,25,23,5,26,10,12][j]??j);board[pos]=name;});
 $('#phase-desc').textContent=p.text;
 $('#phase-heroes').innerHTML=chips(p.heroes);
 const alternate=$('#phase-alternatives');if(alternate){alternate.hidden=!p.alternatives?.length;alternate.innerHTML=p.alternatives?.length?'<h3>可替换英雄</h3>'+chips(p.alternatives):'';}
 const sourceNote=$('#board-source-note');if(sourceNote)sourceNote.textContent=(p.sourceBoard?'原作者站位，按对手朝上展示。':'本站建议站位，非原作者站位图。')+'先点英雄，再点目标格移动或交换。'+(p.awakened?.length?'作者标注觉醒：'+p.awakened.join('、')+'。':'')+'棋手召唤物未计入。';
 $$('[data-phase]',detail).forEach(b=>{b.classList.toggle('active',Number(b.dataset.phase)===i);b.setAttribute('aria-pressed',String(Number(b.dataset.phase)===i));});renderBoard();
}
async function copyExpandedLineup(mode='list'){
 const l=currentLineup;if(!l)return;
 const text=mode==='code'&&l.key?l.key:[`弈境 · ${l.name}`,`棋手：${l.players.join(' / ')}`,`英雄：${l.heroes.join('、')}`,`体系：${l.system||l.faction}`,`原作者：${l.author}`,`来源：${l.source}`].join('\n');
 try{await navigator.clipboard.writeText(text);toast(mode==='code'?'阵容码已复制，可到游戏内导入':'已复制阵容清单与出处');}catch{const field=document.createElement('textarea');field.value=text;field.style.position='fixed';field.style.opacity='0';document.body.append(field);field.select();const ok=document.execCommand('copy');field.remove();toast(ok?'已复制阵容清单':'暂时无法复制，请查看原作者攻略');}
}
function renderExpandedSearch(){renderSearchWithGuidance();}
function showExpandedSources(){
 openDetail(`<div class="detail-inner"><div class="detail-eyebrow">SOURCES & METHODOLOGY</div><h2 class="detail-title">资料有出处，判断有依据</h2><div class="detail-intro">官方资料核验日期：${esc(snapshotLabel())}。打开页面后会核验官方卡牌和阵容，保留上次成功资料；打法结论与数值同步分别标注。</div><div class="source-list"><p><b>官方卡牌与棋手</b><br>${data.heroes.length} 位英雄、${data.equipment.length} 件装备、${data.talents.length} 张天赋、${data.effects.length} 张效果牌及 ${lords.length} 名棋手技能，直接读取官网公开数据。未获得明确游戏版本号。</p><p><b>新增阵容与棋手适配</b><br>读取<a href="https://wxq.qq.com/cp/a20260707sfgw/index.html" target="_blank" rel="noopener">官网攻略中心</a>综合推荐前 8 页，共 148 套社区作者构筑，并保留作者、累计使用量、玩家评分、装备与阶段运营。不是官网全部投稿总库。<a href="${esc(libraryMeta.pages?.[0]?.url||'https://wxq.qq.com/')}" target="_blank" rel="noopener">公开阵容数据来源 ↗</a></p><p><b>“网络热门”与“棋手专属”</b><br>热门分类保留官网接口的“赛季热门 / 近期飙升”标签。每名棋手的 3 套首推依照官网棋手页逻辑，按综合推荐顺序选取作者标注适配该棋手的构筑。“专属”指围绕棋手技能研习，部分阵容支持多名棋手，不表示独占。</p><p><b>攻略问答</b><br>根据收录的官方卡牌、棋手和原作者构筑匹配问题，区分机制推导与社区经验。克制李信专题另核对官网刊载的社区文章 18900122、18896838、18900212。问答不接入实时比赛数据；未覆盖的问题会明确提示。输入的提问在当前浏览器中处理。</p><p><b>搜索与体系整理</b><br>支持名称、棋手、英雄、装备和天赋文本检索，多个关键词以空格分隔并同时匹配。九类流派依照阵营、构筑名称与成员整理，属于本站检索分类。初版精选保留，重复构筑优先采用新的官网资料。</p><p><b>评分与站位</b><br>评分为玩家评分，使用量为接口累计使用量，均不代表实战胜率。原作者站位按官方坐标展示；未提供完整坐标时标为建议示意。官网复制按钮以阵容 key 作为导入码，本站保留该字符串并支持复制；也可复制可读的阵容清单与出处。</p><p><b>原作者与版权</b><br>构筑经验归原作者，详情提供营地原文链接；初版历史资料来源保留<a href="https://wxqwiki.com/top/zuiqiang-zhenrong" target="_blank" rel="noopener">万象棋知识库</a>。角色、技能与卡牌图像版权归腾讯，本站与腾讯无隶属关系。</p></div></div>`);
}
function wireLibraryEvents(){
 document.addEventListener('click',e=>{
  if(e.target.closest('#copy-lineup-code')){copyExpandedLineup('code');return;}
  const scope=e.target.closest('[data-library-scope]');if(scope){libraryScope=scope.dataset.libraryScope;lineupLimit=12;lineupPage=0;renderExpandedLineups();return;}
  const pick=e.target.closest('[data-lord-pick]');if(pick){if(detail.open)detail.close();if(searchDialog.open)searchDialog.close();chooseLord(pick.dataset.lordPick);return;}
  if(e.target.closest('[data-open-lords]')){libraryScope='lords';lineupLimit=12;lineupPage=0;renderExpandedLineups();return;}
  if(e.target.closest('[data-reset-library]')){resetLineupLibrary();return;}
  const type=e.target.closest('[data-global-type]');if(type){globalSearchType=type.dataset.globalType;$$('[data-global-type]').forEach(b=>{b.classList.toggle('active',b===type);b.setAttribute('aria-pressed',String(b===type));});renderExpandedSearch();}
 });
 $('#lineup-query').addEventListener('input',()=>{lineupLimit=12;lineupPage=0;renderExpandedLineups();});
 ['lineup-search-scope','lineup-system','lineup-hero','lineup-lord'].forEach(id=>$('#'+id).addEventListener('change',()=>{if(id==='lineup-lord'&&selectedLord()!=='all')libraryScope='lords';lineupLimit=12;lineupPage=0;renderExpandedLineups();}));
 $('#reset-lineups').addEventListener('click',resetLineupLibrary);
 $('#load-more-lineups').addEventListener('click',()=>{lineupPage++;renderExpandedLineups();$('#lineups').scrollIntoView({block:'start'});});$('#previous-lineups').addEventListener('click',()=>{lineupPage=Math.max(0,lineupPage-1);renderExpandedLineups();$('#lineups').scrollIntoView({block:'start'});});
}

