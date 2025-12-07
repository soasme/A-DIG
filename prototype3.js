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

function formatClue(text) {
  const parts = text.split(' ');
  const [fn, ...rest] = parts;

  const pluralizeRole = (role, count) =>
    count === 1
      ? role
      : role === WEREWOLF
      ? 'werewolves'
      : role === VILLAGER
      ? 'villagers'
      : `${role}s`;

  if (fn === 'exactlyKRoleInRow' || fn === 'exactlyKRoleInColumn') {
    if (rest.length !== 3) return text;
    const [role, axisStr, countStr] = rest;
    const axis = Number(axisStr);
    const count = Number(countStr);
    if (!Number.isFinite(axis) || !Number.isFinite(count)) return text;

    const plural = pluralizeRole(role, count);
    const target = fn === 'exactlyKRoleInRow' ? 'row' : 'column';
    return `exactly ${count} ${plural} in ${target} ${axis}`;
  }
  if (fn === 'exactlyRoleAboveRow' || fn === 'exactlyRoleBelowRow') {
    if (rest.length !== 3) return text;
    const [role, rowStr, countStr] = rest;
    const row = Number(rowStr);
    const count = Number(countStr);
    if (!Number.isFinite(row) || !Number.isFinite(count)) return text;
    const plural = pluralizeRole(role, count);
    const target = fn === 'exactlyRoleAboveRow' ? 'above row' : 'below row';
    return `exactly ${count} ${plural} ${target} ${row}`;
  }
  if (fn === 'exactlyKRoleLeftColumn' || fn === 'exactlyKRoleRightColumn') {
    if (rest.length !== 3) return text;
    const [role, colStr, countStr] = rest;
    const col = Number(colStr);
    const count = Number(countStr);
    if (!Number.isFinite(col) || !Number.isFinite(count)) return text;
    const plural = pluralizeRole(role, count);
    const target = fn === 'exactlyKRoleLeftColumn' ? 'left of column' : 'right of column';
    return `exactly ${count} ${plural} ${target} ${col}`;
  }
  if (
    fn === 'exactlyKRoleAboveSomeone' ||
    fn === 'exactlyKRoleBelowSomeone' ||
    fn === 'exactlyKRoleLeftOfSomeone' ||
    fn === 'exactlyKRoleRightOfSomeone'
  ) {
    if (rest.length !== 4) return text;
    const [role, rowStr, colStr, countStr] = rest;
    const row = Number(rowStr);
    const col = Number(colStr);
    const count = Number(countStr);
    if (!Number.isFinite(row) || !Number.isFinite(col) || !Number.isFinite(count)) return text;
    const plural = pluralizeRole(role, count);
    const target =
      fn === 'exactlyKRoleAboveSomeone'
        ? 'above'
        : fn === 'exactlyKRoleBelowSomeone'
        ? 'below'
        : fn === 'exactlyKRoleLeftOfSomeone'
        ? 'left of'
        : 'right of';
    return `exactly ${count} ${plural} ${target} the character at row ${row} column ${col}`;
  }
  if (fn === 'exactlyKRoleBetweenTheTwo') {
    if (rest.length !== 6) return text;
    const [role, r1Str, c1Str, r2Str, c2Str, countStr] = rest;
    const r1 = Number(r1Str);
    const c1 = Number(c1Str);
    const r2 = Number(r2Str);
    const c2 = Number(c2Str);
    const count = Number(countStr);
    if (
      !Number.isFinite(r1) ||
      !Number.isFinite(c1) ||
      !Number.isFinite(r2) ||
      !Number.isFinite(c2) ||
      !Number.isFinite(count)
    )
      return text;
    const plural = pluralizeRole(role, count);
    return `exactly ${count} ${plural} between row ${r1} column ${c1} and row ${r2} column ${c2}`;
  }
  return text;
}

function formatOtherRole(row, col, value) {
  const valueWord = value === VILLAGER ? 'villager' : 'werewolf';
  return `The character at row ${row} column ${String(col).padStart(2, '0')} is a ${valueWord}.`;
}

