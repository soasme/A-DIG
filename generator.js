#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import logic from 'logicjs';
import gameThemes from './app/data/gameThemes.js';

var or = logic.or,
	and = logic.and,
	not = logic.not,
	eq = logic.eq,
	run = logic.run,
	lvar = logic.lvar,
	between = logic.between

export const ROWS = 5;
export const COLS = 3;

export let VILLAGER = 'villager';
export let WEREWOLF = 'werewolf';

export const CLUE_TYPES = Object.freeze({
  EXACTLY_K_ROLE_IN_ROW: 'exactlyKRoleInRow',
  EXACTLY_K_ROLE_IN_COLUMN: 'exactlyKRoleInColumn',
  EXACTLY_ROLE_ABOVE_ROW: 'exactlyRoleAboveRow',
  EXACTLY_ROLE_BELOW_ROW: 'exactlyRoleBelowRow',
  EXACTLY_K_ROLE_LEFT_COLUMN: 'exactlyKRoleLeftColumn',
  EXACTLY_K_ROLE_RIGHT_COLUMN: 'exactlyKRoleRightColumn',
  EXACTLY_K_ROLE_ABOVE_SOMEONE: 'exactlyKRoleAboveSomeone',
  EXACTLY_K_ROLE_BELOW_SOMEONE: 'exactlyKRoleBelowSomeone',
  EXACTLY_K_ROLE_LEFT_OF_SOMEONE: 'exactlyKRoleLeftOfSomeone',
  EXACTLY_K_ROLE_RIGHT_OF_SOMEONE: 'exactlyKRoleRightOfSomeone',
  EXACTLY_K_ROLE_BETWEEN_THE_TWO: 'exactlyKRoleBetweenTheTwo',
  ALL_ROLE_IN_ROW_CONNECTED: 'AllRoleInRowConnected',
  ALL_ROLE_IN_COLUMN_CONNECTED: 'AllRoleInColumnConnected',
  HAVE_EQUAL_ROLE_NEIGHBOR: 'HaveEqualRoleNeighbor',
  HAVE_MORE_ROLE_NEIGHBORS: 'HaveMoreRoleNeighbors',
  HAVE_LESS_ROLE_NEIGHBORS: 'HaveLessRoleNeighbors',
  BE_ONE_OF_SOMEONES_K_ROLE_NEIGHBORS: 'BeOneOfSomeonesKRoleNeighbors',
  HAS_EXACT_K_ROLE_NEIGHBOR: 'HasExactKRoleNeighbor',
  K_OF_J_ROLE_TO_THE_LEFT_OF_SOMEONE_IS_ANOTHERS_NEIGHBOR: 'KofJRoleToTheLeftOfSomeoneIsAnothersNeighbor',
  K_OF_J_ROLE_TO_THE_RIGHT_OF_SOMEONE_IS_ANOTHERS_NEIGHBOR: 'KofJRoleToTheRightOfSomeoneIsAnothersNeighbor',
  K_OF_J_ROLE_ABOVE_SOMEONE_IS_ANOTHERS_NEIGHBOR: 'KofJRoleAboveSomeoneIsAnothersNeighbor',
  K_OF_J_ROLE_BELOW_SOMEONE_IS_ANOTHERS_NEIGHBOR: 'KofJRoleBelowSomeoneIsAnothersNeighbor',
  K_OF_J_ROLE_NEIGHBOR_TO_SOMEONE_IS_ANOTHERS_NEIGHBOR: 'KofJRoleNeighborToSomeoneIsAnothersNeighbor',
  K_OF_J_ROLE_BEFORE_ALPHABET_NAMES: 'KofJRoleBeforeAlphabetNames',
  K_OF_J_ROLE_AFTER_ALPHABET_NAMES: 'KofJRoleAfterAlphabetNames',
});

export function setRoleNames(roleNames = []) {
  const [goodRole, badRole] = roleNames;
  VILLAGER = goodRole || VILLAGER;
  WEREWOLF = badRole || WEREWOLF;
}

const MALE_NAMES = [
  'Aiden','Brandon','Caleb','Derek','Ethan','Felix','Gavin','Henry','Isaac','Julian',
  'Kyle','Liam','Mason','Noah','Owen','Peter','Quinn','Ryan','Samuel','Tyler',
  'Victor','Wyatt','Xavier','Zachary','Adam','Blake','Colin','Damian','Elliot',
  'Finn','Grayson','Hunter','Ian','Jack','Kaden','Logan','Miles','Nathan','Oliver',
  'Preston','Reid','Sawyer','Tristan','Vincent','Wesley','Zane','Adrian','Bryce',
  'Carter','Dominic','Emmett','Gabriel','Hayden','Jasper','Keegan','Landon','Micah',
  'Nicholas','Parker','Riley','Spencer','Trevor','Vance','Warren','Zion','Austin',
  'Brady','Chase','Dylan','Evan','Garrett','Holden','Jacob','Kevin','Leon','Marcus',
  'Neil','Porter','Roman','Silas','Tanner','Uriel','Walker','Xander','Yusuf','Zeke',
  'Arthur','Bennett','Clark','Dean','Elias','Franklin','Graham','Harvey','Joel','Kirk',
  'Lawson','Mitchell','Nolan','Oscar','Phillip','Russell'
];

const FEMALE_NAMES = [
  'Ava','Bella','Chloe','Diana','Emma','Faith','Grace','Hannah','Isla','Jade',
  'Kara','Lily','Mia','Nora','Olivia','Paige','Quinn','Ruby','Sophia','Tessa',
  'Violet','Willow','Xena','Zoe','Amelia','Brooke','Clara','Delia','Elise',
  'Fiona','Gemma','Hailey','Ivy','Julia','Kayla','Leah','Maya','Naomi','Opal',
  'Piper','Reese','Sienna','Trinity','Vanessa','Wren','Yara','Zara','Alice','Bria',
  'Celia','Daphne','Eden','Freya','Gia','Harper','Irene','Jenna','Keira','Lena',
  'Molly','Nadia','Odette','Poppy','Riley','Sage','Talia','Vera','Wendy','Zelda',
  'April','Bianca','Camila','Danica','Esme','Flora','Greta','Hazel','Ingrid','Joy',
  'Kelsey','Lucy','Morgan','Nova','Ophelia','Penelope','Raina','Serena','Tatum','Uma',
  'Valerie','Whitney','Xiomara','Yvette','Zuri','Anya','Beatrice','Celeste','Dahlia'
];

const CHARACTERISTICS = [
  'fierce_loyalty',
  'chaotic_impulsiveness',
  'cold_calculation',
  'tragic_melancholy',
  'unyielding_ambition',
  'playful_mischief',
  'righteous_fury',
  'scheming_cunning',
  'hopeful_idealism',
  'stoic_endurance',
  'brooding_silence',
  'reckless_bravery',
  'vengeful_obsession',
  'noble_self_sacrifice',
  'shadowed_past',
  'gentle_naivety',
  'unyielding_principle',
  'forbidden_curiosity',
  'haunted_guilt',
  'mercurial_mood',
  'iron_willpower',
  'deceptive_charm',
  'unstoppable_zeal',
  'lonely_wanderer_spirit',
  'relentless_perfectionism',
  'unpredictable_genius',
  'ruthless_pragmatism',
  'warmhearted_compassion',
  'defiant_rebellion',
  'serene_detachment',
];

// 1-based indexing for rows/cols to match your puzzle spec.
// We store the grid as a single list; cell(row, col) => list[idx(row, col)].
//   villager = innocent
//   werewolf = criminal
export function cellIndex(row, col, cols = COLS) {
  return (row - 1) * cols + (col - 1);
}

export function makeRoleGrid(rows = ROWS, cols = COLS) {
  const grid = new Array(rows * cols);
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      grid[cellIndex(r, c, cols)] = lvar(`cell_${r}_${c}`);
    }
  }
  return grid;
}

// Utility: AND a list of goals
function allAnd(goals) {
  if (goals.length === 0) return logic.win;
  return goals.reduce((acc, g) => and(acc, g), logic.win);
}

// Utility: OR a list of goals
function anyOr(goals) {
  if (goals.length === 0) return logic.fail;
  return goals.reduce((acc, g) => or(acc, g), logic.fail);
}

// Everyone is either villager or werewolf
export function everyoneBinary(roleList) {
  const goals = roleList.map(v => or(eq(v, VILLAGER), eq(v, WEREWOLF)));
  return allAnd(goals);
}

// Role helpers (just wrap eq so your “atoms” can use them)
export function isVillager(roleVar) {
  return eq(roleVar, VILLAGER);
}

export function isWerewolf(roleVar) {
  return eq(roleVar, WEREWOLF);
}

// Generate all size-k subsets of given index array.
function kSubsets(indexes, k, start = 0, prefix = [], out = []) {
  if (prefix.length === k) {
    out.push(prefix.slice());
    return out;
  }
  for (let i = start; i < indexes.length; i++) {
    prefix.push(indexes[i]);
    kSubsets(indexes, k, i + 1, prefix, out);
    prefix.pop();
  }
  return out;
}

// exactlyK(vars, k, value)
// vars: array of lvars (each will end up villager or werewolf, if you also use everyoneBinary)
// k: integer
// value: VILLAGER or WEREWOLF
//
// We implement this by enumerating all subsets of vars of size k
// that have 'value', and forcing the rest to be 1-value.
export function exactlyK(vars, k, value) {
  const n = vars.length;
  const complement = (value === VILLAGER ? WEREWOLF : VILLAGER);
  const idxs = [];
  for (let i = 0; i < n; i++) idxs.push(i);

  // k == 0 special-case: all must be complement
  if (k === 0) {
    const goals = vars.map(v => eq(v, complement));
    return allAnd(goals);
  }

  const subsets = kSubsets(idxs, k);
  const perSubsetGoals = subsets.map(subset => {
    const eqGoals = subset.map(i => eq(vars[i], value));
    const neqGoals = idxs
      .filter(i => !subset.includes(i))
      .map(i => eq(vars[i], complement));
    return allAnd([...eqGoals, ...neqGoals]);
  });

  return anyOr(perSubsetGoals);
}

