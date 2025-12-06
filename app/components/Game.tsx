"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  type Alignment,
  type Character,
  type GameState,
  generatePuzzle,
  validateStatement,
  checkWinCondition,
  findDeterministicDeductions
} from "./Engine";

export default function Game() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Initialize puzzle on mount
  useEffect(() => {
    setGameState(generatePuzzle());
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedCharacter(null);
        setErrorMessage("");
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const handleTileClick = useCallback((character: Character) => {
    if (!gameState) return;
    setSelectedCharacter(character);
    setErrorMessage("");
  }, [gameState]);

  const handleMarkCharacter = useCallback((alignment: Alignment) => {
    if (!gameState || !selectedCharacter) return;

    const newMarks = new Map(gameState.playerMarks);
    newMarks.set(selectedCharacter.id, alignment);

    // Get all revealed characters (including the initial revealed one)
    const revealedCharIds = new Set([
      ...Array.from(newMarks.keys()),
      gameState.initialRevealed
    ]);
    const revealedChars = Array.from(revealedCharIds)
      .map(id => gameState.characters.find(c => c.id === id))
      .filter((c): c is Character => c !== null);

    // Check if this marking creates a contradiction
    for (const revealedChar of revealedChars) {
      const validation = validateStatement(revealedChar, gameState.characters, newMarks);
      if (!validation.valid) {
        setErrorMessage(validation.error || "This creates a contradiction!");
        return;
      }
    }

    // Check if there's enough evidence to make this deduction
    // Use the engine to find deterministic deductions
    const deductions = findDeterministicDeductions(
      gameState.characters,
      gameState.playerMarks,
      revealedCharIds
    );

    // Check if this character can be deterministically deduced
    const canDeduce = deductions.has(selectedCharacter.id);
    const expectedAlignment = deductions.get(selectedCharacter.id);

    if (!canDeduce && !gameState.playerMarks.has(selectedCharacter.id)) {
      setErrorMessage("Not enough evidence to make this deduction yet. Reveal more characters first!");
      return;
    }

    if (canDeduce && expectedAlignment !== alignment) {
      setErrorMessage(`The clues indicate ${selectedCharacter.name} must be a ${expectedAlignment}, not a ${alignment}!`);
      return;
    }

    // Update marks
    const newGameState = {
      ...gameState,
      playerMarks: newMarks,
    };

    // Check win condition
    const won = checkWinCondition(gameState.characters, newMarks);
    if (won) {
      newGameState.gameWon = true;
    }

    setGameState(newGameState);
    setSelectedCharacter(null);
    setErrorMessage("");
  }, [gameState, selectedCharacter]);

  const handleNewGame = useCallback(() => {
    setGameState(generatePuzzle());
    setSelectedCharacter(null);
    setErrorMessage("");
  }, []);

  if (!gameState) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        color: "#fff"
      }}>
        Loading...
      </div>
    );
  }

  const grid = Array.from({ length: 5 }, (_, row) =>
    Array.from({ length: 4 }, (_, col) =>
      gameState.characters.find(c => c.row === row && c.col === col)!
    )
  );

  return (
    <div style={{ marginBottom: "40px", padding: "0 4px", maxWidth: "100%", boxSizing: "border-box", overflow: "hidden" }}>
      <style>{`
        body {
          overflow-x: hidden;
        }
        @media (max-width: 768px) {
          .game-title { font-size: 1.75rem !important; }
          .game-subtitle { font-size: 0.875rem !important; }
          .game-grid-container { padding: 8px !important; }
          .character-tile { padding: 6px !important; border-width: 1px !important; }
          .character-emoji { font-size: 1.1rem !important; }
          .character-name { font-size: 0.7rem !important; }
          .character-id { font-size: 0.55rem !important; }
          .character-statement { font-size: 0.6rem !important; padding: 4px !important; margin-top: 4px !important; }
          .badge { font-size: 0.55rem !important; padding: 2px 4px !important; }
          .modal-content { padding: 16px !important; margin: 0 8px !important; }
          .modal-title { font-size: 1.5rem !important; }
          .modal-emoji { font-size: 2.5rem !important; }
          .modal-button { padding: 8px !important; font-size: 0.875rem !important; }
          .grid-gap { gap: 8px !important; }
        }
        @media (max-width: 480px) {
          .game-title { font-size: 1.25rem !important; }
          .game-subtitle { font-size: 0.7rem !important; }
          .game-grid-container { padding: 4px !important; border-radius: 8px !important; }
          .character-tile { padding: 4px !important; border-radius: 6px !important; border-width: 1px !important; }
          .character-emoji { font-size: 0.9rem !important; }
          .character-name { font-size: 0.55rem !important; }
          .character-id { font-size: 0.45rem !important; }
          .character-statement { font-size: 0.5rem !important; padding: 3px !important; line-height: 1.1 !important; margin-top: 3px !important; }
          .badge { font-size: 0.45rem !important; padding: 1px 3px !important; }
          .grid-gap { gap: 4px !important; }
          .character-info { gap: 4px !important; margin-bottom: 4px !important; }
        }
        .character-statement {
          word-wrap: break-word;
          overflow-wrap: break-word;
          hyphens: auto;
        }
      `}</style>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "16px", padding: "0 8px" }}>
        <h1 className="game-title" style={{
          fontSize: "3rem",
          fontWeight: "bold",
          color: "#fff",
          marginBottom: "8px"
        }}>
          Who Are Werewolves?
        </h1>
        <p className="game-subtitle" style={{ color: "#c4b5fd", fontSize: "1.125rem", marginBottom: "16px" }}>
          Deduce which villagers are werewolves using logical clues
        </p>
        <button
          onClick={handleNewGame}
          style={{
            padding: "8px 24px",
            background: "#7c3aed",
            color: "#fff",
            borderRadius: "8px",
            border: "none",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "1rem"
          }}
          onMouseOver={(e) => e.currentTarget.style.background = "#6d28d9"}
          onMouseOut={(e) => e.currentTarget.style.background = "#7c3aed"}
        >
          New Game
        </button>
      </div>

      {/* Game Grid */}
      <div className="game-grid-container" style={{
        background: "rgba(30, 41, 59, 0.5)",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        padding: "32px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        maxWidth: "1200px",
        width: "100%",
        margin: "0 auto",
        boxSizing: "border-box",
        overflowX: "hidden"
      }}>
        <div className="grid-gap" style={{ display: "grid", gap: "12px" }}>
          {grid.map((row, rowIndex) => (
            <div className="grid-gap" key={rowIndex} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
              {row.map((character) => {
                const isRevealed = gameState.playerMarks.has(character.id) ||
                                 character.id === gameState.initialRevealed;
                const playerMark = gameState.playerMarks.get(character.id);
                const isInitial = character.id === gameState.initialRevealed;
                const isWerewolf = playerMark === "werewolf" || (isInitial && character.alignment === "werewolf");

                return (
                  <button
                    key={character.id}
                    className="character-tile"
                    onClick={() => handleTileClick(character)}
                    style={{
                      padding: "16px",
                      borderRadius: "12px",
                      background: isRevealed
                        ? (isWerewolf ? "rgba(127, 29, 29, 0.8)" : "rgba(20, 83, 45, 0.8)")
                        : "rgba(51, 65, 85, 0.5)",
                      border: isRevealed
                        ? (isWerewolf ? "2px solid #ef4444" : "2px solid #22c55e")
                        : "2px solid #475569",
                      textAlign: "left",
                      position: "relative",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      color: "#fff"
                    }}
                    onMouseOver={(e) => {
                      if (!isRevealed) {
                        e.currentTarget.style.borderColor = "#a78bfa";
                        e.currentTarget.style.transform = "scale(1.02)";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isRevealed) {
                        e.currentTarget.style.borderColor = "#475569";
                        e.currentTarget.style.transform = "scale(1)";
                      }
                    }}
                  >
                    <div className="character-info" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <span className="character-emoji" style={{ fontSize: "2rem" }}>{character.emoji}</span>
                      <div>
                        <div className="character-name" style={{ fontWeight: 600, fontSize: "1rem" }}>{character.name}</div>
                        <div className="character-id" style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{character.id}</div>
                      </div>
                    </div>

                    {isRevealed && (
                      <div className="character-statement" style={{
                        marginTop: "8px",
                        fontSize: "0.875rem",
                        color: "#e2e8f0",
                        background: "rgba(0, 0, 0, 0.3)",
                        borderRadius: "6px",
                        padding: "8px"
                      }}>
                        {character.statement}
                      </div>
                    )}

                    {isInitial && (
                      <div className="badge" style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        background: "#eab308",
                        color: "#713f12",
                        fontSize: "0.75rem",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontWeight: "bold"
                      }}>
                        START
                      </div>
                    )}

                    {playerMark && !isInitial && (
                      <div className="badge" style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        background: playerMark === "werewolf" ? "#ef4444" : "#22c55e",
                        color: "#fff",
                        fontSize: "0.75rem",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontWeight: "bold"
                      }}>
                        {playerMark === "werewolf" ? "🐺" : "👤"}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div style={{ marginTop: "16px", textAlign: "center", color: "#c4b5fd", fontSize: "0.875rem", padding: "0 8px" }}>
        <p>Revealed: {gameState.playerMarks.size} / {gameState.characters.length}</p>
      </div>

      {/* Modal for character selection */}
      {selectedCharacter && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50
          }}
          onClick={() => {
            setSelectedCharacter(null);
            setErrorMessage("");
          }}
        >
          <div
            className="modal-content"
            style={{
              background: "#1e293b",
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "28rem",
              width: "100%",
              margin: "0 16px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "2px solid #7c3aed"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div className="modal-emoji" style={{ fontSize: "4rem", marginBottom: "16px" }}>{selectedCharacter.emoji}</div>
              <h2 className="modal-title" style={{ fontSize: "2rem", fontWeight: "bold", color: "#fff", marginBottom: "8px" }}>
                {selectedCharacter.name}
              </h2>
              <p style={{ color: "#94a3b8" }}>Position: {selectedCharacter.id}</p>
            </div>

            {gameState.playerMarks.has(selectedCharacter.id) && (
              <div style={{
                marginBottom: "16px",
                padding: "12px",
                background: "#334155",
                borderRadius: "8px"
              }}>
                <p style={{ fontSize: "0.875rem", color: "#cbd5e1" }}>Current statement:</p>
                <p style={{ color: "#fff", marginTop: "4px", fontSize: "0.875rem" }}>{selectedCharacter.statement}</p>
              </div>
            )}

            {errorMessage && (
              <div style={{
                marginBottom: "16px",
                padding: "12px",
                background: "rgba(127, 29, 29, 0.5)",
                border: "1px solid #ef4444",
                borderRadius: "8px"
              }}>
                <p style={{ color: "#fca5a5", fontSize: "0.875rem" }}>{errorMessage}</p>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                className="modal-button"
                onClick={() => handleMarkCharacter("villager")}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#16a34a",
                  color: "#fff",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "1rem"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "#15803d"}
                onMouseOut={(e) => e.currentTarget.style.background = "#16a34a"}
              >
                👤 Mark as Villager
              </button>

              <button
                className="modal-button"
                onClick={() => handleMarkCharacter("werewolf")}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#dc2626",
                  color: "#fff",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "1rem"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "#b91c1c"}
                onMouseOut={(e) => e.currentTarget.style.background = "#dc2626"}
              >
                🐺 Mark as Werewolf
              </button>

              <button
                className="modal-button"
                onClick={() => {
                  setSelectedCharacter(null);
                  setErrorMessage("");
                }}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#475569",
                  color: "#fff",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "1rem"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "#334155"}
                onMouseOut={(e) => e.currentTarget.style.background = "#475569"}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Win Modal */}
      {gameState.gameWon && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50
          }}
          onClick={() => {
            const newGameState = { ...gameState, gameWon: false };
            setGameState(newGameState);
          }}
        >
          <div
            className="modal-content"
            style={{
              background: "linear-gradient(135deg, #eab308 0%, #f97316 100%)",
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "28rem",
              width: "100%",
              margin: "0 16px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              textAlign: "center"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-emoji" style={{ fontSize: "5rem", marginBottom: "16px" }}>🎉</div>
            <h2 className="modal-title" style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#fff", marginBottom: "16px" }}>
              Puzzle Solved!
            </h2>
            <p style={{ color: "rgba(255, 255, 255, 0.9)", marginBottom: "24px", fontSize: "1.125rem" }}>
              You successfully identified all the werewolves!
            </p>
            <button
              className="modal-button"
              onClick={() => {
                const newGameState = { ...gameState, gameWon: false };
                setGameState(newGameState);
              }}
              style={{
                padding: "12px 32px",
                background: "#fff",
                color: "#f97316",
                borderRadius: "8px",
                border: "none",
                fontWeight: "bold",
                fontSize: "1.125rem",
                cursor: "pointer"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "#f1f5f9"}
              onMouseOut={(e) => e.currentTarget.style.background = "#fff"}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
