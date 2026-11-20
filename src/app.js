import { ASSETS, ROLES, RIVALS, CUPS, SIGNS, POINTS, clamp } from './data.js';
import { loadStable, saveStable, storageAvailable, lineup, condition, legal, repairCost, currentCup, eventInfo, enterCup, serviceUnit, championshipOrder, finishCup, recordRace } from './stable.js';
import { createRace, raceOrder, stepRace } from './race.js';
import { drawBanner, createScenery, drawRace } from './graphics.js';

const root=document.querySelector('#app');
const stable=loadStable();
const labels=['Dawnward Stable',...RIVALS.map(rival=>rival.name)];
const colors=['#ffd16e',...RIVALS.map(rival=>rival.color)];
const ordinal=n=>n ? `${n}${['th','st','nd','rd'][n]||'th'}` : 'DNF';
let page='overview', race=null, scenery=null, notice='', elapsed=0, frameTime=0, refreshTime=0;

const shield=`<svg viewBox="0 0 56 62" aria-hidden="true"><path d="M28 2 53 11v19c0 13-9 23-25 30C12 53 3 43 3 30V11Z" fill="#292624" stroke="#9b763f" stroke-width="2"/><path d="m28 8 19 7v15c0 10-7 18-19 24C16 48 9 40 9 30V15Z" fill="none" stroke="#5f4b32"/><path d="m32 13-15 21h10l-3 14 16-23H29Z" fill="#efbf6c"/><path d="m13 27-4 4 4 4 4-4Zm30 0-4 4 4 4 4-4Z" fill="#9b763f"/></svg>`;
const coin='<span class="coin" aria-hidden="true">◉</span>';
const cn=value=>value>=70?'good':value>=25?'warn':'danger';
const badge=(value,klass='')=>`<span class="badge ${klass}">${value}</span>`;
const points=(id)=>`<span class="dot" style="--team:${colors[id]}"></span>${labels[id]}`;
const button=(label,action,klass='',disabled=false)=>`<button class="btn ${klass}" data-action="${action}" ${disabled?'disabled':''}>${label}</button>`;
const notification=()=>notice ? `<div class="notice" role="status">${notice}</div>` : '';
const sectionTitle=(label, title)=>`<div class="section-label">${label}</div><h2>${title}</h2>`;

function shell(content) {
  const nav=[['overview','◈','Overview'],['roster','♞','Roster'],['cups','♜','Championships'],['workshop','⚒','Workshop']];
  return `<header class="top"><div class="top-inner">
    <button class="brand" data-action="nav:overview" aria-label="Blood and Thunder home">${shield}<span><strong>BLOOD <em>&amp;</em> THUNDER</strong><small>CHARIOT RACING</small></span></button>
    <nav aria-label="Main navigation">${nav.map(([id,icon,label])=>`<button data-action="nav:${id}" class="${page===id?'selected':''}" ${page===id?'aria-current="page"':''} ${race?'disabled':''}><span aria-hidden="true">${icon}</span>${label}</button>`).join('')}</nav>
    <div class="resources"><div title="Stable treasury">${coin}<b>${stable.gold}</b><small>GOLD</small></div><div title="Stable reputation"><span class="rep-icon">✦</span><b>${stable.rep}</b><small>RENOWN</small></div></div>
  </div></header>
  <main>${content}</main>
  <footer><div><span class="foot-mark">◇</span> BLOOD &amp; THUNDER</div><span>${storageAvailable?'◆ &nbsp; LOCAL SAVE ENABLED':'LOCAL STORAGE UNAVAILABLE · PROGRESS IS TEMPORARY'}</span></footer>`;
}

function assetCard(role, asset) {
  const hp=stable.roster[asset.id];
  return `<article class="asset panel"><div class="asset-head"><span class="asset-icon ${role}">${asset.icon}</span><div><div class="section-label">${ROLES[role]}</div><h3>${asset.name}</h3><p>${asset.title}</p></div></div>
  <div class="condition"><span>Condition</span><b class="${cn(hp)}">${hp}%</b></div><div class="meter"><i class="${cn(hp)}" style="width:${hp}%"></i></div></article>`;
}

