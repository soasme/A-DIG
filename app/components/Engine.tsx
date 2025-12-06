// ============================================================================
// GAME ENGINE - Puzzle Generation & Deduction Logic
// ============================================================================

export type Alignment = "villager" | "werewolf";
export type PlayerMark = Alignment | null;

export interface Character {
  id: string;
  name: string;
  emoji: string;
  alignment: Alignment;
  statement: string;
  row: number;
  col: number;
}

export interface GameState {
  characters: Character[];
  playerMarks: Map<string, PlayerMark>;
  initialRevealed: string;
  gameWon: boolean;
}

const ROWS = 5;
const COLS = 4;

const CHARACTER_NAMES = [
  "Alice", "Bob", "Charlie", "David", "Emma", "Frank", "Grace", "Henry",
  "Iris", "Jack", "Kelly", "Liam", "Mia", "Noah", "Olivia", "Paul",
  "Quinn", "Ruby", "Sam", "Tara"
];

const CHARACTER_EMOJIS = [
  "👨", "👩", "🧑", "👴", "👵", "🧓", "👨‍🦰", "👩‍🦰", "👨‍🦱", "👩‍🦱",
  "👨‍🦳", "👩‍🦳", "👨‍🦲", "👩‍🦲", "🧔", "👱‍♂️", "👱‍♀️", "🧑‍🦱", "🧑‍🦰", "🧑‍🦳"
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getNeighbors(row: number, col: number, rows: number = ROWS, cols: number = COLS): Array<[number, number]> {
  const neighbors: Array<[number, number]> = [];

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        neighbors.push([nr, nc]);
      }
    }
  }

  return neighbors;
}

export function getCharacterAt(characters: Character[], row: number, col: number): Character | null {
  return characters.find(c => c.row === row && c.col === col) || null;
}

// ============================================================================
// STATEMENT GENERATION
// ============================================================================

function generateStatement(character: Character, allCharacters: Character[]): string {
  const neighbors = getNeighbors(character.row, character.col);
  const neighborChars = neighbors
    .map(([r, c]) => getCharacterAt(allCharacters, r, c))
    .filter((c): c is Character => c !== null);

  const werewolfNeighbors = neighborChars.filter(c => c.alignment === "werewolf");

  // Prioritize more informative statements
  const statementType = Math.random();

  if (statementType < 0.4 && neighborChars.length > 0) {
    // Specific neighbor reference (most informative)
    const randomNeighbor = neighborChars[Math.floor(Math.random() * neighborChars.length)];
    const alignment = randomNeighbor.alignment === "werewolf" ? "a werewolf" : "a villager";
    return `${randomNeighbor.name} is ${alignment}.`;
  } else if (statementType < 0.7) {
    // Neighbor count clues
    const count = werewolfNeighbors.length;
    if (count === 0) {
      return "None of my neighbors are werewolves.";
    } else if (count === neighborChars.length) {
      return "All of my neighbors are werewolves.";
    } else if (count === 1) {
      return "I have exactly 1 werewolf neighbor.";
    } else {
      return `I have exactly ${count} werewolf neighbors.`;
    }
  } else {
    // Row count
    const rowChars = allCharacters.filter(c => c.row === character.row && c.id !== character.id);
    const rowWerewolves = rowChars.filter(c => c.alignment === "werewolf").length;

    if (rowWerewolves === 0) {
      return "There are no other werewolves in my row.";
    } else if (rowWerewolves === 1) {
      return "There is exactly 1 other werewolf in my row.";
    } else {
      return `There are exactly ${rowWerewolves} other werewolves in my row.`;
    }
  }
}

// ============================================================================
// STATEMENT VALIDATION
// ============================================================================

