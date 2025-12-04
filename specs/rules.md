
# Game Engine Specification: Cultivators or Demon-In-Disguise?

## Overview

A logic deduction puzzle game where players must identify who are cultivators and who are demons in disguise among 20 characters arranged in a 5×4 grid. Each character has a clue that reveals information about another character. Players must use logical deduction to reveal all identities one by one.

---

## Grid Layout

- **Dimensions**: 5 rows × 4 columns (20 total positions)
- **Row numbering**: 1-5 (top to bottom)
- **Column labeling**: A-D (left to right)
- **Position notation**: `(Row, Column)` e.g., `(3, B)` = Row 3, Column B

---

## Core Mechanics

### Characters

Each character has:
- **Name**: Randomly generated Chinese pinyin name (surname + given name)
- **Position**: Fixed location in the grid `(row, col)`
- **Identity**: Either Cultivator or Demon
- **Spiritual Root**: Cosmetic attribute (1-5 elements from Metal/Wood/Water/Fire/Earth)
- **Clue**: Statement that identifies another character
- **Revealed Status**: Boolean indicating if identity is known to player

### Demon Distribution

- **Count**: 6-8 demons per puzzle (randomly chosen)
- **Remaining**: All other characters are cultivators

### Neighbors

Two characters are **neighbors** if they are adjacent in any direction (including diagonals):
- Maximum distance: 1 row AND 1 column apart
- A character cannot be its own neighbor
- Corner positions have 3 neighbors
- Edge positions have 5 neighbors
- Interior positions have 8 neighbors

**Neighbor calculation**:
```
areNeighbors(person1, person2) =
  |person1.row - person2.row| ≤ 1 AND
  |person1.col - person2.col| ≤ 1 AND
  NOT (person1 == person2)
```

---

## Clue Types

### 1. PERSON_IS_DEMON
**Format**: `"{Name} is a demon."`

**Behavior**:
- Directly identifies a specific person as a demon
- No additional conditions required
- Immediate deduction possible when clue holder is revealed

**Deduction Logic**:
- If revealed person has this clue about target → target is a demon

---

### 2. PERSON_IS_CULTIVATOR
**Format**: `"{Name} is a cultivator."`

**Behavior**:
- Directly identifies a specific person as a cultivator
- No additional conditions required
- Immediate deduction possible when clue holder is revealed

**Deduction Logic**:
- If revealed person has this clue about target → target is a cultivator

---

### 3. ONLY_DEMON_IN_ROW
**Format**: `"{Name} is the only demon in row {N}."`

**Behavior**:
- Identifies someone as the sole demon in their row
- Also reveals that all other people in that row are cultivators

**Deduction Logic**:
- If target is in the specified row:
  - If target is the subject of the clue → target is a demon
  - If target is anyone else in that row → target is a cultivator

---

### 4. ONLY_CULTIVATOR_IN_ROW
**Format**: `"{Name} is the only cultivator in row {N}."`

**Behavior**:
- Identifies someone as the sole cultivator in their row
- Also reveals that all other people in that row are demons

**Deduction Logic**:
- If target is in the specified row:
  - If target is the subject of the clue → target is a cultivator
  - If target is anyone else in that row → target is a demon

---

### 5. ONLY_DEMON_IN_COLUMN
**Format**: `"{Name} is the only demon in column {C}."`

**Behavior**:
- Identifies someone as the sole demon in their column
- Also reveals that all other people in that column are cultivators

**Deduction Logic**:
- If target is in the specified column:
  - If target is the subject of the clue → target is a demon
  - If target is anyone else in that column → target is a cultivator

---

### 6. ONLY_CULTIVATOR_IN_COLUMN
**Format**: `"{Name} is the only cultivator in column {C}."`

**Behavior**:
- Identifies someone as the sole cultivator in their column
- Also reveals that all other people in that column are demons

**Deduction Logic**:
- If target is in the specified column:
  - If target is the subject of the clue → target is a cultivator
  - If target is anyone else in that column → target is a demon

---

### 7. N_NEIGHBORS_A_DAEMON
**Format**: `"I have exactly {N} demon neighbors and {Name} is one of them."`

**Behavior**:
- Speaker has exactly N demon neighbors total
- The named person is confirmed to be a demon neighbor
- Other neighbors' identities can be inferred once N demons are found

