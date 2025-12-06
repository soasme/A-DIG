import React from 'react';

export default function DetailedExplanation() {
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
        marginBottom: '24px',
        background: 'linear-gradient(135deg, #c084fc, #60a5fa)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textAlign: 'center'
      }}>
        Rule Explained
      </h2>

      <div style={{
        color: '#d1d5db',
        fontSize: '0.9rem',
        lineHeight: 1.7
      }}>
        <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
          <li style={{ marginBottom: '12px' }}>
            Everyone is either a <strong style={{ color: '#22c55e' }}>villager</strong> or a <strong style={{ color: '#ef4444' }}>werewolf</strong>.
          </li>

          <li style={{ marginBottom: '12px' }}>
            Everyone speaks the truth, even the werewolf.
          </li>

          <li style={{ marginBottom: '12px' }}>
            <strong>Neighbors</strong> always include diagonal neighbors. One person can have up to 8 neighbors. Edge person has 5 neighbors and corner person has 3 neighbors.
          </li>

          <li style={{ marginBottom: '12px' }}>
            <strong>In between</strong> (or sometimes just "between") means the persons between the two, not including the two.
          </li>

          <li style={{ marginBottom: '12px' }}>
            <strong>Connected</strong> means a chain of orthogonal adjacency. For example "all werewolves in row 1 are connected" means there are no villagers between any two werewolves in that row.
          </li>

          <li style={{ marginBottom: '12px' }}>
            <strong>Rows</strong> go sideways and are numbered 1,2,3,4,5. <strong>Columns</strong> go up and down and lettered A,B,C,D.
          </li>

          <li style={{ marginBottom: '12px' }}>
            <strong>To the left/right</strong> always means somewhere in the same row. <strong>Above/below</strong> always means somewhere in the same column.
          </li>

          <li style={{ marginBottom: '12px' }}>
            <strong>Directly to the left/right/above/below</strong> always means the neighbor to the left/right/above/below.
          </li>

          <li style={{ marginBottom: '12px' }}>
            <strong>All</strong> always means there's at least one. It doesn't necessarily mean there's more than one.
          </li>

          <li style={{ marginBottom: '12px' }}>
            <strong>Any</strong> doesn't tell anything about the number of werewolves/villagers. "Any werewolf on row 2 is..." means "If there are any werewolves on row 2, they would be..."
          </li>

          <li style={{ marginBottom: '12px' }}>
            <strong>One of the ...</strong>, or <strong>one of several ...</strong>, or <strong>one of multiple ...</strong>, always means there's at least two villagers/werewolves.
          </li>

          <li style={{ marginBottom: '12px' }}>
            <strong>Common neighbors</strong> means those who are neighbors of both persons. It does not include the persons themselves.
          </li>

          <li style={{ marginBottom: '12px' }}>
            <strong>In total</strong> always means the sum of all in the group(s).
          </li>

          <li style={{ marginBottom: '12px' }}>
            <strong>Corner</strong> means the four corners.
          </li>

          <li style={{ marginBottom: '12px' }}>
            <strong>Edge</strong> means the 14 persons "surrounding" the board, including corners.
          </li>

          <li style={{ marginBottom: '12px' }}>
            <strong>... the most</strong> always means uniquely the most. If John has the most villager neighbors, no one can have as many werewolf neighbors as John.
          </li>

          <li style={{ marginBottom: '12px' }}>
            An <strong>even number</strong> means numbers divisible by two: 0, 2, 4, 6... and an <strong>odd number</strong> means everything else: 1, 3, 5, 7...
          </li>

          <li style={{ marginBottom: '12px', fontWeight: 600, color: '#fbbf24' }}>
            You never need to guess. In fact, the game only allows you to make one logical choice at a time.
          </li>
        </ul>
      </div>
    </section>
  );
}