export function validateStatement(
  character: Character,
  allCharacters: Character[],
  playerMarks: Map<string, PlayerMark>
): { valid: boolean; error?: string } {
  const statement = character.statement;

  // Parse neighbor count statements
  const neighborCountMatch = statement.match(/I have exactly (\d+) werewolf neighbor/);
  if (neighborCountMatch) {
    const expectedCount = parseInt(neighborCountMatch[1]);
    const neighbors = getNeighbors(character.row, character.col);
    const neighborChars = neighbors
      .map(([r, c]) => getCharacterAt(allCharacters, r, c))
      .filter((c): c is Character => c !== null);

    const markedWerewolfCount = neighborChars.filter(
      c => playerMarks.get(c.id) === "werewolf"
    ).length;

    const unmarkedCount = neighborChars.filter(
      c => !playerMarks.has(c.id)
    ).length;

    if (markedWerewolfCount > expectedCount) {
      return { valid: false, error: `Too many werewolf neighbors for ${character.name}` };
    }

    if (markedWerewolfCount + unmarkedCount < expectedCount) {
      return { valid: false, error: `Not enough possible werewolf neighbors for ${character.name}` };
    }
  }

  // Parse "none of my neighbors" statement
  if (statement.includes("None of my neighbors are werewolves")) {
    const neighbors = getNeighbors(character.row, character.col);
    const neighborChars = neighbors
      .map(([r, c]) => getCharacterAt(allCharacters, r, c))
      .filter((c): c is Character => c !== null);

    const markedWerewolfCount = neighborChars.filter(
      c => playerMarks.get(c.id) === "werewolf"
    ).length;

    if (markedWerewolfCount > 0) {
      return { valid: false, error: `${character.name} says no werewolf neighbors` };
    }
  }

  // Parse "All of my neighbors are werewolves" statement
  if (statement.includes("All of my neighbors are werewolves")) {
    const neighbors = getNeighbors(character.row, character.col);
    const neighborChars = neighbors
      .map(([r, c]) => getCharacterAt(allCharacters, r, c))
      .filter((c): c is Character => c !== null);

    const markedVillagerCount = neighborChars.filter(
      c => playerMarks.get(c.id) === "villager"
    ).length;

    if (markedVillagerCount > 0) {
      return { valid: false, error: `${character.name} says all neighbors are werewolves` };
    }
  }

  // Parse specific character statements
  const isWerewolfMatch = statement.match(/(.+) is a werewolf/);
  if (isWerewolfMatch) {
    const targetName = isWerewolfMatch[1];
    const targetChar = allCharacters.find(c => c.name === targetName);
    if (targetChar) {
      const mark = playerMarks.get(targetChar.id);
      if (mark === "villager") {
        return { valid: false, error: `${character.name} says ${targetName} is a werewolf` };
      }
    }
  }

  const isVillagerMatch = statement.match(/(.+) is a villager/);
  if (isVillagerMatch) {
    const targetName = isVillagerMatch[1];
    const targetChar = allCharacters.find(c => c.name === targetName);
    if (targetChar) {
      const mark = playerMarks.get(targetChar.id);
      if (mark === "werewolf") {
        return { valid: false, error: `${character.name} says ${targetName} is a villager` };
      }
    }
  }

  return { valid: true };
}

// ============================================================================
// DEDUCTION ENGINE - Find deterministic deductions
// ============================================================================

export function findDeterministicDeductions(
  characters: Character[],
  playerMarks: Map<string, PlayerMark>,
  revealedIds: Set<string>
): Map<string, Alignment> {
  const deductions = new Map<string, Alignment>();

  // Get all revealed characters
  const revealedChars = Array.from(revealedIds)
    .map(id => characters.find(c => c.id === id))
    .filter((c): c is Character => c !== null);

  // Check each unrevealed character
  for (const character of characters) {
    if (playerMarks.has(character.id)) continue;

    // Try marking as villager
    const testMarksVillager = new Map(playerMarks);
    testMarksVillager.set(character.id, "villager");

    let villagerValid = true;
    for (const revealedChar of revealedChars) {
      const validation = validateStatement(revealedChar, characters, testMarksVillager);
      if (!validation.valid) {
        villagerValid = false;
        break;
      }
    }

    // Try marking as werewolf
    const testMarksWerewolf = new Map(playerMarks);
    testMarksWerewolf.set(character.id, "werewolf");

    let werewolfValid = true;
    for (const revealedChar of revealedChars) {
      const validation = validateStatement(revealedChar, characters, testMarksWerewolf);
      if (!validation.valid) {
        werewolfValid = false;
        break;
      }
    }

    // If only one is valid, we can deduce the alignment
    if (villagerValid && !werewolfValid) {
      deductions.set(character.id, "villager");
    } else if (werewolfValid && !villagerValid) {
      deductions.set(character.id, "werewolf");
    }
  }

  return deductions;
}