**Requirements**:
- Target must be a neighbor of the clue holder
- Target must be a demon

**Deduction Logic**:

**Case 1: Direct mention**
- If target is named in the clue AND is a neighbor → target is a demon

**Case 2: Elimination by count (demon)**
- If we've revealed N demon neighbors already
- And target is a neighbor but not one of the N demons
- Then target must be a cultivator

**Case 3: Elimination by count (cultivator)**
- If we've revealed (total_neighbors - N) cultivator neighbors
- And target is a neighbor but not one of the cultivators
- Then target must be a demon

---

### 8. N_NEIGHBORS_A_CULTIVATOR
**Format**: `"I have exactly {N} cultivator neighbors and {Name} is one of them."`

**Behavior**:
- Speaker has exactly N cultivator neighbors total
- The named person is confirmed to be a cultivator neighbor
- Other neighbors' identities can be inferred once N cultivators are found

**Requirements**:
- Target must be a neighbor of the clue holder
- Target must be a cultivator

**Deduction Logic**:

**Case 1: Direct mention**
- If target is named in the clue AND is a neighbor → target is a cultivator

**Case 2: Elimination by count (cultivator)**
- If we've revealed N cultivator neighbors already
- And target is a neighbor but not one of the N cultivators
- Then target must be a demon

**Case 3: Elimination by count (demon)**
- If we've revealed (total_neighbors - N) demon neighbors
- And target is a neighbor but not one of the demons
- Then target must be a cultivator

---

### 9. M_OF_N_DEMONS_NEIGHBORING_IN_ROW
**Format**: `"Exactly {M} of {N} demon neighbors of {Name} is/are in row {R}."`

**Note**: Uses "is" when M = 0 or M = 1, otherwise "are"

**Behavior**:
- The named person (subject) has exactly N demon neighbors total
- Of those N demon neighbors, exactly M are located in row R
- The remaining (N - M) demon neighbors are NOT in row R

**Requirements**:
- Target must be a neighbor of the subject
- Target must be in the specified row R
- Subject must already be revealed

**Deduction Logic**:

**Case 1: Row quota filled**
- If we've already revealed M demon neighbors in row R
- And target is a neighbor in row R but not one of the M
- Then target must be a cultivator

**Case 2: Outside row quota filled, need one more**
- If we've revealed (N - M) demon neighbors outside row R
- And we've revealed (M - 1) demon neighbors in row R
- And target is the only unrevealed neighbor in row R
- Then target must be a demon

---

### 10. M_OF_N_DEMONS_NEIGHBORING_IN_COLUMN
**Format**: `"Exactly {M} of {N} demon neighbors of {Name} is/are in column {C}."`

**Note**: Uses "is" when M = 0 or M = 1, otherwise "are"

**Behavior**:
- The named person (subject) has exactly N demon neighbors total
- Of those N demon neighbors, exactly M are located in column C
- The remaining (N - M) demon neighbors are NOT in column C

**Requirements**:
- Target must be a neighbor of the subject
- Target must be in the specified column C
- Subject must already be revealed

**Deduction Logic**:

**Case 1: Column quota filled**
- If we've already revealed M demon neighbors in column C
- And target is a neighbor in column C but not one of the M
- Then target must be a cultivator

**Case 2: Outside column quota filled, need one more**
- If we've revealed (N - M) demon neighbors outside column C
- And we've revealed (M - 1) demon neighbors in column C
- And target is the only unrevealed neighbor in column C
- Then target must be a demon

---

### 11. M_OF_N_CULTIVATORS_NEIGHBORING_IN_ROW
**Format**: `"Exactly {M} of {N} cultivator neighbors of {Name} is/are in row {R}."`

**Note**: Uses "is" when M = 0 or M = 1, otherwise "are"

**Behavior**:
- The named person (subject) has exactly N cultivator neighbors total
- Of those N cultivator neighbors, exactly M are located in row R
- The remaining (N - M) cultivator neighbors are NOT in row R

**Requirements**:
- Target must be a neighbor of the subject
- Target must be in the specified row R
- Subject must already be revealed

**Deduction Logic**:

**Case 1: Row quota filled**
- If we've already revealed M cultivator neighbors in row R
- And target is a neighbor in row R but not one of the M
- Then target must be a demon

