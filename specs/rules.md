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

## **Atom Library Specification**

Atoms are the smallest semantic units. A full clause is formed by chaining atoms beginning with a polarity root.

----------

### **1.1 Polarity Roots**

| Atom | Meaning |
|------|---------|
| `pos()` | Refers to **cultivator(s)** |
| `neg()` | Refers to **demon(s)-in-disguise** |

----------

### **1.2 Quantifier Atoms**

| Atom | Meaning |
|------|---------|
| `exact(n)` | Exactly _n_ |
| `of(m, n)` | Exactly _m_ of _n_ total (group must have exactly n people) |
| `atLeast(n)` | At least _n_ |
| `atMost(n)` | At most _n_ |
| `oneof(k)` | Exactly one of the _k_ |
| `inTotal(n)` | The total count is _n_ |
| `even()` | An even number of |
| `odd()` | An odd number of |
| `most()` | The uniquely largest number |
| `all()` | All |
| `any()` | Any (conditional) |

----------

### **1.3 Group Selector Atoms**

| Atom | Meaning |
|------|---------|
| `row(r)` | Positions in row r |
| `column(C)` | Positions in column C |
| `corner()` | All corners |
| `edge()` | All edges |

----------

### **1.4 Role / Property Atom**

| Atom | Meaning |
|------|---------|
| `be(label)` | Persons have the property/role _label_ |

----------

### **1.5 Positional Relations**

| Atom | Meaning |
|------|---------|
| `between(x,y)` | Strictly between x and y |
| `leftOf(x)` | Somewhere left of x |
| `rightOf(x)` | Somewhere right of x |
| `above(x)` | Somewhere above x |
| `below(x)` | Somewhere below x |
| `directlyLeftOf(x)` | Immediately left of x |
| `directlyRightOf(x)` | Immediately right of x |
| `directlyAbove(x)` | Immediately above x |
| `directlyBelow(x)` | Immediately below x |

----------

### **1.6 Neighbor / Connectivity Atoms**

| Atom | Meaning |
|------|---------|
| `neighbor(x)` | Neighbors of x |
| `commonNeighbors(x,y)` | Common neighbors of x and y |
| `connected(g)` | Form a connected group (within g if provided) |

---

## **DSL Grammar Specification**

The clue system uses a composable grammar built from atoms:

```
Clause         ::= Chain ;
Chain          ::= RootCall StepChain ;
RootCall       ::= "pos" "(" ")" | "neg" "(" ")" ;
StepChain      ::= /* empty */ | "." Step StepChain ;
Step           ::= QuantifierCall
                 | GroupSelectorCall
                 | RolePredicateCall
                 | BoardRelationCall
                 | NeighborRelationCall ;

QuantifierCall ::= "exact" "(" INT ")"
                 | "atLeast" "(" INT ")"
                 | "atMost" "(" INT ")"
                 | "oneof" "(" INT ")"
                 | "of" "(" INT "," INT ")"
                 | "inTotal" "(" INT ")"
                 | "even" "(" ")"
                 | "odd" "(" ")"
                 | "most" "(" ")"
                 | "all" "(" ")"
                 | "any" "(" ")" ;

GroupSelectorCall ::= "row" "(" INT ")"
                    | "column" "(" COLUMN_ID ")"
                    | "corner" "(" ")"
                    | "edge" "(" ")" ;

RolePredicateCall ::= "be" "(" LABEL ")" ;

BoardRelationCall ::= "between" "(" CELL_REF "," CELL_REF ")"
                    | "leftOf" "(" CELL_REF ")"
                    | "rightOf" "(" CELL_REF ")"
                    | "above" "(" CELL_REF ")"
                    | "below" "(" CELL_REF ")"
                    | "directlyLeftOf" "(" CELL_REF ")"
                    | "directlyRightOf" "(" CELL_REF ")"
                    | "directlyAbove" "(" CELL_REF ")"
                    | "directlyBelow" "(" CELL_REF ")" ;

NeighborRelationCall ::= "neighbor" "(" CELL_REF ")"
                       | "commonNeighbors" "(" CELL_REF "," CELL_REF ")"
                       | "connected" "(" GROUP_REF ")" ;

INT        ::= digits ;
COLUMN_ID  ::= "A" | "B" | "C" | "D" ;
ROW_ID     ::= "1" | "2" | "3" | "4" | "5" ;
CELL_REF   ::= IDENT ;
GROUP_REF  ::= IDENT ;
LABEL      ::= IDENT ;
IDENT      ::= [A-Za-z_][A-Za-z0-9_]* ;
```

