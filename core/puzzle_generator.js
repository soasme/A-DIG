import gameThemes from '../app/data/gameThemes.js';
import { generateCharacters } from './character_generator.js';
import { CLUE_TYPES } from './clue_types.js';
import { formatClue, formatRoleName } from './clue_formatter.js';
import {
  and,
  eq,
  run,
  cellIndex,
  ROWS,
  COLS,
  VILLAGER,
  WEREWOLF,
  setRoleNames,
  makeRoleGrid,
  everyoneBinary,
  deducedCellsFromSolutions,
  randInt,
  shuffle,
  makeNameLookup,
  buildAlphabeticalOrder,
  normalizeReferencedCells,
  exactlyKRoleInRow,
  exactlyRoleAboveRow,
  exactlyRoleBelowRow,
  allRoleConnectedInRow,
  exactlyKRoleInColumn,
  allRoleConnectedInColumn,
  exactlyKRoleLeftColumn,
  exactlyKRoleRightColumn,
  exactlyKRoleAboveSomeone,
  exactlyKRoleBelowSomeone,
  exactlyKRoleLeftOfSomeone,
  exactlyKRoleRightOfSomeone,
  kOfJRoleBeforeAlphabetNames,
  kOfJRoleAfterAlphabetNames,
  hasExactKRoleNeighbor,
  exactlyKRoleBetweenTheTwo,
  haveEqualRoleNeighbor,
  haveMoreRoleNeighbors,
  haveLessRoleNeighbors,
  beOneOfSomeonesKRoleNeighbors,
  kOfJRoleToTheLeftOfSomeoneIsAnothersNeighbor,
  kOfJRoleToTheRightOfSomeoneIsAnothersNeighbor,
  kOfJRoleAboveSomeoneIsAnothersNeighbor,
  kOfJRoleBelowSomeoneIsAnothersNeighbor,
  kOfJRoleNeighborToSomeoneIsAnothersNeighbor,
  cellsInDirection,
  getNeighbors,
} from './rule_engine.js';

// Re-export core constants for convenience.
export { ROWS, COLS, VILLAGER, WEREWOLF } from './rule_engine.js';

function formatOtherRole(row, col, value, getName, roleNames = [VILLAGER, WEREWOLF]) {
  const valueWord = formatRoleName(value, roleNames);
  const name = typeof getName === 'function' ? getName(row, col) : `row ${row} column ${String(col)}`;
  return `${name} is a ${valueWord}.`;
}

function clueWithParts({ key, goal, parts, referencedCells = [] }, getName, roleNames) {
  return {
    key,
    goal,
    clueParts: parts,
    statement: formatClue(parts, getName, roleNames),
    referencedCells,
  };
}

function buildClueTemplates(targetSolution, roles, rows, cols, getName, roleNames = [VILLAGER, WEREWOLF]) {
  const clues = [];
  const alphabeticalOrder = buildAlphabeticalOrder(rows, cols, getName);

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
        }, getName, roleNames)
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
      clues.push(clueWithParts({ ...builder }, getName, roleNames));
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
        }, getName, roleNames)
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
        }, getName, roleNames)
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
        }, getName, roleNames)
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
      clues.push(clueWithParts({ ...builder }, getName, roleNames));
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
            }, getName, roleNames)
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
            }, getName, roleNames)
          );
        });
      });

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
            }, getName, roleNames)
          );
        });
      }

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
            }, getName, roleNames)
          );
        });
      });
    }
  }

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
              }, getName, roleNames)
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
                }, getName, roleNames)
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
                }, getName, roleNames)
              );
            }
          });

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
              }, getName, roleNames)
            );
          });

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
                }, getName, roleNames)
              );
            });
          });

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
                }, getName, roleNames)
              );
            });
          }
        }
      }
    }
  }

  return clues;
}

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

  const initialIdx = randInt(rows * cols);
  const initialGoal = eq(roles[initialIdx], targetSolution[initialIdx]);

  const goals = [everyoneBinary(roles), initialGoal];
  let solutions = run(and(...goals), roles);
  let deduced = deducedCellsFromSolutions(solutions);

  let currentSpeakerIdx = initialIdx;
  const puzzle = [];
  const coveredSpeakerIdxs = new Set();
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
        const { row, col } = { row: Math.floor(newIdx / cols) + 1, col: (newIdx % cols) + 1 };
        nextIdx = newIdx;
        nextSolutions = candidateSolutions;
        nextDeductions = candidateDeductions;
        nextStatement = formatOtherRole(row, col, value, nameLookup, activeRoles);
        nextClueParts = null;
        nextReferencedCells = normalizeReferencedCells([{ row, column: col }]);
        newlyDeducible = newDeductions;

        goals.push(fallbackGoal);
        added = true;
      } else {
        break;
      }
    }

    if (!added) break;

    const speakerRow = Math.floor(currentSpeakerIdx / cols) + 1;
    const speakerCol = (currentSpeakerIdx % cols) + 1;
    const speakerName = nameLookup(speakerRow, speakerCol);
    const deductableCells = newlyDeducible.map(([idx, value]) => {
      const row = Math.floor(idx / cols) + 1;
      const col = (idx % cols) + 1;
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

  if (deduced.size === rows * cols) {
    const speakerRow = Math.floor(currentSpeakerIdx / cols) + 1;
    const speakerCol = (currentSpeakerIdx % cols) + 1;
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
      const others = [];
      for (let i = 0; i < rows * cols; i++) {
        if (i !== currentSpeakerIdx) others.push(i);
      }
      if (others.length > 0) {
        const targetIdx = others[0];
        const tgtRow = Math.floor(targetIdx / cols) + 1;
        const tgtCol = (targetIdx % cols) + 1;
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

  for (let i = 0; i < rows * cols && puzzle.length < rows * cols; i++) {
    if (coveredSpeakerIdxs.has(i)) continue;
    const row = Math.floor(i / cols) + 1;
    const col = (i % cols) + 1;
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
  const characters = generateCharacters(rows, cols);

  const puzzle = generatePuzzle(rows, cols, characters, activeRoles);

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

  if (matchingTheme && matchingTheme.gameSetting) {
    gameData.gameSetting = matchingTheme.gameSetting;
  }

  return gameData;
}
