// Character generation utilities shared by puzzle generators.
// Keeps name pools and row/column assignment logic in one place.

const MALE_NAMES = [
  'Aiden','Brandon','Caleb','Derek','Ethan','Felix','Gavin','Henry','Isaac','Julian',
  'Kyle','Liam','Mason','Noah','Owen','Peter','Quinn','Ryan','Samuel','Tyler',
  'Victor','Wyatt','Xavier','Zachary','Adam','Blake','Colin','Damian','Elliot',
  'Finn','Grayson','Hunter','Ian','Jack','Kaden','Logan','Miles','Nathan','Oliver',
  'Preston','Reid','Sawyer','Tristan','Vincent','Wesley','Zane','Adrian','Bryce',
  'Carter','Dominic','Emmett','Gabriel','Hayden','Jasper','Keegan','Landon','Micah',
  'Nicholas','Parker','Riley','Spencer','Trevor','Vance','Warren','Zion','Austin',
  'Brady','Chase','Dylan','Evan','Garrett','Holden','Jacob','Kevin','Leon','Marcus',
  'Neil','Porter','Roman','Silas','Tanner','Uriel','Walker','Xander','Yusuf','Zeke',
  'Arthur','Bennett','Clark','Dean','Elias','Franklin','Graham','Harvey','Joel','Kirk',
  'Lawson','Mitchell','Nolan','Oscar','Phillip','Russell'
];

const FEMALE_NAMES = [
  'Ava','Bella','Chloe','Diana','Emma','Faith','Grace','Hannah','Isla','Jade',
  'Kara','Lily','Mia','Nora','Olivia','Paige','Quinn','Ruby','Sophia','Tessa',
  'Violet','Willow','Xena','Zoe','Amelia','Brooke','Clara','Delia','Elise',
  'Fiona','Gemma','Hailey','Ivy','Julia','Kayla','Leah','Maya','Naomi','Opal',
  'Piper','Reese','Sienna','Trinity','Vanessa','Wren','Yara','Zara','Alice','Bria',
  'Celia','Daphne','Eden','Freya','Gia','Harper','Irene','Jenna','Keira','Lena',
  'Molly','Nadia','Odette','Poppy','Riley','Sage','Talia','Vera','Wendy','Zelda',
  'April','Bianca','Camila','Danica','Esme','Flora','Greta','Hazel','Ingrid','Joy',
  'Kelsey','Lucy','Morgan','Nova','Ophelia','Penelope','Raina','Serena','Tatum','Uma',
  'Valerie','Whitney','Xiomara','Yvette','Zuri','Anya','Beatrice','Celeste','Dahlia'
];

const CHARACTERISTICS = [
  'fierce_loyalty',
  'chaotic_impulsiveness',
  'cold_calculation',
  'tragic_melancholy',
  'unyielding_ambition',
  'playful_mischief',
  'righteous_fury',
  'scheming_cunning',
  'hopeful_idealism',
  'stoic_endurance',
  'brooding_silence',
  'reckless_bravery',
  'vengeful_obsession',
  'noble_self_sacrifice',
  'shadowed_past',
  'gentle_naivety',
  'unyielding_principle',
  'forbidden_curiosity',
  'haunted_guilt',
  'mercurial_mood',
  'iron_willpower',
  'deceptive_charm',
  'unstoppable_zeal',
  'lonely_wanderer_spirit',
  'relentless_perfectionism',
  'unpredictable_genius',
  'ruthless_pragmatism',
  'warmhearted_compassion',
  'defiant_rebellion',
  'serene_detachment',
];

function randInt(max) {
  return Math.floor(Math.random() * max);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateCharacters(rows, cols, { characteristics = CHARACTERISTICS } = {}) {
  const total = rows * cols;
  const maleCount = Math.floor(total / 2);
  const femaleCount = total - maleCount;

  const malePool = shuffle(MALE_NAMES.slice());
  const femalePool = shuffle(FEMALE_NAMES.slice());

  const names = [];
  for (let i = 0; i < maleCount; i++) names.push({ name: malePool[i], gender: 'male' });
  for (let i = 0; i < femaleCount; i++) names.push({ name: femalePool[i], gender: 'female' });
  names.sort((a, b) => a.name.localeCompare(b.name));

  const characters = [];
  let idx = 0;
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      const { name, gender } = names[idx++];
      const characteristic = characteristics[randInt(characteristics.length)];
      characters.push({ name, gender, row: r, column: c, characteristic });
    }
  }

  return characters;
}

export { MALE_NAMES, FEMALE_NAMES, CHARACTERISTICS };
