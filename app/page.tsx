"use client";

import React, { useMemo, useState } from "react";
import DetailedExplanation from "./components/DetailedExplanation";
import Rules from "./components/Rules";

type Identity = "DEMON" | "CULTIVATOR";
type Element = "Metal" | "Wood" | "Water" | "Fire" | "Earth";

type ClueType =
  | "PERSON_IS_DEMON"
  | "PERSON_IS_CULTIVATOR"
  | "ONLY_DEMON_IN_ROW"
  | "ONLY_CULTIVATOR_IN_ROW"
  | "ONLY_DEMON_IN_COLUMN"
  | "ONLY_CULTIVATOR_IN_COLUMN"
  | "N_NEIGHBORS_A_DAEMON"
  | "N_NEIGHBORS_A_CULTIVATOR"
  | "M_OF_N_DEMONS_NEIGHBORING_IN_ROW"
  | "M_OF_N_DEMONS_NEIGHBORING_IN_COLUMN"
  | "M_OF_N_CULTIVATORS_NEIGHBORING_IN_ROW"
  | "M_OF_N_CULTIVATORS_NEIGHBORING_IN_COLUMN"
  | "M_OF_N_SPIRITUAL_ROOT_ELEMENT_BE_DEMON"
  | "M_OF_N_SPIRITUAL_ROOT_ELEMENT_BE_CULTIVATOR";

type ClueParams = {
  targetId?: number;
  subjectId?: number;
  mentionedId?: number;
  row?: number;
  col?: number;
  N?: number;
  M?: number;
  element?: Element;
};

