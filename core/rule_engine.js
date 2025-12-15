import logic from 'logicjs';
import { buildClueGoal } from './clue_goals.js';

const { or, and, not, eq, run, lvar, between } = logic;

export { or, and, not, eq, run, lvar, between };

export const ROWS = 5;
export const COLS = 3;

export let VILLAGER = 'villager';
export let WEREWOLF = 'werewolf';

export function setRoleNames(roleNames = []) {
  const [goodRole, badRole] = roleNames;
  VILLAGER = goodRole || VILLAGER;
  WEREWOLF = badRole || WEREWOLF;
}

// Utility: AND a list of goals
export function allAnd(goals) {
  if (goals.length === 0) return logic.win;
  return goals.reduce((acc, g) => and(acc, g), logic.win);
}

// Utility: OR a list of goals
export function anyOr(goals) {
  if (goals.length === 0) return logic.fail;
  return goals.reduce((acc, g) => or(acc, g), logic.fail);
}

// 1-based indexing for rows/cols to match your puzzle spec.
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

// Everyone is either villager or werewolf
export function everyoneBinary(roleList) {
  const goals = roleList.map(v => or(eq(v, VILLAGER), eq(v, WEREWOLF)));
  return allAnd(goals);
}

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
export function exactlyK(vars, k, value) {
  const n = vars.length;
  const complement = value === VILLAGER ? WEREWOLF : VILLAGER;
  const idxs = [];
  for (let i = 0; i < n; i++) idxs.push(i);

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

export function randInt(max) {
  return Math.floor(Math.random() * max);
}

export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

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

export function getNeighbors(row, col, rows = ROWS, cols = COLS) {
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

export function cellsInDirection(row, col, direction, rows = ROWS, cols = COLS) {
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
  const neighborVars1 = neighbors1.map(([r, c]) => roleList[cellIndex(r, c, cols)]);
  const neighborSet2 = new Set(getNeighbors(r2, c2, rows, cols).map(([r, c]) => `${r},${c}`));
  const intersectionVars = neighbors1
    .filter(([r, c]) => neighborSet2.has(`${r},${c}`))
    .map(([r, c]) => roleList[cellIndex(r, c, cols)]);

  return allAnd([exactlyK(neighborVars1, j, role), exactlyK(intersectionVars, k, role)]);
}

function kOfJRoleAlphabetHelper(roleList, alphabeticalOrder, r, c, k, j, role, cols = COLS) {
  const idx = alphabeticalOrder.indexMap.get(`${r},${c}`);
  if (idx == null) return logic.fail;
  const entries = alphabeticalOrder.entries;
  const start = roleList.slice(0, roleList.length); // copy for safety
  const indices = [];
  for (let i = 0; i < entries.length; i++) {
    if (i === idx) continue;
    indices.push(entries[i]);
  }
  const vars = indices.map(({ row, column }) => roleList[cellIndex(row, column, cols)]);
  return exactlyK(vars, k, role);
}

export function kOfJRoleBeforeAlphabetNames(roleList, alphabeticalOrder, r, c, k, j, role, cols = COLS) {
  const idx = alphabeticalOrder.indexMap.get(`${r},${c}`);
  if (idx == null) return logic.fail;
  const beforeEntries = alphabeticalOrder.entries.slice(0, idx);
  const vars = beforeEntries.map(({ row, column }) => roleList[cellIndex(row, column, cols)]);
  return exactlyK(vars, k, role);
}

export function kOfJRoleAfterAlphabetNames(roleList, alphabeticalOrder, r, c, k, j, role, cols = COLS) {
  const idx = alphabeticalOrder.indexMap.get(`${r},${c}`);
  if (idx == null) return logic.fail;
  const afterEntries = alphabeticalOrder.entries.slice(idx + 1);
  const vars = afterEntries.map(({ row, column }) => roleList[cellIndex(row, column, cols)]);
  return exactlyK(vars, k, role);
}

export function allRoleConnectedInRow(roleList, row, role, cols = COLS) {
  const start = cellIndex(row, 1, cols);
  const rowVars = roleList.slice(start, start + cols);

  const adjacency = [];
  for (let i = 0; i < cols; i++) {
    const neighbors = [];
    if (i > 0) neighbors.push(i - 1);
    if (i < cols - 1) neighbors.push(i + 1);
    adjacency.push(neighbors);
  }

  function isConnected(indexes) {
    if (indexes.length === 0) return true;
    const visited = new Set();
    const stack = [indexes[0]];
    visited.add(indexes[0]);
    while (stack.length > 0) {
      const current = stack.pop();
      adjacency[current].forEach(nei => {
        if (indexes.includes(nei) && !visited.has(nei)) {
          visited.add(nei);
          stack.push(nei);
        }
      });
    }
    return visited.size === indexes.length;
  }

  const goals = [];
  for (let k = 0; k <= cols; k++) {
    const subsets = kSubsets(
      Array.from({ length: cols }, (_, i) => i),
      k
    );
    subsets.forEach(subset => {
      const eqGoals = subset.map(i => eq(rowVars[i], role));
      const neqGoals = Array.from({ length: cols }, (_, i) => i)
        .filter(i => !subset.includes(i))
        .map(i => eq(rowVars[i], role === VILLAGER ? WEREWOLF : VILLAGER));
      if (isConnected(subset)) {
        goals.push(allAnd([...eqGoals, ...neqGoals]));
      }
    });
  }
  return anyOr(goals);
}

export function allRoleConnectedInColumn(roleList, col, role, rows = ROWS, cols = COLS) {
  const colVars = [];
  for (let r = 1; r <= rows; r++) {
    colVars.push(roleList[cellIndex(r, col, cols)]);
  }

  const adjacency = [];
  for (let i = 0; i < rows; i++) {
    const neighbors = [];
    if (i > 0) neighbors.push(i - 1);
    if (i < rows - 1) neighbors.push(i + 1);
    adjacency.push(neighbors);
  }

  function isConnected(indexes) {
    if (indexes.length === 0) return true;
    const visited = new Set();
    const stack = [indexes[0]];
    visited.add(indexes[0]);
    while (stack.length > 0) {
      const current = stack.pop();
      adjacency[current].forEach(nei => {
        if (indexes.includes(nei) && !visited.has(nei)) {
          visited.add(nei);
          stack.push(nei);
        }
      });
    }
    return visited.size === indexes.length;
  }

  const goals = [];
  for (let k = 0; k <= rows; k++) {
    const subsets = kSubsets(
      Array.from({ length: rows }, (_, i) => i),
      k
    );
    subsets.forEach(subset => {
      const eqGoals = subset.map(i => eq(colVars[i], role));
      const neqGoals = Array.from({ length: rows }, (_, i) => i)
        .filter(i => !subset.includes(i))
        .map(i => eq(colVars[i], role === VILLAGER ? WEREWOLF : VILLAGER));
      if (isConnected(subset)) {
        goals.push(allAnd([...eqGoals, ...neqGoals]));
      }
    });
  }
  return anyOr(goals);
}

export function normalizeReferencedCells(cells = []) {
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

export function makeNameLookup(characters) {
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

export function buildAlphabeticalOrder(rows, cols, getName) {
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

export function deducedCellsFromSolutions(solutions) {
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

export function deduceRoles({
  rows = ROWS,
  cols = COLS,
  characters = [],
  revealedClues = [],
  knownAssignments = [],
  roleNames = [VILLAGER, WEREWOLF],
} = {}) {
  setRoleNames(roleNames);
  const roles = makeRoleGrid(rows, cols);
  const nameLookup = makeNameLookup(characters);
  const alphabeticalOrder = buildAlphabeticalOrder(rows, cols, nameLookup);
  const goals = [everyoneBinary(roles)];

  const fns = {
    exactlyKRoleInRow,
    exactlyKRoleInColumn,
    exactlyRoleAboveRow,
    exactlyRoleBelowRow,
    exactlyKRoleLeftColumn,
    exactlyKRoleRightColumn,
    exactlyKRoleAboveSomeone,
    exactlyKRoleBelowSomeone,
    exactlyKRoleLeftOfSomeone,
    exactlyKRoleRightOfSomeone,
    exactlyKRoleBetweenTheTwo,
    allRoleConnectedInRow,
    allRoleConnectedInColumn,
    haveEqualRoleNeighbor,
    haveMoreRoleNeighbors,
    haveLessRoleNeighbors,
    beOneOfSomeonesKRoleNeighbors,
    hasExactKRoleNeighbor,
    kOfJRoleToTheLeftOfSomeoneIsAnothersNeighbor,
    kOfJRoleToTheRightOfSomeoneIsAnothersNeighbor,
    kOfJRoleAboveSomeoneIsAnothersNeighbor,
    kOfJRoleBelowSomeoneIsAnothersNeighbor,
    kOfJRoleNeighborToSomeoneIsAnothersNeighbor,
    kOfJRoleBeforeAlphabetNames,
    kOfJRoleAfterAlphabetNames,
  };

  knownAssignments.forEach(({ row, column, role }) => {
    if (row == null || column == null || !role) return;
    goals.push(eq(roles[cellIndex(row, column, cols)], role));
  });

  revealedClues.forEach((clue) => {
    const parts = Array.isArray(clue?.parts) ? clue.parts : clue;
    const goal = buildClueGoal(parts, {
      roleList: roles,
      alphabeticalOrder,
      rows,
      cols,
      fns,
    });
    if (goal) goals.push(goal);
  });

  const solutions = run(and(...goals), roles);
  const deduced = deducedCellsFromSolutions(solutions);
  return { deduced, solutionsCount: solutions.length };
}
