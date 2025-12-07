import logic from 'logicjs';

var or = logic.or,
	and = logic.and,
	not = logic.not,
	eq = logic.eq,
	run = logic.run,
	lvar = logic.lvar,
	between = logic.between

export const ROWS = 2;
export const COLS = 2;

export const VILLAGER = 'villager';
export const WEREWOLF = 'werewolf';

// 1-based indexing for rows/cols to match your puzzle spec.
// grid[r][c] is the role variable for that cell.
//   villager = innocent
//   werewolf = criminal
export function makeRoleGrid(rows = ROWS, cols = COLS) {
  const grid = [];
  for (let r = 1; r <= rows; r++) {
    grid[r] = [];
    for (let c = 1; c <= cols; c++) {
      grid[r][c] = lvar(`cell_${r}_${c}`);
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
export function everyoneBinary(roleGrid) {
  const goals = [];
  for (let r = 1; r < roleGrid.length; r++) {
    for (let c = 1; c < roleGrid[r].length; c++) {
      const v = roleGrid[r][c];
      goals.push(or(eq(v, VILLAGER), eq(v, WEREWOLF)));
    }
  }
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
export function exactlyKVillagersInRow(roleGrid, row, k) {
  const rowVars = [];
  for (let c = 1; c < roleGrid[row].length; c++) {
    rowVars.push(roleGrid[row][c]);
  }
  return exactlyK(rowVars, k, VILLAGER);
}

// Exactly K werewolves in a given row
export function exactlyKWerewolvesInRow(roleGrid, row, k) {
  const rowVars = [];
  for (let c = 1; c < roleGrid[row].length; c++) {
    rowVars.push(roleGrid[row][c]);
  }
  return exactlyK(rowVars, k, WEREWOLF);
}

// 5×4 grid of role variables
const roles = makeRoleGrid(2, 2);
console.log(roles);

var g1_rule = `
   a      b
1 [alice]  [bob]
2 [charlie][dave]

alice: row 1 has one werewolf, but i'm not.
`

// create a goal
var g1 = and(
  // exactly one werewolf in row 1
  exactlyKWerewolvesInRow(roles, 1, 1),
  // alice is not werewolf
  isVillager(roles[1][1])
)
console.log(run(g1, roles[1]));
console.log(run(g1, roles[2]));