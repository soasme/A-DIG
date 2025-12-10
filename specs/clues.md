# Clue Rule Templates Specification

This document specifies all possible clue rule templates used in the Clues of Who puzzle game and their behaviors.

## Overview

In the game, each revealed character provides a clue about the roles (villagers or werewolves) of other characters in the grid. These clues follow specific rule templates that constrain the possible solutions. The clue system is designed to create solvable puzzles through logical deduction.

## Grid Structure

- Grid dimensions: 5 rows × 3 columns (15 cells total)
- Each cell contains a character with either a "villager" or "werewolf" role
- Rows are numbered 1-5 (top to bottom)
- Columns are numbered 1-3 (left to right)
- Neighbors are defined as adjacent cells (horizontally, vertically, and diagonally)

## Rule Template Categories

### 1. Exact Count Rules

These rules specify an exact count of a role in a specific region.

#### 1.1 Row-based Count

**Template:** `exactly K {role}s in row {N}`

**Behavior:** Exactly K characters in row N have the specified role.

**Parameters:**
- `K`: Integer count (0 to 3)
- `role`: Either "villager" or "werewolf"
- `N`: Row number (1 to 5)

**Example:** "exactly 2 werewolfs in row 3"

**Referenced Cells:** All cells in the specified row

---

#### 1.2 Column-based Count

**Template:** `exactly K {role}s in column {N}`

**Behavior:** Exactly K characters in column N have the specified role.

**Parameters:**
- `K`: Integer count (0 to 5)
- `role`: Either "villager" or "werewolf"
- `N`: Column number (1 to 3)

**Example:** "exactly 3 villagers in column 2"

**Referenced Cells:** All cells in the specified column

---

#### 1.3 Above Row

**Template:** `exactly K {role}s above row {N}`

**Behavior:** Exactly K characters in all rows above row N have the specified role.

**Parameters:**
- `K`: Integer count (0 to grid size above row)
- `role`: Either "villager" or "werewolf"
- `N`: Row number (2 to 5)

**Example:** "exactly 4 werewolfs above row 3"

**Referenced Cells:** All cells in rows 1 to N-1

**Notes:** Cannot be used for row 1 (no rows above)

---

#### 1.4 Below Row

**Template:** `exactly K {role}s below row {N}`

**Behavior:** Exactly K characters in all rows below row N have the specified role.

**Parameters:**
- `K`: Integer count (0 to grid size below row)
- `role`: Either "villager" or "werewolf"
- `N`: Row number (1 to 4)

**Example:** "exactly 2 villagers below row 3"

**Referenced Cells:** All cells in rows N+1 to 5

**Notes:** Cannot be used for row 5 (no rows below)

---

#### 1.5 Left of Column

**Template:** `exactly K {role}s left of column {N}`

**Behavior:** Exactly K characters in all columns to the left of column N have the specified role.

**Parameters:**
- `K`: Integer count (0 to grid size left of column)
- `role`: Either "villager" or "werewolf"
- `N`: Column number (2 to 3)

**Example:** "exactly 3 werewolfs left of column 3"

**Referenced Cells:** All cells in columns 1 to N-1

**Notes:** Cannot be used for column 1 (no columns to the left)

---

#### 1.6 Right of Column

**Template:** `exactly K {role}s right of column {N}`

**Behavior:** Exactly K characters in all columns to the right of column N have the specified role.

**Parameters:**
- `K`: Integer count (0 to grid size right of column)
- `role`: Either "villager" or "werewolf"
- `N`: Column number (1 to 2)

**Example:** "exactly 5 villagers right of column 1"

**Referenced Cells:** All cells in columns N+1 to 3

**Notes:** Cannot be used for column 3 (no columns to the right)

---

### 2. Directional Rules (Character-relative)

These rules specify counts relative to a specific character.

#### 2.1 Above Character

**Template:** `exactly K {role}s above {Character}`

**Behavior:** Exactly K characters in the same column above the named character have the specified role.

**Parameters:**
- `K`: Integer count (0 to rows above character)
- `role`: Either "villager" or "werewolf"
- `Character`: Name of the reference character

**Example:** "exactly 1 werewolf above Lucy"

**Referenced Cells:** The reference character's cell, plus all cells in the same column above

---

#### 2.2 Below Character

**Template:** `exactly K {role}s below {Character}`

**Behavior:** Exactly K characters in the same column below the named character have the specified role.

**Parameters:**
- `K`: Integer count (0 to rows below character)
- `role`: Either "villager" or "werewolf"
- `Character`: Name of the reference character

**Example:** "exactly 2 villagers below Hunter"