function overview() {
  const featured=CUPS[0];
  return `<section class="hero" aria-labelledby="welcome"><canvas id="banner" width="1000" height="302" aria-hidden="true"></canvas><div class="hero-content">
    <div class="hero-tag"><i></i> THE STABLE QUARTER</div><h1 id="welcome">Dawnward Stable</h1>
    <p>Build your team. Read the race. Make every lap count.</p>
    ${button(stable.cup?'Resume championship <span>→</span>':'View championships <span>→</span>','nav:cups','primary')}
  </div><div class="hero-caption">✦ &nbsp; THE AURELIAN DOMINION</div></section>
  ${notification()}
  <div class="dashboard">
    <section class="unit-section"><div class="section-head"><div>${sectionTitle('THE STARTING LINEUP','Your Racing Unit')}</div>${button('Manage roster <span>→</span>','nav:roster','quiet')}</div>
    <div class="asset-grid">${Object.keys(ROLES).map((role,i)=>assetCard(role,lineup(stable)[i])).join('')}</div></section>
    <section><div class="section-head"><div>${sectionTitle('THE SEASON AHEAD',stable.cup?'Active Championship':'Featured Championship')}</div></div>
    <article class="featured panel"><div class="featured-top"><span class="cup-icon">♜</span><div>${badge(stable.cup?'IN PROGRESS':'NOVICE SERIES','gold')}<h3>${(currentCup(stable)||featured).name}</h3></div></div>
    <div class="featured-meta"><span>⚑ &nbsp;${(currentCup(stable)||featured).events.length} events</span><span>${coin} &nbsp;${(currentCup(stable)||featured).purse} gold purse</span></div>
    ${button(stable.cup?'View championship →':'View schedule →',stable.cup?'nav:cups':'inspect:sun','wide')}</article></section>
  </div>
  <section class="stable-strip panel"><div><span>♜</span><b>${stable.wins}</b><small>CHAMPIONSHIPS WON</small></div><div><span>✦</span><b>${stable.cycles}</b><small>SEASONS COMPLETED</small></div><div><span>◈</span><b>${condition(stable)}%</b><small>LINEUP CONDITION</small></div></section>`;
}

function rosterView() {
  return `<div class="page-head">${sectionTitle('DAWNWARD STABLE','Roster')}<p>Assemble a driver, beast team, and chariot for the next start. Each must have at least 25% condition.</p></div>
  ${notification()}
  <section class="panel prep"><div><h3>Race preparation</h3><p>Choose how your driver approaches the next race.</p></div><div class="segmented">${[['balanced','Balanced'],['bold','Aggressive'],['careful','Cautious']].map(([id,name])=>button(name,`plan:${id}`,stable.plan===id?'active':'')).join('')}</div></section>
  ${Object.entries(ASSETS).map(([role,group])=>`<section class="list-section"><h2>${ROLES[role]}</h2><div class="asset-grid">${group.map(asset=>{
    const owned=Object.hasOwn(stable.roster,asset.id);
    const selected=stable.selected[role]===asset.id;
    const occupied=stable.project?.id===asset.id;
    return `<div class="roster-choice panel">
    ${owned?assetCard(role,asset):`<div class="asset"><div class="asset-head"><span class="asset-icon ${role}">${asset.icon}</span><div><div class="section-label">RECRUIT</div><h3>${asset.name}</h3><p>${asset.title}</p></div></div></div>`}
    <div class="traits"><span>Pace <b>${Math.round(asset.speed*100)}</b></span><span>Grip <b>${Math.round(asset.grip*100)}</b></span><span>Grit <b>${Math.round(asset.nerve*100)}</b></span></div>
    ${owned ? button(occupied?'In training':selected?'Selected':stable.roster[asset.id]<25?'In recovery':'Select',`select:${role}:${asset.id}`,selected?'active wide':'wide',occupied||selected||stable.roster[asset.id]<25) :
      button(`Acquire · ${asset.price} gold`,`buy:${asset.id}`,'wide',stable.gold<asset.price)}
    </div>`;
  }).join('')}</div></section>`).join('')}
  ${!stable.cup?`<section class="panel prep"><div><h3>Off-season recovery</h3><p>Give injured assets time to regain condition between championships.</p></div>${button('Rest all assets','rest','',Object.values(stable.roster).every(hp=>hp===100))}</section>`:''}
  <section class="panel prep"><div><h3>Service selected unit</h3><p>Restore up to 28 condition to each selected asset.</p></div>${button(`Service · ${repairCost(stable)} gold`,'service','primary',condition(stable)===100||stable.gold<repairCost(stable))}</section>`;
}

