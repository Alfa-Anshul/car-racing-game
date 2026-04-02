import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { useAuthStore } from '../store/authStore';

function formatTime(sec) {
  if (!sec) return '--:--';
  const m = Math.floor(sec / 60);
  const s = (sec % 60).toFixed(2).padStart(5,'0');
  return `${m}:${s}`;
}

const MEDALS = ['🥇','🥈','🥉'];

export default function Leaderboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    api.get('/leaderboard/').then(r => setEntries(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight:'100vh', background:'var(--dark)', padding:'80px 20px 40px' }}>
      <div style={{ maxWidth:800, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <h1 style={{ fontFamily:'Orbitron,sans-serif', fontSize:28, letterSpacing:6, marginBottom:8 }}>LEADERBOARD</h1>
          <p style={{ color:'#555', fontSize:12, letterSpacing:2 }}>TOP RACERS WORLDWIDE</p>
        </div>

        {loading ? (
          <p style={{ textAlign:'center', color:'#333', fontFamily:'Orbitron,sans-serif' }}>LOADING...</p>
        ) : (
          <div style={{ background:'#0a0a1a', borderRadius:16, overflow:'hidden', border:'1px solid #1a1a2e' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#111' }}>
                  {['RANK','DRIVER','SCORE','WINS','BEST LAP'].map(h => (
                    <th key={h} style={{ padding:'14px 20px', textAlign:'left', fontFamily:'Orbitron,sans-serif', fontSize:10, letterSpacing:2, color:'#555' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding:48, textAlign:'center', color:'#333', fontFamily:'Orbitron,sans-serif', fontSize:12 }}>NO RACERS YET. BE THE FIRST.</td></tr>
                ) : entries.map((e, i) => {
                  const isMe = user?.username === e.username;
                  return (
                    <tr key={i} style={{ borderTop:'1px solid #0f0f1f', background: isMe ? '#001a2e' : 'transparent', transition:'background 0.2s' }}>
                      <td style={{ padding:'14px 20px', fontFamily:'Orbitron,sans-serif', fontSize:18 }}>
                        {i < 3 ? MEDALS[i] : <span style={{ color:'#333' }}>#{i+1}</span>}
                      </td>
                      <td style={{ padding:'14px 20px' }}>
                        <span style={{ fontFamily:'Orbitron,sans-serif', fontSize:13, color: isMe ? 'var(--cyan)' : '#ccc' }}>{e.username}</span>
                        {isMe && <span style={{ marginLeft:8, fontSize:9, color:'var(--cyan)', letterSpacing:2 }}>YOU</span>}
                      </td>
                      <td style={{ padding:'14px 20px', fontFamily:'Orbitron,sans-serif', color:'var(--gold)', fontSize:14 }}>{e.high_score || 0}</td>
                      <td style={{ padding:'14px 20px', color:'#aaa', fontSize:13 }}>{e.wins || 0}</td>
                      <td style={{ padding:'14px 20px', fontFamily:'Orbitron,sans-serif', color:'var(--red)', fontSize:13 }}>{formatTime(e.best_lap_time)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}