import React from 'react';

export default function Rules() {
  return (
    <section style={{
      maxWidth: '800px',
      margin: '48px auto',
      padding: '24px',
      background: 'linear-gradient(145deg, #1e1e2f, #252538)',
      borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.1)',
    }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 700,
        marginBottom: '16px',
        background: 'linear-gradient(135deg, #c084fc, #60a5fa)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textAlign: 'center'
      }}>
        How to Play Cultivators or Demon-In-Disguise?
      </h2>

      <div style={{
        color: '#d1d5db',
        fontSize: '0.95rem',
        lineHeight: 1.7
      }}>
        <p style={{ marginBottom: '12px' }}>
          Your goal is to figure out who is cultivator and who is demon-in-disguise.
        </p>

        <p style={{ marginBottom: '12px' }}>
          Based on the known evidence, tap on a suspect to choose cultivator or demon-in-disguise. They might reveal a new evidence.
        </p>

        <p style={{
          marginBottom: '12px',
          fontWeight: 600,
          color: '#fbbf24',
          fontSize: '1rem'
        }}>
          You cannot guess! Just like in real life, you can't convict someone based on a 50/50 hunch. There is always a logical next choice, even when you think there isn't!
        </p>
      </div>
    </section>
  );
}