function schedule(cup, active=false) {
  return `<div class="schedule">${cup.events.map((id,i)=>{
    const event=eventInfo(id), result=active?stable.cup.results[i]:null;
    return `<div class="schedule-row ${active&&i===stable.cup.index?'current':''}"><span class="event-no">${String(i+1).padStart(2,'0')}</span>
    <div><b>${event.track.name}</b><small>${event.track.kind} · ${event.laps} ${event.laps===1?(event.track.kind==='Rally'?'stage':'lap'):'laps'} · ${event.weather}</small></div>
    ${result?badge(ordinal(result.place),result.place?'gold':'red'):badge(event.discipline,event.discipline==='Combat'?'red':'')}</div>`;
  }).join('')}</div>`;
}

function standings() {
  return `<div class="standings">${championshipOrder(stable.cup).map((id,index)=>`<div class="${id===0?'player':''}"><span class="position">${index+1}</span><span>${points(id)}</span><b>${stable.cup.scores[id]} pts</b></div>`).join('')}</div>`;
}

function cupsView() {
  const run=stable.cup;
  const cup=currentCup(stable);
  if (run) {
    const last=run.results.at(-1);
    return `<div class="page-head">${sectionTitle('CHAMPIONSHIP',cup.name)}<p>${cup.description}</p></div>${notification()}
    ${run.completed?`<section class="panel prep"><div><h3>${run.completed.place?ordinal(run.completed.place)+' overall':run.completed.reason}</h3><p>${run.completed.payout} gold championship prize. ${run.results.length} of ${cup.events.length} events raced.</p></div>${button('Return to stable →','closecup','primary')}</section>`:
    `<section class="panel prep"><div><h3>Event ${run.index+1} of ${cup.events.length} · ${eventInfo(cup.events[run.index]).track.name}</h3><p>${legal(stable)?`Lineup condition ${condition(stable)}% · ${stable.plan} preparation`:'Choose an eligible lineup in the roster before the next start.'}</p></div><div class="actions">${button('Withdraw…','withdraw','quiet')}${button('Manage unit','nav:roster')}${button('Go to starting grid →','startrace','primary',!legal(stable))}</div></section>`}
    ${last?`<section class="panel report"><div class="section-label">LAST RACE</div><h3>${last.name} · ${ordinal(last.place)}</h3><p>+ ${last.purse} gold · ${last.damage}% damage · ${last.fatigue}% fatigue</p><div class="traits"><span>Driver −${last.wear[0]}</span><span>Beasts −${last.wear[1]}</span><span>Chariot −${last.wear[2]}</span></div></section>`:''}
    <div class="two-col"><section class="panel inner"><h2>Event schedule</h2>${schedule(cup,true)}</section>
    <section class="panel inner"><h2>Standings</h2>${standings()}<p class="muted">Points by finish · ${POINTS.join(' / ')}. A DNF earns zero points. Ties use the most recent finish.</p></section></div>`;
  }
  return `<div class="page-head">${sectionTitle('THE RACING CALENDAR','Championships')}<p>Review each schedule, then commit your stable to a series.</p></div>${notification()}
  <div class="cup-grid">${CUPS.map(entry=>`<article class="panel inner cup-card"><div class="featured-top"><span class="cup-icon">♜</span><div>${badge(entry.label,'gold')}<h3>${entry.name}</h3></div></div><p>${entry.description}</p>
    <div class="featured-meta"><span>⚑ &nbsp;${entry.events.length} events</span><span>${coin} &nbsp;${entry.fee} entry</span><span>${coin} &nbsp;${entry.purse} purse</span></div>
    ${button(stable.rep<entry.rep?`View schedule · ${entry.rep} renown required`:'View schedule →',`inspect:${entry.id}`,'wide')}</article>`).join('')}</div>`;
}

