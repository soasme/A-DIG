"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

type Identity = "DEMON" | "CULTIVATOR";
type Element = "Metal" | "Wood" | "Water" | "Fire" | "Earth";

// ========== Atom Type Definitions ==========

type PolarityAtom = { type: "pos" } | { type: "neg" };

type QuantifierAtom =
  | { type: "exact"; n: number }
  | { type: "atLeast"; n: number }
  | { type: "atMost"; n: number }
  | { type: "all" }
  | { type: "even" }
  | { type: "odd" };

type GroupSelectorAtom =
  | { type: "row"; r: number }
  | { type: "column"; c: number }
  | { type: "neighbor"; personId: number };

type RoleAtom = { type: "be"; label: string };

type PositionAtom =
  | { type: "above"; personId: number }
  | { type: "below"; personId: number }
  | { type: "between"; person1Id: number; person2Id: number };

type Atom = QuantifierAtom | GroupSelectorAtom | RoleAtom | PositionAtom;

type AtomChain = {
  polarity: PolarityAtom;
  steps: Atom[];
};

type Clue = {
  chain: AtomChain;
  text: string;
  speakerId: number;
};

type Character = {
  id: number;
  name: string;
  row: number;
  col: number;
  identity: Identity;
  spiritualRoot: Element[];
  clue: Clue | null;
  isRevealed: boolean;
};

type PuzzleIndexes = {
  rows: Record<number, number[]>;
  cols: Record<number, number[]>;
  neighbors: Record<number, number[]>;
  elementGroups: Record<Element, number[]>;
};

type Puzzle = {
  characters: Character[];
  indexes: PuzzleIndexes;
  startId: number;
};

const GRID_ROWS = 5;
const GRID_COLS = 4;
const TOTAL_CHARACTERS = GRID_ROWS * GRID_COLS; // 20
const ELEMENTS: Element[] = ["Metal", "Wood", "Water", "Fire", "Earth"];

const SURNAMES = [
  "Bai",
  "Cao",
  "Chen",
  "Deng",
  "Fang",
  "Feng",
  "Gao",
  "Gu",
  "Guo",
  "Han",
  "He",
  "Hu",
  "Huang",
  "Jiang",
  "Jin",
  "Li",
  "Liang",
  "Lin",
  "Liu",
  "Lu",
  "Luo",
  "Ma",
  "Meng",
  "Mo",
  "Mu",
  "Nie",
  "Pan",
  "Pei",
  "Qin",
  "Qiu",
  "Ren",
  "Shen",
  "Shi",
  "Song",
  "Su",
  "Sun",
  "Tan",
  "Tang",
  "Tian",
  "Wang",
  "Wei",
  "Wu",
  "Xia",
  "Xiao",
  "Xie",
  "Xu",
  "Yan",
  "Yang",
  "Ye",
  "Yin",
  "Yu",
  "Yuan",
  "Yun",
  "Zhang",
  "Zhao",
  "Zheng",
  "Zhou",
  "Zhu",
];

const GIVEN_NAMES = [
  "Ao",
  "Chen",
  "Cheng",
  "Chi",
  "Chuan",
  "Feng",
  "Han",
  "Hao",
  "Hong",
  "Hua",
  "Hui",
  "Jian",
  "Jing",
  "Jun",
  "Kai",
  "Lan",
  "Lei",
  "Lian",
  "Ling",
  "Long",
  "Mei",
  "Ming",
  "Nan",
  "Ning",
  "Peng",
  "Qi",
  "Qian",
  "Qing",
  "Rong",
  "Shan",
  "Shuang",
  "Tao",
  "Wen",
  "Xi",
  "Xiang",
  "Xiao",
  "Xin",
  "Xiu",
  "Xuan",
  "Yan",
  "Yang",
  "Yi",
  "Ying",
  "Yong",
  "Yu",
  "Yuan",
  "Yue",
  "Yun",
  "Zhen",
  "Zhi",
];

const CORNER_COLORS = ["transparent", "#22c55e", "#ef4444", "#eab308"];

// ========== Utility Functions ==========

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function sample<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function areNeighbors(a: Character, b: Character): boolean {
  const rowDiff = Math.abs(a.row - b.row);
  const colDiff = Math.abs(a.col - b.col);
  return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
}