**Case 2: Outside row quota filled, need one more**
- If we've revealed (N - M) cultivator neighbors outside row R
- And we've revealed (M - 1) cultivator neighbors in row R
- And target is the only unrevealed neighbor in row R
- Then target must be a cultivator

---

### 12. M_OF_N_CULTIVATORS_NEIGHBORING_IN_COLUMN
**Format**: `"Exactly {M} of {N} cultivator neighbors of {Name} is/are in column {C}."`

**Note**: Uses "is" when M = 0 or M = 1, otherwise "are"

**Behavior**:
- The named person (subject) has exactly N cultivator neighbors total
- Of those N cultivator neighbors, exactly M are located in column C
- The remaining (N - M) cultivator neighbors are NOT in column C

**Requirements**:
- Target must be a neighbor of the subject
- Target must be in the specified column C
- Subject must already be revealed

**Deduction Logic**:

**Case 1: Column quota filled**
- If we've already revealed M cultivator neighbors in column C
- And target is a neighbor in column C but not one of the M
- Then target must be a demon

**Case 2: Outside column quota filled, need one more**
- If we've revealed (N - M) cultivator neighbors outside column C
- And we've revealed (M - 1) cultivator neighbors in column C
- And target is the only unrevealed neighbor in column C
- Then target must be a cultivator

---

### 13. M_OF_N_SPIRITUAL_ROOT_ELEMENT_BE_DEMON
**Format**: `"Exactly {M} of {N} people with {Element} spiritual root is/are demons."`

**Note**: Uses "is" when M = 0 or M = 1, otherwise "are"

**Behavior**:
- Among all 20 characters, exactly N have the specified element in their spiritual root
- Of those N people with this element, exactly M are demons
- The remaining (N - M) people with this element are cultivators
- This clue can deduce identities of people who have this element

**Requirements**:
- Target must have the specified element in their spiritual root
- The element can be any of: Metal, Wood, Water, Fire, Earth
- A character has an element if it appears in their spiritual root (e.g., Metal-Wood has both Metal and Wood)

**Deduction Logic**:

**Case 1: Demon quota filled**
- If we've already revealed M demons with this element
- And target has this element but is not one of the M demons
- Then target must be a cultivator

**Case 2: Cultivator quota filled**
- If we've revealed (N - M) cultivators with this element
- And target has this element but is not one of the cultivators
- Then target must be a demon

---

### 14. M_OF_N_SPIRITUAL_ROOT_ELEMENT_BE_CULTIVATOR
**Format**: `"Exactly {M} of {N} people with {Element} spiritual root is/are cultivators."`

**Note**: Uses "is" when M = 0 or M = 1, otherwise "are"

**Behavior**:
- Among all 20 characters, exactly N have the specified element in their spiritual root
- Of those N people with this element, exactly M are cultivators
- The remaining (N - M) people with this element are demons
- This clue can deduce identities of people who have this element

**Requirements**:
- Target must have the specified element in their spiritual root
- The element can be any of: Metal, Wood, Water, Fire, Earth
- A character has an element if it appears in their spiritual root (e.g., Fire-Earth has both Fire and Earth)

**Deduction Logic**:

**Case 1: Cultivator quota filled**
- If we've already revealed M cultivators with this element
- And target has this element but is not one of the M cultivators
- Then target must be a demon

**Case 2: Demon quota filled**
- If we've revealed (N - M) demons with this element
- And target has this element but is not one of the demons
- Then target must be a cultivator

## Puzzle Generation Algorithm

### Phase 1: Initialize Characters

1.  **Generate Names**
    
    -   Create 20 unique names from surname + given-name pools (Chinese pinyin).
        
    -   Example: `["Li Mu", "Zhang Wei", "Chen Hao", ...]`
        
    -   Sort alphabetically to ensure consistent internal ordering (helps reproducibility / debugging).
        
2.  **Assign Grid Positions**
    
    -   For `i` from `0` to `19`:
        
        -   `row = i // 4` (0–4)
            
        -   `col = i % 4` (0–3)
            
    -   Store both internal coordinates `(row, col)` and display coordinates: `Row = row + 1`, `Col = "ABCD"[col]`.
        
3.  **Assign Identities**
    
    -   Decide demon count `D` randomly in `[6, 8]`.
        
    -   Randomly choose `D` distinct indices from `0..19` as demons.
        
    -   All others are cultivators.
        
