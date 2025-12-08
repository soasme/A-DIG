import React, { useState, useEffect } from 'react';
import './WerewolfGame.css';

// Game data
const gameData = {
  "row": 5,
  "column": 3,
  "characters": [
    {
      "name": "Preston",
      "gender": "male",
      "row": 1,
      "column": 1,
      "characteristic": "warmhearted_compassion"
    },
    {
      "name": "Hannah",
      "gender": "female",
      "row": 1,
      "column": 2,
      "characteristic": "haunted_guilt"
    },
    {
      "name": "Jade",
      "gender": "female",
      "row": 1,
      "column": 3,
      "characteristic": "fierce_loyalty"
    },
    {
      "name": "Parker",
      "gender": "male",
      "row": 2,
      "column": 1,
      "characteristic": "noble_self_sacrifice"
    },
    {
      "name": "Finn",
      "gender": "male",
      "row": 2,
      "column": 2,
      "characteristic": "righteous_fury"
    },
    {
      "name": "Celia",
      "gender": "female",
      "row": 2,
      "column": 3,
      "characteristic": "ruthless_pragmatism"
    },
    {
      "name": "Wren",
      "gender": "female",
      "row": 3,
      "column": 1,
      "characteristic": "lonely_wanderer_spirit"
    },
    {
      "name": "Garrett",
      "gender": "male",
      "row": 3,
      "column": 2,
      "characteristic": "haunted_guilt"
    },
    {
      "name": "Liam",
      "gender": "male",
      "row": 3,
      "column": 3,
      "characteristic": "stoic_endurance"
    },
    {
      "name": "Porter",
      "gender": "male",
      "row": 4,
      "column": 1,
      "characteristic": "fierce_loyalty"
    },
    {
      "name": "Kyle",
      "gender": "male",
      "row": 4,
      "column": 2,
      "characteristic": "unpredictable_genius"
    },
    {
      "name": "Nora",
      "gender": "female",
      "row": 4,
      "column": 3,
      "characteristic": "ruthless_pragmatism"
    },
    {
      "name": "Whitney",
      "gender": "female",
      "row": 5,
      "column": 1,
      "characteristic": "ruthless_pragmatism"
    },
    {
      "name": "Ivy",
      "gender": "female",
      "row": 5,
      "column": 2,
      "characteristic": "haunted_guilt"
    },
    {
      "name": "Talia",
      "gender": "female",
      "row": 5,
      "column": 3,
      "characteristic": "ruthless_pragmatism"
    }
  ],
  "puzzle": [
    {
      "row": 5,
      "column": 1,
      "role": "villager",
      "statement": "exactly 0 of the 2 villagers below Preston are neighbors of Whitney"
    },
    {
      "row": 4,
      "column": 1,
      "role": "werewolf",
      "statement": "exactly 1 of the 1 werewolf above Parker are neighbors of Finn"
    },
    {
      "row": 1,
      "column": 1,
      "role": "werewolf",
      "statement": "exactly 0 of the 1 villager above Finn are neighbors of Wren"
    },
    {
      "row": 1,
      "column": 2,
      "role": "villager",
      "statement": "exactly 0 of the 1 werewolf above Garrett are neighbors of Kyle"
    },
    {
      "row": 2,
      "column": 2,
      "role": "werewolf",
      "statement": "exactly 0 of the 1 villager above Celia are neighbors of Porter"
    },
    {
      "row": 1,
      "column": 3,
      "role": "villager",
      "statement": "exactly 1 of the 1 villager below Nora are neighbors of Ivy"
    },
    {
      "row": 5,
      "column": 3,
      "role": "villager",
      "statement": "exactly 0 of the 2 villagers below Liam are neighbors of Whitney"
    },
    {
      "row": 4,
      "column": 3,
      "role": "villager",
      "statement": "Ivy has exactly 4 villagers as neighbors"
    },
    {
      "row": 4,
      "column": 2,
      "role": "villager",
      "statement": "exactly 0 of the 1 werewolf below Celia are neighbors of Whitney"
    },
    {
      "row": 3,
      "column": 3,
      "role": "werewolf",
      "statement": "Talia has exactly 1 werewolf as neighbors"
    },
    {
      "row": 5,
      "column": 2,
      "role": "werewolf",
      "statement": "exactly 1 of the 3 werewolves below Hannah are neighbors of Whitney"
    },
    {
      "row": 3,
      "column": 2,
      "role": "werewolf",
      "statement": "exactly 1 werewolf above Nora"
    },
    {
      "row": 2,
      "column": 3,
      "role": "villager",
      "statement": "exactly 2 werewolves between Parker and Whitney"
    },
    {
      "row": 2,
      "column": 1,
      "role": "villager",
      "statement": "exactly 1 of the 1 villager to the left of Finn are neighbors of Garrett"
    },
    {
      "row": 3,
      "column": 1,
      "role": "werewolf",
      "statement": "Wren is a werewolf."
    }
  ]
}

