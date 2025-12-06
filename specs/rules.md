# Who Are Werewolves? - Game Rules

## Overview

"Who Are Werewolves?" is a logic puzzle deduction game where players must identify which characters in a village are werewolves and which are innocent villagers, using clues provided by revealed characters.

## Core Game Mechanics

### Grid Structure
- The game is played on a **4×5 grid** (4 columns × 5 rows = 20 characters total)
- Each cell contains one character with:
  - A name (e.g., Alice, Bob, Charlie)
  - An emoji avatar
  - A hidden alignment: **Villager** (innocent) or **Werewolf** (evil)
  - A statement/clue that is revealed when the character is clicked

### Initial State
- All character alignments are **hidden** except for **one character** who is always revealed at the start
- The revealed character's statement provides the first clue to start the deduction process

### Truth Model
- **All characters speak the truth** - there are no lies in this game
- Every statement must be consistent with the actual board state
- This is fundamental: if a character says "I have 2 werewolf neighbors," it must be true

## Character Statements

Characters provide clues about the board state. Common statement types include:

### 1. Neighbor Count Clues
Characters can report how many werewolves or villagers are among their neighbors.

**Adjacency Rules:**
- Each character has up to 8 neighbors (orthogonal + diagonal)
- Corner positions: 3 neighbors
- Edge positions: 5 neighbors
- Interior positions: 8 neighbors

**Examples:**
- "I have exactly 3 werewolf neighbors"
- "2 of my neighbors are villagers"
- "None of my neighbors are werewolves"

### 2. Positional Clues
Characters can make statements about alignments in specific positions relative to them.

**Examples:**
- "The character directly to my left is a werewolf"
- "Both characters above me are villagers"
- "At least one character to my right is a werewolf"

### 3. Row/Column Clues
Characters can make statements about their row or column.

**Examples:**
- "There are exactly 2 werewolves in my row"
- "My column has more villagers than werewolves"
- "I'm the only werewolf in my row"

### 4. Specific Character Clues
Characters can name other specific characters.

**Examples:**
- "Alice is a werewolf"
- "Bob and Charlie are both villagers"
- "Either David or Emma is a werewolf, but not both"

### 5. Group Clues
More complex statements about groups of characters.

**Examples:**
- "Among my neighbors, the werewolves outnumber the villagers"
- "Exactly 2 of the 4 corner characters are werewolves"
- "All edge characters adjacent to me are villagers"

## Player Interaction

### Revealing Characters
1. Click on a **hidden character tile** to reveal their identity
2. A modal appears with options:
   - **Villager** - mark this character as a villager
   - **Werewolf** - mark this character as a werewolf
   - **Cancel** (or press ESC) - close without making a choice

### Visual Feedback
- **Hidden tiles**: Show name and emoji only
- **Revealed tiles**: Show name, emoji, and statement
- **Player-marked tiles**: Visual indicator showing what the player has deduced (different styling for villager vs werewolf)

### Winning Condition
- The puzzle is solved when all characters have been correctly identified
- The game validates the solution against the actual hidden alignments
- If incorrect deductions are made, they will contradict revealed statements

## Puzzle Generation

### Alignment Assignment
1. Randomly assign Villager/Werewolf alignments to all 20 characters
2. Typical distribution: 60-70% villagers, 30-40% werewolves (adjustable for difficulty)

### Statement Generation
1. For each character, generate a truthful statement based on the board state
2. Statements must be:
   - **True** given the actual alignments
   - **Informative** (help narrow down possibilities)
   - **Varied** (different statement types for better puzzles)

3. Common statement patterns:
   - Count werewolf neighbors (most common, always useful)
   - Reference specific named neighbors
   - Make row/column assertions
   - Combine multiple conditions

### Solvability
- The puzzle must have a **unique solution**
- All alignments must be deducible from the revealed statements
- The initial revealed character should provide enough information to start deduction chains

## Deduction Strategy

Players should use logical reasoning:

1. **Start with definite information**: Use the initially revealed character's statement
2. **Cross-reference clues**: Look for characters whose statements overlap
3. **Eliminate possibilities**: Use contradictions to rule out impossible configurations
4. **Count constraints**: Track neighbor counts carefully
5. **Verify consistency**: Ensure your deductions don't contradict any revealed statements

## Example Puzzle Fragment

```
Initial revealed character: Alice (B2)
Statement: "I have exactly 2 werewolf neighbors"

Alice's neighbors are: A1, A2, A3, B1, B3, C1, C2, C3 (8 neighbors)

This means:
- Exactly 2 of these 8 are werewolves
- The other 6 are villagers

If we reveal B1 and their statement is:
"I have exactly 1 werewolf neighbor"

B1's neighbors are: A1, A2, B2, C1, C2 (5 neighbors)

We know:
- Alice (B2) is revealed, so we know their alignment
- Exactly 1 of {A1, A2, C1, C2} is a werewolf
- Combined with Alice's clue, we can deduce more...
```

## Grid Coordinate System

- **Columns**: Labeled A, B, C, D (left to right)
- **Rows**: Numbered 1, 2, 3, 4, 5 (top to bottom)
- **Position notation**: Column + Row (e.g., A1, B3, D5)

```
    A    B    C    D
1  [ ]  [ ]  [ ]  [ ]
2  [ ]  [ ]  [ ]  [ ]
3  [ ]  [ ]  [ ]  [ ]
4  [ ]  [ ]  [ ]  [ ]
5  [ ]  [ ]  [ ]  [ ]
```

## Implementation Notes

### Puzzle Validation
Before presenting a puzzle to the player:
1. Verify all statements are true for the generated solution
2. Ensure the puzzle is solvable from the initial revealed character
3. Confirm there's exactly one valid solution

### UI/UX Considerations
- Clear visual distinction between hidden, revealed, and player-marked characters
- Statement text should be readable and unambiguous
- Modal should be easy to dismiss (ESC key, click outside, or Cancel button)
- Consider showing a hint system for difficult puzzles
- Victory screen when puzzle is correctly solved

### Difficulty Levels
Puzzles can be made easier or harder by:
- **Easy**: More direct neighbor count clues, higher initial reveal count
- **Medium**: Mix of neighbor and positional clues, single initial reveal
- **Hard**: Complex logical chains required, more werewolves, group clues