4.  **Assign Spiritual Roots**
    
    -   For each character:
        
        -   Randomly choose root size `k` in `[1, 5]`.
            
        -   Randomly sample `k` distinct elements from `{Metal, Wood, Water, Fire, Earth}`.
            
    -   Store as a set/list, e.g. `["Metal", "Wood"]`.
        

----------

### Phase 2: Precompute Board Structures

Before generating clues, precompute all the relationships you will need.

1.  **Indexing Helpers**
    
    -   `id -> (row, col)` map.
        
    -   `(row, col) -> id` map.
        
    -   `row -> [ids in that row]`
        
    -   `col -> [ids in that column]`
        
2.  **Neighbors for Each Character**
    
    `neighbors[id] = []
    for each id1:
      for each id2 != id1:
        if abs(row1 - row2) <= 1 and abs(col1 - col2) <= 1:
          neighbors[id1].append(id2)` 
    
    -   Edge: 5 neighbors
        
    -   Corner: 3 neighbors
        
    -   Interior: 8 neighbors
        
3.  **Element Groups**
    
    -   For each element `E` in `{Metal, Wood, Water, Fire, Earth}`:
        
        -   `elementGroup[E] = [ids whose spiritual root contains E]`
            
        -   `N_E = len(elementGroup[E])` – total people with that element.
            
    -   These will be used for element-based clues (types 13 & 14).
        
4.  **Ground-Truth Stats (from identities)**
    
    -   For each row `r` (0–4):
        
        -   `rowDemons[r] = [ids in row r that are demons]`
            
        -   `rowCultivators[r] = [ids in row r that are cultivators]`
            
    -   For each column `c` (0–3):
        
        -   `colDemons[c] = [...]`
            
        -   `colCultivators[c] = [...]`
            
    -   For each character `id`:
        
        -   `demonNeighbors[id] = neighbors[id] filtered by demons`
            
        -   `cultivatorNeighbors[id] = neighbors[id] filtered by cultivators`
            

----------

### Phase 3: Build Candidate Clues for Each Character

Goal: for each **speaker** (each of the 20 characters), build a _set of truth-consistent candidate clues_ they could say, following your 14 clue types.

You’ll later pick exactly **one** clue per speaker from these candidates.

> Note: “subject” = the person mentioned in the clue; “speaker” = who holds the clue.  
> For some clue types, subject = speaker (neighbor count clues). For others, subject is someone else.

#### 3.1 General Rules for Candidate Generation

-   All clues **must be true** given the ground truth identities.
    
-   All parameters `N`, `M`, `row`, `col`, `Element` must be chosen such that the English text matches the ground truth.
    
-   Avoid **degenerate clues** that give no information, e.g.:
    
    -   “I have exactly 0 demon neighbors and X is one of them.” (contradiction)
        
    -   “Exactly 0 of 0 people with Fire root are demons.” (trivially true but useless)
        
-   To control difficulty, you can assign weights / priority to different clue types.  
    Example:
    
    -   Tier 1: direct clues (1–6)
        
    -   Tier 2: neighbor count (7–8)
        
    -   Tier 3: neighbor count with row/column quotas (9–12)
        
    -   Tier 4: spiritual element quotas (13–14)
        

Below: how to generate candidates by clue type.

----------

#### 3.2 Direct Person Clues (Types 1–2)

For any speaker `S`, pick a **target** `T != S`.

1.  **PERSON_IS_DEMON**
    
    -   Valid if `T` is demon.
        
    -   Candidate: `{ type: PERSON_IS_DEMON, speaker: S, target: T }`.
        
2.  **PERSON_IS_CULTIVATOR**
    
    -   Valid if `T` is cultivator.
        
    -   Candidate: `{ type: PERSON_IS_CULTIVATOR, speaker: S, target: T }`.
        

You don’t need special structure; they’re always consistent with ground truth.

----------

#### 3.3 Row / Column “Only” Clues (Types 3–6)

Using row/column stats:

1.  **ONLY_DEMON_IN_ROW**
    
    -   For each row `r`, if `len(rowDemons[r]) == 1`:
        
        -   Let `D` be that demon.
            
        -   For any speaker `S`, candidate:
            
            -   `{ type: ONLY_DEMON_IN_ROW, speaker: S, subject: D, row: r }`
                
    -   (Text: “{Name(D)} is the only demon in row {r+1}.”)
        
