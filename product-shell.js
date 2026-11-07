'use strict';
let productStatus={},productNews={items:[]},productReviews={},briefMode='version',newsFilter='live',contentBusy=false,productStarted=false,currentRoute='home',lastPollAt=0;
let studioLineup=null,studioPage=0,studioFormat='portrait',studioDownloadUrl=null,studioRenderToken=0;
const routeTitles={home:'今日棋局',lineups:'阵容研习',updates:'版本雷达',cards:'万象图鉴',ask:'攻略问答',guide:'入局手记'};
const routeScroll=new Map();
const localPreview=['127.0.0.1','localhost'].includes(location.hostname);
function metric(name,details={}){window.dispatchEvent(new CustomEvent('yijing:metric',{detail:{name,...details}}));}
function readableTime(value,full=false){if(!value)return'尚未核验';const date=new Date(value);if(!Number.isFinite(date.getTime()))return String(value).slice(0,10).replaceAll('-','.');return new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',...(full?{year:'numeric'}:{}),month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(date).replaceAll('/','.');}
window.navigateTo=function(route,push=true){
 if(!routeTitles[route])route='home';
 const changed=currentRoute!==route;routeScroll.set(currentRoute,scrollY);currentRoute=route;
 $$('[data-screen]').forEach(el=>{el.hidden=el.dataset.screen!==route;});
 $$('[data-nav]').forEach(el=>{el.classList.toggle('active',el.dataset.nav===route);if(el.dataset.nav===route)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
 $('#screen-title').textContent=routeTitles[route];
 if(push&&location.hash!=='#'+route)history.pushState(null,'','#'+route);
 if(changed||push)window.scrollTo({top:changed?(routeScroll.get(route)||0):0,behavior:'instant'});if(changed)metric('screen_view',{screen:route});
};
function parseRoute(){const route=location.hash.slice(1);window.navigateTo(routeTitles[route]?route:'home',false);}
parseRoute();
if('scrollRestoration'in history)history.scrollRestoration='manual';
addEventListener('load',()=>window.scrollTo({top:0,behavior:'instant'}),{once:true});
addEventListener('popstate',parseRoute);addEventListener('hashchange',parseRoute);
document.addEventListener('click',event=>{
 const anchor=event.target.closest('a[href^="#"]');if(anchor&&routeTitles[anchor.hash.slice(1)]){event.preventDefault();window.navigateTo(anchor.hash.slice(1));}
 const brief=event.target.closest('[data-brief]');if(brief){briefMode=brief.dataset.brief;renderBrief();}
 const ask=event.target.closest('[data-home-question]');if(ask){window.navigateTo('ask');askGuideQuestion(ask.dataset.homeQuestion);metric('guide_submit',{origin:'home'});}
 const refresh=event.target.closest('[data-refresh-content]');if(refresh)refreshOfficialContent(true);
 const filter=event.target.closest('[data-news-filter]');if(filter){newsFilter=filter.dataset.newsFilter;renderNews();}
 const news=event.target.closest('[data-news]');if(news)showNews(news.dataset.news);
 const step=event.target.closest('[data-detail-step]');if(step)setDetailStep(step.dataset.detailStep);
 const studio=event.target.closest('[data-studio-lineup]');if(studio)openStudio(studio.dataset.studioLineup);
 const page=event.target.closest('[data-studio-page]');if(page){studioPage=Number(page.dataset.studioPage);renderStudioPreview();}
 const format=event.target.closest('[data-studio-format]');if(format){studioFormat=format.dataset.studioFormat;renderStudioPreview();}
 if(event.target.closest('[data-close-studio]'))$('#studio-dialog').close();
 if(event.target.closest('[data-export-poster]'))exportPoster();
 if(event.target.closest('[data-copy-script]'))copyCreatorScript();
},true);
document.addEventListener('click',event=>{const open=event.target.closest('[data-lineup]');if(open)metric('lineup_open',{id:open.dataset.lineup});});
$('#guide-question-form').addEventListener('submit',()=>metric('guide_submit',{origin:'ask'}));
const canonical=location.origin+location.pathname;document.querySelector('link[rel="canonical"]').href=canonical;document.querySelector('meta[property="og:url"]').content=canonical;
function renderFreshness(){
 const checked=productStatus.lastSuccessfulAt||data.meta.checkedAt||data.meta.fetchedAt;
 $$('[data-freshness-label]').forEach(el=>el.textContent=contentBusy?'核验官方资料中':productStatus.failed?'连接未成功 · 保留上次资料':'核验 '+readableTime(checked));
 $$('[data-refresh-content]').forEach(el=>{el.disabled=contentBusy;el.classList.toggle('refreshing',contentBusy);el.setAttribute('aria-busy',String(contentBusy));});
 const version=productNews.items.find(n=>n.server==='正式服')||{};
 $('#version-highlight').innerHTML=`<span class="version-number">${esc(version.version||'待核验')}</span><h3>${esc(version.changes?.length?version.changes.map(x=>x.entity).filter((x,i,a)=>a.indexOf(x)===i).slice(0,2).join('、')+'，本期留意这些变化。':'官方变化，先看重点。')}</h3><p>${esc(short(version.summary||'尚未读取到已核验的官方公告。',57))}</p><small class="version-date">${esc(version.effectiveDate||version.publishedAt?.slice(0,10)||'')} · ${esc(version.server||'公告快照')}</small>`;
 const note=$('[data-data-caption]');if(note)note.textContent=`卡牌 / 阵容核验 ${readableTime(checked)} · 官方社区构筑与原作者经验，评分和使用量不代表胜率。`;
 $('#analysis-review-note').textContent=' 打法分析复核：'+String(guideKnowledge.meta?.checkedAt||'待确认').replaceAll('-','.');
}
function applyEditorialFlags(){
 const newest=productNews.items.find(n=>n.server==='正式服'&&n.changes?.length);
 const names=new Set([...(newest?.affectedLords||[]),...(newest?.affectedHeroes||[])]);
 const approved=new Set(productReviews.version===newest?.version?productReviews.reviewedKeys||[]:[]);
 for(const l of lineups){if(approved.has(l.key)){l.needsReview=false;l.affected=[];l.reviewedVersion=newest.version;continue;}const affected=[...l.heroes,...l.players].filter(n=>names.has(n));if(affected.length){l.needsReview=true;l.affected=[...new Set([...l.affected||[],...affected])];}}
 productStatus.pendingLineups=lineups.filter(l=>l.needsReview).length;
}
function renderHome(){
 $('#home-lineups').innerHTML=lineups.filter(l=>l.sourceKind==='official-community').sort((a,b)=>a.sourceOrder-b.sourceOrder).slice(0,3).map(l=>`<button class="home-lineup" data-lineup="${l.id}">${img(hero(l.core))}<span><b>${esc(l.name)}</b><small>${esc(l.players.slice(0,2).join(' / '))} · ${l.needsReview?'版本待复核':'官网收录'}</small></span><em>↗</em></button>`).join('');renderFreshness();renderBrief();
}
function renderBrief(){
 $$('[data-brief]').forEach(b=>{const active=b.dataset.brief===briefMode;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));});
 const item=productNews.items.find(n=>n.server==='正式服'),latest=lineups.find(l=>l.players.includes('武凤'))||lineups.find(l=>l.sourceKind==='official-community');let html='';
 if(briefMode==='version')html=`<div class="brief-content"><div><h3>${esc(item?.version||'本期版本')}，先看变化再选阵容。</h3><p>${esc(short(item?.summary||'官方公告和卡牌变化核验后，才会出现在这里。',88))}</p><div class="brief-pills"><span>正式服与体验服分开</span><span>${productStatus.pendingLineups||0} 套构筑待复核</span></div><a class="brief-link" href="#updates">查看本期解读 ↗</a></div><span class="brief-orb">更</span></div>`;
 if(briefMode==='lineup')html=`<div class="brief-content"><div><h3>${esc(latest?.name||'找到适合你的构筑')}</h3><p>围绕${esc(latest?.players.join(' / ')||'棋手能力')}选体系，查看阶段运营、配装与可调整站位。</p><div class="brief-pills">${(latest?.heroes||[]).slice(0,4).map(n=>`<span>${esc(n)}</span>`).join('')}</div><button class="brief-link" data-lineup="${latest?.id}">展开这套阵容 ↗</button></div><span class="brief-orb">阵</span></div>`;
 if(briefMode==='counter')html='<div class="brief-content"><div><h3>克制单核，先看免控和等级。</h3><p>艾琳拉扯、海月牺牲、东皇压制，各有条件。带机器头和炽热时，反制思路也要一起变。</p><div class="brief-pills"><span>不把条件藏起来</span><span>带卡牌机制依据</span></div><button class="brief-link" data-home-question="打999李信谁比较克制">看看怎么回答 ↗</button></div><span class="brief-orb">破</span></div>';
 $('#focus-stage').innerHTML=html;
}
function renderNews(){
 const checked=productStatus.lastSuccessfulAt||data.meta.checkedAt;
 $('#sync-summary').innerHTML=`<div class="sync-tile"><span>最近正式服公告</span><strong>${esc(productNews.latestVersion||'待核验')}</strong><small>公告核验 ${esc(readableTime(productNews.checkedAt))}</small></div><div class="sync-tile"><span>卡牌与构筑资料</span><strong>${esc(readableTime(checked))}</strong><small>${data.heroes.length} 英雄 · ${lords.length} 棋手 · ${lineups.length} 套构筑</small></div><div class="sync-tile"><span>本期关联构筑</span><strong>${productStatus.pendingLineups||0} 套待复核</strong><small>收录更新不等于实战结论已验证</small></div>`;
 const list=productNews.items.filter(n=>newsFilter==='all'||(newsFilter==='test'?n.server==='体验服':n.server==='正式服'));
 $$('[data-news-filter]').forEach(b=>{b.classList.toggle('active',b.dataset.newsFilter===newsFilter);b.setAttribute('aria-selected',String(b.dataset.newsFilter===newsFilter));});
 $('#update-feed').innerHTML=(productStatus.failed?'<div class="sync-error">刚才未能连接官方资料源，以下保留上次成功核验内容。请稍后重试。</div>':'')+(list.length?list.map(n=>`<button class="news-card" data-news="${esc(n.id)}"><div class="news-card-meta"><b>${esc(n.server)}</b><span>${esc(n.effectiveDate&&n.effectiveDate!=='待核对'?'生效 '+n.effectiveDate:(n.publishedAt||'').slice(0,10))}</span>${n.editorialStatus?`<span>${esc(n.editorialStatus)}</span>`:''}</div><h3>${esc(n.title)}</h3><p>${esc(n.summary||n.note||'官方原文已收录，详细解读待复核。')}</p><div class="news-card-footer">${[...n.affectedLords||[],...n.affectedHeroes||[]].slice(0,4).map(name=>`<span>${esc(name)}</span>`).join('')}<span>官方来源可查</span><em>↗</em></div></button>`).join(''):'<div class="empty-update">暂未收录这个范围的已核验公告。</div>');
 const changes=productStatus.changes||[];$('#change-count').textContent=changes.length;
 $('#change-list').innerHTML=changes.length?changes.slice(0,7).map(c=>`<div class="change-item"><b>${esc(c.name.slice(0,1))}</b><span>${esc(c.name)}<small>${c.kind==='added'?'新增收录':c.kind==='removed'?'已从官方资料移除':'技能或数值变化'} · ${c.type==='lords'?'棋手':typeNames[c.type]||''}</small></span></div>`).join(''):'<div class="empty-update">本次核验未发现新的卡牌文案变化。</div>';
}
function showNews(id){
 const n=productNews.items.find(x=>String(x.id)===String(id));if(!n)return;
 metric('news_open',{id:n.id});
 openDetail(`<div class="detail-inner"><div class="detail-eyebrow">版本雷达 / ${esc(n.server)}</div><h2 class="detail-title">${esc(n.title)}</h2><div class="version-detail-tags"><span>${esc(n.version||'待确认')}</span><span>发布 ${(n.publishedAt||'').slice(0,16)}</span><span>生效 ${esc(n.effectiveDate||'以原文为准')}</span></div><p class="detail-intro">${esc(n.summary||n.note||'官方原文已收录，解读待复核。')}</p>${n.server==='体验服'?'<div class="editorial-note">这是体验服消息，不代表正式服已经采用相同调整。</div>':''}<ul class="version-summary-list">${(n.changes||[]).map(c=>`<li><b>${esc(c.entity)} · ${esc(c.part)}</b>${esc(c.change)}</li>`).join('')}</ul>${n.editorialImplications?.length?`<div class="detail-block"><h3>这对阵容意味着什么</h3>${n.editorialImplications.map(x=>`<p>${esc(x.text)}</p><small>${esc(x.basis)}</small>`).join('')}</div>`:''}<div class="editorial-note">公告变化是事实；阵容影响是待验证的研习方向，不代表胜率结论。</div><div class="detail-actions"><a class="button primary" href="${esc(n.source)}" target="_blank" rel="noopener">查看官方原文 ↗</a><button class="button outline" data-news-lineups="${esc([...(n.affectedLords||[]),...(n.affectedHeroes||[])][0]||'')}">查看相关构筑</button></div></div>`);
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-news-lineups]');if(!b)return;detail.close();window.navigateTo('lineups');resetLineupLibrary();$('#lineup-query').value=b.dataset.newsLineups;renderExpandedLineups();});
window.enhanceDetail=function(){
 const root=$('#detail-content .detail-inner'),grid=root?.querySelector('.detail-content-grid');if(!grid||!root.querySelector('#lineup-board'))return;
 const summary=document.createElement('section');summary.dataset.detailPanel='summary';summary.className='detail-summary-panel';
 let node=root.querySelector('.detail-intro');while(node&&node!==grid){const next=node.nextElementSibling;summary.append(node);node=next;}
 grid.before(summary);grid.children[0].dataset.detailPanel='board';grid.children[1].dataset.detailPanel='build';
 const tabs=document.createElement('div');tabs.className='detail-stepper';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','阵容研习步骤');tabs.innerHTML='<button data-detail-step="summary" role="tab">01 思路</button><button data-detail-step="board" role="tab">02 站位运营</button><button data-detail-step="build" role="tab">03 装备天赋</button>';summary.before(tabs);
 if(currentLineup?.needsReview){const note=document.createElement('p');note.className='editorial-note';note.textContent=(currentLineup.affected||[]).join('、')+'在近期版本中有关联改动。这套构筑的打法尚待复核，请结合当前局内数值判断。';tabs.before(note);}
 const actions=root.querySelector('.detail-actions');if(actions){const button=document.createElement('button');button.className='button outline studio-tools-cta';button.dataset.studioLineup=currentLineup.id;button.innerHTML=icon('cards')+' 做成攻略卡片';actions.prepend(button);}
 setDetailStep('board');
};
function setDetailStep(step){$$('[data-detail-panel]',detail).forEach(el=>el.hidden=el.dataset.detailPanel!==step);$$('[data-detail-step]',detail).forEach(b=>{b.classList.toggle('active',b.dataset.detailStep===step);b.setAttribute('aria-selected',String(b.dataset.detailStep===step));});}
async function loadProductContent(){
 const load=async(name,fallback)=>{try{const response=await fetch('./'+name);if(!response.ok)throw Error();return await response.json();}catch{return fallback;}};
 [productStatus,productNews,productReviews]=await Promise.all([load('live-status.json',{}),load('announcements.json',{items:[]}),load('editorial-reviews.json',{})]);
 applyEditorialFlags();renderHome();renderNews();renderExpandedLineups();
 setTimeout(()=>refreshOfficialContent(false),500);
}
async function refreshOfficialContent(manual=false){
 if(contentBusy||!window.yijingReady)return;
 if(!manual&&(document.hidden||Date.now()-lastPollAt<15*60*1000||$$('dialog[open]').length))return;
 contentBusy=true;renderFreshness();
 const newsEndpoint=localPreview?'/api/official-news':'/.netlify/functions/official-news';
 const newsTask=fetch(newsEndpoint,{signal:AbortSignal.timeout(20000)}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(n=>{if(!Array.isArray(n.items))throw Error();productNews=n;}).catch(()=>{});
 try{
  const {readOfficialSources,normalizeContent}=await import('./content-core.js');
  const next=normalizeContent(await readOfficialSources(),data,{meta:libraryMeta,lords,lineups:lineups.filter(l=>l.sourceKind==='official-community')});
  // Avoid replacing a board or a modal task that the reader has started meanwhile.
  if($$('dialog[open]').length){if(manual)toast('资料已核验，关闭详情后再次核验即可更新当前视图');return;}
  const selections=Object.fromEntries(['lineup-lord','lineup-system','lineup-hero'].map(id=>[id,$('#'+id).value]));
  data=next.cards;initializeExpandedLibrary(next.library);for(const[id,value]of Object.entries(selections))if([...$('#'+id).options].some(o=>o.value===value))$('#'+id).value=value;
  productStatus={...productStatus,lastSuccessfulAt:next.checkedAt,checkedAt:next.checkedAt,failed:false,changes:next.changes.length?next.changes:productStatus.changes||[]};
  typeList.forEach(type=>{$(`#archive-tabs [data-type="${type}"] span`).textContent=data[type].length;});$('#hero-count').textContent=data.heroes.length;lastPollAt=Date.now();
  await newsTask;applyEditorialFlags();updateSaved();renderCards();renderKeywords();renderHome();renderNews();if(manual)toast('官方资料核验完成，打法复核状态已保留');
 }catch(error){productStatus.failed=true;renderNews();if(manual)toast('暂未连上官方资料源，已保留上次成功内容');}
 finally{contentBusy=false;renderFreshness();}
}
function startProduct(){if(productStarted)return;productStarted=true;loadProductContent();}
addEventListener('yijing:ready',startProduct);if(window.yijingReady)startProduct();
setInterval(()=>refreshOfficialContent(false),15*60*1000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshOfficialContent(false);});

// A four-page editorial template; exported images contain text and diagram facts,
// attribution and dates, rather than copying an author's long-form article.
function openStudio(id){
 studioLineup=lineups.find(x=>x.id===id);if(!studioLineup)return;studioPage=0;studioFormat='portrait';if(detail.open)detail.close();if(searchDialog.open)searchDialog.close();
 $('#studio-content').innerHTML=`<div class="studio-layout"><div class="studio-controls"><span class="micro-label">CREATOR CARDS / 原创内容模板</span><h2>一套阵容，<br>讲成四页好内容。</h2><p>${esc(studioLineup.name)}<br>适合图文发布或竖屏录屏。保留条件、出处和核验日期。</p><div class="studio-formats" role="group" aria-label="内容卡片比例"><button data-studio-format="portrait" class="active">3:4 图文卡</button><button data-studio-format="video">9:16 竖屏</button></div><div class="studio-pages" role="group" aria-label="内容卡片页码"><button data-studio-page="0">01 要点</button><button data-studio-page="1">02 站位</button><button data-studio-page="2">03 配装</button><button data-studio-page="3">04 条件</button></div><a id="poster-download" class="button primary cta-primary" role="button" data-export-poster>${icon('down')} 导出当前页 PNG</a><button class="button outline" data-copy-script>${icon('copy')} 复制讲解提纲</button><p class="studio-note">模板不会自动发布到社交平台。商用前核对游戏素材与原作者内容授权；平台发布入口和收益资格以账号后台为准。</p></div><figure class="studio-preview"><canvas id="creator-canvas" width="1080" height="1440" aria-label="攻略卡片预览"></canvas><figcaption id="studio-caption"></figcaption></figure></div>`;
 paintIcons($('#studio-content'));$('#studio-dialog').showModal();renderStudioPreview();
}
function rounded(ctx,x,y,w,h,r,fill){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();ctx.fillStyle=fill;ctx.fill();}
function wrapText(ctx,text,x,y,width,size,lineHeight,maxLines=20,color='#d9e5d5',weight=400){ctx.font=`${weight} ${size}px "PingFang SC","Microsoft YaHei",sans-serif`;ctx.fillStyle=color;let line='',lines=0;for(const char of String(text)){if(char==='\n'||ctx.measureText(line+char).width>width){ctx.fillText(line,x,y+lines*lineHeight);lines++;line=char==='\n'?'':char;if(lines>=maxLines)return y+lines*lineHeight;}else line+=char;}if(line&&lines<maxLines){ctx.fillText(line,x,y+lines*lineHeight);lines++;}return y+lines*lineHeight;}
function renderStudioPreview(){
 const l=studioLineup,canvas=$('#creator-canvas');if(!l||!canvas)return;const renderToken=++studioRenderToken,download=$('#poster-download');download?.removeAttribute('href');download?.setAttribute('aria-disabled','true');const height=studioFormat==='video'?1920:1440;canvas.width=1080;canvas.height=height;const ctx=canvas.getContext('2d');
 ctx.fillStyle='#173f35';ctx.fillRect(0,0,1080,height);ctx.strokeStyle='#a8c47a18';ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(1020,90,180+i*75,0,Math.PI*2);ctx.stroke();}
 const titles=['这套阵容，先看核心。','站位不是摆满，是联动。','装备给对，收益才到位。','先看适用条件，再谈强弱。'];
 rounded(ctx,67,69,91,91,23,'#d9ef9b');wrapText(ctx,'弈',88,133,55,53,65,1,'#244b35',600);wrapText(ctx,'弈境 · 王者万象棋攻略',184,109,740,24,34,1,'#c0d1b5',500);wrapText(ctx,`${productNews.latestVersion||'资料研习'} · ${l.needsReview?'构筑待复核':'原作者构筑参考'} / ${String(studioPage+1).padStart(2,'0')}—04`,184,147,740,20,28,1,'#7f9c7c');
 let y=wrapText(ctx,titles[studioPage],67,254,920,61,84,2,'#eff4df',600)+45;
 wrapText(ctx,l.name,70,y,900,34,48,2,'#d9ef9b',500);y+=101;
 if(studioPage===0){
  rounded(ctx,67,y,946,173,24,'#ffffff0b');wrapText(ctx,'阵容主C',94,y+45,200,22,30,1,'#95b08b');wrapText(ctx,l.core,94,y+119,850,58,70,1,'#e0efb9',550);y+=220;
  y=wrapText(ctx,'棋手：'+l.players.join(' / '),70,y,920,31,47,3)+40;
  y=wrapText(ctx,'成形英雄',70,y,920,23,35,1,'#95b08b')+24;
  y=wrapText(ctx,l.heroes.join(' · '),70,y,920,38,61,5,'#e3ebd8',500)+40;
  wrapText(ctx,'先搭建 '+(l.system||l.faction)+' 的机制链，再按来牌与对手调整。',70,y,920,28,46,4,'#a5bb98');
 }else if(studioPage===1){
  wrapText(ctx,'↑ 对手方向 / 己方 4×7 站位',70,y,920,24,35,1,'#9bb78f');y+=45;const cell=126,gap=9,x0=67,positions=l.phases.at(-1)?.positions||l.positions;for(let row=0;row<4;row++)for(let col=0;col<7;col++){const index=row*7+col,j=positions?.indexOf(index)??-1,name=j>=0?l.phases.at(-1)?.heroes[j]||l.heroes[j]:'';rounded(ctx,x0+col*(cell+gap),y+row*(cell+gap),cell,cell,14,name?'#cfdfa6':'#ffffff0b');if(name)wrapText(ctx,name,x0+col*(cell+gap)+9,y+row*(cell+gap)+64,cell-18,name.length>3?22:27,35,2,'#2d5138',550);}
  y+=4*(cell+gap)+42;wrapText(ctx,'这是原作者成形站位示意。对方有切入或范围伤害时，观察后再调整。',70,y,920,27,45,4,'#a5bb98');
 }else if(studioPage===2){
  for(const[name,tip]of(l.equipment||[]).slice(0,4)){rounded(ctx,67,y,946,140,22,'#ffffff0b');wrapText(ctx,name,95,y+43,850,27,37,1,'#d9ef9b',500);wrapText(ctx,short(tip,52),95,y+91,850,25,40,2,'#c5d6b9');y+=160;}
  if(!l.equipment.length)y=wrapText(ctx,'原作者未填写配装。先在游戏内结合主C机制和对手选择装备。',70,y,920,34,58,5)+40;
  if(y<height-360)wrapText(ctx,'优先解决输出、生存和控制的实际缺口，不把固定三件套套用到所有对局。',70,y+15,920,27,45,4,'#a5bb98');
 }else{
  const lines=[['版本口径',l.needsReview?'关联卡牌或棋手近期有调整，当前打法尚待复核。':'来自官方攻略中心的社区构筑，不是官方强度排名。'],['适用条件','核心等级、觉醒、装备与站位都会改变对局结果。'],['数据边界','玩家评分、累计使用量都不代表胜率。'],['继续研习','先看当前可用阵营，再结合来牌选择；对手变化时及时变阵。']];
  for(const[label,text]of lines){wrapText(ctx,label,70,y,920,25,37,1,'#d9ef9b',550);y=wrapText(ctx,text,70,y+59,920,32,55,3,'#d2dfc7')+52;}
 }
 ctx.fillStyle='#173f35';ctx.fillRect(0,height-193,1080,193);ctx.fillStyle='#668561';ctx.fillRect(67,height-187,946,1);wrapText(ctx,`原作者：${l.author} · 来源：官方攻略中心`,70,height-137,920,21,34,2,'#91ab86');wrapText(ctx,`资料核验 ${snapshotLabel()} · 分析需结合当前局内环境`,70,height-91,920,20,32,1,'#91ab86');wrapText(ctx,'玩家原创工具 / 非官方站点',70,height-48,920,18,28,1,'#6f8c69');
 canvas.toBlob(blob=>{if(!blob||renderToken!==studioRenderToken)return;const previous=studioDownloadUrl;studioDownloadUrl=URL.createObjectURL(blob);const a=$('#poster-download');if(a){a.href=studioDownloadUrl;a.download=`弈境-${l.name}-${studioPage+1}.png`;a.setAttribute('aria-disabled','false');}if(previous)setTimeout(()=>URL.revokeObjectURL(previous),30000);},'image/png');
 $$('[data-studio-page]').forEach(b=>b.classList.toggle('active',Number(b.dataset.studioPage)===studioPage));$$('[data-studio-format]').forEach(b=>b.classList.toggle('active',b.dataset.studioFormat===studioFormat));$('#studio-caption').textContent=`${studioFormat==='video'?'1080 × 1920 · 9:16':'1080 × 1440 · 3:4'} / 第 ${studioPage+1} 页，共 4 页`;
}
function exportPoster(){if(!studioLineup||!$('#poster-download')?.href){toast('图片正在生成，请稍后点击');return;}metric('poster_export',{lineup:studioLineup.id,page:studioPage+1,format:studioFormat});toast('已打开图片下载，请在浏览器下载中查看');}
async function copyCreatorScript(){
 if(!studioLineup)return;const l=studioLineup;const text=[`【标题】${l.name}，先看懂核心再上场`,`【开场】这套构筑适配${l.players.join('、')}，核心是${l.core}。`,`【阵容】${l.heroes.join('、')}`,`【过程】按过渡、成形、对手调整分段讲解；配合本站可移动站位演示。`,`【条件】${l.needsReview?'本期关联改动尚待复核。':''}评分和使用量不是胜率，具体强度取决于等级、装备与对手。`,`【出处】原作者${l.author}；官方攻略中心；资料核验${snapshotLabel()}。`].join('\n');
 try{await navigator.clipboard.writeText(text);toast('原创讲解提纲已复制，录制时补充你的实战判断');}catch{toast('当前环境无法复制，可先导出卡片使用');}
}