### **Compositional Patterns**

Multiple group selectors can be composed to create intersection constraints:

**Pattern: Neighbor + Location**
```
RootCall . QuantifierCall . NeighborCall . LocationCall
```

When both `neighbor(x)` and a location selector (`row(r)` or `column(c)`) appear in a chain, they define an intersection:
- The affected group is: (neighbors of X) ∩ (people in location)
- The quantifier applies to this intersection

**Example:**
```
neg().of(2,4).neighbor(PersonX).row(3)
```
Meaning: "Of PersonX's neighbors who are in row 3 (4 people total), exactly 2 are demons"

Natural language: "Exactly 2 of the 4 neighbors of PersonX in row 3 are demons-in-disguise."

**Note:** The `of(m, n)` quantifier asserts both:
1. The intersection has exactly n people
2. Of those n people, exactly m match the polarity (demons or cultivators)

---

## **Natural Language Conversion Specification**

Conversion applies a left-to-right compositional mapping from atoms to English fragments.

----------

### **3.1 Sentence Template**

For a chain:

```
RootCall . Step1 . Step2 ... StepN
```

The final sentence is:

```
SubjectPhrase + " " + VerbPhrase + OptionalRelationPhrases + "."
```

Where:

- **SubjectPhrase** = QuantifierPhrase + PolarityNoun + GroupPhrase
- **VerbPhrase** = RolePhrase (default: "are")
- **OptionalRelationPhrases** = joined list of relation fragments

----------

### **3.2 Polarity Mapping**

| RootCall | Natural Language |
|----------|------------------|
| `pos()` | "cultivator(s)" |
| `neg()` | "demon(s)-in-disguise" |

----------

### **3.3 Quantifier Mapping**

| Atom | Natural Language Output |
|------|-------------------------|
| `exact(n)` | "Exactly n" |
| `atLeast(n)` | "At least n" |
| `atMost(n)` | "At most n" |
| `oneof(k)` | "Exactly one of these k" |
| `of(i,j)` | "Among positions i to j," (prepended to the existing quantifier) |
| `inTotal(n)` | "In total, n" |
| `even()` | "An even number of" |
| `odd()` | "An odd number of" |
| `most()` | "The uniquely largest number of" |
| `all()` | "All" |
| `any()` | "Any" |

----------

### **3.4 Group Selector Mapping**

| Atom | Natural Language |
|------|------------------|
| `row(r)` | "in row r" |
| `column(C)` | "in column C" |
| `corner()` | "in the corners" |
| `edge()` | "on the edge" |

**Special case - `neighbor(x)`:**

The `neighbor(x)` atom requires special sentence structure:
- Instead of: "Quantifier Polarity-Noun neighbors of X are"
- Use: "X has Quantifier Polarity-Noun neighbor(s)" OR
- Use: "Quantifier neighbor(s) of X is/are Polarity-Noun"

Examples:
- `neg().exact(2).neighbor(Yuan)` → "Yuan Jun has exactly 2 demon neighbors."
- `pos().exact(1).neighbor(Li)` → "Li Mu has exactly 1 cultivator neighbor."
- `neg().all().neighbor(Chen)` → "Chen Hao has all demon neighbors."

----------

### **3.5 Role Predicate Mapping**

`be(label)` →

**For spiritual root elements (Metal, Wood, Water, Fire, Earth):**
- Change verb from "are/is" to "have/has"
- Append "spiritual root" after the element name
- `"have/has <element> spiritual root"`

**For other properties:**
- `"are/is <label>"`

Examples:
- `be(Fire)` → "have Fire spiritual root" (spiritual root element)
- `be(Water)` → "has Water spiritual root" (singular)
- `be(cultivator)` → "are cultivators" (other property)

