import { CLUE_TYPES, resolveClueType } from './clue_types.js';

export function buildClueGoal(parts, { roleList, alphabeticalOrder, rows, cols, fns }) {
  if (!Array.isArray(parts) || parts.length === 0) return null;
  const [rawType, ...rest] = parts;
  const type = resolveClueType(rawType);
  if (type == null) return null;

  const {
    exactlyKRoleInRow,
    exactlyKRoleInColumn,
    exactlyRoleAboveRow,
    exactlyRoleBelowRow,
    exactlyKRoleLeftColumn,
    exactlyKRoleRightColumn,
    exactlyKRoleAboveSomeone,
    exactlyKRoleBelowSomeone,
    exactlyKRoleLeftOfSomeone,
    exactlyKRoleRightOfSomeone,
    exactlyKRoleBetweenTheTwo,
    allRoleConnectedInRow,
    allRoleConnectedInColumn,
    haveEqualRoleNeighbor,
    haveMoreRoleNeighbors,
    haveLessRoleNeighbors,
    beOneOfSomeonesKRoleNeighbors,
    hasExactKRoleNeighbor,
    kOfJRoleToTheLeftOfSomeoneIsAnothersNeighbor,
    kOfJRoleToTheRightOfSomeoneIsAnothersNeighbor,
    kOfJRoleAboveSomeoneIsAnothersNeighbor,
    kOfJRoleBelowSomeoneIsAnothersNeighbor,
    kOfJRoleNeighborToSomeoneIsAnothersNeighbor,
    kOfJRoleBeforeAlphabetNames,
    kOfJRoleAfterAlphabetNames,
  } = fns || {};

  const num = n => (typeof n === 'number' ? n : Number(n));

  switch (type) {
    case CLUE_TYPES.EXACTLY_K_ROLE_IN_ROW:
      return exactlyKRoleInRow?.(roleList, num(rest[1]), num(rest[2]), rest[0], cols);
    case CLUE_TYPES.EXACTLY_K_ROLE_IN_COLUMN:
      return exactlyKRoleInColumn?.(roleList, num(rest[1]), num(rest[2]), rest[0], rows, cols);
    case CLUE_TYPES.EXACTLY_ROLE_ABOVE_ROW:
      return exactlyRoleAboveRow?.(roleList, num(rest[1]), num(rest[2]), rest[0], cols);
    case CLUE_TYPES.EXACTLY_ROLE_BELOW_ROW:
      return exactlyRoleBelowRow?.(roleList, num(rest[1]), num(rest[2]), rest[0], rows, cols);
    case CLUE_TYPES.EXACTLY_K_ROLE_LEFT_COLUMN:
      return exactlyKRoleLeftColumn?.(roleList, num(rest[1]), num(rest[2]), rest[0], rows, cols);
    case CLUE_TYPES.EXACTLY_K_ROLE_RIGHT_COLUMN:
      return exactlyKRoleRightColumn?.(roleList, num(rest[1]), num(rest[2]), rest[0], rows, cols);
    case CLUE_TYPES.EXACTLY_K_ROLE_ABOVE_SOMEONE:
      return exactlyKRoleAboveSomeone?.(roleList, num(rest[1]), num(rest[2]), num(rest[3]), rest[0], rows, cols);
    case CLUE_TYPES.EXACTLY_K_ROLE_BELOW_SOMEONE:
      return exactlyKRoleBelowSomeone?.(roleList, num(rest[1]), num(rest[2]), num(rest[3]), rest[0], rows, cols);
    case CLUE_TYPES.EXACTLY_K_ROLE_LEFT_OF_SOMEONE:
      return exactlyKRoleLeftOfSomeone?.(roleList, num(rest[1]), num(rest[2]), num(rest[3]), rest[0], rows, cols);
    case CLUE_TYPES.EXACTLY_K_ROLE_RIGHT_OF_SOMEONE:
      return exactlyKRoleRightOfSomeone?.(roleList, num(rest[1]), num(rest[2]), num(rest[3]), rest[0], rows, cols);
    case CLUE_TYPES.EXACTLY_K_ROLE_BETWEEN_THE_TWO:
      return exactlyKRoleBetweenTheTwo?.(
        roleList,
        num(rest[1]),
        num(rest[2]),
        num(rest[3]),
        num(rest[4]),
        num(rest[5]),
        rest[0],
        rows,
        cols
      );
    case CLUE_TYPES.ALL_ROLE_IN_ROW_CONNECTED:
      return allRoleConnectedInRow?.(roleList, num(rest[1]), rest[0], cols);
    case CLUE_TYPES.ALL_ROLE_IN_COLUMN_CONNECTED:
      return allRoleConnectedInColumn?.(roleList, num(rest[1]), rest[0], rows, cols);
    case CLUE_TYPES.HAVE_EQUAL_ROLE_NEIGHBOR:
      return haveEqualRoleNeighbor?.(
        roleList,
        num(rest[1]),
        num(rest[2]),
        num(rest[3]),
        num(rest[4]),
        rest[0],
        rows,
        cols
      );
    case CLUE_TYPES.HAVE_MORE_ROLE_NEIGHBORS:
      return haveMoreRoleNeighbors?.(
        roleList,
        num(rest[1]),
        num(rest[2]),
        num(rest[3]),
        num(rest[4]),
        rest[0],
        rows,
        cols
      );
    case CLUE_TYPES.HAVE_LESS_ROLE_NEIGHBORS:
      return haveLessRoleNeighbors?.(
        roleList,
        num(rest[1]),
        num(rest[2]),
        num(rest[3]),
        num(rest[4]),
        rest[0],
        rows,
        cols
      );
    case CLUE_TYPES.BE_ONE_OF_SOMEONES_K_ROLE_NEIGHBORS:
      return beOneOfSomeonesKRoleNeighbors?.(
        roleList,
        num(rest[1]),
        num(rest[2]),
        num(rest[3]),
        num(rest[4]),
        num(rest[5]),
        rest[0],
        rows,
        cols
      );
    case CLUE_TYPES.HAS_EXACT_K_ROLE_NEIGHBOR:
      return hasExactKRoleNeighbor?.(roleList, num(rest[1]), num(rest[2]), num(rest[3]), rest[0], rows, cols);
    case CLUE_TYPES.K_OF_J_ROLE_TO_THE_LEFT_OF_SOMEONE_IS_ANOTHERS_NEIGHBOR:
      return kOfJRoleToTheLeftOfSomeoneIsAnothersNeighbor?.(
        roleList,
        num(rest[1]),
        num(rest[2]),
        num(rest[3]),
        num(rest[4]),
        num(rest[5]),
        num(rest[6]),
        rest[0],
        rows,
        cols
      );
    case CLUE_TYPES.K_OF_J_ROLE_TO_THE_RIGHT_OF_SOMEONE_IS_ANOTHERS_NEIGHBOR:
      return kOfJRoleToTheRightOfSomeoneIsAnothersNeighbor?.(
        roleList,
        num(rest[1]),
        num(rest[2]),
        num(rest[3]),
        num(rest[4]),
        num(rest[5]),
        num(rest[6]),
        rest[0],
        rows,
        cols
      );
    case CLUE_TYPES.K_OF_J_ROLE_ABOVE_SOMEONE_IS_ANOTHERS_NEIGHBOR:
      return kOfJRoleAboveSomeoneIsAnothersNeighbor?.(
        roleList,
        num(rest[1]),
        num(rest[2]),
        num(rest[3]),
        num(rest[4]),
        num(rest[5]),
        num(rest[6]),
        rest[0],
        rows,
        cols
      );
    case CLUE_TYPES.K_OF_J_ROLE_BELOW_SOMEONE_IS_ANOTHERS_NEIGHBOR:
      return kOfJRoleBelowSomeoneIsAnothersNeighbor?.(
        roleList,
        num(rest[1]),
        num(rest[2]),
        num(rest[3]),
        num(rest[4]),
        num(rest[5]),
        num(rest[6]),
        rest[0],
        rows,
        cols
      );
    case CLUE_TYPES.K_OF_J_ROLE_NEIGHBOR_TO_SOMEONE_IS_ANOTHERS_NEIGHBOR:
      return kOfJRoleNeighborToSomeoneIsAnothersNeighbor?.(
        roleList,
        num(rest[1]),
        num(rest[2]),
        num(rest[3]),
        num(rest[4]),
        num(rest[5]),
        num(rest[6]),
        rest[0],
        rows,
        cols
      );
    case CLUE_TYPES.K_OF_J_ROLE_BEFORE_ALPHABET_NAMES:
      return kOfJRoleBeforeAlphabetNames?.(
        roleList,
        alphabeticalOrder,
        num(rest[1]),
        num(rest[2]),
        num(rest[3]),
        num(rest[4]),
        rest[0],
        cols
      );
    case CLUE_TYPES.K_OF_J_ROLE_AFTER_ALPHABET_NAMES:
      return kOfJRoleAfterAlphabetNames?.(
        roleList,
        alphabeticalOrder,
        num(rest[1]),
        num(rest[2]),
        num(rest[3]),
        num(rest[4]),
        rest[0],
        cols
      );
    default:
      return null;
  }
}