function CharacterCell({ character, revealed, onClick, showStatement }) {
  const puzzle = gameData.puzzle.find(p => p.row === character.row && p.column === character.column);
  const role = revealed ? puzzle?.role : null;
  const emoji = character.gender === 'female' ? '👩' : '👨';
  const positionStyle = {
    gridColumn: character.column,
    gridRow: character.row
  };
  
  return (
    <div className="cell-wrapper" style={positionStyle}>
      <div className={`character-cell ${revealed ? 'revealed' : 'unrevealed'} ${role || ''}`}>
        <button
          type="button"
          className="cell-hitbox"
          onClick={() => !revealed && onClick()}
          disabled={revealed}
        >
          <div className="emoji">{emoji}</div>
          <div className="name">{character.name}</div>
          {revealed && (
            <div className="role-badge">
              {role}
            </div>
          )}
        </button>
        {showStatement && puzzle && (
          <div className="statement">
            "{puzzle.statement}"
          </div>
        )}
      </div>
    </div>
  );
}

function Modal({ character, onSelect, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Identify: {character.name}</h3>
        <div className="modal-buttons">
          <button
            onClick={() => onSelect('villager')}
            className="btn-villager"
          >
            🟢 Villager
          </button>
          <button
            onClick={() => onSelect('werewolf')}
            className="btn-werewolf"
          >
            🔴 Werewolf
          </button>
          <button
            onClick={onClose}
            className="btn-cancel"
          >
            Cancel (ESC)
          </button>
        </div>
      </div>
    </div>
  );
}

function Rules() {
  return (
    <section className="rules-section">
      <h2 className="section-title">How to Play</h2>
      <div className="rules-content">
        <p>
          Your goal is to figure out who is a villager and who is a werewolf.
        </p>
        <p>
          Based on the known evidence, tap on a suspect to choose villager or werewolf. They might reveal new evidence.
        </p>
        <p className="warning">
          ⚠️ You cannot guess! Just like in real life, you can't convict someone based on a 50/50 hunch. There is always a logical next choice, even when you think there isn't!
        </p>
      </div>
    </section>
  );
}

function DetailedExplanation() {
  return (
    <section className="explanation-section">
      <h2 className="section-title">Rules Explained</h2>
      <div className="explanation-content">
        <ul>
          <li>
            Everyone is either a <strong className="villager-text">villager</strong> or a <strong className="werewolf-text">werewolf</strong>.
          </li>
          <li>
            Everyone speaks the truth, even the werewolf.
          </li>
          <li>
            <strong>Neighbors</strong> always include diagonal neighbors. One person can have up to 8 neighbors. Edge person has 5 neighbors and corner person has 3 neighbors.
          </li>
          <li>
            <strong>In between</strong> (or sometimes just "between") means the persons between the two, not including the two.
          </li>
          <li>
            <strong>Connected</strong> means a chain of orthogonal adjacency. For example "all werewolves in row 1 are connected" means there are no villagers between any two werewolves in that row.
          </li>
          <li>
            <strong>Rows</strong> go sideways and are numbered 1,2,3,4,5. <strong>Columns</strong> go up and down and are numbered 1,2,3,4,5.
          </li>
          <li>
            <strong>To the left/right</strong> always means somewhere in the same row. <strong>Above/below</strong> always means somewhere in the same column.
          </li>
          <li>
            <strong>Directly to the left/right/above/below</strong> always means the neighbor to the left/right/above/below.
          </li>
          <li>
            <strong>All</strong> always means there's at least one. It doesn't necessarily mean there's more than one.
          </li>
          <li>
            <strong>Any</strong> doesn't tell anything about the number of werewolves/villagers. "Any werewolf on row 2 is..." means "If there are any werewolves on row 2, they would be..."
          </li>
          <li>
            <strong>One of the ...</strong>, or <strong>one of several ...</strong>, or <strong>one of multiple ...</strong>, always means there's at least two villagers/werewolves.
          </li>
          <li>
            <strong>Common neighbors</strong> means those who are neighbors of both persons. It does not include the persons themselves.
          </li>
          <li>
            <strong>In total</strong> always means the sum of all in the group(s).
          </li>
          <li>
            <strong>Corner</strong> means the four corners.
          </li>
          <li>
            <strong>Edge</strong> means the 14 persons "surrounding" the board, including corners.
          </li>
          <li>
            <strong>... the most</strong> always means uniquely the most. If John has the most villager neighbors, no one can have as many werewolf neighbors as John.
          </li>
          <li>
            An <strong>even number</strong> means numbers divisible by two: 0, 2, 4, 6... and an <strong>odd number</strong> means everything else: 1, 3, 5, 7...
          </li>
          <li className="highlight">
            You never need to guess. In fact, the game only allows you to make one logical choice at a time.
          </li>
        </ul>
      </div>
    </section>
  );
}