2.  **ONLY_CULTIVATOR_IN_ROW**
    
    -   For each row `r`, if `len(rowCultivators[r]) == 1`:
        
        -   Let `C` be that cultivator.
            
        -   Candidate for any `S`:
            
            -   `{ type: ONLY_CULTIVATOR_IN_ROW, speaker: S, subject: C, row: r }`
                
3.  **ONLY_DEMON_IN_COLUMN**
    
    -   Same, but on columns: if `len(colDemons[c]) == 1`.
        
4.  **ONLY_CULTIVATOR_IN_COLUMN**
    
    -   Same, but on columns: if `len(colCultivators[c]) == 1`.
        

If your demon distribution doesn’t produce many unique rows/columns, some of these types just won’t appear in the candidate pool for this puzzle instance (which is fine).

----------

#### 3.4 Neighbor Count Clues (Types 7–8)

These are **speaker = subject** types. Use precomputed neighbor lists.

For each potential speaker `S`:

1.  Let:
    
    -   `totalN = len(neighbors[S])`
        
    -   `dN = len(demonNeighbors[S])`
        
    -   `cN = len(cultivatorNeighbors[S])`
        
2.  **N_NEIGHBORS_A_DAEMON**
    
    -   If `dN >= 1`:
        
        -   Let `N = dN` (so the statement “I have exactly N demon neighbors” is true).
            
        -   For each demon neighbor `T` of `S`, candidate:
            
            -   `{ type: N_NEIGHBORS_A_DAEMON, speaker: S, N: dN, mentioned: T }`
                
    -   (Text: “I have exactly {dN} demon neighbors and {Name(T)} is one of them.”)
        
3.  **N_NEIGHBORS_A_CULTIVATOR**
    
    -   If `cN >= 1`:
        
        -   Let `N = cN`.
            
        -   For each cultivator neighbor `T` of `S`, candidate:
            
            -   `{ type: N_NEIGHBORS_A_CULTIVATOR, speaker: S, N: cN, mentioned: T }`
                

> You _could_ choose smaller `N` than the full count with careful combinatorics, but simplest is to use **exact true total**; the deduction logic still works.

----------

#### 3.5 Row / Column Quota Neighbor Clues (Types 9–12)

Again, speaker = subject.

For each `S`:

1.  Compute:
    
    -   `demonNeighbors[S]` and `cultivatorNeighbors[S]`.
        
    -   For each row `r`: `dInRow[r]`, `cInRow[r]` among neighbors.
        
    -   For each column `c`: `dInCol[c]`, `cInCol[c]` among neighbors.
        
2.  **M_OF_N_DEMONS_NEIGHBORING_IN_ROW (Type 9)**
    
    -   Let `N = len(demonNeighbors[S])`. If `N == 0`, skip.
        
    -   For each row `r` such that `dInRow[r] > 0`:
        
        -   Let `M = dInRow[r]`.
            
        -   Candidate:
            
            -   `{ type: M_OF_N_DEMONS_NEIGHBORING_IN_ROW, speaker: S, N, M, row: r }`
                
3.  **M_OF_N_DEMONS_NEIGHBORING_IN_COLUMN (Type 10)**
    
    -   Same idea on columns: for each column `c` where `dInCol[c] > 0`:
        
        -   `N = len(demonNeighbors[S])`, `M = dInCol[c]`.
            
4.  **M_OF_N_CULTIVATORS_NEIGHBORING_IN_ROW (Type 11)**
    
    -   `N = len(cultivatorNeighbors[S])`. If `N == 0`, skip.
        
    -   For each row `r` with `cInRow[r] > 0`:
        
        -   `M = cInRow[r]`.
            
5.  **M_OF_N_CULTIVATORS_NEIGHBORING_IN_COLUMN (Type 12)**
    
    -   Same on columns.
        

You might want to **filter** these to keep max 1–2 such clues per speaker to avoid a wall of quota clues.

----------

#### 3.6 Spiritual Root Quota Clues (Types 13–14)

Using element groups:

For each element `E`:

1.  Let `group = elementGroup[E]`, `N = len(group)`.
    
    -   If `N == 0`, skip this element.
        
2.  Count demons & cultivators in this group:
    
    -   `dE = number of demons in group`
        
    -   `cE = number of cultivators in group` (so `cE = N - dE`)
        