**Referenced Cells:** The reference character's cell, plus all cells in the same column below

---

#### 2.3 Left of Character

**Template:** `exactly K {role}s left of {Character}`

**Behavior:** Exactly K characters in the same row to the left of the named character have the specified role.

**Parameters:**
- `K`: Integer count (0 to columns left of character)
- `role`: Either "villager" or "werewolf"
- `Character`: Name of the reference character

**Example:** "exactly 0 villagers left of Willow"

**Referenced Cells:** The reference character's cell, plus all cells in the same row to the left

---

#### 2.4 Right of Character

**Template:** `exactly K {role}s right of {Character}`

**Behavior:** Exactly K characters in the same row to the right of the named character have the specified role.

**Parameters:**
- `K`: Integer count (0 to columns right of character)
- `role`: Either "villager" or "werewolf"
- `Character`: Name of the reference character

**Example:** "exactly 1 werewolf right of Faith"

**Referenced Cells:** The reference character's cell, plus all cells in the same row to the right

---

### 3. Between Two Characters

#### 3.1 Between Characters Rule

**Template:** `exactly K {role}s between {Character1} and {Character2}`

**Behavior:** Exactly K characters in the cells strictly between two characters have the specified role. The two characters must be in the same row or column with at least one cell between them.

**Parameters:**
- `K`: Integer count (0 to cells between characters)
- `role`: Either "villager" or "werewolf"
- `Character1`: Name of first reference character
- `Character2`: Name of second reference character

**Example:** "exactly 1 werewolf between Zara and Freya"

**Referenced Cells:** Both reference characters' cells, plus all cells strictly between them

**Constraints:**
- Characters must be in the same row or same column
- Characters must not be adjacent (at least one cell between them)

---

### 4. Neighbor Rules

These rules involve counting neighbors (all 8 adjacent cells: horizontal, vertical, and diagonal).

#### 4.1 Exact Neighbor Count

**Template:** `{Character} has exactly K {role}s as neighbors`

**Behavior:** The named character has exactly K neighbors with the specified role.

**Parameters:**
- `Character`: Name of the reference character
- `K`: Integer count (0 to 8, depending on position)
- `role`: Either "villager" or "werewolf"

**Example:** "Nova has exactly 4 werewolfs as neighbors"

**Referenced Cells:** The reference character's cell and all neighboring cells

**Notes:** Corner cells have 3 neighbors, edge cells have 5 neighbors, interior cells have 8 neighbors

---

#### 4.2 Equal Neighbor Count

**Template:** `{Character1} and {Character2} have the same number of {role} neighbors`

**Behavior:** Both named characters have the same count of neighbors with the specified role.

**Parameters:**
- `Character1`: Name of first reference character
- `Character2`: Name of second reference character
- `role`: Either "villager" or "werewolf"

**Example:** "Ava and Raina have the same number of villager neighbors"

**Referenced Cells:** Both reference characters' cells and all their respective neighbors

---

#### 4.3 More Neighbors

**Template:** `{Character1} has more {role} neighbors than {Character2}`

**Behavior:** Character1 has a strictly greater count of neighbors with the specified role than Character2.

**Parameters:**
- `Character1`: Name of first reference character
- `Character2`: Name of second reference character
- `role`: Either "villager" or "werewolf"

**Example:** "Hunter has more werewolf neighbors than Reid"

**Referenced Cells:** Both reference characters' cells and all their respective neighbors

---

#### 4.4 Fewer Neighbors

**Template:** `{Character1} has fewer {role} neighbors than {Character2}`

**Behavior:** Character1 has a strictly smaller count of neighbors with the specified role than Character2.

**Parameters:**
- `Character1`: Name of first reference character
- `Character2`: Name of second reference character
- `role`: Either "villager" or "werewolf"

**Example:** "Zara has fewer villager neighbors than Yusuf"

**Referenced Cells:** Both reference characters' cells and all their respective neighbors

---

### 5. Member of Neighbor Set

#### 5.1 Character is One of K Role Neighbors

**Template:** `{Character1} is one of the K {role} neighbors of {Character2}`

**Behavior:** Character1 is a neighbor of Character2, has the specified role, and Character2 has exactly K neighbors with that role.

**Parameters:**
- `Character1`: Name of first character (who is the neighbor)
- `K`: Integer count of role neighbors
- `role`: Either "villager" or "werewolf"
- `Character2`: Name of second character (who has the neighbors)

**Example:** "Dean is one of the 7 werewolf neighbors of Bianca"

**Referenced Cells:** Both reference characters' cells and all neighbors of Character2