// Exactly K villagers in a given row
export function exactlyKRoleInRow(roleList, row, k, role, cols = COLS) {
  const start = cellIndex(row, 1, cols);
  const rowVars = roleList.slice(start, start + cols);
  return exactlyK(rowVars, k, role);
}

export function exactlyRoleAboveRow(roleList, row, k, role, cols = COLS) {
  const start = cellIndex(row, 1, cols);
  const vars = roleList.slice(0, start);
  return exactlyK(vars, k, role);
}

export function exactlyRoleBelowRow(roleList, row, k, role, rows = ROWS, cols = COLS) {
  const start = cellIndex(row + 1, 1, cols);
  const vars = roleList.slice(start, rows * cols);
  return exactlyK(vars, k, role);
}

function randInt(max) {
  return Math.floor(Math.random() * max);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatRoleName(role, roleNames = [VILLAGER, WEREWOLF]) {
  const [goodRole, badRole] = roleNames;
  if (role === VILLAGER || role === goodRole) return goodRole;
  if (role === WEREWOLF || role === badRole) return badRole;
  return role;
}

function normalizeClueParts(clue) {
  if (Array.isArray(clue)) return clue;
  if (typeof clue === 'string') return clue.trim().split(/\s+/);
  return [];
}

function toNumber(value) {
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function countLabel(count) {
  return count === 1 ? 'one' : String(count);
}

function beVerb(count) {
  return count === 1 ? 'is' : 'are';
}

function roleAmount(count, role, roleNames = [VILLAGER, WEREWOLF], { withArticle = false } = {}) {
  const roleWord = formatRoleName(role, roleNames);
  const plural = roleWord.endsWith('s') ? roleWord : `${roleWord}s`;
  if (count === 1) {
    return withArticle ? `a ${roleWord}` : `${countLabel(count)} ${roleWord}`;
  }
  return `${countLabel(count)} ${plural}`;
}

function rolePlural(role, roleNames = [VILLAGER, WEREWOLF]) {
  const roleWord = formatRoleName(role, roleNames);
  return roleWord.endsWith('s') ? roleWord : `${roleWord}s`;
}

function speakerize(name, speakerName, form = 'object') {
  if (!speakerName || typeof name !== 'string') return name;
  const normalized = name.trim().toLowerCase();
  const normalizedSpeaker = speakerName.trim().toLowerCase();
  if (normalized !== normalizedSpeaker) return name;
  if (form === 'subject') return 'I';
  if (form === 'possessive') return 'my';
  return 'me';
}

function formatClue(clueParts, getName, roleNames = [VILLAGER, WEREWOLF], options = {}) {
  const { speakerName } = options || {};
  const baseNameFor = (r, c) => (typeof getName === 'function' ? getName(r, c) : `row ${r} column ${c}`);
  const nameFor = (r, c, form = 'object') => speakerize(baseNameFor(r, c), speakerName, form);
  const parts = normalizeClueParts(clueParts);
  if (parts.length === 0) return '';
  const [fn, ...rest] = parts;
  const fallback = Array.isArray(clueParts) ? clueParts.join(' ') : String(clueParts);

  if (fn === CLUE_TYPES.EXACTLY_K_ROLE_IN_ROW || fn === CLUE_TYPES.EXACTLY_K_ROLE_IN_COLUMN) {
    if (rest.length !== 3) return fallback;
    const [role, axisRaw, countRaw] = rest;
    const axis = toNumber(axisRaw);
    const count = toNumber(countRaw);
    if (!Number.isFinite(axis) || !Number.isFinite(count)) return fallback;
    const target = fn === CLUE_TYPES.EXACTLY_K_ROLE_IN_ROW ? 'row' : 'column';
    const verb = count === 1 ? 'is' : 'are';
    return `${target[0].toUpperCase()}${target.slice(1)} ${axis} ${verb} home to exactly ${roleAmount(count, role, roleNames)}.`;
  }

  if (fn === CLUE_TYPES.EXACTLY_ROLE_ABOVE_ROW || fn === CLUE_TYPES.EXACTLY_ROLE_BELOW_ROW) {
    if (rest.length !== 3) return fallback;
    const [role, rowRaw, countRaw] = rest;
    const row = toNumber(rowRaw);
    const count = toNumber(countRaw);
    if (!Number.isFinite(row) || !Number.isFinite(count)) return fallback;
    const preposition = fn === CLUE_TYPES.EXACTLY_ROLE_ABOVE_ROW ? 'above' : 'below';
    return `There ${beVerb(count)} exactly ${roleAmount(count, role, roleNames)} ${preposition} row ${row}.`;
  }

  if (fn === CLUE_TYPES.EXACTLY_K_ROLE_LEFT_COLUMN || fn === CLUE_TYPES.EXACTLY_K_ROLE_RIGHT_COLUMN) {
    if (rest.length !== 3) return fallback;
    const [role, colRaw, countRaw] = rest;
    const col = toNumber(colRaw);
    const count = toNumber(countRaw);
    if (!Number.isFinite(col) || !Number.isFinite(count)) return fallback;
    const side = fn === CLUE_TYPES.EXACTLY_K_ROLE_LEFT_COLUMN ? 'left of' : 'right of';
    return `To the ${side} column ${col}, there ${beVerb(count)} exactly ${roleAmount(count, role, roleNames)}.`;
  }

  if (
    fn === CLUE_TYPES.EXACTLY_K_ROLE_ABOVE_SOMEONE ||
    fn === CLUE_TYPES.EXACTLY_K_ROLE_BELOW_SOMEONE ||
    fn === CLUE_TYPES.EXACTLY_K_ROLE_LEFT_OF_SOMEONE ||
    fn === CLUE_TYPES.EXACTLY_K_ROLE_RIGHT_OF_SOMEONE
  ) {
    if (rest.length !== 4) return fallback;
    const [role, rowRaw, colRaw, countRaw] = rest;
    const row = toNumber(rowRaw);
    const col = toNumber(colRaw);
    const count = toNumber(countRaw);
    if (!Number.isFinite(row) || !Number.isFinite(col) || !Number.isFinite(count)) return fallback;
    const name = nameFor(row, col, 'object');
    const preposition =
      fn === CLUE_TYPES.EXACTLY_K_ROLE_ABOVE_SOMEONE
        ? 'above'
        : fn === CLUE_TYPES.EXACTLY_K_ROLE_BELOW_SOMEONE
        ? 'below'
        : fn === CLUE_TYPES.EXACTLY_K_ROLE_LEFT_OF_SOMEONE
        ? 'to the left of'
        : 'to the right of';
    const verb = beVerb(count);
    return `${verb[0].toUpperCase()}${verb.slice(1)} exactly ${roleAmount(count, role, roleNames)} ${preposition} ${name}.`;
  }

  if (fn === CLUE_TYPES.EXACTLY_K_ROLE_BETWEEN_THE_TWO) {
    if (rest.length !== 6) return fallback;
    const [role, r1Raw, c1Raw, r2Raw, c2Raw, countRaw] = rest;
    const r1 = toNumber(r1Raw);
    const c1 = toNumber(c1Raw);
    const r2 = toNumber(r2Raw);
    const c2 = toNumber(c2Raw);
    const count = toNumber(countRaw);
    if (!Number.isFinite(r1) || !Number.isFinite(c1) || !Number.isFinite(r2) || !Number.isFinite(c2) || !Number.isFinite(count))
      return fallback;
    return `Between ${nameFor(r1, c1, 'object')} and ${nameFor(r2, c2, 'object')}, there ${beVerb(count)} exactly ${roleAmount(count, role, roleNames)}.`;
  }

  if (fn === CLUE_TYPES.ALL_ROLE_IN_ROW_CONNECTED || fn === CLUE_TYPES.ALL_ROLE_IN_COLUMN_CONNECTED) {
    if (rest.length !== 2) return fallback;
    const [role, axisRaw] = rest;
    const axis = toNumber(axisRaw);
    if (!Number.isFinite(axis)) return fallback;
    const target = fn === CLUE_TYPES.ALL_ROLE_IN_ROW_CONNECTED ? 'row' : 'column';
    const plural = rolePlural(role, roleNames);
    return `All ${plural} in ${target} ${axis} stay connected to each other.`;
  }

  if (fn === CLUE_TYPES.HAVE_EQUAL_ROLE_NEIGHBOR) {
    if (rest.length !== 5) return fallback;
    const [role, r1Raw, c1Raw, r2Raw, c2Raw] = rest;
    const r1 = toNumber(r1Raw);
    const c1 = toNumber(c1Raw);
    const r2 = toNumber(r2Raw);
    const c2 = toNumber(c2Raw);
    if (!Number.isFinite(r1) || !Number.isFinite(c1) || !Number.isFinite(r2) || !Number.isFinite(c2)) return fallback;
    return `${nameFor(r1, c1, 'subject')} and ${nameFor(r2, c2, 'subject')} share the same number of ${rolePlural(role, roleNames)} nearby.`;
  }

  if (fn === CLUE_TYPES.HAVE_MORE_ROLE_NEIGHBORS || fn === CLUE_TYPES.HAVE_LESS_ROLE_NEIGHBORS) {
    if (rest.length !== 5) return fallback;
    const [role, r1Raw, c1Raw, r2Raw, c2Raw] = rest;
    const r1 = toNumber(r1Raw);
    const c1 = toNumber(c1Raw);
    const r2 = toNumber(r2Raw);
    const c2 = toNumber(c2Raw);
    if (!Number.isFinite(r1) || !Number.isFinite(c1) || !Number.isFinite(r2) || !Number.isFinite(c2)) return fallback;
    const comparison = fn === CLUE_TYPES.HAVE_MORE_ROLE_NEIGHBORS ? 'more' : 'fewer';
    const subject = nameFor(r1, c1, 'subject');
    const verb = subject === 'I' ? 'have' : 'has';
    return `${subject} ${verb} ${comparison} ${rolePlural(role, roleNames)} nearby than ${nameFor(r2, c2, 'object')}.`;
  }

  if (fn === CLUE_TYPES.BE_ONE_OF_SOMEONES_K_ROLE_NEIGHBORS) {
    if (rest.length !== 6) return fallback;
    const [role, r1Raw, c1Raw, r2Raw, c2Raw, kRaw] = rest;
    const r1 = toNumber(r1Raw);
    const c1 = toNumber(c1Raw);
    const r2 = toNumber(r2Raw);
    const c2 = toNumber(c2Raw);
    const k = toNumber(kRaw);
    if (!Number.isFinite(r1) || !Number.isFinite(c1) || !Number.isFinite(r2) || !Number.isFinite(c2) || !Number.isFinite(k))
      return fallback;
    const subject = nameFor(r1, c1, 'subject');
    const verb = subject === 'I' ? 'am' : 'is';
    return `${subject} ${verb} one of the ${roleAmount(k, role, roleNames)} surrounding ${nameFor(r2, c2, 'object')}.`;
  }

  if (fn === CLUE_TYPES.HAS_EXACT_K_ROLE_NEIGHBOR) {
    if (rest.length !== 4) return fallback;
    const [role, rRaw, cRaw, kRaw] = rest;
    const r = toNumber(rRaw);
    const c = toNumber(cRaw);
    const k = toNumber(kRaw);
    if (!Number.isFinite(r) || !Number.isFinite(c) || !Number.isFinite(k)) return fallback;
    const subject = nameFor(r, c, 'subject');
    const verb = subject === 'I' ? 'have' : 'has';
    return `${subject} ${verb} exactly ${roleAmount(k, role, roleNames)} nearby.`;
  }

  if (
    fn === CLUE_TYPES.K_OF_J_ROLE_TO_THE_LEFT_OF_SOMEONE_IS_ANOTHERS_NEIGHBOR ||
    fn === CLUE_TYPES.K_OF_J_ROLE_TO_THE_RIGHT_OF_SOMEONE_IS_ANOTHERS_NEIGHBOR ||
    fn === CLUE_TYPES.K_OF_J_ROLE_ABOVE_SOMEONE_IS_ANOTHERS_NEIGHBOR ||
    fn === CLUE_TYPES.K_OF_J_ROLE_BELOW_SOMEONE_IS_ANOTHERS_NEIGHBOR
  ) {
    if (rest.length !== 7) return fallback;
    const [role, r1Raw, c1Raw, r2Raw, c2Raw, kRaw, jRaw] = rest;
    const r1 = toNumber(r1Raw);
    const c1 = toNumber(c1Raw);
    const r2 = toNumber(r2Raw);
    const c2 = toNumber(c2Raw);
    const k = toNumber(kRaw);
    const j = toNumber(jRaw);
    if (
      !Number.isFinite(r1) ||
      !Number.isFinite(c1) ||
      !Number.isFinite(r2) ||
      !Number.isFinite(c2) ||
      !Number.isFinite(k) ||
      !Number.isFinite(j)
    )
      return fallback;
    const direction =
      fn === CLUE_TYPES.K_OF_J_ROLE_TO_THE_LEFT_OF_SOMEONE_IS_ANOTHERS_NEIGHBOR
        ? 'to the left of'
        : fn === CLUE_TYPES.K_OF_J_ROLE_TO_THE_RIGHT_OF_SOMEONE_IS_ANOTHERS_NEIGHBOR
        ? 'to the right of'
        : fn === CLUE_TYPES.K_OF_J_ROLE_ABOVE_SOMEONE_IS_ANOTHERS_NEIGHBOR
        ? 'above'
        : 'below';
    return `Of the ${roleAmount(j, role, roleNames)} ${direction} ${nameFor(r1, c1)}, exactly ${roleAmount(k, role, roleNames)} also neighbor ${nameFor(r2, c2)}.`;
  }

  if (fn === CLUE_TYPES.K_OF_J_ROLE_NEIGHBOR_TO_SOMEONE_IS_ANOTHERS_NEIGHBOR) {
    if (rest.length !== 7) return fallback;
    const [role, r1Raw, c1Raw, r2Raw, c2Raw, kRaw, jRaw] = rest;
    const r1 = toNumber(r1Raw);
    const c1 = toNumber(c1Raw);
    const r2 = toNumber(r2Raw);
    const c2 = toNumber(c2Raw);
    const k = toNumber(kRaw);
    const j = toNumber(jRaw);
    if (
      !Number.isFinite(r1) ||
      !Number.isFinite(c1) ||
      !Number.isFinite(r2) ||
      !Number.isFinite(c2) ||
      !Number.isFinite(k) ||
      !Number.isFinite(j)
    )
      return fallback;
    return `Of the ${roleAmount(j, role, roleNames)} neighboring ${nameFor(r1, c1)}, exactly ${roleAmount(k, role, roleNames)} also neighbor ${nameFor(r2, c2)}.`;
  }

  if (fn === CLUE_TYPES.K_OF_J_ROLE_BEFORE_ALPHABET_NAMES || fn === CLUE_TYPES.K_OF_J_ROLE_AFTER_ALPHABET_NAMES) {
    if (rest.length !== 5) return fallback;
    const [role, rRaw, cRaw, kRaw, jRaw] = rest;
    const r = toNumber(rRaw);
    const c = toNumber(cRaw);
    const k = toNumber(kRaw);
    const j = toNumber(jRaw);
    if (!Number.isFinite(r) || !Number.isFinite(c) || !Number.isFinite(k) || !Number.isFinite(j)) return fallback;
    const direction = fn === CLUE_TYPES.K_OF_J_ROLE_BEFORE_ALPHABET_NAMES ? 'come before' : 'come after';
    const verb = beVerb(k);
    const quantity = roleAmount(k, role, roleNames);
    return `Among the ${countLabel(j)} people whose names ${direction} ${nameFor(r, c)} alphabetically, exactly ${quantity} ${verb} among them.`;
  }

  return fallback;
}

function formatOtherRole(row, col, value, getName, roleNames = [VILLAGER, WEREWOLF]) {
  const valueWord = formatRoleName(value, roleNames);
  const name = typeof getName === 'function' ? getName(row, col) : `row ${row} column ${String(col)}`;
  return `${name} is a ${valueWord}.`;
}

function indexToRowCol(idx, cols = COLS) {
  return {
    row: Math.floor(idx / cols) + 1,
    col: (idx % cols) + 1,
  };
}

function normalizeReferencedCells(cells = []) {
  const seen = new Set();
  const refs = [];
  for (const cell of cells) {
    if (!cell) continue;
    const { row, column } = cell;
    if (row == null || column == null) continue;
    const key = `${row},${column}`;
    if (seen.has(key)) continue;
    seen.add(key);
    refs.push({ row, column });
  }
  return refs;
}

function makeNameLookup(characters) {
  const map = new Map();
  if (Array.isArray(characters)) {
    characters.forEach(({ row, column, name }) => {
      if (row != null && column != null && name) {
        map.set(`${row},${column}`, name);
      }
    });
  }
  return (row, col) => map.get(`${row},${col}`) || `row ${row} column ${String(col)}`;
}

function buildAlphabeticalOrder(rows, cols, getName) {
  const entries = [];
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      entries.push({ row: r, column: c, name: getName(r, c) });
    }
  }

  entries.sort((a, b) => {
    const byName = a.name.localeCompare(b.name);
    if (byName !== 0) return byName;
    return a.row === b.row ? a.column - b.column : a.row - b.row;
  });

  const indexMap = new Map();
  entries.forEach((entry, index) => {
    indexMap.set(`${entry.row},${entry.column}`, index);
  });

  return { entries, indexMap };
}

