'use strict';

const ICONS = {
 home:'M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',
 grid:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
 cards:'m8 3 12 2-3 17-12-2Zm-3 1L2 18l3 1M9 8l6 1M8 12l6 1',
 book:'M12 5C9 3 5 3 2 5v15c3-2 7-2 10 0 3-2 7-2 10 0V5c-3-2-7-2-10 0Zm0 0v15',
 bookmark:'M6 3h12v18l-6-4-6 4Z',
 spark:'m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z',
 search:'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
 arrow:'M4 12h16m-6-6 6 6-6 6',
 down:'m6 9 6 6 6-6',
 info:'M12 11v6m0-10v.1M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
 compass:'m16 8-2 6-6 2 2-6Zm6 4a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
 close:'m6 6 12 12M6 18 18 6',
 copy:'M8 8h13v13H8ZM16 5V2H2v14h3'
};
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICONS[name] || ICONS.spark}"/></svg>`;
function paintIcons(root=document){$$('[data-icon]',root).forEach(el => {el.innerHTML=icon(el.dataset.icon);});}
const clean = text => String(text || '').replace(/<br\s*\/?\s*>/gi,'\n').replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').trim();
const esc = text => String(text ?? '').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
const short = (s,n=50) => {const t=clean(s);return t.length>n?t.slice(0,n)+'…':t;};
const typeNames={heroes:'英雄',equipment:'装备',talents:'天赋',effects:'效果牌'};
const typeList=Object.keys(typeNames);
const lineups=[
 {id:'river',name:'大河龙蛇',artTitle:'大河龙蛇',subtitle:'图腾成阵 · 双核共鸣',en:'RIVER & TOTEM',faction:'大河流域',category:['easy','growth'],difficulty:'新手友好',core:'敖隐',art:'#e6eadc',tagline:'让图腾撑起战场，用敖隐接管后半局。',summary:'三图腾提供增益，张良转化等级，敖隐与东皇太一形成攻守双核。',rating:9.1,uses:541.8,status:'营地推荐榜快照',players:['瑶妹','昭君','闹闹'],code:'78304508844282932',source:'https://wxqwiki.com/lineup/78304508844282932',author:'KL小罗',heroes:['敖隐','张良','虞姬','少司缘','鬼谷子','大司命','东皇太一'],phases:[{label:'前期 · 1–3',heroes:['干将莫邪','弈星','牛魔'],text:'用干将莫邪、弈星与牛魔过渡。先保持战力，不必一开始就追齐后期牌。'},{label:'中期 · 4–11',heroes:['虞姬','少司缘','鬼谷子','张良','瑶','大司命'],text:'先搭建图腾与开团联动，虞姬承担过渡输出；瑶补充保护，稳住进入后期。'},{label:'后期 · 12–14',heroes:['敖隐','张良','虞姬','少司缘','鬼谷子','大司命','东皇太一'],text:'找到敖隐和东皇后完成双核。图腾的存活影响持续输出，优先保护图腾与敖隐。'}],mechanism:'鬼谷子、少司缘、大司命围绕图腾展开；张良提供等级收益，敖隐承担后期输出。东皇太一保护图腾并限制敌方核心。',equipment:[['敖隐','自然法杖、射手装备；近战多时考虑寒霜'],['东皇太一','名刀优先，其余选择防御装备'],['大司命','铸梦·逐风']],position:'大司命与东皇在前，敖隐及图腾体系在后。对手切后排时收拢保护核心；范围伤害多时分散站位。',talent:'优先考虑大河体系专属天赋，再补普攻输出。',positions:[27,23,25,22,24,3,5]},
 {id:'lixin',name:'瑶妹牺牲李信',artTitle:'一念神魔',subtitle:'牺牲联动 · 专注单核',en:'SACRIFICE & GROW',faction:'河洛',category:['easy','growth'],difficulty:'思路清晰',core:'李信',art:'#ece6da',tagline:'把队友的每一次牺牲，变成李信的成长。',summary:'围绕李信集中等级，明世隐与太乙真人补充成长和保护。',rating:9.7,uses:452.4,status:'营地推荐榜快照',players:['瑶妹'],code:'100259557027692570',source:'https://wxqwiki.com/lineup/100259557027692570',author:'Rui永不伏笔',heroes:['李信','太乙真人','明世隐','钟馗','程咬金','盾山','铠'],phases:[{label:'前期 · 1–2',heroes:['李元芳','弈星','苏烈','牛魔'],text:'用低阶英雄过渡，让棋手小鹿在前方承伤，为寻找李信体系争取时间。'},{label:'中期 · 3–10',heroes:['李信','明世隐','钟馗','程咬金','盾山','铠'],text:'逐步替换为河洛牺牲体系。明世隐优先服务李信，留意辅助链接与核心的距离。'},{label:'后期 · 11–14',heroes:['李信','太乙真人','明世隐','钟馗','程咬金','盾山','铠'],text:'补上太乙真人保护主C。小鹿的等级分享进入收益期后，把等级集中给李信。'}],mechanism:'河洛英雄的牺牲联动推动李信成长。瑶妹棋手后期的小鹿等级分享能强化单核，配合明世隐、太乙真人延长输出时间。',equipment:[['李信','优先分配主输出装备；根据对手补控制或防护'],['对策卡','对方依赖单核且缺少对应免控时，考虑自然法杖']],position:'让太乙真人与明世隐靠近李信。前期小鹿承伤，后期根据等级分享顺序调整小鹿位置。此处不包含棋手召唤物。',talent:'按李信实际成长与生存缺口选择，先保证核心能持续输出。',positions:[17,24,25,1,3,5,8]},
 {id:'moon',name:'常小娥海陆空',artTitle:'海陆空',subtitle:'等级转化 · 稳步成长',en:'LEVELS INTO POWER',faction:'无阵营',category:['easy','growth'],difficulty:'操作轻松',core:'司空震',art:'#e5e5ed',tagline:'不必满场英雄，四名核心也能撑起棋局。',summary:'小菟持续提供等级，裴擒虎参与等级转化，司空震负责后期输出。',rating:8.8,uses:850.5,status:'历史热门 · 已下榜',players:['常小娥'],code:'10004',source:'https://wxqwiki.com/lineup/10004',author:'抖音丨暗藏玄G',heroes:['司空震','裴擒虎','苏烈','海月'],phases:[{label:'前期 · 1–3',heroes:['苏烈'],text:'资料构筑以前期苏烈过渡。结合常小娥的小菟，先为核心累计成长。'},{label:'中期 · 4–11',heroes:['司空震','裴擒虎','苏烈','海月'],text:'逐步补出四名核心。不要只追人口，先看主C等级与阵容的有效成长。'},{label:'后期 · 12–14',heroes:['裴擒虎','司空震','苏烈','海月'],text:'让裴擒虎参与等级提升，司空震持续输出，海月限制关键对手。'}],mechanism:'常小娥棋手的等级收益是构筑起点；通过裴擒虎与效果牌强化成长，由司空震兑现输出。',equipment:[['司空震','金色圣剑优先'],['苏烈','分配防御装备']],position:'苏烈承担前排压力，司空震留在安全位置。小菟属于棋手召唤物，本示意棋盘未放入。',talent:'经验、能量和等级收益是优先考虑方向。后期留意传承等成长效果牌。',positions:[26,16,3,24]},
 {id:'mulan',name:'复活花木兰',artTitle:'长生木兰',subtitle:'古币复生 · 持续收割',en:'RETURN & CONQUER',faction:'河洛',category:['growth'],difficulty:'稳健发育',core:'花木兰',art:'#eee3e0',tagline:'用古币积蓄力量，让木兰再一次回到战场。',summary:'程咬金与上官婉儿产出古币，配合露娜整备，强化木兰的复生能力。',rating:9.4,uses:602.2,status:'历史热门 · 已下榜',players:['嬴律','庄小鱼','明先生'],code:'10003',source:'https://wxqwiki.com/lineup/10003',author:'抖音梦飞',heroes:['武则天','李白','露娜','上官婉儿','花木兰','程咬金'],phases:[{label:'前期 · 1–3',heroes:['弈星'],text:'使用弈星过渡，保留资源寻找河洛关键牌；根据实际来牌与血量决定节奏。'},{label:'中期 · 4–7',heroes:['上官婉儿','花木兰','李白','武则天','程咬金'],text:'先找到木兰与产古币英雄。程咬金、上官婉儿的觉醒是重要成长节点。'},{label:'后期 · 8–14',heroes:['武则天','李白','露娜','上官婉儿','花木兰','程咬金'],text:'加入露娜反复激活整备，积累古币收益。注意木兰复活存在上限，不能视为真正无限。'}],mechanism:'程咬金与上官婉儿的整备提供古币，露娜的登场可再次激活整备；古币反过来为花木兰提供额外复生。',equipment:[['花木兰','无尽、凝渊、炽热；对局决定是否更换防装'],['神器选择','机器头、魂灭灵冠等，结合实际获得情况']],position:'木兰不必顶在最前，可放在后排避免开场被集火。遇到陷阱或强切入对手时，观察后再调整。',talent:'优先古币相关收益。效果牌留意唤醒露娜或触发整备的选项。',positions:[24,15,17,25,26,3]},
 {id:'thunder',name:'逐鹿雷霆战机',artTitle:'雷霆战机',subtitle:'战术叠法 · 持续施法',en:'TACTICS & THUNDER',faction:'逐鹿',category:['combo'],difficulty:'进阶连锁',core:'嬴政',art:'#e1e8e4',tagline:'把一张张战术牌，变成嬴政的法术风暴。',summary:'芈月与战术牌推动嬴政成长，西施辅助启动，前排聚拢敌人。',rating:9.5,uses:413.4,status:'历史热门 · 已下榜',players:['白歌','孙小宾','小妲己'],code:'10011',source:'https://wxqwiki.com/lineup/10011',author:'树呆熊丶将我意',heroes:['嬴政','鲁班七号','蒙犽','芈月','西施','白起','庄周'],phases:[{label:'开局过渡',heroes:['弈星'],text:'弈星过渡，保存资源。留意逐鹿关键牌与帮助启动的经济收益。'},{label:'体系成形',heroes:['嬴政','蒙犽','西施','白起','庄周','芈月'],text:'建立嬴政、芈月与西施的核心联动，同时补齐承伤前排。'},{label:'后期完善',heroes:['嬴政','鲁班七号','蒙犽','芈月','西施','白起','庄周'],text:'加入鲁班七号补充战术牌来源。持续打出战术牌，把资源集中给嬴政。'}],mechanism:'打出战术牌与芈月卡牌效果配合，提升嬴政的等级和法术能力；西施帮助缩短启动间隔，蒙犽和庄周提供联动收益。',equipment:[['嬴政','炽热保证持续施法，再考虑法术穿透与名刀']],position:'嬴政靠后站位，前排负责承伤聚敌。面对直接切入或大范围控制时，调整核心位置。',talent:'留意逐鹿专属天赋；唤醒、发号施令等效果牌与体系存在配合。',positions:[27,25,23,24,26,3,5]},
 {id:'reverse',name:'白歌三分倒转刺',artTitle:'三分倒转',subtitle:'登场整备 · 连锁循环',en:'THE COMBO ENGINE',faction:'三分之地',category:['combo'],difficulty:'操作进阶',core:'露娜',art:'#e5e3ed',tagline:'让登场与整备接力，把每次出牌变成下一次起点。',summary:'曹操、甄姬与露娜组成触发链，搭配白歌与闪现英雄获取成长收益。',rating:9.5,uses:757.2,status:'历史热门 · 已下榜',players:['白歌'],code:'10005',source:'https://wxqwiki.com/lineup/10005',author:'Rockieeee',heroes:['小乔','甄姬','阿轲','孙悟空','露娜','曹操','周瑜'],phases:[{label:'前期 · 1–7',heroes:['弈星','孙尚香'],text:'用弈星与孙尚香过渡，积累资源，为寻找连锁核心做准备。'},{label:'中期 · 8–11',heroes:['阿轲','甄姬','小乔','孙悟空','曹操'],text:'开始搭建登场与整备链。重点检查觉醒进度与触发条件，避免只照着英雄名单买牌。'},{label:'后期 · 12–14',heroes:['小乔','甄姬','阿轲','孙悟空','露娜','曹操','周瑜'],text:'露娜与曹操、甄姬互相配合，白歌提供出牌支持。前期保血，后期熟悉操作顺序。'}],mechanism:'露娜登场激活整备，曹操和甄姬串联登场收益，配合孙悟空、阿轲等英雄成长。这套构筑更依赖觉醒条件与操作顺序。',equipment:[['孙悟空','聚灵水晶改善启动'],['露娜','魔律之刃'],['周瑜','成形后承接防御装备']],position:'保护甄姬、小乔等联动组件，避免核心在启动前被击败。此图为便于理解的站位草案，可按对局调整。',talent:'保血与搜牌有助于中期过渡，后期留意整备与唤醒效果牌。',positions:[24,26,15,17,16,3,5]}
];
const initialLineups=structuredClone(lineups);
let cardPage=0;
function snapshotLabel(){return String(data.meta.fetchedAt||'尚未核验').replaceAll('-','.');}
let data={heroes:[],equipment:[],talents:[],effects:[],meta:{}}, currentType='heroes', cardLimit=18, lineupFilter='all', favoritesOnly=false;
let saved=new Set();try{saved=new Set(JSON.parse(localStorage.getItem('yijing-favorites')||'[]'));}catch{}
let currentLineup=null,currentPhase=2,board=[],selectedCell=null,toastTimer;
const hero = name => data.heroes.find(h=>h.name===name);
const cardImage = c => c?.thumb || c?.image || c?.localThumb || './assets/favicon.svg';
const portrait = c => c?.image || c?.thumb || c?.localImage || './assets/favicon.svg';
const img = (c,classes='',mode='thumb',attrs='') => `<img class="${classes}" src="${esc(mode==='portrait'?portrait(c):cardImage(c))}" alt="${esc(c?.name||'卡牌')}" loading="lazy" onerror="this.onerror=null;this.src=esc(c?.image||c?.thumb||'./assets/favicon.svg')" ${attrs}>`;
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),2600);}
async function copyPublicLink(){
 if(['127.0.0.1','localhost'].includes(location.hostname)){toast('这是本地预览，公开发布后才能分享访问链接');return;}
 const url=location.href.split('#')[0];
 try{await navigator.clipboard.writeText(url);toast('链接已复制，可粘贴发给微信好友或群聊');}
 catch{const field=document.createElement('textarea');field.value=url;field.style.position='fixed';field.style.opacity='0';document.body.append(field);field.select();const copied=document.execCommand('copy');field.remove();toast(copied?'链接已复制，可粘贴分享到微信':'请复制浏览器地址栏中的链接分享');}
}
function updateSaved(){try{localStorage.setItem('yijing-favorites',JSON.stringify([...saved]));}catch{}$$('#saved-count,[data-saved-count]').forEach(el=>el.textContent=saved.size);$('#favorites-toggle').classList.toggle('active',favoritesOnly);renderLineups();}
function toggleSave(id){saved.has(id)?saved.delete(id):saved.add(id);updateSaved();toast(saved.has(id)?'已收进你的棋谱收藏':'已移出收藏');}
function renderLineups(){renderExpandedLineups();}
function cardSearchText(c){return [c.name,clean(c.desc),c.relationName, ...(c.heroCard?.skillList||[]).map(s=>s.name+' '+clean(s.desc)),...(c.heroCard?.keywordDescription||[]).map(k=>k.name)].join(' ').toLowerCase();}
function matchedCards(){const q=$('#card-query').value.trim().toLowerCase(),faction=$('#faction-select').value,tier=$('#tier-select').value;return data[currentType].filter(c=>(!q||cardSearchText(c).includes(q))&&(faction==='all'||(c.relationName||'无阵营')===faction)&&(tier==='all'||String(c.quality)===tier));}
function renderCards(){
 const list=matchedCards(),size=matchMedia('(max-width:600px)').matches?9:18;cardPage=Math.min(cardPage,Math.max(0,Math.ceil(list.length/size)-1));const shown=list.slice(cardPage*size,(cardPage+1)*size),isHero=currentType==='heroes';
 $('#card-result-count').textContent=`${list.length} 张${typeNames[currentType]} · 已展示 ${shown.length} 张`;
 $('#cards-grid').innerHTML=shown.length?shown.map(c=>`<button class="hero-tile ${isHero?'':'generic-tile'}" data-card="${c.id}" data-type="${currentType}" aria-label="查看${esc(c.name)}详情"><div class="tile-picture">${img(c,'',isHero?'portrait':'thumb')}<span class="tile-tier tier-${c.quality}">${c.quality}${isHero?'阶':''}</span></div><div class="tile-info"><div class="tile-name"><b>${esc(c.name)}</b><span>${esc(isHero?(c.relationName||'无阵营'):(c.equipCard?.atlasSubTypeName||c.talentStageDesc||'效果卡牌'))}</span></div><div class="tile-keyword">${esc(isHero?((c.heroCard?.keywordDescription||[]).slice(0,3).map(k=>k.name).join(' · ')||((c.heroCard?.properties?.attackDistance||1)>1?'远程英雄':'近战英雄')):short(c.desc,42))}</div></div></button>`).join(''):'<div class="empty-state">没有找到这张卡。试试其他名称、关键词，或重置筛选。</div>';
 $('#load-more').hidden=(cardPage+1)*size>=list.length;$('#load-more').innerHTML='下一页 '+icon('arrow');$('#previous-cards').hidden=cardPage===0;$('#card-page-meta').textContent=`${cardPage+1} / ${Math.max(1,Math.ceil(list.length/size))}`;
}
function switchType(type){$$('#tier-select option').forEach((o,i)=>{if(i)o.textContent=i+(type==='heroes'?' 阶':' 品质');});currentType=type;cardLimit=18;cardPage=0;$('#tier-select').value='all';$('#faction-select').value='all';$('#faction-select').disabled=type!=='heroes';$$('#archive-tabs button').forEach(b=>{b.classList.toggle('active',b.dataset.type===type);b.setAttribute('aria-selected',String(b.dataset.type===type));});renderCards();}
const detail=$('#detail-dialog'),searchDialog=$('#search-dialog');
function openDetail(html){$('#detail-content').innerHTML=html;detail.setAttribute('aria-label',$('.detail-title',detail)?.textContent||'攻略详情');if(!detail.open)detail.showModal();detail.scrollTop=0;paintIcons(detail);window.enhanceDetail?.();}
function chips(names){return `<div class="detail-chip-row">${names.map(n=>{const h=hero(n);return h?`<button class="detail-chip" data-card="${h.id}" data-type="heroes">${img(h)}${n}</button>`:`<span class="detail-chip">${esc(n)}</span>`;}).join('')}</div>`;}
function showLineup(id){showExpandedLineup(id);}
function setPhase(i){setExpandedPhase(i);}
function renderBoard(){if(!$('#lineup-board'))return;$('#lineup-board').innerHTML=board.map((name,i)=>`<button class="board-cell ${selectedCell===i?'selected':''}" data-cell="${i}" aria-label="第${Math.floor(i/7)+1}排第${i%7+1}格${name?'，'+name:'，空位'}${selectedCell===i?'，已选中':''}" aria-pressed="${selectedCell===i}">${name?img(hero(name))+`<span>${name}</span>`:''}</button>`).join('');}
function onCell(index){if(selectedCell===null){if(!board[index])return;selectedCell=index;}else if(selectedCell===index){selectedCell=null;}else{[board[index],board[selectedCell]]=[board[selectedCell],board[index]];selectedCell=null;}renderBoard();}
async function copyLineup(){await copyExpandedLineup();}
function showCard(type,id){
 const c=data[type]?.find(c=>String(c.id)===String(id));if(!c)return;
 const isHero=type==='heroes',hc=c.heroCard||{},props=hc.properties||{},skills=hc.skillList||[],awake=hc.awakeingCard;
 const statNames=[['HP','生命'],['phyAttack','物理攻击'],['magAttack','法术攻击'],['phyDefense','物理防御'],['magDefense','法术防御'],['attackDistance','攻击距离']];
 openDetail(`<div class="detail-inner"><div class="detail-eyebrow">THE CARD ARCHIVE / ${typeNames[type]}</div><h2 class="detail-title">${esc(c.name)}</h2><div class="detail-subtitle" style="margin-bottom:24px"><span>${c.quality} ${isHero?'阶':'品质'}</span><span>${esc(isHero?(c.relationName||'无阵营'):(c.equipCard?.atlasSubTypeName||c.talentStageDesc||typeNames[type]))}</span><span>官方卡牌档案</span></div><div class="card-detail-layout"><div class="card-visual"><img class="full-card-image" src="${esc(c.cardImage||portrait(c))}" alt="${esc(c.name)}官方完整卡面" onerror="this.onerror=null;this.src='${esc(cardImage(c))}'"></div><div><div class="card-skill-box"><h3>${isHero?'卡牌效果':'效果说明'}</h3><p>${esc(clean(c.desc)||'这张卡暂无效果说明。')}</p></div>${awake?`<div class="card-skill-box"><h3>觉醒效果</h3><p>${esc(clean(awake.desc))}</p></div>`:''}${skills.length?`<div class="card-skill-box"><h3>战斗技能</h3>${skills.map(s=>`<div class="skill-name">${esc(s.name)}</div><p>${esc(clean(s.desc))}</p>${(s.enhanceSkill?.params||[]).map(u=>`<div class="upgrade-row"><b>${u.level} 级</b><span>${esc(clean(u.desc))}</span></div>`).join('')}`).join('')}</div>`:''}${isHero?`<div class="card-skill-box"><h3>基础属性</h3><div class="property-grid">${statNames.map(([key,label])=>`<div class="property-item"><span>${label}</span><strong>${esc(props[key]??'—')}</strong></div>`).join('')}</div><p class="board-note">官方基础面板；实际数值随等级、装备和局内效果变化。</p></div>`:''}${hc.keywordDescription?.length?`<div class="card-skill-box"><h3>关键词释义</h3>${hc.keywordDescription.map(k=>`<div class="upgrade-row"><b>${esc(k.name)}</b><span>${esc(clean(k.desc))}</span></div>`).join('')}</div>`:''}${c.previewCards?.length?`<div class="card-skill-box"><h3>关联卡牌</h3>${c.previewCards.map(p=>`<details class="preview-card-note"><summary>${esc(p.name)}</summary><p>${esc(clean(p.desc))}</p></details>`).join('')}</div>`:''}<p class="board-note">数据来源：王者万象棋官方卡牌库 · 核对日期 ${esc(snapshotLabel())}<br>${esc(clean(c.cardGetDesc))}</p></div></div>${isHero?relatedLineups(c.name):''}</div>`);
}
function relatedLineups(name){const list=lineups.filter(l=>l.heroes.includes(name));return list.length?`<div class="detail-block"><h3>在哪些阵容里能遇见 TA</h3><div class="equip-list">${list.map(l=>`<button class="detail-chip" data-lineup="${l.id}">${l.name} ↗</button>`).join('')}</div></div>`:'';}
function showSources(){showExpandedSources();}
function showSearch(){searchDialog.showModal();setTimeout(()=>$('#global-query').focus(),20);}
function renderSearch(){renderExpandedSearch();}
function renderKeywords(){const names=['登场','整备','牺牲','开团','复生','闪现','临时等级','图腾'];const map=new Map();data.heroes.forEach(c=>(c.heroCard?.keywordDescription||[]).forEach(k=>{if(!map.has(k.name))map.set(k.name,clean(k.desc));}));$('#keyword-list').innerHTML=names.filter(n=>map.has(n)).map(n=>`<button data-keyword="${esc(n)}">${n} <span>＋</span></button>`).join('');window.keywordMap=map;}
function showKeyword(name){const desc=window.keywordMap?.get(name);if(!desc)return;const examples=data.heroes.filter(c=>c.heroCard?.keywordDescription?.some(k=>k.name===name)).slice(0,8);openDetail(`<div class="detail-inner"><div class="detail-eyebrow">KEYWORD NOTES</div><h2 class="detail-title">${esc(name)}</h2><p class="detail-intro">${esc(desc)}</p><div class="detail-block"><h3>这些英雄与它有关</h3>${chips(examples.map(h=>h.name))}</div><p class="board-note" style="margin-top:20px">释义与关联来自官方卡牌库。点击英雄可查看具体触发条件。</p></div>`);}
function wireEvents(){
 $$('[data-share-site]').forEach(button=>button.addEventListener('click',copyPublicLink));
 wireLibraryEvents();wireGuideEvents();
 document.addEventListener('click',e=>{
  const save=e.target.closest('[data-save]');if(save){toggleSave(save.dataset.save);if(detail.open){save.innerHTML=icon('bookmark')+(saved.has(save.dataset.save)?'已收藏 · 点击取消':'收藏这套阵容');}return;}
  const l=e.target.closest('[data-lineup]');if(l){if(searchDialog.open)searchDialog.close();showLineup(l.dataset.lineup);return;}
  const c=e.target.closest('[data-card]');if(c){if(searchDialog.open)searchDialog.close();showCard(c.dataset.type,c.dataset.card);return;}
  const p=e.target.closest('[data-phase]');if(p){setPhase(Number(p.dataset.phase));return;}
  const cell=e.target.closest('[data-cell]');if(cell){onCell(Number(cell.dataset.cell));return;}
  const keyword=e.target.closest('[data-keyword]');if(keyword){showKeyword(keyword.dataset.keyword);return;}
  if(e.target.closest('#reset-board'))setPhase(currentPhase);
  if(e.target.closest('#copy-lineup'))copyLineup();
 });
 $('#lineup-filters').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(!b)return;lineupFilter=b.dataset.filter;lineupLimit=12;$$('#lineup-filters button').forEach(b=>b.classList.toggle('active',b.dataset.filter===lineupFilter));renderLineups();});
 $('#lineup-sort').addEventListener('change',()=>{lineupLimit=12;renderLineups();});
 $('#favorites-toggle').addEventListener('click',()=>{favoritesOnly=!favoritesOnly;updateSaved();});
 $('#saved-nav').addEventListener('click',()=>{resetLineupLibrary();favoritesOnly=true;updateSaved();window.navigateTo?.('lineups');$('#lineups').scrollIntoView({behavior:'smooth'});});
 $('#archive-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-type]');if(b)switchType(b.dataset.type);});
 ['card-query','faction-select','tier-select'].forEach(id=>$('#'+id).addEventListener(id==='card-query'?'input':'change',()=>{cardLimit=18;cardPage=0;renderCards();}));
 $('#reset-cards').addEventListener('click',()=>{$('#card-query').value='';$('#faction-select').value='all';$('#tier-select').value='all';cardLimit=18;cardPage=0;renderCards();});
 $('#load-more').addEventListener('click',()=>{cardPage++;renderCards();$('#cards').scrollIntoView({block:'start'});});$('#previous-cards').addEventListener('click',()=>{cardPage=Math.max(0,cardPage-1);renderCards();$('#cards').scrollIntoView({block:'start'});});
 $('#close-detail').addEventListener('click',()=>detail.close());$('#close-search').addEventListener('click',()=>searchDialog.close());
 [detail,searchDialog].forEach(d=>d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}));
 $('#search-trigger').addEventListener('click',showSearch);$('#global-query').addEventListener('input',renderSearch);
 $('#data-sources').addEventListener('click',showSources);$('#open-board').addEventListener('click',()=>showLineup('river'));
 document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(detail.open)detail.close();if(!searchDialog.open)showSearch();}if(e.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)&&!detail.open&&!searchDialog.open){e.preventDefault();window.navigateTo?.('cards');$('#cards').scrollIntoView();$('#card-query').focus({preventScroll:true});}});
}
async function initialize(){
 paintIcons();wireEvents();
 try{
  const json=async url=>{const response=await fetch(url);if(!response.ok)throw new Error('资料请求失败：'+url);return response.json();};
  const [cards,library,knowledge]=await Promise.all([json('./data.json'),json('./library.json'),json('./guide-knowledge.json')]);
  data=cards;initializeExpandedLibrary(library);initializeGuideFeatures(knowledge);
  typeList.forEach(type=>{$(`#archive-tabs [data-type="${type}"] span`).textContent=data[type].length;});
  $('#hero-count').textContent=data.heroes.length;
  updateSaved();renderCards();renderKeywords();window.yijingReady=true;window.dispatchEvent(new Event('yijing:ready'));
 }catch(error){console.error(error);$('#lineup-grid').innerHTML='<div class="error-box">攻略资料暂时未能加载。请检查网络后刷新页面。</div>';$('#cards-grid').innerHTML='<div class="error-box">资料加载失败，请刷新重试。</div>';$('#card-result-count').textContent='资料暂不可用';$('#load-more').hidden=true;}
}
initialize();

