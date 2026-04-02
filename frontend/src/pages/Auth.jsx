import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username:'', email:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuthStore();
  const navigate = useNavigate();

  const handle = async () => {
    setError(''); setLoading(true);
    try {
      if (mode === 'login') await login(form.username, form.password);
      else await register(form.username, form.email, form.password);
      navigate('/garage');
    } catch (e) {
      setError(e.response?.data?.detail || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#0a0a1a', borderRadius:20, padding:40, border:'1px solid #1a1a2e', width:'100%', maxWidth:400 }}>
        <h1 style={{ fontFamily:'Orbitron,sans-serif', fontSize:22, letterSpacing:6, marginBottom:8, textAlign:'center' }}>TURBORACE</h1>
        <div style={{ display:'flex', gap:0, marginBottom:32, background:'#111', borderRadius:8, padding:4 }}>
          {['login','register'].map(m => (
            <button key={m} onClick={() => setMode(m)}
              style={{ flex:1, padding:'8px', border:'none', borderRadius:6, cursor:'pointer', fontFamily:'Orbitron,sans-serif', fontSize:10, letterSpacing:3,
                background: mode===m ? 'var(--red)' : 'transparent', color: mode===m ? '#fff' : '#555', transition:'all 0.2s' }}>
              {m.toUpperCase()}
            </button>
          ))}
        </div>
        {['username', ...(mode==='register' ? ['email'] : []), 'password'].map(field => (
          <input key={field} type={field==='password' ? 'password' : 'text'} placeholder={field.toUpperCase()} value={form[field]}
            onChange={e => setForm(f => ({...f, [field]:e.target.value}))}
            onKeyDown={e => e.key==='Enter' && handle()}
            style={{ width:'100%', background:'#111', border:'1px solid #222', borderRadius:8, padding:'12px 16px', color:'#fff', fontFamily:'Orbitron,sans-serif', fontSize:11, letterSpacing:2, marginBottom:12, outline:'none' }} />
        ))}
        {error && <p style={{ color:'var(--red)', fontSize:11, marginBottom:12, textAlign:'center' }}>{error}</p>}
        <button onClick={handle} disabled={loading}
          style={{ width:'100%', background:'linear-gradient(135deg,var(--red),var(--cyan))', border:'none', borderRadius:8, padding:'14px', color:'#000', fontFamily:'Orbitron,sans-serif', fontSize:12, letterSpacing:4, cursor:'pointer', fontWeight:700, opacity: loading ? 0.7 : 1 }}>
          {loading ? '...' : mode==='login' ? 'ENTER RACE' : 'JOIN RACE'}
        </button>
      </div>
    </div>
  );
}