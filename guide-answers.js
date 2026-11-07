'use strict';

let guideKnowledge={articles:[],counters:[]},guideReady=false,inlineGuideAnswer=null;
const guideHeroAliases={'李信':['光信','李现'],'艾琳':['爱琳'],'太乙真人':['太乙','电饭煲'],'东皇太一':['东皇'],'百里守约':['守约'],'裴擒虎':['老虎'],'孙悟空':['猴子'],'鲁班七号':['小鲁班'],'公孙离':['阿离'],'孙尚香':['香香'],'马可波罗':['马可'],'杨玉环':['玉环']};
const guideExamples=['打999李信谁比较克制？','李信带机器头怎么打？','白歌适合什么阵容？','整备和开团有什么区别？'];
const guideQuestionPattern=/[？?]|怎么|如何|怎样|什么|谁|哪个|克制|反制|对付|打不过|打得过|能打过|能不能|能否|能秒|能赢|怕谁|出装|装备推荐|怎么玩|区别|为什么|怎么办|养到|升到|适合/;
function guideIsQuestion(q){return guideQuestionPattern.test(String(q||''))||(guideReady&&String(q).includes('打')&&guideEntities(String(q)).heroes.length>1);}
function guideCard(name){for(const type of typeList){const item=data[type].find(c=>c.name===name);if(item)return {type,item};}return null;}
function guideCardById(id){for(const type of typeList){const item=data[type].find(c=>String(c.id)===String(id));if(item)return {type,item};}return null;}
function guideResult(question,content){return {question,title:'攻略问答',label:'资料库整理',lead:'',steps:[],warnings:[],cards:[],lineupIds:[],sources:[],followups:[],...content};}
function guideSources(types=['heroes']){return types.filter(t=>data.meta.sourceUrls?.[t]).map(t=>({title:'官方'+(typeNames[t]||'棋手')+'卡牌库',url:data.meta.sourceUrls[t],kind:'官方卡牌'}));}
function guideFindLineups(names,limit=4){return [...new Map(names.flatMap(name=>lineups.filter(l=>l.name.includes(name)||l.core===name)).map(l=>[l.id,l])).values()].slice(0,limit).map(l=>l.id);}
function guideEntities(question){
 const q=question.normalize('NFKC').replace(/\s/g,'');
 const heroes=data.heroes.map(h=>{const aliases=[h.name,...guideHeroAliases[h.name]||[]],found=aliases.map(alias=>({alias,index:q.indexOf(alias)})).filter(x=>x.index>=0).sort((a,b)=>a.index-b.index||b.alias.length-a.alias.length)[0];return found?{name:h.name,...found}:null;}).filter(Boolean).sort((a,b)=>a.index-b.index||b.alias.length-a.alias.length);
 const players=lords.filter(l=>[l.name,...(lordAliases[l.name]||'').split(' ')].filter(Boolean).some(alias=>q.includes(alias)));
 const equipment=data.equipment.filter(c=>q.includes(c.name));
 return {q,heroes,players,equipment};
}
function guideCounterContext(entities){
 const {q,heroes}=entities;if(!heroes.length)return {target:null,ally:null};
 const outgoing=heroes.find(h=>q.includes(h.alias+'克制谁')||q.includes(h.alias+'克制哪些')||q.includes(h.alias+'能克谁'));
 if(outgoing)return {target:outgoing.name,ally:null,outgoing:true};
 let target;
 const passive=q.indexOf('被');if(passive>=0&&q.includes('克制')&&heroes.length>1)target=heroes.find(h=>h.index<passive);
 if(!target&&q.includes('对面'))target=heroes.find(h=>h.index>q.indexOf('对面'));
 if(!target){const verbs=[...q.matchAll(/克制|反制|怎么打|如何打|对付|针对|打不过|打得过|能打过|打过|秒杀|秒|打赢|赢|打/g)];for(const verb of verbs){target=heroes.find(h=>h.index>=verb.index+verb[0].length);if(target)break;}}
 target=target||heroes[0];
 const ally=heroes.find(h=>h.name!==target.name);
 return {target:target.name,ally:ally?.name||null,outgoing:false,machine:q.includes('机器头')||q.includes('机械头'),blazing:q.includes('炽热')||q.includes('炙热')};
}
function guideLixinAnswer(question,context){
 const machine=context.machine,ally=context.ally;
 const order=ally==='韩信'?['hanxin-yao-control','ailin-kiting','haiyue-sacrifice','banshu-barrier','donghuang-suppression']:ally==='海月'?['haiyue-sacrifice','ailin-kiting','donghuang-suppression','banshu-barrier','hanxin-yao-control']:machine?['ailin-kiting','haiyue-sacrifice','banshu-barrier','donghuang-suppression','hanxin-yao-control']:['ailin-kiting','haiyue-sacrifice','donghuang-suppression','hanxin-yao-control','banshu-barrier'];
 const cases=order.map(id=>guideKnowledge.counters.find(c=>c.id===id)).filter(Boolean);
 const lead=machine?'李信带机器头时，减速、变猪和普通控制不再作为稳定解。优先保留艾琳的位移与射程优势、补足输出和生存，或使用已经成型的高生命海月。':ally==='韩信'?'你已经在用韩信，可以先检查瑶是否到40级、控制链和生存是否够用。对面有免控装备时，单靠击飞不能照搬“控到死”的打法。':ally==='海月'?'海月能否处理999李信，关键在于自身生命值与等级、是否点中敌方最高等级，以及能否继续处理李信的完美复生。真实伤害也不等于低等级单挂必定秒杀。':'优先考虑成型的100级艾琳＋寒霜侵袭，用飞行与射程拉扯；已有大河体系时可考虑东皇压制。高生命海月也能针对最高等级单核，但低等级单挂不保证处理999李信。';
 return guideResult(question,{title:machine?'999李信带机器头，怎么应对？':'打999李信，优先考虑谁？',label:'官方机制＋社区构筑经验',lead,steps:cases.map(c=>({title:c.label,body:machine&&c.id==='ailin-kiting'?'保留100级艾琳的飞行、射程和足够输出；对方机器头会影响负面效果，这里不再依赖寒霜减速。':machine&&c.id==='hanxin-yao-control'?'对方带机器头时，普通眩晕和击飞不能继续作为稳定反制；不要为此临时转低等级韩信。':machine&&c.id==='donghuang-suppression'?'东皇本身有压制技能，但现有官方文本未明确机器头与压制的优先级。这不是当前条件下的确定解。':c.conclusion,condition:machine&&c.id==='ailin-kiting'?'艾琳仍需达到100级、具备输出和生存；注意对方反伤与锁头手段。':c.requirements.slice(0,2).join('；'),tag:machine&&c.id==='donghuang-suppression'?'交互尚待核验':c.id==='donghuang-suppression'?'机制推导':'有条件的构筑思路'})),warnings:machine?['机器头卡面只写“免疫负面效果”，现有资料未明确它与压制的优先级；不能套用炽热的“压制除外”。','海月伤害按自身生命值计算；李信100级后还有狂暴形态完美复生，处理第一条命并不代表结束。']:['先看对面装备：炽热首次受控后有15秒免控，明确不含压制；机器头会影响减速、变猪和普通控制方案。','100级是艾琳机制解锁点，并不保证100级艾琳能赢任何999李信。海月也要有足够生命、等级，并选中正确的最高等级目标。'],cards:machine?['艾琳','机器头','海月','寒霜侵袭']:['艾琳','寒霜侵袭','海月','东皇太一','炽热支配者'],lineupIds:guideFindLineups(ally==='韩信'?['姜导韩信十三枪','999韩信太容易','常小娥艾琳遛狗']:['常小娥艾琳遛狗','阿离干将遗志海月','班叔玉环奶墙流','大河龙蛇']),sources:[...guideSources(['heroes','equipment']),...guideKnowledge.articles.slice(0,2).map(a=>({title:a.title,url:a.url,kind:'社区作者 · '+a.author}))],followups:['李信带机器头怎么打？','我已经玩韩信，怎么打999李信？','艾琳怎么出装？','海月技能是什么？']});
}
function guideOtherCounter(question,target,ally){
 const definitions={
  '艾琳':{lead:'先考虑能接近或点名后排的手段，避免用站桩近战一直追100级后的飞行艾琳。具体是否成立，要看站位、免控与双方成长。',steps:[['钟馗：确认她是最远目标','钟馗钩最远敌人；只有艾琳实际位于最远位置时，才有机会把她拉到集火位置。','需留意她的炽热、机器头等免控来源。'],['韩信：检查闪现镜像落点','闪现按敌方战场镜像位置切入，可围绕艾琳位置调整韩信站位。','需要韩信有足够成长与生存，不保证落地就能击败目标。'],['海月：只针对最高等级目标','海月牺牲选择敌方等级最高的英雄，适合作为单核点名思路。','艾琳须是结算时最高等级，且海月生命值足够。']],cards:['艾琳','钟馗','韩信','海月'],related:['香香大河开团韩信','昭君图腾龙蛇海月']},
  '嬴政':{lead:'先限制嬴政的安全启动和持续施法。可以围绕其站位考虑切入或点名，但不要在对方免控生效时继续依赖普通控制。',steps:[['看最近目标与飞剑路径','嬴政的技能锁定最近敌人，并在当前路径没有敌人时转向；前排位置会影响他先打谁。','这是技能文本推导，不是实战胜率结论。'],['尝试切入或钩走后排','韩信闪现镜像切入；钟馗可钩最远目标。先确认对位条件，避免打到其他前排。','对方炽热、机器头和保护单位会改变效果。'],['保住自己的输出窗口','太乙真人为最近英雄提供复生，可作为核心的生存组件。','复生只能增加容错，不能直接替代输出与成长。']],cards:['嬴政','韩信','钟馗','太乙真人','炽热支配者'],related:['香香大河开团韩信','姜导韩信十三枪']},
  '花木兰':{lead:'花木兰的复生链需要持续处理。先检查复活次数、免控与自己的续航，别把一次爆发击败当作已经解决。',steps:[['准备持续输出','木兰通过古币获得复生，官方词条给出每名英雄单回合最多复活10次。','具体可复活次数取决于这局实际获取的效果。'],['保住核心，避免一次被收割','太乙真人可向最近英雄提供复生；分散站位可减少同时受到重剑范围攻击的风险。','木兰轻剑与重剑的威胁不同，需观察形态和站位。'],['先检查免控，再补控制','木兰重剑蓄力期间自身免控，装备也可能提供额外免控。','不能把眩晕、变猪当作全程有效。']],cards:['花木兰','太乙真人','机器头','炽热支配者'],related:['常小娥艾琳遛狗','雷霆战机嬴政']},
  '海月':{lead:'先检查她的牺牲会点名谁，以及是否已经堆出高生命。不要只看“真实伤害”就默认己方核心一定会被秒。',steps:[['确认最高等级目标','海月牺牲选择敌方最高等级英雄，可检查自己的等级分配和复生保护。','这里不保证同等级并列时的具体选择。'],['为核心安排生存组件','太乙真人给最近英雄复生，站位要确保作用到真正需要保护的核心。','还要处理海月的其他伤害与队友，不能只准备一条命。'],['读取当前版本技能','海月100级幻境持续伤害在当前卡面是法术伤害；牺牲效果才按生命值造成真实伤害。','不要混用旧攻略中的全屏真伤描述。']],cards:['海月','太乙真人'],related:['复活花木兰','常小娥艾琳遛狗']}
 };
 const entry=definitions[target];if(!entry)return guideResult(question,{title:target+'的克制专题还未收录',label:'资料覆盖提示',lead:'目前还没有核验到这名英雄的完整克制结论。可以先查看官方技能、出装与相关构筑，再补充你方主C和对手装备。',cards:[target],lineupIds:guideFindLineups([target],3),followups:[target+'技能是什么？',target+'怎么出装？','打999李信谁比较克制？']});
 return guideResult(question,{title:(ally?ally+'打':'怎么针对')+target+'？',label:'根据官方技能推导',lead:(ally?'你在用'+ally+'对抗'+target+'。':'')+entry.lead,steps:entry.steps.map(([title,body,condition])=>({title,body,condition,tag:'机制推导'})),warnings:['这些是机制上的针对方向，效果还取决于等级、装备和施法目标，不是必胜组合。'],cards:entry.cards,lineupIds:guideFindLineups(entry.related),sources:guideSources(['heroes','equipment']),followups:[target+'技能是什么？',target+'怎么出装？','炽热和机器头有什么区别？']});
}
function guideEquipmentAnswer(question,name){
 const card=guideCard(name);if(!card)return null;
 if(card.type==='equipment')return guideResult(question,{title:name+'有什么作用？',label:'官方装备卡牌',lead:clean(card.item.desc),cards:[name],sources:guideSources(['equipment']),followups:['炽热和机器头有什么区别？','打999李信谁比较克制？']});
 const examples=lineups.filter(l=>l.sourceKind==='official-community'&&l.equipment.some(e=>e[0]===name)).sort((a,b)=>Number(b.core===name)-Number(a.core===name)||a.sourceOrder-b.sourceOrder).slice(0,3);
 return guideResult(question,{title:name+'怎么出装？',label:'已收录原作者配装',lead:examples.length?'先参考完整构筑里的配装，结合对手调整。下面是不同作者的方案，不要把几套装备直接叠成同一套“必出神装”。':'目前收录的构筑没有提供这名英雄的具体配装。可先从官方技能与已有阵容详情查看。',steps:examples.map(l=>({title:l.name,body:l.equipment.find(e=>e[0]===name)[1],condition:'原作者：'+l.author+'；棋手：'+l.players.join(' / '),tag:'原作者方案'})),cards:[name,...new Set(examples.flatMap(l=>l.equipment.filter(e=>e[0]===name).flatMap(e=>e[1].split('、'))))].slice(0,8),lineupIds:examples.map(l=>l.id),sources:examples.map(l=>({title:l.name+' · '+l.author,url:l.source,kind:'营地原文'})),followups:[name+'技能是什么？','打999李信谁比较克制？']});
}
function guideLordAnswer(question,lord){
 const recommended=lineups.filter(l=>(l.preferredFor||[]).includes(lord.name)).sort((a,b)=>a.sourceOrder-b.sourceOrder).slice(0,3);
 return guideResult(question,{title:lord.name+'适合什么阵容？',label:'官方棋手技能＋作者适配',lead:'先围绕'+lord.skills[0].cards.map(c=>c.name).join('、')+'建立打法。以下3套沿用官网棋手页的推荐顺序，部分构筑也适配其他棋手。',steps:lord.skills.map(s=>({title:s.type+(s.level>=6?' · '+s.level+'级':'')+'：'+s.cards.map(c=>c.name).join('、'),body:s.cards.map(c=>clean(c.desc)).join('\n'),tag:'官方棋手文本'})),lineupIds:recommended.map(l=>l.id),sources:[{title:lord.name+'官方棋手档案',url:lord.source,kind:'官方棋手'},...recommended.slice(0,2).map(l=>({title:l.name+' · '+l.author,url:l.source,kind:'营地原文'}))],followups:['打999李信谁比较克制？',recommended[0]?recommended[0].name+'怎么玩？':'整备和开团有什么区别？']});
}
function guideBuildAnswer(question,target){
 const direct=lineups.filter(l=>question.includes(l.name)).sort((a,b)=>b.name.length-a.name.length)[0];
 const aliases={'日落海':'日落海整备','三分':'三分登场倒转','逐鹿':'逐鹿战术牌','大河':'大河图腾开团','河洛':'河洛古币牺牲','无阵营':'无阵营等级转化'};
 const system=Object.entries(aliases).find(([key])=>question.includes(key))?.[1];
 const candidates=lineups.filter(l=>l.sourceKind==='official-community'&&(target?l.core===target:system?l.system===system:false)).sort((a,b)=>a.sourceOrder-b.sourceOrder);
 const l=direct||candidates[0];if(!l)return null;
 return guideResult(question,{title:l.name+'，从哪里开始？',label:'原作者阶段运营',lead:(/999|养到|升级|升到/.test(question)?'养成速度取决于来牌、资源和对局，不能承诺固定回合到999。':'')+'可以先研习 '+l.author+' 的这套构筑，按阶段建立联动。',steps:l.phases.map(p=>({title:p.label,body:short(p.text,210),condition:'参考英雄：'+p.heroes.join('、'),tag:'作者运营摘要'})),cards:[l.core],lineupIds:[l.id,...candidates.filter(x=>x.id!==l.id).slice(0,2).map(l=>l.id)],sources:[{title:l.name+' · '+l.author,url:l.source,kind:'营地原文'}],followups:[l.core+'怎么出装？',l.core+'技能是什么？','整备和开团有什么区别？']});
}
function guideMechanicAnswer(question){
 if(/机器头|机械头/.test(question)&&/自然法杖|变猪|减速|眩晕|寒霜/.test(question))return guideResult(question,{title:'机器头会影响普通控制和减速方案',label:'官方装备机制推导',lead:'机器头的卡面写明免疫负面效果。面对它时，不应把自然法杖变猪、寒霜减速或普通眩晕当作稳定反制，需改看伤害、生存和不依赖这些负面效果的打法。',cards:['机器头','自然法杖','寒霜侵袭'],sources:guideSources(['equipment']),followups:['机器头能免疫压制吗？','李信带机器头怎么打？']});
 if(/机器头|机械头/.test(question)&&/压制/.test(question))return guideResult(question,{title:'机器头和压制，现有资料能确认什么？',label:'明确文案边界',lead:'机器头只写“免疫负面效果”，这份官方卡牌资料未明确它与压制的优先级。炽热支配者才明确写了“压制除外”，不能把两件装备的规则直接混用。',cards:['机器头','炽热支配者','东皇太一'],sources:guideSources(['heroes','equipment']),followups:['炽热和机器头有什么区别？','李信带机器头怎么打？']});
 if(/(?:机器头|机械头)/.test(question)&&/炽热|炙热/.test(question))return guideResult(question,{title:'炽热和机器头有什么区别？',label:'官方装备文本对比',lead:'炽热是首次受控后的一段时间免控，并明确排除压制；机器头提供免疫负面效果，同时把攻击速度固定为0.4。选装要看英雄需要什么。',steps:['炽热支配者','机器头'].map(name=>({title:name,body:clean(guideCard(name).item.desc),tag:'官方卡牌'})),cards:['炽热支配者','机器头'],sources:guideSources(['equipment']),followups:['机器头能免疫压制吗？','李信带机器头怎么打？']});
 const map=new Map();data.heroes.forEach(h=>(h.heroCard?.keywordDescription||[]).forEach(k=>map.set(k.name,clean(k.desc))));
 const matches=[...map].filter(([name])=>question.includes(name)).sort((a,b)=>b[0].length-a[0].length).slice(0,3);if(!matches.length)return null;
 const cards=data.heroes.filter(h=>h.heroCard?.keywordDescription?.some(k=>matches.some(([name])=>k.name===name))).slice(0,5).map(h=>h.name);
 if(/临时等级/.test(question)&&/转|永久/.test(question))cards.unshift('明世隐');
 return guideResult(question,{title:matches.map(([name])=>name).join('与')+(matches.length>1?'，区别在哪里？':'是什么意思？'),label:'官方关键词释义',lead:matches.length>1?'先区分触发时机与效果类型，再看英雄具体写了什么。':matches[0][1],steps:matches.map(([title,body])=>({title,body,tag:'官方释义'})),cards:[...new Set(cards)].slice(0,6),sources:guideSources(['heroes']),followups:['整备和开团有什么区别？','韩信怎么养到999？']});
}
function guideSkillAnswer(question,name){
 const c=guideCard(name);if(!c)return null;const hc=c.item.heroCard;
 return guideResult(question,{title:name+(hc?'的技能和觉醒':'的卡牌效果'),label:'官方卡牌档案',lead:clean(c.item.desc),steps:hc?[...(hc.skillList||[]).map(s=>({title:s.name,body:clean(s.desc),condition:(s.enhanceSkill?.params||[]).map(u=>u.level+'级：'+clean(u.desc)).join('\n'),tag:'官方战斗技能'})),...(hc.awakeingCard?[{title:'觉醒效果',body:clean(hc.awakeingCard.desc),tag:'官方觉醒卡面'}]:[])]:[],cards:[name],lineupIds:hc?guideFindLineups([name],3):[],sources:guideSources([c.type]),followups:hc?[name+'怎么出装？',name+'怎么玩？']:['打999李信谁比较克制？']});
}
function getGuideAnswer(question){
 const original=String(question||'').trim().slice(0,300);if(!guideReady)return guideResult(original,{title:'资料正在加载',lead:'卡牌与攻略准备好后，就可以开始问策。',pending:true});
 if(!original)return guideResult(original,{title:'想问哪一步？',lead:'输入具体英雄、棋手或机制，例如“打999李信谁比较克制”。',followups:guideExamples,empty:true});
 const entities=guideEntities(original),{q,heroes,players,equipment}=entities;
 if(/实时|今天|最新|胜率|必胜|百分之百|100%/.test(q)&&!/999|李信|出装|技能/.test(q))return guideResult(original,{title:'这类实时结论暂时无法确认',label:'资料覆盖提示',lead:'当前问答依据已收录的官方机制与构筑，未接入实时对局和胜率数据。可以查询具体卡牌机制、原作者构筑和已核验的反制思路。',followups:guideExamples});
 const mechanic=guideMechanicAnswer(q);if(mechanic&&(['官方装备机制推导','明确文案边界','官方装备文本对比'].includes(mechanic.label)||/区别|什么意思|是什么|触发|转|压制/.test(q)))return {...mechanic,question:original};
 const counter=/克制|反制|对付|打不过|打得过|能打过|怎么打|如何打|针对|怕谁|天敌|对面/.test(q)||(heroes.length>1&&/打|秒|赢/.test(q));
 if(counter){const context=guideCounterContext(entities);if(context.outgoing)return guideResult(original,{title:context.target+'的优势对局还未完整收录',label:'资料覆盖提示',lead:'我理解你想问这名英雄“克制谁”。目前没有足够依据给出完整优势对局表，可以先核对其技能和构筑。',cards:[context.target],lineupIds:guideFindLineups([context.target],3),followups:[context.target+'技能是什么？','怎么克制'+context.target+'？']});if(context.target){if(/出装|装备|带什么|带啥/.test(q)&&context.ally)return guideEquipmentAnswer(original,context.ally);return context.target==='李信'?guideLixinAnswer(original,context):guideOtherCounter(original,context.target,context.ally);}return guideResult(original,{title:'你想针对哪位英雄？',lead:'只知道对手999级还不够。补充英雄名和免控装备，才能选对反制思路。',followups:['打999李信谁比较克制？','艾琳怎么克制？','花木兰怎么克制？']});}
 if(/出装|装备|带什么|带啥|配装/.test(q)){if(heroes.length)return guideEquipmentAnswer(original,heroes[0].name);if(equipment.length)return guideEquipmentAnswer(original,equipment[0].name);}
 const sameName=players.find(l=>heroes.some(h=>h.name===l.name||h.alias===l.name));
 if(sameName&&!/棋手|英雄|卡牌|技能|觉醒/.test(q))return guideResult(original,{title:'先确认你问的是哪一种'+sameName.name,lead:'这既是棋手名称，也是英雄卡名称。选一下，就能看到对应攻略。',followups:['棋手'+sameName.name+'怎么玩？','英雄'+sameName.name+'怎么出装？']});
 if(players.length&&(/棋手|适合|选什么|阵容|怎么玩|怎么用/.test(q))&&(!heroes.length||/棋手/.test(q)))return guideLordAnswer(original,players[0]);
 if(heroes.length&&/技能|觉醒|效果|属性/.test(q))return guideSkillAnswer(original,heroes[0].name);
 if(equipment.length)return guideEquipmentAnswer(original,equipment[0].name);
 if(/运营|怎么玩|阵容|养到|升级|升到|999|培养|养成|过渡/.test(q)){const build=guideBuildAnswer(original,heroes[0]?.name);if(build)return build;}
 if(mechanic)return {...mechanic,question:original};
 if(players.length&&!heroes.length)return guideLordAnswer(original,players[0]);
 if(heroes.length)return guideSkillAnswer(original,heroes[0].name);
 const other=typeList.flatMap(type=>data[type].map(item=>({type,item}))).find(({item})=>q.includes(item.name));if(other)return guideSkillAnswer(original,other.item.name);
 return guideResult(original,{title:'这类问题暂未收录',label:'资料覆盖提示',lead:'目前可以回答已核验的热门英雄克制，以及卡牌技能、出装、棋手适配和构筑运营。请带上具体英雄或棋手名，我会按已收录资料给出回答。',followups:guideExamples});
}
function guideAnswerMarkup(answer,host='ask'){
 const refCards=[...new Set(answer.cards||[])].map(guideCard).filter(Boolean),related=(answer.lineupIds||[]).map(id=>lineups.find(l=>l.id===id)).filter(Boolean),sources=answer.sources||[];
 const stepMarkup=(step,i)=>`<article class="answer-step"><span class="answer-step-number">${String(i+1).padStart(2,'0')}</span><div><div class="answer-step-label">${esc(step.tag||'资料整理')}</div><h4>${esc(step.title)}</h4><p>${esc(step.body)}</p>${step.condition?`<small>${esc(step.condition)}</small>`:''}</div></article>`;
 return `<article class="guide-answer-panel" aria-label="攻略回答"><div class="answer-head"><span class="answer-symbol">答</span><div><span>${esc(answer.label)}</span><h3>${esc(answer.title)}</h3></div><small>资料核验 ${esc(snapshotLabel())}</small></div><p class="answer-lead">${esc(answer.lead)}</p>${answer.steps?.length?`<div class="answer-steps">${answer.steps.slice(0,3).map(stepMarkup).join('')}</div>`:''}${answer.steps?.length>3?`<details class="answer-extra"><summary>再看 ${answer.steps.length-3} 种有条件方案</summary>${answer.steps.slice(3).map((s,i)=>stepMarkup(s,i+3)).join('')}</details>`:''}${answer.warnings?.length?`<aside class="answer-conditions"><strong>先确认这些条件</strong>${answer.warnings.map(w=>`<p>${esc(w)}</p>`).join('')}</aside>`:''}${refCards.length?`<div class="answer-card-links"><span>核对卡牌</span>${refCards.map(({type,item:c})=>`<button data-card="${c.id}" data-type="${type}" aria-label="查看${esc(c.name)}卡牌依据">${img(c)}${esc(c.name)} ↗</button>`).join('')}</div>`:''}${related.length?`<div class="answer-related"><h4>接着研习这些构筑</h4>${related.map(l=>`<button data-lineup="${l.id}"><span>${esc(l.name)}</span><small>${esc(l.players.join(' / '))} ↗</small></button>`).join('')}<p>构筑用于理解落地方法，不代表每套都能无条件克制目标。</p></div>`:''}${sources.length?`<details class="answer-sources"><summary>查看 ${sources.length} 项资料依据</summary>${sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener"><span>${esc(s.kind||'资料来源')}</span>${esc(s.title)} ↗</a>`).join('')}<p>克制与站位建议为机制推导或社区作者经验，具体以当前游戏内规则为准。</p></details>`:''}${answer.followups?.length?`<div class="answer-followups"><span>继续问</span>${answer.followups.filter(q=>q!==answer.question).slice(0,4).map(q=>`<button data-guide-question="${esc(q)}" data-guide-host="${host}">${esc(q)}</button>`).join('')}</div>`:''}</article>`;
}
function renderInlineGuidance(){
 const q=$('#lineup-query').value;inlineGuideAnswer=guideReady&&guideIsQuestion(q)?getGuideAnswer(q):null;
 const el=$('#lineup-guide-answer');el.hidden=!inlineGuideAnswer;el.innerHTML=inlineGuideAnswer?guideAnswerMarkup(inlineGuideAnswer,'inline'):'';
}
function renderSearchWithGuidance(){
 const query=$('#global-query').value,terms=queryTerms(query);
 if(!terms.length){$('#global-results').innerHTML='<p>搜索名称，或直接提问。例如“打999李信谁比较克制”。</p><div class="global-question-examples">'+guideExamples.slice(0,3).map(q=>`<button data-guide-question="${esc(q)}" data-guide-host="global">${esc(q)} ↗</button>`).join('')+'</div>';return;}
 if(globalSearchType==='answer'||(globalSearchType==='all'&&guideIsQuestion(query))){$('#global-results').innerHTML=guideAnswerMarkup(getGuideAnswer(query),'global');return;}
 const matches=[];
 if(['all','lord'].includes(globalSearchType))lords.filter(l=>termsMatch(l.name+' '+(lordAliases[l.name]||'')+' '+l.skills.flatMap(s=>s.cards.map(c=>c.name+' '+clean(c.desc))).join(' '),terms)).forEach(item=>matches.push({type:'lord',item}));
 if(['all','lineup'].includes(globalSearchType))lineups.filter(l=>termsMatch(lineupSearchText(l),terms)).forEach(item=>matches.push({type:'lineup',item}));
 typeList.filter(type=>['all',type].includes(globalSearchType)).forEach(type=>data[type].filter(c=>termsMatch(cardSearchText(c),terms)).forEach(item=>matches.push({type,item})));
 $('#global-results').innerHTML=matches.length?`<p class="search-match-count">找到 ${matches.length} 项 · 显示前 ${Math.min(36,matches.length)} 项</p>`+matches.slice(0,36).map(({type,item:c})=>`<button class="search-result" ${type==='lineup'?`data-lineup="${c.id}"`:type==='lord'?`data-lord-pick="${esc(c.name)}"`:`data-card="${c.id}" data-type="${type}"`}>${type==='lord'?`<img src="${esc(c.image)}" alt="">`:img(type==='lineup'?hero(c.core):c)}<span><strong>${esc(c.name)}</strong><small>${esc(type==='lineup'?c.system+' · '+c.players.join(' / '):type==='lord'?'查看技能、秘技与适配阵容':short(c.desc,42))}</small></span><span>${type==='lineup'?'阵容攻略':type==='lord'?'棋手专属':typeNames[type]} ↗</span></button>`).join(''):'<p>没有找到匹配项。试试具体名称，或切换“问答”说出你的问题。</p>';
}
function askGuideQuestion(question,host='ask'){
 if(host==='global'){globalSearchType='answer';$('#global-query').value=question;$$('[data-global-type]').forEach(b=>{b.classList.toggle('active',b.dataset.globalType==='answer');b.setAttribute('aria-pressed',String(b.dataset.globalType==='answer'));});renderExpandedSearch();return;}
 if(host==='inline'){$('#lineup-query').value=question;lineupLimit=12;renderExpandedLineups();return;}
 window.navigateTo?.('ask');$('#guide-question').value=question;$('#guide-answer').innerHTML=guideAnswerMarkup(getGuideAnswer(question),'ask');
}
function initializeGuideFeatures(knowledge){guideKnowledge=knowledge;guideReady=true;$('#guide-submit').disabled=false;}
function wireGuideEvents(){
 $('#guide-submit').disabled=true;
 $('#guide-question-form').addEventListener('submit',e=>{e.preventDefault();askGuideQuestion($('#guide-question').value);});
 $('#guide-question').addEventListener('input',()=>{if(!$('#guide-question').value.trim())$('#guide-answer').innerHTML='';});
 document.addEventListener('click',e=>{const button=e.target.closest('[data-guide-question]');if(button)askGuideQuestion(button.dataset.guideQuestion,button.dataset.guideHost||'ask');});
}