function betweenIds(characters: Character[], a: number, b: number): number[] {
  const personA = characters[a];
  const personB = characters[b];
  if (personA.row === personB.row) {
    const minCol = Math.min(personA.col, personB.col);
    const maxCol = Math.max(personA.col, personB.col);
    return characters.filter((p) => p.row === personA.row && p.col > minCol && p.col < maxCol).map((p) => p.id);
  }
  if (personA.col === personB.col) {
    const minRow = Math.min(personA.row, personB.row);
    const maxRow = Math.max(personA.row, personB.row);
    return characters.filter((p) => p.col === personA.col && p.row > minRow && p.row < maxRow).map((p) => p.id);
  }
  return [];
}

function generateNames(count: number): string[] {
  const names = new Set<string>();
  while (names.size < count) {
    names.add(`${sample(SURNAMES)} ${sample(GIVEN_NAMES)}`);
  }
  return Array.from(names).sort((a, b) => a.localeCompare(b));
}

function buildSpiritualRoot(): Element[] {
  const size = Math.floor(Math.random() * ELEMENTS.length) + 1;
  return shuffle(ELEMENTS).slice(0, size);
}

// ========== Atom Chain Builder Functions ==========

function pos(): PolarityAtom {
  return { type: "pos" };
}

function neg(): PolarityAtom {
  return { type: "neg" };
}

function exact(n: number): QuantifierAtom {
  return { type: "exact", n };
}

function all(): QuantifierAtom {
  return { type: "all" };
}

function row(r: number): GroupSelectorAtom {
  return { type: "row", r };
}

function column(c: number): GroupSelectorAtom {
  return { type: "column", c };
}

function neighbor(personId: number): GroupSelectorAtom {
  return { type: "neighbor", personId };
}

function be(label: string): RoleAtom {
  return { type: "be", label };
}

function above(personId: number): PositionAtom {
  return { type: "above", personId };
}

function below(personId: number): PositionAtom {
  return { type: "below", personId };
}

function between(person1Id: number, person2Id: number): PositionAtom {
  return { type: "between", person1Id, person2Id };
}

function chain(polarity: PolarityAtom, ...steps: Atom[]): AtomChain {
  return { polarity, steps };
}

// ========== Natural Language Converter ==========

function atomChainToText(atomChain: AtomChain, characters: Character[]): string {
  const COLS = ["A", "B", "C", "D"];

  const polarityNoun = atomChain.polarity.type === "pos" ? "cultivator" : "demon";
  const polarityNounPlural = atomChain.polarity.type === "pos" ? "cultivators" : "demons-in-disguise";

  let quantifierPhrase = "";
  let groupModifier = ""; // Restricts subject domain (e.g., "in row 3")
  let property = ""; // From be() atom
  const predicates: string[] = []; // Positional predicates

  let count = 1;
  let needsPlural = false;
  let neighborPersonId: number | null = null;

  // Collect all atom information
  for (const step of atomChain.steps) {
    switch (step.type) {
      case "exact":
        quantifierPhrase = `exactly ${step.n}`;
        count = step.n;
        needsPlural = step.n !== 1;
        break;
      case "atLeast":
        quantifierPhrase = `at least ${step.n}`;
        count = step.n;
        needsPlural = true;
        break;
      case "atMost":
        quantifierPhrase = `at most ${step.n}`;
        count = step.n;
        needsPlural = step.n !== 1;
        break;
      case "all":
        quantifierPhrase = "all";
        needsPlural = true;
        break;
      case "even":
        quantifierPhrase = "an even number of";
        needsPlural = true;
        break;
      case "odd":
        quantifierPhrase = "an odd number of";
        needsPlural = true;
        break;
      case "row":
        groupModifier = ` in row ${step.r + 1}`;
        break;
      case "column":
        groupModifier = ` in column ${COLS[step.c]}`;
        break;
      case "neighbor":
        neighborPersonId = step.personId;
        break;
      case "be":
        property = step.label;
        break;
      case "above":
        predicates.push(`somewhere above ${characters[step.personId].name}`);
        break;
      case "below":
        predicates.push(`somewhere below ${characters[step.personId].name}`);
        break;
      case "between":
        predicates.push(`between ${characters[step.person1Id].name} and ${characters[step.person2Id].name}`);
        break;
    }
  }

  // Special handling for neighbor atoms
  if (neighborPersonId !== null) {
    const personName = characters[neighborPersonId].name;
    const noun = needsPlural ? polarityNounPlural : polarityNoun;
    const neighborWord = needsPlural || count > 1 ? "neighbors" : "neighbor";
    return `${personName} has ${quantifierPhrase} ${noun} ${neighborWord}.`;
  }

  // Build sentence: Subject + Verb + Predicate
  const noun = needsPlural ? polarityNounPlural : polarityNoun;
  const verb = needsPlural || count > 1 ? "are" : "is";

  // Subject = Quantifier + Noun + GroupModifier
  const subject = quantifierPhrase
    ? `${quantifierPhrase.charAt(0).toUpperCase() + quantifierPhrase.slice(1)} ${noun}${groupModifier}`
    : `${noun}${groupModifier}`;

  // Build predicate parts
  const predicateParts: string[] = [];

  if (property) {
    predicateParts.push(property);
  }

  if (predicates.length > 0) {
    predicateParts.push(...predicates);
  }

  // If no predicate parts and we have a group modifier, make it the predicate
  if (predicateParts.length === 0 && groupModifier) {
    return `${quantifierPhrase.charAt(0).toUpperCase() + quantifierPhrase.slice(1)} ${noun} ${verb}${groupModifier}.`;
  }

  // Join predicate parts
  const predicate = predicateParts.join(" and ");

  return `${subject} ${verb} ${predicate}.`;
}