function getNeighbors(row, col, rows = ROWS, cols = COLS) {
  const neighbors = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 1 && nr <= rows && nc >= 1 && nc <= cols) {
        neighbors.push([nr, nc]);
      }
    }
  }
  return neighbors;
}

function cellsInDirection(row, col, direction, rows = ROWS, cols = COLS) {
  const coords = [];
  if (direction === 'left') {
    for (let c = 1; c < col; c++) coords.push([row, c]);
  } else if (direction === 'right') {
    for (let c = col + 1; c <= cols; c++) coords.push([row, c]);
  } else if (direction === 'above') {
    for (let r = 1; r < row; r++) coords.push([r, col]);
  } else if (direction === 'below') {
    for (let r = row + 1; r <= rows; r++) coords.push([r, col]);
  }
  return coords;
}

// Column helpers
export function exactlyKRoleInColumn(roleList, col, k, role, rows = ROWS, cols = COLS) {
  const colVars = [];
  for (let r = 1; r <= rows; r++) {
    colVars.push(roleList[cellIndex(r, col, cols)]);
  }
  return exactlyK(colVars, k, role);
}

export function exactlyKRoleLeftColumn(roleList, col, k, role, rows = ROWS, cols = COLS) {
  const vars = [];
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c < col; c++) {
      vars.push(roleList[cellIndex(r, c, cols)]);
    }
  }
  return exactlyK(vars, k, role);
}

export function exactlyKRoleRightColumn(roleList, col, k, role, rows = ROWS, cols = COLS) {
  const vars = [];
  for (let r = 1; r <= rows; r++) {
    for (let c = col + 1; c <= cols; c++) {
      vars.push(roleList[cellIndex(r, c, cols)]);
    }
  }
  return exactlyK(vars, k, role);
}

