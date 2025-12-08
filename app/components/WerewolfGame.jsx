import React, { useEffect, useMemo, useState } from 'react';
import './WerewolfGame.css';
import gameData from '../data/gameData';
import Confetti from './Confetti';

function CharacterCell({ character, revealed, onClick }) {
  const puzzle = gameData.puzzle.find(p => p.row === character.row && p.column === character.column);
  const role = revealed ? puzzle?.role : null;
  const positionStyle = {
    gridColumn: character.column,
    gridRow: character.row
  };
  const coordsLabel = `row ${character.row} column ${character.column}`;
  const statementText = puzzle?.statement;
  
  return (
    <div className="cell-wrapper" style={positionStyle}>
      <div className={`character-cell ${revealed ? 'revealed' : 'unrevealed'} ${role || ''}`}>
        <button
          type="button"
          className="cell-hitbox"
          onClick={() => !revealed && onClick()}
          disabled={revealed}
        >
          <div className="cell-header">
            <div className="cell-coordinates">{coordsLabel}</div>
            {revealed && role && (
              <div className={`role-badge ${role}`}>
                {role}
              </div>
            )}
          </div>
          <div className="cell-body">
            {revealed && statementText ? (
              <div className="statement compact">
                <span className="name-inline">{character.name}:</span> {statementText}
              </div>
            ) : (
              <div className="name unrevealed-name">{character.name}</div>
            )}
          </div>
        </button>
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
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close dialog"
        >
          x
        </button>
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

function formatDateWithOrdinal(date) {
  const day = date.getDate();
  const suffix = (day % 10 === 1 && day !== 11)
    ? 'st'
    : (day % 10 === 2 && day !== 12)
      ? 'nd'
      : (day % 10 === 3 && day !== 13)
        ? 'rd'
        : 'th';
  const month = date.toLocaleString('en-US', { month: 'short' });
  return `${month} ${day}${suffix} ${date.getFullYear()}`;
}

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function CelebrationDialog({ visible, shareText, gridText, legend, onShare, onClose, shareStatus }) {
  if (!visible) return null;

  return (
    <div className="celebration-overlay" role="dialog" aria-modal="true">
      <div className="celebration-card">
        <button
          type="button"
          className="modal-close celebration-close"
          onClick={onClose}
          aria-label="Close celebration dialog"
        >
          ×
        </button>
        <div className="celebration-header">
          <span className="celebration-confetti-emoji">🎉</span>
          <h3>Daily puzzle solved!</h3>
        </div>
        <pre className="share-text" aria-label="Share text preview">{shareText}</pre>
        <p className="legend">{legend}</p>
        <div className="celebration-actions">
          <button type="button" className="share-button" onClick={onShare}>
            Share to X
          </button>
          <button type="button" className="secondary-button" onClick={onClose}>
            Close
          </button>
        </div>
        {shareStatus && (
          <p className="share-status">{shareStatus}</p>
        )}
      </div>
    </div>
  );
}

export default function WerewolfGame() {
  const [revealed, setRevealed] = useState(new Set());
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [message, setMessage] = useState('');
  const [modalWarning, setModalWarning] = useState('');
  const [availableEvidence, setAvailableEvidence] = useState(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(new Set());
  const [completedAt, setCompletedAt] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [shareStatus, setShareStatus] = useState('');
  const [startTime] = useState(() => Date.now());

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
      setModalWarning('');
      setSelectedCharacter(null);
    } else {
      // Not enough evidence or incorrect guess
      setModalWarning('The evidence is insufficient! Read more clues to find out the right move.');
      setWrongGuesses(prev => {
        const next = new Set(prev);
        next.add(`${selectedCharacter.row}-${selectedCharacter.column}`);
        return next;
      });
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

    return (
      <CharacterCell
        key={key}
        character={character}
        revealed={isRevealed}
        onClick={() => handleCharacterClick(character)}
      />
    );
  });

  useEffect(() => {
    const allRevealed = revealed.size === gameData.characters.length;
    if (allRevealed && !completedAt) {
      const finishedAt = new Date();
      setCompletedAt(finishedAt);
      setShowCelebration(true);
      setConfettiActive(true);
      setShareStatus('');
    }
  }, [revealed, completedAt]);

  useEffect(() => {
    if (!confettiActive) return undefined;
    const timer = setTimeout(() => setConfettiActive(false), 4500);
    return () => clearTimeout(timer);
  }, [confettiActive]);

  const gridSummary = useMemo(() => {
    const lines = [];
    for (let row = 1; row <= gameData.row; row += 1) {
      let line = '';
      for (let column = 1; column <= gameData.column; column += 1) {
        const key = `${row}-${column}`;
        line += wrongGuesses.has(key) ? '🟧' : '🟩';
      }
      lines.push(line);
    }
    return lines.join('\n');
  }, [wrongGuesses]);

  const shareText = useMemo(() => {
    const finishedAt = completedAt || new Date();
    const dateLabel = formatDateWithOrdinal(finishedAt);
    const durationLabel = formatDuration((completedAt ? completedAt.getTime() : Date.now()) - startTime);
    return `I solved the daily Clues of Who, ${dateLabel}, in ${durationLabel}\n${gridSummary}\ncluesofwho.com`;
  }, [completedAt, gridSummary, startTime]);

  const legend = 'Green = one-pass deduct; Orange = had a wrong guess earlier.';

  const handleShareToX = () => {
    setShareStatus('');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareText)
        .then(() => setShareStatus('Copied to clipboard!'))
        .catch(() => setShareStatus('Could not copy automatically — please copy manually.'));
    }
    const tweetUrl = `https://x.com/intent/post?text=${encodeURIComponent(shareText)}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  };

  const closeCelebration = () => setShowCelebration(false);

  return (
    <div className="werewolf-game">
      <div className="grain"></div>
      <Confetti active={confettiActive} />

      <section className="game-hero">
        <header className="game-header">
          <h1 className="game-title">Clues of Who?</h1>
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

      <CelebrationDialog
        visible={showCelebration}
        shareText={shareText}
        gridText={gridSummary}
        legend={legend}
        onShare={handleShareToX}
        onClose={closeCelebration}
        shareStatus={shareStatus}
      />

      <footer className="game-footer">
        <p>Inspired by logic puzzles • Made with ❤️</p>
      </footer>
    </div>
  );
}