function workshop() {
  const trainee=ASSETS.driver.find(driver=>Object.hasOwn(stable.roster,driver.id)&&driver.id!==stable.selected.driver);
  return `<div class="page-head">${sectionTitle('DAWNWARD STABLE','Workshop')}<p>Spend gold on staff, equipment, and training that carry across championships.</p></div>${notification()}
  <div class="cup-grid">
    ${[['⚒','Recruit a mechanic','Cheaper service and four points of condition preserved per asset after each race.', 'mechanic',90, stable.mechanic],
    ['◇','Buy a racing harness','A permanent pace upgrade for every Dawnward lineup.', 'harness',125,stable.harness],
    ['✦','Driver academy','Train a reserve driver for two eligible championship cycles to permanently improve stable handling. The trainee cannot race while assigned.', 'train',75,Boolean(stable.project)]].map(([icon,title,body,id,price,owned])=>
      `<article class="panel inner cup-card"><span class="cup-icon">${icon}</span><h3>${title}</h3><p>${body}</p>
      ${button(id==='train'&&stable.project?`${ASSETS.driver.find(driver=>driver.id===stable.project.id).name} · ${stable.project.remaining} ${stable.project.remaining===1?'cycle':'cycles'} left`:owned?'Installed':`${price} gold`,`upgrade:${id}`,'wide',owned||stable.gold<price||(id==='train'&&(!trainee||Boolean(stable.cup))))}</article>`).join('')}
  </div><div class="two-col"><section class="panel inner"><h2>Trophy cabinet</h2>${stable.trophies.length?stable.trophies.map(name=>`<p>♜ &nbsp;${name}</p>`).join(''):'<p class="muted">Win a championship to earn its trophy.</p>'}</section>
  <section class="panel inner"><h2>Championship history</h2>${stable.history.length?stable.history.map(item=>`<p>${item.name} · ${item.place?ordinal(item.place):item.reason}</p>`).join(''):'<p class="muted">Your completed runs will appear here.</p>'}</section></div>`;
}

function raceView() {
  return `<div class="page-head race-title"><div>${sectionTitle(`${currentCup(stable).name.toUpperCase()} · EVENT ${stable.cup.index+1} / ${currentCup(stable).events.length}`,race.event.track.name)}</div><div class="actions">${badge(race.event.discipline,race.event.discipline==='Combat'?'red':'gold')}${badge(race.event.weather)}${badge(race.event.track.kind)}</div></div>
  <div class="race-grid"><div>
    <section class="race-camera panel"><canvas id="race-canvas" width="824" height="398" aria-label="Top-down race view following Dawnward Stable"></canvas><div id="race-hud"></div><div id="countdown"></div></section>
    <div class="panel prep race-controls"><div class="actions">${button('Start race','toggle','primary')}${button('Step','step')}</div><div class="segmented" aria-label="Race speed">${[1,2,4].map(n=>button(`${n}×`,`speed:${n}`,n===race.speed?'active':'')).join('')}</div></div>
    <section class="panel inner sign-panel"><div class="section-head"><div>${sectionTitle('RACE ORDERS','Strategy Signs')}</div><span id="sign-count" class="badge gold"></span></div>
    <p class="muted" id="sign-state"></p><div class="sign-grid">${Object.entries(SIGNS).map(([id,sign])=>
      `<button class="sign-btn" data-action="sign:${id}"><span>${sign.icon}</span><b>${sign.name}</b><small>${sign.description}</small></button>`).join('')}</div></section>
  </div><aside class="race-aside">
    <section class="panel inner map-panel"><h3>Tactical map</h3><canvas id="map-canvas" width="290" height="150" aria-label="Full course map"></canvas></section>
    <section class="panel inner"><h3>Live standings</h3><div id="live-standings" class="standings"></div></section>
    <section class="panel inner radio"><h3><span class="live-dot"></span> Race radio</h3><div id="commentary-feed"></div></section>
  </aside></div>`;
}