export function exactlyKRoleAboveSomeone(roleList, row, col, k, role, rows = ROWS, cols = COLS) {
  const vars = [];
  for (let r = 1; r < row; r++) {
    vars.push(roleList[cellIndex(r, col, cols)]);
  }
  return exactlyK(vars, k, role);
}

export function exactlyKRoleBelowSomeone(roleList, row, col, k, role, rows = ROWS, cols = COLS) {
  const vars = [];
  for (let r = row + 1; r <= rows; r++) {
    vars.push(roleList[cellIndex(r, col, cols)]);
  }
  return exactlyK(vars, k, role);
}

export function exactlyKRoleLeftOfSomeone(roleList, row, col, k, role, rows = ROWS, cols = COLS) {
  const vars = [];
  for (let c = 1; c < col; c++) {
    vars.push(roleList[cellIndex(row, c, cols)]);
  }
  return exactlyK(vars, k, role);
}

export function exactlyKRoleRightOfSomeone(roleList, row, col, k, role, rows = ROWS, cols = COLS) {
  const vars = [];
  for (let c = col + 1; c <= cols; c++) {
    vars.push(roleList[cellIndex(row, c, cols)]);
  }
  return exactlyK(vars, k, role);
}

export function exactlyKRoleBetweenTheTwo(
  roleList,
  r1,
  c1,
  r2,
  c2,
  k,
  role,
  rows = ROWS,
  cols = COLS
) {
  const vars = [];
  if (r1 === r2 && Math.abs(c1 - c2) > 1) {
    const minC = Math.min(c1, c2);
    const maxC = Math.max(c1, c2);
    for (let c = minC + 1; c <= maxC - 1; c++) {
      vars.push(roleList[cellIndex(r1, c, cols)]);
    }
  } else if (c1 === c2 && Math.abs(r1 - r2) > 1) {
    const minR = Math.min(r1, r2);
    const maxR = Math.max(r1, r2);
    for (let r = minR + 1; r <= maxR - 1; r++) {
      vars.push(roleList[cellIndex(r, c1, cols)]);
    }
  } else {
    return logic.fail; // must be same row/col and not adjacent
  }

  return exactlyK(vars, k, role);
}

export function haveEqualRoleNeighbor(roleList, r1, c1, r2, c2, role, rows = ROWS, cols = COLS) {
  if (r1 === r2 && c1 === c2) return logic.fail;

  const neighbors1 = getNeighbors(r1, c1, rows, cols).map(([r, c]) => roleList[cellIndex(r, c, cols)]);
  const neighbors2 = getNeighbors(r2, c2, rows, cols).map(([r, c]) => roleList[cellIndex(r, c, cols)]);
  const maxEqualCount = Math.min(neighbors1.length, neighbors2.length);

  const equalityGoals = [];
  for (let k = 0; k <= maxEqualCount; k++) {
    equalityGoals.push(and(exactlyK(neighbors1, k, role), exactlyK(neighbors2, k, role)));
  }

  return anyOr(equalityGoals);
}

export function haveMoreRoleNeighbors(roleList, r1, c1, r2, c2, role, rows = ROWS, cols = COLS) {
  if (r1 === r2 && c1 === c2) return logic.fail;

  const neighbors1 = getNeighbors(r1, c1, rows, cols).map(([r, c]) => roleList[cellIndex(r, c, cols)]);
  const neighbors2 = getNeighbors(r2, c2, rows, cols).map(([r, c]) => roleList[cellIndex(r, c, cols)]);
  const max1 = neighbors1.length;
  const max2 = neighbors2.length;

  const goals = [];
  for (let k1 = 0; k1 <= max1; k1++) {
    for (let k2 = 0; k2 <= max2; k2++) {
      if (k1 <= k2) continue;
      goals.push(and(exactlyK(neighbors1, k1, role), exactlyK(neighbors2, k2, role)));
    }
  }

  return anyOr(goals);
}

export function haveLessRoleNeighbors(roleList, r1, c1, r2, c2, role, rows = ROWS, cols = COLS) {
  return haveMoreRoleNeighbors(roleList, r2, c2, r1, c1, role, rows, cols);
}

export function beOneOfSomeonesKRoleNeighbors(
  roleList,
  r1,
  c1,
  r2,
  c2,
  k,
  role,
  rows = ROWS,
  cols = COLS
) {
  if (r1 === r2 && c1 === c2) return logic.fail;

  const neighborCoords = getNeighbors(r2, c2, rows, cols);
  const isNeighbor = neighborCoords.some(([nr, nc]) => nr === r1 && nc === c1);
  if (!isNeighbor) return logic.fail;

  const neighborVars = neighborCoords.map(([nr, nc]) => roleList[cellIndex(nr, nc, cols)]);
  const targetVar = roleList[cellIndex(r1, c1, cols)];

  return and(eq(targetVar, role), exactlyK(neighborVars, k, role));
}

export function hasExactKRoleNeighbor(roleList, row, col, k, role, rows = ROWS, cols = COLS) {
  const neighborVars = getNeighbors(row, col, rows, cols).map(([r, c]) => roleList[cellIndex(r, c, cols)]);
  return exactlyK(neighborVars, k, role);
}

function kOfJRoleDirectionalNeighbor(
  roleList,
  r1,
  c1,
  r2,
  c2,
  k,
  j,
  role,
  direction,
  rows = ROWS,
  cols = COLS
) {
  const coords = cellsInDirection(r1, c1, direction, rows, cols);
  if (coords.length === 0 || j > coords.length) return logic.fail;

  const directionVars = coords.map(([r, c]) => roleList[cellIndex(r, c, cols)]);

  const neighborSet = new Set(getNeighbors(r2, c2, rows, cols).map(([r, c]) => `${r},${c}`));
  const intersectionVars = [];
  coords.forEach(([r, c]) => {
    if (neighborSet.has(`${r},${c}`)) {
      intersectionVars.push(roleList[cellIndex(r, c, cols)]);
    }
  });

  return allAnd([exactlyK(directionVars, j, role), exactlyK(intersectionVars, k, role)]);
}

export function kOfJRoleToTheLeftOfSomeoneIsAnothersNeighbor(
  roleList,
  r1,
  c1,
  r2,
  c2,
  k,
  j,
  role,
  rows = ROWS,
  cols = COLS
) {
  return kOfJRoleDirectionalNeighbor(roleList, r1, c1, r2, c2, k, j, role, 'left', rows, cols);
}

export function kOfJRoleToTheRightOfSomeoneIsAnothersNeighbor(
  roleList,
  r1,
  c1,
  r2,
  c2,
  k,
  j,
  role,
  rows = ROWS,
  cols = COLS
) {
  return kOfJRoleDirectionalNeighbor(roleList, r1, c1, r2, c2, k, j, role, 'right', rows, cols);
}

export function kOfJRoleAboveSomeoneIsAnothersNeighbor(
  roleList,
  r1,
  c1,
  r2,
  c2,
  k,
  j,
  role,
  rows = ROWS,
  cols = COLS
) {
  return kOfJRoleDirectionalNeighbor(roleList, r1, c1, r2, c2, k, j, role, 'above', rows, cols);
}

export function kOfJRoleBelowSomeoneIsAnothersNeighbor(
  roleList,
  r1,
  c1,
  r2,
  c2,
  k,
  j,
  role,
  rows = ROWS,
  cols = COLS
) {
  return kOfJRoleDirectionalNeighbor(roleList, r1, c1, r2, c2, k, j, role, 'below', rows, cols);
}

export function kOfJRoleNeighborToSomeoneIsAnothersNeighbor(
  roleList,
  r1,
  c1,
  r2,
  c2,
  k,
  j,
  role,
  rows = ROWS,
  cols = COLS
) {
  const neighbors1 = getNeighbors(r1, c1, rows, cols);
  if (neighbors1.length === 0 || j > neighbors1.length) return logic.fail;

  const neighborVars1 = neighbors1.map(([r, c]) => roleList[cellIndex(r, c, cols)]);

  const neighborSet2 = new Set(getNeighbors(r2, c2, rows, cols).map(([r, c]) => `${r},${c}`));
  const intersectionVars = [];
  neighbors1.forEach(([r, c]) => {
    if (neighborSet2.has(`${r},${c}`)) {
      intersectionVars.push(roleList[cellIndex(r, c, cols)]);
    }
  });

  return allAnd([exactlyK(neighborVars1, j, role), exactlyK(intersectionVars, k, role)]);
}

export function kOfJRoleBeforeAlphabetNames(
  roleList,
  alphabeticalOrder,
  row,
  col,
  k,
  j,
  role,
  cols = COLS
) {
  const idx = alphabeticalOrder.indexMap.get(`${row},${col}`);
  if (idx == null) return logic.fail;
  const before = alphabeticalOrder.entries.slice(0, idx);
  if (before.length !== j || j === 0 || k === 0) return logic.fail;
  const vars = before.map(({ row: r, column: c }) => roleList[cellIndex(r, c, cols)]);
  return exactlyK(vars, k, role);
}

export function kOfJRoleAfterAlphabetNames(
  roleList,
  alphabeticalOrder,
  row,
  col,
  k,
  j,
  role,
  cols = COLS
) {
  const idx = alphabeticalOrder.indexMap.get(`${row},${col}`);
  if (idx == null) return logic.fail;
  const after = alphabeticalOrder.entries.slice(idx + 1);
  if (after.length !== j || j === 0 || k === 0) return logic.fail;
  const vars = after.map(({ row: r, column: c }) => roleList[cellIndex(r, c, cols)]);
  return exactlyK(vars, k, role);
}

