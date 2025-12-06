import logic from 'logicjs';
var or = logic.or,
	and = logic.and,
	not = logic.not,
	eq = logic.eq,
	run = logic.run,
	lvar = logic.lvar,
	between = logic.between

var g1_rule = `
   a      b
1 [alice]  [bob]
2 [charlie][dave]

alice: row 1 has one werewolf, but i'm not.
`

//creates two unique logic variables
var alice = lvar(),
    bob = lvar(),
    charlie = lvar(),
    dave = lvar()

// create a goal
var g1 = and(
  or(
    eq(alice, 'werewolf'),
    eq(bob, 'werewolf')
  ),
  eq(alice, 'villager')
)
console.log(run(g1, [alice, bob, charlie, dave]))

var g2_rule = `
   a      b
1 [alice]  [bob]
2 [charlie][dave]

alice: row 1 has one werewolf, but i'm not.
bob: i turned someone below alice into a werewolf.
`

//creates two unique logic variables
var g2 = and(
  or(
    eq(alice, 'werewolf'),
    eq(bob, 'werewolf')
  ),
  eq(alice, 'villager'),
  eq(bob, 'werewolf'),
  or(
    eq(charlie, 'werewolf'),
  )
)
console.log(run(g2, [alice, bob, charlie, dave]))

var g3_rule = `
   a      b
1 [alice]  [bob]
2 [charlie][dave]

alice: row 1 has one werewolf, but i'm not.
bob: i turned someone below alice into a werewolf.
charlie: dave has a good villager soul.
`
//creates two unique logic variables
var g3 = and(
  or(
    eq(alice, 'werewolf'),
    eq(bob, 'werewolf')
  ),
  eq(alice, 'villager'),
  eq(bob, 'werewolf'),
  or(
    eq(charlie, 'werewolf'),
  ),
  eq(charlie, 'werewolf'),
  eq(dave, 'villager')
)
console.log(run(g3, [alice, bob, charlie, dave]))