// ============================================================================
// PUZZLE GENERATION WITH SOLVABILITY GUARANTEE
// ============================================================================

export function generatePuzzle(): GameState {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    attempts++;

    const characters: Character[] = [];

    // Create grid of characters
    let nameIndex = 0;
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const id = `${String.fromCharCode(65 + col)}${row + 1}`;
        characters.push({
          id,
          name: CHARACTER_NAMES[nameIndex],
          emoji: CHARACTER_EMOJIS[nameIndex],
          alignment: "villager",
          statement: "",
          row,
          col,
        });
        nameIndex++;
      }
    }

    // Randomly assign alignments (30-40% werewolves)
    const werewolfCount = Math.floor(characters.length * 0.35);
    const shuffled = [...characters].sort(() => Math.random() - 0.5);

    for (let i = 0; i < werewolfCount; i++) {
      shuffled[i].alignment = "werewolf";
    }

    // Generate statements
    for (const character of characters) {
      character.statement = generateStatement(character, characters);
    }

    // Test if puzzle is solvable step by step
    const testMarks = new Map<string, PlayerMark>();
    const revealedIds = new Set<string>();

    // Pick initial character - prefer one with informative statement
    const initialCandidates = characters.filter(c =>
      c.statement.includes(" is a ") ||
      c.statement.includes("None of my neighbors") ||
      c.statement.includes("All of my neighbors")
    );

    const initialChar = initialCandidates.length > 0
      ? initialCandidates[Math.floor(Math.random() * initialCandidates.length)]
      : characters[Math.floor(Math.random() * characters.length)];

    revealedIds.add(initialChar.id);

    // Simulate solving
    let solvable = true;
    while (testMarks.size < characters.length) {
      const deductions = findDeterministicDeductions(characters, testMarks, revealedIds);

      if (deductions.size === 0) {
        // No deterministic deductions available - puzzle is not solvable
        solvable = false;
        break;
      }

      // Apply one deduction and mark it as revealed
      const [charId, alignment] = Array.from(deductions.entries())[0];
      testMarks.set(charId, alignment);
      revealedIds.add(charId);
    }

    if (solvable) {
      // Puzzle is solvable! Return it
      // Add the initial revealed character to playerMarks
      const initialMarks = new Map<string, PlayerMark>();
      initialMarks.set(initialChar.id, initialChar.alignment);

      return {
        characters,
        playerMarks: initialMarks,
        initialRevealed: initialChar.id,
        gameWon: false,
      };
    }
  }

  // If we couldn't generate a solvable puzzle, return a simple one
  // (This should rarely happen with the current statement generation)
  console.warn("Could not generate fully solvable puzzle, returning best attempt");
  return generateSimplePuzzle();
}

function generateSimplePuzzle(): GameState {
  const characters: Character[] = [];
  let nameIndex = 0;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const id = `${String.fromCharCode(65 + col)}${row + 1}`;
      characters.push({
        id,
        name: CHARACTER_NAMES[nameIndex],
        emoji: CHARACTER_EMOJIS[nameIndex],
        alignment: "villager",
        statement: "None of my neighbors are werewolves.",
        row,
        col,
      });
      nameIndex++;
    }
  }

  const initialMarks = new Map<string, PlayerMark>();
  initialMarks.set(characters[0].id, characters[0].alignment);

  return {
    characters,
    playerMarks: initialMarks,
    initialRevealed: characters[0].id,
    gameWon: false,
  };
}

// ============================================================================
// WIN CONDITION CHECK
// ============================================================================

export function checkWinCondition(characters: Character[], playerMarks: Map<string, PlayerMark>): boolean {
  if (playerMarks.size !== characters.length) {
    return false;
  }

  for (const character of characters) {
    const mark = playerMarks.get(character.id);
    if (mark !== character.alignment) {
      return false;
    }
  }

  return true;
}