function render() {
  root.innerHTML=shell(race?raceView():page==='roster'?rosterView():page==='cups'?cupsView():page==='workshop'?workshop():overview());
  if (race) updateRaceUI();
  else if(page==='overview') drawBanner(document.querySelector('#banner'));
}

function dialog(title, body, actions='') {
  const node=document.createElement('dialog');
  node.className='panel inner';
  node.innerHTML=`<div class="section-head"><h2>${title}</h2>${button('Close','dismiss','quiet')}</div>${body}<div class="dialog-actions">${actions}</div>`;
  node.addEventListener('close',()=>node.remove());
  root.append(node);
  node.showModal();
}

function showCup(id) {
  const cup=CUPS.find(entry=>entry.id===id);
  const requirement=stable.rep<cup.rep?`Requires ${cup.rep} renown.`:stable.gold<cup.fee?'Insufficient gold.':!legal(stable)?'Select an eligible racing unit in the roster.':'';
  dialog(cup.name,`<p>${cup.description}</p><div class="featured-meta"><span>${coin} ${cup.fee} gold entry</span><span>${coin} ${cup.purse} gold champion’s purse</span></div>${schedule(cup)}<p class="muted">Lineup condition carries between events. Withdrawals forfeit the series purse.</p>${requirement?`<p class="warn">${requirement}</p>`:''}`,
    button('Enter championship →',`enter:${id}`,'primary',Boolean(requirement)));
}

function updateRaceUI() {
  const player=race.units[0];
  const order=raceOrder(race);
  const lap=clamp(Math.floor(player.distance/race.path.length)+1,1,race.event.laps);
  document.querySelector('#race-hud').innerHTML=`<span><small>POSITION</small><b>P${order.indexOf(player)+1} / ${order.length}</b></span><span><small>${race.event.track.kind==='Rally'?'COURSE':'LAP'}</small><b>${race.event.track.kind==='Rally'?Math.round(clamp(player.distance/race.path.length,0,1)*100)+'%':lap+' / '+race.event.laps}</b></span><span><small>DAMAGE</small><b>${Math.round(player.damage)}%</b></span><span><small>FATIGUE</small><b>${Math.round(player.fatigue)}%</b></span>`;
  document.querySelector('#countdown').textContent=race.finished?'Race complete':race.countdown>0?(race.paused&&race.countdown===3?'Starting grid':Math.ceil(race.countdown)):'';
  const toggle=document.querySelector('[data-action="toggle"]');
  toggle.textContent=race.finished?'View results →':race.countdown===3?'Start race':race.paused?'Resume':'Pause';
  document.querySelector('[data-action="step"]').disabled=!race.paused||race.finished;
  document.querySelector('#sign-count').textContent=`${race.uses} / 3 LEFT`;
  document.querySelector('#sign-state').textContent=race.queued?
    `Queued: ${SIGNS[race.queued].name}. Select again to lower the sign.`+(race.active?` Active: ${SIGNS[race.active].name}.`:''):
    race.active?`Active: ${SIGNS[race.active].name}.`:
    race.countdown>0?'Raise a sign now to activate it at the starting signal.':
    race.event.track.kind==='Rally'?'This stage has no further start/finish crossing.':'Raised signs activate at your next lap crossing.';
  for(const [id] of Object.entries(SIGNS)){
    const node=document.querySelector(`[data-action="sign:${id}"]`);
    node.classList.toggle('active',race.queued===id||race.active===id);
    node.setAttribute('aria-pressed',String(race.queued===id));
    node.disabled=race.uses===0||race.finished||player.done||
      (race.countdown===0&&(!race.path.loop||lap>=race.event.laps));
  }
  for (const speed of [1,2,4]) {
    const control=document.querySelector(`[data-action="speed:${speed}"]`);
    control.classList.toggle('active',speed===race.speed);
    control.setAttribute('aria-pressed',String(speed===race.speed));
  }
  document.querySelector('#live-standings').innerHTML=order.map((unit,index)=>`<div class="${unit.id===0?'player':''}"><span class="position">${index+1}</span><span>${points(unit.id)}</span><b>${unit.dnf?'DNF':unit.done?'FIN':''}</b></div>`).join('');
  document.querySelector('#commentary-feed').innerHTML=race.logs.map(log=>`<div class="${log.type}"><time>${Math.floor(log.time/60)}:${String(Math.floor(log.time)%60).padStart(2,'0')}</time><span>${log.message}</span></div>`).join('');
}