// ========== Character and Puzzle Generation ==========

function buildCharacters(): Character[] {
  const names = generateNames(TOTAL_CHARACTERS);
  const demonCount = 6 + Math.floor(Math.random() * 3);
  const demonIds = new Set(shuffle([...Array(TOTAL_CHARACTERS).keys()]).slice(0, demonCount));

  return names.map((name, idx) => {
    const row = Math.floor(idx / GRID_COLS);
    const col = idx % GRID_COLS;
    const identity: Identity = demonIds.has(idx) ? "DEMON" : "CULTIVATOR";
    return {
      id: idx,
      name,
      row,
      col,
      identity,
      spiritualRoot: buildSpiritualRoot(),
      clue: null,
      isRevealed: false,
    };
  });
}

function buildIndexes(characters: Character[]): PuzzleIndexes {
  const rows: Record<number, number[]> = {};
  const cols: Record<number, number[]> = {};
  const neighbors: Record<number, number[]> = {};
  const elementGroups: Record<Element, number[]> = {
    Metal: [],
    Wood: [],
    Water: [],
    Fire: [],
    Earth: [],
  };

  for (let r = 0; r < GRID_ROWS; r += 1) rows[r] = [];
  for (let c = 0; c < GRID_COLS; c += 1) cols[c] = [];

  characters.forEach((person) => {
    rows[person.row].push(person.id);
    cols[person.col].push(person.id);
    person.spiritualRoot.forEach((element) => {
      elementGroups[element].push(person.id);
    });
  });

  characters.forEach((person) => {
    neighbors[person.id] = characters
      .filter((p) => p.id !== person.id && areNeighbors(person, p))
      .map((p) => p.id);
  });

  return { rows, cols, neighbors, elementGroups };
}

// ========== Atom Chain Candidate Generation ==========

