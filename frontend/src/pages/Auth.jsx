import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.username, form.password);
      } else {
        await register(form.username, form.email, form.password);
      }
      navigate('/game');
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dark)', position: 'relative', overflow: 'hidden' }}>
      {/* Animated background */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,51,102,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div style={{ position: 'absolute', top: '20%', left: '10%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(255,51,102,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,245,255,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
        style={{ width: 420, position: 'relative', zIndex: 10 }}>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="font-orbitron neon-text-red" style={{ fontSize: 32, fontWeight: 900 }}>TURBO<span className="neon-text-cyan">RACE</span></div>
          <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 8, letterSpacing: '0.2em', fontFamily: 'Orbitron' }}>
            {mode === 'login' ? 'WELCOME BACK DRIVER' : 'JOIN THE GRID'}
          </div>
        </div>

        {/* Mode switcher */}
        <div style={{ display: 'flex', marginBottom: 32, background: 'rgba(255,255,255,0.03)', borderRadius: 2, border: '1px solid var(--border)' }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: '12px 0', fontFamily: 'Orbitron', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.15em', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              background: mode === m ? 'var(--red)' : 'transparent',
              color: mode === m ? '#fff' : 'var(--text-dim)'
            }}>{m.toUpperCase()}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontFamily: 'Orbitron', fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.15em', display: 'block', marginBottom: 6 }}>USERNAME</label>
            <input className="input-field" value={form.username} onChange={set('username')} placeholder="Enter username" required />
          </div>

          <AnimatePresence>
            {mode === 'register' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <label style={{ fontFamily: 'Orbitron', fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.15em', display: 'block', marginBottom: 6 }}>EMAIL</label>
                <input className="input-field" type="email" value={form.email} onChange={set('email')} placeholder="your@email.com" required />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label style={{ fontFamily: 'Orbitron', fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.15em', display: 'block', marginBottom: 6 }}>PASSWORD</label>
            <input className="input-field" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required />
          </div>

          {error && <div style={{ color: '#ff6b6b', fontFamily: 'Orbitron', fontSize: 11, padding: '10px 14px', background: 'rgba(255,51,51,0.1)', border: '1px solid rgba(255,51,51,0.3)' }}>{error}</div>}

          <motion.button type="submit" className="btn btn-primary" disabled={loading}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ marginTop: 8, padding: '16px', fontSize: 13, width: '100%' }}>
            {loading ? 'LOADING...' : mode === 'login' ? 'IGNITE ENGINE' : 'JOIN THE RACE'}
          </motion.button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontFamily: 'Rajdhani', fontSize: 13 }}>
            ← Back to home
          </button>
        </div>
      </motion.div>
    </div>
  );
}
