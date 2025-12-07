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

  if (fn === 'exactlyKRoleInRow' || fn === 'exactlyKRoleInColumn') {
    if (rest.length !== 3) return text;
    const [role, axisStr, countStr] = rest;
    const axis = Number(axisStr);
    const count = Number(countStr);
    if (!Number.isFinite(axis) || !Number.isFinite(count)) return text;

    const plural =
      count === 1
        ? role
        : role === WEREWOLF
        ? 'werewolves'
        : role === VILLAGER
        ? 'villagers'
        : `${role}s`;
    const target = fn === 'exactlyKRoleInRow' ? 'row' : 'column';
    return `exactly ${count} ${plural} in ${target} ${axis}`;
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
  }

  for (let c = 1; c <= cols; c++) {
    const colSlice = [];
    for (let r = 1; r <= rows; r++) {
      colSlice.push(targetSolution[cellIndex(r, c, cols)]);
    }
    const werewolfCount = colSlice.filter(v => v === WEREWOLF).length;
    const villagerCount = rows - werewolfCount;

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

  const maxSteps = rows * cols * 6;
  let steps = 0;

  while (deduced.size < rows * cols && steps < maxSteps) {
    steps++;
    let added = false;
    let nextIdx = -1;
    let nextSolutions = solutions;
    let nextDeductions = deduced;
    let nextStatement = '';

    // Try to find a clue that yields exactly one new deduced cell (not yet known).
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

      if (newDeductions.length === 1) {
        const [newIdx] = newDeductions[0];
        if (newIdx === currentSpeakerIdx) continue; // avoid self-pointing

        nextIdx = newIdx;
        nextSolutions = candidateSolutions;
        nextDeductions = candidateDeductions;
        nextStatement = clue.statement;

        goals.push(clue.goal);
        usedClueKeys.add(clue.key);
        added = true;
        break;
      }
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

      if (newDeductions.length === 1 && newDeductions[0][0] !== currentSpeakerIdx) {
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
    }
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