----------

### **3.6 Positional Relation Mapping**

| Atom | Natural Language |
|------|------------------|
| `between(a,b)` | "are between A and B" (use "me" if speaker is a or b) |
| `leftOf(x)` | "are to the left of X" |
| `rightOf(x)` | "are to the right of X" |
| `above(x)` | "are somewhere above X" |
| `below(x)` | "are somewhere below X" |
| `directlyLeftOf(x)` | "are directly left of X" |
| … | etc. |

**First-person substitution for `between(a,b)`:**
- If the speaker is person `a`, use "me" instead of the speaker's name
- If the speaker is person `b`, use "me" instead of the speaker's name

Examples:
- Speaker is Li Mu: `between(Li_Mu, Zhang_Wei)` → "between me and Zhang Wei"
- Speaker is Zhang Wei: `between(Li_Mu, Zhang_Wei)` → "between Li Mu and me"
- Speaker is Chen Hao: `between(Li_Mu, Zhang_Wei)` → "between Li Mu and Zhang Wei"

----------

### **3.7 Neighbor / Connectivity Mapping**

| Atom | Natural Language |
|------|------------------|
| `neighbor(x)` | "are neighbors of X" or "among the neighbors of X" |
| `commonNeighbors(x,y)` | "are common neighbors of X and Y" |
| `connected(g)` | "form a connected group (in g)" |

### **3.8 Final Linearization Rule**

Sentences follow standard Subject-Verb-Predicate structure.

**Standard structure:**

```
Subject = Quantifier + PolarityNoun + [GroupModifier]
Verb = "is" | "are" (based on singular/plural)
Predicate = Property | Positional | (Property + " and " + Positional)

Sentence = Subject + " " + Verb + " " + Predicate + "."
```

Where:
- **Quantifier**: "exactly N", "all", "at least N", etc.
- **PolarityNoun**: "cultivator(s)" or "demon(s)-in-disguise"
- **GroupModifier**: "in row N" or "in column C" (restricts the subject domain)
- **Property**: from `be()` atom (e.g., "fire", "water")
- **Positional**: from positional atoms (e.g., "somewhere above X", "between X and Y")

**Special case: Location-only clues**

When there is only a group modifier and no other predicate, flip subject and predicate to emphasize location:
```
Sentence = Quantifier + " " + LocationPhrase + " " + Verb + " " + PolarityNoun + "."
```
Examples:
- "All in row 5 are cultivators."
- "Exactly 1 in column B is demon."
- "Exactly 3 in row 2 are demons-in-disguise."

**Special structure for `neighbor(x)` atom:**
```
QuantifierPhrase = "exactly N" | "all" | etc.
PolarityNoun = "cultivator" | "demon" (with plural as needed)

// If speaker is talking about themselves (speakerId === x):
Sentence = "I have " + QuantifierPhrase + " " + PolarityNoun + " neighbor(s)."

// If speaker is talking about someone else:
PersonName = name of person referenced by neighbor(x)
Sentence = PersonName + " has " + QuantifierPhrase + " " + PolarityNoun + " neighbor(s)."
```

Examples:
- "I have exactly 3 cultivator neighbors." (when speaker talks about themselves)
- "Zhang Wei has all demon neighbors." (when speaker talks about someone else)

### **3.9 Example Conversions**

**Example 1: Spiritual root only**

Input:
```
neg().exact(2).be(Fire)
```

Output:
```
"Exactly 2 demons-in-disguise have Fire spiritual root."
```

**Example 2: Spiritual root with position**

Input:
```
neg().exact(2).be(Fire).below(a)
```

Output:
```
"Exactly 2 demons-in-disguise have Fire spiritual root and are somewhere below A."
```

**Example 3: Location only**

Input:
```
neg().exact(1).row(2)
```

Output:
```
"Exactly 1 in row 3 is demon."
```

**Example 4: Property with group modifier**

Input:
```
pos().exact(3).row(1).be(water)
```

Output:
```
"Exactly 3 cultivators in row 2 are water."
```

**Example 5: All in location**

