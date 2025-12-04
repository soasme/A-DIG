"use client"

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Rules from './components/Rules';
import DetailedExplanation from './components/DetailedExplanation';

// ============================================
// SPIRITUAL ROOTS SYSTEM
// ============================================
const ELEMENTS = {
  metal: { cn: '金', en: 'Metal' },
  wood: { cn: '木', en: 'Wood' },
  water: { cn: '水', en: 'Water' },
  fire: { cn: '火', en: 'Fire' },
  earth: { cn: '土', en: 'Earth' }
};

const ROOT_TYPES = {
  1: { cn: '单灵根', en: 'Single Root' },
  2: { cn: '双灵根', en: 'Dual Root' },
  3: { cn: '三灵根', en: 'Triple Root' },
  4: { cn: '四灵根', en: 'Quad Root' },
  5: { cn: '五灵根', en: 'Penta Root' }
};

const ELEMENT_KEYS = ['metal', 'wood', 'water', 'fire', 'earth'];

const ALL_SPIRITUAL_ROOTS = [];
for (let count = 1; count <= 5; count++) {
  const combinations = getCombinations(ELEMENT_KEYS, count);
  combinations.forEach(combo => {
    ALL_SPIRITUAL_ROOTS.push({
      elements: combo,
      type: ROOT_TYPES[count],
      label: combo.map(e => ELEMENTS[e].en).join('-') + ' ' + ROOT_TYPES[count].en,
      shortLabel: combo.map(e => ELEMENTS[e].cn).join('') + ' ' + ROOT_TYPES[count].cn
    });
  });
}

function getCombinations(arr, k) {
  if (k === 0) return [[]];
  if (arr.length === 0) return [];
  const [first, ...rest] = arr;
  const withFirst = getCombinations(rest, k - 1).map(combo => [first, ...combo]);
  const withoutFirst = getCombinations(rest, k);
  return [...withFirst, ...withoutFirst];
}

// ============================================
// PINYIN NAME GENERATOR
// ============================================
const SURNAMES = [
  'Bai', 'Cao', 'Chen', 'Deng', 'Fang', 'Feng', 'Gao', 'Gu', 'Guo', 'Han',
  'He', 'Hu', 'Huang', 'Jiang', 'Jin', 'Li', 'Liang', 'Lin', 'Liu', 'Lu',
  'Luo', 'Ma', 'Meng', 'Mo', 'Mu', 'Nie', 'Pan', 'Pei', 'Qin', 'Qiu',
  'Ren', 'Shen', 'Shi', 'Song', 'Su', 'Sun', 'Tan', 'Tang', 'Tian', 'Wang',
  'Wei', 'Wu', 'Xia', 'Xiao', 'Xie', 'Xu', 'Yan', 'Yang', 'Ye', 'Yin',
  'Yu', 'Yuan', 'Yun', 'Zhang', 'Zhao', 'Zheng', 'Zhou', 'Zhu'
];

const GIVEN_NAMES = [
  'Ao', 'Chen', 'Cheng', 'Chi', 'Chuan', 'Feng', 'Han', 'Hao', 'Hong', 'Hua',
  'Hui', 'Jian', 'Jing', 'Jun', 'Kai', 'Lan', 'Lei', 'Lian', 'Ling', 'Long',
  'Mei', 'Ming', 'Nan', 'Ning', 'Peng', 'Qi', 'Qian', 'Qing', 'Rong', 'Shan',
  'Shuang', 'Tao', 'Wen', 'Xi', 'Xiang', 'Xiao', 'Xin', 'Xiu', 'Xuan', 'Yan',
  'Yang', 'Yi', 'Ying', 'Yong', 'Yu', 'Yuan', 'Yue', 'Yun', 'Zhen', 'Zhi'
];

// ============================================
// CLUE TYPES
// ============================================
const CLUE_TYPES = {
  PERSON_IS_DEMON: 'PERSON_IS_DEMON',
  PERSON_IS_CULTIVATOR: 'PERSON_IS_CULTIVATOR',
  ONLY_DEMON_IN_ROW: 'ONLY_DEMON_IN_ROW',
  ONLY_CULTIVATOR_IN_ROW: 'ONLY_CULTIVATOR_IN_ROW',
  ONLY_DEMON_IN_COLUMN: 'ONLY_DEMON_IN_COLUMN',
  ONLY_CULTIVATOR_IN_COLUMN: 'ONLY_CULTIVATOR_IN_COLUMN',
};