3.  **M_OF_N_SPIRITUAL_ROOT_ELEMENT_BE_DEMON (Type 13)**
    
    -   If `dE > 0`:
        
        -   Candidate for any speaker `S`:
            
            -   `{ type: M_OF_N_SPIRITUAL_ROOT_ELEMENT_BE_DEMON, speaker: S, element: E, M: dE, N }`
                
4.  **M_OF_N_SPIRITUAL_ROOT_ELEMENT_BE_CULTIVATOR (Type 14)**
    
    -   If `cE > 0`:
        
        -   Candidate:
            
            -   `{ type: M_OF_N_SPIRITUAL_ROOT_ELEMENT_BE_CULTIVATOR, speaker: S, element: E, M: cE, N }`
                

Again, you can tune frequency; e.g. at most 2 such clues in the final puzzle.

----------

### Phase 4: Select One Clue per Character

You now have, for each speaker `S`, a list `candidates[S]` of truth-consistent clues.

Goal: **choose exactly one clue for each of the 20 characters** such that the resulting puzzle:

-   Is consistent (automatically true by construction).
    
-   Has a **unique** solution (your ground truth).
    
-   All identities are deducible via logical inference (no guessing).
    

We’ll do this via **randomized selection + constraint solving**.

#### 4.1 Selection Strategy (High Level)

1.  **Ordering speakers**
    
    -   Randomize order of speakers (to vary puzzles).
        
    -   Optionally bias to place some easy clues early, e.g. give 3–5 “direct” clues (types 1–6) first.
        
2.  **Iterative assignment with backtracking**
    
    `function assignClues(speakerIndex, chosenClues):
        if speakerIndex == 20:
            if validatePuzzle(chosenClues):
                return chosenClues (success)
            else:
                return failure
    
        S = speakersInOrder[speakerIndex]
        shuffle(candidates[S])
    
        for clue in candidates[S]:
            chosenClues[S] = clue
            if earlyPrune(chosenClues):
                # e.g. quick check that puzzle still likely solvable
                return assignClues(speakerIndex + 1, chosenClues)
            # else try another clue
        return failure` 
    
    -   If backtracking fails for all speakers, regenerate puzzle (Phase 1).
        
3.  **Early Pruning (Optional but helpful)**
    
    -   Simple sanity checks before full validation:
        
        -   Ensure at least `K` direct person/row/column clues are present.
            
        -   Limit total number of “global” element clues (13–14).
            
        -   Ensure no obviously redundant clues (e.g. two identical “X is a demon” from different speakers).
            

----------

### Phase 5: Puzzle Validation (Uniqueness & Deduction)

This is the core: given **fixed clues** and the unknown identities, confirm:

1.  There is at least one identity assignment satisfying all clues.
    
2.  There is **exactly one** such assignment — the ground truth.
    
3.  A “logical player” using your specified local deduction rules can derive every identity.
    

You’ll need two engines:

1.  **Formal constraint solver** (for uniqueness).
    
2.  **Human-style deduction engine** (for playability).
    

#### 5.1 Formal Constraint Solver (Uniqueness)

Treat each character’s identity as a Boolean:

-   `X_i = demon?` (`true` = demon, `false` = cultivator).
    

Translate each clue into constraints over these variables. For example:

-   Type 1: `PERSON_IS_DEMON(T)` ⇒ `X_T = true`.
    
-   Type 3: “D is the only demon in row r” ⇒
    
    -   `X_D = true`
        
    -   For all other `j` in row `r`: `X_j = false`.
        
-   Type 7: “I (S) have exactly N demon neighbors and T is one of them” ⇒
    
    -   `X_T = true`
        
    -   `sum_{j in neighbors[S]} X_j = N`.
        

etc.

Then:

1.  **Check ground truth is a solution**
    
    -   Plug actual identities; verify all clauses satisfied.
        
2.  **Search for other solutions**
    
    -   Use backtracking/SAT-style search:
        
        -   Recursively assign identities to characters, prune when any clue is violated.
            
    -   If you find a distinct assignment different from ground truth, puzzle is **not unique** → reject this clue set.
        

Given only 20 boolean variables and strong constraints, this is very manageable.

----------

#### 5.2 Human-Style Deduction Engine (Playability)

Now simulate **deterministic logical reasoning** using exactly your deduction rules.

