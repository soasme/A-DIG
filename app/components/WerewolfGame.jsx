import React, { useState, useEffect } from 'react';
import './WerewolfGame.css';

// Game data
const gameData = {
  "row": 5,
  "column": 3,
  "characters": [
    {
      "name": "Hunter",
      "gender": "male",
      "row": 1,
      "column": 1,
      "characteristic": "lonely_wanderer_spirit"
    },
    {
      "name": "Faith",
      "gender": "female",
      "row": 1,
      "column": 2,
      "characteristic": "serene_detachment"
    },
    {
      "name": "Reid",
      "gender": "male",
      "row": 1,
      "column": 3,
      "characteristic": "reckless_bravery"
    },
    {
      "name": "Ava",
      "gender": "female",
      "row": 2,
      "column": 1,
      "characteristic": "cold_calculation"
    },
    {
      "name": "Raina",
      "gender": "female",
      "row": 2,
      "column": 2,
      "characteristic": "relentless_perfectionism"
    },
    {
      "name": "Colin",
      "gender": "male",
      "row": 2,
      "column": 3,
      "characteristic": "unstoppable_zeal"
    },
    {
      "name": "Chase",
      "gender": "male",
      "row": 3,
      "column": 1,
      "characteristic": "deceptive_charm"
    },
    {
      "name": "Dean",
      "gender": "male",
      "row": 3,
      "column": 2,
      "characteristic": "brooding_silence"
    },
    {
      "name": "Celia",
      "gender": "female",
      "row": 3,
      "column": 3,
      "characteristic": "serene_detachment"
    },
    {
      "name": "Yusuf",
      "gender": "male",
      "row": 4,
      "column": 1,
      "characteristic": "hopeful_idealism"
    },
    {
      "name": "Bianca",
      "gender": "female",
      "row": 4,
      "column": 2,
      "characteristic": "righteous_fury"
    },
    {
      "name": "Lucy",
      "gender": "female",
      "row": 4,
      "column": 3,
      "characteristic": "gentle_naivety"
    },
    {
      "name": "Zeke",
      "gender": "male",
      "row": 5,
      "column": 1,
      "characteristic": "righteous_fury"
    },
    {
      "name": "Poppy",
      "gender": "female",
      "row": 5,
      "column": 2,
      "characteristic": "righteous_fury"
    },
    {
      "name": "Willow",
      "gender": "female",
      "row": 5,
      "column": 3,
      "characteristic": "relentless_perfectionism"
    }
  ],
  "puzzle": [
    {
      "row": 2,
      "column": 1,
      "role": "werewolf",
      "statement": "Hunter has more werewolf neighbors than Reid",
      "deductableCells": [
        {
          "row": 2,
          "column": 3,
          "role": "villager"
        }
      ]
    },
    {
      "row": 2,
      "column": 3,
      "role": "villager",
      "statement": "exactly 0 of the 1 werewolf below Yusuf are neighbors of Lucy",
      "deductableCells": [
        {
          "row": 5,
          "column": 1,
          "role": "werewolf"
        }
      ]
    },
    {
      "row": 5,
      "column": 1,
      "role": "werewolf",
      "statement": "exactly 2 of the 2 villagers to the right of Ava are neighbors of Celia",
      "deductableCells": [
        {
          "row": 2,
          "column": 2,
          "role": "villager"
        }
      ]
    },
    {
      "row": 2,
      "column": 2,
      "role": "villager",
      "statement": "exactly 1 of the 1 werewolf to the right of Faith are neighbors of Raina",
      "deductableCells": [
        {
          "row": 1,
          "column": 3,
          "role": "werewolf"
        }
      ]
    },
    {
      "row": 1,
      "column": 3,
      "role": "werewolf",
      "statement": "Ava and Raina have the same number of villager neighbors",
      "deductableCells": [
        {
          "row": 3,
          "column": 3,
          "role": "werewolf"
        }
      ]
    },
    {
      "row": 3,
      "column": 3,
      "role": "werewolf",
      "statement": "Dean is one of the 7 werewolf neighbors of Bianca",
      "deductableCells": [
        {
          "row": 3,
          "column": 2,
          "role": "werewolf"
        }
      ]
    },
    {
      "row": 3,
      "column": 2,
      "role": "werewolf",
      "statement": "exactly 0 of the 1 villager to the right of Hunter are neighbors of Chase",
      "deductableCells": [
        {
          "row": 1,
          "column": 2,
          "role": "villager"
        }
      ]
    },
    {
      "row": 1,
      "column": 2,
      "role": "villager",
      "statement": "exactly 0 villagers left of Willow",
      "deductableCells": [
        {
          "row": 5,
          "column": 2,
          "role": "werewolf"
        }
      ]
    },
    {
      "row": 5,
      "column": 2,
      "role": "werewolf",
      "statement": "exactly 1 of the 1 villager below Faith are neighbors of Reid",
      "deductableCells": [
        {
          "row": 4,
          "column": 2,
          "role": "werewolf"
        }
      ]
    },
    {
      "row": 4,
      "column": 2,
      "role": "werewolf",
      "statement": "Raina and Celia have the same number of villager neighbors",
      "deductableCells": [
        {
          "row": 3,
          "column": 1,
          "role": "werewolf"
        }
      ]
    },
    {
      "row": 3,
      "column": 1,
      "role": "werewolf",
      "statement": "all werewolves in column 1 are connected",
      "deductableCells": [
        {
          "row": 4,
          "column": 1,
          "role": "werewolf"
        }
      ]
    },
    {
      "row": 4,
      "column": 1,
      "role": "werewolf",
      "statement": "Hunter is a villager.",
      "deductableCells": [
        {
          "row": 1,
          "column": 1,
          "role": "villager"
        },
        {
          "row": 4,
          "column": 3,
          "role": "villager"
        },
        {
          "row": 5,
          "column": 3,
          "role": "werewolf"
        }
      ]
    },
    {
      "row": 1,
      "column": 1,
      "role": "villager",
      "statement": "Ava is one of the 4 werewolf neighbors of Chase",
      "deductableCells": []
    },
    {
      "row": 4,
      "column": 3,
      "role": "villager",
      "statement": "Lucy is a villager.",
      "deductableCells": []
    },
    {
      "row": 5,
      "column": 3,
      "role": "werewolf",
      "statement": "Willow is a werewolf.",
      "deductableCells": []
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

function Modal({ character, onSelect, onClose, warning }) {
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
        {warning && (
          <p className="modal-warning">{warning}</p>
        )}
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

function evidenceKey(row, column, role) {
  return `${row}-${column}-${role}`;
}

function collectEvidence(puzzleEntry) {
  if (!puzzleEntry || !Array.isArray(puzzleEntry.deductableCells)) return [];
  return puzzleEntry.deductableCells.map(cell => evidenceKey(cell.row, cell.column, cell.role));
}

export default function WerewolfGame() {
  const [revealed, setRevealed] = useState(new Set());
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [message, setMessage] = useState('');
  const [modalWarning, setModalWarning] = useState('');
  const [availableEvidence, setAvailableEvidence] = useState(new Set());

  useEffect(() => {
    // Reveal the first puzzle element initially
    const firstPuzzle = gameData.puzzle[0];
    const firstChar = gameData.characters.find(
      c => c.row === firstPuzzle.row && c.column === firstPuzzle.column
    );
    if (firstChar) {
      setRevealed(new Set([`${firstChar.row}-${firstChar.column}`]));
      setAvailableEvidence(new Set(collectEvidence(firstPuzzle)));
    }
  }, []);

  const handleCharacterClick = (character) => {
    setSelectedCharacter(character);
    setModalWarning('');
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

    const hasEvidence = availableEvidence.has(
      evidenceKey(selectedCharacter.row, selectedCharacter.column, selectedRole)
    );

    if (puzzle.role === selectedRole && hasEvidence) {
      // Correct!
      const key = `${selectedCharacter.row}-${selectedCharacter.column}`;
      setRevealed(new Set([...revealed, key]));
      const newEvidence = new Set(availableEvidence);
      collectEvidence(puzzle).forEach(ev => newEvidence.add(ev));
      setAvailableEvidence(newEvidence);
      setMessage(`✅ Correct! ${selectedCharacter.name} is a ${selectedRole}!`);
      setTimeout(() => setMessage(''), 3000);
      setModalWarning('');
      setSelectedCharacter(null);
    } else {
      // Not enough evidence or incorrect guess
      setModalWarning('The evidence is insufficient! Read more clues to find out the right move.');
    }
  };

  const handleClose = () => {
    setSelectedCharacter(null);
    setModalWarning('');
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
          warning={modalWarning}
        />
      )}

      <footer className="game-footer">
        <p>Inspired by logic puzzles • Made with ❤️</p>
      </footer>
    </div>
  );
}
