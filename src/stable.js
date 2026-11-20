import { ASSETS, CUPS, EVENTS, TRACKS, POINTS, clamp } from './data.js';

const SAVE_KEY = 'blood-and-thunder.v1';
export function newStable() {
  return {
    gold:280, rep:0, cycles:0, wins:0, trophies:[], history:[],
    roster:{vale:100,korr:100,ash:100,stag:100,dawn:100,silk:100},
    selected:{driver:'vale',beasts:'ash',chariot:'dawn'},
    plan:'balanced', mechanic:false, harness:false, training:0, project:null, cup:null
  };
}

export let storageAvailable = true;
export function loadStable() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? {...newStable(), ...JSON.parse(raw)} : newStable();
  } catch {
    storageAvailable = false;
    return newStable();
  }
}

export function saveStable(stable) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(stable));
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
}

export const lineup = stable => Object.entries(stable.selected).map(([role,id]) =>
  ASSETS[role].find(asset => asset.id === id)
);
export const condition = stable => Math.round(lineup(stable).reduce((sum, asset) => sum + stable.roster[asset.id], 0) / 3);
export const legal = stable => lineup(stable).every(asset => stable.roster[asset.id] >= 25) &&
  stable.project?.id !== stable.selected.driver;
export const repairCost = stable => stable.mechanic ? 18 : 30;
export const currentCup = stable => CUPS.find(cup => cup.id === stable.cup?.id);
export function eventInfo(id) {
  const [trackId, discipline, laps, weather] = EVENTS[id];
  return {trackId, track:TRACKS[trackId], discipline, laps, weather};
}

export function enterCup(stable, id) {
  const cup = CUPS.find(entry => entry.id === id);
  if (!cup || stable.cup || !legal(stable) || stable.gold < cup.fee || stable.rep < cup.rep) return false;
  stable.gold -= cup.fee;
  stable.cup = {id, index:0, scores:[0,0,0,0,0,0], results:[], completed:null};
  return true;
}

export function serviceUnit(stable) {
  const cost = repairCost(stable);
  const team = lineup(stable);
  if (stable.gold < cost || team.every(asset => stable.roster[asset.id] === 100)) return false;
  stable.gold -= cost;
  for (const asset of team) stable.roster[asset.id] = clamp(stable.roster[asset.id] + 28, 0, 100);
  return true;
}

export function championshipOrder(run) {
  return run.scores.map((_, i) => i).sort((a,b) => run.scores[b] - run.scores[a] ||
    (run.results.at(-1)?.placements.indexOf(a) ?? a) - (run.results.at(-1)?.placements.indexOf(b) ?? b));
}

export function finishCup(stable, reason) {
  const run = stable.cup;
  if (run.completed) return;
  const cup = currentCup(stable);
  const place = reason === 'Finished' ? championshipOrder(run).indexOf(0) + 1 : null;
  const payout = place ? Math.round(cup.purse * [1,.62,.43,.29,.22,.17][place - 1]) : 0;
  stable.gold += payout;
  if (run.results.length) {
    stable.cycles++;
    stable.rep += place ? (place <= 3 ? 3 : 2) : 1;
    if (stable.project && --stable.project.remaining <= 0) {
      stable.training++;
      stable.project = null;
    }
    if (place === 1) {
      stable.wins++;
      if (!stable.trophies.includes(cup.name)) stable.trophies.push(cup.name);
    }
  }
  run.completed = {reason, place, payout};
  stable.history.unshift({name:cup.name, reason, place, payout});
  stable.history = stable.history.slice(0,12);
}

export function recordRace(stable, race) {
  const run = stable.cup;
  const placements = race.placements.map(unit => unit.id);
  race.placements.forEach((unit,index) => { if (!unit.dnf) run.scores[unit.id] += POINTS[index]; });
  const player = race.units[0];
  const place = player.dnf ? null : placements.indexOf(0) + 1;
  const purse = place ? [50,38,29,22,17,12][place - 1] : 5;
  const damage = Math.round(player.damage);
  const fatigue = Math.round(player.fatigue);
  const wear = [
    Math.round(damage * .39 + fatigue * .17 + (player.dnf ? 13 : 0)),
    Math.round(damage * .27 + fatigue * .39 + (player.dnf ? 15 : 0)),
    Math.round(damage * .69 + fatigue * .09 + (player.dnf ? 19 : 0))
  ];
  lineup(stable).forEach((asset, index) => {
    stable.roster[asset.id] = clamp(stable.roster[asset.id] - wear[index] + (stable.mechanic ? 4 : 0), 0, 100);
  });
  stable.gold += purse;
  run.results.push({name:race.event.track.name, placements, place, purse, damage, fatigue, wear});
  run.index++;
  if (run.index >= currentCup(stable).events.length) finishCup(stable,'Finished');
  else if (Object.values(ASSETS).some(group => !group.some(asset =>
    (stable.roster[asset.id] ?? 0) >= 25 && stable.project?.id !== asset.id))) finishCup(stable,'Eliminated');
}