Input:
```
pos().all().column(0)
```

Output:
```
"All in column A are cultivators."
```

**Example 6: Neighbor count (self-reference)**

Input (where speaker is Yuan Jun):
```
pos().exact(3).neighbor(Yuan_Jun_id)
```

Output:
```
"I have exactly 3 cultivator neighbors."
```

**Example 7: Neighbor count (other person)**

Input:
```
pos().exact(3).neighbor(Zhang_Wei_id)
```

Output:
```
"Zhang Wei has exactly 3 cultivator neighbors."
```

**Example 8: All neighbors (self-reference)**

Input (where speaker is Chen Hao):
```
neg().all().neighbor(Chen_Hao_id)
```

Output:
```
"I have all demon neighbors."
```

**Example 9: Between positions**

Input:
```
neg().exact(2).between(Li_Mu_id, Zhang_Wei_id)
```

Output (speaker is not Li Mu or Zhang Wei):
```
"Exactly 2 demons-in-disguise are between Li Mu and Zhang Wei."
```

**Example 10: Between positions (with self-reference)**

Input (where speaker is Li Mu):
```
pos().exact(1).between(Li_Mu_id, Zhang_Wei_id)
```

Output:
```
"Exactly 1 cultivator is between me and Zhang Wei."
```

Input (where speaker is Zhang Wei):
```
pos().exact(1).between(Li_Mu_id, Zhang_Wei_id)
```

Output:
```
"Exactly 1 cultivator is between Li Mu and me."
```

**Example 11: Composed neighbor + location (self-reference)**

Input (where speaker is Chen Hao):
```
neg().of(2,5).neighbor(Chen_Hao_id).row(3)
```

Output:
```
"Exactly 2 of the 5 my neighbors in row 4 are demons-in-disguise."
```

**Example 12: Composed neighbor + location (other person)**

Input:
```
pos().of(3,4).neighbor(Zhang_Wei_id).column(2)
```

Output:
```
"Exactly 3 of the 4 Zhang Wei's neighbors in column C are cultivators."
```

---

## Puzzle Generation Algorithm

### Phase 1: Initialize Characters

1. **Generate Names**

   - Create 20 unique names from surname + given-name pools (Chinese pinyin).
   - Example: `["Li Mu", "Zhang Wei", "Chen Hao", ...]`
   - Sort alphabetically to ensure consistent internal ordering (helps reproducibility / debugging).

2. **Assign Grid Positions**

   - For `i` from `0` to `19`:
     - `row = i // 4` (0–4)
     - `col = i % 4` (0–3)
   - Store both internal coordinates `(row, col)` and display coordinates: `Row = row + 1`, `Col = "ABCD"[col]`.

3. **Assign Identities**

   - Decide demon count `D` randomly in `[6, 8]`.
   - Randomly choose `D` distinct indices from `0..19` as demons.
   - All others are cultivators.

4. **Assign Spiritual Roots**

   - For each character:
     - Randomly choose root size `k` in `[1, 5]`.
     - Randomly sample `k` distinct elements from `{Metal, Wood, Water, Fire, Earth}`.
   - Store as a set/list, e.g. `["Metal", "Wood"]`.

----------

### Phase 2: Precompute Board Structures

Before generating clues, precompute all the relationships you will need.

1. **Indexing Helpers**

   - `id -> (row, col)` map.
   - `(row, col) -> id` map.
   - `row -> [ids in that row]`
   - `col -> [ids in that column]`

2. **Neighbors for Each Character**

   ```
   neighbors[id] = []
   for each id1:
     for each id2 != id1:
       if abs(row1 - row2) <= 1 and abs(col1 - col2) <= 1:
         neighbors[id1].append(id2)
   ```

   - Edge: 5 neighbors
   - Corner: 3 neighbors
   - Interior: 8 neighbors

3. **Element Groups**

   - For each element `E` in `{Metal, Wood, Water, Fire, Earth}`:
     - `elementGroup[E] = [ids whose spiritual root contains E]`
     - `N_E = len(elementGroup[E])` – total people with that element.
   - These will be used for element-based clues.