// ============================================
// PUZZLE GENERATOR - Chain-based for guaranteed solvability
// ============================================
function generateValidPuzzle() {
  // Generate base people
  const usedNames = new Set();
  const people = [];

  while (people.length < 20) {
    const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
    const given = GIVEN_NAMES[Math.floor(Math.random() * GIVEN_NAMES.length)];
    const name = `${surname} ${given}`;
    
    if (usedNames.has(name)) continue;
    usedNames.add(name);

    const root = ALL_SPIRITUAL_ROOTS[Math.floor(Math.random() * ALL_SPIRITUAL_ROOTS.length)];

    people.push({
      name,
      spiritualRoot: root,
      isDemon: false,
      isRevealed: false,
      clue: null,
      clueData: null,
      cornerTag: 0
    });
  }

  // Sort alphabetically
  people.sort((a, b) => a.name.localeCompare(b.name));

  // Assign positions
  people.forEach((person, idx) => {
    person.id = idx;
    person.row = Math.floor(idx / 4);
    person.col = idx % 4;
  });

  // Assign demons (6-8)
  const demonCount = Math.floor(Math.random() * 3) + 6;
  const shuffledIndices = [...Array(20).keys()].sort(() => Math.random() - 0.5);
  for (let i = 0; i < demonCount; i++) {
    people[shuffledIndices[i]].isDemon = true;
  }

  // Create solve order - random permutation
  const solveOrder = [...Array(20).keys()].sort(() => Math.random() - 0.5);

  // Helper function to get people in same row
  const getPeopleInRow = (row) => people.filter(p => p.row === row);

  // Helper function to get people in same column
  const getPeopleInColumn = (col) => people.filter(p => p.col === col);

  // Each person's clue points to the NEXT person in solve order
  // This guarantees exactly ONE deducible person at each step
  for (let i = 0; i < 20; i++) {
    const currentId = solveOrder[i];
    const nextId = solveOrder[(i + 1) % 20];

    const current = people[currentId];
    const next = people[nextId];

    // Check what kind of clues we can generate for the next person
    const possibleClueTypes = [];

    // Check if next is only demon in row
    const rowPeople = getPeopleInRow(next.row);
    const demonsInRow = rowPeople.filter(p => p.isDemon);
    const cultivatorsInRow = rowPeople.filter(p => !p.isDemon);

    if (next.isDemon && demonsInRow.length === 1) {
      possibleClueTypes.push(CLUE_TYPES.ONLY_DEMON_IN_ROW);
    }

    if (!next.isDemon && cultivatorsInRow.length === 1) {
      possibleClueTypes.push(CLUE_TYPES.ONLY_CULTIVATOR_IN_ROW);
    }

    // Check if next is only demon/cultivator in column
    const colPeople = getPeopleInColumn(next.col);
    const demonsInCol = colPeople.filter(p => p.isDemon);
    const cultivatorsInCol = colPeople.filter(p => !p.isDemon);

    if (next.isDemon && demonsInCol.length === 1) {
      possibleClueTypes.push(CLUE_TYPES.ONLY_DEMON_IN_COLUMN);
    }

    if (!next.isDemon && cultivatorsInCol.length === 1) {
      possibleClueTypes.push(CLUE_TYPES.ONLY_CULTIVATOR_IN_COLUMN);
    }

    // Always add the basic clue type
    possibleClueTypes.push(
      next.isDemon ? CLUE_TYPES.PERSON_IS_DEMON : CLUE_TYPES.PERSON_IS_CULTIVATOR
    );

    // Randomly choose one of the possible clue types
    const chosenType = possibleClueTypes[Math.floor(Math.random() * possibleClueTypes.length)];

    // Generate clue text based on type
    let clueText = '';
    const COLS = ['A', 'B', 'C', 'D'];

    switch (chosenType) {
      case CLUE_TYPES.ONLY_DEMON_IN_ROW:
        clueText = `${next.name} is the only demon in row ${next.row + 1}.`;
        break;
      case CLUE_TYPES.ONLY_CULTIVATOR_IN_ROW:
        clueText = `${next.name} is the only cultivator in row ${next.row + 1}.`;
        break;
      case CLUE_TYPES.ONLY_DEMON_IN_COLUMN:
        clueText = `${next.name} is the only demon in column ${COLS[next.col]}.`;
        break;
      case CLUE_TYPES.ONLY_CULTIVATOR_IN_COLUMN:
        clueText = `${next.name} is the only cultivator in column ${COLS[next.col]}.`;
        break;
      default:
        clueText = `${next.name} is ${next.isDemon ? 'a demon' : 'a cultivator'}.`;
    }

    current.clue = clueText;
    current.clueData = {
      type: chosenType,
      data: { personId: next.id }
    };
  }

  // First person in solve order is revealed
  people[solveOrder[0]].isRevealed = true;

  return people;
}