We want to see if, starting from “all identities unknown”, repeatedly applying local rules eventually determines every identity.

Setup:

-   `state[i] ∈ {UNKNOWN, DEMON, CULTIVATOR}` initially all UNKNOWN.
    
-   `knownElementGroups`, `knownNeighbors`, etc. are part of static board.
    

Algorithm:

`function runDeduction(clues):
    state = { all UNKNOWN }
    progress = true
    while progress:
        progress = false

        # Apply each clue type's rule as long as it can deduce new identities
        progress |= applyPersonClues(clues, state)
        progress |= applyRowColumnOnlyClues(clues, state)
        progress |= applyNeighborCountClues(clues, state)
        progress |= applyNeighborRowColumnQuotaClues(clues, state)
        progress |= applyElementQuotaClues(clues, state)

    return state` 

Where each `apply...` follows exactly the rules in your spec:

-   **PERSON_IS_DEMON/CULTIVATOR**:
    
    -   If clue about T and `state[T] == UNKNOWN`, set to DEMON/CULTIVATOR.
        
-   **ONLY_DEMON_IN_ROW**:
    
    -   For row r and subject D:
        
        -   `state[D] = DEMON`.
            
        -   For other `j` in row r: `state[j] = CULTIVATOR`.
            
-   **ONLY_CULTIVATOR_IN_ROW**, similarly.
    
-   **N_NEIGHBORS_A_DAEMON / N_NEIGHBORS_A_CULTIVATOR**:
    
    -   For each speaker S:
        
        -   If “I have exactly N demon neighbors and T is one of them”:
            
            -   If `T` still unknown, but the clue states T is demon ⇒ `state[T] = DEMON`.
                
            -   Then use counting rules: when known demon/cultivator neighbor counts reach thresholds, deduce remaining neighbors.
                
-   **Row/Column quota neighbor clues (9–12)**:
    
    -   Implement your Case 1 / Case 2 exactly using currently known states & totals.
        
-   **Element quota clues (13–14)**:
    
    -   Maintain counts of known demons/cultivators per element.
        
    -   When quotas (`M` and `N-M`) are reached, deduce the rest.
        

After the loop finishes:

-   If all `state[i] != UNKNOWN` ⇒ **puzzle is fully logically solvable** by your rules.
    
-   If some remain UNKNOWN ⇒ this clue set requires guessing → reject.
    

> For now, assume **all clues are visible from the start**.  
> Later you can layer in “reveal gating” (clue unlocks when that speaker is revealed) and add a search for a valid reveal order, but that’s an extra layer on top of this core solver.

----------

### Phase 6: Difficulty Rating (Optional)

Once a puzzle passes validation, you can assign a **difficulty** based on:

-   Number of steps required in deduction engine loop until all determined.
    
-   Mix of clue types used:
    
    -   More direct clues ⇒ easier.
        
    -   Heavy use of neighbor quota / element clues ⇒ harder.
        
-   Number of times “higher-order” rules (9–14) were actually needed to resolve identities.
    

Example:

`difficultyScore = 
    w1 * steps +
    w2 * count(types 9–14 used) -
    w3 * count(types 1–2 used)` 

Bucket into Easy / Medium / Hard.

----------

### Phase 7: Output Puzzle

When puzzle passes uniqueness & deduction checks:

1.  **Store puzzle data:**
    
    -   Character metadata (name, position, spiritual root).
        
    -   Identities (for answer key only).
        
    -   Chosen clues (one per character, structured + formatted text).
        
    -   Difficulty rating.
        
2.  **Provide runtime model for your game engine:**
    
    -   For each character:
        
        ```
        {
          "id": 0,
          "name": "Chen Hao",
          "row": 0,
          "col": 1,
          "spiritualRoot": ["Wood", "Fire"],
          "identity": "Demon",          // hidden from player
          "clue": {
            "type": "N_NEIGHBORS_A_DAEMON",
            "params": { "N": 2, "mentionedId": 7 },
            "text": "I have exactly 2 demon neighbors and Zhang Wei is one of them."
          }
        }
        ``` 
        

That’s the full generation loop:

1.  Random board & roots (Phase 1–2).
    
2.  Build candidate clues from ground truth (Phase 3).
    
3.  Choose one clue per character with backtracking (Phase 4).
    