4. **Ground-Truth Stats (from identities)**

   - For each row `r` (0–4):
     - `rowDemons[r] = [ids in row r that are demons]`
     - `rowCultivators[r] = [ids in row r that are cultivators]`
   - For each column `c` (0–3):
     - `colDemons[c] = [...]`
     - `colCultivators[c] = [...]`
   - For each character `id`:
     - `demonNeighbors[id] = neighbors[id] filtered by demons`
     - `cultivatorNeighbors[id] = neighbors[id] filtered by cultivators`

----------

### Phase 3: Build Candidate Clues for Each Character

Goal: for each **speaker** (each of the 20 characters), build a _set of truth-consistent candidate clues_ they could say, using atom chains.

You'll later pick exactly **one** clue per speaker from these candidates.

#### 3.1 Atom Chain Generation Strategy

For each speaker, generate atom chains by composing:
- Polarity root (pos/neg)
- Quantifiers (exact, all, etc.)
- Group selectors (row, column, neighbor)
- Relations (below, above, between)
- Properties (spiritual root elements)

Each chain must be validated against ground truth.

----------

### Phase 4: Select One Clue per Character

You now have, for each speaker `S`, a list `candidates[S]` of truth-consistent atom chains.

Goal: **choose exactly one clue for each of the 20 characters** such that the resulting puzzle:

- Is consistent (automatically true by construction).
- Has a **unique** solution (your ground truth).
- All identities are deducible via logical inference (no guessing).

We'll do this via **randomized selection + constraint solving**.

#### 4.1 Selection Strategy (High Level)

1. **Ordering speakers**

   - Randomize order of speakers (to vary puzzles).
   - Optionally bias to place some easy clues early.

2. **Iterative assignment with backtracking**

   ```
   function assignClues(speakerIndex, chosenClues):
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
               return assignClues(speakerIndex + 1, chosenClues)
       return failure
   ```

   - If backtracking fails for all speakers, regenerate puzzle (Phase 1).

3. **Early Pruning (Optional but helpful)**

   - Simple sanity checks before full validation:
     - Ensure at least `K` direct clues are present.
     - Limit total number of complex clues.
     - Ensure no obviously redundant clues.

----------

### Phase 5: Puzzle Validation (Uniqueness & Deduction)

This is the core: given **fixed clues** and the unknown identities, confirm:

1. There is at least one identity assignment satisfying all clues.
2. There is **exactly one** such assignment — the ground truth.
3. A "logical player" using your specified local deduction rules can derive every identity.

You'll need two engines:

1. **Formal constraint solver** (for uniqueness).
2. **Human-style deduction engine** (for playability).

#### 5.1 Formal Constraint Solver (Uniqueness)

Treat each character's identity as a Boolean:

- `X_i = demon?` (`true` = demon, `false` = cultivator).

Translate each atom chain into constraints over these variables.

Then:

1. **Check ground truth is a solution**
   - Plug actual identities; verify all clauses satisfied.

2. **Search for other solutions**
   - Use backtracking/SAT-style search:
     - Recursively assign identities to characters, prune when any clue is violated.
   - If you find a distinct assignment different from ground truth, puzzle is **not unique** → reject this clue set.

Given only 20 boolean variables and strong constraints, this is very manageable.

----------

#### 5.2 Human-Style Deduction Engine (Playability)

Now simulate **deterministic logical reasoning** using exactly your deduction rules.

We want to see if, starting from "all identities unknown", repeatedly applying local rules eventually determines every identity.

Setup:

- `state[i] ∈ {UNKNOWN, DEMON, CULTIVATOR}` initially all UNKNOWN.
- `knownElementGroups`, `knownNeighbors`, etc. are part of static board.

Algorithm:

```
function runDeduction(clues):
    state = { all UNKNOWN }
    progress = true
    while progress:
        progress = false

        # Apply each atom chain's deduction rules
        for each clue in clues:
            progress |= applyAtomChainDeduction(clue, state)

    return state
```

After the loop finishes:

- If all `state[i] != UNKNOWN` ⇒ **puzzle is fully logically solvable** by your rules.
- If some remain UNKNOWN ⇒ this clue set requires guessing → reject.