export function allRoleConnectedInRow(roleList, row, role, cols = COLS) {
  const complement = role === VILLAGER ? WEREWOLF : VILLAGER;
  const start = cellIndex(row, 1, cols);
  const rowVars = roleList.slice(start, start + cols);
  const goals = [];

  // no occurrence of role
  goals.push(allAnd(rowVars.map(v => eq(v, complement))));

  // contiguous segment of role
  for (let s = 0; s < cols; s++) {
    for (let e = s; e < cols; e++) {
      const before = rowVars.slice(0, s).map(v => eq(v, complement));
      const inside = rowVars.slice(s, e + 1).map(v => eq(v, role));
      const after = rowVars.slice(e + 1).map(v => eq(v, complement));
      goals.push(allAnd([...before, ...inside, ...after]));
    }
  }

  return anyOr(goals);
}

export function allRoleConnectedInColumn(roleList, col, role, rows = ROWS, cols = COLS) {
  const complement = role === VILLAGER ? WEREWOLF : VILLAGER;
  const colVars = [];
  for (let r = 1; r <= rows; r++) {
    colVars.push(roleList[cellIndex(r, col, cols)]);
  }

  const goals = [];
  goals.push(allAnd(colVars.map(v => eq(v, complement))));

  for (let s = 0; s < rows; s++) {
    for (let e = s; e < rows; e++) {
      const before = colVars.slice(0, s).map(v => eq(v, complement));
      const inside = colVars.slice(s, e + 1).map(v => eq(v, role));
      const after = colVars.slice(e + 1).map(v => eq(v, complement));
      goals.push(allAnd([...before, ...inside, ...after]));
    }
  }

  return anyOr(goals);
}

function deducedCellsFromSolutions(solutions) {
  const deduced = new Map();
  if (solutions.length === 0) return deduced;

  const totalCells = solutions[0].length;
  for (let i = 0; i < totalCells; i++) {
    const values = new Set(solutions.map(sol => sol[i]));
    if (values.size === 1) {
      deduced.set(i, solutions[0][i]);
    }
  }
  return deduced;
}

