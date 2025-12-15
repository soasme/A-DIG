const CLUE_TYPE_KEYS = [
  'EXACTLY_K_ROLE_IN_ROW',
  'EXACTLY_K_ROLE_IN_COLUMN',
  'EXACTLY_ROLE_ABOVE_ROW',
  'EXACTLY_ROLE_BELOW_ROW',
  'EXACTLY_K_ROLE_LEFT_COLUMN',
  'EXACTLY_K_ROLE_RIGHT_COLUMN',
  'EXACTLY_K_ROLE_ABOVE_SOMEONE',
  'EXACTLY_K_ROLE_BELOW_SOMEONE',
  'EXACTLY_K_ROLE_LEFT_OF_SOMEONE',
  'EXACTLY_K_ROLE_RIGHT_OF_SOMEONE',
  'EXACTLY_K_ROLE_BETWEEN_THE_TWO',
  'ALL_ROLE_IN_ROW_CONNECTED',
  'ALL_ROLE_IN_COLUMN_CONNECTED',
  'HAVE_EQUAL_ROLE_NEIGHBOR',
  'HAVE_MORE_ROLE_NEIGHBORS',
  'HAVE_LESS_ROLE_NEIGHBORS',
  'BE_ONE_OF_SOMEONES_K_ROLE_NEIGHBORS',
  'HAS_EXACT_K_ROLE_NEIGHBOR',
  'K_OF_J_ROLE_TO_THE_LEFT_OF_SOMEONE_IS_ANOTHERS_NEIGHBOR',
  'K_OF_J_ROLE_TO_THE_RIGHT_OF_SOMEONE_IS_ANOTHERS_NEIGHBOR',
  'K_OF_J_ROLE_ABOVE_SOMEONE_IS_ANOTHERS_NEIGHBOR',
  'K_OF_J_ROLE_BELOW_SOMEONE_IS_ANOTHERS_NEIGHBOR',
  'K_OF_J_ROLE_NEIGHBOR_TO_SOMEONE_IS_ANOTHERS_NEIGHBOR',
  'K_OF_J_ROLE_BEFORE_ALPHABET_NAMES',
  'K_OF_J_ROLE_AFTER_ALPHABET_NAMES',
];

export const CLUE_TYPES = Object.freeze(
  CLUE_TYPE_KEYS.reduce((acc, key, idx) => {
    acc[key] = idx + 1; // use ints for harder guessability
    return acc;
  }, {})
);

const LEGACY_STRING_VALUES = {
  exactlyKRoleInRow: 'EXACTLY_K_ROLE_IN_ROW',
  exactlyKRoleInColumn: 'EXACTLY_K_ROLE_IN_COLUMN',
  exactlyRoleAboveRow: 'EXACTLY_ROLE_ABOVE_ROW',
  exactlyRoleBelowRow: 'EXACTLY_ROLE_BELOW_ROW',
  exactlyKRoleLeftColumn: 'EXACTLY_K_ROLE_LEFT_COLUMN',
  exactlyKRoleRightColumn: 'EXACTLY_K_ROLE_RIGHT_COLUMN',
  exactlyKRoleAboveSomeone: 'EXACTLY_K_ROLE_ABOVE_SOMEONE',
  exactlyKRoleBelowSomeone: 'EXACTLY_K_ROLE_BELOW_SOMEONE',
  exactlyKRoleLeftOfSomeone: 'EXACTLY_K_ROLE_LEFT_OF_SOMEONE',
  exactlyKRoleRightOfSomeone: 'EXACTLY_K_ROLE_RIGHT_OF_SOMEONE',
  exactlyKRoleBetweenTheTwo: 'EXACTLY_K_ROLE_BETWEEN_THE_TWO',
  AllRoleInRowConnected: 'ALL_ROLE_IN_ROW_CONNECTED',
  AllRoleInColumnConnected: 'ALL_ROLE_IN_COLUMN_CONNECTED',
  HaveEqualRoleNeighbor: 'HAVE_EQUAL_ROLE_NEIGHBOR',
  HaveMoreRoleNeighbors: 'HAVE_MORE_ROLE_NEIGHBORS',
  HaveLessRoleNeighbors: 'HAVE_LESS_ROLE_NEIGHBORS',
  BeOneOfSomeonesKRoleNeighbors: 'BE_ONE_OF_SOMEONES_K_ROLE_NEIGHBORS',
  HasExactKRoleNeighbor: 'HAS_EXACT_K_ROLE_NEIGHBOR',
  KofJRoleToTheLeftOfSomeoneIsAnothersNeighbor: 'K_OF_J_ROLE_TO_THE_LEFT_OF_SOMEONE_IS_ANOTHERS_NEIGHBOR',
  KofJRoleToTheRightOfSomeoneIsAnothersNeighbor: 'K_OF_J_ROLE_TO_THE_RIGHT_OF_SOMEONE_IS_ANOTHERS_NEIGHBOR',
  KofJRoleAboveSomeoneIsAnothersNeighbor: 'K_OF_J_ROLE_ABOVE_SOMEONE_IS_ANOTHERS_NEIGHBOR',
  KofJRoleBelowSomeoneIsAnothersNeighbor: 'K_OF_J_ROLE_BELOW_SOMEONE_IS_ANOTHERS_NEIGHBOR',
  KofJRoleNeighborToSomeoneIsAnothersNeighbor: 'K_OF_J_ROLE_NEIGHBOR_TO_SOMEONE_IS_ANOTHERS_NEIGHBOR',
  KofJRoleBeforeAlphabetNames: 'K_OF_J_ROLE_BEFORE_ALPHABET_NAMES',
  KofJRoleAfterAlphabetNames: 'K_OF_J_ROLE_AFTER_ALPHABET_NAMES',
};

export function resolveClueType(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    if (CLUE_TYPES[value] != null) return CLUE_TYPES[value];
    const mappedKey = LEGACY_STRING_VALUES[value];
    if (mappedKey && CLUE_TYPES[mappedKey] != null) return CLUE_TYPES[mappedKey];
  }
  return null;
}
