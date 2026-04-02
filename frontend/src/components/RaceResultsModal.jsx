import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

export default function RaceResultsModal({ onPlayAgain }) {
  const { raceResults } = useGameStore();
  const navigate = useNavigate();
  if (!raceResults) return null;
  const { position, lapTime, totalTime, score } = raceResults;
  const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toFixed(2).padStart(5,'0')}`;
  const medals = ['🥇','🥈','🥉',''];
  const medal = medals[Math.min(position-1, 3)];

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }}
        className="glass" style={{ width: 440, padding: 40, textAlign: 'center', border: '1px solid rgba(255,51,102,0.3)' }}>
        <div style={{ fontSize: 64, marginBottom: 8 }}>{medal}</div>
        <div className="font-orbitron neon-text-red" style={{ fontSize: 32, fontWeight: 900, marginBottom: 4 }}>RACE COMPLETE</div>
        <div style={{ fontFamily: 'Orbitron', fontSize: 14, color: 'var(--gold)' }}>POSITION P{position}</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, margin: '32px 0' }}>
          {[['BEST LAP', fmt(lapTime)],['TOTAL TIME', fmt(totalTime)],['POSITION', `P${position}`],['SCORE', score]].map(([l,v]) => (
            <div key={l} className="glass" style={{ padding: '14px', borderTop: '2px solid var(--red)' }}>
              <div style={{ fontFamily: 'Orbitron', fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.15em', marginBottom: 4 }}>{l}</div>
              <div style={{ fontFamily: 'Orbitron', fontSize: 20, color: 'var(--cyan)', fontWeight: 700 }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={onPlayAgain} style={{ fontSize: 12, padding: '14px 32px' }}>RACE AGAIN</button>
          <button className="btn btn-secondary" onClick={() => navigate('/leaderboard')} style={{ fontSize: 11, padding: '14px 24px' }}>LEADERBOARD</button>
          <button className="btn btn-secondary" onClick={() => navigate('/profile')} style={{ fontSize: 11, padding: '14px 24px' }}>PROFILE</button>
        </div>
      </motion.div>
    </div>
  );
}