function buildClueTemplates(targetSolution, roles, rows, cols, getName, roleNames = [VILLAGER, WEREWOLF]) {
  const clues = [];
  const alphabeticalOrder = buildAlphabeticalOrder(rows, cols, getName);
  const clueWithParts = ({ key, goal, parts, referencedCells = [] }) => ({
    key,
    goal,
    clueParts: parts,
    statement: formatClue(parts, getName, roleNames),
    referencedCells,
  });

  for (let r = 1; r <= rows; r++) {
    const start = cellIndex(r, 1, cols);
    const slice = targetSolution.slice(start, start + cols);
    const werewolfCount = slice.filter(v => v === WEREWOLF).length;
    const villagerCount = cols - werewolfCount;
    const aboveSlice = targetSolution.slice(0, start);
    const werewolfAbove = aboveSlice.filter(v => v === WEREWOLF).length;
    const villagerAbove = aboveSlice.length - werewolfAbove;
    const belowSlice = targetSolution.slice(start + cols);
    const werewolfBelow = belowSlice.filter(v => v === WEREWOLF).length;
    const villagerBelow = belowSlice.length - werewolfBelow;

    [
      { role: WEREWOLF, count: werewolfCount },
      { role: VILLAGER, count: villagerCount },
    ].forEach(({ role, count }) => {
      const parts = [CLUE_TYPES.EXACTLY_K_ROLE_IN_ROW, role, r, count];
      clues.push(
        clueWithParts({
          key: `row-${r}-${role}-${count}`,
          goal: exactlyKRoleInRow(roles, r, count, role, cols),
          parts,
        })
      );
    });
    [
      { role: WEREWOLF, count: werewolfAbove, keyPrefix: 'above' },
      { role: VILLAGER, count: villagerAbove, keyPrefix: 'above' },
      { role: WEREWOLF, count: werewolfBelow, keyPrefix: 'below' },
      { role: VILLAGER, count: villagerBelow, keyPrefix: 'below' },
    ].forEach(({ role, count, keyPrefix }) => {
      const builder =
        keyPrefix === 'above'
          ? {
              key: `row-${r}-above-${role}-${count}`,
              goal: exactlyRoleAboveRow(roles, r, count, role, cols),
              parts: [CLUE_TYPES.EXACTLY_ROLE_ABOVE_ROW, role, r, count],
            }
          : {
              key: `row-${r}-below-${role}-${count}`,
              goal: exactlyRoleBelowRow(roles, r, count, role, rows, cols),
              parts: [CLUE_TYPES.EXACTLY_ROLE_BELOW_ROW, role, r, count],
            };
      clues.push(clueWithParts({ ...builder }));
    });

    [
      { role: WEREWOLF },
      { role: VILLAGER },
    ].forEach(({ role }) => {
      const parts = [CLUE_TYPES.ALL_ROLE_IN_ROW_CONNECTED, role, r];
      clues.push(
        clueWithParts({
          key: `row-${r}-connected-${role}`,
          goal: allRoleConnectedInRow(roles, r, role, cols),
          parts,
        })
      );
    });
  }

  for (let c = 1; c <= cols; c++) {
    const colSlice = [];
    for (let r = 1; r <= rows; r++) {
      colSlice.push(targetSolution[cellIndex(r, c, cols)]);
    }
    const werewolfCount = colSlice.filter(v => v === WEREWOLF).length;
    const villagerCount = rows - werewolfCount;
    const leftSlice = [];
    const rightSlice = [];
    for (let r = 1; r <= rows; r++) {
      for (let col = 1; col < c; col++) {
        leftSlice.push(targetSolution[cellIndex(r, col, cols)]);
      }
      for (let col = c + 1; col <= cols; col++) {
        rightSlice.push(targetSolution[cellIndex(r, col, cols)]);
      }
    }
    const werewolfLeft = leftSlice.filter(v => v === WEREWOLF).length;
    const villagerLeft = leftSlice.length - werewolfLeft;
    const werewolfRight = rightSlice.filter(v => v === WEREWOLF).length;
    const villagerRight = rightSlice.length - werewolfRight;

    [
      { role: WEREWOLF, count: werewolfCount },
      { role: VILLAGER, count: villagerCount },
    ].forEach(({ role, count }) => {
      const parts = [CLUE_TYPES.EXACTLY_K_ROLE_IN_COLUMN, role, c, count];
      clues.push(
        clueWithParts({
          key: `col-${c}-${role}-${count}`,
          goal: exactlyKRoleInColumn(roles, c, count, role, rows, cols),
          parts,
        })
      );
    });
    [
      { role: WEREWOLF },
      { role: VILLAGER },
    ].forEach(({ role }) => {
      const parts = [CLUE_TYPES.ALL_ROLE_IN_COLUMN_CONNECTED, role, c];
      clues.push(
        clueWithParts({
          key: `col-${c}-connected-${role}`,
          goal: allRoleConnectedInColumn(roles, c, role, rows, cols),
          parts,
        })
      );
    });
    [
      { role: WEREWOLF, count: werewolfLeft, keyPrefix: 'left' },
      { role: VILLAGER, count: villagerLeft, keyPrefix: 'left' },
      { role: WEREWOLF, count: werewolfRight, keyPrefix: 'right' },
      { role: VILLAGER, count: villagerRight, keyPrefix: 'right' },
    ].forEach(({ role, count, keyPrefix }) => {
      const builder =
        keyPrefix === 'left'
          ? {
              key: `col-${c}-left-${role}-${count}`,
              goal: exactlyKRoleLeftColumn(roles, c, count, role, rows, cols),
              parts: [CLUE_TYPES.EXACTLY_K_ROLE_LEFT_COLUMN, role, c, count],
            }
          : {
              key: `col-${c}-right-${role}-${count}`,
              goal: exactlyKRoleRightColumn(roles, c, count, role, rows, cols),
              parts: [CLUE_TYPES.EXACTLY_K_ROLE_RIGHT_COLUMN, role, c, count],
            };
      clues.push(clueWithParts({ ...builder }));
    });
  }

  // Per-character relative clues
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      const aboveVals = [];
      const belowVals = [];
      const leftVals = [];
      const rightVals = [];
      const betweenPairs = [];
      const neighborVals = getNeighbors(r, c, rows, cols).map(([nr, nc]) =>
        targetSolution[cellIndex(nr, nc, cols)]
      );

      for (let rr = 1; rr < r; rr++) aboveVals.push(targetSolution[cellIndex(rr, c, cols)]);
      for (let rr = r + 1; rr <= rows; rr++) belowVals.push(targetSolution[cellIndex(rr, c, cols)]);
      for (let cc = 1; cc < c; cc++) leftVals.push(targetSolution[cellIndex(r, cc, cols)]);
      for (let cc = c + 1; cc <= cols; cc++) rightVals.push(targetSolution[cellIndex(r, cc, cols)]);
      // gather pairs in same row/col with at least one cell between
      for (let cc = c + 2; cc <= cols; cc++) {
        betweenPairs.push({ r1: r, c1: c, r2: r, c2: cc });
      }
      for (let rr = r + 2; rr <= rows; rr++) {
        betweenPairs.push({ r1: r, c1: c, r2: rr, c2: c });
      }

      const directional = [
        {
          dir: 'above',
          vals: aboveVals,
          fn: exactlyKRoleAboveSomeone,
          keyPrefix: 'above',
          formatter: role => [CLUE_TYPES.EXACTLY_K_ROLE_ABOVE_SOMEONE, role, r, c],
        },
        {
          dir: 'below',
          vals: belowVals,
          fn: exactlyKRoleBelowSomeone,
          keyPrefix: 'below',
          formatter: role => [CLUE_TYPES.EXACTLY_K_ROLE_BELOW_SOMEONE, role, r, c],
        },
        {
          dir: 'left',
          vals: leftVals,
          fn: exactlyKRoleLeftOfSomeone,
          keyPrefix: 'left-of',
          formatter: role => [CLUE_TYPES.EXACTLY_K_ROLE_LEFT_OF_SOMEONE, role, r, c],
        },
        {
          dir: 'right',
          vals: rightVals,
          fn: exactlyKRoleRightOfSomeone,
          keyPrefix: 'right-of',
          formatter: role => [CLUE_TYPES.EXACTLY_K_ROLE_RIGHT_OF_SOMEONE, role, r, c],
        },
      ];

      directional.forEach(({ vals, fn, keyPrefix, formatter }) => {
        if (vals.length === 0) return;
        const werewolfCount = vals.filter(v => v === WEREWOLF).length;
        const villagerCount = vals.length - werewolfCount;
        [
          { role: WEREWOLF, count: werewolfCount },
          { role: VILLAGER, count: villagerCount },
        ].forEach(({ role, count }) => {
          const parts = [...formatter(role), count];
          clues.push(
            clueWithParts({
              key: `cell-${r}-${c}-${keyPrefix}-${role}-${count}`,
              goal: fn(roles, r, c, count, role, rows, cols),
              parts,
              referencedCells: normalizeReferencedCells([{ row: r, column: c }]),
            })
          );
        });
      });

      const alphaIndex = alphabeticalOrder.indexMap.get(`${r},${c}`);
      const beforeAlpha = typeof alphaIndex === 'number' ? alphabeticalOrder.entries.slice(0, alphaIndex) : [];
      const afterAlpha = typeof alphaIndex === 'number' ? alphabeticalOrder.entries.slice(alphaIndex + 1) : [];
    const alphabeticalSpecs = [
      {
        entries: beforeAlpha,
        fn: kOfJRoleBeforeAlphabetNames,
        formatter: role => [CLUE_TYPES.K_OF_J_ROLE_BEFORE_ALPHABET_NAMES, role, r, c],
        keyPrefix: 'alphabet-before',
      },
      {
        entries: afterAlpha,
        fn: kOfJRoleAfterAlphabetNames,
        formatter: role => [CLUE_TYPES.K_OF_J_ROLE_AFTER_ALPHABET_NAMES, role, r, c],
        keyPrefix: 'alphabet-after',
      },
    ];

      alphabeticalSpecs.forEach(({ entries, fn, formatter, keyPrefix }) => {
        if (!entries || entries.length === 0) return;
        const j = entries.length;
        const werewolfCount = entries.filter(({ row: rr, column: cc }) => targetSolution[cellIndex(rr, cc, cols)] === WEREWOLF).length;
        const villagerCount = j - werewolfCount;
        [
          { role: WEREWOLF, count: werewolfCount },
          { role: VILLAGER, count: villagerCount },
        ].forEach(({ role, count }) => {
          if (count === 0) return;
          const parts = [...formatter(role), count, j];
          clues.push(
            clueWithParts({
              key: `${keyPrefix}-${r}-${c}-${role}-${count}-of-${j}`,
              goal: fn(roles, alphabeticalOrder, r, c, count, j, role, cols),
              parts,
              referencedCells: normalizeReferencedCells([
                { row: r, column: c },
                ...entries.map(({ row: rr, column: cc }) => ({ row: rr, column: cc })),
              ]),
            })
          );
        });
      });

      // Exact neighbor counts for this character
      if (neighborVals.length > 0) {
        const werewolfNeighbors = neighborVals.filter(v => v === WEREWOLF).length;
        const villagerNeighbors = neighborVals.length - werewolfNeighbors;
        [
          { role: WEREWOLF, count: werewolfNeighbors },
          { role: VILLAGER, count: villagerNeighbors },
        ].forEach(({ role, count }) => {
          const key = `neighbor-count-${r}-${c}-${role}-${count}`;
          const parts = [CLUE_TYPES.HAS_EXACT_K_ROLE_NEIGHBOR, role, r, c, count];
          clues.push(
            clueWithParts({
              key,
              goal: hasExactKRoleNeighbor(roles, r, c, count, role, rows, cols),
              parts,
              referencedCells: normalizeReferencedCells([{ row: r, column: c }]),
            })
          );
        });
      }

      // Between-two clues
      betweenPairs.forEach(({ r1, c1, r2, c2 }) => {
        const cellsBetween = [];
        if (r1 === r2) {
          const minC = Math.min(c1, c2);
          const maxC = Math.max(c1, c2);
          for (let cc = minC + 1; cc <= maxC - 1; cc++) {
            cellsBetween.push(targetSolution[cellIndex(r1, cc, cols)]);
          }
        } else if (c1 === c2) {
          const minR = Math.min(r1, r2);
          const maxR = Math.max(r1, r2);
          for (let rr = minR + 1; rr <= maxR - 1; rr++) {
            cellsBetween.push(targetSolution[cellIndex(rr, c1, cols)]);
          }
        }
        if (cellsBetween.length === 0) return;
        const werewolfBetween = cellsBetween.filter(v => v === WEREWOLF).length;
        const villagerBetween = cellsBetween.length - werewolfBetween;
        [
          { role: WEREWOLF, count: werewolfBetween },
          { role: VILLAGER, count: villagerBetween },
        ].forEach(({ role, count }) => {
          const key = `between-${r1}-${c1}-${r2}-${c2}-${role}-${count}`;
          const parts = [CLUE_TYPES.EXACTLY_K_ROLE_BETWEEN_THE_TWO, role, r1, c1, r2, c2, count];
          clues.push(
            clueWithParts({
              key,
              goal: exactlyKRoleBetweenTheTwo(roles, r1, c1, r2, c2, count, role, rows, cols),
              parts,
              referencedCells: normalizeReferencedCells([
                { row: r1, column: c1 },
                { row: r2, column: c2 },
              ]),
            })
          );
        });
      });
    }
  }

  // Equal neighbor count clues (villager/werewolf) between pairs of characters
  for (let r1 = 1; r1 <= rows; r1++) {
    for (let c1 = 1; c1 <= cols; c1++) {
      const neighbors1 = getNeighbors(r1, c1, rows, cols).map(([r, c]) =>
        targetSolution[cellIndex(r, c, cols)]
      );
      const werewolfNeighbors1 = neighbors1.filter(v => v === WEREWOLF).length;
      const villagerNeighbors1 = neighbors1.length - werewolfNeighbors1;

      for (let r2 = r1; r2 <= rows; r2++) {
        const startC = r2 === r1 ? c1 + 1 : 1;
        for (let c2 = startC; c2 <= cols; c2++) {
          const neighbors2 = getNeighbors(r2, c2, rows, cols).map(([r, c]) =>
            targetSolution[cellIndex(r, c, cols)]
          );
          const werewolfNeighbors2 = neighbors2.filter(v => v === WEREWOLF).length;
          const villagerNeighbors2 = neighbors2.length - werewolfNeighbors2;

          [
            { role: WEREWOLF, count1: werewolfNeighbors1, count2: werewolfNeighbors2 },
            { role: VILLAGER, count1: villagerNeighbors1, count2: villagerNeighbors2 },
          ].forEach(({ role, count1, count2 }) => {
            if (count1 !== count2) return;
            const key = `equal-neighbors-${r1}-${c1}-${r2}-${c2}-${role}-${count1}`;
            const parts = [CLUE_TYPES.HAVE_EQUAL_ROLE_NEIGHBOR, role, r1, c1, r2, c2];
            clues.push(
              clueWithParts({
                key,
                goal: haveEqualRoleNeighbor(roles, r1, c1, r2, c2, role, rows, cols),
                parts,
                referencedCells: normalizeReferencedCells([
                  { row: r1, column: c1 },
                  { row: r2, column: c2 },
                ]),
              })
            );
          });

          [
            { role: WEREWOLF, count1: werewolfNeighbors1, count2: werewolfNeighbors2 },
            { role: VILLAGER, count1: villagerNeighbors1, count2: villagerNeighbors2 },
          ].forEach(({ role, count1, count2 }) => {
            if (count1 > count2) {
              const key = `more-neighbors-${r1}-${c1}-${r2}-${c2}-${role}-${count1}-${count2}`;
              const parts = [CLUE_TYPES.HAVE_MORE_ROLE_NEIGHBORS, role, r1, c1, r2, c2];
              clues.push(
                clueWithParts({
                  key,
                  goal: haveMoreRoleNeighbors(roles, r1, c1, r2, c2, role, rows, cols),
                  parts,
                  referencedCells: normalizeReferencedCells([
                    { row: r1, column: c1 },
                    { row: r2, column: c2 },
                  ]),
                })
              );
            } else if (count1 < count2) {
              const key = `less-neighbors-${r1}-${c1}-${r2}-${c2}-${role}-${count1}-${count2}`;
              const parts = [CLUE_TYPES.HAVE_LESS_ROLE_NEIGHBORS, role, r1, c1, r2, c2];
              clues.push(
                clueWithParts({
                  key,
                  goal: haveLessRoleNeighbors(roles, r1, c1, r2, c2, role, rows, cols),
                  parts,
                  referencedCells: normalizeReferencedCells([
                    { row: r1, column: c1 },
                    { row: r2, column: c2 },
                  ]),
                })
              );
            }
          });

          // A is one of B's k role neighbors
          [
            { role: WEREWOLF, count: werewolfNeighbors2 },
            { role: VILLAGER, count: villagerNeighbors2 },
          ].forEach(({ role, count }) => {
            if (count === 0) return;
            const r1c1IsNeighbor =
              getNeighbors(r2, c2, rows, cols).some(([nr, nc]) => nr === r1 && nc === c1);
            if (!r1c1IsNeighbor) return;
            const cellRole = targetSolution[cellIndex(r1, c1, cols)];
            if (cellRole !== role) return;
            const key = `one-of-neighbors-${r1}-${c1}-${r2}-${c2}-${role}-${count}`;
            const parts = [CLUE_TYPES.BE_ONE_OF_SOMEONES_K_ROLE_NEIGHBORS, role, r1, c1, r2, c2, count];
            clues.push(
              clueWithParts({
                key,
                goal: beOneOfSomeonesKRoleNeighbors(roles, r1, c1, r2, c2, count, role, rows, cols),
                parts,
                referencedCells: normalizeReferencedCells([
                  { row: r1, column: c1 },
                  { row: r2, column: c2 },
                ]),
              })
            );
          });

          // K of J role in a direction from (r1,c1) are neighbors of (r2,c2)
          const dirSpecs = [
            {
              dir: 'left',
              fn: kOfJRoleToTheLeftOfSomeoneIsAnothersNeighbor,
              formatter: role =>
                [CLUE_TYPES.K_OF_J_ROLE_TO_THE_LEFT_OF_SOMEONE_IS_ANOTHERS_NEIGHBOR, role, r1, c1, r2, c2],
              keyPrefix: 'k-of-j-left',
            },
            {
              dir: 'right',
              fn: kOfJRoleToTheRightOfSomeoneIsAnothersNeighbor,
              formatter: role =>
                [CLUE_TYPES.K_OF_J_ROLE_TO_THE_RIGHT_OF_SOMEONE_IS_ANOTHERS_NEIGHBOR, role, r1, c1, r2, c2],
              keyPrefix: 'k-of-j-right',
            },
            {
              dir: 'above',
              fn: kOfJRoleAboveSomeoneIsAnothersNeighbor,
              formatter: role =>
                [CLUE_TYPES.K_OF_J_ROLE_ABOVE_SOMEONE_IS_ANOTHERS_NEIGHBOR, role, r1, c1, r2, c2],
              keyPrefix: 'k-of-j-above',
            },
            {
              dir: 'below',
              fn: kOfJRoleBelowSomeoneIsAnothersNeighbor,
              formatter: role =>
                [CLUE_TYPES.K_OF_J_ROLE_BELOW_SOMEONE_IS_ANOTHERS_NEIGHBOR, role, r1, c1, r2, c2],
              keyPrefix: 'k-of-j-below',
            },
          ];

          dirSpecs.forEach(({ dir, fn, formatter, keyPrefix }) => {
            const directionalCoords = cellsInDirection(r1, c1, dir, rows, cols);
            if (directionalCoords.length === 0) return;
            const directionalValues = directionalCoords.map(([r, c]) => targetSolution[cellIndex(r, c, cols)]);

            const neighborSet = new Set(getNeighbors(r2, c2, rows, cols).map(([r, c]) => `${r},${c}`));
            const intersectionValues = directionalCoords
              .filter(([r, c]) => neighborSet.has(`${r},${c}`))
              .map(([r, c]) => targetSolution[cellIndex(r, c, cols)]);

            [
              { role: WEREWOLF },
              { role: VILLAGER },
            ].forEach(({ role }) => {
              const j = directionalValues.filter(v => v === role).length;
              if (j === 0) return;
              const k = intersectionValues.filter(v => v === role).length;
              if (k === 0) return;
              const parts = [...formatter(role), k, j];
              clues.push(
                clueWithParts({
                  key: `${keyPrefix}-${r1}-${c1}-${r2}-${c2}-${role}-${k}-${j}`,
                  goal: fn(roles, r1, c1, r2, c2, k, j, role, rows, cols),
                  parts,
                  referencedCells: normalizeReferencedCells([
                    { row: r1, column: c1 },
                    { row: r2, column: c2 },
                  ]),
                })
              );
            });
          });

          // K of J role neighbors of (r1,c1) are also neighbors of (r2,c2)
          const neighbors1 = getNeighbors(r1, c1, rows, cols);
          if (neighbors1.length > 0) {
            const neighborValues1 = neighbors1.map(([r, c]) => targetSolution[cellIndex(r, c, cols)]);

            const neighborSet2 = new Set(getNeighbors(r2, c2, rows, cols).map(([r, c]) => `${r},${c}`));
            const intersectionValues = neighbors1
              .filter(([r, c]) => neighborSet2.has(`${r},${c}`))
              .map(([r, c]) => targetSolution[cellIndex(r, c, cols)]);

            [
              { role: WEREWOLF },
              { role: VILLAGER },
            ].forEach(({ role }) => {
              const j = neighborValues1.filter(v => v === role).length;
              if (j === 0) return;
              const k = intersectionValues.filter(v => v === role).length;
              if (k === 0) return;
              const parts = [
                CLUE_TYPES.K_OF_J_ROLE_NEIGHBOR_TO_SOMEONE_IS_ANOTHERS_NEIGHBOR,
                role,
                r1,
                c1,
                r2,
                c2,
                k,
                j,
              ];
              clues.push(
                clueWithParts({
                  key: `k-of-j-neighbor-${r1}-${c1}-${r2}-${c2}-${role}-${k}-${j}`,
                  goal: kOfJRoleNeighborToSomeoneIsAnothersNeighbor(roles, r1, c1, r2, c2, k, j, role, rows, cols),
                  parts,
                  referencedCells: normalizeReferencedCells([
                    { row: r1, column: c1 },
                    { row: r2, column: c2 },
                  ]),
                })
              );
            });
          }
      }
      }
    }
  }

  return clues;
}