function updateRace(dt) {
  stepRace(race,dt);
  if(race.finished&&!race.saved){
    recordRace(stable,race);
    race.saved=true;
    saveStable(stable);
  }
}

function tick(now) {
  if(race){
    const dt=Math.min(.1,(now-(frameTime||now))/1000);
    if(!race.paused&&!race.finished){
      elapsed+=dt*race.speed;
      while(elapsed>=1/60){updateRace(1/60);elapsed-=1/60;}
    }
    if(now-refreshTime>145){updateRaceUI();refreshTime=now;}
    drawRace(document.querySelector('#race-canvas'),document.querySelector('#map-canvas'),race,scenery);
  }
  frameTime=now;
  requestAnimationFrame(tick);
}

root.addEventListener('click',event=>{
  const control=event.target.closest('[data-action]');
  if(!control||control.disabled) return;
  const [action,id,assetId]=control.dataset.action.split(':');
  if(action==='dismiss'){control.closest('dialog').close();return;}
  if(race){
    if(action==='toggle'&&race.finished){
      race=null;scenery=null;page='cups';
      saveStable(stable);render();window.scrollTo(0,0);
    } else if(action==='toggle') race.paused=!race.paused;
    else if(action==='speed') race.speed=Number(id);
    else if(action==='sign') race.queued=race.queued===id?null:id;
    else if(action==='step') for(let i=0;i<6;i++)updateRace(1/60);
    if(race)updateRaceUI();
    return;
  }
  notice='';
  switch(action){
    case 'nav': page=id;window.scrollTo(0,0);break;
    case 'inspect': showCup(id);return;
    case 'enter': if(enterCup(stable,id)){page='cups';window.scrollTo(0,0);}break;
    case 'select': stable.selected[id]=assetId;break;
    case 'plan': stable.plan=id;break;
    case 'buy': {
      const asset=Object.values(ASSETS).flat().find(item=>item.id===id);
      if(stable.gold>=asset.price&&!Object.hasOwn(stable.roster,id)){
        stable.gold-=asset.price;stable.roster[id]=100;notice=`${asset.name} joins Dawnward Stable.`;
      }
      break;
    }
    case 'rest':
      if(!stable.cup){
        for(const id of Object.keys(stable.roster)) stable.roster[id]=100;
        notice='The roster has recovered during the off-season.';
      }
      break;
    case 'service': if(serviceUnit(stable))notice='The selected unit has been serviced.';break;
    case 'startrace':
      race=createRace(eventInfo(currentCup(stable).events[stable.cup.index]),stable);
      scenery=createScenery(race);elapsed=0;window.scrollTo(0,0);render();return;
    case 'withdraw':
      dialog('Withdraw from the championship?','<p>Your entry fee and current condition carry over. You forfeit the championship purse.</p>',button('Confirm withdrawal','confirmwithdraw','primary'));return;
    case 'confirmwithdraw':finishCup(stable,'Withdrawn');break;
    case 'closecup':stable.cup=null;page='overview';window.scrollTo(0,0);break;
    case 'upgrade': {
      const cost={mechanic:90,harness:125,train:75}[id];
      if(stable.gold<cost)break;
      if(id==='train'){
        const trainee=ASSETS.driver.find(driver=>Object.hasOwn(stable.roster,driver.id)&&driver.id!==stable.selected.driver);
        if(!trainee||stable.project||stable.cup)break;
        stable.project={id:trainee.id,remaining:2};
        notice=`${trainee.name} has begun academy training.`;
      }else{
        if(stable[id])break;
        stable[id]=true;
        notice=id==='mechanic'?'Mechanic recruited.':'Racing harness installed.';
      }
      stable.gold-=cost;
      break;
    }
    default:return;
  }
  saveStable(stable);
  root.querySelector('dialog[open]')?.close();
  render();
});

render();
requestAnimationFrame(tick);