// ============================================
// LOGIC ENGINE
// ============================================
function canDeduceIdentity(people, targetId) {
  const target = people[targetId];

  // Check if any revealed clue directly identifies this person
  for (const person of people) {
    if (!person.isRevealed) continue;
    if (!person.clueData) continue;

    const { type, data } = person.clueData;

    // Direct identification
    if (type === CLUE_TYPES.PERSON_IS_DEMON && data.personId === targetId) {
      return { canDeduce: true, isDemon: true };
    }
    if (type === CLUE_TYPES.PERSON_IS_CULTIVATOR && data.personId === targetId) {
      return { canDeduce: true, isDemon: false };
    }

    // Check "only demon/cultivator in row" clues
    if (type === CLUE_TYPES.ONLY_DEMON_IN_ROW) {
      const clueSubject = people[data.personId];
      // If target is in the same row as the clue subject
      if (target.row === clueSubject.row) {
        if (target.id === clueSubject.id) {
          // This person is the demon
          return { canDeduce: true, isDemon: true };
        } else {
          // Everyone else in the row is a cultivator
          return { canDeduce: true, isDemon: false };
        }
      }
    }

    if (type === CLUE_TYPES.ONLY_CULTIVATOR_IN_ROW) {
      const clueSubject = people[data.personId];
      if (target.row === clueSubject.row) {
        if (target.id === clueSubject.id) {
          // This person is the cultivator
          return { canDeduce: true, isDemon: false };
        } else {
          // Everyone else in the row is a demon
          return { canDeduce: true, isDemon: true };
        }
      }
    }

    // Check "only demon/cultivator in column" clues
    if (type === CLUE_TYPES.ONLY_DEMON_IN_COLUMN) {
      const clueSubject = people[data.personId];
      if (target.col === clueSubject.col) {
        if (target.id === clueSubject.id) {
          // This person is the demon
          return { canDeduce: true, isDemon: true };
        } else {
          // Everyone else in the column is a cultivator
          return { canDeduce: true, isDemon: false };
        }
      }
    }

    if (type === CLUE_TYPES.ONLY_CULTIVATOR_IN_COLUMN) {
      const clueSubject = people[data.personId];
      if (target.col === clueSubject.col) {
        if (target.id === clueSubject.id) {
          // This person is the cultivator
          return { canDeduce: true, isDemon: false };
        } else {
          // Everyone else in the column is a demon
          return { canDeduce: true, isDemon: true };
        }
      }
    }
  }

  return { canDeduce: false, isDemon: null };
}