function indexToRowCol(idx, cols = COLS) {
  return {
    row: Math.floor(idx / cols) + 1,
    col: (idx % cols) + 1,
  };
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

function buildClueTemplates(targetSolution, roles, rows, cols) {
  const clues = [];

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
      clues.push({
        key: `row-${r}-${role}-${count}`,
        goal: exactlyKRoleInRow(roles, r, count, role, cols),
        statement: formatClue(`exactlyKRoleInRow ${role} ${r} ${count}`),
      });
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
              statement: formatClue(`exactlyRoleAboveRow ${role} ${r} ${count}`),
            }
          : {
              key: `row-${r}-below-${role}-${count}`,
              goal: exactlyRoleBelowRow(roles, r, count, role, rows, cols),
              statement: formatClue(`exactlyRoleBelowRow ${role} ${r} ${count}`),
            };
      clues.push(builder);
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
      clues.push({
        key: `col-${c}-${role}-${count}`,
        goal: exactlyKRoleInColumn(roles, c, count, role, rows, cols),
        statement: formatClue(`exactlyKRoleInColumn ${role} ${c} ${count}`),
      });
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
              statement: formatClue(`exactlyKRoleLeftColumn ${role} ${c} ${count}`),
            }
          : {
              key: `col-${c}-right-${role}-${count}`,
              goal: exactlyKRoleRightColumn(roles, c, count, role, rows, cols),
              statement: formatClue(`exactlyKRoleRightColumn ${role} ${c} ${count}`),
            };
      clues.push(builder);
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
          formatter: role => `exactlyKRoleAboveSomeone ${role} ${r} ${c}`,
        },
        {
          dir: 'below',
          vals: belowVals,
          fn: exactlyKRoleBelowSomeone,
          keyPrefix: 'below',
          formatter: role => `exactlyKRoleBelowSomeone ${role} ${r} ${c}`,
        },
        {
          dir: 'left',
          vals: leftVals,
          fn: exactlyKRoleLeftOfSomeone,
          keyPrefix: 'left-of',
          formatter: role => `exactlyKRoleLeftOfSomeone ${role} ${r} ${c}`,
        },
        {
          dir: 'right',
          vals: rightVals,
          fn: exactlyKRoleRightOfSomeone,
          keyPrefix: 'right-of',
          formatter: role => `exactlyKRoleRightOfSomeone ${role} ${r} ${c}`,
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
          clues.push({
            key: `cell-${r}-${c}-${keyPrefix}-${role}-${count}`,
            goal: fn(roles, r, c, count, role, rows, cols),
            statement: formatClue(`${formatter(role)} ${count}`),
          });
        });
      });

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
          clues.push({
            key,
            goal: exactlyKRoleBetweenTheTwo(roles, r1, c1, r2, c2, count, role, rows, cols),
            statement: formatClue(
              `exactlyKRoleBetweenTheTwo ${role} ${r1} ${c1} ${r2} ${c2} ${count}`
            ),
          });
        });
      });
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
export function generatePuzzle(rows = ROWS, cols = COLS) {
  const desiredNewDeductions = 2;
  const roles = makeRoleGrid(rows, cols);
  const targetSolution = Array.from({ length: rows * cols }, () =>
    Math.random() < 0.5 ? VILLAGER : WEREWOLF
  );

  const clueTemplates = shuffle(buildClueTemplates(targetSolution, roles, rows, cols));
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

  const maxSteps = rows * cols * 6;
  let steps = 0;

  while (deduced.size < rows * cols && steps < maxSteps) {
    steps++;
    let added = false;
    let nextIdx = -1;
    let nextSolutions = solutions;
    let nextDeductions = deduced;
    let nextStatement = '';

    // Try to find a clue that yields exactly the desired number of new deduced cells (not yet known).
    let relaxedCandidate = null;
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

      const acceptable = newDeductions.length > 0 && newDeductions.every(([idx]) => idx !== currentSpeakerIdx);
      if (!acceptable) continue;

      if (newDeductions.length === desiredNewDeductions) {
        const [newIdx] = newDeductions[0];

        nextIdx = newIdx;
        nextSolutions = candidateSolutions;
        nextDeductions = candidateDeductions;
        nextStatement = clue.statement;

        goals.push(clue.goal);
        usedClueKeys.add(clue.key);
        added = true;
        break;
      }

      if (!relaxedCandidate) {
        const [newIdx] = newDeductions[0];
        relaxedCandidate = {
          newIdx,
          candidateSolutions,
          candidateDeductions,
          statement: clue.statement,
          goal: clue.goal,
          clueKey: clue.key,
        };
      }
    }

    if (!added && relaxedCandidate) {
      nextIdx = relaxedCandidate.newIdx;
      nextSolutions = relaxedCandidate.candidateSolutions;
      nextDeductions = relaxedCandidate.candidateDeductions;
      nextStatement = relaxedCandidate.statement;

      goals.push(relaxedCandidate.goal);
      usedClueKeys.add(relaxedCandidate.clueKey);
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
        nextStatement = formatOtherRole(row, col, value);

        goals.push(fallbackGoal);
        added = true;
      } else {
        break;
      }
    }

    if (!added) break;

    // Record the current speaker's statement (about another character).
    const { row: speakerRow, col: speakerCol } = indexToRowCol(currentSpeakerIdx, cols);
    puzzle.push({
      row: speakerRow,
      column: speakerCol,
      role: targetSolution[currentSpeakerIdx],
      statement: nextStatement,
    });
    coveredSpeakerIdxs.add(currentSpeakerIdx);

    solutions = nextSolutions;
    deduced = nextDeductions;
    currentSpeakerIdx = nextIdx;
  }

  // Add a final truthful statement from the last revealed character about someone else.
  if (deduced.size === rows * cols) {
    const others = [];
    for (let i = 0; i < rows * cols; i++) {
      if (i !== currentSpeakerIdx) others.push(i);
    }
    if (others.length > 0) {
      const targetIdx = others[0];
      const { row: speakerRow, col: speakerCol } = indexToRowCol(currentSpeakerIdx, cols);
      const { row: tgtRow, col: tgtCol } = indexToRowCol(targetIdx, cols);
      puzzle.push({
        row: speakerRow,
        column: speakerCol,
        role: targetSolution[currentSpeakerIdx],
        statement: formatOtherRole(tgtRow, tgtCol, targetSolution[targetIdx]),
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
      statement: formatOtherRole(row, col, targetSolution[i]),
    });
  }

  return puzzle;
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
