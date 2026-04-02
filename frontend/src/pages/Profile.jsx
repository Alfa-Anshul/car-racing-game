import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../utils/api';

function formatTime(sec) {
  if (!sec) return '--';
  const m = Math.floor(sec / 60);
  const s = (sec % 60).toFixed(2).padStart(5,'0');
  return `${m}:${s}`;
}

export default function Profile() {
  const { user, logout } = useAuthStore();
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/me').then(r => {
      setRaces(r.data.recent_races || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  const winRate = user.total_races > 0 ? ((user.wins / user.total_races) * 100).toFixed(1) : '0.0';

  return (
    <div style={{ minHeight:'100vh', background:'var(--dark)', padding:'80px 20px 40px' }}>
      <div style={{ maxWidth:800, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', gap:24, marginBottom:40, flexWrap:'wrap' }}>
          <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,var(--red),var(--cyan))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, fontFamily:'Orbitron,sans-serif', color:'#fff' }}>
            {user.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontFamily:'Orbitron,sans-serif', fontSize:24, letterSpacing:4, marginBottom:4 }}>{user.username}</h1>
            <p style={{ color:'#555', fontSize:12 }}>{user.email}</p>
          </div>
          <button onClick={logout} style={{ marginLeft:'auto', background:'transparent', border:'1px solid #333', borderRadius:6, padding:'8px 20px', color:'#555', fontFamily:'Orbitron,sans-serif', fontSize:10, cursor:'pointer', letterSpacing:2 }}>LOGOUT</button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:16, marginBottom:40 }}>
          {[
            { label:'TOTAL RACES', value: user.total_races || 0 },
            { label:'WINS', value: user.wins || 0, color:'var(--gold)' },
            { label:'WIN RATE', value: `${winRate}%`, color:'var(--cyan)' },
            { label:'BEST LAP', value: formatTime(user.best_lap_time), color:'var(--red)' },
            { label:'HIGH SCORE', value: user.high_score || 0, color:'var(--gold)' },
          ].map(stat => (
            <div key={stat.label} style={{ background:'#0a0a1a', borderRadius:10, padding:'16px 20px', border:'1px solid #1a1a2e' }}>
              <div style={{ fontSize:10, color:'#555', fontFamily:'Orbitron,sans-serif', letterSpacing:2, marginBottom:8 }}>{stat.label}</div>
              <div style={{ fontSize:22, fontFamily:'Orbitron,sans-serif', color: stat.color || '#fff' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        <h2 style={{ fontFamily:'Orbitron,sans-serif', fontSize:14, letterSpacing:4, color:'#555', marginBottom:16 }}>RECENT RACES</h2>
        {loading ? <p style={{ color:'#333' }}>Loading...</p> : (
          <div style={{ background:'#0a0a1a', borderRadius:12, overflow:'hidden', border:'1px solid #1a1a2e' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead>
                <tr style={{ background:'#111', color:'#555', fontFamily:'Orbitron,sans-serif', fontSize:10, letterSpacing:2 }}>
                  {['TRACK','LAP TIME','SCORE','POSITION','DATE'].map(h => (
                    <th key={h} style={{ padding:'12px 16px', textAlign:'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {races.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding:32, textAlign:'center', color:'#333' }}>No races yet. Hit the track!</td></tr>
                ) : races.map((r, i) => (
                  <tr key={i} style={{ borderTop:'1px solid #1a1a2e', color:'#aaa' }}>
                    <td style={{ padding:'12px 16px' }}>{r.track_name || 'ALPHA CIRCUIT'}</td>
                    <td style={{ padding:'12px 16px', color:'var(--cyan)', fontFamily:'Orbitron,sans-serif' }}>{formatTime(r.lap_time)}</td>
                    <td style={{ padding:'12px 16px', color:'var(--gold)' }}>{r.score}</td>
                    <td style={{ padding:'12px 16px', color: r.position===1 ? 'var(--gold)' : '#aaa' }}>#{r.position}</td>
                    <td style={{ padding:'12px 16px', color:'#444' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}