import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import { api } from '../utils/api';
import { useEffect } from 'react';

function fmt(t) {
  if (!t) return '--:--';
  const m = Math.floor(t/60), s = (t%60).toFixed(2).padStart(5,'0');
  return `${m}:${s}`;
}

export default function RaceResultsModal({ position, totalTime, bestLap, score }) {
  const navigate = useNavigate();
  const reset = useGameStore(s => s.reset);
  const { token } = useAuthStore();

  useEffect(() => {
    if (token && bestLap) {
      api.post('/races/submit', { lap_time: bestLap, total_time: totalTime, score, position, track_name: 'ALPHA CIRCUIT' }).catch(() => {});
    }
  }, []);

  const medals = ['🥇','🥈','🥉',''];
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300, backdropFilter:'blur(8px)' }}>
      <div style={{ background:'#0a0a1a', borderRadius:20, padding:40, border:'1px solid rgba(255,204,0,0.3)', maxWidth:420, width:'90%', textAlign:'center' }}>
        <div style={{ fontSize:64, marginBottom:8 }}>{medals[Math.min(position-1,3)]}</div>
        <h2 style={{ fontFamily:'Orbitron,sans-serif', fontSize:14, color:'#555', letterSpacing:4, marginBottom:4 }}>RACE COMPLETE</h2>
        <div style={{ fontFamily:'Orbitron,sans-serif', fontSize:48, color:'var(--gold)', marginBottom:24 }}>#{position}</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:32 }}>
          {[['BEST LAP', fmt(bestLap), 'var(--cyan)'], ['TOTAL TIME', fmt(totalTime), '#aaa'], ['SCORE', score, 'var(--gold)'], ['POSITION', `#${position}`, 'var(--red)']]
            .map(([label, val, color]) => (
            <div key={label} style={{ background:'#111', borderRadius:10, padding:'12px 16px' }}>
              <div style={{ fontSize:9, color:'#444', fontFamily:'Orbitron,sans-serif', letterSpacing:2, marginBottom:6 }}>{label}</div>
              <div style={{ fontFamily:'Orbitron,sans-serif', fontSize:18, color }}>{val}</div>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
          <button onClick={() => { reset(); }} style={{ background:'linear-gradient(135deg,var(--red),var(--cyan))', border:'none', borderRadius:8, padding:'12px 28px', color:'#000', fontFamily:'Orbitron,sans-serif', fontSize:11, letterSpacing:3, cursor:'pointer', fontWeight:700 }}>RACE AGAIN</button>
          <button onClick={() => navigate('/leaderboard')} style={{ background:'transparent', border:'1px solid var(--gold)', borderRadius:8, padding:'12px 28px', color:'var(--gold)', fontFamily:'Orbitron,sans-serif', fontSize:11, letterSpacing:3, cursor:'pointer' }}>LEADERBOARD</button>
        </div>
      </div>
    </div>
  );
}