**Constraints:**
- Character1 must be adjacent to Character2
- Character2 must have exactly K neighbors with the specified role

---

### 6. Directional Neighbor Intersection

These rules count how many characters in a directional set from one character are also neighbors of another character.

#### 6.1 Left Direction Neighbor Intersection

**Template:** `exactly K of the J {role}s to the left of {Character1} are neighbors of {Character2}`

**Behavior:** Among the J characters with the specified role in the same row to the left of Character1, exactly K of them are also neighbors of Character2.

**Parameters:**
- `K`: Count of characters satisfying both conditions
- `J`: Total count of role characters in the direction
- `role`: Either "villager" or "werewolf"
- `Character1`: Reference character for directional constraint
- `Character2`: Reference character for neighbor constraint

**Example:** "exactly 0 of the 1 villager to the right of Hunter are neighbors of Chase"

**Referenced Cells:** Character1, Character2, all cells left of Character1, and all neighbors of Character2

---

#### 6.2 Right Direction Neighbor Intersection

**Template:** `exactly K of the J {role}s to the right of {Character1} are neighbors of {Character2}`

**Behavior:** Among the J characters with the specified role in the same row to the right of Character1, exactly K of them are also neighbors of Character2.

**Parameters:**
- `K`: Count of characters satisfying both conditions
- `J`: Total count of role characters in the direction
- `role`: Either "villager" or "werewolf"
- `Character1`: Reference character for directional constraint
- `Character2`: Reference character for neighbor constraint

**Example:** "exactly 2 of the 2 villagers to the right of Ava are neighbors of Celia"

**Referenced Cells:** Character1, Character2, all cells right of Character1, and all neighbors of Character2

---

#### 6.3 Above Direction Neighbor Intersection

**Template:** `exactly K of the J {role}s above {Character1} are neighbors of {Character2}`

**Behavior:** Among the J characters with the specified role in the same column above Character1, exactly K of them are also neighbors of Character2.

**Parameters:**
- `K`: Count of characters satisfying both conditions
- `J`: Total count of role characters in the direction
- `role`: Either "villager" or "werewolf"
- `Character1`: Reference character for directional constraint
- `Character2`: Reference character for neighbor constraint

**Example:** "exactly 0 of the 1 werewolf above Joy are neighbors of Amelia"

**Referenced Cells:** Character1, Character2, all cells above Character1, and all neighbors of Character2

---

#### 6.4 Below Direction Neighbor Intersection

**Template:** `exactly K of the J {role}s below {Character1} are neighbors of {Character2}`

**Behavior:** Among the J characters with the specified role in the same column below Character1, exactly K of them are also neighbors of Character2.

**Parameters:**
- `K`: Count of characters satisfying both conditions
- `J`: Total count of role characters in the direction
- `role`: Either "villager" or "werewolf"
- `Character1`: Reference character for directional constraint
- `Character2`: Reference character for neighbor constraint

**Example:** "exactly 1 of the 3 werewolfs below Damian are neighbors of Yusuf"

**Referenced Cells:** Character1, Character2, all cells below Character1, and all neighbors of Character2

---

#### 6.5 Neighbor-to-Neighbor Intersection

**Template:** `exactly K of the J {role} neighboring {Character1} are neighbors of {Character2}`

**Behavior:** Among the J neighbors of Character1 with the specified role, exactly K of them are also neighbors of Character2.

**Parameters:**
- `K`: Count of characters satisfying both conditions
- `J`: Total count of role neighbors of Character1
- `role`: Either "villager" or "werewolf"
- `Character1`: First reference character
- `Character2`: Second reference character

**Example:** "exactly 1 of the 2 villagers below Freya are neighbors of Yusuf"

**Referenced Cells:** Both reference characters and all neighbors of both characters

---

### 7. Connectivity Rules

These rules enforce that all characters with a specific role in a row or column form a contiguous block.

#### 7.1 Connected in Row

**Template:** `all {role}s in row {N} are connected`

**Behavior:** All characters with the specified role in row N form a single contiguous horizontal segment (no gaps).

**Parameters:**
- `role`: Either "villager" or "werewolf"
- `N`: Row number (1 to 5)

**Example:** "all werewolves in column 1 are connected"

**Referenced Cells:** All cells in the specified row

**Notes:** An empty set (0 characters with the role) is considered connected

---

#### 7.2 Connected in Column

**Template:** `all {role}s in column {N} are connected`

**Behavior:** All characters with the specified role in column N form a single contiguous vertical segment (no gaps).

**Parameters:**
- `role`: Either "villager" or "werewolf"
- `N`: Column number (1 to 3)

**Example:** "all werewolves in column 1 are connected"

