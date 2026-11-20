import { RIVALS, clamp } from './data.js';
import { condition, lineup } from './stable.js';

const lerp = (a,b,t) => a + (b-a)*t;
export function makeTrack(track) {
  const source = track.points;
  const loop = track.kind !== 'Rally';
  const get = i => source[loop ? (i + source.length) % source.length : clamp(i,0,source.length-1)];
  const points = [];
  for (let i=0; i<source.length-(loop ? 0 : 1); i++) {
    const [a,b,c,d] = [get(i-1),get(i),get(i+1),get(i+2)];
    for (let j=0;j<20;j++) {
      const t = j/20;
      points.push(b.map((v,k) => .5*((2*v)+(-a[k]+c[k])*t+
        (2*a[k]-5*v+4*c[k]-d[k])*t*t+(-a[k]+3*v-3*c[k]+d[k])*t*t*t)));
    }
  }
  points.push(loop ? points[0] : source.at(-1));
  const lengths = [0];
  for (let i=1;i<points.length;i++) lengths.push(lengths.at(-1)+Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]));
  return {points,lengths,length:lengths.at(-1),loop};
}

export function locate(path, distance, offset=0) {
  const d = path.loop ? ((distance % path.length)+path.length)%path.length : clamp(distance,0,path.length);
  let low=0, high=path.lengths.length-1;
  while (high-low>1) {
    const middle=(low+high)>>1;
    if (path.lengths[middle]<=d) low=middle;
    else high=middle;
  }
  const a=path.points[low], b=path.points[high];
  const angle=Math.atan2(b[1]-a[1],b[0]-a[0]);
  const t=(d-path.lengths[low])/(path.lengths[high]-path.lengths[low]);
  const leadIn=path.loop ? 0 : Math.min(0,distance);
  return {x:lerp(a[0],b[0],t)+Math.cos(angle)*leadIn-Math.sin(angle)*offset,y:lerp(a[1],b[1],t)+Math.sin(angle)*leadIn+Math.cos(angle)*offset,angle};
}

function addLog(race, message, type='') {
  race.logs.unshift({time:race.time,message,type});
  race.logs.length=Math.min(race.logs.length,35);
}

function activateSign(race) {
  if (!race.queued || race.uses <= 0) {
    race.active=null;
    return;
  }
  race.active=race.queued;
  race.queued=null;
  race.uses--;
  const messages={charge:'“Push the Pace” is up. The Dawnward line accelerates!',hold:'“Hold the Line” is up. The driver takes the clean route.',rest:'“Conserve” is up. The team settles into a steady rhythm.'};
  addLog(race,messages[race.active],'sign');
}

export function createRace(event, stable) {
  const path=makeTrack(event.track);
  const team=lineup(stable);
  const average=key => team.reduce((sum,asset)=>sum+asset[key],0)/team.length;
  const stats={name:'Dawnward Stable',color:'#ffd16e',speed:average('speed')+.035+(stable.harness?.055:0),
    grip:average('grip')+(stable.training*.025),nerve:average('nerve')*(stable.plan==='bold'?1.14:1),
    condition:condition(stable),plan:stable.plan};
  const units=[stats,...RIVALS].map((entry,id)=>({...entry,id,
    distance:-1-Math.floor(id/3)*19, lane:id%3, offset:(id%3-1)*27,
    damage:0,fatigue:0,pace:0,done:false,dnf:false,contact:0,decision:Math.random()*2,hitHazard:-1
  }));
  return {event,path,units,time:0,countdown:3,paused:true,speed:1,uses:3,queued:null,active:null,
    logs:[{time:0,message:'The teams are on the grid. The stewards are ready.',type:'sign'}],
    placements:[],crossings:[],finished:false,hazard:null,hazardTime:5+Math.random()*8,playerPlace:1,announce:0};
}

export function raceOrder(race) {
  return [...race.units].sort((a,b)=>a.dnf-b.dnf || Number(b.done)-Number(a.done) ||
    (a.finishOrder??99)-(b.finishOrder??99) || b.distance-a.distance);
}

function settle(race, unit, dnf=false) {
  if (unit.done) return;
  unit.done=true;
  unit.dnf=dnf;
  unit.finishOrder=race.placements.length;
  race.placements.push(unit);
  addLog(race,dnf ? `${unit.name} is out of the race!` :
    `${unit.name} crosses the finish${unit.finishOrder===0?' in first place':''}!`,dnf?'danger':'finish');
}