----------

### Phase 6: Difficulty Rating (Optional)

Once a puzzle passes validation, you can assign a **difficulty** based on:

- Number of steps required in deduction engine loop until all determined.
- Mix of atom chain complexity used:
  - Simple direct chains ⇒ easier.
  - Complex multi-atom chains ⇒ harder.
- Number of times complex rules were actually needed to resolve identities.

----------

### Phase 7: Output Puzzle

When puzzle passes uniqueness & deduction checks:

1. **Store puzzle data:**

   - Character metadata (name, position, spiritual root).
   - Identities (for answer key only).
   - Chosen atom chains (one per character, with natural language text).
   - Difficulty rating.

2. **Provide runtime model for your game engine:**

   - For each character:
     ```
     {
       "id": 0,
       "name": "Chen Hao",
       "row": 0,
       "col": 1,
       "spiritualRoot": ["Wood", "Fire"],
       "identity": "Demon",
       "clue": {
         "chain": [atom chain structure],
         "text": "Exactly 2 demons-in-disguise are fire and are somewhere below A."
       }
     }
     ```

---

## Configuration

### Atom Chain Configuration

Atoms can be enabled/disabled individually to control puzzle complexity:

```javascript
const ATOM_CONFIG = {
  // Polarity roots (always enabled)
  polarity: true,

  // Quantifiers
  exact: true,
  atLeast: true,
  atMost: true,
  all: true,

  // Group selectors
  row: true,
  column: true,
  corner: true,
  edge: true,

  // Positional relations
  above: true,
  below: true,
  between: true,

  // Neighbor relations
  neighbor: true,

  // Properties
  spiritualRoot: true,
}
```

### DEBUG Mode

```javascript
const DEBUG = true; // Set to false to disable debug logging
```

When enabled (`DEBUG = true`), the game prints detailed state information to the browser console:

**On Game Start:**
- Full list of all 20 characters with their true identities
- Each character's clue text
- Initially revealed character
- List of immediately deducible characters

**After Each Choice:**
- Updated game state showing revealed characters
- All character identities and clues
- Current deducible characters and their identities
- Progress tracking (revealed count)

**Console Output Format:**
```
================================================================================
🎮 DEBUG: GAME STARTED
================================================================================

📊 GAME STATE:
  Revealed: 1/20 characters
  Deducible: 3 characters

👥 ALL CHARACTERS:
  🧘 [ 0] Chen Hao        | CULTIVATOR | ✅ REVEALED
      💬 "Exactly 2 demons-in-disguise are fire."
  👹 [ 1] Li Mu           | DEMON      | ❌ Hidden 🔍 DEDUCIBLE as DEMON
      💬 "Zhang Wei has exactly 3 cultivator neighbors."
  ...

🔍 NEXT DEDUCIBLE:
  👹 Li Mu → DEMON
  🧘 Wang Hua → CULTIVATOR
  👹 Zhao Yan → DEMON

================================================================================
```

This debug output helps developers:
- Verify puzzle generation correctness
- Test deduction logic
- Understand the solve path
- Debug clue generation issues

---

## Game Flow

### 1. Initialization
- Generate new puzzle (characters, identities, atom chain clues)
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
3. **Chain Validity**: All atom chains are validated to ensure they actually enable deduction
4. **Compositional Semantics**: Each atom contributes meaningfully to the clue's logical constraint
5. **No Circular Dependencies**: The solve chain is a permutation, ensuring no deadlocks

### Deduction Engine Guarantees

1. **Determinism**: Given the same game state, deduction always returns the same result
2. **Soundness**: If the engine says a person can be deduced, they truly can be deduced from revealed clues
3. **Completeness**: If a person can be logically deduced, the engine will find the deduction

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
- **Bottleneck**: Atom chain validation (requires simulating deduction)
- **Optimization**: Early exit when valid chain found

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

- **Current Version**: 2.0 (Atom-based DSL)
- **Framework**: Next.js 16.0.7 with React
- **Browser Support**: Modern browsers with ES6+ support
- **Mobile**: Responsive design for touch interfaces