// Puzzle generator:
//   - Returns an array of steps: [{ row, column, role, statement }, ...]
//   - Starts with a single revealed cell.
//   - Iteratively adds one clue at a time (drawn from a template) that makes
//     exactly one new cell become deducible across all valid solutions.
//   - Falls back to a direct reveal if no template clue can yield a single
//     deterministic deduction.
export function generatePuzzle(rows = ROWS, cols = COLS, characters, roleNames = [VILLAGER, WEREWOLF]) {
  const normalizedRoles =
    Array.isArray(roleNames) && roleNames.length >= 2 ? [roleNames[0], roleNames[1]] : [VILLAGER, WEREWOLF];
  setRoleNames(normalizedRoles);
  const activeRoles = [VILLAGER, WEREWOLF];
  const maxNewDeductions = 2;
  const roles = makeRoleGrid(rows, cols);
  const targetSolution = Array.from({ length: rows * cols }, () =>
    Math.random() < 0.5 ? VILLAGER : WEREWOLF
  );

  const nameLookup = makeNameLookup(characters);

  const clueTemplates = shuffle(buildClueTemplates(targetSolution, roles, rows, cols, nameLookup, activeRoles));
  const usedClueKeys = new Set();

  // Pick an initial revealed character (their role is known).
  const initialIdx = randInt(rows * cols);
  const initialGoal = eq(roles[initialIdx], targetSolution[initialIdx]);

  const goals = [everyoneBinary(roles), initialGoal];
  let solutions = run(and(...goals), roles);
  let deduced = deducedCellsFromSolutions(solutions);

  let currentSpeakerIdx = initialIdx;
  const puzzle = [];
  const coveredSpeakerIdxs = new Set();
  // Track which cells become newly deducible after each added statement.
  let newlyDeducible = [];

  const maxSteps = rows * cols * 6;
  let steps = 0;

  while (deduced.size < rows * cols && steps < maxSteps) {
    steps++;
    let added = false;
    let nextIdx = -1;
    let nextSolutions = solutions;
    let nextDeductions = deduced;
    let nextStatement = '';
    let nextClueParts = null;
    let nextReferencedCells = [];

    // Try to find a clue that yields at most the maxNewDeductions (prefer fewer new deductions, but > 0).
    newlyDeducible = [];
    let bestCandidate = null;
    for (const clue of clueTemplates) {
      if (usedClueKeys.has(clue.key)) continue;

      const candidateGoal = and(...goals, clue.goal);
      const candidateSolutions = run(candidateGoal, roles);
      if (candidateSolutions.length === 0) continue;

      const candidateDeductions = deducedCellsFromSolutions(candidateSolutions);
      const newDeductions = [];
      for (const [idx, value] of candidateDeductions.entries()) {
        if (!deduced.has(idx)) newDeductions.push([idx, value]);
      }

      const acceptable =
        newDeductions.length > 0 &&
        newDeductions.length <= maxNewDeductions &&
        newDeductions.every(([idx]) => idx !== currentSpeakerIdx);
      if (!acceptable) continue;

      // Prefer clues that yield the smallest positive number of new deductions.
      if (newDeductions.length === 1) {
        const [newIdx, newValue] = newDeductions[0];
        const eqGoal = eq(roles[newIdx], newValue);
        const updatedGoals = [...goals, eqGoal];
        const updatedSolutions = run(and(...updatedGoals), roles);
        const updatedDeductions = deducedCellsFromSolutions(updatedSolutions);
        const updatedNewDeductions = [];
        for (const [idx, value] of updatedDeductions.entries()) {
          if (!deduced.has(idx)) updatedNewDeductions.push([idx, value]);
        }
        nextIdx = newIdx;
        nextSolutions = updatedSolutions;
        nextDeductions = updatedDeductions;
        nextStatement = clue.statement;
        nextClueParts = clue.clueParts || null;
        nextReferencedCells = clue.referencedCells || [];
        newlyDeducible = updatedNewDeductions;

        goals.push(eqGoal);
        usedClueKeys.add(clue.key);
        added = true;
        break;
      }

      // Track the best acceptable candidate with the fewest new deductions so far.
      const [newIdx] = newDeductions[0];
      if (!bestCandidate || newDeductions.length < bestCandidate.newCount) {
        bestCandidate = {
          newIdx,
          newCount: newDeductions.length,
          candidateSolutions,
          candidateDeductions,
          statement: clue.statement,
          clueParts: clue.clueParts || null,
          goal: clue.goal,
          clueKey: clue.key,
          newDeductions,
          referencedCells: clue.referencedCells || [],
        };
      }
    }

    if (!added && bestCandidate) {
      nextIdx = bestCandidate.newIdx;
      nextSolutions = bestCandidate.candidateSolutions;
      nextDeductions = bestCandidate.candidateDeductions;
      nextStatement = bestCandidate.statement;
      nextClueParts = bestCandidate.clueParts || null;
      nextReferencedCells = bestCandidate.referencedCells || [];
      newlyDeducible = bestCandidate.newDeductions;

      goals.push(bestCandidate.goal);
      usedClueKeys.add(bestCandidate.clueKey);
      added = true;
    }

    // If no template clue works, have the current speaker reveal another character directly.
    if (!added) {
      const unresolved = [];
      for (let i = 0; i < rows * cols; i++) {
        if (!deduced.has(i) && i !== currentSpeakerIdx) unresolved.push(i);
      }

      if (unresolved.length === 0) break;

      const revealIdxFallback = unresolved[randInt(unresolved.length)];
      const fallbackGoal = eq(roles[revealIdxFallback], targetSolution[revealIdxFallback]);
      const candidateGoal = and(...goals, fallbackGoal);
      const candidateSolutions = run(candidateGoal, roles);
      const candidateDeductions = deducedCellsFromSolutions(candidateSolutions);
      const newDeductions = [];
      for (const [idx, value] of candidateDeductions.entries()) {
        if (!deduced.has(idx)) newDeductions.push([idx, value]);
      }

      const acceptable = newDeductions.length > 0 && newDeductions.every(([idx]) => idx !== currentSpeakerIdx);

      if (acceptable) {
        const [newIdx, value] = newDeductions[0];
        const { row, col } = indexToRowCol(newIdx, cols);
        nextIdx = newIdx;
        nextSolutions = candidateSolutions;
        nextDeductions = candidateDeductions;
        nextStatement = formatOtherRole(row, col, value, nameLookup, activeRoles);
        nextReferencedCells = normalizeReferencedCells([{ row, column: col }]);
        newlyDeducible = newDeductions;

        goals.push(fallbackGoal);
        added = true;
      } else {
        break;
      }
    }

    if (!added) break;

    // Record the current speaker's statement (about another character).
    const { row: speakerRow, col: speakerCol } = indexToRowCol(currentSpeakerIdx, cols);
    const speakerName = nameLookup(speakerRow, speakerCol);
    const deductableCells = newlyDeducible.map(([idx, value]) => {
      const { row, col } = indexToRowCol(idx, cols);
      return { row, column: col, role: value };
    });
    const renderedStatement = nextClueParts
      ? formatClue(nextClueParts, nameLookup, activeRoles, { speakerName })
      : nextStatement;
    puzzle.push({
      row: speakerRow,
      column: speakerCol,
      role: targetSolution[currentSpeakerIdx],
      statement: renderedStatement,
      parts: nextClueParts || [],
      referencedCells: normalizeReferencedCells(nextReferencedCells),
      deductableCells,
    });
    coveredSpeakerIdxs.add(currentSpeakerIdx);

    solutions = nextSolutions;
    deduced = nextDeductions;
    currentSpeakerIdx = nextIdx;
  }

  // Add a final truthful statement from an unused clue template, spoken by the last revealed character.
  if (deduced.size === rows * cols) {
    const { row: speakerRow, col: speakerCol } = indexToRowCol(currentSpeakerIdx, cols);
    const unusedClues = clueTemplates.filter(clue => !usedClueKeys.has(clue.key));
    let finalStatement = '';
    let finalClueParts = null;
    let finalReferencedCells = [];

    if (unusedClues.length > 0) {
      const picked = unusedClues[randInt(unusedClues.length)];
      finalStatement = picked.statement;
      finalClueParts = picked.clueParts || null;
      finalReferencedCells = picked.referencedCells || [];
      usedClueKeys.add(picked.key);
    }

    if (!finalStatement) {
      // Fallback: direct truth about another character if somehow all clues were used.
      const others = [];
      for (let i = 0; i < rows * cols; i++) {
        if (i !== currentSpeakerIdx) others.push(i);
      }
      if (others.length > 0) {
        const targetIdx = others[0];
        const { row: tgtRow, col: tgtCol } = indexToRowCol(targetIdx, cols);
        finalStatement = formatOtherRole(tgtRow, tgtCol, targetSolution[targetIdx], nameLookup, activeRoles);
        finalReferencedCells = normalizeReferencedCells([{ row: tgtRow, column: tgtCol }]);
      }
    }

    if (finalStatement) {
      const speakerName = nameLookup(speakerRow, speakerCol);
      const renderedFinalStatement = finalClueParts
        ? formatClue(finalClueParts, nameLookup, activeRoles, { speakerName })
        : finalStatement;
      puzzle.push({
        row: speakerRow,
        column: speakerCol,
        role: targetSolution[currentSpeakerIdx],
        statement: renderedFinalStatement,
        parts: finalClueParts || [],
        referencedCells: normalizeReferencedCells(finalReferencedCells),
        deductableCells: [],
      });
      coveredSpeakerIdxs.add(currentSpeakerIdx);
    }
  }

  // Ensure we always have at least one entry per cell by revealing any missing speakers directly.
  for (let i = 0; i < rows * cols && puzzle.length < rows * cols; i++) {
    if (coveredSpeakerIdxs.has(i)) continue;
    const { row, col } = indexToRowCol(i, cols);
    puzzle.push({
      row,
      column: col,
      role: targetSolution[i],
      statement: formatOtherRole(row, col, targetSolution[i], nameLookup, activeRoles),
      referencedCells: normalizeReferencedCells([{ row, column: col }]),
      deductableCells: [],
    });
  }

  return puzzle;
}