function buildCandidates(characters: Character[], indexes: PuzzleIndexes): Record<number, AtomChain[]> {
  const candidates: Record<number, AtomChain[]> = {};

  // Precompute stats
  const rowDemons: Record<number, number[]> = {};
  const rowCultivators: Record<number, number[]> = {};
  const colDemons: Record<number, number[]> = {};
  const colCultivators: Record<number, number[]> = {};

  for (let r = 0; r < GRID_ROWS; r += 1) {
    rowDemons[r] = [];
    rowCultivators[r] = [];
  }
  for (let c = 0; c < GRID_COLS; c += 1) {
    colDemons[c] = [];
    colCultivators[c] = [];
  }

  characters.forEach((person) => {
    if (person.identity === "DEMON") {
      rowDemons[person.row].push(person.id);
      colDemons[person.col].push(person.id);
    } else {
      rowCultivators[person.row].push(person.id);
      colCultivators[person.col].push(person.id);
    }
  });

  characters.forEach((speaker) => {
    const list: AtomChain[] = [];

    // Direct person clues: pos().exact(1).neighbor(targetId) or neg().exact(1).neighbor(targetId)
    characters.forEach((target) => {
      if (target.id === speaker.id) return;
      const targetIdentity = target.identity === "DEMON" ? "neg" : "pos";
      // Simple direct reference: "Exactly 1 cultivator/demon neighbor of X" where X is the target
      list.push(chain(targetIdentity === "pos" ? pos() : neg(), exact(1), neighbor(target.id)));
    });

    // Row/Column "only one" clues
    Object.keys(rowDemons).forEach((rowKey) => {
      const r = Number(rowKey);
      if (rowDemons[r].length === 1) {
        list.push(chain(neg(), exact(1), row(r)));
      }
      if (rowCultivators[r].length === 1) {
        list.push(chain(pos(), exact(1), row(r)));
      }
    });

    Object.keys(colDemons).forEach((colKey) => {
      const c = Number(colKey);
      if (colDemons[c].length === 1) {
        list.push(chain(neg(), exact(1), column(c)));
      }
      if (colCultivators[c].length === 1) {
        list.push(chain(pos(), exact(1), column(c)));
      }
    });

    // All in row/column
    Object.keys(rowDemons).forEach((rowKey) => {
      const r = Number(rowKey);
      const rowIds = indexes.rows[r];
      if (rowIds.every((id) => characters[id].identity === "DEMON")) {
        list.push(chain(neg(), all(), row(r)));
      }
      if (rowIds.every((id) => characters[id].identity === "CULTIVATOR")) {
        list.push(chain(pos(), all(), row(r)));
      }
    });

    Object.keys(colDemons).forEach((colKey) => {
      const c = Number(colKey);
      const colIds = indexes.cols[c];
      if (colIds.every((id) => characters[id].identity === "DEMON")) {
        list.push(chain(neg(), all(), column(c)));
      }
      if (colIds.every((id) => characters[id].identity === "CULTIVATOR")) {
        list.push(chain(pos(), all(), column(c)));
      }
    });

    // Neighbor count: exact(n) demons/cultivators neighbor of speaker
    const neighborIds = indexes.neighbors[speaker.id];
    const demonNeighbors = neighborIds.filter((id) => characters[id].identity === "DEMON");
    const cultivatorNeighbors = neighborIds.filter((id) => characters[id].identity === "CULTIVATOR");

    if (demonNeighbors.length > 0) {
      list.push(chain(neg(), exact(demonNeighbors.length), neighbor(speaker.id)));
    }
    if (cultivatorNeighbors.length > 0) {
      list.push(chain(pos(), exact(cultivatorNeighbors.length), neighbor(speaker.id)));
    }
    if (neighborIds.every((id) => characters[id].identity === "DEMON")) {
      list.push(chain(neg(), all(), neighbor(speaker.id)));
    }
    if (neighborIds.every((id) => characters[id].identity === "CULTIVATOR")) {
      list.push(chain(pos(), all(), neighbor(speaker.id)));
    }

    // Spiritual root element clues
    ELEMENTS.forEach((element) => {
      const group = indexes.elementGroups[element];
      if (group.length === 0) return;
      const demonsWithElement = group.filter((id) => characters[id].identity === "DEMON").length;
      const cultivatorsWithElement = group.length - demonsWithElement;

      if (demonsWithElement > 0) {
        list.push(chain(neg(), exact(demonsWithElement), be(element)));
      }
      if (cultivatorsWithElement > 0) {
        list.push(chain(pos(), exact(cultivatorsWithElement), be(element)));
      }
      if (group.every((id) => characters[id].identity === "DEMON")) {
        list.push(chain(neg(), all(), be(element)));
      }
      if (group.every((id) => characters[id].identity === "CULTIVATOR")) {
        list.push(chain(pos(), all(), be(element)));
      }
    });

    // Positional clues: above/below/between
    characters.forEach((target) => {
      if (target.id === speaker.id) return;

      // Above
      const aboveIds = characters.filter((p) => p.col === speaker.col && p.row < speaker.row).map((p) => p.id);
      if (aboveIds.length > 0) {
        const demonsAbove = aboveIds.filter((id) => characters[id].identity === "DEMON").length;
        const cultivatorsAbove = aboveIds.length - demonsAbove;
        if (demonsAbove > 0 && aboveIds.includes(target.id) && characters[target.id].identity === "DEMON") {
          list.push(chain(neg(), exact(demonsAbove), above(speaker.id)));
        }
        if (cultivatorsAbove > 0 && aboveIds.includes(target.id) && characters[target.id].identity === "CULTIVATOR") {
          list.push(chain(pos(), exact(cultivatorsAbove), above(speaker.id)));
        }
      }

      // Below
      const belowIds = characters.filter((p) => p.col === speaker.col && p.row > speaker.row).map((p) => p.id);
      if (belowIds.length > 0) {
        const demonsBelow = belowIds.filter((id) => characters[id].identity === "DEMON").length;
        const cultivatorsBelow = belowIds.length - demonsBelow;
        if (demonsBelow > 0 && belowIds.includes(target.id) && characters[target.id].identity === "DEMON") {
          list.push(chain(neg(), exact(demonsBelow), below(speaker.id)));
        }
        if (cultivatorsBelow > 0 && belowIds.includes(target.id) && characters[target.id].identity === "CULTIVATOR") {
          list.push(chain(pos(), exact(cultivatorsBelow), below(speaker.id)));
        }
      }
    });

    // Between clues
    for (let i = 0; i < characters.length; i += 1) {
      for (let j = i + 1; j < characters.length; j += 1) {
        const betweenList = betweenIds(characters, i, j);
        if (betweenList.length === 0) continue;
        const demonsBetween = betweenList.filter((id) => characters[id].identity === "DEMON").length;
        const cultivatorsBetween = betweenList.length - demonsBetween;
        if (demonsBetween > 0) {
          list.push(chain(neg(), exact(demonsBetween), between(i, j)));
        }
        if (cultivatorsBetween > 0) {
          list.push(chain(pos(), exact(cultivatorsBetween), between(i, j)));
        }
      }
    }

    candidates[speaker.id] = list;
  });

  return candidates;
}

