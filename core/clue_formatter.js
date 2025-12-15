import { CLUE_TYPES, resolveClueType } from './clue_types.js';

const DEFAULT_ROLE_NAMES = ['villager', 'werewolf'];

export function formatRoleName(role, roleNames = DEFAULT_ROLE_NAMES) {
  const [goodRole, badRole] = roleNames;
  if (role === goodRole || role === DEFAULT_ROLE_NAMES[0]) return goodRole;
  if (role === badRole || role === DEFAULT_ROLE_NAMES[1]) return badRole;
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

function roleAmount(count, role, roleNames = DEFAULT_ROLE_NAMES) {
  const roleWord = formatRoleName(role, roleNames);
  const plural = roleWord.endsWith('s') ? roleWord : `${roleWord}s`;
  if (count === 1) return `${countLabel(count)} ${roleWord}`;
  return `${countLabel(count)} ${plural}`;
}

function rolePlural(role, roleNames = DEFAULT_ROLE_NAMES) {
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

function formatExactKRoleInAxis(fn, rest, { roleNames }) {
  if (rest.length !== 3) return null;
  const [role, axisRaw, countRaw] = rest;
  const axis = toNumber(axisRaw);
  const count = toNumber(countRaw);
  if (!Number.isFinite(axis) || !Number.isFinite(count)) return null;
  const target = fn === CLUE_TYPES.EXACTLY_K_ROLE_IN_ROW ? 'row' : 'column';
  const verb = count === 1 ? 'is' : 'are';
  return `${target[0].toUpperCase()}${target.slice(1)} ${axis} ${verb} home to exactly ${roleAmount(count, role, roleNames)}.`;
}

function formatAboveBelowRow(fn, rest, { roleNames }) {
  if (rest.length !== 3) return null;
  const [role, rowRaw, countRaw] = rest;
  const row = toNumber(rowRaw);
  const count = toNumber(countRaw);
  if (!Number.isFinite(row) || !Number.isFinite(count)) return null;
  const preposition = fn === CLUE_TYPES.EXACTLY_ROLE_ABOVE_ROW ? 'above' : 'below';
  return `There ${beVerb(count)} exactly ${roleAmount(count, role, roleNames)} ${preposition} row ${row}.`;
}

function formatDirectionalRelative(fn, rest, { roleNames, nameFor }) {
  if (rest.length !== 4) return null;
  const [role, rowRaw, colRaw, countRaw] = rest;
  const row = toNumber(rowRaw);
  const col = toNumber(colRaw);
  const count = toNumber(countRaw);
  if (!Number.isFinite(row) || !Number.isFinite(col) || !Number.isFinite(count)) return null;
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
  return `There ${verb[0]}${verb.slice(1)} exactly ${roleAmount(count, role, roleNames)} ${preposition} ${name}.`;
}

function formatBetweenTwo(_fn, rest, { roleNames, nameFor }) {
  if (rest.length !== 6) return null;
  const [role, r1Raw, c1Raw, r2Raw, c2Raw, countRaw] = rest;
  const r1 = toNumber(r1Raw);
  const c1 = toNumber(c1Raw);
  const r2 = toNumber(r2Raw);
  const c2 = toNumber(c2Raw);
  const count = toNumber(countRaw);
  if (!Number.isFinite(r1) || !Number.isFinite(c1) || !Number.isFinite(r2) || !Number.isFinite(c2) || !Number.isFinite(count))
    return null;
  return `Between ${nameFor(r1, c1, 'object')} and ${nameFor(r2, c2, 'object')}, there ${beVerb(count)} exactly ${roleAmount(count, role, roleNames)}.`;
}

function formatAllConnected(fn, rest, { roleNames }) {
  if (rest.length !== 2) return null;
  const [role, axisRaw] = rest;
  const axis = toNumber(axisRaw);
  if (!Number.isFinite(axis)) return null;
  const target = fn === CLUE_TYPES.ALL_ROLE_IN_ROW_CONNECTED ? 'row' : 'column';
  const plural = rolePlural(role, roleNames);
  return `All ${plural} in ${target} ${axis} stay connected to each other.`;
}

function formatEqualNeighbors(_fn, rest, { roleNames, nameFor }) {
  if (rest.length !== 5) return null;
  const [role, r1Raw, c1Raw, r2Raw, c2Raw] = rest;
  const r1 = toNumber(r1Raw);
  const c1 = toNumber(c1Raw);
  const r2 = toNumber(r2Raw);
  const c2 = toNumber(c2Raw);
  if (!Number.isFinite(r1) || !Number.isFinite(c1) || !Number.isFinite(r2) || !Number.isFinite(c2)) return null;
  return `${nameFor(r1, c1, 'subject')} and ${nameFor(r2, c2, 'subject')} share the same number of ${rolePlural(role, roleNames)} nearby.`;
}

function formatMoreLessNeighbors(fn, rest, { roleNames, nameFor }) {
  if (rest.length !== 5) return null;
  const [role, r1Raw, c1Raw, r2Raw, c2Raw] = rest;
  const r1 = toNumber(r1Raw);
  const c1 = toNumber(c1Raw);
  const r2 = toNumber(r2Raw);
  const c2 = toNumber(c2Raw);
  if (!Number.isFinite(r1) || !Number.isFinite(c1) || !Number.isFinite(r2) || !Number.isFinite(c2)) return null;
  const comparison = fn === CLUE_TYPES.HAVE_MORE_ROLE_NEIGHBORS ? 'more' : 'fewer';
  const subject = nameFor(r1, c1, 'subject');
  const verb = subject === 'I' ? 'have' : 'has';
  return `${subject} ${verb} ${comparison} ${rolePlural(role, roleNames)} nearby than ${nameFor(r2, c2, 'object')}.`;
}

function formatBeOneOfNeighbors(_fn, rest, { roleNames, nameFor }) {
  if (rest.length !== 6) return null;
  const [role, r1Raw, c1Raw, r2Raw, c2Raw, kRaw] = rest;
  const r1 = toNumber(r1Raw);
  const c1 = toNumber(c1Raw);
  const r2 = toNumber(r2Raw);
  const c2 = toNumber(c2Raw);
  const k = toNumber(kRaw);
  if (!Number.isFinite(r1) || !Number.isFinite(c1) || !Number.isFinite(r2) || !Number.isFinite(c2) || !Number.isFinite(k))
    return null;
  const subject = nameFor(r1, c1, 'subject');
  const verb = subject === 'I' ? 'am' : 'is';
  return `${subject} ${verb} one of the ${roleAmount(k, role, roleNames)} surrounding ${nameFor(r2, c2, 'object')}.`;
}

function formatHasExactNeighbors(_fn, rest, { roleNames, nameFor }) {
  if (rest.length !== 4) return null;
  const [role, rRaw, cRaw, kRaw] = rest;
  const r = toNumber(rRaw);
  const c = toNumber(cRaw);
  const k = toNumber(kRaw);
  if (!Number.isFinite(r) || !Number.isFinite(c) || !Number.isFinite(k)) return null;
  const subject = nameFor(r, c, 'subject');
  const verb = subject === 'I' ? 'have' : 'has';
  return `${subject} ${verb} exactly ${roleAmount(k, role, roleNames)} nearby.`;
}

function formatDirectionalNeighbor(fn, rest, { roleNames, nameFor }) {
  if (rest.length !== 7) return null;
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
    return null;
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

function formatNeighborOverlap(_fn, rest, { roleNames, nameFor }) {
  if (rest.length !== 7) return null;
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
    return null;
  return `Of the ${roleAmount(j, role, roleNames)} neighboring ${nameFor(r1, c1)}, exactly ${roleAmount(k, role, roleNames)} also neighbor ${nameFor(r2, c2)}.`;
}

function formatAlphabetRelative(fn, rest, { roleNames, nameFor }) {
  if (rest.length !== 5) return null;
  const [role, rRaw, cRaw, kRaw, jRaw] = rest;
  const r = toNumber(rRaw);
  const c = toNumber(cRaw);
  const k = toNumber(kRaw);
  const j = toNumber(jRaw);
  if (!Number.isFinite(r) || !Number.isFinite(c) || !Number.isFinite(k) || !Number.isFinite(j)) return null;
  const direction = fn === CLUE_TYPES.K_OF_J_ROLE_BEFORE_ALPHABET_NAMES ? 'come before' : 'come after';
  const verb = beVerb(k);
  const quantity = roleAmount(k, role, roleNames);
  return `Among the ${countLabel(j)} people whose names ${direction} ${nameFor(r, c)} alphabetically, exactly ${quantity} ${verb} among them.`;
}

const FORMATTERS = {
  [CLUE_TYPES.EXACTLY_K_ROLE_IN_ROW]: formatExactKRoleInAxis,
  [CLUE_TYPES.EXACTLY_K_ROLE_IN_COLUMN]: formatExactKRoleInAxis,
  [CLUE_TYPES.EXACTLY_ROLE_ABOVE_ROW]: formatAboveBelowRow,
  [CLUE_TYPES.EXACTLY_ROLE_BELOW_ROW]: formatAboveBelowRow,
  [CLUE_TYPES.EXACTLY_K_ROLE_LEFT_COLUMN]: formatDirectionalRelative,
  [CLUE_TYPES.EXACTLY_K_ROLE_RIGHT_COLUMN]: formatDirectionalRelative,
  [CLUE_TYPES.EXACTLY_K_ROLE_ABOVE_SOMEONE]: formatDirectionalRelative,
  [CLUE_TYPES.EXACTLY_K_ROLE_BELOW_SOMEONE]: formatDirectionalRelative,
  [CLUE_TYPES.EXACTLY_K_ROLE_LEFT_OF_SOMEONE]: formatDirectionalRelative,
  [CLUE_TYPES.EXACTLY_K_ROLE_RIGHT_OF_SOMEONE]: formatDirectionalRelative,
  [CLUE_TYPES.EXACTLY_K_ROLE_BETWEEN_THE_TWO]: formatBetweenTwo,
  [CLUE_TYPES.ALL_ROLE_IN_ROW_CONNECTED]: formatAllConnected,
  [CLUE_TYPES.ALL_ROLE_IN_COLUMN_CONNECTED]: formatAllConnected,
  [CLUE_TYPES.HAVE_EQUAL_ROLE_NEIGHBOR]: formatEqualNeighbors,
  [CLUE_TYPES.HAVE_MORE_ROLE_NEIGHBORS]: formatMoreLessNeighbors,
  [CLUE_TYPES.HAVE_LESS_ROLE_NEIGHBORS]: formatMoreLessNeighbors,
  [CLUE_TYPES.BE_ONE_OF_SOMEONES_K_ROLE_NEIGHBORS]: formatBeOneOfNeighbors,
  [CLUE_TYPES.HAS_EXACT_K_ROLE_NEIGHBOR]: formatHasExactNeighbors,
  [CLUE_TYPES.K_OF_J_ROLE_TO_THE_LEFT_OF_SOMEONE_IS_ANOTHERS_NEIGHBOR]: formatDirectionalNeighbor,
  [CLUE_TYPES.K_OF_J_ROLE_TO_THE_RIGHT_OF_SOMEONE_IS_ANOTHERS_NEIGHBOR]: formatDirectionalNeighbor,
  [CLUE_TYPES.K_OF_J_ROLE_ABOVE_SOMEONE_IS_ANOTHERS_NEIGHBOR]: formatDirectionalNeighbor,
  [CLUE_TYPES.K_OF_J_ROLE_BELOW_SOMEONE_IS_ANOTHERS_NEIGHBOR]: formatDirectionalNeighbor,
  [CLUE_TYPES.K_OF_J_ROLE_NEIGHBOR_TO_SOMEONE_IS_ANOTHERS_NEIGHBOR]: formatNeighborOverlap,
  [CLUE_TYPES.K_OF_J_ROLE_BEFORE_ALPHABET_NAMES]: formatAlphabetRelative,
  [CLUE_TYPES.K_OF_J_ROLE_AFTER_ALPHABET_NAMES]: formatAlphabetRelative,
};

export function formatClue(clueParts, getName, roleNames = DEFAULT_ROLE_NAMES, options = {}) {
  const parts = normalizeClueParts(clueParts);
  if (parts.length === 0) return '';
  const [rawFn, ...rest] = parts;
  const fallback = Array.isArray(clueParts) ? clueParts.join(' ') : String(clueParts);

  const { speakerName } = options || {};
  const baseNameFor = (r, c) => (typeof getName === 'function' ? getName(r, c) : `row ${r} column ${c}`);
  const nameFor = (r, c, form = 'object') => speakerize(baseNameFor(r, c), speakerName, form);
  const context = { roleNames, nameFor };

  const type = resolveClueType(rawFn);
  if (type == null) return fallback;

  const formatter = FORMATTERS[type];
  if (!formatter) return fallback;
  const result = formatter(type, rest, context);
  return result ?? fallback;
}
