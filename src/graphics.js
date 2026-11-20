import { locate } from './race.js';

function polygon(ctx, points, color, stroke) {
  ctx.beginPath();
  points.forEach(([x,y], index) => index ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
  ctx.closePath();
  ctx.fillStyle=color;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle=stroke;
    ctx.stroke();
  }
}

function oval(ctx,x,y,rx,ry,color) {
  ctx.beginPath();
  ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);
  ctx.fillStyle=color;
  ctx.fill();
}

function rng(seed) {
  return () => {
    seed=(1664525*seed+1013904223)>>>0;
    return seed/4294967296;
  };
}

export function drawBanner(canvas) {
  const ctx=canvas.getContext('2d');
  const w=1000, h=302;
  const sky=ctx.createLinearGradient(0,0,0,h);
  sky.addColorStop(0,'#231d2a');
  sky.addColorStop(.65,'#a65039');
  sky.addColorStop(1,'#3b2527');
  ctx.fillStyle=sky;
  ctx.fillRect(0,0,w,h);
  const random=rng(431);
  oval(ctx,750,137,112,112,'#eab272');
  for (let i=0;i<65;i++) {
    const x=random()*w,y=random()*200;
    oval(ctx,x,y,random()*1.3+.3,.8,'#f4cc8947');
  }
  for (let i=0;i<8;i++) {
    ctx.fillStyle='#562d34';
    const y=166+i*10;
    ctx.fillRect(0,y,w,3);
  }
  polygon(ctx,[[0,183],[91,164],[141,180],[204,140],[270,170],[330,148],[420,187],[504,163],[552,182],[613,151],[650,163],[677,152],[721,175],[783,160],[900,184],[1000,145],[1000,280],[0,280]],'#572d36');
  for (let i=0;i<15;i++) {
    const x=i*77-35;
    const y=189+(i%4)*7;
    polygon(ctx,[[x,y+52],[x+6,y],[x+29,y-13],[x+54,y],[x+59,y+52]],'#392633');
    ctx.fillStyle='#1f2029';
    for (const dx of [14,25,36]) ctx.fillRect(x+dx,y+7,5,30);
    ctx.fillStyle='#c4774c44';
    ctx.fillRect(x+5,y+43,50,2);
  }
  polygon(ctx,[[0,254],[514,236],[1000,244],[1000,302],[0,302]],'#231e29');
  for (let i=0;i<22;i++) {
    const x=410+random()*600,y=246+random()*55;
    polygon(ctx,[[x,y],[x+30+random()*75,y-1],[x+18,y+2]],'#dc8b5350');
  }
  ctx.save();
  ctx.translate(675,196);
  ctx.scale(1.05,1.05);
  const ink='#191a24';
  const gold='#c78049';
  ctx.lineWidth=2.2;
  // Rear horse, harness and chariot silhouette.
  polygon(ctx,[[65,14],[108,1],[133,3],[156,-41],[169,-49],[173,-65],[182,-48],[199,-40],[214,-21],[205,-11],[180,-19],[158,20],[113,31],[76,31]],'#45313a',ink);
  polygon(ctx,[[135,20],[140,38],[172,52],[182,69],[168,70],[155,57],[127,47],[115,28],[102,57],[82,70],[74,66],[91,49],[92,18]],'#302632',ink);
  polygon(ctx,[[-32,38],[88,16],[89,22],[-36,45]],gold);
  polygon(ctx,[[-104,5],[-58,12],[-37,30],[-32,58],[-95,52],[-116,27]],'#782f33',ink);
  polygon(ctx,[[-116,11],[-85,18],[-60,18],[-40,34],[-88,34],[-108,26]],'#d58a4e',ink);
  polygon(ctx,[[-90,12],[-88,-16],[-72,-43],[-55,-47],[-48,-32],[-58,-10],[-45,14]],'#26313a',ink);
  polygon(ctx,[[-84,-33],[-107,-26],[-132,-31],[-155,-17],[-136,-43],[-100,-49],[-72,-46]],'#a7423c',ink);
  oval(ctx,-62,-56,13,15,ink);
  polygon(ctx,[[-78,-53],[-72,-70],[-53,-73],[-45,-55],[-55,-50],[-59,-60]],'#d99a58',ink);
  polygon(ctx,[[-60,-36],[-45,-26],[-21,-31],[-16,-26],[-45,-16],[-63,-24]],'#ad6746',ink);
  ctx.strokeStyle='#251f27';
  ctx.beginPath(); ctx.moveTo(-20,-28); ctx.quadraticCurveTo(72,12,186,-21); ctx.stroke();
  oval(ctx,-69,53,29,29,ink);
  oval(ctx,-69,53,24,24,'#be7948');
  oval(ctx,-69,53,19,19,'#322631');
  ctx.strokeStyle='#be7948';
  for(let i=0;i<8;i++){
    ctx.beginPath();ctx.moveTo(-69,53);ctx.lineTo(-69+19*Math.cos(i*Math.PI/4),53+19*Math.sin(i*Math.PI/4));ctx.stroke();
  }
  oval(ctx,-69,53,5,5,'#e8ae64');
  // Foreground horse in full stride.
  polygon(ctx,[[52,8],[24,5],[6,-9],[11,9],[35,27],[56,24],[49,40],[20,59],[5,66],[7,73],[31,70],[65,53],[78,34],[111,37],[123,56],[163,71],[175,70],[177,65],[145,49],[133,24],[149,9],[164,-11],[185,-3],[198,-9],[193,-22],[173,-39],[172,-54],[160,-44],[148,-47],[133,-27],[112,-3],[90,1],[71,-2]],'#683a38',ink);
  polygon(ctx,[[56,12],[77,5],[114,9],[137,-17],[158,-39],[169,-33],[186,-17],[173,-20],[146,-12],[131,20],[108,27],[81,23]],'#ac5d47');
  polygon(ctx,[[113,-3],[126,-31],[151,-48],[160,-44],[143,-33],[137,-18],[129,-7]],ink);
  polygon(ctx,[[156,-29],[179,-14],[174,-7],[151,-20]],gold);
  oval(ctx,175,-24,2.6,2.6,'#ffdf90');
  ctx.strokeStyle='#e7aa64';
  ctx.beginPath(); ctx.moveTo(-20,-27); ctx.quadraticCurveTo(79,22,174,-11); ctx.stroke();
  ctx.restore();
  const fade=ctx.createLinearGradient(0,0,780,0);
  fade.addColorStop(0,'#151820');
  fade.addColorStop(.43,'#151820ee');
  fade.addColorStop(.71,'#15182035');
  fade.addColorStop(1,'#15182000');
  ctx.fillStyle=fade;
  ctx.fillRect(0,0,w,h);
}

