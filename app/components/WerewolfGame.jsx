"use client";

import React, { useEffect, useMemo, useState } from 'react';
import './WerewolfGame.css';
import Confetti from './Confetti';

function CharacterCell({ character, puzzleEntries, revealed, onClick }) {
  const puzzle = puzzleEntries.find(p => p.row === character.row && p.column === character.column);
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

function Modal({ character, onSelect, onClose, warning, goodRole, badRole }) {
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
            onClick={() => onSelect(goodRole)}
            className="btn-villager"
          >
            🟢 {goodRole}
          </button>
          <button
            onClick={() => onSelect(badRole)}
            className="btn-werewolf"
          >
            🔴 {badRole}
          </button>
        </div>
        {warning && (
          <p className="modal-warning">{warning}</p>
        )}
      </div>
    </div>
  );
}

function Rules({ goodRole, badRole, gameSetting }) {
  return (
    <section className="rules-section">
      <h2 className="section-title">How to Play</h2>
      <div className="rules-content">
        {gameSetting && (
          <p className="game-setting">{gameSetting}</p>
        )}
        <p>
          Your goal is to figure out who is a {goodRole} and who is a {badRole}.
        </p>
        <p>
          Based on the known evidence, tap on a suspect to choose {goodRole} or {badRole}. They must be either a {goodRole} or a {badRole}. They might reveal new evidence.
        </p>
        <p>
          Everyone tells the truth, even those on the {badRole} side.
        </p>
        <p className="warning">
          ⚠️ You never need to guess! There is always a logical next choice, even when you think there isn't! Read the clues carefully.
        </p>
        <p>
          Think of each grid location as a statement about its row and column. A reveal might prove one character&apos;s role and rule out another, so try to chain these facts together rather than treating each box in isolation.
        </p>
        <p>
          Quick tactics for new players:
        </p>
        <ul>
          <li>Start with cells that already have evidence attached to them — they often unlock an entire line of deductions.</li>
          <li>If a row or column is almost filled in, finish it to remove ambiguity elsewhere on the board.</li>
          <li>When stuck, reread the latest unlocked statements; the correct move usually hides in the freshest clue.</li>
        </ul>
        <p>
          You can always step away mid-puzzle and return later; the board state and your reveal streak remain saved in the browser. Take your time and enjoy the mystery.
        </p>
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

export default function WerewolfGame({ id, gameData }) {
  const GOOD_ROLE = gameData.roles?.[0] ?? 'villager';
  const BAD_ROLE = gameData.roles?.[1] ?? 'werewolf';
  const GAME_SETTING = gameData.gameSetting;

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
  const [startTime, setStartTime] = useState(() => Date.now());
  const totalCharacters = gameData.characters.length;
  const revealedCount = revealed.size;
  const progressRatio = totalCharacters ? revealedCount / totalCharacters : 0;
  const revealComplete = revealedCount === totalCharacters;
  const progressWidth = Math.min(100, Math.max(0, progressRatio * 100));

  useEffect(() => {
    const firstPuzzle = gameData.puzzle?.[0];
    const firstChar = firstPuzzle
      ? gameData.characters.find(
          c => c.row === firstPuzzle.row && c.column === firstPuzzle.column
        )
      : null;

    setRevealed(firstChar ? new Set([`${firstChar.row}-${firstChar.column}`]) : new Set());
    setAvailableEvidence(new Set(firstPuzzle ? collectEvidence(firstPuzzle) : []));
    setSelectedCharacter(null);
    setModalWarning('');
    setMessage('');
    setWrongGuesses(new Set());
    setCompletedAt(null);
    setShowCelebration(false);
    setConfettiActive(false);
    setShareStatus('');
    setStartTime(Date.now());
  }, [gameData]);

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
      setRevealed(prev => new Set([...prev, key]));
      setAvailableEvidence(prev => {
        const next = new Set(prev);
        collectEvidence(puzzle).forEach(ev => next.add(ev));
        return next;
      });
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
        puzzleEntries={gameData.puzzle}
        revealed={isRevealed}
        onClick={() => handleCharacterClick(character)}
      />
    );
  });

  useEffect(() => {
    const allRevealed = revealed.size === totalCharacters;
    if (allRevealed && !completedAt) {
      const finishedAt = new Date();
      setCompletedAt(finishedAt);
      setShowCelebration(true);
      setConfettiActive(true);
      setShareStatus('');
    }
  }, [revealed, completedAt, totalCharacters]);

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
  }, [wrongGuesses, gameData.column, gameData.row]);

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
          <h1 className="game-title">Clues of Who? - #{id}</h1>
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
            <div className="progress-header">
              <div className="progress-label">
                <span className="progress-eyebrow">Revealed</span>
                <span className="progress-count">{revealedCount} / {totalCharacters}</span>
              </div>
            </div>
            <div
              className="progress-bar"
              role="progressbar"
              aria-valuenow={revealedCount}
              aria-valuemin={0}
              aria-valuemax={totalCharacters}
            >
              <div className="progress-track">
                <div
                  className={`progress-fill ${revealComplete ? 'complete' : ''}`}
                  style={{ width: `${progressWidth}%` }}
                />
              </div>
            </div>
            <p className="progress-caption">Unveil each row and column to crack the case.</p>
          </div>
        </main>
      </section>

      <Rules goodRole={GOOD_ROLE} badRole={BAD_ROLE} gameSetting={GAME_SETTING} />

      {selectedCharacter && (
        <Modal
          character={selectedCharacter}
          onSelect={handleSelect}
          onClose={handleClose}
          warning={modalWarning}
          goodRole={GOOD_ROLE}
          badRole={BAD_ROLE}
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
        <p>Made with ❤️ &nbsp; by INKYLABS LIMITED</p>
      </footer>
    </div>
  );
}