function applyCluesToCharacters(characters: Character[], candidates: Record<number, AtomChain[]>): Character[] {
  return characters.map((character) => {
    const speakerCandidates = candidates[character.id];
    const selectedChain = sample(speakerCandidates);
    const text = atomChainToText(selectedChain, characters);
    const clue: Clue = {
      chain: selectedChain,
      text,
      speakerId: character.id,
    };
    return { ...character, clue };
  });
}

// ========== Constraint Checking ==========

function minMaxDemons(ids: number[], assignment: Array<boolean | null>) {
  let min = 0;
  let max = 0;
  ids.forEach((id) => {
    const val = assignment[id];
    if (val === true) {
      min += 1;
      max += 1;
    } else if (val === null) {
      max += 1;
    }
  });
  return { min, max };
}

function getAffectedIds(atomChain: AtomChain, characters: Character[], indexes: PuzzleIndexes, speakerId: number): number[] {
  let affected: number[] = [];

  for (const step of atomChain.steps) {
    switch (step.type) {
      case "row":
        affected = indexes.rows[step.r];
        break;
      case "column":
        affected = indexes.cols[step.c];
        break;
      case "neighbor":
        affected = indexes.neighbors[step.personId];
        break;
      case "be":
        affected = indexes.elementGroups[step.label as Element] || [];
        break;
      case "above": {
        const anchor = characters[step.personId];
        affected = characters.filter((p) => p.col === anchor.col && p.row < anchor.row).map((p) => p.id);
        break;
      }
      case "below": {
        const anchor = characters[step.personId];
        affected = characters.filter((p) => p.col === anchor.col && p.row > anchor.row).map((p) => p.id);
        break;
      }
      case "between": {
        affected = betweenIds(characters, step.person1Id, step.person2Id);
        break;
      }
    }
  }

  return affected.length > 0 ? affected : [speakerId];
}

function getExpectedDemonCount(atomChain: AtomChain, affectedIds: number[]): { min: number; max: number } | null {
  const isDemon = atomChain.polarity.type === "neg";

  for (const step of atomChain.steps) {
    if (step.type === "exact") {
      const count = isDemon ? step.n : affectedIds.length - step.n;
      return { min: count, max: count };
    }
    if (step.type === "all") {
      const count = isDemon ? affectedIds.length : 0;
      return { min: count, max: count };
    }
  }

  return null;
}

function cluesConsistent(characters: Character[], indexes: PuzzleIndexes, assignment: Array<boolean | null>): boolean {
  const clues = characters.map((c) => c.clue).filter(Boolean) as Clue[];

  for (const clue of clues) {
    const affectedIds = getAffectedIds(clue.chain, characters, indexes, clue.speakerId);
    const expected = getExpectedDemonCount(clue.chain, affectedIds);

    if (expected) {
      const { min, max } = minMaxDemons(affectedIds, assignment);
      if (expected.min > max || expected.max < min) {
        return false;
      }
    }
  }

  return true;
}

function hasUniqueSolution(characters: Character[], indexes: PuzzleIndexes): boolean {
  const truth = characters.map((c) => c.identity === "DEMON");
  const assignment: Array<boolean | null> = Array(characters.length).fill(null);

  const cluesValid = cluesConsistent(characters, indexes, assignment);
  if (!cluesValid) return false;

  let foundAlternative = false;

  function backtrack(nextIdx: number) {
    if (foundAlternative) return;
    if (nextIdx === characters.length) {
      const matchesTruth = assignment.every((val, idx) => val === truth[idx]);
      if (!matchesTruth) foundAlternative = true;
      return;
    }

    if (assignment[nextIdx] !== null) {
      backtrack(nextIdx + 1);
      return;
    }

    [true, false].forEach((val) => {
      if (foundAlternative) return;
      assignment[nextIdx] = val;
      if (cluesConsistent(characters, indexes, assignment)) {
        backtrack(nextIdx + 1);
      }
      assignment[nextIdx] = null;
    });
  }

  backtrack(0);
  return !foundAlternative;
}