function strokeTrack(ctx, path, width, color) {
  ctx.beginPath();
  path.points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
  if (path.loop) ctx.closePath();
  ctx.lineCap='round';
  ctx.lineJoin='round';
  ctx.strokeStyle=color;
  ctx.lineWidth=width;
  ctx.stroke();
}

export function createScenery(race) {
  const canvas=document.createElement('canvas');
  canvas.width=1840; canvas.height=1460;
  const ctx=canvas.getContext('2d');
  const random=rng(886);
  const rain=race.event.weather==='Rain';
  ctx.fillStyle=rain?'#23302e':'#302b2a';
  ctx.translate(300,300);
  ctx.fillRect(-300,-300,1840,1460);
  for(let i=0;i<7200;i++){
    const x=random()*1840-300,y=random()*1460-300;
    oval(ctx,x,y,random()*5+1,random()*2+1,random()>.5?'#c5ac7211':'#10131726');
  }
  for(let i=0;i<135;i++){
    const x=random()*1840-300,y=random()*1460-300;
    if (race.path.points.some(([px,py])=>Math.hypot(px-x,py-y)<79)) continue;
    const size=6+random()*17;
    oval(ctx,x+5,y+9,size,size*.62,'#171b2099');
    polygon(ctx,[[x-size,y+5],[x-size*.63,y-size*.55],[x+2,y-size],[x+size*.8,y-size*.32],[x+size,y+5],[x+2,y+size*.62]],'#383d37','#21272a');
    polygon(ctx,[[x-size*.63,y-size*.55],[x+2,y-size],[x+size*.8,y-size*.32],[x+2,y+2]],'#4f5345');
  }
  strokeTrack(ctx,race.path,115,'#171920');
  strokeTrack(ctx,race.path,104,'#c39763');
  strokeTrack(ctx,race.path,95,'#4f3934');
  strokeTrack(ctx,race.path,85,race.event.track.color);
  ctx.save();
  ctx.setLineDash([13,15]);
  strokeTrack(ctx,race.path,1.4,'#f6cc8240');
  ctx.restore();
  for(let i=0;i<1800;i++){
    const pos=locate(race.path,random()*race.path.length,random()*78-39);
    oval(ctx,pos.x,pos.y,random()*2.7+.5,.8,random()>.5?'#ffce8a43':'#51312d49');
  }
  for(const distance of race.path.loop?[0]:[0,race.path.length]){
    const pos=locate(race.path,distance);
    ctx.save();
    ctx.translate(pos.x,pos.y);ctx.rotate(pos.angle);
    for(let row=0;row<2;row++) for(let column=0;column<14;column++){
      ctx.fillStyle=(row+column)%2?'#eee3c9':'#352935';
      ctx.fillRect(row*5-5,column*6-42,5,6);
    }
    ctx.restore();
  }
  return canvas;
}