export default function WerewolfGame() {
  const [revealed, setRevealed] = useState(new Set());
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Reveal the first puzzle element initially
    const firstPuzzle = gameData.puzzle[0];
    const firstChar = gameData.characters.find(
      c => c.row === firstPuzzle.row && c.column === firstPuzzle.column
    );
    if (firstChar) {
      setRevealed(new Set([`${firstChar.row}-${firstChar.column}`]));
    }
  }, []);

  const handleCharacterClick = (character) => {
    setSelectedCharacter(character);
  };

  const handleSelect = (selectedRole) => {
    if (!selectedCharacter) return;
    
    const puzzle = gameData.puzzle.find(
      p => p.row === selectedCharacter.row && p.column === selectedCharacter.column
    );
    
    if (!puzzle) {
      setMessage('❌ No puzzle data for this character!');
      setSelectedCharacter(null);
      return;
    }

    if (puzzle.role === selectedRole) {
      // Correct!
      const key = `${selectedCharacter.row}-${selectedCharacter.column}`;
      setRevealed(new Set([...revealed, key]));
      setMessage(`✅ Correct! ${selectedCharacter.name} is a ${selectedRole}!`);
      setTimeout(() => setMessage(''), 3000);
    } else {
      // Wrong!
      setMessage(`❌ Wrong! Try again - there's always a logical choice!`);
      setTimeout(() => setMessage(''), 3000);
    }
    
    setSelectedCharacter(null);
  };

  const handleClose = () => {
    setSelectedCharacter(null);
  };

  const boardStyle = {
    '--columns': gameData.column,
    '--rows': gameData.row
  };

  const boardCells = gameData.characters.map((character) => {
    const key = `${character.row}-${character.column}`;
    const isRevealed = revealed.has(key);
    const showStatement = isRevealed;

    return (
      <CharacterCell
        key={key}
        character={character}
        revealed={isRevealed}
        onClick={() => handleCharacterClick(character)}
        showStatement={showStatement}
      />
    );
  });

  return (
    <div className="werewolf-game">
      <div className="grain"></div>

      <section className="game-hero">
        <header className="game-header">
          <h1 className="game-title">Who is Werewolf?</h1>
          <p className="game-subtitle">A logic puzzle of deduction and deception</p>
        </header>

        <main className="game-main">
          {message && (
            <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
          
          <div className="game-board" style={boardStyle}>
            {boardCells}
          </div>

          <div className="progress">
            <p>Revealed: {revealed.size} / {gameData.characters.length}</p>
          </div>
        </main>
      </section>

      <Rules />
      <DetailedExplanation />

      {selectedCharacter && (
        <Modal
          character={selectedCharacter}
          onSelect={handleSelect}
          onClose={handleClose}
        />
      )}

      <footer className="game-footer">
        <p>Inspired by logic puzzles • Made with ❤️</p>
      </footer>
    </div>
  );
}