type Clue = {
  type: ClueType;
  text: string;
  params: ClueParams;
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

type ClueCandidate = {
  type: ClueType;
  targetId?: number;
  subjectId?: number;
  mentionedId?: number;
  row?: number;
  col?: number;
  N?: number;
  M?: number;
  element?: Element;
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
const CLUE_CONFIG: Record<ClueType, boolean> = {
  PERSON_IS_DEMON: true,
  PERSON_IS_CULTIVATOR: true,
  ONLY_DEMON_IN_ROW: true,
  ONLY_CULTIVATOR_IN_ROW: true,
  ONLY_DEMON_IN_COLUMN: true,
  ONLY_CULTIVATOR_IN_COLUMN: true,
  N_NEIGHBORS_A_DAEMON: true,
  N_NEIGHBORS_A_CULTIVATOR: true,
  M_OF_N_DEMONS_NEIGHBORING_IN_ROW: true,
  M_OF_N_DEMONS_NEIGHBORING_IN_COLUMN: true,
  M_OF_N_CULTIVATORS_NEIGHBORING_IN_ROW: true,
  M_OF_N_CULTIVATORS_NEIGHBORING_IN_COLUMN: true,
  M_OF_N_SPIRITUAL_ROOT_ELEMENT_BE_DEMON: true,
  M_OF_N_SPIRITUAL_ROOT_ELEMENT_BE_CULTIVATOR: true,
};

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

function buildCandidates(characters: Character[], indexes: PuzzleIndexes): Record<number, ClueCandidate[]> {
  const rowDemons: Record<number, number[]> = {};
  const rowCultivators: Record<number, number[]> = {};
  const colDemons: Record<number, number[]> = {};
  const colCultivators: Record<number, number[]> = {};
  const demonNeighbors: Record<number, number[]> = {};
  const cultivatorNeighbors: Record<number, number[]> = {};

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

  characters.forEach((person) => {
    const neighborIds = indexes.neighbors[person.id];
    demonNeighbors[person.id] = neighborIds.filter((id) => characters[id].identity === "DEMON");
    cultivatorNeighbors[person.id] = neighborIds.filter((id) => characters[id].identity === "CULTIVATOR");
  });

  const candidates: Record<number, ClueCandidate[]> = {};

  characters.forEach((speaker) => {
    const list: ClueCandidate[] = [];

    characters.forEach((target) => {
      if (target.id === speaker.id) return;
      if (target.identity === "DEMON" && CLUE_CONFIG.PERSON_IS_DEMON) {
        list.push({ type: "PERSON_IS_DEMON", targetId: target.id });
      }
      if (target.identity === "CULTIVATOR" && CLUE_CONFIG.PERSON_IS_CULTIVATOR) {
        list.push({ type: "PERSON_IS_CULTIVATOR", targetId: target.id });
      }
    });

    Object.keys(rowDemons).forEach((rowKey) => {
      const r = Number(rowKey);
      if (rowDemons[r].length === 1 && CLUE_CONFIG.ONLY_DEMON_IN_ROW) {
        list.push({ type: "ONLY_DEMON_IN_ROW", subjectId: rowDemons[r][0], row: r });
      }
      if (rowCultivators[r].length === 1 && CLUE_CONFIG.ONLY_CULTIVATOR_IN_ROW) {
        list.push({ type: "ONLY_CULTIVATOR_IN_ROW", subjectId: rowCultivators[r][0], row: r });
      }
    });

    Object.keys(colDemons).forEach((colKey) => {
      const c = Number(colKey);
      if (colDemons[c].length === 1 && CLUE_CONFIG.ONLY_DEMON_IN_COLUMN) {
        list.push({ type: "ONLY_DEMON_IN_COLUMN", subjectId: colDemons[c][0], col: c });
      }
      if (colCultivators[c].length === 1 && CLUE_CONFIG.ONLY_CULTIVATOR_IN_COLUMN) {
        list.push({ type: "ONLY_CULTIVATOR_IN_COLUMN", subjectId: colCultivators[c][0], col: c });
      }
    });

    const demonN = demonNeighbors[speaker.id].length;
    const cultivatorN = cultivatorNeighbors[speaker.id].length;

    if (demonN > 0 && CLUE_CONFIG.N_NEIGHBORS_A_DAEMON) {
      demonNeighbors[speaker.id].forEach((neighborId) => {
        list.push({ type: "N_NEIGHBORS_A_DAEMON", mentionedId: neighborId, N: demonN, subjectId: speaker.id });
      });
    }

    if (cultivatorN > 0 && CLUE_CONFIG.N_NEIGHBORS_A_CULTIVATOR) {
      cultivatorNeighbors[speaker.id].forEach((neighborId) => {
        list.push({ type: "N_NEIGHBORS_A_CULTIVATOR", mentionedId: neighborId, N: cultivatorN, subjectId: speaker.id });
      });
    }

    if (CLUE_CONFIG.M_OF_N_DEMONS_NEIGHBORING_IN_ROW && demonN > 0) {
      for (let r = 0; r < GRID_ROWS; r += 1) {
        const m = demonNeighbors[speaker.id].filter((id) => characters[id].row === r).length;
        if (m > 0) {
          list.push({
            type: "M_OF_N_DEMONS_NEIGHBORING_IN_ROW",
            M: m,
            N: demonN,
            row: r,
            subjectId: speaker.id,
          });
        }
      }
    }

    if (CLUE_CONFIG.M_OF_N_DEMONS_NEIGHBORING_IN_COLUMN && demonN > 0) {
      for (let c = 0; c < GRID_COLS; c += 1) {
        const m = demonNeighbors[speaker.id].filter((id) => characters[id].col === c).length;
        if (m > 0) {
          list.push({
            type: "M_OF_N_DEMONS_NEIGHBORING_IN_COLUMN",
            M: m,
            N: demonN,
            col: c,
            subjectId: speaker.id,
          });
        }
      }
    }

    if (CLUE_CONFIG.M_OF_N_CULTIVATORS_NEIGHBORING_IN_ROW && cultivatorN > 0) {
      for (let r = 0; r < GRID_ROWS; r += 1) {
        const m = cultivatorNeighbors[speaker.id].filter((id) => characters[id].row === r).length;
        if (m > 0) {
          list.push({
            type: "M_OF_N_CULTIVATORS_NEIGHBORING_IN_ROW",
            M: m,
            N: cultivatorN,
            row: r,
            subjectId: speaker.id,
          });
        }
      }
    }

    if (CLUE_CONFIG.M_OF_N_CULTIVATORS_NEIGHBORING_IN_COLUMN && cultivatorN > 0) {
      for (let c = 0; c < GRID_COLS; c += 1) {
        const m = cultivatorNeighbors[speaker.id].filter((id) => characters[id].col === c).length;
        if (m > 0) {
          list.push({
            type: "M_OF_N_CULTIVATORS_NEIGHBORING_IN_COLUMN",
            M: m,
            N: cultivatorN,
            col: c,
            subjectId: speaker.id,
          });
        }
      }
    }

    ELEMENTS.forEach((element) => {
      const group = indexes.elementGroups[element];
      const total = group.length;
      if (total === 0) return;

      const demonCount = group.filter((id) => characters[id].identity === "DEMON").length;
      const cultivatorCount = total - demonCount;

      if (demonCount > 0 && CLUE_CONFIG.M_OF_N_SPIRITUAL_ROOT_ELEMENT_BE_DEMON) {
        list.push({
          type: "M_OF_N_SPIRITUAL_ROOT_ELEMENT_BE_DEMON",
          element,
          M: demonCount,
          N: total,
        });
      }

      if (cultivatorCount > 0 && CLUE_CONFIG.M_OF_N_SPIRITUAL_ROOT_ELEMENT_BE_CULTIVATOR) {
        list.push({
          type: "M_OF_N_SPIRITUAL_ROOT_ELEMENT_BE_CULTIVATOR",
          element,
          M: cultivatorCount,
          N: total,
        });
      }
    });

    candidates[speaker.id] = list;
  });

  return candidates;
}

function clueText(candidate: ClueCandidate, speaker: Character, characters: Character[]): string {
  const COLS = ["A", "B", "C", "D"];
  const verb = (value: number | undefined) => (value === 0 || value === 1 ? "is" : "are");
  const targetName = (id?: number) => (id === undefined ? "" : characters[id].name);
  const subjectName = targetName(candidate.subjectId ?? speaker.id);

  switch (candidate.type) {
    case "PERSON_IS_DEMON":
      return `${targetName(candidate.targetId)} is a demon.`;
    case "PERSON_IS_CULTIVATOR":
      return `${targetName(candidate.targetId)} is a cultivator.`;
    case "ONLY_DEMON_IN_ROW":
      return `${targetName(candidate.subjectId)} is the only demon in row ${(candidate.row ?? 0) + 1}.`;
    case "ONLY_CULTIVATOR_IN_ROW":
      return `${targetName(candidate.subjectId)} is the only cultivator in row ${(candidate.row ?? 0) + 1}.`;
    case "ONLY_DEMON_IN_COLUMN":
      return `${targetName(candidate.subjectId)} is the only demon in column ${COLS[candidate.col ?? 0]}.`;
    case "ONLY_CULTIVATOR_IN_COLUMN":
      return `${targetName(candidate.subjectId)} is the only cultivator in column ${COLS[candidate.col ?? 0]}.`;
    case "N_NEIGHBORS_A_DAEMON":
      return `I have exactly ${candidate.N} demon neighbors and ${targetName(candidate.mentionedId)} is one of them.`;
    case "N_NEIGHBORS_A_CULTIVATOR":
      return `I have exactly ${candidate.N} cultivator neighbors and ${targetName(candidate.mentionedId)} is one of them.`;
    case "M_OF_N_DEMONS_NEIGHBORING_IN_ROW":
      return `Exactly ${candidate.M} of ${candidate.N} demon neighbors of ${subjectName} ${verb(candidate.M)} in row ${(candidate.row ?? 0) + 1}.`;
    case "M_OF_N_DEMONS_NEIGHBORING_IN_COLUMN":
      return `Exactly ${candidate.M} of ${candidate.N} demon neighbors of ${subjectName} ${verb(candidate.M)} in column ${COLS[candidate.col ?? 0]}.`;
    case "M_OF_N_CULTIVATORS_NEIGHBORING_IN_ROW":
      return `Exactly ${candidate.M} of ${candidate.N} cultivator neighbors of ${subjectName} ${verb(candidate.M)} in row ${(candidate.row ?? 0) + 1}.`;
    case "M_OF_N_CULTIVATORS_NEIGHBORING_IN_COLUMN":
      return `Exactly ${candidate.M} of ${candidate.N} cultivator neighbors of ${subjectName} ${verb(candidate.M)} in column ${COLS[candidate.col ?? 0]}.`;
    case "M_OF_N_SPIRITUAL_ROOT_ELEMENT_BE_DEMON":
      return `Exactly ${candidate.M} of ${candidate.N} people with ${candidate.element} spiritual root ${verb(candidate.M)} demons.`;
    case "M_OF_N_SPIRITUAL_ROOT_ELEMENT_BE_CULTIVATOR":
      return `Exactly ${candidate.M} of ${candidate.N} people with ${candidate.element} spiritual root ${verb(candidate.M)} cultivators.`;
    default:
      return "";
  }
}

function applyCluesToCharacters(characters: Character[], candidates: Record<number, ClueCandidate[]>): Character[] {
  return characters.map((character) => {
    const speakerCandidates = candidates[character.id];
    const candidate = sample(speakerCandidates);
    const text = clueText(candidate, character, characters);
    const params: ClueParams = {
      targetId: candidate.targetId,
      subjectId: candidate.subjectId,
      mentionedId: candidate.mentionedId,
      row: candidate.row,
      col: candidate.col,
      N: candidate.N,
      M: candidate.M,
      element: candidate.element,
    };
    const clue: Clue = {
      type: candidate.type,
      text,
      params,
      speakerId: character.id,
    };
    return { ...character, clue };
  });
}

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

function cluesConsistent(characters: Character[], indexes: PuzzleIndexes, assignment: Array<boolean | null>): boolean {
  const clues = characters.map((c) => c.clue).filter(Boolean) as Clue[];

  const equalityHolds = (ids: number[], expectedDemons: number) => {
    const { min, max } = minMaxDemons(ids, assignment);
    return expectedDemons >= min && expectedDemons <= max;
  };

  for (const clue of clues) {
    const { params, type, speakerId } = clue;

    switch (type) {
      case "PERSON_IS_DEMON":
        if (assignment[params.targetId!] === false) return false;
        break;
      case "PERSON_IS_CULTIVATOR":
        if (assignment[params.targetId!] === true) return false;
        break;
      case "ONLY_DEMON_IN_ROW": {
        const rowIds = indexes.rows[params.row!];
        if (!equalityHolds([params.subjectId!], 1)) return false;
        if (!equalityHolds(rowIds.filter((id) => id !== params.subjectId), 0)) return false;
        break;
      }
      case "ONLY_CULTIVATOR_IN_ROW": {
        const rowIds = indexes.rows[params.row!];
        if (!equalityHolds([params.subjectId!], 0)) return false;
        if (!equalityHolds(rowIds.filter((id) => id !== params.subjectId), rowIds.length - 1)) return false;
        break;
      }
      case "ONLY_DEMON_IN_COLUMN": {
        const colIds = indexes.cols[params.col!];
        if (!equalityHolds([params.subjectId!], 1)) return false;
        if (!equalityHolds(colIds.filter((id) => id !== params.subjectId), 0)) return false;
        break;
      }
      case "ONLY_CULTIVATOR_IN_COLUMN": {
        const colIds = indexes.cols[params.col!];
        if (!equalityHolds([params.subjectId!], 0)) return false;
        if (!equalityHolds(colIds.filter((id) => id !== params.subjectId), colIds.length - 1)) return false;
        break;
      }
      case "N_NEIGHBORS_A_DAEMON": {
        const neighborIds = indexes.neighbors[speakerId];
        if (!equalityHolds(neighborIds, params.N!)) return false;
        if (assignment[params.mentionedId!] === false) return false;
        break;
      }
      case "N_NEIGHBORS_A_CULTIVATOR": {
        const neighborIds = indexes.neighbors[speakerId];
        const expectedDemons = neighborIds.length - (params.N ?? 0);
        if (!equalityHolds(neighborIds, expectedDemons)) return false;
        if (assignment[params.mentionedId!] === true) return false;
        break;
      }
      case "M_OF_N_DEMONS_NEIGHBORING_IN_ROW": {
        const neighborIds = indexes.neighbors[params.subjectId!];
        const inRow = neighborIds.filter((id) => characters[id].row === params.row);
        if (!equalityHolds(neighborIds, params.N!)) return false;
        if (!equalityHolds(inRow, params.M!)) return false;
        break;
      }
      case "M_OF_N_DEMONS_NEIGHBORING_IN_COLUMN": {
        const neighborIds = indexes.neighbors[params.subjectId!];
        const inCol = neighborIds.filter((id) => characters[id].col === params.col);
        if (!equalityHolds(neighborIds, params.N!)) return false;
        if (!equalityHolds(inCol, params.M!)) return false;
        break;
      }
      case "M_OF_N_CULTIVATORS_NEIGHBORING_IN_ROW": {
        const neighborIds = indexes.neighbors[params.subjectId!];
        const inRow = neighborIds.filter((id) => characters[id].row === params.row);
        const expectedDemons = neighborIds.length - (params.N ?? 0);
        const expectedDemonsRow = inRow.length - (params.M ?? 0);
        if (!equalityHolds(neighborIds, expectedDemons)) return false;
        if (!equalityHolds(inRow, expectedDemonsRow)) return false;
        break;
      }
      case "M_OF_N_CULTIVATORS_NEIGHBORING_IN_COLUMN": {
        const neighborIds = indexes.neighbors[params.subjectId!];
        const inCol = neighborIds.filter((id) => characters[id].col === params.col);
        const expectedDemons = neighborIds.length - (params.N ?? 0);
        const expectedDemonsCol = inCol.length - (params.M ?? 0);
        if (!equalityHolds(neighborIds, expectedDemons)) return false;
        if (!equalityHolds(inCol, expectedDemonsCol)) return false;
        break;
      }
      case "M_OF_N_SPIRITUAL_ROOT_ELEMENT_BE_DEMON": {
        const group = indexes.elementGroups[params.element!];
        if (!equalityHolds(group, params.M!)) return false;
        break;
      }
      case "M_OF_N_SPIRITUAL_ROOT_ELEMENT_BE_CULTIVATOR": {
        const group = indexes.elementGroups[params.element!];
        const expectedDemons = group.length - (params.M ?? 0);
        if (!equalityHolds(group, expectedDemons)) return false;
        break;
      }
      default:
        break;
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
      const { type, params } = speaker.clue;

      switch (type) {
        case "PERSON_IS_DEMON":
          progress = setState(params.targetId!, "DEMON") || progress;
          break;
        case "PERSON_IS_CULTIVATOR":
          progress = setState(params.targetId!, "CULTIVATOR") || progress;
          break;
        case "ONLY_DEMON_IN_ROW": {
          const rowIds = indexes.rows[params.row!];
          rowIds.forEach((id) => {
            if (id === params.subjectId) {
              progress = setState(id, "DEMON") || progress;
            } else {
              progress = setState(id, "CULTIVATOR") || progress;
            }
          });
          break;
        }
        case "ONLY_CULTIVATOR_IN_ROW": {
          const rowIds = indexes.rows[params.row!];
          rowIds.forEach((id) => {
            if (id === params.subjectId) {
              progress = setState(id, "CULTIVATOR") || progress;
            } else {
              progress = setState(id, "DEMON") || progress;
            }
          });
          break;
        }
        case "ONLY_DEMON_IN_COLUMN": {
          const colIds = indexes.cols[params.col!];
          colIds.forEach((id) => {
            if (id === params.subjectId) {
              progress = setState(id, "DEMON") || progress;
            } else {
              progress = setState(id, "CULTIVATOR") || progress;
            }
          });
          break;
        }
        case "ONLY_CULTIVATOR_IN_COLUMN": {
          const colIds = indexes.cols[params.col!];
          colIds.forEach((id) => {
            if (id === params.subjectId) {
              progress = setState(id, "CULTIVATOR") || progress;
            } else {
              progress = setState(id, "DEMON") || progress;
            }
          });
          break;
        }
        case "N_NEIGHBORS_A_DAEMON": {
          const neighbors = indexes.neighbors[speaker.id];
          progress = setState(params.mentionedId!, "DEMON") || progress;

          const knownDemons = neighbors.filter((id) => state[id] === "DEMON");
          const knownCultivators = neighbors.filter((id) => state[id] === "CULTIVATOR");
          const unknown = neighbors.filter((id) => state[id] === "UNKNOWN");
          const expectedDemons = params.N ?? 0;

          if (knownDemons.length === expectedDemons) {
            unknown.forEach((id) => {
              progress = setState(id, "CULTIVATOR") || progress;
            });
          }
          if (knownCultivators.length === neighbors.length - expectedDemons) {
            unknown.forEach((id) => {
              progress = setState(id, "DEMON") || progress;
            });
          }
          break;
        }
        case "N_NEIGHBORS_A_CULTIVATOR": {
          const neighbors = indexes.neighbors[speaker.id];
          progress = setState(params.mentionedId!, "CULTIVATOR") || progress;

          const knownCultivators = neighbors.filter((id) => state[id] === "CULTIVATOR");
          const knownDemons = neighbors.filter((id) => state[id] === "DEMON");
          const unknown = neighbors.filter((id) => state[id] === "UNKNOWN");
          const expectedCultivators = params.N ?? 0;

          if (knownCultivators.length === expectedCultivators) {
            unknown.forEach((id) => {
              progress = setState(id, "DEMON") || progress;
            });
          }
          if (knownDemons.length === neighbors.length - expectedCultivators) {
            unknown.forEach((id) => {
              progress = setState(id, "CULTIVATOR") || progress;
            });
          }
          break;
        }
        case "M_OF_N_DEMONS_NEIGHBORING_IN_ROW": {
          const subjectNeighbors = indexes.neighbors[params.subjectId!];
          const rowNeighbors = subjectNeighbors.filter((id) => characters[id].row === params.row);
          const knownDemonsRow = rowNeighbors.filter((id) => state[id] === "DEMON");
          const unknownRow = rowNeighbors.filter((id) => state[id] === "UNKNOWN");
          const knownDemonsOther = subjectNeighbors.filter(
            (id) => characters[id].row !== params.row && state[id] === "DEMON",
          );
          const expectedRowDemons = params.M ?? 0;
          const expectedTotalDemons = params.N ?? 0;

          if (knownDemonsRow.length >= expectedRowDemons) {
            unknownRow.forEach((id) => {
              progress = setState(id, "CULTIVATOR") || progress;
            });
          }

          if (
            knownDemonsOther.length >= expectedTotalDemons - expectedRowDemons &&
            knownDemonsRow.length === expectedRowDemons - 1 &&
            unknownRow.length === 1
          ) {
            progress = setState(unknownRow[0], "DEMON") || progress;
          }
          break;
        }
        case "M_OF_N_DEMONS_NEIGHBORING_IN_COLUMN": {
          const subjectNeighbors = indexes.neighbors[params.subjectId!];
          const colNeighbors = subjectNeighbors.filter((id) => characters[id].col === params.col);
          const knownDemonsCol = colNeighbors.filter((id) => state[id] === "DEMON");
          const unknownCol = colNeighbors.filter((id) => state[id] === "UNKNOWN");
          const knownDemonsOther = subjectNeighbors.filter(
            (id) => characters[id].col !== params.col && state[id] === "DEMON",
          );
          const expectedColDemons = params.M ?? 0;
          const expectedTotalDemons = params.N ?? 0;

          if (knownDemonsCol.length >= expectedColDemons) {
            unknownCol.forEach((id) => {
              progress = setState(id, "CULTIVATOR") || progress;
            });
          }

          if (
            knownDemonsOther.length >= expectedTotalDemons - expectedColDemons &&
            knownDemonsCol.length === expectedColDemons - 1 &&
            unknownCol.length === 1
          ) {
            progress = setState(unknownCol[0], "DEMON") || progress;
          }
          break;
        }
        case "M_OF_N_CULTIVATORS_NEIGHBORING_IN_ROW": {
          const subjectNeighbors = indexes.neighbors[params.subjectId!];
          const rowNeighbors = subjectNeighbors.filter((id) => characters[id].row === params.row);
          const knownCultivatorsRow = rowNeighbors.filter((id) => state[id] === "CULTIVATOR");
          const knownDemonsRow = rowNeighbors.filter((id) => state[id] === "DEMON");
          const unknownRow = rowNeighbors.filter((id) => state[id] === "UNKNOWN");
          const knownCultivatorsOther = subjectNeighbors.filter(
            (id) => characters[id].row !== params.row && state[id] === "CULTIVATOR",
          );
          const expectedRowCultivators = params.M ?? 0;
          const expectedTotalCultivators = params.N ?? 0;

          if (knownCultivatorsRow.length >= expectedRowCultivators) {
            unknownRow.forEach((id) => {
              progress = setState(id, "DEMON") || progress;
            });
          }

          if (
            knownCultivatorsOther.length >= expectedTotalCultivators - expectedRowCultivators &&
            knownCultivatorsRow.length === expectedRowCultivators - 1 &&
            unknownRow.length === 1
          ) {
            progress = setState(unknownRow[0], "CULTIVATOR") || progress;
          }

          if (knownDemonsRow.length === rowNeighbors.length - expectedRowCultivators) {
            unknownRow.forEach((id) => {
              progress = setState(id, "CULTIVATOR") || progress;
            });
          }
          break;
        }
        case "M_OF_N_CULTIVATORS_NEIGHBORING_IN_COLUMN": {
          const subjectNeighbors = indexes.neighbors[params.subjectId!];
          const colNeighbors = subjectNeighbors.filter((id) => characters[id].col === params.col);
          const knownCultivatorsCol = colNeighbors.filter((id) => state[id] === "CULTIVATOR");
          const knownDemonsCol = colNeighbors.filter((id) => state[id] === "DEMON");
          const unknownCol = colNeighbors.filter((id) => state[id] === "UNKNOWN");
          const knownCultivatorsOther = subjectNeighbors.filter(
            (id) => characters[id].col !== params.col && state[id] === "CULTIVATOR",
          );
          const expectedColCultivators = params.M ?? 0;
          const expectedTotalCultivators = params.N ?? 0;

          if (knownCultivatorsCol.length >= expectedColCultivators) {
            unknownCol.forEach((id) => {
              progress = setState(id, "DEMON") || progress;
            });
          }

          if (
            knownCultivatorsOther.length >= expectedTotalCultivators - expectedColCultivators &&
            knownCultivatorsCol.length === expectedColCultivators - 1 &&
            unknownCol.length === 1
          ) {
            progress = setState(unknownCol[0], "CULTIVATOR") || progress;
          }

          if (knownDemonsCol.length === colNeighbors.length - expectedColCultivators) {
            unknownCol.forEach((id) => {
              progress = setState(id, "CULTIVATOR") || progress;
            });
          }
          break;
        }
        case "M_OF_N_SPIRITUAL_ROOT_ELEMENT_BE_DEMON": {
          const group = indexes.elementGroups[params.element!];
          const knownDemons = group.filter((id) => state[id] === "DEMON");
          const knownCultivators = group.filter((id) => state[id] === "CULTIVATOR");
          const unknown = group.filter((id) => state[id] === "UNKNOWN");
          const demonQuota = params.M ?? 0;
          const cultivatorQuota = (params.N ?? 0) - demonQuota;

          if (knownDemons.length >= demonQuota) {
            unknown.forEach((id) => {
              progress = setState(id, "CULTIVATOR") || progress;
            });
          }
          if (knownCultivators.length >= cultivatorQuota) {
            unknown.forEach((id) => {
              progress = setState(id, "DEMON") || progress;
            });
          }
          break;
        }
        case "M_OF_N_SPIRITUAL_ROOT_ELEMENT_BE_CULTIVATOR": {
          const group = indexes.elementGroups[params.element!];
          const knownDemons = group.filter((id) => state[id] === "DEMON");
          const knownCultivators = group.filter((id) => state[id] === "CULTIVATOR");
          const unknown = group.filter((id) => state[id] === "UNKNOWN");
          const cultivatorQuota = params.M ?? 0;
          const demonQuota = (params.N ?? 0) - cultivatorQuota;

          if (knownCultivators.length >= cultivatorQuota) {
            unknown.forEach((id) => {
              progress = setState(id, "DEMON") || progress;
            });
          }
          if (knownDemons.length >= demonQuota) {
            unknown.forEach((id) => {
              progress = setState(id, "CULTIVATOR") || progress;
            });
          }
          break;
        }
        default:
          break;
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

export default function Page() {
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

  const [puzzleState, setPuzzleState] = useState(createPuzzleState);
  const { characters, indexes } = puzzleState;
  const [selected, setSelected] = useState<GameCharacter | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [debugRevealAll, setDebugRevealAll] = useState(false);
  const [startTime, setStartTime] = useState<number>(() => Date.now());
  const [endTime, setEndTime] = useState<number | null>(null);

  const isReady = indexes !== null;
  const isComplete = useMemo(() => characters.every((c) => c.isRevealed), [characters]);

  const updateCharacters = (updater: (prev: GameCharacter[]) => GameCharacter[]) => {
    setPuzzleState((prev) => ({
      ...prev,
      characters: updater(prev.characters),
    }));
  };

  const regenerate = () => {
    setPuzzleState(createPuzzleState());
    setWarning(null);
    setSelected(null);
    setDebugRevealAll(false);
    setStartTime(Date.now());
    setEndTime(null);
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

  if (!isReady) return null;

  const COL_LABELS = ["A", "B", "C", "D"];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
        color: "#e8e8e8",
        padding: "16px",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <style>{`
        * { box-sizing: border-box; }
        .card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .card:hover:not(.revealed) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
        .btn { border: none; padding: 10px 18px; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 100; }
        .modal { background: linear-gradient(145deg, #1e1e2f, #252538); border-radius: 16px; padding: 20px; max-width: 360px; width: 100%; border: 1px solid rgba(255,255,255,0.1); }
        .clue-text { font-size: 0.65rem; color: #d1d5db; margin-top: 6px; line-height: 1.3; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 6px; }
      `}</style>

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
                        setCharacters((prev) =>
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
          onClick={() => {
            regenerate();
            setWarning(null);
            setSelected(null);
            setStartTime(Date.now());
            setEndTime(null);
          }}
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
                onClick={() => {
                  regenerate();
                  setWarning(null);
                  setSelected(null);
                  setStartTime(Date.now());
                  setEndTime(null);
                }}
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

      <Rules />
      <DetailedExplanation />

      <footer style={{ textAlign: "center", color: "#555", fontSize: "0.75rem", marginTop: 16 }}>
        Inspired by Clues by Sam
      </footer>
    </div>
  );
}