// ============================================
// MAIN GAME COMPONENT
// ============================================
export default function CultivatorsGame() {
  const [people, setPeople] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = useCallback(() => {
    const newPeople = generateValidPuzzle();
    setPeople(newPeople);
    setSelectedPerson(null);
    setStartTime(Date.now());
    setEndTime(null);
  }, []);

  const isGameComplete = useMemo(() => {
    if (!people) return false;
    return people.every(p => p.isRevealed);
  }, [people]);

  useEffect(() => {
    if (isGameComplete && !endTime) {
      setEndTime(Date.now());
    }
  }, [isGameComplete, endTime]);

  const handleCardClick = (e, person) => {
    if (e.target.closest('.corner-tag')) return;
    if (isGameComplete || person.isRevealed) return;
    setSelectedPerson(person);
  };

  const handleCornerTag = (e, personId) => {
    e.stopPropagation();
    setPeople(prev => prev.map(p =>
      p.id === personId ? { ...p, cornerTag: (p.cornerTag + 1) % 4 } : p
    ));
  };

  const handleIdentify = (guessIsDemon) => {
    if (!selectedPerson) return;
    
    // Check if this person can be deduced
    const { canDeduce, isDemon } = canDeduceIdentity(people, selectedPerson.id);
    
    if (!canDeduce) {
      // No clue identifies this person yet
      setShowWarning(true);
      setSelectedPerson(null);
      return;
    }
    
    // Check if the guess matches what can be deduced
    if (guessIsDemon !== isDemon) {
      // Wrong guess - the clue says otherwise
      setShowWarning(true);
      setSelectedPerson(null);
      return;
    }

    // Correct deduction!
    setPeople(prev => prev.map(p =>
      p.id === selectedPerson.id ? { ...p, isRevealed: true } : p
    ));

    setSelectedPerson(null);
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes < 6) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes} min`;
  };

  const getShareText = () => {
    if (!people || !endTime) return '';
    const time = formatTime(endTime - startTime);
    const grid = [];
    for (let row = 0; row < 5; row++) {
      const rowText = people
        .filter(p => p.row === row)
        .sort((a, b) => a.col - b.col)
        .map(() => '🟩')
        .join('');
      grid.push(rowText);
    }
    return `Cultivators or Demon? - ${time}\n${grid.join('\n')}`;
  };

  if (!people) return null;

  const CORNER_COLORS = ['transparent', '#22c55e', '#ef4444', '#eab308'];
  const COLS = ['A', 'B', 'C', 'D'];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#e8e8e8',
      padding: '16px',
      boxSizing: 'border-box'
    }}>
      <style>{`
        * { box-sizing: border-box; }
        .card {
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          user-select: none;
        }
        .card:hover:not(.revealed) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }
        .btn {
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .btn:hover {
          transform: translateY(-1px);
          filter: brightness(1.1);
        }
        .btn:active {
          transform: translateY(0);
        }
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .modal {
          background: linear-gradient(145deg, #1e1e2f, #252538);
          border-radius: 16px;
          padding: 24px;
          max-width: 360px;
          width: 100%;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .animate-in {
          animation: fadeIn 0.2s ease;
        }
        .shake {
          animation: shake 0.4s ease;
        }
        .clue-text {
          font-size: 0.6rem;
          line-height: 1.3;
          color: #d1d5db;
          margin-top: 6px;
          padding-top: 6px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .name-highlight {
          color: #f472b6;
          font-weight: 600;
        }
      `}</style>

      <header style={{ textAlign: 'center', marginBottom: '16px' }}>
        <h1 style={{
          fontSize: '1.4rem',
          fontWeight: 700,
          margin: '0 0 4px',
          background: 'linear-gradient(135deg, #c084fc, #60a5fa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Cultivators or Demon-In-Disguise?
        </h1>
        <p style={{ color: '#888', fontSize: '0.8rem', margin: 0 }}>
          Identify who is a true cultivator and who is a demon
        </p>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '20px repeat(4, 1fr)',
        gap: '6px',
        maxWidth: '520px',
        margin: '0 auto 4px',
      }}>
        <div />
        {COLS.map(col => (
          <div key={col} style={{
            textAlign: 'center',
            color: '#666',
            fontSize: '0.75rem',
            fontWeight: 600
          }}>{col}</div>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '20px repeat(4, 1fr)',
        gap: '6px',
        maxWidth: '520px',
        margin: '0 auto 20px'
      }}>
        {[0, 1, 2, 3, 4].map(row => (
          <React.Fragment key={row}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666',
              fontSize: '0.75rem',
              fontWeight: 600
            }}>{row + 1}</div>
            
            {people.filter(p => p.row === row).sort((a, b) => a.col - b.col).map(person => {
              // Parse clue to highlight name
              const renderClue = () => {
                if (!person.clue) return null;

                // Try to match simple "X is a demon/cultivator" format
                let match = person.clue.match(/^(.+?) is (a demon|a cultivator)\.$/);
                if (match) {
                  return (
                    <>
                      "<span className="name-highlight">{match[1]}</span> is {match[2]}."
                    </>
                  );
                }

                // Try to match "X is the only demon/cultivator in row N" format
                match = person.clue.match(/^(.+?) is the only (demon|cultivator) in row (\d+)\.$/);
                if (match) {
                  return (
                    <>
                      "<span className="name-highlight">{match[1]}</span> is the only {match[2]} in row {match[3]}."
                    </>
                  );
                }

                // Try to match "X is the only demon/cultivator in column Y" format
                match = person.clue.match(/^(.+?) is the only (demon|cultivator) in column ([A-D])\.$/);
                if (match) {
                  return (
                    <>
                      "<span className="name-highlight">{match[1]}</span> is the only {match[2]} in column {match[3]}."
                    </>
                  );
                }

                // Fallback: just return the clue with quotes
                return `"${person.clue}"`;
              };

              return (
                <div
                  key={person.id}
                  className={`card ${person.isRevealed ? 'revealed' : ''}`}
                  onClick={(e) => handleCardClick(e, person)}
                  style={{
                    background: person.isRevealed
                      ? person.isDemon
                        ? 'linear-gradient(145deg, #7f1d1d, #991b1b)'
                        : 'linear-gradient(145deg, #14532d, #166534)'
                      : 'linear-gradient(145deg, #2a2a3d, #1e1e2f)',
                    borderRadius: '10px',
                    padding: '8px',
                    cursor: person.isRevealed ? 'default' : 'pointer',
                    position: 'relative',
                    minHeight: person.isRevealed ? '105px' : '75px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div
                    className="corner-tag"
                    onClick={(e) => handleCornerTag(e, person.id)}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '14px',
                      height: '14px',
                      borderRadius: '3px',
                      background: CORNER_COLORS[person.cornerTag],
                      border: person.cornerTag === 0 ? '1px dashed rgba(255,255,255,0.2)' : 'none',
                      cursor: 'pointer',
                      zIndex: 10
                    }}
                  />

                  {person.isRevealed && (
                    <div style={{
                      position: 'absolute',
                      top: '4px',
                      left: '6px',
                      fontSize: '0.8rem'
                    }}>
                      {person.isDemon ? '👹' : '🧘'}
                    </div>
                  )}

                  <div style={{
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    marginTop: person.isRevealed ? '14px' : '0',
                    marginBottom: '2px',
                    color: '#f0f0f0',
                    lineHeight: 1.2,
                    wordBreak: 'break-word'
                  }}>
                    {person.name}
                  </div>

                  <div style={{
                    fontSize: '0.58rem',
                    color: '#9ca3af',
                    lineHeight: 1.2
                  }}>
                    {person.spiritualRoot.shortLabel}
                  </div>

                  {person.isRevealed && (
                    <div className="clue-text">
                      {renderClue()}
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        marginBottom: '20px'
      }}>
        <button
          className="btn"
          onClick={() => setShowHowToPlay(true)}
          style={{
            background: 'rgba(255,255,255,0.1)',
            color: '#aaa',
            padding: '8px 16px',
            fontSize: '0.85rem'
          }}
        >
          How to Play
        </button>
        <button
          className="btn"
          onClick={startNewGame}
          style={{
            background: 'rgba(255,255,255,0.1)',
            color: '#aaa',
            padding: '8px 16px',
            fontSize: '0.85rem'
          }}
        >
          New Puzzle
        </button>
      </div>

      {selectedPerson && !isGameComplete && (
        <div className="modal-overlay" onClick={() => setSelectedPerson(null)}>
          <div className="modal animate-in" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔍</div>
              <h3 style={{ margin: '0 0 4px', color: '#e0e0e0', fontSize: '1.1rem' }}>
                {selectedPerson.name}
              </h3>
              <p style={{ margin: 0, color: '#888', fontSize: '0.85rem' }}>
                {selectedPerson.spiritualRoot.label}
              </p>
            </div>
            
            <p style={{ 
              textAlign: 'center', 
              color: '#aaa', 
              marginBottom: '20px',
              fontSize: '0.9rem'
            }}>
              What is this person's true identity?
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn"
                onClick={() => handleIdentify(false)}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #166534, #22c55e)',
                  color: 'white',
                  boxShadow: '0 4px 16px rgba(34,197,94,0.3)'
                }}
              >
                🧘 Cultivator
              </button>
              <button
                className="btn"
                onClick={() => handleIdentify(true)}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #991b1b, #ef4444)',
                  color: 'white',
                  boxShadow: '0 4px 16px rgba(239,68,68,0.3)'
                }}
              >
                👹 Demon
              </button>
            </div>
            
            <button
              onClick={() => setSelectedPerson(null)}
              style={{
                width: '100%',
                marginTop: '12px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#888',
                padding: '10px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showWarning && (
        <div className="modal-overlay" onClick={() => setShowWarning(false)}>
          <div className="modal shake" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
              <h3 style={{ 
                margin: '0 0 12px', 
                color: '#fbbf24', 
                fontSize: '1.2rem',
                fontWeight: 700
              }}>
                Not enough evidence!
              </h3>
              <p style={{ 
                color: '#aaa', 
                marginBottom: '20px',
                fontSize: '0.9rem',
                lineHeight: 1.5
              }}>
                You cannot make this deduction yet. Read the clues carefully - exactly ONE person can be identified at each step.
              </p>
              <button
                className="btn"
                onClick={() => setShowWarning(false)}
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white',
                  width: '100%'
                }}
              >
                I understand
              </button>
            </div>
          </div>
        </div>
      )}

      {showHowToPlay && (
        <div className="modal-overlay" onClick={() => setShowHowToPlay(false)}>
          <div className="modal animate-in" onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 16px', fontSize: '1.2rem', color: '#c4b5fd' }}>
              How to Play
            </h2>
            <div style={{ color: '#bbb', fontSize: '0.85rem', lineHeight: 1.6 }}>
              <p style={{ margin: '0 0 12px' }}>
                Your goal is to figure out <strong style={{ color: '#22c55e' }}>who is a cultivator</strong> and <strong style={{ color: '#ef4444' }}>who is a demon in disguise</strong>.
              </p>
              <p style={{ margin: '0 0 12px' }}>
                Tap on a person to make your deduction. Each revealed person shows a clue on their card.
              </p>
              <p style={{ margin: '0 0 12px', fontWeight: 600, color: '#fbbf24' }}>
                You cannot guess! At each step, exactly ONE person can be identified based on the revealed clues.
              </p>
              <p style={{ margin: '0 0 16px', fontStyle: 'italic', color: '#999' }}>
                Everyone speaks the truth, even the demons!
              </p>
              
              <h4 style={{ margin: '0 0 8px', color: '#a0a0a0' }}>Tips:</h4>
              <ul style={{ margin: '0 0 16px', paddingLeft: '20px', color: '#999' }}>
                <li>Read each clue carefully - names are highlighted</li>
                <li>Find the person mentioned in a revealed clue</li>
                <li>Tap card corners to add color tags for tracking</li>
              </ul>
            </div>
            <button
              className="btn"
              onClick={() => setShowHowToPlay(false)}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white',
                width: '100%'
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {isGameComplete && (
        <div className="modal-overlay">
          <div className="modal animate-in">
            <h2 style={{ margin: '0 0 8px', fontSize: '1.3rem', color: '#22c55e', textAlign: 'center' }}>
              🎊 Puzzle Complete!
            </h2>
            <p style={{ textAlign: 'center', color: '#888', margin: '0 0 16px' }}>
              Time: {formatTime(endTime - startTime)}
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '4px',
              marginBottom: '20px',
              maxWidth: '140px',
              margin: '0 auto 20px'
            }}>
              {people.map(person => (
                <div key={person.id} style={{ textAlign: 'center', fontSize: '1.1rem' }}>
                  🟩
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn"
                onClick={() => {
                  navigator.clipboard.writeText(getShareText());
                }}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.1)',
                  color: '#ccc'
                }}
              >
                Copy Result
              </button>
              <button
                className="btn"
                onClick={startNewGame}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white'
                }}
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      <Rules />

      <DetailedExplanation />

      <footer style={{
        textAlign: 'center',
        color: '#555',
        fontSize: '0.7rem',
        marginTop: '16px'
      }}>
        Inspired by <a
          href="https://cluesbysam.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#7c3aed', textDecoration: 'none' }}
        >Clues by Sam</a>
      </footer>
    </div>
  );
}
