import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';

export default function HUD({ lapTime, speed }) {
  const { lap, totalLaps, bestLap, position, phase } = useGameStore();
  const [elapsed, setElapsed] = useState(0);
  const startRef = React.useRef(Date.now());

  useEffect(() => {
    if (phase !== 'racing') return;
    startRef.current = Date.now();
    const iv = setInterval(() => setElapsed((Date.now() - startRef.current) / 1000), 100);
    return () => clearInterval(iv);
  }, [phase]);

  const fmt = (s) => `${Math.floor(s / 60).toString().padStart(2,'0')}:${(s % 60).toFixed(2).padStart(5,'0')}`;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', userSelect: 'none' }}>
      {/* Top bar */}
      <div style={{ position: 'absolute', top: 16, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 24px' }}>
        {/* Lap info */}
        <div className="glass" style={{ padding: '10px 20px', borderLeft: '3px solid var(--red)' }}>
          <div style={{ fontFamily: 'Orbitron', fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.2em' }}>LAP</div>
          <div className="neon-text-red font-orbitron" style={{ fontSize: 28, fontWeight: 900 }}>{lap} / {totalLaps}</div>
        </div>

        {/* Timer */}
        <div className="glass" style={{ padding: '10px 24px', textAlign: 'center', borderTop: '2px solid var(--cyan)' }}>
          <div style={{ fontFamily: 'Orbitron', fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.2em' }}>TIME</div>
          <div className="neon-text-cyan font-orbitron" style={{ fontSize: 24, fontWeight: 700 }}>{fmt(elapsed)}</div>
        </div>

        {/* Position */}
        <div className="glass" style={{ padding: '10px 20px', textAlign: 'right', borderRight: '3px solid var(--gold)' }}>
          <div style={{ fontFamily: 'Orbitron', fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.2em' }}>POS</div>
          <div style={{ fontFamily: 'Orbitron', fontSize: 28, fontWeight: 900, color: 'var(--gold)' }}>P{position}</div>
        </div>
      </div>

      {/* Best lap */}
      {bestLap < Infinity && (
        <div style={{ position: 'absolute', top: 96, right: 24 }} className="glass">
          <div style={{ padding: '6px 14px', fontFamily: 'Orbitron', fontSize: 9, color: 'var(--gold)', letterSpacing: '0.15em' }}>
            BEST {fmt(bestLap)}
          </div>
        </div>
      )}

      {/* Controls reminder */}
      <div style={{ position: 'absolute', bottom: 24, left: 24 }}>
        <div className="glass" style={{ padding: '8px 14px', display: 'flex', gap: 12 }}>
          {[['W','↑'],['A','←'],['S','↓'],['D','→']].map(([k,a]) => (
            <div key={k} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Orbitron', fontSize: 9, color: 'var(--cyan)' }}>{k}</div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