4.  Validate uniqueness + logical solvability (Phase 5).
    
5.  Rate & export puzzle (Phase 6–7).

## Configuration

### CLUE_CONFIG

Each clue type can be enabled/disabled:

```javascript
const CLUE_CONFIG = {
  PERSON_IS_DEMON: true/false,
  PERSON_IS_CULTIVATOR: true/false,
  ONLY_DEMON_IN_ROW: true/false,
  ONLY_CULTIVATOR_IN_ROW: true/false,
  ONLY_DEMON_IN_COLUMN: true/false,
  ONLY_CULTIVATOR_IN_COLUMN: true/false,
  N_NEIGHBORS_A_DAEMON: true/false,
  N_NEIGHBORS_A_CULTIVATOR: true/false,
  M_OF_N_DEMONS_NEIGHBORING_IN_ROW: true/false,
  M_OF_N_DEMONS_NEIGHBORING_IN_COLUMN: true/false,
  M_OF_N_CULTIVATORS_NEIGHBORING_IN_ROW: true/false,
  M_OF_N_CULTIVATORS_NEIGHBORING_IN_COLUMN: true/false,
  M_OF_N_SPIRITUAL_ROOT_ELEMENT_BE_DEMON: true/false,
  M_OF_N_SPIRITUAL_ROOT_ELEMENT_BE_CULTIVATOR: true/false,
}
```

- Set to `false` to disable a clue type
- Generator will skip disabled types when creating clues
- If no enabled types are available, falls back to basic PERSON_IS_DEMON/CULTIVATOR

### DEBUG Mode

```javascript
const DEBUG = true/false;
```

When enabled, console logs:
- Next deducible moves during gameplay
- Detailed deduction attempts when clicking characters
- Validation failures with reasons

---

## Game Flow

### 1. Initialization
- Generate new puzzle (characters, identities, clues)
- Reveal first person
- Start timer

### 2. Player Turn
- Player clicks on an unrevealed character
- Modal shows: "What is this person's true identity?"
- Player chooses: Cultivator or Demon

### 3. Validation
- Check if character can be deduced from revealed clues
- Check if guess matches actual identity
- If valid: reveal character and show their clue
- If invalid: show "Not enough evidence!" warning

### 4. Win Condition
- All 20 characters revealed
- Stop timer
- Show completion time
- Offer to share results or play again

---

## Invariants & Guarantees

### Puzzle Generation Guarantees

1. **Solvability**: Every generated puzzle is guaranteed to be solvable
2. **Sequential Deducibility**: At each step, at least one new person can be deduced
3. **M_OF_N Validity**: All M_OF_N clues are validated to ensure they actually enable deduction
4. **Neighbor Requirement**: M_OF_N and N_NEIGHBORS clues only reference actual neighbors
5. **No Circular Dependencies**: The solve chain is a permutation, ensuring no deadlocks

### Deduction Engine Guarantees

1. **Determinism**: Given the same game state, `canDeduceIdentity()` always returns the same result
2. **Soundness**: If the engine says a person can be deduced, they truly can be deduced from revealed clues
3. **Completeness**: If a person can be logically deduced, the engine will find the deduction (may require multiple revealed clues)

### Game State Invariants

1. **At least one person is always revealed** (starting person)
2. **Revealed persons always have their clues visible** (except the starting person shows their clue after revealing another)
3. **A person cannot be revealed twice**
4. **The solve chain always has exactly 20 unique positions**


---

## Performance Considerations

### Puzzle Generation
- **Time Complexity**: O(n²) where n = 20 characters
- **Space Complexity**: O(n)
- **Bottleneck**: M_OF_N clue validation (requires simulating deduction)
- **Optimization**: Early exit when valid clue found

### Deduction Engine
- **Time Complexity**: O(n²) worst case (checking all pairs)
- **Space Complexity**: O(n)
- **Typical Case**: O(n) as deductions usually found quickly
- **Caching**: Not needed due to fast computation

### UI Updates
- **Card Reveals**: Animated, non-blocking
- **Clue Display**: Rendered on reveal only
- **State Updates**: React batching handles efficiently

---

## Version & Compatibility

- **Current Version**: 1.0
- **Framework**: Next.js 16.0.7 with React
- **Browser Support**: Modern browsers with ES6+ support
- **Mobile**: Responsive design for touch interfaces
