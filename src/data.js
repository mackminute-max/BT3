export const ASSETS = {
  driver: [
    { id:'vale', name:'Aurelia Vale', title:'Human · The tactician', icon:'♜', speed:1.00, grip:1.17, nerve:.86, price:0 },
    { id:'korr', name:'Korr Ironhand', title:'Orc · The bruiser', icon:'♞', speed:1.10, grip:.91, nerve:1.28, price:95 },
    { id:'syl', name:'Syl Vesper', title:'Elf · The opportunist', icon:'✦', speed:1.15, grip:1.09, nerve:.72, price:175 }
  ],
  beasts: [
    { id:'ash', name:'Ashmane Pair', title:'Ember steeds · Balanced', icon:'♞', speed:1.03, grip:1, nerve:1.05, price:0 },
    { id:'stag', name:'Moonhorn Team', title:'Silver stags · Agile', icon:'♘', speed:1.09, grip:1.20, nerve:.84, price:105 },
    { id:'wyrm', name:'Cinder Drakes', title:'Lesser drakes · Hardy', icon:'♠', speed:1.04, grip:.89, nerve:1.40, price:190 }
  ],
  chariot: [
    { id:'dawn', name:'Gilded Dawn', title:'Bronze frame · Balanced', icon:'◈', speed:1.02, grip:1.03, nerve:1, price:0 },
    { id:'silk', name:'Silkwind', title:'Ashwood frame · Light', icon:'◇', speed:1.15, grip:1.04, nerve:.78, price:125 },
    { id:'bastion', name:'Iron Bastion', title:'Steel frame · Armored', icon:'⬡', speed:.99, grip:.93, nerve:1.43, price:175 }
  ]
};

export const ROLES = { driver:'Driver', beasts:'Beast team', chariot:'Chariot' };
export const RIVALS = [
  {name:'The Jade Talon', color:'#55d3a4', speed:1.09, grip:1.17, nerve:.86},
  {name:'Crimson Covenant', color:'#ef655c', speed:1.10, grip:.92, nerve:1.26},
  {name:'House Vesper', color:'#ad91eb', speed:1.07, grip:1.23, nerve:.80},
  {name:'The Salt Wolves', color:'#68a9ed', speed:1.08, grip:1.02, nerve:1.18},
  {name:'Ivory Standard', color:'#f0e5ca', speed:1.04, grip:1.02, nerve:1.06}
];
export const TRACKS = {
  sun: {name:'Sunspire Hippodrome', kind:'Oval', region:'AURELIAN DOMINION', color:'#bc7b4c', points:[[415,198],[850,198],[1035,252],[1100,425],[1035,605],[850,661],[415,661],[205,605],[140,425],[208,251]]},
  dusk: {name:'Duskhollow Circuit', kind:'Circuit', region:'VERDANT MARCHES', color:'#8b7652', points:[[470,190],[835,173],[1050,264],[1077,495],[939,642],[699,584],[621,447],[473,429],[349,610],[184,567],[142,371],[245,221]]},
  gate: {name:'Cinder Gate Run', kind:'Rally', region:'ASHEN FRONTIER', color:'#a76b49', points:[[170,615],[331,585],[466,498],[435,349],[301,265],[424,168],[669,196],[694,358],[830,478],[1025,382],[1100,194]]},
  crown: {name:'Obsidian Crown', kind:'Circuit', region:'ASHEN FRONTIER', color:'#8e6850', points:[[444,205],[729,195],[893,270],[1021,204],[1088,356],[960,477],[968,611],[797,666],[582,542],[390,638],[186,549],[140,354],[249,224]]}
};
export const EVENTS = {
  sun:['sun','Pure',3,'Clear'], dusk:['dusk','Pure',3,'Rain'],
  gate:['gate','Pure',1,'Dust'], clash:['sun','Combat',3,'Clear'],
  crown:['crown','Combat',4,'Dust'], mire:['dusk','Combat',3,'Rain'],
  fire:['gate','Combat',1,'Dust']
};
export const CUPS = [
  {id:'sun', name:'The Sunspire Cup', label:'NOVICE CHAMPIONSHIP', description:'Three gates to glory. Earn your colors on the storied tracks of the Dominion.', fee:40, purse:245, rep:0, events:['sun','dusk','gate']},
  {id:'march', name:'Verdant Circuit', label:'HANDLING SERIES', description:'Fast corners and wet stone reward a steady hand.', fee:75, purse:340, rep:2, events:['dusk','sun','dusk','gate']},
  {id:'clash', name:'Crimson Clash', label:'COMBAT CHAMPIONSHIP', description:'The stewards allow contact. The crowd demands it.', fee:90, purse:440, rep:4, events:['clash','mire','crown']},
  {id:'frontier', name:'Frontier Rally', label:'POINT-TO-POINT SERIES', description:'One crossing at a time through the old volcanic passes.', fee:105, purse:500, rep:6, events:['gate','fire','gate','fire']},
  {id:'crown', name:'Obsidian Crown', label:'MASTERS CHAMPIONSHIP', description:'Five unforgiving starts for the finest stables in the realm.', fee:135, purse:685, rep:9, events:['sun','mire','fire','dusk','crown']},
  {id:'iron', name:'Iron Gauntlet', label:'ENDURANCE INVITATIONAL', description:'Twelve starts. Every repair, every race and every point counts.', fee:175, purse:1200, rep:13, events:['clash','mire','gate','crown','dusk','fire','sun','mire','clash','crown','fire','crown']}
];
export const SIGNS = {
  charge:{name:'Push the Pace', icon:'⚡', description:'More speed, higher fatigue and contact risk.'},
  hold:{name:'Hold the Line', icon:'⬡', description:'Steadier handling and fewer risky passes.'},
  rest:{name:'Conserve', icon:'✦', description:'Trade pace for stamina and protection.'}
};
export const POINTS = [10,7,5,3,2,1];
export const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