// ========== Deduction Engine ==========

function runDeduction(
  characters: Character[],
  indexes: PuzzleIndexes,
  revealed: Set<number>,
): Array<Identity | "UNKNOWN"> {
  const state: Array<Identity | "UNKNOWN"> = Array(characters.length).fill("UNKNOWN");
  revealed.forEach((id) => {
    state[id] = characters[id].identity;
  });

  const setState = (id: number, identity: Identity) => {
    if (state[id] === "UNKNOWN") {
      state[id] = identity;
      return true;
    }
    return false;
  };

  let progress = true;
  while (progress) {
    progress = false;

    characters.forEach((speaker) => {
      if (!revealed.has(speaker.id) || !speaker.clue) return;
      const { chain } = speaker.clue;

      const affectedIds = getAffectedIds(chain, characters, indexes, speaker.id);
      const expected = getExpectedDemonCount(chain, affectedIds);

      if (!expected) return;

      const isDemon = chain.polarity.type === "neg";
      const knownDemons = affectedIds.filter((id) => state[id] === "DEMON");
      const knownCultivators = affectedIds.filter((id) => state[id] === "CULTIVATOR");
      const unknown = affectedIds.filter((id) => state[id] === "UNKNOWN");

      // If we've reached the demon quota, mark the rest as cultivators
      if (knownDemons.length >= expected.max) {
        unknown.forEach((id) => {
          progress = setState(id, "CULTIVATOR") || progress;
        });
      }

      // If we've reached the cultivator quota, mark the rest as demons
      if (knownCultivators.length >= affectedIds.length - expected.min) {
        unknown.forEach((id) => {
          progress = setState(id, "DEMON") || progress;
        });
      }
    });
  }

  return state;
}

function findDeducible(characters: Character[], indexes: PuzzleIndexes, revealed: Set<number>) {
  const state = runDeduction(characters, indexes, revealed);
  return characters
    .filter((c) => !revealed.has(c.id) && state[c.id] !== "UNKNOWN")
    .map((c) => ({ id: c.id, identity: state[c.id] as Identity }));
}

function simulateSequentialSolve(characters: Character[], indexes: PuzzleIndexes, startId: number): boolean {
  const revealed = new Set<number>([startId]);
  let guard = 0;

  while (revealed.size < characters.length && guard < characters.length * 3) {
    guard += 1;
    const deducible = findDeducible(characters, indexes, revealed);
    if (deducible.length === 0) return false;
    revealed.add(deducible[0].id);
  }

  return revealed.size === characters.length;
}

function validatePuzzle(puzzle: Puzzle): boolean {
  const { characters, indexes, startId } = puzzle;
  if (!cluesConsistent(characters, indexes, Array(characters.length).fill(null))) return false;
  if (!hasUniqueSolution(characters, indexes)) return false;
  if (!simulateSequentialSolve(characters, indexes, startId)) return false;
  return true;
}

function generatePuzzle(): Puzzle {
  let attempts = 0;
  const maxAttempts = 120;

  while (attempts < maxAttempts) {
    attempts += 1;
    const baseCharacters = buildCharacters();
    const indexes = buildIndexes(baseCharacters);
    const candidates = buildCandidates(baseCharacters, indexes);
    const withClues = applyCluesToCharacters(baseCharacters, candidates);
    const startId = Math.floor(Math.random() * TOTAL_CHARACTERS);
    const puzzle: Puzzle = {
      characters: withClues,
      indexes,
      startId,
    };
    if (validatePuzzle(puzzle)) {
      return puzzle;
    }
  }

  throw new Error("Failed to generate a valid puzzle after multiple attempts");
}

// ========== Game Component ==========

type GameCharacter = Character & { cornerTag: number };

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function canDeduceIdentity(
  characters: GameCharacter[],
  indexes: PuzzleIndexes,
  targetId: number,
): { canDeduce: boolean; identity: Identity | null } {
  const revealed = new Set<number>(characters.filter((c) => c.isRevealed).map((c) => c.id));
  const state = runDeduction(characters, indexes, revealed);
  if (state[targetId] === "UNKNOWN") return { canDeduce: false, identity: null };
  return { canDeduce: true, identity: state[targetId] as Identity };
}