function advanceUnit(race, unit, dt) {
  if (unit.done) return;
  const {path,event}=race;
  const before=Math.max(0,Math.floor(unit.distance/path.length));
  const sign=unit.id===0 ? race.active : null;
  const corner=locate(path,unit.distance+21).angle-locate(path,unit.distance-21).angle;
  const bend=Math.abs(Math.atan2(Math.sin(corner),Math.cos(corner)));
  const rain=event.weather==='Rain';
  const dust=event.weather==='Dust';
  unit.contact=Math.max(0,unit.contact-dt);
  unit.decision-=dt;
  if (unit.decision<=0) {
    const ahead=race.units.find(other=>other!==unit && !other.done && other.lane===unit.lane &&
      other.distance>unit.distance && other.distance-unit.distance<46);
    if (ahead || (sign!=='hold' && Math.random()<.19*unit.nerve)) {
      const shift=unit.lane===0?1:unit.lane===2?-1:Math.random()<.5?-1:1;
      if (!race.units.some(other=>other!==unit && !other.done && other.lane===unit.lane+shift &&
        Math.abs(other.distance-unit.distance)<14)) unit.lane+=shift;
    }
    unit.decision=.5+Math.random()*(unit.grip>1.1?1.7:2.6);
  }
  unit.offset=lerp(unit.offset,(unit.lane-1)*27,Math.min(1,dt*5));
  const effect=sign==='charge'?1.085:sign==='rest'?.92:sign==='hold'?1.015:1;
  const prep=unit.plan==='bold'?1.04:unit.plan==='careful'?.98:1;
  const pace=255*unit.speed*effect*prep*(.94+.06*Math.sin(race.time*1.35+unit.id*2.3))*
    (1-(unit.damage*.0034+unit.fatigue*.0020))*(.88+(unit.condition??100)*.0012)*
    (1-bend*(rain?.32:dust?.22:.16)/(unit.grip*(sign==='hold'?1.38:1)))*
    (.98+unit.lane*.022)*(unit.contact>0?.78:1) * (1 + (unit.id===0?.01:.005)*Math.sin(race.time*.66));
  unit.pace=lerp(unit.pace,pace,Math.min(1,dt*3));
  const previousDistance=unit.distance;
  unit.distance+=unit.pace*dt;
  unit.fatigue=clamp(unit.fatigue+dt*(sign==='rest'?-.24:sign==='charge'?1.9:unit.plan==='careful'?.62:1),0,90);
  if (race.hazard && unit.hitHazard!==race.hazard.id && unit.lane===race.hazard.lane &&
      Math.abs((path.loop?unit.distance%path.length:unit.distance)-race.hazard.distance)<20) {
    unit.hitHazard=race.hazard.id;
    unit.damage+=7+Math.random()*9;
    unit.contact=.8;
    addLog(race,`${unit.name} clips ${race.hazard.name} and loses momentum.`,'danger');
  }
  if (unit.distance>=path.length*event.laps) {
    const fraction=(path.length*event.laps-previousDistance)/(unit.distance-previousDistance);
    race.crossings.push({unit,fraction});
    unit.distance=path.length*event.laps;
  }
  else if (unit.id===0 && path.loop && Math.floor(unit.distance/path.length)>before) {
    addLog(race,`Dawnward begins lap ${before+2} of ${event.laps}.`);
    activateSign(race);
  }
}

function resolveContact(race, unit, rival) {
  if (unit.done || rival.done || unit.lane!==rival.lane || Math.abs(unit.distance-rival.distance)>=13) return;
  const front=unit.distance>=rival.distance?unit:rival;
  const back=front===unit?rival:unit;
  const combat=race.event.discipline==='Combat';
  if (!back.contact && !front.contact) {
    const ram=combat && Math.random()<back.nerve*.58 && !(back.id===0 && race.active==='rest');
    const resistance=entry=>entry.nerve*(entry.id===0 && race.active==='rest'?1.5:1);
    back.damage+=(ram?5:2.3)/resistance(back);
    front.damage+=(ram?15:4)/resistance(front);
    back.contact=ram?.8:.43;
    front.contact=ram?1.4:.35;
    if (ram || unit.id===0 || rival.id===0) addLog(race,
      ram?`${back.name} rams ${front.name}!`:`${back.name} and ${front.name} touch wheels.`,'danger');
  }
  back.distance=front.distance-13;
  back.pace=Math.min(back.pace,front.pace);
}

export function stepRace(race, dt) {
  if (race.finished) return;
  if (race.countdown>0) {
    race.countdown=Math.max(0,race.countdown-dt);
    if (race.countdown===0) {
      addLog(race,'And they’re off! Six teams thunder down the course.','finish');
      activateSign(race);
    }
    return;
  }
  race.time+=dt;
  if (!race.hazard && race.event.laps>1 && race.time>=race.hazardTime) {
    race.hazardTime=Infinity;
    if (Math.random()<.75) {
      race.hazard={id:1,lane:Math.floor(Math.random()*3),distance:race.path.length*(.22+Math.random()*.52),
        name:race.event.weather==='Rain'?'a flooded rut':'loose debris'};
      addLog(race,`Course alert: ${race.hazard.name} in lane ${race.hazard.lane+1}!`,'danger');
    }
  }
  for (const unit of race.units) advanceUnit(race,unit,dt);
  race.crossings.sort((a,b)=>a.fraction-b.fraction);
  for(const {unit} of race.crossings) settle(race,unit);
  race.crossings.length=0;
  const running=raceOrder(race).filter(unit=>!unit.done);
  for (let i=0;i<running.length;i++) for (let j=i+1;j<running.length;j++) resolveContact(race,running[i],running[j]);
  for (const unit of running) if (unit.damage>=75 || race.time>150) settle(race,unit,true);
  race.placements.sort((a,b)=>a.dnf-b.dnf || a.finishOrder-b.finishOrder);
  const place=raceOrder(race).findIndex(unit=>unit.id===0)+1;
  if (place!==race.playerPlace && race.announce<=race.time && !race.units[0].done) {
    addLog(race,place<race.playerPlace?`Dawnward gains ground, up to P${place}!`:`Dawnward drops to P${place} as the field reshuffles.`);
    race.playerPlace=place;
    race.announce=race.time+2;
  }
  race.finished=race.placements.length===race.units.length;
}