function drawUnit(ctx,unit,pos,time) {
  ctx.save();
  ctx.translate(pos.x,pos.y);
  ctx.rotate(pos.angle);
  if(unit.id===0){
    oval(ctx,-2,0,32,22,'#ffda7532');
    ctx.strokeStyle='#ffe196b0';
    ctx.lineWidth=1.4;
    ctx.beginPath();ctx.ellipse(-2,0,32,22,0,0,Math.PI*2);ctx.stroke();
  }
  oval(ctx,-3,4,29,12,'#251d2590');
  ctx.lineWidth=1.8;
  for(const y of [-5.8,5.8]){
    const stride=unit.done?0:Math.sin(time*18+unit.id+y)*3.5;
    polygon(ctx,[[-10,y-2],[12,y-2],[12,y+2],[-10,y+2]],'#d4aa6e');
    polygon(ctx,[[3,y-3],[13,y-4],[20,y-3],[25,y-1],[23,y+3],[11,y+4],[3,y+3]],unit.id===0?'#d39c62':'#b08871','#282329');
    polygon(ctx,[[7,y-3],[5+stride,y-6],[7+stride,y-6],[10,y-2],[17,y+2],[19-stride,y+6],[17-stride,y+6],[14,y+2]],'#30262b');
  }
  polygon(ctx,[[-27,-8],[-13,-8],[-8,-4],[-8,4],[-13,8],[-27,8]],unit.color,'#26242c');
  oval(ctx,-18,0,4,4,'#24212c');
  oval(ctx,-17,-.6,2.1,2.1,'#f3cb9c');
  ctx.fillStyle='#25242b';ctx.fillRect(-24,-11,10,3);ctx.fillRect(-24,8,10,3);
  ctx.restore();
}

export function drawRace(canvas,map,race,scenery) {
  const player=race.units[0];
  const camera=locate(race.path,player.distance,player.offset);
  const ctx=canvas.getContext('2d');
  const {width:w,height:h}=canvas;
  const zoom=1.34;
  ctx.fillStyle='#24272b';ctx.fillRect(0,0,w,h);
  ctx.save();ctx.translate(w/2-camera.x*zoom,h/2-camera.y*zoom);ctx.scale(zoom,zoom);
  ctx.drawImage(scenery,-300,-300);
  if(race.hazard){
    const pos=locate(race.path,race.hazard.distance,(race.hazard.lane-1)*27);
    oval(ctx,pos.x,pos.y,14,10,'#4e3444');
    polygon(ctx,[[pos.x,pos.y-9],[pos.x+8,pos.y+5],[pos.x-8,pos.y+5]],'#ffd07a','#6a2f30');
  }
  for(const unit of [...race.units.slice(1),player]) {
    if(unit.done && !unit.dnf && unit.id!==0) continue;
    ctx.globalAlpha=unit.dnf?.48:1;
    drawUnit(ctx,unit,locate(race.path,unit.distance,unit.offset),race.time);
  }
  ctx.restore();
  const vignette=ctx.createRadialGradient(w/2,h/2,h*.25,w/2,h/2,w*.62);
  vignette.addColorStop(0,'#10131b00');vignette.addColorStop(1,'#10131b9b');
  ctx.fillStyle=vignette;ctx.fillRect(0,0,w,h);
  const mini=map.getContext('2d');
  mini.clearRect(0,0,map.width,map.height);
  const scale=Math.min(map.width/1240,map.height/860);
  mini.save();mini.translate((map.width-1240*scale)/2,(map.height-860*scale)/2);mini.scale(scale,scale);
  strokeTrack(mini,race.path,68,'#242b35');
  strokeTrack(mini,race.path,38,'#70604d');
  for(const unit of [...race.units.slice(1),player]){
    const pos=locate(race.path,unit.distance,unit.offset);
    oval(mini,pos.x,pos.y,unit.id===0?34:22,unit.id===0?34:22,'#12161f');
    oval(mini,pos.x,pos.y,unit.id===0?24:15,unit.id===0?24:15,unit.color);
  }
  mini.restore();
}