**Referenced Cells:** All cells in the specified column

**Notes:** An empty set (0 characters with the role) is considered connected

---

### 8. Direct Role Declaration

These rules directly state a character's role.

#### 8.1 Character is Villager

**Template:** `{Character} is a villager.`

**Behavior:** The named character has the villager role.

**Parameters:**
- `Character`: Name of the character

**Example:** "Hunter is a villager."

**Referenced Cells:** The character's cell

---

#### 8.2 Character is Werewolf

**Template:** `{Character} is a werewolf.`

**Behavior:** The named character has the werewolf role.

**Parameters:**
- `Character`: Name of the character

**Example:** "Willow is a werewolf."

**Referenced Cells:** The character's cell

---

### 9. Alphabetical Order Counts

These rules count roles among characters that come before or after the speaker alphabetically by name.

#### 9.1 Before Alphabetical Names

**Template:** `exactly K of the J people whose names come before {Character} alphabetically are {role}`

**Behavior:** Among the J characters whose names are alphabetically earlier than the speaker's name, exactly K have the specified role.

**Parameters:**
- `Character`: Name of the speaker
- `K`: Integer count of matching roles (1 to J, cannot be 0)
- `J`: Number of characters whose names come before the speaker (at least 1)
- `role`: Either "villager" or "werewolf"

**Example:** "Exactly 1 of the 3 people whose names come before Bianca alphabetically is a villager."

**Referenced Cells:** The speaker and all characters whose names are alphabetically earlier than the speaker

**Notes:** This rule is unavailable for the alphabetically first character (J = 0).

---

#### 9.2 After Alphabetical Names

**Template:** `exactly K of the J people whose names come after {Character} alphabetically are {role}`

**Behavior:** Among the J characters whose names are alphabetically later than the speaker's name, exactly K have the specified role.

**Parameters:**
- `Character`: Name of the speaker
- `K`: Integer count of matching roles (1 to J, cannot be 0)
- `J`: Number of characters whose names come after the speaker (at least 1)
- `role`: Either "villager" or "werewolf"

**Example:** "Exactly 2 of the 11 people whose names come after Arthur alphabetically are werewolves."

**Referenced Cells:** The speaker and all characters whose names are alphabetically later than the speaker

**Notes:** This rule is unavailable for the alphabetically last character (J = 0).

---

## Rule Usage in Puzzles

### Clue Assignment

- Each revealed character provides exactly one clue
- Clues are chosen to ensure the puzzle is solvable through logical deduction
- The clue system uses constraint satisfaction to guarantee a unique solution

### Statement Generation

Clues are presented in two forms:

1. **Mechanic Statement**: The raw template format (e.g., "exactly 2 werewolfs in row 3")
2. **Narrative Statement**: A story-flavored version spoken by the character (e.g., "I've counted the beasts in my row—two of them prowl among us here.")

### Referenced Cells

Each clue tracks which cells are referenced in its constraint. This helps the deduction engine:
- Identify which cells are involved in the constraint
- Highlight relevant cells in the UI
- Track dependencies between clues

### Deductable Cells

The puzzle generator pre-computes which cells can be deduced from each clue when combined with the existing known information. This helps:
- Ensure the puzzle remains solvable at each step
- Guide the hint system
- Validate puzzle difficulty

---

## Implementation Notes

### Constraint Satisfaction

The clue system is implemented using a logic programming approach (logicjs):
- Each rule template is converted to a logical constraint
- The solver finds all solutions that satisfy the constraints
- Cells with a unique value across all solutions are marked as deducible

### Grid Indexing

- Internal representation uses 1-based indexing for rows and columns
- Cell index formula: `(row - 1) * COLS + (column - 1)`
- Neighbors include all 8 adjacent cells (Moore neighborhood)

### Role Values

- `VILLAGER` = "villager" (the innocent/good role)
- `WEREWOLF` = "werewolf" (the guilty/bad role)

These values can be customized via `setRoleNames()` for different game themes.

---

## Example Clue Chain

Here's how multiple clues work together to solve a puzzle:

1. **Initial Reveal**: "Hunter is a villager" → Establishes row 1, column 1 as villager
2. **Clue 1**: "Hunter has more werewolf neighbors than Reid" → Constrains neighbors
3. **Clue 2**: "exactly 1 werewolf below Yusuf" → Constrains column 1
4. **Clue 3**: "exactly 2 of the 2 villagers to the right of Ava are neighbors of Celia" → Complex intersection constraint
5. **Deduction**: Combining these constraints eliminates possibilities until only one solution remains

Each clue reduces the solution space until all cells can be uniquely determined.