export function generateGame(rows = ROWS, cols = COLS, roleNames = [VILLAGER, WEREWOLF]) {
  const normalizedRoles =
    Array.isArray(roleNames) && roleNames.length >= 2 ? [roleNames[0], roleNames[1]] : [VILLAGER, WEREWOLF];
  setRoleNames(normalizedRoles);
  const activeRoles = [VILLAGER, WEREWOLF];
  const total = rows * cols;

  const maleCount = Math.floor(total / 2);
  const femaleCount = total - maleCount;

  const malePool = shuffle(MALE_NAMES.slice());
  const femalePool = shuffle(FEMALE_NAMES.slice());

  const names = [];
  for (let i = 0; i < maleCount; i++) names.push({ name: malePool[i], gender: 'male' });
  for (let i = 0; i < femaleCount; i++) names.push({ name: femalePool[i], gender: 'female' });
  names.sort((a, b) => a.name.localeCompare(b.name));

  const characters = [];
  let idx = 0;
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      const { name, gender } = names[idx++];
      const characteristic = CHARACTERISTICS[randInt(CHARACTERISTICS.length)];
      characters.push({ name, gender, row: r, column: c, characteristic });
    }
  }

  const puzzle = generatePuzzle(rows, cols, characters, activeRoles);

  // Check if roles match a theme from gameThemes
  const matchingTheme = gameThemes.find(
    theme => theme.goodRole === normalizedRoles[0] && theme.badRole === normalizedRoles[1]
  );

  const gameData = {
    row: rows,
    column: cols,
    roles: activeRoles,
    characters,
    puzzle,
  };

  // If a matching theme is found, add the gameSetting
  if (matchingTheme && matchingTheme.gameSetting) {
    gameData.gameSetting = matchingTheme.gameSetting;
  }

  return gameData;
}

function printUsage() {
  const defaultRoles = [VILLAGER, WEREWOLF].join(',');
  console.log('Usage: node generator.js [--row N] [--column N] [--roles role1,role2] [--output path]');
  console.log(`Defaults: --row ${ROWS}, --column ${COLS}, --roles ${defaultRoles}`);
  console.log('If --output is omitted, the JSON is printed to stdout.');
}

function parseArgs(argv) {
  const options = { row: ROWS, column: COLS, roles: [VILLAGER, WEREWOLF], output: null, help: false };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--row' || arg === '-r') {
      const next = Number(argv[i + 1]);
      if (Number.isFinite(next)) {
        options.row = next;
        i++;
      }
    } else if (arg === '--column' || arg === '-c') {
      const next = Number(argv[i + 1]);
      if (Number.isFinite(next)) {
        options.column = next;
        i++;
      }
    } else if (arg === '--roles') {
      const next = argv[i + 1];
      if (typeof next === 'string') {
        const [good, bad] = next
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
        if (good && bad) {
          options.roles = [good, bad];
        }
        i++;
      }
    } else if (arg === '--output') {
      const next = argv[i + 1];
      if (typeof next === 'string') {
        options.output = next;
        i++;
      }
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    }
  }

  return options;
}

const isMainModule = process.argv[1] && import.meta.url === new URL(process.argv[1], 'file:').href;

if (isMainModule) {
  const { row, column, roles, output, help } = parseArgs(process.argv.slice(2));
  if (help) {
    printUsage();
    process.exit(0);
  }
  const game = generateGame(row, column, roles);
  const json = JSON.stringify(game, null, 2);
  if (output) {
    writeFileSync(output, json);
  } else {
    console.log(json);
  }
}


/*
± % pnpm exec node --input-type=module -e "import('./prototype2.js').then(m => console.log(JSON.stringify(m.generatePuzzle(), null, 2)));"
[
  {
    "row": 2,
    "column": 1,
    "role": "werewolf",
    "statement": "exactly 0 villagers in column 1"
  },
  {
    "row": 1,
    "column": 1,
    "role": "werewolf",
    "statement": "exactly 2 werewolves in row 2"
  },
  {
    "row": 2,
    "column": 2,
    "role": "werewolf",
    "statement": "exactly 0 villagers in column 2"
  },
  {
    "row": 1,
    "column": 2,
    "role": "werewolf",
    "statement": "The character at row 1 column 01 is a werewolf."
  }
]
  */
