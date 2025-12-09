As a professional table top game designer, your task is to change the nature of clues to feel like social deduction. Instead of mechanical statements (“I have 2 innocent neighbors”), rewrite in voice.

Right now clues are purely logical (“exactly 2 neighbors”, “only innocent”, etc.). To make it Werewolf-like, clues should feel like accusations, paranoia, observations, and night actions.

# Examples of Werewolf-aligned clue styles
## Accusation Clues

“Bob growls at night. At least one of my neighbors is a werewolf — and Bob isn’t innocent.”

## Alibi Clues

“I shared the lantern with Clyde last night. He couldn’t have howled.”

## Night Action Clues

“As the Seer, I sensed one werewolf in column B.”

## Behavioral Clues

“Whoever is to my right scratches the ground too much. Wolves do that.”

## Folk Logic

“Wolves never sit next to each other in my village… except when a Minion separates them.”

## More Immersion

“I have exactly 2 innocent neighbors. Gabe is one of them.” -> “Two around me slept peacefully last night — Gabe for sure. But the third… something stalks him.”

These support the theme without losing truthfulness.

Each clue can attach a subtle emotional context:

* frightened villager
* confident hunter
* nervous 
* confused cursed villager
* authoritative Elder

Example:

“I’m scared… three shadows circled row 4 last night. Only two were friendly.”

Clues become story snippets. Still logical—just atmospheric.

When someone is pointing itself as a role and its deductableRoles is empty array, like Silas says "Silas is a werewolf", the statement becomes a pure flavour NPCs build world, foreshadow a twist, add humour, or hint at the theme, This makes the world feel alive, while eliminating redundancy complaints.

---

Given INPUT json, reserve statement as mechanic_statement, and print OUTPUT json with statement being tone-adjusted statements.

INPUT:
