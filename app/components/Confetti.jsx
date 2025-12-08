import React, { useMemo } from 'react';

export default function Confetti({ active }) {
  const pieces = useMemo(() => {
    const colors = ['#1f7a4d', '#c92121', '#c08a2a', '#1463ff', '#ff6f61'];
    return Array.from({ length: 140 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 3 + Math.random() * 1.5,
      rotation: Math.random() * 360,
      size: 6 + Math.random() * 8,
      color: colors[i % colors.length]
    }));
  }, []);

  if (!active) return null;

  return (
    <div className="confetti-overlay" aria-hidden="true">
      {pieces.map(piece => (
        <span
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.left}%`,
            animationDuration: `${piece.duration}s`,
            animationDelay: `${piece.delay}s`,
            width: `${piece.size}px`,
            height: `${piece.size * 1.6}px`,
            backgroundColor: piece.color,
            '--start-rot': `${piece.rotation}deg`,
            '--end-rot': `${piece.rotation + 540}deg`
          }}
        />
      ))}
    </div>
  );
}