export default function Game() {
  const createPuzzleState = useMemo(
    () => () => {
      const puzzle = generatePuzzle();
      return {
        indexes: puzzle.indexes,
        characters: puzzle.characters.map((c) => ({
          ...c,
          isRevealed: c.id === puzzle.startId,
          cornerTag: 0,
        })),
      };
    },
    [],
  );

  const [puzzleState, setPuzzleState] = useState<{
    indexes: PuzzleIndexes;
    characters: GameCharacter[];
  } | null>(null);
  const [selected, setSelected] = useState<GameCharacter | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [debugRevealAll, setDebugRevealAll] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  const characters = puzzleState?.characters ?? [];
  const indexes = puzzleState?.indexes ?? null;
  const isReady = Boolean(puzzleState);
  const isComplete = useMemo(() => characters.length > 0 && characters.every((c) => c.isRevealed), [characters]);

  const updateCharacters = (updater: (prev: GameCharacter[]) => GameCharacter[]) => {
    setPuzzleState((prev) => (prev ? { ...prev, characters: updater(prev.characters) } : prev));
  };

  const bootPuzzle = useCallback(() => {
    const next = createPuzzleState();
    setPuzzleState(next);
    setStartTime(Date.now());
    setEndTime(null);
    setSelected(null);
    setWarning(null);
    setDebugRevealAll(false);
  }, [createPuzzleState]);

  useEffect(() => {
    bootPuzzle();
  }, [bootPuzzle]);

  const regenerate = () => {
    setPuzzleState(null);
    setTimeout(bootPuzzle, 0);
  };

  const handleIdentify = (guess: Identity) => {
    if (!selected || !indexes) return;
    const { canDeduce, identity } = canDeduceIdentity(characters, indexes, selected.id);
    if (!canDeduce || identity !== guess) {
      setWarning("Not enough evidence for that choice yet.");
      setSelected(null);
      return;
    }

    updateCharacters((prev) => {
      const next = prev.map((p) => (p.id === selected.id ? { ...p, isRevealed: true } : p));
      if (next.every((p) => p.isRevealed) && !endTime) {
        setEndTime(Date.now());
      }
      return next;
    });
    setSelected(null);
  };

  const deducibleList = useMemo(() => {
    if (!indexes) return [];
    const revealed = new Set<number>(characters.filter((c) => c.isRevealed).map((c) => c.id));
    return findDeducible(characters, indexes, revealed);
  }, [characters, indexes]);

  const shareText = useMemo(() => {
    if (!startTime || !endTime) return "";
    return `Cultivators or Demon-In-Disguise? - ${formatTime(endTime - startTime)}`;
  }, [startTime, endTime]);

  if (!isReady) {
    return (
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 0", textAlign: "center" }}>
        <div style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 8 }}>Loading puzzle...</div>
        <div style={{ color: "#9ca3af" }}>Generating a fresh set of clues.</div>
      </div>
    );
  }

  const COL_LABELS = ["A", "B", "C", "D"];

  return (
    <>
      <header style={{ textAlign: "center", marginBottom: 16 }}>
        <h1
          style={{
            fontSize: "1.4rem",
            margin: 0,
            background: "linear-gradient(135deg, #c084fc, #60a5fa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Cultivators or Demon-In-Disguise?
        </h1>
        <p style={{ margin: 0, color: "#9ca3af", fontSize: "0.85rem" }}>
          Deduce every identity using the truth-bound clues.
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "20px repeat(4, 1fr)", gap: 6, maxWidth: 520, margin: "0 auto 6px" }}>
        <div />
        {COL_LABELS.map((col) => (
          <div key={col} style={{ textAlign: "center", color: "#666", fontSize: "0.75rem", fontWeight: 700 }}>
            {col}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "20px repeat(4, 1fr)", gap: 6, maxWidth: 520, margin: "0 auto 16px" }}>
        {[0, 1, 2, 3, 4].map((row) => (
          <React.Fragment key={row}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#666", fontSize: "0.75rem", fontWeight: 700 }}>
              {row + 1}
            </div>
            {characters
              .filter((p) => p.row === row)
              .sort((a, b) => a.col - b.col)
              .map((person) => {
                const revealed = person.isRevealed || debugRevealAll;
                return (
                  <div
                    key={person.id}
                    className="card"
                    onClick={() => (!revealed ? setSelected(person) : null)}
                    style={{
                      padding: 8,
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: revealed
                        ? person.identity === "DEMON"
                          ? "linear-gradient(145deg, #7f1d1d, #991b1b)"
                          : "linear-gradient(145deg, #14532d, #166534)"
                        : "linear-gradient(145deg, #2a2a3d, #1e1e2f)",
                      cursor: revealed ? "default" : "pointer",
                      position: "relative",
                      minHeight: revealed ? 110 : 80,
                    }}
                  >
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        updateCharacters((prev) =>
                          prev.map((p) =>
                            p.id === person.id ? { ...p, cornerTag: (p.cornerTag + 1) % CORNER_COLORS.length } : p,
                          ),
                        );
                      }}
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        width: 14,
                        height: 14,
                        borderRadius: 3,
                        background: CORNER_COLORS[person.cornerTag],
                        border: person.cornerTag === 0 ? "1px dashed rgba(255,255,255,0.2)" : "none",
                        cursor: "pointer",
                      }}
                    />
                    {revealed && (
                      <div style={{ position: "absolute", top: 4, left: 6, fontSize: "0.85rem" }}>
                        {person.identity === "DEMON" ? "👹" : "🧘"}
                      </div>
                    )}
                    <div style={{ fontWeight: 700, fontSize: "0.75rem", marginTop: revealed ? 16 : 0 }}>{person.name}</div>
                    <div style={{ color: "#9ca3af", fontSize: "0.65rem", marginTop: 2 }}>
                      {person.spiritualRoot.join("-")}
                    </div>
                    {revealed && person.clue && <div className="clue-text">{person.clue.text}</div>}
                  </div>
                );
              })}
          </React.Fragment>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 16 }}>
        <button
          className="btn"
          onClick={() => setDebugRevealAll((v) => !v)}
          style={{
            background: debugRevealAll ? "linear-gradient(135deg, #ef4444, #dc2626)" : "rgba(255,255,255,0.12)",
            color: debugRevealAll ? "white" : "#d1d5db",
          }}
        >
          {debugRevealAll ? "Hide All" : "Debug Reveal"}
        </button>
        <button
          className="btn"
          onClick={regenerate}
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}
        >
          New Puzzle
        </button>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <div style={{ fontSize: "2rem", marginBottom: 6 }}>🔍</div>
              <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>{selected.name}</div>
              <div style={{ color: "#9ca3af", fontSize: "0.85rem" }}>{selected.spiritualRoot.join("-")}</div>
            </div>
            <p style={{ textAlign: "center", color: "#d1d5db", marginBottom: 14 }}>What is this person&apos;s identity?</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn"
                onClick={() => handleIdentify("CULTIVATOR")}
                style={{ flex: 1, background: "linear-gradient(135deg, #14532d, #22c55e)", color: "white" }}
              >
                🧘 Cultivator
              </button>
              <button
                className="btn"
                onClick={() => handleIdentify("DEMON")}
                style={{ flex: 1, background: "linear-gradient(135deg, #7f1d1d, #ef4444)", color: "white" }}
              >
                👹 Demon
              </button>
            </div>
            <button
              className="btn"
              onClick={() => setSelected(null)}
              style={{
                marginTop: 10,
                width: "100%",
                background: "rgba(255,255,255,0.08)",
                color: "#d1d5db",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {warning && (
        <div className="modal-overlay" onClick={() => setWarning(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 10px", color: "#fbbf24" }}>Not enough evidence!</h3>
            <p style={{ color: "#d1d5db" }}>{warning}</p>
            <button
              className="btn"
              onClick={() => setWarning(null)}
              style={{ marginTop: 8, width: "100%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {isComplete && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 style={{ margin: "0 0 8px", textAlign: "center", color: "#22c55e" }}>Puzzle complete!</h2>
            {startTime && endTime && (
              <p style={{ textAlign: "center", color: "#d1d5db" }}>
                Time: {formatTime(endTime - startTime)}
              </p>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn"
                onClick={() => navigator.clipboard?.writeText(shareText)}
                style={{ flex: 1, background: "rgba(255,255,255,0.08)", color: "#d1d5db" }}
              >
                Copy Result
              </button>
              <button
                className="btn"
                onClick={regenerate}
                style={{ flex: 1, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      <section style={{ maxWidth: 720, margin: "18px auto" }}>
        <div style={{ color: "#9ca3af", fontSize: "0.85rem", marginBottom: 8 }}>
          Next deducible identities ({deducibleList.length}):{" "}
          {deducibleList
            .map(
              (d) =>
                `${characters[d.id].name} (${d.identity === "DEMON" ? "👹" : "🧘"})`,
            )
            .join(", ")}
        </div>
      </section>
    </>
  );
}
